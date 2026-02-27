/**
 * OpenF1 API Layer — https://openf1.org
 * Dati gratuiti dal 2023, no API key richiesta.
 * Implementato rate limiting e caching per evitare errori 429
 */

const BASE = 'https://api.openf1.org/v1';
const RATE_LIMIT = 15; 
const REQUEST_INTERVAL = 1000 / RATE_LIMIT; 

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minuti

// Queue per le richieste
let requestQueue = [];
let processing = false;
let lastRequestTime = 0;

const SESSION_NAME_MAP = {
  FP1: 'Practice 1', FP2: 'Practice 2', FP3: 'Practice 3',
  Q: 'Qualifying', R: 'Race', S: 'Sprint', SQ: 'Sprint Qualifying',
};

// Processa la coda delle richieste con rate limiting
async function processQueue() {
  if (processing || requestQueue.length === 0) return;
  
  processing = true;
  
  while (requestQueue.length > 0) {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < REQUEST_INTERVAL) {
      await new Promise(resolve => 
        setTimeout(resolve, REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }
    
    const { endpoint, params, resolve, reject, retryCount = 0 } = requestQueue.shift();
    
    try {
      lastRequestTime = Date.now();
      const result = await actualFetch(endpoint, params);
      resolve(result);
    } catch (error) {
      if (error.message.includes('429') && retryCount < 3) {
        setTimeout(() => {
            requestQueue.unshift({ 
            endpoint, params, resolve, reject, 
            retryCount: retryCount + 1 
            });
        }, 500 * Math.pow(1.5, retryCount));
        }
    }
  }
  
  processing = false;
}

// Funzione di fetch effettiva
async function actualFetch(endpoint, params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== null && v !== undefined)
  ).toString();
  const url = `${BASE}${endpoint}${qs ? '?' + qs : ''}`;
  
  const res = await fetch(url);
  
  if (res.status === 429) {
    throw new Error(`OpenF1 ${endpoint} → HTTP 429 (Too Many Requests)`);
  }
  
  if (!res.ok) {
    throw new Error(`OpenF1 ${endpoint} → HTTP ${res.status}`);
  }
  
  return res.json();
}

// Funzione principale con cache e rate limiting
async function openf1Fetch(endpoint, params = {}) {
  // Crea chiave cache
  const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
  
  // Controlla cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`✅ Cache hit for ${endpoint}`);
    return cached.data;
  }
  
  console.log(`🔄 Fetching ${endpoint}...`);
  
  // Se non in cache, aggiungi alla coda
  return new Promise((resolve, reject) => {
    requestQueue.push({ endpoint, params, resolve, reject });
    processQueue();
  }).then(data => {
    // Salva in cache
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  });
}

// ─── MEETINGS / SESSIONS ──────────────────────────────────────────────────────
export async function getMeetings(year) {
  const data = await openf1Fetch('/meetings', { year });
  return data.sort((a, b) => new Date(a.date_start || 0) - new Date(b.date_start || 0));
}

export async function getSessionsForMeeting(meeting_key) {
  return openf1Fetch('/sessions', { meeting_key });
}

export async function getLatestSession(sessionId = 'Q') {
  const sessionName = SESSION_NAME_MAP[sessionId] || 'Qualifying';
  const currentYear = new Date().getFullYear();
  for (const year of [currentYear, currentYear - 1]) {
    try {
      const sessions = await openf1Fetch('/sessions', { year, session_name: sessionName });
      const now = new Date();
      const past = sessions.filter(s => s.date_start && new Date(s.date_start) < now);
      if (!past.length) continue;
      const latest = past[past.length - 1];
      return { year, session_key: latest.session_key, meeting_key: latest.meeting_key, location: latest.location, session_name: latest.session_name };
    } catch { continue; }
  }
  return { year: 2024, location: 'Monza', session_name: sessionName };
}

// ─── DRIVERS ──────────────────────────────────────────────────────────────────
export async function getDrivers(session_key) {
  return openf1Fetch('/drivers', { session_key });
}

export async function getDriverNumber(session_key, acronym) {
  const drivers = await getDrivers(session_key);
  const d = drivers.find(d => d.name_acronym?.toUpperCase() === acronym.toUpperCase());
  if (!d) throw new Error(`Pilota "${acronym}" non trovato. Disponibili: ${drivers.map(x => x.name_acronym).join(', ')}`);
  return d.driver_number;
}

