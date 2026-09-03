/**
 * lib/fanta/server.js
 * Il lato server del Fanta GP: scadenze, griglia, salvataggio e punteggi.
 *
 * Gira SOLO nelle API route. Usa la service role key, che non deve mai
 * arrivare al browser: è la chiave che scavalca RLS, ed è per questo che le
 * tabelle `fanta_*` hanno RLS attivo e nessuna policy — dal browser non si
 * legge e non si scrive niente, si passa di qui.
 *
 * Le tre cose che questo file esiste per garantire:
 * - un pronostico si salva solo prima del semaforo verde;
 * - un pronostico altrui non si legge finché la gara non è partita;
 * - il punteggio lo calcola il server sul risultato ufficiale, non il client.
 */

import { createClient } from '@supabase/supabase-js';
import { calcolaPunteggio, validaPrevisione } from './punteggio';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (typeof window !== 'undefined') {
  throw new Error('lib/fanta/server.js non va importato dal browser.');
}

export const admin = (URL && SERVICE_KEY)
  ? createClient(URL, SERVICE_KEY, { auth: { persistSession: false } })
  : null;

/** Errore con un codice HTTP addosso, così le route non devono indovinarlo. */
export class ErroreFanta extends Error {
  constructor(stato, messaggio) { super(messaggio); this.stato = stato; }
}

function richiediAdmin() {
  if (!admin) {
    throw new ErroreFanta(503, 'Il Fanta non è configurato: manca SUPABASE_SERVICE_ROLE_KEY.');
  }
  return admin;
}

/**
 * Il momento esatto in cui si chiudono le giocate: il semaforo verde.
 *
 * In archivio data e ora sono due colonne separate, e l'ora è una stringa
 * "15:00" in UTC. Senza ora si prende la mezzanotte del giorno di gara: è
 * prudente — chiude prima, non dopo.
 */
export function scadenza(race) {
  if (!race?.date) return null;
  const ora = /^\d{2}:\d{2}$/.test(race.time || '') ? race.time : '00:00';
  return new Date(`${race.date}T${ora}:00Z`);
}

export const gareAperte = (race, adesso = new Date()) => {
  const s = scadenza(race);
  return Boolean(s) && adesso < s;
};

/** La gara, con quanto serve al Fanta. */
export async function caricaGara(year, round) {
  const db = richiediAdmin();
  const { data, error } = await db
    .from('race')
    .select('id, year, round, date, time, official_name, circuit_id')
    .eq('year', year).eq('round', round)
    .maybeSingle();
  if (error) throw new ErroreFanta(500, error.message);
  if (!data) throw new ErroreFanta(404, 'Gran Premio non trovato.');
  return data;
}

/**
 * Il Gran Premio su cui si gioca adesso.
 *
 * È la prima gara della stagione la cui scadenza non è ancora passata; se la
 * stagione è finita si resta sull'ultima corsa, così la pagina mostra il
 * risultato invece di una schermata vuota.
 */
export async function prossimaGara(year = new Date().getUTCFullYear()) {
  const db = richiediAdmin();
  const { data, error } = await db
    .from('race')
    .select('id, year, round, date, time, official_name, circuit_id')
    .eq('year', year)
    .order('round');
  if (error) throw new ErroreFanta(500, error.message);
  if (!data?.length) throw new ErroreFanta(404, `Nessun Gran Premio in calendario per il ${year}.`);
  return data.find(r => gareAperte(r)) || data[data.length - 1];
}

/** Il calendario della stagione, per il selettore del Gran Premio. */
export async function calendario(year) {
  const db = richiediAdmin();
  const { data, error } = await db
    .from('race')
    .select('year, round, date, time, official_name')
    .eq('year', year).order('round');
  if (error) throw new ErroreFanta(500, error.message);
  return (data || []).map(r => ({
    year: r.year,
    round: r.round,
    nome: r.official_name,
    data: r.date,
    aperto: gareAperte(r),
  }));
}

/**
 * La griglia di partenza, con i nomi.
 *
 * È l'elenco dei piloti fra cui si sceglie. Se le qualifiche non si sono
 * ancora corse la griglia non esiste: in quel caso si ripiega sull'ordine
 * d'arrivo dell'ultima gara della stagione, che è l'elenco dei piloti in
 * attività, e chi gioca sceglie comunque fra volti veri.
 */
