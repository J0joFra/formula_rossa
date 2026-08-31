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
 * Si legge dalla tabella `season` (una riga per anno), non da `race`: quella
 * ha 1.171 righe e l'API di Supabase ne restituisce al massimo 1.000 per
 * richiesta, quindi ricavare gli anni da lì faceva sparire dal selettore le
 * stagioni dal 1950 al 1967. È anche la stessa fonte che usa /standings.
 */
export async function getSeasons() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('season')
    .select('year')
    .order('year', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(s => s.year);
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

/**
 * Qualifiche di un Gran Premio, se in archivio.
 *
 * Il formato cambia con le epoche e l'archivio lo rispecchia:
 * - dal 1983 esiste QUALIFYING_RESULT, e dal 2006 ha i tempi divisi in Q1/Q2/Q3;
 * - prima c'erano due sessioni separate (QUALIFYING_1/2_RESULT) con un tempo solo;
 * - per 640 gare su 1.171 non c'è alcun dato di qualifica.
 *
 * Si restituisce anche `hasSegments`, così la tabella sa se mostrare tre
 * colonne di tempi o una sola invece di stamparne due sempre vuote.
 */
const QUALI_TYPES = ['QUALIFYING_RESULT', 'QUALIFYING_2_RESULT', 'QUALIFYING_1_RESULT'];

export async function getQualifying(raceId) {
  if (!supabase || !raceId) return null;

  for (const type of QUALI_TYPES) {
    const { data, error } = await supabase
      .from('race_data')
      .select('driver_id, constructor_id, position_number, position_text, qualifying_time, qualifying_gap, qualifying_q1, qualifying_q2, qualifying_q3')
      .eq('race_id', raceId)
      .eq('type', type)
      .order('position_display_order');
    if (error) throw new Error(error.message);
    if (!data?.length) continue;

    const rows = data.map(r => ({
      driverId:       r.driver_id,
      constructorId:  r.constructor_id,
      positionNumber: r.position_number,
      positionText:   r.position_text,
      q1:             r.qualifying_q1,
      q2:             r.qualifying_q2,
      q3:             r.qualifying_q3,
      gap:            r.qualifying_gap,
      // Il tempo che conta è l'ultimo girato: Q3 se c'è, altrimenti a scendere.
      best: r.qualifying_q3 || r.qualifying_q2 || r.qualifying_q1 || r.qualifying_time || null,
    }));

    return {
      rows,
      hasSegments: rows.some(r => r.q1 || r.q2 || r.q3),
      label: type === 'QUALIFYING_2_RESULT' ? 'Seconda sessione'
           : type === 'QUALIFYING_1_RESULT' ? 'Prima sessione'
           : null,
    };
  }
  return null;
}

/** Sprint race, solo per le 29 gare che ne hanno una. */
export async function getSprint(raceId) {
  if (!supabase || !raceId) return [];
  const { data, error } = await supabase
    .from('race_data')
    .select('driver_id, constructor_id, position_number, position_text, race_points, race_gap, race_grid_position_number')
    .eq('race_id', raceId)
    .eq('type', 'SPRINT_RACE_RESULT')
    .order('position_display_order');
  if (error) throw new Error(error.message);

  return (data || []).map(r => ({
    driverId:           r.driver_id,
    constructorId:      r.constructor_id,
    positionNumber:     r.position_number,
    positionText:       r.position_text,
    points:             r.race_points ?? 0,
    gap:                r.race_gap,
    gridPositionNumber: r.race_grid_position_number,
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
