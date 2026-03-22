/**
 * lib/fantaf1/openf1Client.js
 * ===========================
 * Wrapper OpenF1 API per il FantaF1.
 * Usato DOPO la gara per calcolare i punti automatici.
 * Tutti i dati storici sono GRATUITI, nessuna API key necessaria.
 *
 * Documentazione: https://openf1.org/docs
 */

const BASE_URL = 'https://api.openf1.org/v1';

// Cache in memoria per evitare chiamate duplicate nella stessa sessione
const cache = new Map();

async function fetchOpenF1(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${endpoint}${query ? '?' + query : ''}`;

  if (cache.has(url)) return cache.get(url);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OpenF1 error ${res.status}: ${url}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

// ─── SESSIONI ─────────────────────────────────────────────────────────────────

/**
 * Trova la session_key di una gara specifica.
 * @param {number} year - es. 2025
 * @param {string} countryName - es. "Monaco", "Bahrain"
 * @param {string} sessionName - "Race" | "Qualifying" | "Sprint"
 */
export async function getSessionKey(year, countryName, sessionName = 'Race') {
  const sessions = await fetchOpenF1('/sessions', {
    year,
    country_name: countryName,
    session_name: sessionName,
  });
  if (!sessions.length) throw new Error(`Sessione non trovata: ${year} ${countryName} ${sessionName}`);
  return sessions[0].session_key;
}

/**
 * Recupera tutte le gare di una stagione.
 */
export async function getSeasonRaces(year) {
  return fetchOpenF1('/sessions', { year, session_name: 'Race' });
}

// ─── RISULTATI GARA ───────────────────────────────────────────────────────────

/**
 * Posizioni finali di tutti i piloti in una gara.
 * Restituisce array ordinato per posizione finale.
 */
export async function getRacePositions(sessionKey) {
  const positions = await fetchOpenF1('/position', { session_key: sessionKey });

  // OpenF1 restituisce posizioni a ogni timestamp — prendiamo l'ultima per ogni pilota
  const lastPositions = new Map();
  for (const entry of positions) {
    lastPositions.set(entry.driver_number, entry);
  }

  return Array.from(lastPositions.values())
    .sort((a, b) => a.position - b.position);
}

/**
 * Posizione di partenza (griglia) per tutti i piloti.
 */
export async function getGridPositions(year, countryName) {
  const qualyKey = await getSessionKey(year, countryName, 'Qualifying');
  const positions = await fetchOpenF1('/position', { session_key: qualyKey });

  // Ultima posizione in qualifica = posizione in griglia
  const grid = new Map();
  for (const entry of positions) {
    grid.set(entry.driver_number, entry.position);
  }
  return grid; // Map<driverNumber, gridPosition>
}

// ─── PIT STOP ─────────────────────────────────────────────────────────────────

/**
 * Pit stop di tutti i piloti in una gara.
 * Restituisce il pit stop più veloce per ogni pilota.
 */
export async function getPitStops(sessionKey) {
  const pits = await fetchOpenF1('/pit', { session_key: sessionKey });

  // Raggruppa per pilota e prendi il più veloce
  const bestPit = new Map();
  for (const pit of pits) {
    const current = bestPit.get(pit.driver_number);
    if (!current || pit.pit_duration < current) {
      bestPit.set(pit.driver_number, pit.pit_duration);
    }
  }
  return bestPit; // Map<driverNumber, fastestPitDuration>
}

// ─── GIRO VELOCE ──────────────────────────────────────────────────────────────

/**
 * Trova il pilota con il giro veloce assoluto in gara.
 */
export async function getFastestLapDriver(sessionKey) {
  const laps = await fetchOpenF1('/laps', { session_key: sessionKey });

  let fastest = null;
  for (const lap of laps) {
    if (!lap.lap_duration) continue;
    if (!fastest || lap.lap_duration < fastest.lap_duration) {
      fastest = lap;
    }
  }
  return fastest?.driver_number ?? null;
}

// ─── PENALITÀ ─────────────────────────────────────────────────────────────────

/**
 * Recupera tutti i messaggi di race control (penalità, DT, DSQ, SC).
 */
export async function getRaceControlMessages(sessionKey) {
  return fetchOpenF1('/race_control', { session_key: sessionKey });
}

/**
 * Estrae le penalità per pilota dai messaggi di race control.
 * Restituisce Map<driverNumber, { timePenalties, driveThrough, disqualified }>
 */
export async function getPenaltiesByDriver(sessionKey) {
  const messages = await getRaceControlMessages(sessionKey);
  const penalties = new Map();

  const ensure = (driverNum) => {
    if (!penalties.has(driverNum)) {
      penalties.set(driverNum, { timePenalties: 0, driveThrough: false, disqualified: false });
    }
    return penalties.get(driverNum);
  };

  for (const msg of messages) {
    if (!msg.driver_number) continue;
    const p = ensure(msg.driver_number);

    const cat = (msg.category || '').toLowerCase();
    const flag = (msg.flag || '').toLowerCase();

    if (cat.includes('black') || flag.includes('black and white')) {
      p.timePenalties += 1;
    } else if (cat.includes('drive through') || msg.message?.includes('DRIVE THROUGH')) {
      p.driveThrough = true;
    } else if (cat.includes('disqualif') || msg.message?.includes('DISQUALIF')) {
      p.disqualified = true;
    } else if (msg.message?.includes('TIME PENALTY') || msg.message?.includes('PENALTY')) {
      p.timePenalties += 1;
    }
  }

  return penalties;
}

// ─── DNF ──────────────────────────────────────────────────────────────────────

/**
 * Trova i piloti che non hanno terminato la gara (DNF).
 * Confronta i piloti presenti con quelli classificati.
 */
export async function getDNFDrivers(sessionKey) {
  const [allDrivers, finalPositions] = await Promise.all([
    fetchOpenF1('/drivers', { session_key: sessionKey }),
    getRacePositions(sessionKey),
  ]);

  const classified = new Set(finalPositions.map(p => p.driver_number));
  return allDrivers
    .map(d => d.driver_number)
    .filter(num => !classified.has(num));
}

// ─── FUNZIONE PRINCIPALE ──────────────────────────────────────────────────────

/**
 * Raccoglie TUTTI i dati necessari per calcolare i punti automatici
 * di una gara. Chiama questa funzione una volta sola dopo la gara
 * e passa il risultato a calculateAutoPoints() in scoring.js.
 *
 * @param {number} year
 * @param {string} countryName
 * @returns {Map<driverNumber, raceResult>}
 */
export async function buildRaceResults(year, countryName) {
  const sessionKey = await getSessionKey(year, countryName, 'Race');
  const qualySessionKey = await getSessionKey(year, countryName, 'Qualifying');

  // Parallelizza tutte le chiamate API
  const [
    finalPositions,
    gridPositions,
    pitStops,
    fastestLapDriver,
    penalties,
    dnfDrivers,
    allDrivers,
  ] = await Promise.all([
    getRacePositions(sessionKey),
    getGridPositions(year, countryName),
    getPitStops(sessionKey),
    getFastestLapDriver(sessionKey),
    getPenaltiesByDriver(sessionKey),
    getDNFDrivers(sessionKey),
    fetchOpenF1('/drivers', { session_key: sessionKey }),
  ]);

  // Pole = primo in qualifica
  const qualyPositions = await getRacePositions(qualySessionKey);
  const poleDriver = qualyPositions[0]?.driver_number ?? null;

  const dnfSet = new Set(dnfDrivers);
  const results = new Map();

  for (const driver of allDrivers) {
    const num = driver.driver_number;
    const finalPos = finalPositions.find(p => p.driver_number === num);
    const pen = penalties.get(num) ?? { timePenalties: 0, driveThrough: false, disqualified: false };

    results.set(num, {
      driverNumber: num,
      driverName: driver.full_name,
      teamName: driver.team_name,
      position: finalPos?.position ?? 99,
      gridPosition: gridPositions.get(num) ?? 99,
      pitDuration: pitStops.get(num) ?? null,
      fastestLap: fastestLapDriver === num,
      dnf: dnfSet.has(num),
      isPole: poleDriver === num,
      timePenalties: pen.timePenalties,
      driveThrough: pen.driveThrough,
      disqualified: pen.disqualified,
    });
  }

  return results; // Map<driverNumber, raceResult>
}