export async function caricaGriglia(race) {
  const db = richiediAdmin();

  const { data: griglia } = await db
    .from('race_data')
    .select('driver_id, constructor_id, position_number')
    .eq('race_id', race.id)
    .eq('type', 'STARTING_GRID_POSITION')
    .order('position_number');

  let righe = (griglia || []).filter(r => r.driver_id);

  if (!righe.length) {
    const { data: ultima } = await db
      .from('race')
      .select('id, round')
      .eq('year', race.year).lt('round', race.round)
      .order('round', { ascending: false }).limit(1).maybeSingle();
    if (ultima) {
      const { data: arrivo } = await db
        .from('race_grid_results')
        .select('driver_id, constructor_id, position_number')
        .eq('race_id', ultima.id).order('position_number');
      righe = (arrivo || []).filter(r => r.driver_id);
    }
  }

  const idPiloti = [...new Set(righe.map(r => r.driver_id))];
  const idTeam   = [...new Set(righe.map(r => r.constructor_id).filter(Boolean))];
  const [{ data: piloti }, { data: team }] = await Promise.all([
    db.from('driver').select('id, first_name, last_name').in('id', idPiloti),
    db.from('constructor').select('id, name').in('id', idTeam),
  ]);
  const nomi = Object.fromEntries((piloti || []).map(d => [d.id, `${d.first_name} ${d.last_name}`.trim()]));
  const scuderie = Object.fromEntries((team || []).map(c => [c.id, c.name]));

  return righe.map(r => ({
    driverId: r.driver_id,
    nome: nomi[r.driver_id] || r.driver_id,
    scuderia: scuderie[r.constructor_id] || r.constructor_id,
    partenza: r.position_number ?? null,
  }));
}

/**
 * Il risultato ufficiale nella forma che vuole il motore di punteggio.
 * Restituisce `null` finché la gara non è in archivio.
 */
export async function caricaRisultato(race) {
  const db = richiediAdmin();

  const { data: arrivo } = await db
    .from('race_grid_results')
    .select('driver_id, position_number, grid_position_number, reason_retired')
    .eq('race_id', race.id)
    .order('position_number', { nullsFirst: false });

  const righe = (arrivo || []).filter(r => r.driver_id);
  if (!righe.length) return null;

  const classificati = righe.filter(r => r.position_number);
  if (!classificati.length) return null;

  const { data: pdg } = await db
    .from('race_data')
    .select('driver_id')
    .eq('race_id', race.id)
    .eq('type', 'DRIVER_OF_THE_DAY_RESULT')
    .eq('position_number', 1)
    .maybeSingle();

  return {
    ordine: classificati.sort((a, b) => a.position_number - b.position_number).map(r => r.driver_id),
    griglia: Object.fromEntries(
      righe.filter(r => r.grid_position_number).map(r => [r.driver_id, r.grid_position_number]),
    ),
    ritiri: righe.filter(r => r.reason_retired).length,
    pilotaDelGiorno: pdg?.driver_id || null,
  };
}

/**
 * Salva il pronostico di un utente.
 *
 * Qui si ricontrolla tutto quello che il browser ha già controllato: il
 * browser è un posto in cui i controlli si tolgono con un clic.
 */
