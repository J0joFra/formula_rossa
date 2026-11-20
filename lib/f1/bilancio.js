/**
 * lib/f1/bilancio.js
 * Il bilancio di una stagione Ferrari, calcolato dai risultati gara per gara.
 *
 * Non usa la vista `ferrari_season_summary` per l'anno in esame: a novembre
 * 2026 diceva 4 gare e 110 punti per una stagione da 510. Si parte invece da
 * `race_data` (gara, sprint e qualifiche) e dalle classifiche ufficiali.
 * La vista resta buona per le stagioni passate, che servono al confronto.
 *
 * `caricaBilancio` legge il database; `calcolaBilancio` fa i conti e non
 * tocca la rete, così si può verificare da sola.
 */

import { leggi } from '../supabaseServer';
import { nomeGP } from './nomiGP';

const SQUADRA = 'ferrari';

export async function caricaBilancio(anno) {
  const gare = await leggi((c) => c
    .from('race')
    .select('id, round, date, grand_prix_id')
    .eq('year', anno)
    .order('round'));
  if (!gare?.length) return null;
  const ids = gare.map((g) => g.id);

  const [risultati, vincitori, gp, piloti, costruttori, storico] = await Promise.all([
    leggi((c) => c
      .from('race_data')
      .select('race_id, type, driver_id, position_number, position_text, race_points, race_pole_position, race_fastest_lap, race_grid_position_number')
      .in('race_id', ids)
      .eq('constructor_id', SQUADRA)
      .in('type', ['RACE_RESULT', 'SPRINT_RACE_RESULT', 'QUALIFYING_RESULT'])),
    leggi((c) => c
      .from('race_data')
      .select('race_id, driver_id, constructor_id')
      .in('race_id', ids)
      .eq('type', 'RACE_RESULT')
      .eq('position_number', 1)),
    leggi((c) => c.from('grand_prix').select('id, name, country_id').in('id', [...new Set(gare.map((g) => g.grand_prix_id))])),
    leggi((c) => c.from('season_driver_standing').select('driver_id, position_number, points').eq('year', anno)),
    leggi((c) => c.from('season_constructor_standing').select('constructor_id, position_number, points').eq('year', anno)),
    leggi((c) => c.from('ferrari_season_summary').select('*').gte('year', anno - 10).lt('year', anno).order('year')),
  ]);
  if (!risultati) return null;

  const idPiloti = [...new Set([...risultati, ...(vincitori || [])].map((r) => r.driver_id))];
  const anagrafica = await leggi((c) => c.from('driver').select('id, first_name, last_name').in('id', idPiloti));
  const costruttoriVincitori = [...new Set((vincitori || []).map((v) => v.constructor_id))];
  const squadre = await leggi((c) => c.from('constructor').select('id, name').in('id', costruttoriVincitori));

  return calcolaBilancio({
    anno, gare, risultati, vincitori: vincitori || [], gp: gp || [], piloti: piloti || [],
    costruttori: costruttori || [], storico: storico || [], anagrafica: anagrafica || [], squadre: squadre || [],
    oggi: new Date().toISOString().slice(0, 10),
  });
}

const num = (v) => (v === null || v === undefined || v === '' ? 0 : Number(v));

