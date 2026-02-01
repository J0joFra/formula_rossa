import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

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
        setCircuitInfo(circuitsData?.find(c => c.id === currentRace.circuitId));
        
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black">LOADING GP DATA...</div>;
  if (!raceInfo) return <div className="min-h-screen bg-black text-white p-20 text-center font-bold uppercase">Race Not Found</div>;

  // Filtro per i primi 10 piloti
  const visibleDrivers = showFullDrivers ? driverStandings : driverStandings.slice(0, 10);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation activeSection="calendar" />
      
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <Link href="/standings" className="text-red-600 font-bold uppercase text-[10px] mb-8 inline-block hover:underline tracking-widest">
          ← Back to Standings
        </Link>
        
        <header className="mb-12">
          <div className="text-red-600 font-black uppercase text-xs mb-2 tracking-[0.2em]">
            Round {raceInfo.round} • {raceInfo.year}
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-10">
            {raceInfo.name || raceInfo.officialName}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Circuito con Bandiera */}
            <div className="bg-zinc-900 border-l-4 border-red-600 p-5 flex flex-col justify-center">
              <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Circuit & Location</p>
              <p className="text-xl font-bold uppercase mb-2">{circuitInfo?.name}</p>
              <div className="flex items-center gap-3">
                {circuitInfo?.countryId && (
                  <img 
                    src={`https://flagcdn.com/w40/${circuitInfo.countryId.toLowerCase()}.png`} 
                    className="w-6 h-auto shadow-sm" 
                    alt={circuitInfo.countryId} 
                  />
                )}
                <p className="text-sm text-zinc-400 uppercase font-bold">
                  {circuitInfo?.placeName}, {circuitInfo?.countryId}
                </p>
              </div>
            </div>

            {/* Card Mappa Geografica */}
            <div className="md:col-span-2 h-48 bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800 relative group">
              {circuitInfo?.latitude && (
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight="0" 
                  marginWidth="0" 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${circuitInfo.longitude-0.02}%2C${circuitInfo.latitude-0.01}%2C${circuitInfo.longitude+0.02}%2C${circuitInfo.latitude+0.01}&layer=mapnik&marker=${circuitInfo.latitude}%2C${circuitInfo.longitude}`}
                  className="grayscale invert opacity-40 group-hover:opacity-70 transition-opacity duration-500"
                ></iframe>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute bottom-4 right-4 bg-black/80 px-3 py-1 text-[10px] font-mono text-zinc-500 border border-zinc-800">
                GPS: {circuitInfo?.latitude}, {circuitInfo?.longitude}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Driver Standings con Tendina */}
          <section className="bg-zinc-900/40 border border-zinc-800 rounded-sm overflow-hidden h-fit">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center">
              <h2 className="font-black uppercase text-xs text-red-600 tracking-widest">Driver Standings</h2>
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Points after race</span>
            </div>
            <table className="w-full text-left text-sm">
              <tbody>
                {visibleDrivers.map((s, i) => (
                  <tr key={i} className="border-b border-zinc-800/30 hover:bg-white/5 transition-colors group">
                    <td className="p-4 w-12 font-black italic text-zinc-500 group-hover:text-red-600">{s.positionText}</td>
                    <td className="p-4">
                      <div className="font-bold text-white uppercase tracking-tight">
                        {drivers[s.driverId]?.firstName} <span className="text-red-600">{drivers[s.driverId]?.lastName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-black text-white">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {driverStandings.length > 10 && (
              <button 
                onClick={() => setShowFullDrivers(!showFullDrivers)}
                className="w-full py-4 bg-zinc-800/50 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300"
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
                {constructorStandings.map((s, i) => (
                  <tr key={i} className="border-b border-zinc-800/30 hover:bg-white/5 transition-colors group">
                    <td className="p-4 w-12 font-black italic text-zinc-500 group-hover:text-red-600">{s.positionText}</td>
                    <td className="p-4 font-bold text-white uppercase tracking-tight">{constructors[s.constructorId]?.name}</td>
                    <td className="p-4 text-right font-black text-white">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
