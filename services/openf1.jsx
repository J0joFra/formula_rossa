// services/openf1.js
const API_BASE = 'https://api.openf1.org/v1';

const cache = new Map();
const CACHE_DURATION = 60000; // 1 minuto

export const MOCK_STANDINGS = [
  { pos: 1, car: '16', driver: 'Charles Leclerc', gap: 'LEADER', interval: '-', lastLap: '1:14.562', sector1: '22.1', sector2: '31.4', sector3: '21.0', tyres: 'S', tyreAge: 5, team_colour: 'DC0000' },
  { pos: 2, car: '44', driver: 'Lewis Hamilton', gap: '+1.245', interval: '+1.245', lastLap: '1:14.890', sector1: '22.3', sector2: '31.5', sector3: '21.0', tyres: 'S', tyreAge: 6, team_colour: '00D2BE' },
  { pos: 3, car: '1', driver: 'Max Verstappen', gap: '+3.567', interval: '+2.322', lastLap: '1:15.102', sector1: '22.4', sector2: '31.8', sector3: '21.1', tyres: 'M', tyreAge: 12, team_colour: '3671C6' },
];

export const MOCK_TELEMETRY = {
  speed: '312 km/h',
  rpm: '11,400',
  throttle: '100%',
  brake: '0%',
  gear: 8,
  drs: 12
};

export const MOCK_WEATHER = {
  airTemp: '24',
  trackTemp: '38',
  humidity: '45',
  rainfall: 0
};

export const MOCK_RADIO = [
  { time: '14:32:01', driver: 'LEC', message: 'Pitting this lap.', isYellow: false },
  { time: '14:31:45', driver: 'ENG', message: 'Box box, confirm.', isYellow: false },
  { time: '14:28:10', driver: 'RACE', message: 'Yellow Flag Sector 2', isYellow: true },
];

// Funzioni API
export async function fetchLatestSession(sessionType = 'Race') {
  const cacheKey = `session_${sessionType}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Ottieni il meeting più recente
    const meetingRes = await fetch(`${API_BASE}/meetings?meeting_key=latest`);
    if (!meetingRes.ok) throw new Error(`HTTP ${meetingRes.status}`);
    const meetings = await meetingRes.json();
    
    if (meetings.length === 0) throw new Error('No meetings found');
    
    const meetingKey = meetings[0].meeting_key;
    
    // Ottieni la sessione specifica
    const sessionRes = await fetch(`${API_BASE}/sessions?meeting_key=${meetingKey}&session_name=${sessionType}`);
    if (!sessionRes.ok) throw new Error(`HTTP ${sessionRes.status}`);
    const sessions = await sessionRes.json();
    
    const sessionData = sessions[0] || null;
    
    cache.set(cacheKey, {
      data: sessionData,
      timestamp: Date.now()
    });
    
    return sessionData;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

export async function fetchDrivers(sessionKey) {
  if (!sessionKey || sessionKey === 'mock') return [];
  
  try {
    const res = await fetch(`${API_BASE}/drivers?session_key=${sessionKey}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
}

export async function fetchIntervals(sessionKey) {
  if (!sessionKey || sessionKey === 'mock') return [];
  
  try {
    const res = await fetch(`${API_BASE}/intervals?session_key=${sessionKey}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching intervals:', error);
    return [];
  }
}

export async function fetchLaps(sessionKey, driverNumber) {
  if (!sessionKey || sessionKey === 'mock') return [];
  
  try {
    const res = await fetch(`${API_BASE}/laps?session_key=${sessionKey}&driver_number=${driverNumber}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching laps:', error);
    return [];
  }
}

export async function fetchCarData(sessionKey, driverNumber) {
  if (!sessionKey || sessionKey === 'mock') return [];
  
  try {
    const res = await fetch(`${API_BASE}/car_data?session_key=${sessionKey}&driver_number=${driverNumber}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching car data:', error);
    return [];
  }
}

export async function fetchWeather(sessionKey) {
  if (!sessionKey || sessionKey === 'mock') return [];
  
  try {
    const res = await fetch(`${API_BASE}/weather?session_key=${sessionKey}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    return [];
  }
}

export async function fetchTeamRadio(sessionKey) {
  if (!sessionKey || sessionKey === 'mock') return [];
  
  try {
    const res = await fetch(`${API_BASE}/team_radio?session_key=${sessionKey}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching team radio:', error);
    return [];
  }
}