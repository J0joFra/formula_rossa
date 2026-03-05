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

/* ─────────────────────────────────────────────────────────────────────────────
   Utility: scan line animata
───────────────────────────────────────────────────────────────────────────── */
function ScanLine({ color = 'red' }) {
  const colorMap = {
    red:    'rgba(220,0,0,0.8)',
    yellow: 'rgba(234,179,8,0.8)',
    blue:   'rgba(96,165,250,0.8)',
  };
  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: '250%' }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
      className="absolute top-0 left-0 w-1/3 h-px opacity-50 pointer-events-none"
      style={{ background: `linear-gradient(to right, transparent, ${colorMap[color]}, transparent)` }}
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
        className="relative group overflow-hidden rounded-2xl cursor-pointer h-full flex flex-col"
        style={{
          background: 'linear-gradient(145deg, #0d0d0d 0%, #1a0000 50%, #0d0d0d 100%)',
          border: '1px solid rgba(220,0,0,0.25)',
          boxShadow: '0 0 0 1px rgba(220,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Ambient glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(220,0,0,0.22) 0%, transparent 65%)' }}
        />
        {/* Micro grid */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(to right,rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.1) 1px,transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <ScanLine color="red" />

        <div className="relative z-10 flex flex-col h-full p-5 md:p-7">
          {/* Badge */}
          <div className="flex items-center justify-between mb-5">
            <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.28em] uppercase text-zinc-500 font-medium">
              <Cpu className="w-3.5 h-3.5 text-red-600" />
              AI Oracle System
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-red-500 tracking-widest uppercase font-semibold">Live</span>
            </div>
          </div>

          {/* Confidence ring */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative shrink-0 w-14 h-14">
              <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
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
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-red-500">82%</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">Accuracy</p>
              <p className="text-white font-black text-xl leading-none">Oracle</p>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-black leading-none mb-3 tracking-tight">
            Anticipa il<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg,#dc0000,#ff4444)' }}>
              Prossimo GP
            </span>
          </h3>

          <p className="text-zinc-500 text-xs leading-relaxed mb-6 flex-grow">
            Algoritmo AI analizza dati storici, condizioni meteo e strategia team. Tu fai la chiamata definitiva.
          </p>

          {/* CTA */}
          <motion.div
            whileHover={{ x: 3 }}
            className="mt-auto inline-flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all duration-300"
            style={{ background: 'rgba(220,0,0,0.08)', borderColor: 'rgba(220,0,0,0.3)' }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-red-400">Accedi all'Oracolo</span>
            <ArrowRight className="w-4 h-4 text-red-500 transition-transform group-hover:translate-x-1" />
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
        className="relative group overflow-hidden rounded-2xl cursor-pointer h-full flex flex-col"
        style={{
          background: 'linear-gradient(145deg, #0d0d0b 0%, #1a1500 50%, #0d0d0b 100%)',
          border: '1px solid rgba(234,179,8,0.2)',
          boxShadow: '0 0 0 1px rgba(234,179,8,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 70% 20%, rgba(234,179,8,0.18) 0%, transparent 65%)' }}
        />
        {/* Floating particles */}
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{ background: '#eab308', left: `${20 + i * 30}%`, top: '15%', opacity: 0.3 }}
            animate={{ y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.7 }}
          />
        ))}
        <ScanLine color="yellow" />

        <div className="relative z-10 flex flex-col h-full p-5 md:p-7">
          {/* Badge */}
          <div className="flex items-center justify-between mb-5">
            <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.28em] uppercase text-yellow-500 font-bold">
              <Coins className="w-3.5 h-3.5" />
              Members Club
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-[10px] text-yellow-500 tracking-widest uppercase font-semibold">Live Now</span>
            </div>
          </div>

          {/* Token block */}
          <div className="flex items-center gap-4 mb-5">
            <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)' }}>
              <Gamepad2 className="w-7 h-7 text-yellow-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">Earn up to</p>
              <p className="text-yellow-400 font-black text-xl leading-none">+500 <span className="text-base font-bold">SF Tokens</span></p>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-black leading-none mb-3 tracking-tight">
            Entra nella<br />
            <span className="text-yellow-400">Fan Zone</span>
          </h3>

          <p className="text-zinc-500 text-xs leading-relaxed mb-4 flex-grow">
            Mini-games esclusivi, SF Tokens e premi reali: dal merchandise ai biglietti GP.
          </p>

          {/* Game pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {games.map(g => (
              <span key={g} className="text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-wider uppercase"
                style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', color: '#ca8a04' }}>
                {g}
              </span>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            whileHover={{ x: 3 }}
            className="mt-auto inline-flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all duration-300"
            style={{ background: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.3)' }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">Inizia a Giocare</span>
            <ArrowRight className="w-4 h-4 text-yellow-500 transition-transform" />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD 3 – DEEP ANALYTICS ARCHIVE
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
        className="relative group overflow-hidden rounded-2xl cursor-pointer h-full flex flex-col"
        style={{
          background: 'linear-gradient(145deg, #080d12 0%, #0a1220 50%, #080d12 100%)',
          border: '1px solid rgba(96,165,250,0.18)',
          boxShadow: '0 0 0 1px rgba(96,165,250,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(59,130,246,0.18) 0%, transparent 65%)' }}
        />
        {/* Data stream lines */}
        {[0, 1, 2, 3].map(i => (
          <motion.div key={i}
            className="absolute left-0 right-0 h-px pointer-events-none"
            style={{ top: `${20 + i * 22}%`, background: 'linear-gradient(to right, transparent, rgba(96,165,250,0.6), transparent)', opacity: 0.07 }}
            animate={{ opacity: [0.04, 0.12, 0.04] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.6 }}
          />
        ))}
        <ScanLine color="blue" />

        <div className="relative z-10 flex flex-col h-full p-5 md:p-7">
          {/* Badge */}
          <div className="flex items-center justify-between mb-5">
            <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.28em] uppercase text-blue-400 font-medium">
              <Database className="w-3.5 h-3.5" />
              Analytics Archive
            </span>
            <div className="flex items-center gap-1.5">
              <History className="w-3 h-3 text-zinc-600" />
              <span className="text-[10px] text-zinc-600 tracking-widest uppercase font-medium">1950 → 2025</span>
            </div>
          </div>

          {/* Icon block */}
          <div className="flex items-center gap-4 mb-5">
            <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <BarChart2 className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">Ferrari F1 Data</p>
              <p className="text-white font-black text-xl leading-none">Deep <span className="text-blue-400">Analytics</span></p>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-black leading-none mb-3 tracking-tight">
            Archivio<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg,#60a5fa,#93c5fd)' }}>
              Storico F1
            </span>
          </h3>

          <p className="text-zinc-500 text-xs leading-relaxed mb-5 flex-grow">
            Oltre 74 anni di dati Ferrari: telemetria, classifiche, pit stop e strategie in grafici interattivi.
          </p>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {stats.map(s => (
              <div key={s.label} className="text-center py-2 rounded-lg"
                style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.12)' }}>
                <p className="text-blue-400 font-black text-sm leading-none">{s.value}</p>
                <p className="text-zinc-600 text-[9px] uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            whileHover={{ x: 3 }}
            className="mt-auto inline-flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all duration-300"
            style={{ background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.25)' }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Esplora l'Archivio</span>
            <ArrowRight className="w-4 h-4 text-blue-500 transition-transform" />
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
        <div className="absolute inset-0 opacity-5"
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
          <div ref={predictorRef} className="py-16 md:py-24 px-4">
            <div className="max-w-7xl mx-auto">

              {/* Heading */}
              <div className="text-center mb-10 md:mb-14">
                <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 mb-3 font-medium">
                  Formula Rossa Platform
                </p>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
                  <span className="text-red-500">Esperienze</span> Interattive
                </h2>
                <p className="text-zinc-600 text-sm mt-4 max-w-lg mx-auto leading-relaxed">
                  Tre strumenti unici per vivere la Ferrari F1 ad un livello completamente diverso.
                </p>
              </div>

              {/* Three cards affiancate */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-5 items-stretch">
                <OracleCard />
                <FanZoneCard />
                <ArchiveCard />
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
