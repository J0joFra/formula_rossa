import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

// Mappa dei codici paese F1 a ISO 3166-1 alpha-2
const countryCodeToFlag = {
  'ARE': 'ae', 'ARG': 'ar', 'AUS': 'au', 'AUT': 'at', 'AZE': 'az',
  'BHR': 'bh', 'BEL': 'be', 'BRA': 'br', 'CAN': 'ca', 'CHN': 'cn',
  'DEU': 'de', 'ESP': 'es', 'FRA': 'fr', 'GBR': 'gb', 'HUN': 'hu',
  'ITA': 'it', 'JPN': 'jp', 'MCO': 'mc', 'MEX': 'mx', 'NLD': 'nl',
  'PRT': 'pt', 'QAT': 'qa', 'RUS': 'ru', 'SAU': 'sa', 'SGP': 'sg',
  'TUR': 'tr', 'USA': 'us', 'ZAF': 'za', 'CHE': 'ch', 'MAR': 'ma',
  'SWE': 'se', 'KOR': 'kr', 'IND': 'in', 'MYS': 'my',
  
  // Codici alternativi/vecchi
  'GER': 'de', 'UK': 'gb', 'GB': 'gb', 'ENG': 'gb', 'UAE': 'ae',
  'SUI': 'ch', 'RSA': 'za', 'UAE': 'ae', 'KSA': 'sa'
};

// Funzione per convertire codice paese F1 in codice bandiera
const getFlagCodeFromCountry = (countryCode) => {
  if (!countryCode) return '';
  
  const upperCode = countryCode.toUpperCase();
  
  // Cerca corrispondenza diretta
  if (countryCodeToFlag[upperCode]) {
    return countryCodeToFlag[upperCode];
  }
  
  // Se è già un codice a 2 lettere, usalo direttamente
  if (countryCode.length === 2) {
    return countryCode.toLowerCase();
  }
  
  // Fallback: usa le prime 2 lettere
  return countryCode.slice(0, 2).toLowerCase();
};

