/**
 * OpenF1 API Layer — https://openf1.org
 * Dati gratuiti dal 2023, no API key richiesta.
 */

const BASE = 'https://api.openf1.org/v1';

async function openf1Fetch(endpoint, params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== null && v !== undefined)
  ).toString();
  const url = `${BASE}${endpoint}${qs ? '?' + qs : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OpenF1 ${endpoint} → HTTP ${res.status}`);
  return res.json();
}

const SESSION_NAME_MAP = {
  FP1: 'Practice 1', FP2: 'Practice 2', FP3: 'Practice 3',
  Q: 'Qualifying', R: 'Race', S: 'Sprint', SQ: 'Sprint Qualifying',
};

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

// ─── TUTTI I GIRI di un pilota (per il filtro lap) ────────────────────────────
export async function getAllLaps(session_key, driver_number) {
  const laps = await openf1Fetch('/laps', { session_key, driver_number });
  return laps
    .filter(l => l.lap_duration != null && l.lap_duration > 0)
    .sort((a, b) => a.lap_number - b.lap_number);
}

// ─── TELEMETRIA di un giro specifico (o il più veloce se lap_number=null) ─────
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

  const points = [];
  let distance = 0;
  for (let i = 0; i < carData.length; i++) {
    const d = carData[i];
    if (i > 0) {
      const dt = timeDiffSeconds(carData[i - 1].date, d.date);
      const avgSpd = ((carData[i - 1].speed || 0) + (d.speed || 0)) / 2;
      distance += (avgSpd / 3.6) * Math.min(dt, 1);
    }
    points.push({
      distance: Math.round(distance),
      speed: d.speed ?? 0,
      rpm: d.rpm ?? 0,
      gear: d.n_gear ?? 0,
      throttle: d.throttle ?? 0,
      brake: typeof d.brake === 'boolean' ? (d.brake ? 100 : 0) : (d.brake ?? 0),
      drs: d.drs ?? 0,
      time: d.date,
    });
  }

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
    targetLap = validLaps.reduce((a, b) => a.lap_duration < b.lap_duration ? a : b);
  }
  if (!targetLap.date_start) return [];

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
  });

  // Array ordinato per interpolazione veloce
  const sortedCarData = lapCarData.sort((a, b) => new Date(a.date) - new Date(b.date));

  return points.map(p => {
    const pTime = new Date(p.date).getTime();
    let closest = sortedCarData[0] ?? null;
    let closestDiff = closest ? Math.abs(new Date(closest.date).getTime() - pTime) : Infinity;
    for (const d of sortedCarData) {
      const diff = Math.abs(new Date(d.date).getTime() - pTime);
      if (diff < closestDiff) { closest = d; closestDiff = diff; }
      if (diff > closestDiff + 500) break; // ottimizzazione: array ordinato
    }
    return { x: p.x, y: p.y, speed: closest?.speed ?? 0 };
  }).filter(p => p.x != null && p.y != null);
}

// ─── SETTORI tutti i piloti — per ogni lap disponibile ───────────────────────
/**
 * Ritorna per ogni pilota TUTTI i giri con settori validi.
 * Struttura: [{ code, color, team, laps: [{lap_number, lap_duration, s1, s2, s3}] }]
 * + summary con il best lap per pilota (per la classifica).
 */
export async function getAllDriversSectors(session_key) {
  const drivers = await getDrivers(session_key);
  const results = [];

  await Promise.allSettled(
    drivers.map(async (driver) => {
      try {
        const laps = await openf1Fetch('/laps', { session_key, driver_number: driver.driver_number });
        const valid = laps.filter(l =>
          l.lap_duration != null && l.lap_duration > 0 &&
          l.duration_sector_1 != null && l.duration_sector_2 != null && l.duration_sector_3 != null
        );
        if (!valid.length) return;
        const fastest = valid.reduce((a, b) => a.lap_duration < b.lap_duration ? a : b);
        results.push({
          code: driver.name_acronym,
          full_name: driver.full_name,
          team: driver.team_name,
          color: driver.team_colour ? `#${driver.team_colour}` : '#ef4444',
          // best lap (per classifica)
          lap_time: fastest.lap_duration,
          s1: fastest.duration_sector_1,
          s2: fastest.duration_sector_2,
          s3: fastest.duration_sector_3,
          best_lap_number: fastest.lap_number,
          // tutti i giri validi
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
  return { air_temp: mid.air_temperature, track_temp: mid.track_temperature, humidity: mid.humidity, wind_speed: mid.wind_speed, rainfall: mid.rainfall };
}

function timeDiffSeconds(iso1, iso2) {
  return (new Date(iso2) - new Date(iso1)) / 1000;
}
