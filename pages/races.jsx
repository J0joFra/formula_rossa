import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

const convertCountryCode = (code3) => {
  const mapping = {
    'BHR': 'bh', 'SAU': 'sa', 'AUS': 'au', 'JPN': 'jp', 'CHN': 'cn',
    'USA': 'us', 'ITA': 'it', 'MCO': 'mc', 'ESP': 'es', 'CAN': 'ca',
    'AUT': 'at', 'GBR': 'gb', 'HUN': 'hu', 'BEL': 'be', 'NLD': 'nl',
    'AZE': 'az', 'SGP': 'sg', 'MEX': 'mx', 'BRA': 'br', 'QAT': 'qa',
    'ARE': 'ae', 'FRA': 'fr', 'DEU': 'de', 'PRT': 'pt', 'ZAF': 'za',
    'ARG': 'ar', 'CHE': 'ch', 'MAR': 'ma', 'SWE': 'se'
  };
  return mapping[code3?.toUpperCase()] || code3?.toLowerCase().slice(0, 2);
};

export default function RaceDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [raceInfo, setRaceInfo] = useState(null);
  const [circuitInfo, setCircuitInfo] = useState(null);
  const [raceResults, setRaceResults] = useState([]); 
  const [driverStandings, setDriverStandings] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [drivers, setDrivers] = useState({});
  const [constructors, setConstructors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFullResults, setShowFullResults] = useState(false);

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
      
      // Carichiamo tutti i file necessari
      const [racesData, circuitsData, resultsData, drStData, coStData, drData, coData] = await Promise.all([
        loadJSON('/data/f1db-races.json'),
        loadJSON('/data/f1db-circuits.json'),
        loadJSON('/data/f1db-races-race-results.json'), // <--- Controlla che il nome sia esatto
        loadJSON('/data/f1db-races-driver-standings.json'),
        loadJSON('/data/f1db-races-constructor-standings.json'),
        loadJSON('/data/f1db-drivers.json'),
        loadJSON('/data/f1db-constructors.json')
      ]);

      // TROVA LA GARA: Gestiamo sia l'ID numerico che il formato "Anno_Round"
      let currentRace = null;
      if (id.includes('_')) {
        const [year, round] = id.split('_');
        currentRace = racesData?.find(r => r.year === parseInt(year) && r.round === parseInt(round));
      } else {
        currentRace = racesData?.find(r => r.id === parseInt(id));
      }

      if (currentRace) {
        setRaceInfo(currentRace);
        setCircuitInfo(circuitsData?.find(c => c.id === currentRace.circuitId));
        
        const dMap = {}; drData?.forEach(d => dMap[d.id] = d);
        const cMap = {}; coData?.forEach(c => cMap[c.id] = c);
        setDrivers(dMap); setConstructors(cMap);

        // FILTRO RISULTATI GARA (Punti presi nel singolo GP: 25, 18, 15...)
        const gpResults = resultsData?.filter(r => r.raceId === currentRace.id)
                                     .sort((a, b) => (a.positionNumber || 99) - (b.positionNumber || 99));
        setRaceResults(gpResults || []);

        // CLASSIFICHE CAMPIONATO (Punti totali accumulati)
        setDriverStandings(drStData?.filter(s => s.raceId === currentRace.id).sort((a, b) => a.positionDisplayOrder - b.positionDisplayOrder));
        setConstructorStandings(coStData?.filter(s => s.raceId === currentRace.id).sort((a, b) => a.positionDisplayOrder - b.positionDisplayOrder));
      }
      setLoading(false);
    }
    loadRaceData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black tracking-widest animate-pulse italic text-2xl">LOADING GP DATA...</div>;
  if (!raceInfo) return <div className="min-h-screen bg-black text-white p-20 text-center font-bold">RACE NOT FOUND</div>;

  const flagCode = convertCountryCode(circuitInfo?.countryId);
  const visibleResults = showFullResults ? raceResults : raceResults.slice(0, 10);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation activeSection="calendar" />
      
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <Link href="/standings" className="text-zinc-500 font-bold uppercase text-[10px] mb-8 inline-block hover:text-red-600 transition-colors tracking-widest">
          ← Back to Standings
        </Link>
        
        <header className="mb-12">
          <div className="text-red-600 font-black uppercase text-xs mb-2 tracking-[0.2em]">Round {raceInfo.round} • {raceInfo.year}</div>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-10">{raceInfo.name}</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 bg-zinc-900/50 border-l-4 border-red-600 p-6 flex flex-col justify-center">
              <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 tracking-widest">Circuit</p>
              <p className="text-3xl font-black uppercase italic leading-none mb-2">{circuitInfo?.name}</p>
              <p className="text-sm text-zinc-400 font-bold uppercase">{circuitInfo?.placeName}, {circuitInfo?.countryId}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 flex items-center justify-center rounded-sm">
              <img src={`https://flagcdn.com/h80/${flagCode}.png`} className="h-16 w-auto shadow-2xl rounded-sm object-contain" alt={circuitInfo?.countryId} />
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 aspect-square overflow-hidden rounded-sm relative group">
              {circuitInfo?.latitude && (
                <iframe width="100%" height="100%" frameBorder="0" scrolling="no" 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${circuitInfo.longitude-0.008}%2C${circuitInfo.latitude-0.005}%2C${circuitInfo.longitude+0.008}%2C${circuitInfo.latitude+0.005}&layer=mapnik&marker=${circuitInfo.latitude}%2C${circuitInfo.longitude}`}
                  className="grayscale invert opacity-50 group-hover:opacity-100 transition-opacity duration-500"
                ></iframe>
              )}
            </div>
          </div>
        </header>

        {/* --- RISULTATI GARA (I punti presi oggi) --- */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden mb-20 shadow-2xl">
          <div className="p-5 border-b border-zinc-800 bg-red-600 flex justify-between items-center">
            <h2 className="font-black uppercase text-sm text-white tracking-widest italic">Race Results</h2>
            <span className="text-[10px] text-white font-black uppercase">Points awarded this GP</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-zinc-500 uppercase text-[10px] border-b border-zinc-800 bg-black/40">
                  <th className="p-4 w-16 text-center">Pos</th>
                  <th className="p-4">Driver</th>
                  <th className="p-4">Constructor</th>
                  <th className="p-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {raceResults.length > 0 ? visibleResults.map((res, i) => {
                  const d = drivers[res.driverId] || {};
                  const isFerrari = res.constructorId === 'ferrari';
                  return (
                    <tr key={i} className={`border-b border-zinc-800/30 hover:bg-white/5 transition-colors ${isFerrari ? 'bg-red-600/5' : ''}`}>
                      <td className={`p-4 font-black italic text-center ${i < 3 ? 'text-red-600 text-xl' : 'text-zinc-500'}`}>
                        {res.positionNumber || 'NC'}
                      </td>
                      <td className={`p-4 font-bold ${isFerrari ? 'text-red-500' : 'text-white'}`}>
                        {d.firstName} <span className="uppercase">{d.lastName}</span>
                      </td>
                      <td className="p-4 text-[10px] font-bold uppercase text-zinc-500">
                        {constructors[res.constructorId]?.name || res.constructorId}
                      </td>
                      <td className="p-4 text-right font-black text-red-600 text-lg">
                        {res.points > 0 ? `+${res.points}` : '0'}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="4" className="p-10 text-center text-zinc-600 font-bold uppercase">No results data available for this race</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {raceResults.length > 10 && (
            <button onClick={() => setShowFullResults(!showFullResults)} className="w-full py-4 bg-zinc-800/50 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">
              {showFullResults ? "↑ Show Top 10" : `↓ Show Full Classification (${raceResults.length} drivers)`}
            </button>
          )}
        </section>

        {/* --- CHAMPIONSHIP STANDINGS (Totale punti accumulati) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 opacity-60 hover:opacity-100 transition-opacity">
           {/* ... (Qui lasciamo le tabelle precedenti del campionato mondale) ... */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