export default function RaceDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [raceInfo, setRaceInfo] = useState(null);
  const [circuitInfo, setCircuitInfo] = useState(null);
  const [driverStandings, setDriverStandings] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [drivers, setDrivers] = useState({});
  const [constructors, setConstructors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFullDrivers, setShowFullDrivers] = useState(false);

  async function loadJSON(path) {
    try {
      const response = await fetch(path);
      return response.ok ? await response.json() : null;
    } catch { return null; }
  }

  useEffect(() => {
    if (!id) return;
    async function loadRaceData() {
      setLoading(true);
      const [racesData, circuitsData, drStData, coStData, drData, coData] = await Promise.all([
        loadJSON('/data/f1db-races.json'),
        loadJSON('/data/f1db-circuits.json'),
        loadJSON('/data/f1db-races-driver-standings.json'),
        loadJSON('/data/f1db-races-constructor-standings.json'),
        loadJSON('/data/f1db-drivers.json'),
        loadJSON('/data/f1db-constructors.json')
      ]);

      const currentRace = racesData?.find(r => r.id === parseInt(id));
      if (currentRace) {
        setRaceInfo(currentRace);
        const circuit = circuitsData?.find(c => c.id === currentRace.circuitId);
        setCircuitInfo(circuit);
        
        const dMap = {}; drData?.forEach(d => dMap[d.id] = d);
        const cMap = {}; coData?.forEach(c => cMap[c.id] = c);
        setDrivers(dMap); setConstructors(cMap);

        setDriverStandings(drStData?.filter(s => s.raceId === currentRace.id).sort((a, b) => a.positionDisplayOrder - b.positionDisplayOrder));
        setConstructorStandings(coStData?.filter(s => s.raceId === currentRace.id).sort((a, b) => a.positionDisplayOrder - b.positionDisplayOrder));
      }
      setLoading(false);
    }
    loadRaceData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black tracking-widest">LOADING...</div>;
  if (!raceInfo) return <div className="min-h-screen bg-black text-white p-20 text-center font-bold">RACE NOT FOUND</div>;

  const flagCode = getFlagCodeFromCountry(circuitInfo?.countryId);
  const visibleDrivers = showFullDrivers ? driverStandings : driverStandings.slice(0, 10);

  // Funzione per controllare se è un pilota/scuderia Ferrari
  const isFerrari = (constructorId) => {
    const constructorName = constructors[constructorId]?.name?.toLowerCase();
    return constructorName?.includes('ferrari') || false;
  };

  const getConstructorName = (constructorId) => {
    return constructors[constructorId]?.name || '';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation activeSection="calendar" />
      
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <Link href="/standings" className="text-zinc-500 font-bold uppercase text-[10px] mb-8 inline-block hover:text-red-600 transition-colors tracking-widest">
          ← Back to Standings
        </Link>
        
        <header className="mb-12">
          <div className="text-red-600 font-black uppercase text-xs mb-2 tracking-[0.2em]">
            Round {raceInfo.round} • {raceInfo.year}
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-10">
            {raceInfo.name || raceInfo.officialName}
          </h1>

          {/* Nuovo Layout Header a 3 Blocchi */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Blocco 1: Info Circuito (Occupa 2 colonne) */}
            <div className="md:col-span-2 bg-zinc-900/50 border-l-4 border-red-600 p-6 flex flex-col justify-center">
              <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 tracking-widest">Circuit</p>
              <p className="text-3xl font-black uppercase italic leading-none mb-2">{circuitInfo?.name}</p>
              <p className="text-sm text-zinc-400 font-bold uppercase">{circuitInfo?.placeName}, {circuitInfo?.countryId}</p>
            </div>

            {/* Blocco 2: Bandiera */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 flex items-center justify-center rounded-sm">
              {flagCode ? (
                <img 
                  src={`https://flagcdn.com/h80/${flagCode}.png`} 
                  className="h-16 w-auto shadow-2xl rounded-sm object-contain" 
                  alt={circuitInfo?.countryId}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://flagcdn.com/h80/${circuitInfo?.countryId?.slice(0, 2).toLowerCase() || 'xx'}.png`;
                  }}
                />
              ) : (
                <div className="text-zinc-500 text-sm font-bold">No Flag</div>
              )}
            </div>

            {/* Blocco 3: Mappa Piccola Quadrata */}
            <div className="bg-zinc-900/50 border border-zinc-800 aspect-square overflow-hidden rounded-sm relative group">
              {circuitInfo?.latitude && (
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${circuitInfo.longitude-0.008}%2C${circuitInfo.latitude-0.005}%2C${circuitInfo.longitude+0.008}%2C${circuitInfo.latitude+0.005}&layer=mapnik&marker=${circuitInfo.latitude}%2C${circuitInfo.longitude}`}
                  className="grayscale invert opacity-50 group-hover:opacity-100 transition-opacity duration-500"
                  title={`Map of ${circuitInfo?.name}`}
                ></iframe>
              )}
              <div className="absolute inset-0 pointer-events-none border border-white/5"></div>
            </div>

          </div>
        </header>

        {/* Sezione Classifiche */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Driver Standings con Tendina */}
          <section className="bg-zinc-900/40 border border-zinc-800 rounded-sm overflow-hidden h-fit">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center">
              <h2 className="font-black uppercase text-xs text-red-600 tracking-widest">Driver Standings</h2>
            </div>
            <table className="w-full text-left text-sm">
              <tbody>
                {visibleDrivers.map((s, i) => {
                  const isFerrariDriver = isFerrari(s.constructorId);
                  const constructorName = getConstructorName(s.constructorId);
                  return (
                    <tr key={i} className="border-b border-zinc-800/30 hover:bg-white/5 transition-colors group">
                      <td className="p-4 w-12 font-black italic text-zinc-500 group-hover:text-red-600">
                        {s.positionText}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <div className={`font-bold uppercase tracking-tight ${isFerrariDriver ? 'text-[#ff2800]' : 'text-white'}`}>
                            {drivers[s.driverId]?.firstName} <span className={`${isFerrariDriver ? 'text-[#ff2800]' : 'text-red-600'}`}>
                              {drivers[s.driverId]?.lastName}
                            </span>
                          </div>
                          <div className={`text-xs font-bold uppercase mt-1 ${isFerrariDriver ? 'text-[#ff2800]' : 'text-zinc-400'}`}>
                            {constructorName}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {driverStandings.length > 10 && (
              <button 
                onClick={() => setShowFullDrivers(!showFullDrivers)}
                className="w-full py-4 bg-zinc-800/50 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
              >
                {showFullDrivers ? "↑ Show Top 10" : `↓ Show All ${driverStandings.length} Drivers`}
              </button>
            )}
          </section>

          {/* Constructor Standings */}
          <section className="bg-zinc-900/40 border border-zinc-800 rounded-sm h-fit">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80">
              <h2 className="font-black uppercase text-xs text-red-600 tracking-widest">Constructor Standings</h2>
            </div>
            <table className="w-full text-left text-sm">
              <tbody>
                {constructorStandings.map((s, i) => {
                  const isFerrariConstructor = isFerrari(s.constructorId);
                  return (
                    <tr key={i} className="border-b border-zinc-800/30 hover:bg-white/5 transition-colors group">
                      <td className="p-4 w-12 font-black italic text-zinc-500 group-hover:text-red-600">
                        {s.positionText}
                      </td>
                      <td className={`p-4 font-bold uppercase tracking-tight ${isFerrariConstructor ? 'text-[#ff2800]' : 'text-white'}`}>
                        {constructors[s.constructorId]?.name}
                      </td>
                      <td className="p-4 text-right font-black text-white">{s.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
