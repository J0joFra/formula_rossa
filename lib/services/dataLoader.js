// services/dataLoader.js

class DataLoader {
  constructor() {
    this.cache = {
      drivers: null,
      constructors: null,
      races: null,
      driverStandings: null,
      constructorStandings: null,
      circuits: null,
      qualifying: null,
      lastRaceResults: null,
      ferrariHistorical: null
    };
    
    this.loading = false;
    this.loaded = false;
  }

  async loadAllData() {
    if (this.loading) {
      console.log('⏳ Data loading already in progress...');
      return this.cache;
    }

    if (this.loaded) {
      console.log('📦 Using cached data');
      return this.cache;
    }

    this.loading = true;
    console.log('🚀 Loading JSON data from public/data/...');

    try {
      // Carica tutti i file in parallelo
      const [
        drivers,
        constructors,
        races,
        driverStandings,
        constructorStandings,
        circuits,
        qualifying,
        lastRaceResults
      ] = await Promise.all([
        this.loadJSON('/data/drivers.json'),
        this.loadJSON('/data/constructors.json'),
        this.loadJSON('/data/races.json'),
        this.loadJSON('/data/driver_standings.json'),
        this.loadJSON('/data/constructor_standings.json'),
        this.loadJSON('/data/circuits.json'),
        this.loadJSON('/data/qualifying.json'),
        this.loadJSON('/data/f1_2025_last_race_results.json')
      ]);

      // Salva in cache
      this.cache.drivers = drivers || [];
      this.cache.constructors = constructors || [];
      this.cache.races = races || [];
      this.cache.driverStandings = driverStandings || [];
      this.cache.constructorStandings = constructorStandings || [];
      this.cache.circuits = circuits || [];
      this.cache.qualifying = qualifying || [];
      this.cache.lastRaceResults = lastRaceResults || [];

      // Log risultati
      console.log('📊 Data loaded successfully:');
      console.log('   Drivers:', this.cache.drivers.length);
      console.log('   Constructors:', this.cache.constructors.length);
      console.log('   Races:', this.cache.races.length);
      console.log('   Driver Standings:', this.cache.driverStandings.length);
      console.log('   Constructor Standings:', this.cache.constructorStandings.length);
      console.log('   Circuits:', this.cache.circuits.length);

      this.loaded = true;
      return this.cache;

    } catch (error) {
      console.error('❌ Error loading data:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async loadJSON(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        console.warn(`⚠️ File not found: ${path}`);
        return null;
      }
      const data = await response.json();
      return Array.isArray(data) ? data : null;
    } catch (error) {
      console.error(`❌ Error loading ${path}:`, error.message);
      return null;
    }
  }

  // Ottieni driver con dettagli completi
  getDriverDetails(driverId) {
    const driver = this.cache.drivers.find(d => d.driver_id === driverId);
    return driver || { 
      driver_id: driverId, 
      givenName: 'Unknown', 
      familyName: 'Driver' 
    };
  }

  // Ottieni constructor con dettagli completi
  getConstructorDetails(constructorId) {
    const constructor = this.cache.constructors.find(c => c.constructor_id === constructorId);
    return constructor || { 
      constructor_id: constructorId, 
      name: 'Unknown Team' 
    };
  }

  // Ottieni classifica piloti per una stagione
  getDriverStandings(season = 2025) {
    if (!this.cache.driverStandings) return [];

    // Filtra per stagione
    let standings = this.cache.driverStandings.filter(s => s.season === season);
    
    if (standings.length === 0) {
      console.warn(`⚠️ No driver standings found for season ${season}`);
      return [];
    }

    // Prendi solo l'ultimo round della stagione
    const maxRound = Math.max(...standings.map(s => s.round));
    standings = standings.filter(s => s.round === maxRound);

    // Arricchisci con i dettagli del pilota
    const enrichedStandings = standings.map(standing => {
      const driver = this.getDriverDetails(standing.driver_id);
      const constructor = this.getConstructorDetails(
        this.getDriverConstructor(standing.driver_id, season)
      );

      return {
        ...standing,
        driver: {
          id: driver.driver_id,
          givenName: driver.givenName,
          familyName: driver.familyName,
          nationality: driver.nationality
        },
        constructor: {
          id: constructor.constructor_id,
          name: constructor.name
        }
      };
    });

    // Ordina per posizione
    return enrichedStandings.sort((a, b) => a.position - b.position);
  }

  // Ottieni classifica costruttori per una stagione
  getConstructorStandings(season = 2025) {
    if (!this.cache.constructorStandings) return [];

    // Filtra per stagione
    let standings = this.cache.constructorStandings.filter(s => s.season === season);
    
    if (standings.length === 0) {
      console.warn(`⚠️ No constructor standings found for season ${season}`);
      return [];
    }

    // Prendi solo l'ultimo round della stagione
    const maxRound = Math.max(...standings.map(s => s.round));
    standings = standings.filter(s => s.round === maxRound);

    // Arricchisci con i dettagli del costruttore
    const enrichedStandings = standings.map(standing => {
      const constructor = this.getConstructorDetails(standing.constructor_id);

      return {
        ...standing,
        constructor: {
          id: constructor.constructor_id,
          name: constructor.name,
          nationality: constructor.nationality
        }
      };
    });

    // Filtra quelli con position valida e ordina
    return enrichedStandings
      .filter(s => s.position !== null)
      .sort((a, b) => a.position - b.position);
  }

  // Trova il team di un pilota in una stagione
  getDriverConstructor(driverId, season) {
    // Cerca nei risultati delle gare della stagione
    const raceResults = this.cache.lastRaceResults || [];
    const result = raceResults.find(r => r.driver_id === driverId);
    return result?.constructor_id || 'unknown';
  }

  // Ottieni risultati ultima gara
  getLastRaceResults() {
    if (!this.cache.lastRaceResults || this.cache.lastRaceResults.length === 0) {
      return [];
    }

    return this.cache.lastRaceResults.map(result => {
      const driver = this.getDriverDetails(result.driver_id);
      const constructor = this.getConstructorDetails(result.constructor_id);

      return {
        ...result,
        driver: {
          id: driver.driver_id,
          givenName: driver.givenName,
          familyName: driver.familyName
        },
        constructor: {
          id: constructor.constructor_id,
          name: constructor.name
        }
      };
    }).sort((a, b) => (a.position || 99) - (b.position || 99));
  }
}

// Crea istanza singleton
const dataLoader = new DataLoader();

export default dataLoader;
