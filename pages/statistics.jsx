import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid, Cell
} from 'recharts';
import { Trophy, Activity, ChevronLeft, Star, User, ShieldCheck } from 'lucide-react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

// Componente per le etichette con foto dei piloti (Sincronizzato con i tuoi nomi file)
const CustomYAxisTick = ({ x, y, payload }) => {
  // Trasforma il nome in slug: "Charles Leclerc" -> "charles-leclerc"
  const driverSlug = payload.value.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={`clip-${driverSlug}`}>
          <rect x="-75" y="-20" width="40" height="40" rx="8" />
        </clipPath>
      </defs>
      <image
        x="-75"
        y="-20"
        width="40"
        height="40"
        href={`/data/ferrari-drivers/${driverSlug}.jpg`}
        clipPath={`url(#clip-${driverSlug})`}
        preserveAspectRatio="xMidYMid slice"
        onError={(e) => { e.target.href = "https://www.formula1.com/etc/designs/f1om/images/driver-listing-face-placeholder.png"; }}
      />
      <text x="-25" y="5" textAnchor="end" fill="#ffffff" fontSize={12} fontWeight="900" className="uppercase italic">
        {payload.value.split(' ').pop()} {/* Mostra solo il cognome per pulizia */}
      </text>
    </g>
  );
};

// Componente per disegnare le mini coppe al posto della barra
const TrophyCustomBar = (props) => {
  const { x, y, width, height, value } = props;
  const cupWidth = 18;
  const spacing = 4;
  
  // Calcoliamo quante coppe visualizzare (massimo 20 per riga per non uscire dallo schermo)
  const cups = [];
  const maxVisualCups = Math.min(value, 25); 

  for (let i = 0; i < maxVisualCups; i++) {
    cups.push(
      <path
        key={i}
        d="M3 2h10v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V2zm3 10h4v1H6v-1zm1-4v4m2-4v4M2 3h1v2H2V3zm12 0h-1v2h1V3z"
        transform={`translate(${x + i * (cupWidth + spacing)}, ${y + height / 4}) scale(1.2)`}
        fill={i === 0 && value > 50 ? "#FFD700" : "#DC0000"} // Oro per il recordman (Schumacher)
        stroke="#000"
        strokeWidth="0.5"
      />
    );
  }

  return (
    <g>
      {cups}
      {value > 25 && (
        <text x={x + 25 * (cupWidth + spacing) + 10} y={y + height / 1.5} fill="#666" fontSize="10" fontWeight="bold">
          +{value - 25}
        </text>
      )}
    </g>
  );
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
        const winsCount = ferrariWins.reduce((acc, curr) => {
          const name = driverMap[curr.driverId] || curr.driverId;
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {});

        const winsData = Object.entries(winsCount)
          .map(([name, wins]) => ({ name, wins }))
          .sort((a, b) => b.wins - a.wins)
          .slice(0, 10);

        setPilotWins(winsData);
        setHistory(historical.filter(h => h.points !== null));

      } catch (err) {
        console.error("Errore:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black tracking-widest uppercase">Initializing Telemetry...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <Link href="/" className="group inline-flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-all mb-12">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Maranello HQ</span>
        </Link>

        <header className="mb-24 relative px-4">
          <div className="absolute left-0 top-0 w-1.5 h-full bg-red-600 shadow-[0_0_15px_rgba(220,0,0,0.5)]" />
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-red-600 font-black text-xs uppercase tracking-[0.6em] mb-4">Divisione Corse Storiche</h1>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.8] mb-4">
              Dati <span className="text-zinc-800">&</span> <br />Vittorie
            </h2>
            <p className="text-zinc-500 font-medium max-w-xl">L'analisi dettagliata di ogni singolo successo che ha reso la Scuderia Ferrari l'unica leggenda della Formula 1.</p>
          </motion.div>
        </header>

        <div className="space-y-32">
          
          {/* SEZIONE 1: BACHECA DEI TROFEI */}
          <section className="relative">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-red-600/20">
                  <Trophy className="text-white w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase italic">Winners Circle</h3>
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Ogni coppa rappresenta una vittoria in un Gran Premio</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/20 border border-white/5 rounded-[40px] p-8 md:p-16 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="h-[650px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pilotWins} layout="vertical" margin={{ left: 80, right: 40 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={<CustomYAxisTick />} 
                      width={100}
                      axisLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-zinc-900 border border-red-600/50 p-4 rounded-xl shadow-2xl">
                              <p className="text-white font-black uppercase italic">{payload[0].payload.name}</p>
                              <p className="text-red-500 font-bold text-2xl">{payload[0].value} <span className="text-xs uppercase text-zinc-500">Vittorie</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="wins" shape={<TrophyCustomBar />} isAnimationActive={true} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* SEZIONE 2: ARCHIVIO PERFORMANCE (AREA CHART) */}
          <section>
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center -rotate-3 border border-white/10 shadow-xl">
                <Activity className="text-red-600 w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase italic">Performance Timeline</h3>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Analisi dei punti costruttori dal 1958 ad oggi</p>
              </div>
            </div>

            <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative">
              <div className="h-[400px] w-full">
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
                    <YAxis stroke="#444" fontSize={11} axisLine={false} tickFormatter={(val) => `${val}pts`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '12px' }}
                      itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="points" 
                      stroke="#DC0000" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#ferrariGlow)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* QUICK STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
             <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/5 p-8 rounded-[32px] shadow-xl group hover:border-red-600/30 transition-all">
                <ShieldCheck className="w-10 h-10 text-red-600 mb-6 group-hover:scale-110 transition-transform" />
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Costruttori</p>
                <p className="text-5xl font-black italic">16 <span className="text-sm text-zinc-700 not-italic">Titoli</span></p>
             </div>
             
             <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/5 p-8 rounded-[32px] shadow-xl group hover:border-red-600/30 transition-all">
                <User className="w-10 h-10 text-red-600 mb-6 group-hover:scale-110 transition-transform" />
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Piloti</p>
                <p className="text-5xl font-black italic">15 <span className="text-sm text-zinc-700 not-italic">Titoli</span></p>
             </div>

             <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/5 p-8 rounded-[32px] shadow-xl group hover:border-red-600/30 transition-all">
                <Star className="w-10 h-10 text-yellow-500 mb-6 group-hover:scale-110 transition-transform" />
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Dominio</p>
                <p className="text-5xl font-black italic">2004 <span className="text-sm text-zinc-700 not-italic">Golden Year</span></p>
             </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
