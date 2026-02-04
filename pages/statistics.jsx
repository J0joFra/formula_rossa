import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Trophy, Activity, BarChart3, ChevronLeft } from 'lucide-react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

export default function StatisticsPage() {
  const [pilotWins, setPilotWins] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resultsRes, driversRes] = await Promise.all([
          fetch('/data/f1db-races-race-results.json'),
          fetch('/data/f1db-drivers.json')
        ]);
        const results = await resultsRes.json();
        const drivers = await driversRes.json();
        const driverMap = {};
        drivers.forEach(d => driverMap[d.id] = d.lastName);

        const ferrariWins = results.filter(r => r.constructorId === 'ferrari' && r.positionNumber === 1);
        const winsCount = ferrariWins.reduce((acc, curr) => {
          const name = driverMap[curr.driverId] || curr.driverId;
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {});

        setPilotWins(Object.entries(winsCount).map(([name, wins]) => ({ name, wins })).sort((a, b) => b.wins - a.wins).slice(0, 10));

        const currentYear = new Date().getFullYear();
        const pointsByYear = results.filter(r => r.constructorId === 'ferrari' && r.year > currentYear - 15)
          .reduce((acc, curr) => {
            acc[curr.year] = (acc[curr.year] || 0) + (curr.points || 0);
            return acc;
          }, {});

        setPointsHistory(Object.entries(pointsByYear).map(([year, points]) => ({ year, points: Math.floor(points) })).sort((a, b) => a.year - b.year));
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <Link href="/" className="text-zinc-500 font-bold uppercase text-[10px] mb-8 inline-block hover:text-red-600 transition-colors tracking-widest">
          ← Back to Home
        </Link>

        <header className="mb-20">
          <h1 className="text-red-600 font-black text-xs uppercase tracking-[0.4em] mb-4">Advanced Analytics</h1>
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">Performance <span className="text-zinc-800">Archive</span></h2>
        </header>

        <div className="grid grid-cols-1 gap-12">
          {/* Grafico Vittorie */}
          <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 shadow-xl">
            <h4 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3">
              <Trophy className="text-yellow-500" /> All-Time Winners (Ferrari)
            </h4>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pilotWins} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} width={100} tick={{fontWeight: '900'}} />
                  <Tooltip cursor={{ fill: 'rgba(220, 0, 0, 0.05)' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                  <Bar dataKey="wins" fill="#DC0000" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grafico Punti */}
          <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 shadow-xl">
            <h4 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3">
              <Activity className="text-red-600" /> Historical Season Points
            </h4>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pointsHistory}>
                  <defs>
                    <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC0000" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#DC0000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                  <XAxis dataKey="year" stroke="#444" fontSize={10} />
                  <YAxis stroke="#444" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                  <Area type="monotone" dataKey="points" stroke="#DC0000" strokeWidth={3} fill="url(#colorP)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}