export function calcolaBilancio({
  anno, gare, risultati, vincitori, gp, piloti, costruttori, storico, anagrafica, squadre, oggi,
}) {
  const nome = (id) => {
    const d = anagrafica.find((a) => a.id === id);
    return d ? `${d.first_name} ${d.last_name}` : id;
  };
  const cognome = (id) => anagrafica.find((a) => a.id === id)?.last_name || id;
  const gpById = Object.fromEntries(gp.map((g) => [g.id, g]));
  const perGara = (raceId, tipo) => risultati.filter((r) => r.race_id === raceId && r.type === tipo);

  // I piloti Ferrari della stagione, dal più presente in gara al meno.
  const presenze = {};
  risultati.filter((r) => r.type === 'RACE_RESULT').forEach((r) => { presenze[r.driver_id] = (presenze[r.driver_id] || 0) + 1; });
  const idPilotiFerrari = Object.keys(presenze).sort((a, b) => presenze[b] - presenze[a]);

  // ── Gara per gara ──
  const cumulati = Object.fromEntries(idPilotiFerrari.map((id) => [id, 0]));
  const righe = gare.map((g) => {
    const gara = perGara(g.id, 'RACE_RESULT');
    const sprint = perGara(g.id, 'SPRINT_RACE_RESULT');
    const quali = perGara(g.id, 'QUALIFYING_RESULT');
    const disputata = gara.length > 0;
    const vincitore = vincitori.find((v) => v.race_id === g.id);
    const futura = !disputata && g.date >= oggi;

    const piloti_ = idPilotiFerrari.map((id) => {
      const r = gara.find((x) => x.driver_id === id);
      const s = sprint.find((x) => x.driver_id === id);
      const q = quali.find((x) => x.driver_id === id);
      const punti = num(r?.race_points) + num(s?.race_points);
      if (disputata) cumulati[id] += punti;
      return {
        id,
        arrivo: r ? (r.position_text ?? null) : null,
        arrivoNum: r?.position_number ?? null,
        griglia: r?.race_grid_position_number ?? null,
        quali: q?.position_number ?? null,
        sprint: s ? (s.position_text ?? null) : null,
        punti,
        pole: !!r?.race_pole_position || q?.position_number === 1,
        giroVeloce: !!r?.race_fastest_lap,
      };
    });

    return {
      round: g.round,
      data: g.date,
      gpId: g.grand_prix_id,
      nome: nomeGP(g.grand_prix_id, gpById[g.grand_prix_id]?.name),
      paese: gpById[g.grand_prix_id]?.country_id || null,
      stato: disputata ? 'disputata' : futura ? 'futura' : 'annullata',
      piloti: piloti_,
      puntiFerrari: piloti_.reduce((s, p) => s + p.punti, 0),
      cumulati: { ...cumulati },
      vincitore: vincitore ? {
        nome: nome(vincitore.driver_id),
        squadra: squadre.find((s) => s.id === vincitore.constructor_id)?.name || vincitore.constructor_id,
        ferrari: vincitore.constructor_id === SQUADRA,
      } : null,
    };
  });

  const disputate = righe.filter((r) => r.stato === 'disputata');
  const ultima = disputate[disputate.length - 1] || null;
  const rimanenti = righe.filter((r) => r.stato === 'futura').length;

  // ── Numeri per pilota ──
  const statPilota = (id) => {
    const corse = disputate.map((r) => r.piloti.find((p) => p.id === id)).filter((p) => p && p.arrivo !== null);
    const arrivi = corse.filter((p) => p.arrivoNum);
    const qualifiche = corse.filter((p) => p.quali);
    const classifica = piloti.find((p) => p.driver_id === id);
    return {
      id,
      nome: nome(id),
      cognome: cognome(id),
      gare: corse.length,
      vittorie: corse.filter((p) => p.arrivoNum === 1).length,
      podi: corse.filter((p) => p.arrivoNum && p.arrivoNum <= 3).length,
      pole: corse.filter((p) => p.pole).length,
      giriVeloci: corse.filter((p) => p.giroVeloce).length,
      // Ritirati, squalificati, non classificati: nessuna posizione numerica.
      ritiri: corse.filter((p) => !p.arrivoNum).length,
      punti: corse.reduce((s, p) => s + p.punti, 0),
      migliore: arrivi.length ? Math.min(...arrivi.map((p) => p.arrivoNum)) : null,
      mediaArrivo: arrivi.length ? arrivi.reduce((s, p) => s + p.arrivoNum, 0) / arrivi.length : null,
      mediaQuali: qualifiche.length ? qualifiche.reduce((s, p) => s + p.quali, 0) / qualifiche.length : null,
      podiSprint: corse.filter((p) => /^[123]$/.test(p.sprint || '')).length,
      posizione: classifica?.position_number ?? null,
      puntiClassifica: classifica ? num(classifica.points) : null,
    };
  };
  const pilotiStat = idPilotiFerrari.map(statPilota);

  // ── Testa a testa fra i due piloti principali ──
  let duello = null;
  if (idPilotiFerrari.length >= 2) {
    const [a, b] = idPilotiFerrari;
    const conta = { quali: [0, 0], gara: [0, 0] };
    disputate.forEach((r) => {
      const pa = r.piloti.find((p) => p.id === a);
      const pb = r.piloti.find((p) => p.id === b);
      if (!pa?.arrivo || !pb?.arrivo) return;
      if (pa.quali && pb.quali) conta.quali[pa.quali < pb.quali ? 0 : 1] += 1;
      // In gara: chi arriva davanti; un ritirato perde contro un classificato.
      const va = pa.arrivoNum ?? Infinity;
      const vb = pb.arrivoNum ?? Infinity;
      if (va !== vb) conta.gara[va < vb ? 0 : 1] += 1;
    });
    duello = { a, b, ...conta };
  }

  const squadra = costruttori.find((c) => c.constructor_id === SQUADRA);
  const somma = (k) => pilotiStat.reduce((s, p) => s + p[k], 0);
  const totali = {
    posizione: squadra?.position_number ?? null,
    punti: squadra ? num(squadra.points) : somma('punti'),
    vittorie: somma('vittorie'),
    podi: somma('podi'),
    pole: somma('pole'),
    giriVeloci: somma('giriVeloci'),
    podiSprint: somma('podiSprint'),
    doppiPodi: disputate.filter((r) => r.piloti.filter((p) => p.arrivoNum && p.arrivoNum <= 3).length >= 2).length,
    gareAPunti: disputate.filter((r) => r.puntiFerrari > 0).length,
    gare: disputate.length,
  };

  const campione = costruttori.find((c) => c.position_number === 1);

  return {
    anno,
    conclusa: rimanenti === 0 && disputate.length > 0,
    ultima: ultima ? { round: ultima.round, nome: ultima.nome } : null,
    rimanenti,
    totali,
    distaccoDalPrimo: campione && squadra && campione.constructor_id !== SQUADRA ? num(campione.points) - num(squadra.points) : null,
    piloti: pilotiStat,
    duello,
    gare: righe,
    momenti: {
      vittorie: disputate.flatMap((r) => r.piloti.filter((p) => p.arrivoNum === 1).map((p) => ({ round: r.round, gp: r.nome, pilota: cognome(p.id) }))),
      pole: disputate.flatMap((r) => r.piloti.filter((p) => p.pole).map((p) => ({ round: r.round, gp: r.nome, pilota: cognome(p.id) }))),
    },
    storico: [
      ...storico.map((s) => ({
        anno: s.year, punti: num(s.points), vittorie: s.wins, podi: s.podiums, pole: s.poles, posizione: s.championship_position,
      })),
      { anno, punti: totali.punti, vittorie: totali.vittorie, podi: totali.podi, pole: totali.pole, posizione: totali.posizione, attuale: true },
    ],
  };
}
