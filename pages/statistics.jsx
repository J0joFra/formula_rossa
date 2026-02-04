import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Trophy, Activity, ChevronLeft, Star, User, ShieldCheck } from 'lucide-react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

// Helper per i nomi file immagini
const normalizeDriverName = (name) => {
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
};

export default function StatisticsPage() {
  const [pilotWins, setPilotWins] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resultsRes, driversRes, historicalRes] = await Promise.all([
          fetch('/data/f1db-races-race-results.json'),
          fetch('/data/f1db-drivers.json'),
          fetch('/data/ferrari_historical.json')
        ]);
        
        const results = await resultsRes.json();
        const drivers = await driversRes.json();
        const historical = await historicalRes.json();

        const driverMap = {};
        drivers.forEach(d => driverMap[d.id] = `${d.firstName} ${d.lastName}`);

        const ferrariWins = results.filter(r => r.constructorId === 'ferrari' && r.positionNumber === 1);
        const aggregation = ferrariWins.reduce((acc, curr) => {
          const name = driverMap[curr.driverId] || curr.driverId;
          if (!acc[name]) acc[name] = { name, id: curr.driverId, count: 0, years: new Set() };
          acc[name].count += 1;
          acc[name].years.add(curr.year);
          return acc;
        }, {});

        const winsData = Object.values(aggregation)
          .map(item => ({ 
            name: item.name, 
            id: item.id,
            wins: item.count, 
            yearsList: Array.from(item.years).sort((a,b) => b-a) 
          }))
          .sort((a, b) => b.wins - a.wins)
          .slice(0, 10);

        setPilotWins(winsData);
        setHistory(historical.filter(h => h.points !== null));
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black tracking-widest uppercase italic">Loading Telemetry...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <Link href="/" className="group inline-flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-all mb-12">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Maranello HQ</span>
        </Link>

        <header className="mb-24 relative px-6">
          <div className="absolute left-0 top-0 w-2 h-full bg-red-600 shadow-[0_0_20px_rgba(220,0,0,0.5)]" />
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-red-600 font-black text-xs uppercase tracking-[0.6em] mb-4 font-mono">Historical Intelligence</h1>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-4">
              Winners <span className="text-zinc-800">&</span> <br />Archive
            </h2>
          </motion.div>
        </header>

        <div className="space-y-40">
          
          {/* TABELLA WINNERS CUSTOM */}
          <section>
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-yellow-500/20">
                <Trophy className="text-black w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase italic">Winners Circle</h3>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Analisi vittorie e cronologia per pilota</p>
              </div>
            </div>

            <div className="bg-zinc-900/20 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl backdrop-blur-3xl">
              {/* Header Tabella */}
              <div className="grid grid-cols-12 gap-4 p-8 border-b border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                <div className="col-span-1 text-center italic">Pos</div>
                <div className="col-span-2 text-center">Driver</div>
                <div className="col-span-5 pl-4">Trophies</div>
                <div className="col-span-4 pl-4">Years</div>
              </div>

              {/* Righe Tabella */}
              <div className="divide-y divide-white/5">
                {pilotWins.map((driver, index) => (
                  <div key={driver.id} className="grid grid-cols-12 gap-4 p-8 hover:bg-white/5 transition-all items-center group">
                    
                    {/* Posizione */}
                    <div className="col-span-1 text-center">
                      <span className="text-3xl font-black italic text-zinc-700 group-hover:text-red-600 transition-colors">
                        {index + 1}
                      </span>
                    </div>

                    {/* Pilota: Immagine centrata e Nome sotto */}
                    <div className="col-span-2 flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-zinc-800 group-hover:border-red-600 transition-all shadow-xl bg-zinc-800">
                        <img 
                          src={`/data/ferrari-drivers/${normalizeDriverName(driver.name)}.jpg`} 
                          alt={driver.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = "https://www.formula1.com/etc/designs/f1om/images/driver-listing-face-placeholder.png"; }}
                        />
                      </div>
                      <span className="font-black uppercase italic text-xs tracking-tighter text-white">
                        {driver.name.split(' ').pop()}
                      </span>
                    </div>

                    {/* Trofei Gialli: Logica 10 per fila */}
                    <div className="col-span-5 flex flex-col gap-4 pl-4">
                      <div className="flex items-center flex-wrap gap-1.5">
                        {[...Array(driver.wins >= 10 ? 10 : driver.wins)].map((_, i) => (
                          <TrophySVG key={i} size={20} color="#FFD700" />
                        ))}
                        {driver.wins >= 10 && (
                          <span className="text-xl font-black italic text-yellow-500 ml-2">
                            x{Math.floor(driver.wins / 10)}
                          </span>
                        )}
                      </div>
                      {driver.wins > 10 && driver.wins % 10 > 0 && (
                        <div className="flex items-center flex-wrap gap-1.5">
                          {[...Array(driver.wins % 10)].map((_, i) => (
                            <TrophySVG key={i} size={20} color="#FFD700" />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Annate: Quadratini Rossi */}
                    <div className="col-span-4 flex flex-wrap gap-2 pr-4 pl-4">
                      {driver.yearsList.map((year) => (
                        <span key={year} className="px-3 py-1 bg-red-600 rounded-md text-[11px] font-black text-white shadow-lg border border-red-500/30">
                          {year}
                        </span>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PERFORMANCE HISTORY (AREA CHART) */}
          <section>
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center -rotate-3 shadow-lg shadow-red-600/20">
                <Activity className="text-white w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase italic">Performance Timeline</h3>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Evoluzione del punteggio annuale costruttori</p>
              </div>
            </div>

            <div className="bg-zinc-900/20 border border-white/5 rounded-[40px] p-12 shadow-2xl">
              <div className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="ferrariGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC0000" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#DC0000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                    <XAxis dataKey="year" stroke="#444" fontSize={11} tickMargin={15} axisLine={false} />
                    <YAxis stroke="#444" fontSize={11} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="points" stroke="#DC0000" strokeWidth={3} fillOpacity={1} fill="url(#ferrariGlow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}

function TrophySVG({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <path d="M3 2h10v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V2zm3 10h4v1H6v-1zm1-4v4m2-4v4M2 3h1v2H2V3zm12 0h-1v2h1V3z" />
    </svg>
  );
}