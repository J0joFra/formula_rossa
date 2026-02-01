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

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation activeSection="calendar" />
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <Link href="/standings" className="text-red-600 font-bold uppercase text-[10px] mb-8 inline-block hover:underline">← Back to Standings</Link>
        
        <header className="mb-12">
          <div className="text-red-600 font-black uppercase text-xs mb-2">Round {raceInfo.round} • {raceInfo.year}</div>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-6">{raceInfo.name || raceInfo.officialName}</h1>
          <div className="flex flex-wrap gap-4">
            <div className="bg-zinc-900 border-l-4 border-red-600 p-4">
              <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Circuit</p>
              <p className="text-xl font-bold uppercase">{circuitInfo?.name}</p>
              <p className="text-xs text-zinc-500 uppercase">{circuitInfo?.placeName}, {circuitInfo?.countryId}</p>
            </div>
            {circuitInfo?.latitude && (
               <div className="bg-zinc-900 border-l-4 border-zinc-700 p-4">
                  <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Coordinates</p>
                  <p className="text-sm font-mono text-zinc-300">{circuitInfo.latitude}N, {circuitInfo.longitude}E</p>
               </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <section className="bg-zinc-900/40 border border-zinc-800">
            <h2 className="p-4 font-black uppercase text-xs border-b border-zinc-800 text-red-600 tracking-widest">Driver Standings</h2>
            <table className="w-full text-left text-sm">
              <tbody>
                {driverStandings.map((s, i) => (
                  <tr key={i} className="border-b border-zinc-800/30 hover:bg-white/5">
                    <td className="p-4 w-12 font-black italic text-zinc-500">{s.positionText}</td>
                    <td className="p-4 font-bold">{drivers[s.driverId]?.firstName} {drivers[s.driverId]?.lastName?.toUpperCase()}</td>
                    <td className="p-4 text-right font-black">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="bg-zinc-900/40 border border-zinc-800">
            <h2 className="p-4 font-black uppercase text-xs border-b border-zinc-800 text-red-600 tracking-widest">Constructor Standings</h2>
            <table className="w-full text-left text-sm">
              <tbody>
                {constructorStandings.map((s, i) => (
                  <tr key={i} className="border-b border-zinc-800/30 hover:bg-white/5">
                    <td className="p-4 w-12 font-black italic text-zinc-500">{s.positionText}</td>
                    <td className="p-4 font-bold">{constructors[s.constructorId]?.name?.toUpperCase()}</td>
                    <td className="p-4 text-right font-black">{s.points}</td>
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
