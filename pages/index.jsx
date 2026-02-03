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
  const predictorRef = useRef(null); // Lo teniamo per lo scroll, ma punterà al banner
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
      {/* SFONDO (rimane uguale...) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #DC0000 1px, transparent 0)`, backgroundSize: '50px 50px' }}></div>
      </div>
      
      <div className="relative z-10">
        <Navigation activeSection={activeSection} onNavigate={handleNavigate} />
        
        <main>
          <div ref={homeRef}><HeroSection /></div>
          <div ref={statsRef}><StatsSection /></div>
          
          {/* NUOVA SEZIONE CTA PREDITTORE */}
          <div ref={predictorRef} className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <Link href="/predictions">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="relative group overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 p-8 md:p-16 cursor-pointer shadow-2xl"
                >
                  {/* Effetto luce rossa al passaggio del mouse */}
                  <div className="absolute top-0 right-0 w-1/2 h-full bg-red-600/10 blur-[100px] group-hover:bg-red-600/20 transition-all duration-500"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="text-center md:text-left flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" /> Oracle Challenge
                      </div>
                      <h2 className="text-4xl md:text-6xl font-black uppercase italic leading-none mb-6 tracking-tighter text-white">
                        Pensi di conoscere <br /> <span className="text-red-600">il futuro?</span>
                      </h2>
                      <p className="text-zinc-400 text-lg max-w-md font-medium italic">
                        Metti alla prova il tuo istinto da muretto box. Pronostica vincitore, pole e podio del prossimo GP e scala la classifica mondiale dei tifosi.
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40 group-hover:rotate-12 transition-transform duration-500">
                        <ArrowRight className="w-10 h-10 text-white" />
                      </div>
                      <span className="font-black uppercase text-[10px] tracking-[0.3em] text-red-600 group-hover:text-white transition-colors">
                        Inizia a Predire
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