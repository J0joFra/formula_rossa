import React, { useRef, useState, useEffect } from 'react';
import Navigation from '../components/ferrari/Navigation';
import HeroSection from '../components/ferrari/HeroSection';
import StatsSection from '../components/ferrari/StatsSection';
import NewsSection from '../components/ferrari/NewsSection';
import Footer from '../components/ferrari/Footer';
import SEO from '../components/seo';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion'; 
import {   
  ChevronDown, Trophy, Flag, Star, Timer, Zap, Gauge, Award, 
  Sparkles, ArrowRight, Cpu, Coins, Gamepad2 } from 'lucide-react';

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');
  
  const homeRef      = useRef(null);
  const statsRef     = useRef(null);
  const predictorRef = useRef(null); 
  const newsRef      = useRef(null);
  const fanzoneRef   = useRef(null);

  const refs = {
    home:      homeRef,
    stats:     statsRef,
    predictor: predictorRef,
    news:      newsRef,
    fanzone:   fanzoneRef,
  };

  const handleNavigate = (sectionId) => {
    const ref = refs[sectionId];
    if (ref?.current) ref.current.scrollIntoView({ behavior: 'smooth' });
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

  /* ── Dati strutturati JSON-LD per la homepage ── */
  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Formula Rossa',
    url: 'https://formula-rossa.it',
    description: 'Piattaforma di statistiche e analisi dati della Scuderia Ferrari F1.',
    inLanguage: 'it',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://formula-rossa.it/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      <SEO
        title="Statistiche e Analisi Dati Ferrari F1"
        description="Formula Rossa è la piattaforma definitiva per i tifosi della Scuderia Ferrari. Esplora statistiche F1, dati storici e grafici interattivi della Rossa."
        path="/"
        jsonLd={homeJsonLd}
      />

      {/* Background dot grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #DC0000 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10">
        <Navigation activeSection={activeSection} onNavigate={handleNavigate} />

        <main>
          <div ref={homeRef}><HeroSection /></div>
          <div ref={statsRef}><StatsSection /></div>

          {/* ── SEZIONE ESPERIENZE INTERATTIVE ── */}
          <div ref={predictorRef} className="py-12 sm:py-16 md:py-20 px-3 sm:px-4">
            <div className="max-w-7xl mx-auto">

              {/* Titolo — scala fluida */}
              <h2 className="
                text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                font-black text-center mb-8 sm:mb-12 md:mb-16
                tracking-tight uppercase
              ">
                <span className="text-red-500">Esperienze</span> Interattive
              </h2>

              {/*
                Grid: 2 colonne già da 480 px (xs),
                con gap ridotto su schermi piccoli.
              */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-8">

                {/* ── COLONNA 1: ORACLE PREDICTION ── */}
                <div className="h-full">
                  <Link href="/predictions">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="
                        relative group overflow-hidden rounded-2xl sm:rounded-3xl
                        bg-gradient-to-br from-zinc-900 via-black to-zinc-950
                        border border-white/10
                        p-3 sm:p-5 md:p-8
                        cursor-pointer h-full
                      "
                    >
                      {/* AI glow */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(239,68,68,0.18),transparent_60%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.06),transparent_55%)]" />
                      </div>

                      {/* Neural grid */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />

                      <div className="relative z-10 flex flex-col h-full">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 sm:mb-5 md:mb-6 gap-2">
                          <span className="
                            inline-flex items-center gap-1 sm:gap-2
                            text-[9px] sm:text-[10px] md:text-[11px]
                            tracking-[0.2em] sm:tracking-[0.35em]
                            uppercase text-zinc-400
                          ">
                            <Cpu className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 shrink-0" />
                            <span className="hidden xs:inline">AI Oracle System</span>
                            <span className="xs:hidden">AI Oracle</span>
                          </span>
                          {/* Confidence — nascosta su schermi molto piccoli */}
                          <div className="hidden sm:flex items-center gap-1 sm:gap-2 shrink-0">
                            <span className="text-[10px] sm:text-xs text-zinc-500">Confidence</span>
                            <span className="text-red-500 font-bold text-xs sm:text-sm">82%</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="
                          text-base sm:text-2xl md:text-3xl lg:text-4xl
                          font-black leading-tight mb-2 sm:mb-3 md:mb-4
                        ">
                          Anticipa il
                          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
                            Prossimo GP
                          </span>
                        </h3>

                        {/* Description — abbreviata su mobile */}
                        <p className="text-zinc-400 mb-3 sm:mb-6 md:mb-8 flex-grow text-[11px] sm:text-sm leading-relaxed">
                          <span className="hidden sm:inline">
                            L'algoritmo analizza dati in tempo reale, statistiche storiche e condizioni meteo.
                            Tu fai la chiamata definitiva.
                          </span>
                          <span className="sm:hidden">
                            AI + dati storici + meteo. Tu fai la chiamata.
                          </span>
                        </p>

                        {/* Confidence bar — visibile solo da sm */}
                        <div className="hidden sm:block mb-6 md:mb-8">
                          <div className="flex justify-between text-[10px] tracking-widest uppercase text-zinc-500 mb-2">
                            <span>Accuracy</span>
                            <span>82%</span>
                          </div>
                          <div className="h-1.5 sm:h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '82%' }}
                              transition={{ duration: 1.2 }}
                              className="h-full bg-gradient-to-r from-red-600 to-red-500"
                            />
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-auto">
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="
                              inline-flex items-center justify-center gap-2
                              w-full py-2.5 sm:py-3 md:py-4
                              px-3 sm:px-5 md:px-6
                              rounded-lg sm:rounded-xl
                              bg-gradient-to-r from-red-600/20 to-red-700/20
                              border border-red-500/30 hover:border-red-500/60
                              transition-all group
                            "
                          >
                            <span className="font-bold uppercase tracking-wider text-[10px] sm:text-xs md:text-sm">
                              <span className="hidden sm:inline">Accedi all'Oracolo</span>
                              <span className="sm:hidden">Oracolo</span>
                            </span>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                          </motion.div>
                        </div>

                        {/* Scan line */}
                        <motion.div
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                          className="absolute top-0 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-red-600/60 to-transparent opacity-40"
                        />
                      </div>
                    </motion.div>
                  </Link>
                </div>

                {/* ── COLONNA 2: FAN ZONE ── */}
                <div className="h-full">
                  <Link href="/fanzone">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="
                        relative group overflow-hidden rounded-2xl sm:rounded-3xl
                        bg-gradient-to-br from-zinc-900 via-zinc-950 to-black
                        border border-yellow-500/20
                        p-3 sm:p-5 md:p-8
                        cursor-pointer h-full
                      "
                    >
                      {/* Background glow */}
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                        <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-600/20 rounded-full blur-[100px]" />
                        <div className="absolute bottom-10 left-10 w-64 h-64 bg-red-600/10 rounded-full blur-[100px]" />
                      </div>

                      <div className="relative z-10 flex flex-col h-full">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 sm:mb-5 md:mb-6 gap-2">
                          <span className="
                            inline-flex items-center gap-1 sm:gap-2
                            text-[9px] sm:text-[10px] md:text-[11px]
                            tracking-[0.2em] sm:tracking-[0.35em]
                            uppercase text-yellow-500 font-bold
                          ">
                            <Coins className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            <span className="hidden xs:inline">Members Club</span>
                            <span className="xs:hidden">Club</span>
                          </span>
                          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                            <span className="hidden sm:inline text-xs text-yellow-500">Live Now</span>
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="
                          text-base sm:text-2xl md:text-3xl lg:text-4xl
                          font-black leading-tight mb-2 sm:mb-3 md:mb-4
                        ">
                          Entra nella
                          <span className="block text-yellow-500">Fan Zone</span>
                        </h3>

                        {/* Description */}
                        <p className="text-zinc-400 mb-3 sm:mb-6 md:mb-8 flex-grow text-[11px] sm:text-sm leading-relaxed">
                          <span className="hidden sm:inline">
                            Gioca ai mini-games ufficiali, accumula SF Tokens e riscatta premi esclusivi
                            dal merchandise ai biglietti per i GP.
                          </span>
                          <span className="sm:hidden">
                            Mini-games, SF Tokens e premi esclusivi.
                          </span>
                        </p>

                        {/* Games preview — solo da sm */}
                        <div className="hidden sm:block mb-6 md:mb-8">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                              <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm md:text-base">3 Mini-Games Attivi</h4>
                              <p className="text-[10px] md:text-xs text-zinc-500">Pit Stop • Qualifying • Predictor</p>
                            </div>
                          </div>
                        </div>

                        {/* Icona mini su mobile al posto del games preview */}
                        <div className="sm:hidden mb-3 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                            <Gamepad2 className="w-4 h-4 text-yellow-500" />
                          </div>
                          <span className="text-[10px] text-zinc-400">3 Mini-Games</span>
                        </div>

                        {/* CTA */}
                        <div className="mt-auto">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="
                              inline-flex items-center justify-center gap-2
                              w-full py-2.5 sm:py-3 md:py-4
                              px-3 sm:px-5 md:px-6
                              rounded-lg sm:rounded-xl
                              bg-gradient-to-r from-yellow-600/30 to-yellow-700/30
                              border border-yellow-500/40 hover:border-yellow-500
                              transition-all group
                            "
                          >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-md sm:rounded-lg bg-yellow-500 flex items-center justify-center shrink-0">
                              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-black" />
                            </div>
                            <div className="text-left flex-grow min-w-0">
                              <span className="font-bold uppercase tracking-wider text-[10px] sm:text-xs md:text-sm block truncate">
                                <span className="hidden sm:inline">Inizia a Giocare</span>
                                <span className="sm:hidden">Gioca</span>
                              </span>
                              <span className="hidden sm:block text-[10px] sm:text-xs text-yellow-300">+500 SF Tokens</span>
                            </div>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </div>

              </div>

              {/* Sottotitolo */}
              <div className="text-center mt-8 sm:mt-10 md:mt-12">
                <p className="text-zinc-500 text-[11px] sm:text-sm max-w-2xl mx-auto px-2">
                  <span className="hidden sm:inline">
                    Due modi unici per vivere la Formula 1: predici il futuro con la nostra AI o
                    unisciti alla community e vinci premi esclusivi.
                  </span>
                  <span className="sm:hidden">
                    Predici il GP con l'AI o unisciti alla community.
                  </span>
                </p>
              </div>

            </div>
          </div>
          {/* ─────────────────────────────────────── */}

          <div ref={newsRef}><NewsSection /></div>
        </main>

        <Footer />
      </div>
    </div>
  );
}