/**
 * OpenF1 API Layer
 * https://openf1.org 
 *
 * Endpoints usati:
 *  - /v1/sessions       → trova session_key da anno + gp + tipo
 *  - /v1/meetings       → trova meeting_key da anno + nome gara
 *  - /v1/drivers        → piloti di una sessione
 *  - /v1/car_data       → telemetria (speed, rpm, gear, throttle, brake, drs)
 *  - /v1/laps           → tempi sul giro
 *  - /v1/weather        → meteo
 *  - /v1/position       → posizioni in gara
 *  - /v1/stints         → stint (gomme)
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
  FP1: 'Practice 1',
  FP2: 'Practice 2',
  FP3: 'Practice 3',
  Q:   'Qualifying',
  R:   'Race',
  S:   'Sprint',
  SQ:  'Sprint Qualifying',
};

export async function getSessionKey(year, gpName, sessionId) {
  const sessionName = SESSION_NAME_MAP[sessionId] || sessionId;

  const meetings = await openf1Fetch('/meetings', { year });
  if (!meetings.length) throw new Error(`Nessun meeting trovato per ${year}`);

  const gpLower = gpName.toLowerCase();
  const meeting = meetings.find(m =>
    m.meeting_name?.toLowerCase().includes(gpLower) ||
    m.location?.toLowerCase().includes(gpLower) ||
    m.country_name?.toLowerCase().includes(gpLower) ||
    m.circuit_short_name?.toLowerCase().includes(gpLower)
  );

  if (!meeting) {
    const available = meetings.map(m => `${m.meeting_name} (${m.location})`).join(', ');
    throw new Error(`GP "${gpName}" non trovato per ${year}. Disponibili: ${available}`);
  }

  const sessions = await openf1Fetch('/sessions', {
    meeting_key: meeting.meeting_key,
    session_name: sessionName,
  });

  if (!sessions.length) {
    throw new Error(`Sessione "${sessionName}" non trovata per ${meeting.meeting_name}`);
  }

  const session = sessions[0];
  return {
    session_key: session.session_key,
    meeting_key: meeting.meeting_key,
    meeting_name: meeting.meeting_name,
    location: meeting.location,
    country_name: meeting.country_name,
    session_name: session.session_name,
    date_start: session.date_start,
  };
}

export async function getDrivers(session_key) {
  return openf1Fetch('/drivers', { session_key });
}

export async function getDriverNumber(session_key, acronym) {
  const drivers = await getDrivers(session_key);
  const driver = drivers.find(d =>
    d.name_acronym?.toUpperCase() === acronym.toUpperCase()
  );
  if (!driver) {
    const available = drivers.map(d => d.name_acronym).join(', ');
    throw new Error(`Pilota "${acronym}" non trovato. Disponibili: ${available}`);
  }
  return driver.driver_number;
}

export async function getTelemetry(session_key, driver_number) {
  const laps = await openf1Fetch('/laps', { session_key, driver_number });
  if (!laps.length) throw new Error('Nessun giro trovato per questo pilota');

  const validLaps = laps.filter(l => l.lap_duration != null);
  if (!validLaps.length) throw new Error('Nessun tempo sul giro valido');

  const fastest = validLaps.reduce((a, b) =>
    a.lap_duration < b.lap_duration ? a : b
  );

  const dateStart = fastest.date_start;
  const dateEnd   = fastest.date_start
    ? addSeconds(fastest.date_start, fastest.lap_duration + 1)
    : null;

  const params = { session_key, driver_number };
  if (dateStart) params['date>='] = dateStart;
  if (dateEnd)   params['date<']  = dateEnd;

  const carData = await openf1Fetch('/car_data', params);
  if (!carData.length) throw new Error('Nessun dato telemetrico per questo giro');

  const points = [];
  let distance = 0;

  for (let i = 0; i < carData.length; i++) {
    const d = carData[i];
    if (i > 0) {
      const dt = timeDiffSeconds(carData[i - 1].date, d.date);
      const avgSpeed = ((carData[i - 1].speed || 0) + (d.speed || 0)) / 2;
      distance += (avgSpeed / 3.6) * dt; // km/h → m/s
    }
    points.push({
      distance:  Math.round(distance),
      speed:     d.speed     ?? 0,
      rpm:       d.rpm       ?? 0,
      gear:      d.n_gear    ?? 0,
      throttle:  d.throttle  ?? 0,
      brake:     d.brake     ?? 0,
      drs:       d.drs       ?? 0,
      time:      d.date,
    });
  }

  return {
    telemetry: points,
    fastest_lap: {
      lap_number:   fastest.lap_number,
      lap_duration: fastest.lap_duration,
      sector_1:     fastest.duration_sector_1,
      sector_2:     fastest.duration_sector_2,
      sector_3:     fastest.duration_sector_3,
    },
  };
}

export async function getLaps(session_key, driver_number) {
  return openf1Fetch('/laps', { session_key, driver_number });
}

export async function getWeather(session_key) {
  const data = await openf1Fetch('/weather', { session_key });
  if (!data.length) return null;
  const mid = data[Math.floor(data.length / 2)];
  return {
    air_temp:    mid.air_temperature,
    track_temp:  mid.track_temperature,
    humidity:    mid.humidity,
    wind_speed:  mid.wind_speed,
    rainfall:    mid.rainfall,
  };
}

export async function getMeetings(year) {
  return openf1Fetch('/meetings', { year });
}

export async function getSessionsForMeeting(meeting_key) {
  return openf1Fetch('/sessions', { meeting_key });
}

export async function getLatestSession(sessionId = 'Q') {
  const sessionName = SESSION_NAME_MAP[sessionId] || 'Qualifying';
  const currentYear = new Date().getFullYear();

  for (const year of [currentYear, currentYear - 1]) {
    try {
      const sessions = await openf1Fetch('/sessions', {
        year,
        session_name: sessionName,
      });
      if (!sessions.length) continue;

      const now = new Date();
      const past = sessions.filter(s => s.date_start && new Date(s.date_start) < now);
      if (!past.length) continue;

      const latest = past[past.length - 1];
      return {
        year,
        session_key:  latest.session_key,
        meeting_key:  latest.meeting_key,
        location:     latest.location,
        session_name: latest.session_name,
        date_start:   latest.date_start,
      };
    } catch {
      continue;
    }
  }

  // Fallback assoluto
  return { year: 2024, location: 'Monza', session_name: sessionName };
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function addSeconds(isoDate, seconds) {
  const d = new Date(isoDate);
  d.setSeconds(d.getSeconds() + Math.ceil(seconds));
  return d.toISOString();
}

function timeDiffSeconds(iso1, iso2) {
  return (new Date(iso2) - new Date(iso1)) / 1000;
}