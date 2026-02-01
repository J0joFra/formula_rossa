import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

export default function RaceDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [raceInfo, setRaceInfo] = useState(null);
  const [standings, setStandings] = useState([]);
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
      const [racesData, drStData, drData, coData] = await Promise.all([
        loadJSON('/data/races.json'),
        loadJSON('/data/driver_standings.json'),
        loadJSON('/data/drivers.json'),
        loadJSON('/data/constructors.json')
      ]);

      const currentRace = racesData?.find(r => r.race_id === id);
      setRaceInfo(currentRace);

      const drMap = {}; drData?.forEach(d => drMap[d.driver_id] = d);
      const coMap = {}; coData?.forEach(c => coMap[c.constructor_id] = c);
      setDrivers(drMap);
      setConstructors(coMap);

      if (currentRace) {
        const filtered = drStData?.filter(s => 
          s.season === currentRace.season && s.round === currentRace.round
        ).sort((a, b) => (a.position || 99) - (b.position || 99));
        setStandings(filtered || []);
      }
      setLoading(false);
    }

    loadRaceData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black">LOADING GP DATA...</div>;
  if (!raceInfo) return <div className="min-h-screen bg-black text-white p-20 text-center">Race ID not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation activeSection="calendar" />

      <main className="max-w-5xl mx-auto px-4 pt-32 pb-20">
        <Link href="/standings" className="text-red-600 font-bold uppercase text-xs hover:underline mb-8 inline-block">
          ← Back to Standings
        </Link>

        <header className="mb-12">
          <div className="text-red-600 font-black uppercase tracking-[0.2em] text-sm mb-2">
            Round {raceInfo.round} • Season {raceInfo.season}
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
            {raceInfo.race_name}
          </h1>
          <div className="mt-4 flex items-center gap-4 text-zinc-500 font-bold uppercase text-xs">
            <span>Date: {raceInfo.date}</span>
            <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
            <span>Circuit: {raceInfo.circuit_id.replace(/_/g, ' ')}</span>
          </div>
        </header>

        <section className="bg-zinc-900/40 border border-zinc-800 rounded-sm">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/80">
            <h2 className="font-black uppercase tracking-widest text-sm text-red-600">World Championship Standings after this GP</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-zinc-600 uppercase text-[10px] border-b border-zinc-800">
                <th className="p-4 w-16">Pos</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Constructor</th>
                <th className="p-4 text-right">Points</th>
                <th className="p-4 text-right">Wins</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => {
                const d = drivers[s.driver_id] || {};
                const isFerrari = s.constructor_id === 'ferrari';
                return (
                  <tr key={i} className={`border-b border-zinc-800/30 ${isFerrari ? 'bg-red-600/10' : ''}`}>
                    <td className={`p-4 font-black italic ${i < 3 ? 'text-red-600' : 'text-zinc-500'}`}>
                      {s.position || 'NC'}
                    </td>
                    <td className={`p-4 font-bold ${isFerrari ? 'text-red-500' : ''}`}>
                      {d.givenName} {d.familyName?.toUpperCase()}
                    </td>
                    <td className="p-4 text-[10px] font-bold uppercase text-zinc-400">
                      {constructors[s.constructor_id]?.name || s.constructor_id}
                    </td>
                    <td className="p-4 text-right font-black">{s.points}</td>
                    <td className="p-4 text-right font-mono text-zinc-600">{s.wins}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>
      <Footer />
    </div>
  );
}
