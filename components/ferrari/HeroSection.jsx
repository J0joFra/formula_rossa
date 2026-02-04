import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Trophy, Flag, Star, Timer, Zap, Gauge, Award, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  const [dynamicStats, setDynamicStats] = useState({
    wins: 0,
    podiums: 0,
    poles: 0,
    fastestLaps: 0,
    totalPoints: 0,
    grandSlams: 0,
    years: new Date().getFullYear() - 1950
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function calculateFerrariStats() {
      try {
        const response = await fetch('/data/f1db-races-race-results.json');
        if (!response.ok) return;
        const data = await response.json();

        const ferrariResults = data.filter(r => r.constructorId === 'ferrari');

        const stats = ferrariResults.reduce((acc, curr) => {
          if (curr.positionNumber === 1) acc.wins++;
          if (curr.positionNumber >= 1 && curr.positionNumber <= 3) acc.podiums++;
          if (curr.gridPositionNumber === 1) acc.poles++;
          if (curr.fastestLap === true) acc.fastestLaps++;
          if (curr.points) acc.totalPoints += curr.points;
          if (curr.grandSlam === true) acc.grandSlams++;
          return acc;
        }, { wins: 0, podiums: 0, poles: 0, fastestLaps: 0, totalPoints: 0, grandSlams: 0 });

        setDynamicStats(prev => ({
          ...prev,
          wins: stats.wins,
          podiums: stats.podiums,
          poles: stats.poles,
          fastestLaps: stats.fastestLaps,
          totalPoints: Math.floor(stats.totalPoints),
          grandSlams: stats.grandSlams
        }));
      } catch (error) {
        console.error("Errore nel calcolo statistiche Ferrari:", error);
      } finally {
        setLoading(false);
      }
    }
    calculateFerrariStats();
  }, []);

  const statsConfig = [
    { id: 'wins', icon: Trophy, value: dynamicStats.wins, label: 'Vittorie GP', color: 'from-red-600 to-red-800' },
    { id: 'podiums', icon: Star, value: dynamicStats.podiums, label: 'Podi Totali', color: 'from-yellow-400 to-yellow-600' },
    { id: 'poles', icon: Timer, value: dynamicStats.poles, label: 'Pole Positions', color: 'from-red-600 to-red-800' },
    { id: 'fastest-laps', icon: Zap, value: dynamicStats.fastestLaps, label: 'Giri Veloci', color: 'from-yellow-400 to-yellow-600' },
    { id: 'points', icon: Gauge, value: dynamicStats.totalPoints.toLocaleString(), label: 'Punti Storici', color: 'from-red-600 to-red-800' },
    { id: 'grand-slams', icon: Award, value: dynamicStats.grandSlams, label: 'Grand Slams', color: 'from-yellow-400 to-yellow-600' },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black pt-32 pb-20">
      {/* Sfondo animato */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-7xl mx-auto flex flex-col items-center">
        {/* Logo Ferrari e Titolo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="inline-flex items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl shadow-2xl shadow-yellow-500/20 mb-8">
            <span className="text-6xl md:text-7xl font-black text-black tracking-tighter">SF</span>
          </div>
          
          <h1 className="text-4xl md:text-9xl font-black mb-6 tracking-tighter leading-tight uppercase">
            <span className="bg-gradient-to-r from-white via-red-600 to-yellow-500 bg-clip-text text-transparent">
              SCUDERIA<br />FERRARI
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light italic">
            "Datemi una macchina che sia veloce in rettilineo e che stia in strada in curva."
          </p>
        </motion.div>

        {/* Stats Grid Dinamica - 3x3 Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-32">
          {statsConfig.map((stat, index) => (
            <Link href={`/stats/${stat.id}`} key={stat.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="group bg-zinc-900/30 backdrop-blur-xl border border-white/5 rounded-2xl p-10 hover:border-red-600/40 hover:bg-zinc-900/60 transition-all duration-500 shadow-2xl flex flex-col items-center cursor-pointer h-full"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-black text-white mb-2 tabular-nums">
                  {loading ? <span className="animate-pulse opacity-30">---</span> : stat.value}
                </div>
                <div className="text-gray-500 text-xs md:text-sm uppercase font-black tracking-[0.2em] leading-tight">
                  {stat.label}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-20"
        >
          <Link href="/statistics">
            <div className="group relative inline-flex flex-col items-center cursor-pointer">
              <div className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.4em] mb-4 group-hover:text-red-600 transition-colors">
                View Full Analytics
              </div>
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-600 group-hover:bg-red-600/10 transition-all duration-300">
                <BarChart3 className="w-5 h-5 text-red-600" />
              </div>
              {/* Effetto alone */}
              <div className="absolute -bottom-4 w-12 h-4 bg-red-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