export async function salvaPrevisione({ utente, year, round, previsione }) {
  const db = richiediAdmin();
  const race = await caricaGara(year, round);

  if (!gareAperte(race)) {
    throw new ErroreFanta(409, 'Le giocate per questo Gran Premio sono chiuse.');
  }

  const griglia = await caricaGriglia(race);
  const { valida, errori } = validaPrevisione(previsione, griglia.map(g => g.driverId));
  if (!valida) throw new ErroreFanta(400, errori.join(' '));

  const { error } = await db.from('fanta_prediction').upsert({
    user_id: utente.id,
    year, round,
    top10: previsione.top10,
    driver_of_the_day: previsione.pilotaDelGiorno || null,
    retirements: previsione.ritiri,
    display_name: utente.nome || null,
    avatar_url: utente.avatar || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new ErroreFanta(500, error.message);

  return { salvato: true, scadenza: scadenza(race).toISOString() };
}

/** Il pronostico di un utente per una gara, o `null`. */
export async function leggiPrevisione(userId, year, round) {
  const db = richiediAdmin();
  const { data } = await db
    .from('fanta_prediction')
    .select('top10, driver_of_the_day, retirements, updated_at')
    .eq('user_id', userId).eq('year', year).eq('round', round)
    .maybeSingle();
  if (!data) return null;
  return {
    top10: data.top10,
    pilotaDelGiorno: data.driver_of_the_day,
    ritiri: data.retirements,
    aggiornato: data.updated_at,
  };
}

/**
 * Calcola e salva i punteggi di una gara conclusa.
 *
 * Idempotente: rilanciarlo ricalcola tutto sugli stessi dati. Serve perché
 * l'archivio a volte arriva in ritardo, e perché una squalifica può cambiare
 * l'ordine d'arrivo dopo qualche ora.
 */
export async function calcolaGara(year, round) {
  const db = richiediAdmin();
  const race = await caricaGara(year, round);

  if (gareAperte(race)) {
    throw new ErroreFanta(409, 'La gara non è ancora partita.');
  }

  const risultato = await caricaRisultato(race);
  if (!risultato) throw new ErroreFanta(409, 'Il risultato non è ancora in archivio.');

  const { data: previsioni, error } = await db
    .from('fanta_prediction')
    .select('user_id, top10, driver_of_the_day, retirements')
    .eq('year', year).eq('round', round);
  if (error) throw new ErroreFanta(500, error.message);
  if (!previsioni?.length) return { calcolati: 0 };

  const punteggi = previsioni.map(p => {
    const { totale, voci } = calcolaPunteggio({
      top10: p.top10,
      pilotaDelGiorno: p.driver_of_the_day,
      ritiri: p.retirements,
    }, risultato);
    return {
      user_id: p.user_id, year, round,
      total: totale, breakdown: voci,
      scored_at: new Date().toISOString(),
    };
  });

  const { error: erroreScrittura } = await db.from('fanta_score').upsert(punteggi);
  if (erroreScrittura) throw new ErroreFanta(500, erroreScrittura.message);

  return { calcolati: punteggi.length };
}

/**
 * L'ultima gara già corsa: quella che il lavoro pianificato deve calcolare.
 *
 * Il cron passa senza sapere niente del calendario — gli si dice "calcola" e
 * basta. Prendere l'ultima corsa è giusto anche a distanza di giorni, perché
 * `calcolaGara` è idempotente: rifarla non cambia il risultato.
 */
export async function ultimaGaraCorsa(year = new Date().getUTCFullYear()) {
  const db = richiediAdmin();
  const { data, error } = await db
    .from('race')
    .select('year, round, date, time')
    .eq('year', year).order('round');
  if (error) throw new ErroreFanta(500, error.message);
  const corse = (data || []).filter(r => !gareAperte(r));
  if (!corse.length) throw new ErroreFanta(409, `Nessuna gara ancora corsa nel ${year}.`);
  const ultima = corse[corse.length - 1];
  return { year: ultima.year, round: ultima.round };
}

/* ─── Classifiche ─────────────────────────────────────────────────────────── */

/** La classifica di stagione, dalla vista `fanta_season_standings`. */
export async function classificaStagione(year, { limite = 100, soloUtenti = null } = {}) {
  const db = richiediAdmin();
  let q = db.from('fanta_season_standings')
    .select('user_id, display_name, avatar_url, punti, gare_giocate, miglior_gara')
    .eq('year', year)
    .order('punti', { ascending: false })
    .limit(limite);
  if (soloUtenti) q = q.in('user_id', soloUtenti);
  const { data, error } = await q;
  if (error) throw new ErroreFanta(500, error.message);
  return (data || []).map((r, i) => ({ posizione: i + 1, ...r }));
}

/**
 * La classifica di un singolo Gran Premio.
 *
 * I pronostici degli altri si vedono solo a gara iniziata: prima, mostrarli
 * sarebbe regalare la giocata a chi apre la pagina per ultimo.
 */
export async function classificaGara(year, round) {
  const db = richiediAdmin();
  const race = await caricaGara(year, round);
  if (gareAperte(race)) {
    throw new ErroreFanta(409, 'La classifica si vede a gara iniziata.');
  }

  const { data, error } = await db
    .from('fanta_score')
    .select('user_id, total, breakdown')
    .eq('year', year).eq('round', round)
    .order('total', { ascending: false });
  if (error) throw new ErroreFanta(500, error.message);
  if (!data?.length) return [];

  const { data: nomi } = await db
    .from('fanta_prediction')
    .select('user_id, display_name, avatar_url, top10')
    .eq('year', year).eq('round', round);
  const perUtente = Object.fromEntries((nomi || []).map(n => [n.user_id, n]));

  return data.map((r, i) => ({
    posizione: i + 1,
    userId: r.user_id,
    nome: perUtente[r.user_id]?.display_name || r.user_id,
    avatar: perUtente[r.user_id]?.avatar_url || null,
    punti: r.total,
    voci: r.breakdown,
    top10: perUtente[r.user_id]?.top10 || null,
  }));
}

/* ─── Leghe private ───────────────────────────────────────────────────────── */

/* Il codice d'invito: sei caratteri, senza le lettere che si confondono con
   le cifre (I/O/0/1) perché questo codice viene letto ad alta voce e copiato
   a mano da un messaggio. */
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const nuovoCodice = () =>
  Array.from({ length: 6 }, () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)]).join('');

