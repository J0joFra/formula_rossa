import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid, Cell, Text 
} from 'recharts';
import { Trophy, Activity, BarChart3, ChevronLeft, Star, User } from 'lucide-react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

const CustomYAxisTick = ({ x, y, payload }) => {
  const driverId = payload.value.toLowerCase().replace(' ', '-');
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={`clip-${driverId}`}>
          <circle cx="-25" cy="0" r="15" />
        </clipPath>
      </defs>
      <image
        x="-40"
        y="-15"
        width="30"
        height="30"
        href={`/data/ferrari-drivers/${driverId}.jpg`}
        clipPath={`url(#clip-${driverId})`}
        onError={(e) => { e.target.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E"; }}
      />
      <text x="-50" y="4" textAnchor="end" fill="#666" fontSize={12} fontWeight="900" className="uppercase italic">
        {payload.value}
      </text>
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
        drivers.forEach(d => driverMap[d.id] = d.lastName);

        // 1. Top Winners Processing
        const ferrariWins = results.filter(r => r.constructorId === 'ferrari' && r.positionNumber === 1);
        const winsCount = ferrariWins.reduce((acc, curr) => {
          const name = driverMap[curr.driverId] || curr.driverId;
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {});

        const winsData = Object.entries(winsCount)
          .map(([name, wins]) => ({ name, wins }))
          .sort((a, b) => b.wins - a.wins)
          .slice(0, 7);

        setPilotWins(winsData);

        // 2. Historical Points Processing
        setHistory(historical.filter(h => h.points !== null));

      } catch (err) {
        console.error("Errore statistiche:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black tracking-widest">GENERATING ANALYTICS...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <Link href="/" className="group inline-flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-all mb-12">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to HQ</span>
        </Link>

        <header className="mb-24 relative">
          <div className="absolute -left-4 top-0 w-1 h-24 bg-red-600" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-red-600 font-black text-xs uppercase tracking-[0.5em] mb-4">Historical Data Dept.</h1>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
              The <span className="text-zinc-800">Red</span> <br />Legacy
            </h2>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 gap-20">
          
          {/* SEZIONE 1: HALL OF FAME */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                <Trophy className="text-yellow-500 w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight">Vittorie per Pilota</h3>
                <p className="text-zinc-500 text-sm">I piloti che hanno portato più volte il Cavallino sul gradino più alto.</p>
              </div>
            </div>

            <div className="bg-zinc-900/20 border border-white/5 rounded-[40px] p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy className="w-64 h-64 text-white" />
              </div>
              
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pilotWins} layout="vertical" margin={{ left: 60, right: 40 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={<CustomYAxisTick />} 
                      width={120}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(220, 0, 0, 0.05)' }}
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '15px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="wins" radius={[0, 20, 20, 0]} barSize={40}>
                      {pilotWins.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#DC0000' : '#8a0000'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* SEZIONE 2: TIMELINE PERFORMANCE  */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-red-600/10 rounded-2xl border border-red-600/20">
                <Activity className="text-red-600 w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight">Evoluzione Punti</h3>
                <p className="text-zinc-500 text-sm">Andamento della competitività della Scuderia dal 1958.</p>
              </div>
            </div>

            <div className="bg-zinc-900/20 border border-white/5 rounded-[40px] p-12 shadow-2xl">
              <div className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="ferrariGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC0000" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#DC0000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                    <XAxis 
                      dataKey="year" 
                      stroke="#444" 
                      fontSize={12} 
                      tickMargin={10}
                      axisLine={false}
                    />
                    <YAxis stroke="#444" fontSize={12} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '15px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="points" 
                      stroke="#DC0000" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#ferrariGlow)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* BOX INFO */}
          <div className="grid md:grid-cols-3 gap-8">
             <StatCard title="Titoli Costruttori" value="16" icon={Star} color="text-yellow-500" />
             <StatCard title="Titoli Piloti" value="15" icon={User} color="text-red-600" />
             <StatCard title="Miglior Stagione" value="2004" icon={Activity} color="text-zinc-400" />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
    return (
        <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl flex items-center justify-between group hover:border-red-600/30 transition-all">
            <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
                <p className={`text-4xl font-black ${color}`}>{value}</p>
            </div>
            <Icon className={`w-12 h-12 opacity-10 group-hover:opacity-40 transition-opacity ${color}`} />
        </div>
    )
}