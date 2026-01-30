const BASE_URL = 'https://api.openf1.org/v1';

// Cache in-memory 
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti

export class OpenF1Client {
  static async fetchWithCache(endpoint, params = {}) {
    const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    const url = new URL(`${BASE_URL}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
    
    try {
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`OpenF1 API Error (${endpoint}):`, error);
      throw error;
    }
  }
  
  // Metodi specifici per Ferrari
  static async getFerrariDrivers(year = 2024) {
    return this.fetchWithCache('drivers', { team_name: 'Ferrari', year });
  }
  
  static async getDriverLaps(driverNumber, sessionKey) {
    return this.fetchWithCache('laps', { 
      driver_number: driverNumber, 
      session_key: sessionKey 
    });
  }
  
  static async getSession(sessionKey) {
    return this.fetchWithCache('sessions', { session_key: sessionKey });
  }
  
  static async getCircuitData(circuitKey, year = 2024) {
    return this.fetchWithCache('sessions', { 
      circuit_key: circuitKey, 
      year 
    });
  }
  
  static async getRaceControl(sessionKey) {
    return this.fetchWithCache('race_control', { session_key: sessionKey });
  }
  
  static async getWeather(sessionKey) {
    return this.fetchWithCache('weather', { session_key: sessionKey });
  }
  
  static async getTeamRadio(driverNumber, sessionKey) {
    return this.fetchWithCache('team_radio', { 
      driver_number: driverNumber, 
      session_key: sessionKey 
    });
  }
}