export async function creaLega({ utente, nome }) {
  const db = richiediAdmin();
  const pulito = String(nome || '').trim();
  if (pulito.length < 2 || pulito.length > 40) {
    throw new ErroreFanta(400, 'Il nome della lega deve avere fra 2 e 40 caratteri.');
  }

  /* Quante leghe può avere una persona: senza un tetto, uno script può
     riempire la tabella in un minuto. Dieci sono più di quante ne servano. */
  const { count } = await db.from('fanta_league')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', utente.id);
  if ((count || 0) >= 10) {
    throw new ErroreFanta(429, 'Hai già creato dieci leghe.');
  }

  // Il codice è casuale: alla collisione si riprova, non si va in errore.
  for (let tentativo = 0; tentativo < 5; tentativo++) {
    const code = nuovoCodice();
    const { data, error } = await db.from('fanta_league')
      .insert({ name: pulito, code, owner_id: utente.id })
      .select('id, name, code').single();
    if (!error) {
      await db.from('fanta_league_member').insert({ league_id: data.id, user_id: utente.id });
      return data;
    }
    if (error.code !== '23505') throw new ErroreFanta(500, error.message);
  }
  throw new ErroreFanta(500, 'Non è stato possibile generare un codice libero.');
}

export async function entraInLega({ utente, codice }) {
  const db = richiediAdmin();
  const code = String(codice || '').trim().toUpperCase();
  const { data: lega } = await db.from('fanta_league')
    .select('id, name').eq('code', code).maybeSingle();
  if (!lega) throw new ErroreFanta(404, 'Codice non valido.');

  const { count } = await db.from('fanta_league_member')
    .select('user_id', { count: 'exact', head: true })
    .eq('league_id', lega.id);
  if ((count || 0) >= 200) throw new ErroreFanta(409, 'Questa lega è al completo.');

  const { error } = await db.from('fanta_league_member')
    .upsert({ league_id: lega.id, user_id: utente.id });
  if (error) throw new ErroreFanta(500, error.message);
  return lega;
}

export async function legheDi(utente) {
  const db = richiediAdmin();
  const { data } = await db.from('fanta_league_member')
    .select('league_id, fanta_league(id, name, code, owner_id)')
    .eq('user_id', utente.id);
  return (data || []).map(r => ({
    id: r.fanta_league.id,
    nome: r.fanta_league.name,
    // Il codice lo vede solo chi è già dentro: serve a invitare.
    codice: r.fanta_league.code,
    proprietario: r.fanta_league.owner_id === utente.id,
  }));
}

/** La classifica di una lega: la stessa di stagione, ristretta ai membri. */
export async function classificaLega({ utente, legaId, year }) {
  const db = richiediAdmin();
  const { data: membri } = await db.from('fanta_league_member')
    .select('user_id').eq('league_id', legaId);
  const ids = (membri || []).map(m => m.user_id);

  // Le classifiche di lega si vedono da dentro: è quello che le rende private.
  if (!ids.includes(utente.id)) throw new ErroreFanta(403, 'Non fai parte di questa lega.');

  return classificaStagione(year, { soloUtenti: ids, limite: 200 });
}