// ─── TUTTI I GIRI (per lap selector) ─────────────────────────────────────────
export async function getAllLaps(session_key, driver_number) {
  const laps = await openf1Fetch('/laps', { session_key, driver_number });
  return laps
    .filter(l => l.lap_duration != null && l.lap_duration > 0)
    .sort((a, b) => a.lap_number - b.lap_number);
}

// ─── TELEMETRIA singolo giro (o fastest) ─────────────────────────────────────
export async function getTelemetry(session_key, driver_number, lap_number = null) {
  const laps = await openf1Fetch('/laps', { session_key, driver_number });
  const validLaps = laps.filter(l => l.lap_duration != null && l.lap_duration > 0);
  if (!validLaps.length) throw new Error('Nessun giro trovato per questo pilota');

  let targetLap;
  if (lap_number != null) {
    targetLap = validLaps.find(l => l.lap_number === lap_number);
    if (!targetLap) throw new Error(`Giro ${lap_number} non trovato`);
  } else {
    targetLap = validLaps.reduce((a, b) => a.lap_duration < b.lap_duration ? a : b);
  }

  const allCarData = await openf1Fetch('/car_data', { session_key, driver_number });
  if (!allCarData.length) throw new Error('Nessun dato telemetrico disponibile');

  let carData = allCarData;
  if (targetLap.date_start) {
    const lapStart = new Date(targetLap.date_start).getTime();
    const lapEnd = lapStart + (targetLap.lap_duration + 2) * 1000;
    const filtered = allCarData.filter(d => {
      const t = new Date(d.date).getTime();
      return t >= lapStart && t <= lapEnd;
    });
    carData = filtered.length > 10 ? filtered : allCarData;
  }

  const points = buildTelemetryPoints(carData);

  return {
    telemetry: points,
    all_laps: validLaps,
    target_lap: {
      lap_number: targetLap.lap_number,
      lap_duration: targetLap.lap_duration,
      sector_1: targetLap.duration_sector_1,
      sector_2: targetLap.duration_sector_2,
      sector_3: targetLap.duration_sector_3,
      date_start: targetLap.date_start,
      is_fastest: lap_number == null,
    },
  };
}

// ─── TELEMETRIA GARA INTERA (tutti i giri) ────────────────────────────────────
/**
 * Scarica tutta la car_data della sessione per un pilota e la ritorna
 * con distance progressiva e lap_number per ogni punto.
 * Usato per il grafico "andamento gara completo".
 */
export async function getFullSessionTelemetry(session_key, driver_number) {
  const [allCarData, laps] = await Promise.all([
    openf1Fetch('/car_data', { session_key, driver_number }),
    openf1Fetch('/laps', { session_key, driver_number }),
  ]);
  if (!allCarData.length) throw new Error('Nessun dato telemetrico disponibile');

  const validLaps = laps
    .filter(l => l.lap_duration != null && l.lap_duration > 0 && l.date_start)
    .sort((a, b) => a.lap_number - b.lap_number);

  // Assegna lap_number ad ogni punto car_data
  const sortedCarData = [...allCarData].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Costruisce intervalli lap
  const lapIntervals = validLaps.map(l => ({
    lap_number: l.lap_number,
    start: new Date(l.date_start).getTime(),
    end: new Date(l.date_start).getTime() + l.lap_duration * 1000,
  }));

  const getLapNumber = (dateMs) => {
    for (const li of lapIntervals) {
      if (dateMs >= li.start && dateMs <= li.end + 1000) return li.lap_number;
    }
    return null;
  };

  const points = [];
  let distance = 0;
  let lastLap = null;

  for (let i = 0; i < sortedCarData.length; i++) {
    const d = sortedCarData[i];
    const dateMs = new Date(d.date).getTime();
    const lapNum = getLapNumber(dateMs);

    // Reset distanza al cambio giro
    if (lapNum !== lastLap && lapNum != null) {
      distance = 0;
      lastLap = lapNum;
    }

    if (i > 0) {
      const dt = (dateMs - new Date(sortedCarData[i - 1].date).getTime()) / 1000;
      const avgSpd = ((sortedCarData[i - 1].speed || 0) + (d.speed || 0)) / 2;
      distance += (avgSpd / 3.6) * Math.min(dt, 1);
    }

    if (lapNum == null) continue; // Skip punti fuori dai giri validi

    points.push({
      // x = distanza progressiva totale (giro × max_dist + dist_within_lap)
      // usiamo un indice temporale per il grafico full-race
      t: dateMs,
      lap_number: lapNum,
      distance: Math.round(distance),
      speed: d.speed ?? 0,
      rpm: d.rpm ?? 0,
      gear: d.n_gear ?? 0,
      throttle: d.throttle ?? 0,
      brake: typeof d.brake === 'boolean' ? (d.brake ? 100 : 0) : (d.brake ?? 0),
      drs: d.drs ?? 0,
    });
  }

  return { points, laps: validLaps };
}

