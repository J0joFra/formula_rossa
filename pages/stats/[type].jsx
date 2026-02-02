import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';
import { motion } from 'framer-motion';

export default function StatDetail() {
  const router = useRouter();
  const { type } = router.query;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mappa dei titoli e delle logiche
  const config = {
    'wins': { title: 'Vittorie GP', filter: (r) => r.positionNumber === 1 },
    'podiums': { title: 'Podi Totali', filter: (r) => r.positionNumber >= 1 && r.positionNumber <= 3 },
    'poles': { title: 'Pole Positions', filter: (r) => r.gridPositionNumber === 1 },
    'fastest-laps': { title: 'Giri Veloci', filter: (r) => r.fastestLap === true },
    'points': { title: 'Punti Storici', filter: (r) => r.points > 0, isSum: true },
    'grand-slams': { title: 'Grand Slams', filter: (r) => r.grandSlam === true },
  };

  useEffect(() => {
    if (!type || !config[type]) return;

    async function processStats() {
      setLoading(true);
      try {
        const [resResults, resDrivers] = await Promise.all([
          fetch('/data/f1db-races-race-results.json'),
          fetch('/data/f1db-drivers.json')
        ]);
        
        const results = await resResults.json();
        const drivers = await resDrivers.json();
        const driverMap = {};
        drivers.forEach(d => driverMap[d.id] = `${d.firstName} ${d.lastName}`);

        // 1. Filtra per Ferrari e per il tipo di statistica scelto
        const filtered = results.filter(r => r.constructorId === 'ferrari' && config[type].filter(r));

        // 2. Aggrega per pilota
        const aggregation = filtered.reduce((acc, curr) => {
          const name = driverMap[curr.driverId] || curr.driverId;
          if (!acc[name]) acc[name] = { name, count: 0, years: new Set() };
          
          if (config[type].isSum) {
            acc[name].count += curr.points;
          } else {
            acc[name].count += 1;
          }
          acc[name].years.add(curr.year);
          return acc;
        }, {});

        const finalData = Object.values(aggregation)
          .sort((a, b) => b.count - a.count)
          .map(item => ({
            ...item,
            yearsDisplay: Array.from(item.years).sort((a,b) => b-a).slice(0, 3).join(', ') + (item.years.size > 3 ? '...' : '')
          }));

        setData(finalData);
      } catch (error) {
        console.error("Errore nel caricamento:", error);
      }
      setLoading(false);
    }

    processStats();
  }, [type]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black">CALCOLO TELEMETRIA...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="max-w-4xl mx-auto pt-32 px-4 pb-20">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-red-600 font-black text-xs uppercase tracking-widest mb-2">Hall of Fame Ferrari</h1>
          <h2 className="text-5xl font-black uppercase italic mb-12">{config[type]?.title}</h2>

          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                  <th className="p-6">Pilota</th>
                  <th className="p-6 text-center">Anno/i</th>
                  <th className="p-6 text-right">Totale</th>
                </tr>
              </thead>
              <tbody>
                {data.map((driver, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-6 font-bold uppercase tracking-tight">
                      <span className="text-zinc-600 mr-4 font-mono">{index + 1}.</span>
                      {driver.name}
                    </td>
                    <td className="p-6 text-center text-zinc-500 text-xs font-mono">
                      {driver.yearsDisplay}
                    </td>
                    <td className="p-6 text-right font-black text-red-600 text-xl group-hover:scale-110 transition-transform">
                      {config[type].isSum ? Math.floor(driver.count).toLocaleString() : driver.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}