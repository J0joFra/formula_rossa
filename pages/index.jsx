import React, { useRef, useState, useEffect } from 'react';
import Navigation from '../components/ferrari/Navigation';
import HeroSection from '../components/ferrari/HeroSection';
import StatsSection from '../components/ferrari/StatsSection';
import NewsSection from '../components/ferrari/NewsSection';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {   
  ChevronDown, Trophy, Flag, Star, Timer, Zap, Gauge, Award, Sparkles, ArrowRight, Cpu, Coins, Gamepad2 } from 'lucide-react';
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
      {/* background*/}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #DC0000 1px, transparent 0)`, backgroundSize: '50px 50px' }}></div>
      </div>
      
      <div className="relative z-10">
        <Navigation activeSection={activeSection} onNavigate={handleNavigate} />
        
        <main>
          <div ref={homeRef}><HeroSection /></div>
          <div ref={statsRef}><StatsSection /></div>
          
          {/* SEZIONE INTEGRATA: FAN ZONE & PREDITTORE AFFIANCATI */}
          <div className="py-28 px-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* CARD FAN ZONE */}
              <div ref={fanzoneRef}>
                <Link href="/fanzone">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative group overflow-hidden rounded-[40px] 
                              bg-gradient-to-br from-zinc-900 via-zinc-950 to-black 
                              border border-yellow-500/20 p-8 md:p-12 cursor-pointer shadow-2xl h-full flex flex-col justify-between"
                  >
                    {/* Sfondo decorativo */}
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                      <div className="absolute top-10 right-10 w-48 h-48 bg-yellow-600/20 rounded-full blur-[80px]" />
                      <div className="absolute bottom-10 left-10 w-48 h-48 bg-red-600/10 rounded-full blur-[80px]" />
                    </div>

                    <div className="relative z-10">
                      <span className="inline-flex items-center gap-2 mb-6 text-[10px] tracking-[0.35em] uppercase text-yellow-500 font-black">
                        <Coins className="w-4 h-4" />
                        Members Club
                      </span>
                      <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter text-white uppercase italic mb-6">
                        Fan <span className="text-yellow-500">Zone</span>
                      </h2>
                      <p className="text-zinc-400 text-base italic mb-8">
                        Gioca ai mini-games ufficiali, accumula SF Tokens e riscatta premi esclusivi.
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between mt-auto">
                      <div className="w-16 h-16 bg-yellow-500 rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                        <Gamepad2 className="w-8 h-8 text-black" />
                      </div>
                      <div className="flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest">
                        Play Now <ArrowRight className="w-4 h-4 text-yellow-500" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>

              {/* CARD PREDITTORE (ORACLE) */}
              <div ref={predictorRef}>
                <Link href="/predictions">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative group overflow-hidden rounded-[40px] 
                              bg-gradient-to-br from-zinc-900 via-black to-zinc-950 
                              border border-white/10 p-8 md:p-12 cursor-pointer shadow-2xl h-full flex flex-col justify-between"
                  >
                    {/* AI glow & Neural grid */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.15),transparent_70%)]" />
                    </div>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />

                    <div className="relative z-10">
                      <span className="inline-flex items-center gap-2 mb-6 text-[10px] tracking-[0.35em] uppercase text-zinc-400 font-black">
                        <Cpu className="w-4 h-4 text-red-600" />
                        AI System
                      </span>
                      <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter text-white uppercase italic mb-6">
                        Oracle <span className="text-red-600">Mode</span>
                      </h2>
                      <p className="text-zinc-400 text-base italic mb-8">
                        L’algoritmo analizza. Tu fai la chiamata. Pronostica il prossimo GP.
                      </p>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <div className="flex justify-between text-[9px] tracking-widest uppercase text-zinc-500 mb-2 font-black">
                        <span>System Confidence</span>
                        <span className="text-red-500">82%</span>
                      </div>
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "82%" }}
                          className="h-full bg-gradient-to-r from-red-600 to-red-400"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <ArrowRight className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-black">Enter Oracle</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
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