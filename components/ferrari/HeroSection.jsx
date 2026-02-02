import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Trophy, Flag, Star, Timer, Zap, Gauge, Award } from 'lucide-react';

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
    { icon: Trophy, value: dynamicStats.wins, label: 'Vittorie GP', color: 'from-ferrari-red to-red-700' },
    { icon: Star, value: dynamicStats.podiums, label: 'Podi Totali', color: 'from-ferrari-yellow to-yellow-600' },
    { icon: Timer, value: dynamicStats.poles, label: 'Pole Positions', color: 'from-ferrari-red to-red-700' },
    { icon: Zap, value: dynamicStats.fastestLaps, label: 'Giri Veloci', color: 'from-ferrari-yellow to-yellow-600' },
    { icon: Gauge, value: dynamicStats.totalPoints.toLocaleString(), label: 'Punti Storici', color: 'from-ferrari-red to-red-700' },
    { icon: Award, value: dynamicStats.grandSlams, label: 'Grand Slams', color: 'from-ferrari-yellow to-yellow-600' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black pt-20">
      {/* Sfondo animato */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ferrari-red/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ferrari-yellow/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Logo Ferrari */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <div className="inline-flex items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-ferrari-yellow to-yellow-600 rounded-3xl shadow-2xl shadow-yellow-500/30 mb-8">
            <span className="text-6xl md:text-7xl font-black text-black tracking-tighter">SF</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-tight">
            <span className="bg-gradient-to-r from-white via-ferrari-red to-ferrari-yellow bg-clip-text text-transparent">
              SCUDERIA<br />FERRARI
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 font-light italic">
            "Datemi una macchina che sia veloce in rettilineo e che stia in strada in curva."
          </p>
        </motion.div>
      </div>
        {/* Stats Grid Dinamica */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto px-4">
        {statsConfig.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className="group bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-xl p-4 hover:border-ferrari-red/40 hover:bg-zinc-900/60 transition-all duration-500 shadow-xl"
          >
            <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${stat.color} mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl md:text-2xl font-black text-white mb-0.5 tabular-nums">
              {loading ? <span className="animate-pulse">---</span> : stat.value}
            </div>
            <div className="text-gray-500 text-[9px] uppercase font-black tracking-widest leading-tight">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
