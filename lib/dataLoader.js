// lib/dataLoader.js

let cachedData = null;
let isLoading = false;

export async function loadAllData() {
  // Se già caricato, restituisci
  if (cachedData) {
    console.log('📦 Using cached data');
    return cachedData;
  }
  
  // Se già in caricamento, aspetta
  if (isLoading) {
    console.log('⏳ Data loading already in progress...');
    await new Promise(resolve => setTimeout(resolve, 100));
    return loadAllData();
  }
  
  isLoading = true;
  console.log('🚀 Loading JSON data from public/data/...');
  
  try {
    // Lista dei file che hai
    const fileList = [
      'races.json',
      'results.json', 
      'drivers.json',
      'constructors.json',
      'driver_standings.json',
      'constructor_standings.json',
      'circuits.json',
      'qualifying.json',
      'ferrari_historical.json',
      'f1_2025_last_race_results.json'
    ];
    
    // Carica solo i file che esistono realmente
    const dataPromises = fileList.map(async (fileName) => {
      try {
        const response = await fetch(`/data/${fileName}`);
        if (!response.ok) {
          console.log(`⚠️ File not found: ${fileName}`);
          return { fileName, data: [], success: false };
        }
        const jsonData = await response.json();
        console.log(`✅ Loaded: ${fileName} (${jsonData.length} records)`);
        return { fileName, data: jsonData, success: true };
      } catch (error) {
        console.log(`❌ Error loading ${fileName}:`, error.message);
        return { fileName, data: [], success: false };
      }
    });
    
    const results = await Promise.all(dataPromises);
    
    // Crea l'oggetto dati
    cachedData = {};
    results.forEach(result => {
      const key = result.fileName.replace('.json', '');
      cachedData[key] = result.data;
    });
    
    // Stats
    console.log('📊 Data loaded successfully:');
    console.log(`   Races: ${cachedData.races?.length || 0}`);
    console.log(`   Drivers: ${cachedData.drivers?.length || 0}`);
    console.log(`   Results: ${cachedData.results?.length || 0}`);
    console.log(`   Driver Standings: ${cachedData.driver_standings?.length || 0}`);
    
    return cachedData;
    
  } catch (error) {
    console.error('💥 Critical error loading data:', error);
    // Restituisci struttura vuota ma valida
    return {
      races: [],
      results: [],
      drivers: [],
      constructors: [],
      driver_standings: [],
      constructor_standings: [],
      circuits: [],
      qualifying: [],
      ferrari_historical: [],
      f1_2025_last_race_results: []
    };
  } finally {
    isLoading = false;
  }
}

// Funzione helper per caricare dati specifici
export async function getSeasonData(year) {
  const data = await loadAllData();
  
  const seasonRaces = data.races.filter(race => {
    const raceYear = parseInt(race.year);
    return !isNaN(raceYear) && raceYear === parseInt(year);
  });
  
  return {
    races: seasonRaces,
    raceIds: seasonRaces.map(r => r.raceId),
    year: parseInt(year)
  };
}
