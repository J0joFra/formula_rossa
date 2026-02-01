import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

export default function RaceDetailsPage() {
  const router = useRouter();
  const { id } = router.query; // Questo sarà un numero (es. 1125)

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
      setRaceInfo(currentRace);

      if (currentRace) {
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black">CARICAMENTO GP...</div>;
  if (!raceInfo) return <div className="min-h-screen bg-black text-white p-20 text-center font-bold">GARA NON TROVATA.</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation activeSection="calendar" />
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        
        <header className="mb-12">
          <div className="text-red-600 font-black uppercase text-xs mb-3">Round {raceInfo.round} • {raceInfo.year}</div>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-6">{raceInfo.officialName}</h1>
          <div className="flex gap-4">
            <div className="bg-zinc-900 border-l-4 border-red-600 p-3">
              <p className="text-[10px] text-zinc-500 font-black uppercase">Location</p>
              <p className="text-lg font-bold uppercase">{circuitInfo?.placeName}, {circuitInfo?.countryId}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Driver Standings Table */}
          <section className="bg-zinc-900/40 border border-zinc-800">
            <h2 className="p-4 font-black uppercase text-xs border-b border-zinc-800 text-red-600">Driver Standings after this race</h2>
            <table className="w-full text-left text-sm">
              <tbody>
                {driverStandings.map((s, i) => {
                  const d = drivers[s.driverId] || {};
                  return (
                    <tr key={i} className="border-b border-zinc-800/30 hover:bg-white/5 transition-colors">
                      <td className="p-4 w-12 font-black italic text-zinc-500">{s.positionText}</td>
                      <td className="p-4 font-bold text-white">{d.firstName} {d.lastName?.toUpperCase()}</td>
                      <td className="p-4 text-right font-black text-white">{s.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Constructor Standings Table */}
          <section className="bg-zinc-900/40 border border-zinc-800">
            <h2 className="p-4 font-black uppercase text-xs border-b border-zinc-800 text-red-600">Constructor Standings after this race</h2>
            <table className="w-full text-left text-sm">
              <tbody>
                {constructorStandings.map((s, i) => {
                  const c = constructors[s.constructorId] || {};
                  return (
                    <tr key={i} className="border-b border-zinc-800/30 hover:bg-white/5 transition-colors">
                      <td className="p-4 w-12 font-black italic text-zinc-500">{s.positionText}</td>
                      <td className="p-4 font-bold text-white">{c.name?.toUpperCase()}</td>
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