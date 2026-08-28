// lib/services/standingsService.js 
import { loadAllData, getSeasonData } from '../dataLoader';

// 1. CLASSIFICA PILOTI (REALE)
export async function getDriverStandings(season) {
  console.log(`🏎️ Loading REAL driver standings for ${season}...`);
  
  try {
    // Carica tutti i dati
    const allData = await loadAllData();
    const seasonData = await getSeasonData(season);
    
    // Controlla se abbiamo dati
    if (!allData.driver_standings || allData.driver_standings.length === 0) {
      console.log('📭 No driver standings data available, using mock');
      return getMockDriverStandings(season);
    }
    
    if (seasonData.races.length === 0) {
      console.log(`📭 No races found for ${season}, using mock`);
      return getMockDriverStandings(season);
    }
    
    // Filtra le classifiche per le gare di questa stagione
    const relevantStandings = allData.driver_standings.filter(standing => 
      seasonData.raceIds.includes(standing.raceId)
    );
    
    console.log(`📊 Found ${relevantStandings.length} standings records for ${season}`);
    
    // Raggruppa per pilota (prendi l'ultima/migliore posizione)
    const driverStandingsMap = new Map();
    
    relevantStandings.forEach(standing => {
      const driverId = standing.driverId;
      const points = parseInt(standing.points) || 0;
      const currentBest = driverStandingsMap.get(driverId);
      
      if (!currentBest || points > currentBest.points) {
        driverStandingsMap.set(driverId, {
          driverId,
          points,
          wins: parseInt(standing.wins) || 0,
          position: parseInt(standing.position) || 999,
          raceId: standing.raceId
        });
      }
    });
    
    // Converti in array e arricchisci con info pilota
    const standings = Array.from(driverStandingsMap.values())
      .map(standing => {
        // Trova info pilota
        const driver = allData.drivers.find(d => d.driverId === standing.driverId);
        
        // Trova il team dalla gara più recente
        const raceResult = allData.results?.find(r => 
          r.raceId === standing.raceId && r.driverId === standing.driverId
        ) || {};
        
        // Trova nome team
        let constructorName = "Unknown";
        if (raceResult.constructorId) {
          const constructor = allData.constructors?.find(c => 
            c.constructorId === raceResult.constructorId
          );
          constructorName = constructor ? constructor.name : "Unknown";
        }
        
        return {
          driverId: standing.driverId,
          forename: driver?.forename || "Unknown",
          surname: driver?.surname || "Driver",
          nationality: driver?.nationality || "",
          constructor: constructorName,
          points: standing.points,
          wins: standing.wins,
          position: standing.position
        };
      })
      .filter(driver => driver.points > 0) // Solo piloti con punti
      .sort((a, b) => b.points - a.points)
      .slice(0, 25); // Top 25
    
    console.log(`✅ Processed ${standings.length} real drivers for ${season}`);
    
    // Se non abbiamo dati reali, usa mock
    if (standings.length === 0) {
      console.log('📭 No real standings found, using mock data');
      return getMockDriverStandings(season);
    }
    
    return standings;
    
  } catch (error) {
    console.error('❌ Error getting real driver standings:', error);
    return getMockDriverStandings(season);
  }
}

