// lib/openf1/client.js
export class OpenF1Client {
  constructor() {
    this.baseUrl = 'https://api.openf1.org/v1';
    this.cache = new Map();
  }

  async fetch(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    try {
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`OpenF1 API Error: ${endpoint}`, error);
      throw error;
    }
  }

  async getCarData(driverNumber, sessionKey) {
    return this.fetch('car_data', { driver_number: driverNumber, session_key: sessionKey });
  }

  async getDrivers(sessionKey) {
    return this.fetch('drivers', { session_key: sessionKey });
  }

  async getWeather(sessionKey) {
    return this.fetch('weather', { session_key: sessionKey });
  }

  async getChampionshipDrivers(sessionKey) {
    return this.fetch('championship_drivers', { session_key: sessionKey });
  }

  async getChampionshipTeams(sessionKey) {
    return this.fetch('championship_teams', { session_key: sessionKey, team_name: 'Ferrari' });
  }
  async getLaps(driverNumber, sessionKey) {
  return this.fetch('laps', { 
    driver_number: driverNumber, 
    session_key: sessionKey 
  });
  }

  async getDriversChampionship(sessionKey, driverNumbers = []) {
    const params = { session_key: sessionKey };
    driverNumbers.forEach(num => {
      params[`driver_number`] = num;
    });
    return this.fetch('championship_drivers', params);
  }

  async getTeamsChampionship(sessionKey, teamName) {
    return this.fetch('championship_teams', {
      session_key: sessionKey,
      team_name: teamName
    });
  }
}