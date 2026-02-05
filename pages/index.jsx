import React, { useRef, useState, useEffect } from 'react';
import Navigation from '../components/ferrari/Navigation';
import HeroSection from '../components/ferrari/HeroSection';
import StatsSection from '../components/ferrari/StatsSection';
import NewsSection from '../components/ferrari/NewsSection';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion'; 
import {   
  ChevronDown, Trophy, Flag, Star, Timer, Zap, Gauge, Award, 
  Sparkles, ArrowRight, Cpu, Coins, Gamepad2 } from 'lucide-react';

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');
  
  const homeRef = useRef(null);
  const statsRef = useRef(null);
  const predictorRef = useRef(null); 
  const newsRef = useRef(null);
  const fanzoneRef = useRef(null);

  const refs = {
    home: homeRef,
    stats: statsRef,
    predictor: predictorRef,
    news: newsRef,
    fanzone: fanzoneRef,
  };

  const handleNavigate = (sectionId) => {
    const ref = refs[sectionId];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const observerOptions = { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 };
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section');
          if (sectionId) setActiveSection(sectionId);
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    Object.entries(refs).forEach(([id, ref]) => {
      if (ref.current) {
        ref.current.setAttribute('data-section', id);
        observer.observe(ref.current);
      }
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #DC0000 1px, transparent 0)`, backgroundSize: '50px 50px' }}></div>
      </div>
      
      <div className="relative z-10">
        <Navigation activeSection={activeSection} onNavigate={handleNavigate} />
        
        <main>
          <div ref={homeRef}><HeroSection /></div>
          <div ref={statsRef}><StatsSection /></div>
          
          {/* SEZIONE AFFIANCATA: Oracle Prediction + Fan Zone */}
          <div ref={predictorRef} className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-center mb-16 tracking-tight uppercase">
                <span className="text-red-500">Esperienze</span> Interattive
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* COLONNA 1: ORACLE PREDICTION */}
                <div className="h-full">
                  <Link href="/predictions">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="relative group overflow-hidden rounded-3xl 
                                bg-gradient-to-br from-zinc-900 via-black to-zinc-950 
                                border border-white/10 p-8 cursor-pointer h-full"
                    >
                      {/* AI glow */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(239,68,68,0.18),transparent_60%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.06),transparent_55%)]" />
                      </div>

                      {/* Neural grid */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),
                                                    linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]
                                      bg-[size:48px_48px] opacity-20" />

                      <div className="relative z-10 flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.35em] uppercase text-zinc-400">
                            <Cpu className="w-4 h-4 text-red-600" />
                            AI Oracle System
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">Confidence</span>
                            <span className="text-red-500 font-bold text-sm">82%</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-3xl md:text-4xl font-black leading-tight mb-4">
                          Anticipa il
                          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
                            Prossimo GP
                          </span>
                        </h3>

                        {/* Description */}
                        <p className="text-zinc-400 mb-8 flex-grow">
                          L'algoritmo analizza dati in tempo reale, statistiche storiche e condizioni meteo. 
                          Tu fai la chiamata definitiva.
                        </p>

                        {/* AI Confidence Bar */}
                        <div className="mb-8">
                          <div className="flex justify-between text-[10px] tracking-widest uppercase text-zinc-500 mb-2">
                            <span>Prediction Accuracy</span>
                            <span>82%</span>
                          </div>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "82%" }}
                              transition={{ duration: 1.2 }}
                              className="h-full bg-gradient-to-r from-red-600 to-red-500"
                            />
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div className="mt-auto">
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="inline-flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl
                                      bg-gradient-to-r from-red-600/20 to-red-700/20 
                                      border border-red-500/30 hover:border-red-500/60
                                      transition-all group"
                          >
                            <span className="font-bold uppercase tracking-wider text-sm">
                              Accedi all'Oracolo
                            </span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </motion.div>
                        </div>

                        {/* Scan line effect */}
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: "200%" }}
                          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                          className="absolute top-0 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-red-600/60 to-transparent opacity-40"
                        />
                      </div>
                    </motion.div>
                  </Link>
                </div>

                {/* COLONNA 2: FAN ZONE */}
                <div className="h-full">
                  <Link href="/fanzone">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative group overflow-hidden rounded-3xl 
                                bg-gradient-to-br from-zinc-900 via-zinc-950 to-black 
                                border border-yellow-500/20 p-8 cursor-pointer h-full"
                    >
                      {/* Background effects */}
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                        <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-600/20 rounded-full blur-[100px]" />
                        <div className="absolute bottom-10 left-10 w-64 h-64 bg-red-600/10 rounded-full blur-[100px]" />
                      </div>

                      <div className="relative z-10 flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.35em] uppercase text-yellow-500 font-bold">
                            <Coins className="w-4 h-4" />
                            Members Club & Rewards
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-yellow-500">Live Now</span>
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-3xl md:text-4xl font-black leading-tight mb-4">
                          Entra nella
                          <span className="block text-yellow-500">
                            Fan Zone
                          </span>
                        </h3>

                        {/* Description */}
                        <p className="text-zinc-400 mb-8 flex-grow">
                          Gioca ai mini-games ufficiali, accumula SF Tokens e riscatta premi esclusivi 
                          dal merchandise ai biglietti per i GP.
                        </p>

                        {/* Games Preview */}
                        <div className="mb-8">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                              <Gamepad2 className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white">3 Mini-Games Attivi</h4>
                              <p className="text-xs text-zinc-500">Pit Stop Challenge • Qualifying Rush • Race Predictor</p>
                            </div>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div className="mt-auto">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl
                                      bg-gradient-to-r from-yellow-600/30 to-yellow-700/30 
                                      border border-yellow-500/40 hover:border-yellow-500
                                      transition-all group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
                              <Gamepad2 className="w-6 h-6 text-black" />
                            </div>
                            <div className="text-left flex-grow">
                              <span className="font-bold uppercase tracking-wider text-sm block">
                                Inizia a Giocare
                              </span>
                              <span className="text-xs text-yellow-300">+500 SF Tokens Bonus</span>
                            </div>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </div>

              </div>

              {/* Sottotitolo centrale */}
              <div className="text-center mt-12">
                <p className="text-zinc-500 text-sm max-w-2xl mx-auto">
                  Due modi unici per vivere la Formula 1: predici il futuro con la nostra AI o 
                  unisciti alla community e vinci premi esclusivi.
                </p>
              </div>
            </div>
          </div>

          <div ref={newsRef}><NewsSection /></div>
        </main>
        <Footer />
      </div>
    </div>
  );
}