// 2. CLASSIFICA COSTRUTTORI (REALE)
export async function getConstructorStandings(season) {
  console.log(`🏭 Loading REAL constructor standings for ${season}...`);
  
  try {
    const allData = await loadAllData();
    const seasonData = await getSeasonData(season);
    
    if (!allData.constructor_standings || allData.constructor_standings.length === 0) {
      console.log('📭 No constructor standings data, using mock');
      return getMockConstructorStandings(season);
    }
    
    // Filtra per stagione
    const relevantStandings = allData.constructor_standings.filter(standing => 
      seasonData.raceIds.includes(standing.raceId)
    );
    
    // Raggruppa per costruttore
    const constructorMap = new Map();
    
    relevantStandings.forEach(standing => {
      const constructorId = standing.constructorId;
      const points = parseInt(standing.points) || 0;
      const currentBest = constructorMap.get(constructorId);
      
      if (!currentBest || points > currentBest.points) {
        constructorMap.set(constructorId, {
          constructorId,
          points,
          wins: parseInt(standing.wins) || 0,
          position: parseInt(standing.position) || 999
        });
      }
    });
    
    // Converti e arricchisci
    const standings = Array.from(constructorMap.values())
      .map(standing => {
        const constructor = allData.constructors?.find(c => 
          c.constructorId === standing.constructorId
        );
        
        return {
          constructorId: standing.constructorId,
          name: constructor?.name || `Team ${standing.constructorId}`,
          nationality: constructor?.nationality || "",
          points: standing.points,
          wins: standing.wins,
          position: standing.position
        };
      })
      .filter(team => team.points > 0)
      .sort((a, b) => b.points - a.points);
    
    console.log(`✅ Processed ${standings.length} real constructors for ${season}`);
    
    return standings.length > 0 ? standings : getMockConstructorStandings(season);
    
  } catch (error) {
    console.error('❌ Error getting real constructor standings:', error);
    return getMockConstructorStandings(season);
  }
}

// 3. FUNZIONI MOCK come fallback (solo se non ci sono dati reali)
function getMockDriverStandings(season) {
  console.log(`🔄 Using MOCK driver data for ${season}`);
  
  const mockData = {
    2025: [
      { driverId: 1, forename: 'Max', surname: 'Verstappen', constructor: 'Red Bull Racing', points: 400, wins: 8 },
      { driverId: 2, forename: 'Lewis', surname: 'Hamilton', constructor: 'Mercedes', points: 285, wins: 2 },
      { driverId: 3, forename: 'Charles', surname: 'Leclerc', constructor: 'Ferrari', points: 270, wins: 3 },
    ],
    2024: [
      { driverId: 1, forename: 'Max', surname: 'Verstappen', constructor: 'Red Bull Racing', points: 380, wins: 7 },
      { driverId: 2, forename: 'Lewis', surname: 'Hamilton', constructor: 'Mercedes', points: 275, wins: 3 },
      { driverId: 3, forename: 'Charles', surname: 'Leclerc', constructor: 'Ferrari', points: 260, wins: 2 },
    ],
    2023: [
      { driverId: 1, forename: 'Max', surname: 'Verstappen', constructor: 'Red Bull Racing', points: 350, wins: 6 },
      { driverId: 2, forename: 'Lewis', surname: 'Hamilton', constructor: 'Mercedes', points: 265, wins: 3 },
      { driverId: 3, forename: 'Charles', surname: 'Leclerc', constructor: 'Ferrari', points: 245, wins: 2 },
    ]
  };
  
  return mockData[season] || mockData[2025];
}

function getMockConstructorStandings(season) {
  console.log(`🔄 Using MOCK constructor data for ${season}`);
  
  const mockData = {
    2025: [
      { constructorId: 1, name: 'Red Bull Racing', points: 650, wins: 12 },
      { constructorId: 2, name: 'Ferrari', points: 500, wins: 5 },
      { constructorId: 3, name: 'Mercedes', points: 480, wins: 3 },
    ],
    2024: [
      { constructorId: 1, name: 'Red Bull Racing', points: 600, wins: 10 },
      { constructorId: 2, name: 'Ferrari', points: 480, wins: 4 },
      { constructorId: 3, name: 'Mercedes', points: 460, wins: 3 },
    ]
  };
  
  return mockData[season] || mockData[2025];
}

// 4. OTTIENI STAGIONI DISPONIBILI (REALI)
export async function getAvailableSeasons() {
  try {
    const data = await loadAllData();
    
    if (!data.races || data.races.length === 0) {
      return [2025, 2024, 2023]; // Fallback
    }
    
    // Estrai tutti gli anni unici dalle gare
    const years = [...new Set(data.races
      .map(race => parseInt(race.year))
      .filter(year => !isNaN(year) && year > 1950)
    )].sort((a, b) => b - a); // Ordine decrescente
    
    console.log(`📅 Found ${years.length} seasons:`, years.slice(0, 5));
    return years.length > 0 ? years.slice(0, 10) : [2025, 2024, 2023];
    
  } catch (error) {
    console.error('Error getting seasons:', error);
    return [2025, 2024, 2023];
  }
}
