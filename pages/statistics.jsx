import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid
} from 'recharts';
import { Trophy, Activity, ChevronLeft, Star, User, ShieldCheck } from 'lucide-react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

// Normalizzazione nomi per le immagini (es: "Charles Leclerc" -> "charles-leclerc")
const normalizeDriverName = (name) => {
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Rimuove accenti (es: Räikkönen -> Raikkonen)
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
};

const CustomYAxisTick = ({ x, y, payload }) => {
  const driverSlug = normalizeDriverName(payload.value);
  
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={`clip-${driverSlug}`}>
          <rect x="-95" y="-22" width="45" height="45" rx="10" />
        </clipPath>
      </defs>
      <image
        x="-95"
        y="-22"
        width="45"
        height="45"
        href={`/data/ferrari-drivers/${driverSlug}.jpg`}
        clipPath={`url(#clip-${driverSlug})`}
        preserveAspectRatio="xMidYMid slice"
        onError={(e) => { e.target.href = "https://www.formula1.com/etc/designs/f1om/images/driver-listing-face-placeholder.png"; }}
      />
      {/* Cognome spostato più a destra per non sovrapporsi all'immagine */}
      <text x="-42" y="6" textAnchor="end" fill="#ffffff" fontSize={12} fontWeight="900" className="uppercase italic shadow-sm">
        {payload.value.split(' ').pop()}
      </text>
    </g>
  );
};

const TrophyCustomBar = (props) => {
  const { x, y, height, value } = props;
  const cupWidth = 20;
  const spacing = 4;
  const yellowFerrari = "#FFD700"; // Giallo Modena / Oro
  
  const tens = Math.floor(value / 10);
  const units = value % 10;

  // SVG del trofeo
  const trophyPath = "M3 2h10v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V2zm3 10h4v1H6v-1zm1-4v4m2-4v4M2 3h1v2H2V3zm12 0h-1v2h1V3z";

  return (
    <g>
      {/* PRIMA RIGA: Le decine (mostra 10 coppe + il moltiplicatore se > 10) */}
      {value >= 10 ? (
        <g transform={`translate(0, ${y - 10})`}>
          {[...Array(10)].map((_, i) => (
            <path key={`ten-${i}`} d={trophyPath} transform={`translate(${x + i * (cupWidth + spacing)}, 0) scale(1.3)`} fill={yellowFerrari} />
          ))}
          <text x={x + 10 * (cupWidth + spacing) + 5} y={15} fill={yellowFerrari} fontSize="14" fontWeight="900" className="italic">
            x {tens}
          </text>
        </g>
      ) : (
        // Se le vittorie sono meno di 10, mostra solo i trofei reali sulla prima riga
        <g transform={`translate(0, ${y + height/4})`}>
          {[...Array(units)].map((_, i) => (
            <path key={`unit-only-${i}`} d={trophyPath} transform={`translate(${x + i * (cupWidth + spacing)}, 0) scale(1.3)`} fill={yellowFerrari} />
          ))}
        </g>
      )}

      {/* SECONDA RIGA: Le unità (mostra i trofei rimanenti sotto se > 10) */}
      {value > 10 && units > 0 && (
        <g transform={`translate(0, ${y + 20})`}>
          {[...Array(units)].map((_, i) => (
            <path key={`unit-${i}`} d={trophyPath} transform={`translate(${x + i * (cupWidth + spacing)}, 0) scale(1.3)`} fill={yellowFerrari} />
          ))}
        </g>
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
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black uppercase">Syncing HQ Data...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <header className="mb-24 relative px-6">
          <div className="absolute left-0 top-0 w-2 h-full bg-red-600 shadow-[0_0_20px_rgba(220,0,0,0.4)]" />
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-red-600 font-black text-xs uppercase tracking-[0.6em] mb-4">Historical Performance</h1>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-4">
              Winners <span className="text-zinc-800">&</span> <br />Archive
            </h2>
          </motion.div>
        </header>

        <div className="space-y-40">
          
          {/* SEZIONE 1: TROPHY ROOM */}
          <section>
            <div className="flex items-center gap-6 mb-16">
              <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-yellow-500/20">
                <Trophy className="text-black w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase italic">Trophy Room</h3>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Distribuzione vittorie per pilota (Ferrari)</p>
              </div>
            </div>

            <div className="bg-zinc-900/10 border border-white/5 rounded-[40px] p-8 md:p-20 shadow-2xl backdrop-blur-3xl overflow-hidden">
              <div className="h-[900px] w-full"> {/* Altezza aumentata per evitare sovrapposizioni */}
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pilotWins} layout="vertical" margin={{ left: 100, right: 60 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={<CustomYAxisTick />} 
                      width={120}
                      axisLine={false}
                      interval={0} // Forza la visualizzazione di ogni riga
                    />
                    <Bar 
                      dataKey="wins" 
                      shape={<TrophyCustomBar />} 
                      isAnimationActive={true}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* SEZIONE 2: PERFORMANCE TIMELINE */}
          <section>
            <div className="flex items-center gap-6 mb-16">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center -rotate-3 shadow-lg shadow-red-600/20">
                <Activity className="text-white w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase italic">Performance Analytics</h3>
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
                    <XAxis dataKey="year" stroke="#444" fontSize={11} tickMargin={15} axisLine={false} />
                    <YAxis stroke="#444" fontSize={11} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="points" stroke="#DC0000" strokeWidth={3} fill="url(#ferrariGlow)" />
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
