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
    let isMounted = true;

    async function calculateFerrariStats() {
      try {
        const response = await fetch('/data/f1db-races-race-results.json');
        if (!response.ok) throw new Error('Network response was not ok');
        if (!isMounted) return;
        const data = await response.json();
        if (!isMounted) return;

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

        if (isMounted) {
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
        }
      } catch (error) {
        console.error("Errore nel calcolo statistiche Ferrari:", error);
        if (isMounted) setStatsError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    calculateFerrariStats();

    return () => { isMounted = false; };
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
        {/* NUOVO HEADER DINAMICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 w-full"
        >
          {/* Badge in alto con effetto corsa */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-3 bg-red-600/10 backdrop-blur-sm border border-red-600/20 rounded-full px-6 py-2 mb-8"
          >
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-ping absolute"></div>
              <div className="w-2 h-2 rounded-full bg-red-600 relative"></div>
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-600">
              LIVE TIMING • SEASON {new Date().getFullYear()}
            </span>
            <div className="flex items-center gap-1 ml-2">
              <div className="w-1 h-4 bg-red-600/40 rounded-full"></div>
              <div className="w-1 h-6 bg-red-600 rounded-full"></div>
              <div className="w-1 h-4 bg-red-600/40 rounded-full"></div>
            </div>
          </motion.div>

          {/* Logo e Titolo Principale con Animazione 3D */}
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            {/* Logo Animato */}
            <motion.div
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative group"
              style={{ perspective: 1000 }}
            >
              <div className="relative w-28 h-28 md:w-36 md:h-36">
                {/* Anello esterno rotante */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-red-600/30"
                />
                
                {/* Logo container */}
                <div className="absolute inset-2 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-2xl shadow-2xl shadow-yellow-500/30 overflow-hidden transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <img 
                    src="/data/images/formula-rossa-logo.png" 
                    alt="Formula Rossa — logo piattaforma dati Ferrari F1" 
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="text-4xl font-black text-black">SF</span>';
                    }}
                  />
                </div>
                
                {/* Riflessi luminosi */}
                <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-red-600/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
              </div>
            </motion.div>

            {/* Titolo con Effetto Pista */}
            <div className="relative text-center md:text-left">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none">
                  <span className="text-white relative inline-block">
                    FORMULA
                    {/* Linea di velocità sotto */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                      className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-red-600 to-transparent"
                    />
                  </span>
                  <span className="text-red-600 relative inline-block ml-2 md:ml-4">
                    ROSSA
                    {/* Effetto scia */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-l from-red-600/20 to-transparent blur-xl"
                    />
                  </span>
                </h1>
              </motion.div>

              {/* Sottotitolo con effetto telemetria */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-4 space-y-2"
              >
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <div className="h-12 w-1 bg-gradient-to-b from-red-600 via-red-400 to-transparent rounded-full" />
                  
                  <div className="text-left">
                    <div className="overflow-hidden">
                      <motion.div
                        initial={{ y: 50 }}
                        animate={{ y: 0 }}
                        transition={{ delay: 1, duration: 0.5, staggerChildren: 0.1 }}
                        className="text-2xl md:text-3xl font-black"
                      >
                        {"DATA INTELLIGENCE".split("").map((char, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 + i * 0.05 }}
                            className={`inline-block ${char === " " ? "w-2" : ""} text-white`}
                          >
                            {char}
                          </motion.span>
                        ))}
                      </motion.div>
                    </div>
                    
                    {/* Seconda riga con effetto fade */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.8 }}
                      className="flex items-center gap-2 mt-1"
                    >
                      <span className="text-xs font-mono text-red-600/80">&lt;/&gt;</span>
                      <span className="text-sm md:text-base text-gray-400 font-mono tracking-wider">
                        F1 STATISTICS ENGINE
                      </span>
                      <span className="text-xs font-mono text-red-600/80">v2.0</span>
                    </motion.div>
                  </div>
                </div>

                {/* Barra dei tempi dinamica */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 2, duration: 1 }}
                  className="h-px bg-gradient-to-r from-red-600 via-yellow-500 to-transparent max-w-md mx-auto md:mx-0"
                />
              </motion.div>
            </div>
          </div>

          {/* Citazione con effetto pit board */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.8 }}
            className="relative max-w-3xl mx-auto mt-12"
          >
            {/* Sfondo pit board */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-red-600/5 rounded-3xl blur-3xl" />
            
            <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 overflow-hidden">
              {/* Griglia di fondo stile telemetria */}
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full" style={{
                  backgroundImage: 'linear-gradient(to right, #DC0000 1px, transparent 1px), linear-gradient(to bottom, #DC0000 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
              </div>
              
              {/* Contenuto citazione */}
              <div className="relative flex items-start gap-4">
                <div className="text-4xl font-serif text-red-600/40 leading-none">"</div>
                <div className="flex-1">
                  <p className="text-lg md:text-xl text-gray-300 font-light italic">
                    Datemi una macchina che sia veloce in rettilineo e che stia in strada in curva.
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <span className="text-xs text-red-600/60">—</span>
                    <span className="text-xs font-mono text-red-600/80 uppercase tracking-wider">
                      Enzo Ferrari • Il Drake
                    </span>
                    {/* Mini semaforo */}
                    <div className="flex gap-1 ml-2">
                      <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-yellow-600/30" />
                      <div className="w-2 h-2 rounded-full bg-green-600/30" />
                    </div>
                  </div>
                </div>
                <div className="text-4xl font-serif text-red-600/40 leading-none self-end">"</div>
              </div>

              {/* Barra di avanzamento stile giro */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 3, duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 origin-left"
                style={{ transformOrigin: 'left' }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Container principale per Stats Grid con immagini laterali */}
        <div className="relative w-full max-w-6xl mb-32">
          {/* COLONNA SINISTRA*/}
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
                    alt="Immagine del pilota Ferrari in azione durante un Gran Premio"
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

          {/* COLONNA DESTRA */}
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
                    alt="Immagine del pilota Ferrari in azione durante un Gran Premio"
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
      </div>
    </section>
  );
}