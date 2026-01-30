// lib/services/standingsService.js
import driverStandingsData from '../db/driver_standings.json';
import constructorStandingsData from '../db/constructor_standings.json';
import racesData from '../db/races.json';
import driversData from '../db/drivers.json';
import constructorsData from '../db/constructors.json';
import resultsData from '../db/results.json';

export function getDriverStandings(season) {
  console.log(`Fetching driver standings for season ${season}...`);
  
  try {
    // Filtra le gare della stagione (le year nei CSV sono stringhe)
    const seasonRaces = racesData.filter(race => race.year === season.toString());
    
    if (seasonRaces.length === 0) {
      console.warn(`No races found for season ${season}`);
      return getMockData(); // Fallback
    }
    
    const raceIds = seasonRaces.map(race => race.raceId);
    console.log(`Found ${raceIds.length} races for ${season}`);
    
    // ... resto del codice
  } catch (error) {
    console.error('Error in getDriverStandings:', error);
    return getMockData(); // Fallback a dati mock
  }
}

// Funzione di fallback
function getMockData() {
  return [
    { driverId: 1, forename: 'Max', surname: 'Verstappen', constructor: 'Red Bull Racing', points: 400 },
    { driverId: 2, forename: 'Lewis', surname: 'Hamilton', constructor: 'Mercedes', points: 285 },
  ];
}