// ─── GPS CIRCUITO per un giro specifico ───────────────────────────────────────
export async function getCircuitMap(session_key, driver_number, lap_number = null) {
  const laps = await openf1Fetch('/laps', { session_key, driver_number });
  const validLaps = laps.filter(l => l.lap_duration != null && l.lap_duration > 0);
  if (!validLaps.length) return [];

  let targetLap;
  if (lap_number != null) {
    targetLap = validLaps.find(l => l.lap_number === lap_number) ||
                validLaps.reduce((a, b) => a.lap_duration < b.lap_duration ? a : b);
  } else {
    // Default: giro più veloce per la mappa animata
    targetLap = validLaps.reduce((a, b) => a.lap_duration < b.lap_duration ? a : b);
  }
  if (!targetLap?.date_start) return [];

  const lapStart = new Date(targetLap.date_start).getTime();
  const lapEnd = lapStart + (targetLap.lap_duration + 2) * 1000;

  const [allLocation, allCarData] = await Promise.all([
    openf1Fetch('/location', { session_key, driver_number }),
    openf1Fetch('/car_data', { session_key, driver_number }),
  ]);
  if (!allLocation.length) return [];

  const lapLocation = allLocation.filter(d => {
    const t = new Date(d.date).getTime();
    return t >= lapStart && t <= lapEnd;
  });
  const points = lapLocation.length > 20 ? lapLocation : allLocation.slice(0, 300);

  const lapCarData = allCarData.filter(d => {
    const t = new Date(d.date).getTime();
    return t >= lapStart && t <= lapEnd;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  return points.map(p => {
    const pTime = new Date(p.date).getTime();
    let closest = lapCarData[0] ?? null;
    let closestDiff = closest ? Math.abs(new Date(closest.date).getTime() - pTime) : Infinity;
    for (const d of lapCarData) {
      const diff = Math.abs(new Date(d.date).getTime() - pTime);
      if (diff < closestDiff) { closest = d; closestDiff = diff; }
    }
    return { x: p.x, y: p.y, speed: closest?.speed ?? 0, date: p.date };
  }).filter(p => p.x != null && p.y != null);
}

// ─── SETTORI tutti i piloti ───────────────────────────────────────────────────
export async function getAllDriversSectors(session_key) {
  const drivers = await getDrivers(session_key);
  const results = [];

  // Riduci il batch size e aumenta la velocità
  const batchSize = 5; // Aumentato da 3 a 5
  for (let i = 0; i < drivers.length; i += batchSize) {
    const batch = drivers.slice(i, i + batchSize);
    
    await Promise.allSettled(
      batch.map(async (driver) => {
        try {
          const laps = await openf1Fetch('/laps', { 
            session_key, 
            driver_number: driver.driver_number 
          });
          
          const valid = laps.filter(l =>
            l.lap_duration != null && l.lap_duration > 0
          );
          
          if (!valid.length) return;
          
          const fastest = valid.reduce((a, b) => 
            a.lap_duration < b.lap_duration ? a : b
          );
          
          results.push({
            code: driver.name_acronym, 
            full_name: driver.full_name,
            team: driver.team_name,
            color: driver.team_colour ? `#${driver.team_colour}` : '#ef4444',
            lap_time: fastest.lap_duration, 
            s1: fastest.duration_sector_1,
            s2: fastest.duration_sector_2, 
            s3: fastest.duration_sector_3,
            best_lap_number: fastest.lap_number,
            // Non mandare tutti i giri se non servono - commenta se non li usi
            all_laps: valid.sort((a, b) => a.lap_number - b.lap_number).map(l => ({
              lap_number: l.lap_number, 
              lap_duration: l.lap_duration,
              s1: l.duration_sector_1, 
              s2: l.duration_sector_2, 
              s3: l.duration_sector_3,
            })),
          });
        } catch { /* skip */ }
      })
    );
    
    if (i + batchSize < drivers.length) {
      await new Promise(resolve => setTimeout(resolve, 200)); 
    }
  }
  
  return results.sort((a, b) => a.lap_time - b.lap_time);
}

// ─── POSIZIONI GARA ───────────────────────────────────────────────────────────
export async function getRacePositions(session_key) {
  const [allPositions, drivers, lapsData] = await Promise.all([
    openf1Fetch('/position', { session_key }),
    getDrivers(session_key),
    openf1Fetch('/laps', { session_key }),
  ]);
  if (!allPositions.length) throw new Error('Nessun dato posizioni disponibile');
  const numToCode = {};
  drivers.forEach(d => { numToCode[d.driver_number] = d.name_acronym; });
  const posByDriver = {};
  allPositions.forEach(p => {
    if (!posByDriver[p.driver_number]) posByDriver[p.driver_number] = [];
    posByDriver[p.driver_number].push(p);
  });
  Object.values(posByDriver).forEach(arr => arr.sort((a, b) => new Date(a.date) - new Date(b.date)));
  const lapNumbers = [...new Set(lapsData.map(l => l.lap_number))].sort((a, b) => a - b);
  const byLap = lapNumbers.map(lapNum => {
    const entry = { lap: lapNum };
    lapsData.filter(l => l.lap_number === lapNum).forEach(lap => {
      const code = numToCode[lap.driver_number];
      if (!code || lap.lap_duration == null || !lap.date_start) return;
      const lapEndMs = new Date(lap.date_start).getTime() + lap.lap_duration * 1000;
      const driverPos = posByDriver[lap.driver_number];
      if (!driverPos?.length) return;
      let closest = driverPos[0], closestDiff = Math.abs(new Date(driverPos[0].date).getTime() - lapEndMs);
      for (const p of driverPos) {
        const diff = Math.abs(new Date(p.date).getTime() - lapEndMs);
        if (diff < closestDiff) { closest = p; closestDiff = diff; }
      }
      entry[code] = closest.position;
    });
    return entry;
  });
  const activeCodes = drivers.map(d => d.name_acronym).filter(code => byLap.some(l => l[code] != null));
  return { byLap, driverCodes: activeCodes, drivers: drivers.filter(d => activeCodes.includes(d.name_acronym)) };
}

// ─── METEO ────────────────────────────────────────────────────────────────────
export async function getWeather(session_key) {
  const data = await openf1Fetch('/weather', { session_key });
  if (!data.length) return null;
  const mid = data[Math.floor(data.length / 2)];
  return { air_temp: mid.air_temperature, track_temp: mid.track_temperature, humidity: mid.humidity, wind_speed: mid.wind_speed };
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function buildTelemetryPoints(carData) {
  const sorted = [...carData].sort((a, b) => new Date(a.date) - new Date(b.date));
  const points = [];
  let distance = 0;
  for (let i = 0; i < sorted.length; i++) {
    const d = sorted[i];
    if (i > 0) {
      const dt = (new Date(d.date) - new Date(sorted[i - 1].date)) / 1000;
      const avgSpd = ((sorted[i - 1].speed || 0) + (d.speed || 0)) / 2;
      distance += (avgSpd / 3.6) * Math.min(dt, 1);
    }
    points.push({
      distance: Math.round(distance),
      speed: d.speed ?? 0, rpm: d.rpm ?? 0, gear: d.n_gear ?? 0,
      throttle: d.throttle ?? 0,
      brake: typeof d.brake === 'boolean' ? (d.brake ? 100 : 0) : (d.brake ?? 0),
      drs: d.drs ?? 0, time: d.date,
    });
  }
  return points;
}

export function clearCache() {
  cache.clear();
  console.log('🧹 Cache cleared');
}

export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

export function getQueueStats() {
  return {
    queueLength: requestQueue.length,
    processing,
  };
}