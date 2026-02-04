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

// Normalizzazione nomi per le immagini
const normalizeDriverName = (name) => {
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
};

// ASSE Y: Foto centrata e Nome sotto
const CustomYAxisTick = ({ x, y, payload }) => {
  const driverSlug = normalizeDriverName(payload.value);
  
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={`clip-${driverSlug}`}>
          <rect x="-110" y="-30" width="55" height="55" rx="12" />
        </clipPath>
      </defs>
      {/* Immagine Pilota */}
      <image
        x="-110"
        y="-30"
        width="55"
        height="55"
        href={`/data/ferrari-drivers/${driverSlug}.jpg`}
        clipPath={`url(#clip-${driverSlug})`}
        preserveAspectRatio="xMidYMid slice"
        onError={(e) => { e.target.href = "https://www.formula1.com/etc/designs/f1om/images/driver-listing-face-placeholder.png"; }}
      />
      {/* Nome sotto l'immagine */}
      <text 
        x="-82.5" 
        y="45" 
        textAnchor="middle" 
        fill="#ffffff" 
        fontSize={11} 
        fontWeight="900" 
        className="uppercase italic tracking-tighter"
      >
        {payload.value.split(' ').pop()}
      </text>
    </g>
  );
};

// BARRA: Trofei Gialli (10 per fila) + Annate a destra
const TrophyCustomBar = (props) => {
  const { x, y, value, payload } = props;
  const cupWidth = 20;
  const spacing = 5;
  const yellowFerrari = "#FFD700"; 
  
  const tens = Math.floor(value / 10);
  const units = value % 10;
  const years = payload.yearsList || [];

  const trophyPath = "M3 2h10v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V2zm3 10h4v1H6v-1zm1-4v4m2-4v4M2 3h1v2H2V3zm12 0h-1v2h1V3z";

  return (
    <g>
      {/* PRIMA RIGA (Decine) */}
      <g transform={`translate(0, ${y - 12})`}>
        {value >= 10 ? (
          <>
            {[...Array(10)].map((_, i) => (
              <path key={`ten-${i}`} d={trophyPath} transform={`translate(${x + i * (cupWidth + spacing)}, 0) scale(1.3)`} fill={yellowFerrari} />
            ))}
            <text x={x + 10 * (cupWidth + spacing) + 10} y={15} fill={yellowFerrari} fontSize="16" fontWeight="900" className="italic italic">
              x{tens}
            </text>
          </>
        ) : (
          [...Array(units)].map((_, i) => (
            <path key={`unit-only-${i}`} d={trophyPath} transform={`translate(${x + i * (cupWidth + spacing)}, 0) scale(1.3)`} fill={yellowFerrari} />
          ))
        )}
      </g>

      {/* SECONDA RIGA (Unità rimanenti) */}
      {value >= 10 && units > 0 && (
        <g transform={`translate(0, ${y + 18})`}>
          {[...Array(units)].map((_, i) => (
            <path key={`unit-${i}`} d={trophyPath} transform={`translate(${x + i * (cupWidth + spacing)}, 0) scale(1.3)`} fill={yellowFerrari} />
          ))}
        </g>
      )}

      {/* COLONNA ANNATE (A destra di tutto) */}
      <g transform={`translate(${x + 300}, ${y - 20})`}>
        {years.slice(0, 16).map((year, index) => {
          const row = Math.floor(index / 4);
          const col = index % 4;
          return (
            <g key={year} transform={`translate(${col * 45}, ${row * 22})`}>
              <rect width="40" height="18" rx="4" fill="#DC0000" />
              <text x="20" y="13" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontClassName="font-mono">
                {year}
              </text>
            </g>
          );
        })}
        {years.length > 16 && (
           <text x="180" y="80" fill="#444" fontSize="10" fontWeight="bold">...</text>
        )}
      </g>
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

        // Aggregazione vittorie e ANNI
        const ferrariWins = results.filter(r => r.constructorId === 'ferrari' && r.positionNumber === 1);
        const aggregation = ferrariWins.reduce((acc, curr) => {
          const name = driverMap[curr.driverId] || curr.driverId;
          if (!acc[name]) acc[name] = { name, count: 0, years: new Set() };
          acc[name].count += 1;
          acc[name].years.add(curr.year);
          return acc;
        }, {});

        const winsData = Object.values(aggregation)
          .map(item => ({ 
            name: item.name, 
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black tracking-widest uppercase">Analyzing Maranello Archives...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <header className="mb-24 relative px-6">
          <div className="absolute left-0 top-0 w-2 h-full bg-red-600 shadow-[0_0_20px_rgba(220,0,0,0.4)]" />
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-red-600 font-black text-xs uppercase tracking-[0.6em] mb-4">Historical Intelligence</h1>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-4">
              Performance <span className="text-zinc-800">&</span> <br />Legacy
            </h2>
          </motion.div>
        </header>

        <div className="space-y-40">
          
          {/* BACHECA TROFEI */}
          <section>
            <div className="flex items-center gap-6 mb-16">
              <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center rotate-3 shadow-lg">
                <Trophy className="text-black w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase italic tracking-tight">Hall of Victory</h3>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Dettaglio vittorie e cronologia per pilota</p>
              </div>
            </div>

            <div className="bg-zinc-900/10 border border-white/5 rounded-[40px] p-8 md:p-20 shadow-2xl backdrop-blur-3xl overflow-hidden">
              <div className="h-[1100px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pilotWins} layout="vertical" margin={{ left: 120, right: 100 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={<CustomYAxisTick />} 
                      width={10}
                      axisLine={false}
                      interval={0}
                    />
                    <Bar dataKey="wins" shape={<TrophyCustomBar />} isAnimationActive={true} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* PERFORMANCE HISTORY */}
          <section>
            <div className="flex items-center gap-6 mb-16 px-4">
                <Activity className="text-red-600 w-12 h-12" />
                <h3 className="text-4xl font-black uppercase italic tracking-tight text-zinc-100">Performance Timeline</h3>
            </div>

            <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-12 shadow-2xl">
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
