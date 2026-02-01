import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

// codici ISO for flags
const countryToCode = {
  "UK": "gb", "Monaco": "mc", "USA": "us", "Switzerland": "ch", "Belgium": "be",
  "France": "fr", "Italy": "it", "Germany": "de", "Spain": "es", "Netherlands": "nl",
  "Argentina": "ar", "Portugal": "pt", "Morocco": "ma", "South Africa": "za",
  "Mexico": "mx", "Austria": "at", "Canada": "ca", "Sweden": "se", "Japan": "jp",
  "Brazil": "br", "Hungary": "hu", "Malaysia": "my", "Turkey": "tr", "Singapore": "sg",
  "UAE": "ae", "Korea": "kr", "India": "in", "Russia": "ru", "Azerbaijan": "az", "Qatar": "qa", "Saudi Arabia": "sa"
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
        loadJSON('/data/races.json'),
        loadJSON('/data/circuits.json'),
        loadJSON('/data/driver_standings.json'),
        loadJSON('/data/constructor_standings.json'),
        loadJSON('/data/drivers.json'),
        loadJSON('/data/constructors.json')
      ]);

      // 1. Trova info Gara
      const currentRace = racesData?.find(r => r.race_id === id);
      setRaceInfo(currentRace);

      if (currentRace) {
        // 2. Trova info Circuito
        const circuit = circuitsData?.find(c => c.circuit_id === currentRace.circuit_id);
        setCircuitInfo(circuit);

        // 3. Mappe nomi
        const drMap = {}; drData?.forEach(d => drMap[d.driver_id] = d);
        const coMap = {}; coData?.forEach(c => coMap[c.constructor_id] = c);
        setDrivers(drMap);
        setConstructors(coMap);

        // 4. Classifica Piloti dopo questo Round
        const drFiltered = drStData?.filter(s => 
          s.season === currentRace.season && s.round === currentRace.round
        ).sort((a, b) => (a.position || 99) - (b.position || 99));
        setDriverStandings(drFiltered || []);

        // 5. Classifica Costruttori dopo questo Round
        const coFiltered = coStData?.filter(s => 
          s.season === currentRace.season && s.round === currentRace.round
        ).sort((a, b) => (a.position || 99) - (b.position || 99));
        setConstructorStandings(coFiltered || []);
      }
      setLoading(false);
    }

    loadRaceData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-red-600 border-zinc-800 mb-4"></div>
      <span className="text-red-600 font-black tracking-widest animate-pulse">LOADING DATA...</span>
    </div>
  );

  if (!raceInfo) return <div className="min-h-screen bg-black text-white p-20 text-center font-bold">RACE DATA NOT FOUND.</div>;

  const countryCode = circuitInfo ? countryToCode[circuitInfo.country] : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation activeSection="calendar" />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <Link href="/standings" className="group flex items-center gap-2 text-zinc-500 font-black uppercase text-[10px] hover:text-red-600 transition-colors mb-10">
          <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Back to Standings
        </Link>

        {/* HEADER GARA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="text-red-600 font-black uppercase tracking-[0.3em] text-xs mb-3">
              Round {raceInfo.round} • Season {raceInfo.season}
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-6">
              {raceInfo.race_name}
            </h1>
            <div className="flex flex-wrap items-center gap-6">
               <div className="bg-zinc-900 border-l-4 border-red-600 px-4 py-2">
                  <span className="block text-[9px] text-zinc-500 font-black uppercase">Date</span>
                  <span className="text-lg font-bold italic">{raceInfo.date}</span>
               </div>
               {circuitInfo && (
                 <div className="flex items-center gap-3">
                    <img src={`https://flagcdn.com/w80/${countryCode}.png`} className="w-10 h-auto shadow-lg" alt="" />
                    <div>
                      <span className="block text-[9px] text-zinc-500 font-black uppercase">Location</span>
                      <span className="text-sm font-bold uppercase">{circuitInfo.locality}, {circuitInfo.country}</span>
                    </div>
                 </div>
               )}
            </div>
          </div>

          {/* MINI MAPPA */}
          <div className="relative h-64 lg:h-full min-h-[250px] bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800">
            {circuitInfo ? (
              <>
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight="0" 
                  marginWidth="0" 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${circuitInfo.long-0.02}%2C${circuitInfo.lat-0.01}%2C${circuitInfo.long+0.02}%2C${circuitInfo.lat+0.01}&layer=mapnik&marker=${circuitInfo.lat}%2C${circuitInfo.long}`}
                  className="grayscale invert opacity-50 contrast-125"
                ></iframe>
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md p-3 border-l-2 border-red-600">
                  <p className="text-[10px] font-black uppercase text-red-600 mb-1">{circuitInfo.name}</p>
                  <p className="text-[9px] text-zinc-400 font-mono tracking-tighter">LAT: {circuitInfo.lat} / LONG: {circuitInfo.long}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-700 font-black uppercase text-xs">Map Data Unavailable</div>
            )}
          </div>
        </div>

        {/* CLASSIFICHE */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          
          {/* DRIVER STANDINGS */}
          <section className="bg-zinc-900/40 border border-zinc-800 rounded-sm">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center gap-3">
              <div className="w-1 h-5 bg-red-600"></div>
              <h2 className="font-black uppercase tracking-widest text-xs">Driver Standings after GP</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-zinc-600 uppercase text-[9px] border-b border-zinc-800">
                    <th className="p-4 w-12">Pos</th>
                    <th className="p-4">Driver</th>
                    <th className="p-4">Team</th>
                    <th className="p-4 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {driverStandings.map((s, i) => {
                    const d = drivers[s.driver_id] || {};
                    const isFerrari = s.constructor_id === 'ferrari';
                    return (
                      <tr key={i} className={`border-b border-zinc-800/30 hover:bg-white/5 transition-colors ${isFerrari ? 'bg-red-600/5' : ''}`}>
                        <td className={`p-4 font-black italic ${i < 3 ? 'text-red-600' : 'text-zinc-500'}`}>
                          {s.position || 'NC'}
                        </td>
                        <td className={`p-4 font-bold ${isFerrari ? 'text-red-500' : ''}`}>
                          {d.givenName} {d.familyName?.toUpperCase()}
                        </td>
                        <td className="p-4 text-[10px] font-bold uppercase text-zinc-500">
                          {constructors[s.constructor_id]?.name || s.constructor_id}
                        </td>
                        <td className="p-4 text-right font-black">{s.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {driverStandings.length === 0 && <p className="p-10 text-center text-zinc-600 italic text-xs uppercase">No Driver Data</p>}
            </div>
          </section>

          {/* CONSTRUCTOR STANDINGS */}
          <section className="bg-zinc-900/40 border border-zinc-800 rounded-sm">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center gap-3">
              <div className="w-1 h-5 bg-red-600"></div>
              <h2 className="font-black uppercase tracking-widest text-xs">Constructor Standings after GP</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-zinc-600 uppercase text-[9px] border-b border-zinc-800">
                    <th className="p-4 w-12">Pos</th>
                    <th className="p-4">Constructor</th>
                    <th className="p-4 text-center">Wins</th>
                    <th className="p-4 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {constructorStandings.map((s, i) => {
                    const c = constructors[s.constructor_id] || {};
                    const isFerrari = s.constructor_id === 'ferrari';
                    return (
                      <tr key={i} className={`border-b border-zinc-800/30 hover:bg-white/5 transition-colors ${isFerrari ? 'bg-red-600/5' : ''}`}>
                        <td className={`p-4 font-black italic ${i < 3 ? 'text-red-600' : 'text-zinc-500'}`}>
                          {s.position || 'NC'}
                        </td>
                        <td className={`p-4 font-bold ${isFerrari ? 'text-red-500' : ''}`}>
                          {c.name?.toUpperCase() || s.constructor_id.toUpperCase()}
                        </td>
                        <td className="p-4 text-center font-mono text-zinc-500 text-xs">
                          {s.wins}
                        </td>
                        <td className="p-4 text-right font-black">{s.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {constructorStandings.length === 0 && <p className="p-10 text-center text-zinc-600 italic text-xs uppercase">No Constructor Data</p>}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
