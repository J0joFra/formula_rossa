import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Timer, Zap, Gauge, Award, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
  const [statsError, setStatsError] = useState(false);

  const carouselImages = [
    "/data/images/image1.jpg",
    "/data/images/image2.jpg",
    "/data/images/image3.jpg",
    "/data/images/image4.jpg",
    "/data/images/image5.jpg",
    "/data/images/image6.jpg",
    "/data/images/image7.jpg",
    "/data/images/image8.jpg",
    "/data/images/image9.jpg",
    "/data/images/image10.jpg"
  ];

  useEffect(() => {
    async function calculateFerrariStats() {
      try {
        const response = await fetch('/data/f1db-races-race-results.json');
        if (!response.ok) throw new Error('Network response was not ok');
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
        setStatsError(false);
      } catch (error) {
        console.error("Errore nel calcolo statistiche Ferrari:", error);
        setStatsError(true);
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

  const StatSkeleton = () => (
    <div className="animate-pulse">
      <div className="w-16 h-16 bg-zinc-800 rounded-2xl mb-6 mx-auto"></div>
      <div className="w-24 h-12 bg-zinc-800 rounded-lg mb-2 mx-auto"></div>
      <div className="w-32 h-4 bg-zinc-800 rounded mx-auto"></div>
    </div>
  );

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black pt-32 pb-20">
      {/* Sfondo animato */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-7xl mx-auto flex flex-col items-center w-full">
        {/* Logo Ferrari e Titolo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="inline-flex items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-[#FFD700] rounded-3xl shadow-2xl shadow-yellow-500/30 mb-8 p-2 overflow-hidden">
            <img 
              src="/data/images/formula-rossa-logo.png" 
              alt="Logo Ferrari" 
              className="w-full h-full object-contain drop-shadow-2xl scale-110" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-6xl font-black text-black">SF</span>';
              }}
            />
          </div>
          
          <div className="relative inline-block">
            <h1 className="text-6xl md:text-[120px] font-black leading-none uppercase tracking-tighter text-white">
              Formula<span className="text-red-600">Rossa</span>
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="h-[2px] w-12 bg-red-600"></div>
              <h2 className="text-sm md:text-xl font-bold uppercase tracking-widest text-gray-400">
                Data Intelligence & <span className="text-white">F1 Statistics</span>
              </h2>
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light italic">
            "Datemi una macchina che sia veloce in rettilineo e che stia in strada in curva."
          </p>
        </motion.div>

        {/* Container principale per Stats Grid con immagini laterali */}
        <div className="relative w-full max-w-6xl mb-32">
          {/* COLONNA SINISTRA - Immagini che scorrono in basso */}
          <div className="hidden lg:block absolute -left-48 top-1/2 -translate-y-1/2 w-48 h-[120%] overflow-hidden z-0">
            <motion.div
              className="flex flex-col gap-8"
              animate={{ y: [0, -1000] }}
              transition={{ 
                duration: 40,
                repeat: Infinity,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              {[...carouselImages, ...carouselImages].map((img, index) => (
                <div key={`left-${index}`} className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden group">
                  <Image
                    src={img}
                    alt=""
                    width={192}
                    height={256}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    quality={85}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />
                </div>
              ))}
            </motion.div>
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
          </div>

          {/* COLONNA DESTRA - Immagini che scorrono in alto */}
          <div className="hidden lg:block absolute -right-48 top-1/2 -translate-y-1/2 w-48 h-[120%] overflow-hidden z-0">
            <motion.div
              className="flex flex-col gap-8"
              animate={{ y: [-1000, 0] }}
              transition={{ 
                duration: 40,
                repeat: Infinity,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              {[...carouselImages, ...carouselImages].map((img, index) => (
                <div key={`right-${index}`} className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden group">
                  <Image
                    src={img}
                    alt=""
                    width={192}
                    height={256}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    quality={85}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />
                </div>
              ))}
            </motion.div>
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
          </div>

          {/* Stats Grid Centrale */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto relative z-10">
            {statsConfig.map((stat, index) => (
              <Link 
                href={`/stats/${stat.id}`} 
                key={stat.id}
                aria-label={`Visualizza statistiche dettagliate per ${stat.label}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-red-600/40 hover:bg-zinc-900/90 transition-all duration-500 shadow-2xl flex flex-col items-center cursor-pointer h-full relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className={`relative inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.color} mb-6 shadow-lg group-hover:shadow-red-500/30 group-hover:scale-110 transition-all duration-300 z-10`}>
                    <stat.icon className="w-8 h-8 text-white" />
                    <div className="absolute inset-0 rounded-2xl bg-red-500/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
                  </div>
                  
                  <div className="relative text-4xl md:text-5xl font-black text-white mb-2 tabular-nums z-10">
                    {loading ? (
                      <span className="animate-pulse opacity-30">---</span>
                    ) : statsError ? (
                      <span className="text-red-600">N/A</span>
                    ) : (
                      <motion.span
                        key={stat.value}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {stat.value}
                      </motion.span>
                    )}
                  </div>
                  
                  <div className="relative text-gray-400 text-xs md:text-sm uppercase font-semibold tracking-[0.2em] leading-tight z-10">
                    {stat.label}
                  </div>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 w-full max-w-5xl mx-auto px-4 relative z-10"
        >
          <Link href="/statistics">
            <div className="group relative overflow-hidden bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-12 cursor-pointer hover:border-red-600/50 transition-all duration-500 shadow-2xl">
              
              {/* Sfondo Decorativo */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 800 200">
                  <motion.path
                    d="M0 100 Q 100 50, 200 120 T 400 80 T 600 150 T 800 100"
                    fill="none"
                    stroke="#DC0000"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.path
                    d="M0 120 Q 150 180, 300 100 T 500 50 T 800 130"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 1 }}
                  />
                </svg>
              </div>
        
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                
                {/* Grafico Stilizzato */}
                <div className="flex gap-2 items-end h-24">
                  {[40, 70, 45, 90, 65, 80, 50, 95, 75].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="w-2 md:w-3 bg-gradient-to-t from-red-600 to-red-400 rounded-t-sm"
                    />
                  ))}
                </div>
        
                {/* Testo */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">System Status: Online</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white leading-none">
                    Deep <span className="text-red-600">Analytics</span> <br />
                    <span className="text-zinc-400">Archive</span>
                  </h3>
                  <p className="mt-4 text-zinc-500 text-sm font-medium max-w-sm">
                    Esplora 75 anni di telemetria, vittorie e dati tecnici. Ogni sorpasso, ogni millesimo, ogni leggenda.
                  </p>
                </div>
        
                {/* Bottone */}
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(220,0,0,0.4)] group-hover:bg-white transition-colors duration-300"
                  >
                    <BarChart3 className="w-10 h-10 text-white group-hover:text-red-600 transition-colors" />
                  </motion.div>
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] text-red-600">Enter Vault</span>
                </div>
        
              </div>
        
              <div className="absolute -inset-x-20 -inset-y-20 bg-gradient-to-r from-transparent via-red-600/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000" />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}