import React, { useRef, useState, useEffect } from 'react';
import Navigation from '../components/ferrari/Navigation';
import HeroSection from '../components/ferrari/HeroSection';
import StatsSection from '../components/ferrari/StatsSection';
import NewsSection from '../components/ferrari/NewsSection';
import FanZoneSection from '../components/ferrari/FanZoneSection';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

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
          
          {/* CTA PREDITTORE */}
          <div ref={predictorRef} className="py-24 px-4">
            <div className="max-w-6xl mx-auto">
              <Link href="/predictions">
                <motion.div
                  whileHover={{ scale: 1.015 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative group overflow-hidden rounded-3xl 
                            bg-gradient-to-br from-zinc-900 via-black to-zinc-950 
                            border border-white/10 p-10 md:p-16 cursor-pointer"
                >

                  {/* subtle AI glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.15),transparent_60%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.06),transparent_60%)]" />
                  </div>

                  {/* grid hint */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),
                                                linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]
                                  bg-[size:40px_40px] opacity-20" />

                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">

                    {/* TEXT */}
                    <div className="flex-1 text-center md:text-left">
                      <span className="inline-block mb-6 text-[11px] tracking-[0.35em] uppercase text-zinc-400">
                        AI Oracle
                      </span>

                      <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-white">
                        Prevedi <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
                          il prossimo GP
                        </span>
                      </h2>

                      <p className="mt-6 text-zinc-400 max-w-md text-lg">
                        Usa intuito e strategia. L’AI osserva, tu decidi.
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col items-center gap-5">
                      <motion.div
                        animate={{ boxShadow: ["0 0 0 rgba(239,68,68,0)", "0 0 40px rgba(239,68,68,0.35)", "0 0 0 rgba(239,68,68,0)"] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-20 h-20 rounded-full 
                                  bg-gradient-to-br from-red-600 to-red-700 
                                  flex items-center justify-center"
                      >
                        <ArrowRight className="w-9 h-9 text-white" />
                      </motion.div>

                      <span className="text-[10px] tracking-[0.4em] uppercase text-zinc-400 group-hover:text-white transition-colors">
                        Start Prediction
                      </span>
                    </div>

                  </div>
                </motion.div>
              </Link>
            </div>
          </div>
          <div ref={newsRef}><NewsSection /></div>
          <div ref={fanzoneRef}><FanZoneSection /></div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}