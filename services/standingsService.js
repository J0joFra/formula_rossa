// lib/services/standingsService.js
import races from '@/lib/db/races.json';
import results from '@/lib/db/results.json';
import drivers from '@/lib/db/drivers.json';

export function getDriverStandings(year) {
  // 1. Trova tutte le gare di quell'anno
  const seasonRaces = races.filter(r => r.year == year);
  const raceIds = seasonRaces.map(r => r.raceId);
  
  // 2. Filtra risultati per quelle gare
  const seasonResults = results.filter(r => raceIds.includes(r.raceId));
  
  // 3. Calcola punti per pilota
  const driverPoints = {};
  seasonResults.forEach(result => {
    const driverId = result.driverId;
    driverPoints[driverId] = (driverPoints[driverId] || 0) + parseInt(result.points);
  });
  
  // 4. Formatta per la tabella
  return Object.entries(driverPoints)
    .map(([driverId, points]) => ({
      driverId,
      forename: drivers.find(d => d.driverId == driverId)?.forename,
      surname: drivers.find(d => d.driverId == driverId)?.surname,
      points
    }))
    .sort((a, b) => b.points - a.points);
}