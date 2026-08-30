/**
 * lib/f1/gp.js
 * Accesso ai dati dei Gran Premi per le pagine "Analisi GP".
 *
 * Le pagine leggono solo da qui: le query stanno in un posto solo e la forma
 * dei dati restituita è già quella attesa dai grafici in components/livetiming.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = typeof window !== 'undefined'
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )
  : null;

/**
 * Stagioni disponibili, dalla più recente.
 *
 * La tabella `race` ha più di 1.000 righe (una per Gran Premio dal 1950) e
 * l'API di Supabase ne restituisce al massimo 1.000 per richiesta: senza
 * paginare, ordinando dall'anno più recente, le stagioni più vecchie
 * sparirebbero dal selettore. Si legge a pagine finché non ne arriva una
 * incompleta.
 */
const PAGINA = 1000;

export async function getSeasons() {
  if (!supabase) return [];

  const anni = new Set();
  for (let da = 0; ; da += PAGINA) {
    const { data, error } = await supabase
      .from('race')
      .select('year')
      .order('year', { ascending: false })
      .range(da, da + PAGINA - 1);
    if (error) throw new Error(error.message);

    (data || []).forEach(r => anni.add(r.year));
    if (!data || data.length < PAGINA) break;
  }
  return [...anni].sort((a, b) => b - a);
}

/** Calendario di una stagione, con il nome del circuito già risolto. */
export async function getSeasonRaces(year) {
  if (!supabase) return [];
  const { data: races, error } = await supabase
    .from('race')
    .select('id, year, round, date, official_name, circuit_id, sprint_race_date')
    .eq('year', year)
    .order('round');
  if (error) throw new Error(error.message);
  if (!races?.length) return [];

  const ids = [...new Set(races.map(r => r.circuit_id).filter(Boolean))];
  const { data: circuits } = await supabase
    .from('circuit')
    .select('id, name, place_name, country_id')
    .in('id', ids);

  const byId = Object.fromEntries((circuits || []).map(c => [c.id, c]));
  return races.map(r => ({ ...r, circuit: byId[r.circuit_id] || null }));
}

/** Un singolo GP, identificato da anno + round (URL leggibile e stabile). */
export async function getRace(year, round) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('race')
    .select('id, year, round, date, official_name, circuit_id, sprint_race_date, qualifying_date')
    .eq('year', year)
    .eq('round', round)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  let circuit = null;
  if (data.circuit_id) {
    const { data: c } = await supabase
      .from('circuit')
      .select('id, name, place_name, country_id, length, turns')
      .eq('id', data.circuit_id)
      .maybeSingle();
    circuit = c || null;
  }
  return { ...data, circuit };
}

/**
 * Risultati di gara già normalizzati in camelCase: è la forma che
 * GridToRaceChart si aspetta, quindi il grafico si riusa senza adattatori.
 */
export async function getRaceResults(raceId) {
  if (!supabase || !raceId) return [];
  const { data, error } = await supabase
    .from('race_grid_results')
    .select('driver_id, constructor_id, position_number, position_text, points, grid_position_number, reason_retired, laps')
    .eq('race_id', raceId)
    .order('position_number');
  if (error) throw new Error(error.message);

  return (data || []).map(r => ({
    driverId:           r.driver_id,
    constructorId:      r.constructor_id,
    positionNumber:     r.position_number,
    positionText:       r.position_text,
    points:             r.points ?? 0,
    gridPositionNumber: r.grid_position_number,
    reasonRetired:      r.reason_retired,
    laps:               r.laps,
  }));
}

/** Nomi leggibili di piloti e scuderie presenti in un elenco di risultati. */
export async function getNames(results) {
  if (!supabase || !results?.length) return { drivers: {}, constructors: {} };

  const driverIds = [...new Set(results.map(r => r.driverId).filter(Boolean))];
  const teamIds   = [...new Set(results.map(r => r.constructorId).filter(Boolean))];

  const [{ data: drv }, { data: con }] = await Promise.all([
    supabase.from('driver').select('id, first_name, last_name').in('id', driverIds),
    supabase.from('constructor').select('id, name').in('id', teamIds),
  ]);

  return {
    drivers: Object.fromEntries((drv || []).map(d => [d.id, `${d.first_name} ${d.last_name}`.trim()])),
    constructors: Object.fromEntries((con || []).map(c => [c.id, c.name])),
  };
}

/** Riassunto Ferrari del weekend: è un sito sulla Rossa, questo viene prima. */
export function ferrariSummary(results) {
  const rows = (results || []).filter(r => r.constructorId === 'ferrari');
  if (!rows.length) return null;
  const points = rows.reduce((s, r) => s + (r.points || 0), 0);
  const best = rows.reduce(
    (acc, r) => (r.positionNumber && (!acc || r.positionNumber < acc.positionNumber) ? r : acc),
    null,
  );
  const gained = rows.reduce(
    (s, r) => s + ((r.gridPositionNumber && r.positionNumber) ? r.gridPositionNumber - r.positionNumber : 0),
    0,
  );
  return { rows, points, best, gained };
}
