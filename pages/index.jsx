import React, { useRef, useState, useEffect } from 'react';
import Navigation from '../components/ferrari/Navigation';
import HeroSection from '../components/ferrari/HeroSection';
import StatsSection from '../components/ferrari/StatsSection';
import NewsSection from '../components/ferrari/NewsSection';
import Footer from '../components/ferrari/Footer';
import SEO from '../components/seo';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Coins, Gamepad2, Database, BarChart2, History } from 'lucide-react';
import s from '../styles/cards.module.css';

/* ─────────────────────────────────────────────────────────────────────────────
   Utility: scan line animata
───────────────────────────────────────────────────────────────────────────── */
function ScanLine({ color = 'red' }) {
  const cls = color === 'red' ? s.scanRed : color === 'yellow' ? s.scanYellow : s.scanBlue;
  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: '250%' }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
      className={`absolute top-0 left-0 w-1/3 h-px opacity-50 pointer-events-none ${cls}`}
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD 1 – AI ORACLE
───────────────────────────────────────────────────────────────────────────── */
function OracleCard() {
  return (
    <Link href="/predictions" className="flex-1 min-w-0">
      <motion.div
        whileHover={{ scale: 1.025, y: -4 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`relative group overflow-hidden rounded-2xl cursor-pointer h-full flex flex-col ${s.oracleCard}`}
      >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${s.oracleGlow}`} aria-hidden="true" />
        <div className={`absolute inset-0 opacity-[0.06] pointer-events-none ${s.oracleMicroGrid}`} aria-hidden="true" />
        <ScanLine color="red" />

        <div className="relative z-10 flex flex-col h-full p-5 md:p-7">
          <div className="flex items-center justify-between mb-5">
            <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.28em] uppercase text-zinc-500 font-medium">
              <Cpu className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
              AI Oracle System
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
              <span className="text-[10px] text-red-500 tracking-widest uppercase font-semibold">Live</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="relative shrink-0 w-14 h-14">
              <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90" aria-hidden="true">
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(220,0,0,0.15)" strokeWidth="4" />
                <motion.circle
                  cx="28" cy="28" r="22" fill="none"
                  stroke="rgba(220,0,0,0.85)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 22 * 0.18 }}
                  transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-red-500" aria-label="Accuracy 82%">82%</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">Accuracy</p>
              <p className="text-white font-black text-xl leading-none">Oracle</p>
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-black leading-none mb-3 tracking-tight">
            Anticipa il<br />
            <span className={`text-transparent bg-clip-text ${s.oracleTitleGradient}`}>
              Prossimo GP
            </span>
          </h3>

          <p className="text-zinc-500 text-xs leading-relaxed mb-6 flex-grow">
            Algoritmo AI analizza dati storici, condizioni meteo e strategia team. Tu fai la chiamata definitiva.
          </p>

          <motion.div
            whileHover={{ x: 3 }}
            className={`mt-auto inline-flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all duration-300 ${s.oracleCta}`}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-red-400">Accedi all'Oracolo</span>
            <ArrowRight className="w-4 h-4 text-red-500 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD 2 – FAN ZONE
───────────────────────────────────────────────────────────────────────────── */
function FanZoneCard() {
  const games = ['Pit Stop', 'Qualifying', 'Predictor'];
  return (
    <Link href="/fanzone" className="flex-1 min-w-0">
      <motion.div
        whileHover={{ scale: 1.025, y: -4 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`relative group overflow-hidden rounded-2xl cursor-pointer h-full flex flex-col ${s.fanzoneCard}`}
      >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${s.fanzoneGlow}`} aria-hidden="true" />
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            className="absolute w-1 h-1 rounded-full pointer-events-none bg-yellow-400"
            style={{ left: `${20 + i * 30}%`, top: '15%', opacity: 0.3 }}
            animate={{ y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.7 }}
            aria-hidden="true"
          />
        ))}
        <ScanLine color="yellow" />

        <div className="relative z-10 flex flex-col h-full p-5 md:p-7">
          <div className="flex items-center justify-between mb-5">
            <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.28em] uppercase text-yellow-500 font-bold">
              <Coins className="w-3.5 h-3.5" aria-hidden="true" />
              Members Club
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" aria-hidden="true" />
              <span className="text-[10px] text-yellow-500 tracking-widest uppercase font-semibold">Live Now</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${s.fanzoneIconBox}`}>
              <Gamepad2 className="w-7 h-7 text-yellow-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">Earn up to</p>
              <p className="text-yellow-400 font-black text-xl leading-none">+500 <span className="text-base font-bold">SF Tokens</span></p>
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-black leading-none mb-3 tracking-tight">
            Entra nella<br />
            <span className="text-yellow-400">Fan Zone</span>
          </h3>

          <p className="text-zinc-500 text-xs leading-relaxed mb-4 flex-grow">
            Mini-games esclusivi, SF Tokens e premi reali: dal merchandise ai biglietti GP.
          </p>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {games.map(g => (
              <span key={g} className={`text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-wider uppercase ${s.fanzonePill}`}>
                {g}
              </span>
            ))}
          </div>

          <motion.div
            whileHover={{ x: 3 }}
            className={`mt-auto inline-flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all duration-300 ${s.fanzoneCta}`}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">Inizia a Giocare</span>
            <ArrowRight className="w-4 h-4 text-yellow-500 transition-transform" aria-hidden="true" />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD 3 – DEEP ANALYTICS ARCHIVE → /statistics
───────────────────────────────────────────────────────────────────────────── */
function ArchiveCard() {
  const stats = [
    { label: 'Stagioni', value: '74+' },
    { label: 'GP Analizzati', value: '1.1K+' },
    { label: 'Dataset', value: '48M' },
  ];
  return (
    <Link href="/statistics" className="flex-1 min-w-0">
      <motion.div
        whileHover={{ scale: 1.025, y: -4 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`relative group overflow-hidden rounded-2xl cursor-pointer h-full flex flex-col ${s.archiveCard}`}
      >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${s.archiveGlow}`} aria-hidden="true" />
        {[0, 1, 2, 3].map(i => (
          <motion.div key={i}
            className={`absolute left-0 right-0 h-px pointer-events-none ${s.archiveStreamLine}`}
            style={{ top: `${20 + i * 22}%`, opacity: 0.07 }}
            animate={{ opacity: [0.04, 0.12, 0.04] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.6 }}
            aria-hidden="true"
          />
        ))}
        <ScanLine color="blue" />

        <div className="relative z-10 flex flex-col h-full p-5 md:p-7">
          <div className="flex items-center justify-between mb-5">
            <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.28em] uppercase text-blue-400 font-medium">
              <Database className="w-3.5 h-3.5" aria-hidden="true" />
              Analytics Archive
            </span>
            <div className="flex items-center gap-1.5">
              <History className="w-3 h-3 text-zinc-600" aria-hidden="true" />
              <span className="text-[10px] text-zinc-600 tracking-widest uppercase font-medium">1950 → 2025</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${s.archiveIconBox}`}>
              <BarChart2 className="w-7 h-7 text-blue-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">Ferrari F1 Data</p>
              <p className="text-white font-black text-xl leading-none">Deep <span className="text-blue-400">Analytics</span></p>
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-black leading-none mb-3 tracking-tight">
            Archivio<br />
            <span className={`text-transparent bg-clip-text ${s.archiveTitleGradient}`}>
              Storico F1
            </span>
          </h3>

          <p className="text-zinc-500 text-xs leading-relaxed mb-5 flex-grow">
            Oltre 74 anni di dati Ferrari: telemetria, classifiche, pit stop e strategie in grafici interattivi.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {stats.map(st => (
              <div key={st.label} className={`text-center py-2 rounded-lg ${s.archiveStatBox}`}>
                <p className="text-blue-400 font-black text-sm leading-none">{st.value}</p>
                <p className="text-zinc-600 text-[9px] uppercase tracking-wider mt-0.5">{st.label}</p>
              </div>
            ))}
          </div>

          <motion.div
            whileHover={{ x: 3 }}
            className={`mt-auto inline-flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all duration-300 ${s.archiveCta}`}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Esplora l'Archivio</span>
            <ArrowRight className="w-4 h-4 text-blue-500 transition-transform" aria-hidden="true" />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function Home() {
  const [activeSection, setActiveSection] = useState('home');

  const homeRef      = useRef(null);
  const statsRef     = useRef(null);
  const predictorRef = useRef(null);
  const newsRef      = useRef(null);
  const fanzoneRef   = useRef(null);

  const refs = { home: homeRef, stats: statsRef, predictor: predictorRef, news: newsRef, fanzone: fanzoneRef };

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
      if (ref.current) { ref.current.setAttribute('data-section', id); observer.observe(ref.current); }
    });
    return () => observer.disconnect();
  }, []);

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

  /* ── Organization schema — migliora Knowledge Panel Google ── */
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Formula Rossa',
    url: 'https://formula-rossa.it',
    logo: 'https://formula-rossa.it/data/images/formula-rossa-logo.png',
    foundingDate: '2024',
    description: 'Piattaforma indipendente italiana di data intelligence sulla Scuderia Ferrari in Formula 1.',
    sameAs: [
      'https://www.instagram.com/formularossa.it',
      'https://www.linkedin.com/company/formula-rossa/',
      'https://www.youtube.com/@jofrancalanci',
      'https://www.x.com/jofrancalanci',
      'https://whatsapp.com/channel/0029Vb7EagL6WaKvnD5Slm30',
    ],
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      <SEO
        title="Statistiche e Analisi Dati Ferrari F1"
        description="Formula Rossa è la piattaforma definitiva per i tifosi della Scuderia Ferrari. Esplora statistiche F1, dati storici e grafici interattivi della Rossa."
        path="/"
        jsonLd={homeJsonLd}
      />

      {/* Organization schema — separato dal WebSite schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* Background dot grid — CSS module invece di inline style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className={`absolute inset-0 opacity-5 ${s.dotGrid}`} />
      </div>

      <div className="relative z-10">
        <Navigation activeSection={activeSection} onNavigate={handleNavigate} />

        <main>
          <div ref={homeRef}><HeroSection /></div>
          <div ref={statsRef}><StatsSection /></div>

          {/* Esperienze Interattive */}
          <div ref={predictorRef} className="py-16 md:py-24 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10 md:mb-14">
                <p className="text-[10px] tracking-[0.4em] uppercase mb-3 font-medium">
                  <span className="text-emerald-600">Formula </span>{' '}
                  <span className="text-slate-100">Rossa </span>{' '}
                  <span className="text-red-600">Platform </span>
                </p>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
                  <span className="text-red-500">Esperienze</span> Interattive
                </h2>
              </div>
              <div className="flex flex-col md:flex-row gap-4 md:gap-5 items-stretch">
                <OracleCard />
                <FanZoneCard />
                <ArchiveCard />
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