// pages/about.jsx
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import SEO from '../components/seo';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getHeroImages } from '../lib/getHeroImages';
import {
  Database, BarChart3, Users, Zap, Trophy,
  Globe, Heart, Github, Linkedin, Youtube, Instagram,
  ChevronRight, Flag, Activity, ExternalLink,
  Award, Target,
} from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

/* ─────────────────────────── DATI ─────────────────────────── */

const FOUNDER = {
  name: 'Joaquim Francalanci',
  role: 'Founder & Developer',
  github: 'https://github.com/J0joFra',
  linkedin: 'https://www.linkedin.com/company/formula-rossa/',
  youtube: 'https://www.youtube.com/@jofrancalanci',
  instagram: 'https://www.instagram.com/formularossa.it',
};

const STATS = [
  { value: '75+',   label: 'Anni di storia Ferrari', icon: Trophy,   glow: 'shadow-red-600/40',   ring: 'from-red-500 to-red-700',   num: 'text-red-500'    },
  { value: '1000+', label: 'Gare analizzate',         icon: Flag,     glow: 'shadow-yellow-500/30', ring: 'from-yellow-400 to-amber-600', num: 'text-yellow-400' },
  { value: '100+',  label: 'Piloti nel database',     icon: Users,    glow: 'shadow-red-600/40',   ring: 'from-red-500 to-red-700',   num: 'text-red-500'    },
  { value: '500K+', label: 'Datapoint elaborati',     icon: Database, glow: 'shadow-yellow-500/30', ring: 'from-yellow-400 to-amber-600', num: 'text-yellow-400' },
];

const VALUES = [
  { icon: Target, title: 'Trasparenza', desc: 'Tutti i dati sono verificabili e tracciabili, con fonti ufficiali citate.',          color: 'from-red-600/20 to-transparent',    border: 'hover:border-red-600/40',    iconBg: 'bg-red-600/15',    iconColor: 'text-red-500'    },
  { icon: Heart,  title: 'Passione',    desc: 'Costruito da tifosi per tifosi, con attenzione ai dettagli che contano.',             color: 'from-yellow-500/15 to-transparent', border: 'hover:border-yellow-500/40', iconBg: 'bg-yellow-500/10', iconColor: 'text-yellow-400' },
  { icon: Award,  title: 'Qualità',     desc: 'Design curato, performance ottimizzata, esperienza utente premium.',                  color: 'from-red-600/20 to-transparent',    border: 'hover:border-red-600/40',    iconBg: 'bg-red-600/15',    iconColor: 'text-red-500'    },
  { icon: Users,  title: 'Community',   desc: 'Uno spazio dove i tifosi possono interagire, competere e condividere.',               color: 'from-yellow-500/15 to-transparent', border: 'hover:border-yellow-500/40', iconBg: 'bg-yellow-500/10', iconColor: 'text-yellow-400' },
];

const FEATURES = [
  {
    icon: BarChart3, title: 'Statistiche Storiche',
    gradient: 'from-red-600 to-red-900', glow: 'group-hover:shadow-red-600/20',
    desc: 'Dal 1950 ad oggi: vittorie, pole position, giri veloci e punti campionato per ogni stagione Ferrari. Dati verificati e aggiornati ad ogni Gran Premio.',
    highlights: ['245 vittorie', '243 pole position', '16 titoli costruttori'],
    tag: 'Storico',
  },
  {
    icon: Zap, title: 'AI Predictor',
    gradient: 'from-yellow-500 to-amber-700', glow: 'group-hover:shadow-yellow-500/20',
    desc: "Algoritmo che analizza dati storici, meteo e forma recente per generare previsioni con accuratezza superiore all'80%.",
    highlights: ['80% accuratezza', 'Machine Learning', 'Real-time'],
    tag: 'AI',
  },
  {
    icon: Users, title: 'Fan Zone',
    gradient: 'from-red-500 to-rose-700', glow: 'group-hover:shadow-rose-600/20',
    desc: 'Mini-games, classifiche globali e SF Tokens. La passione Ferrari diventa esperienza interattiva con migliaia di tifosi.',
    highlights: ['10K+ utenti', 'Mini-games', 'Rewards'],
    tag: 'Community',
  },
  {
    icon: Database, title: 'Database F1DB',
    gradient: 'from-zinc-500 to-zinc-700', glow: 'group-hover:shadow-zinc-500/20',
    desc: 'Dati dal progetto open-source F1DB, arricchiti con fonti ufficiali FIA. Ogni record è tracciabile e verificabile.',
    highlights: ['Open source', 'Verificato FIA', '60+ anni'],
    tag: 'Dati',
  },
  {
    icon: Activity, title: 'Live Timing',
    gradient: 'from-red-600 to-red-900', glow: 'group-hover:shadow-red-600/20',
    desc: 'Durante i weekend di gara, aggiornamenti in tempo reale su classifiche, tempi e radiocomandi dal box Ferrari.',
    highlights: ['Real-time', 'Team radio', 'Settori'],
    tag: 'Live',
  },
  {
    icon: Globe, title: 'Multipiattaforma',
    gradient: 'from-amber-500 to-yellow-700', glow: 'group-hover:shadow-amber-500/20',
    desc: 'Formula Rossa è ottimizzata per ogni dispositivo: desktop, tablet e mobile. Accessibile ovunque.',
    highlights: ['Responsive', 'PWA ready', 'Mobile first'],
    tag: 'UX',
  },
];

const TIMELINE = [
  { year: 'Dic 2025', event: 'Idea e primo prototipo', desc: "Nasce l'idea di creare la piattaforma dati Ferrari definitiva per i tifosi.", icon: '💡', color: 'border-yellow-500/40 bg-yellow-500/10', dot: 'bg-yellow-500' },
  { year: 'Gen 2026', event: 'Lancio Beta',              desc: 'Prima versione pubblica con statistiche storiche e confronto piloti.',          icon: '🚀', color: 'border-red-600/40 bg-red-600/10',    dot: 'bg-red-500'    },
  { year: 'Feb 2026', event: 'AI Predictor',             desc: "Integrazione dell'algoritmo di previsione basato su machine learning.",          icon: '🤖', color: 'border-yellow-500/40 bg-yellow-500/10', dot: 'bg-yellow-500' },
  { year: 'Feb 2026', event: 'Fan Zone',                 desc: 'Lancio della community interattiva con mini-games e sistema di reward.',          icon: '🏆', color: 'border-red-600/40 bg-red-600/10',    dot: 'bg-red-500'    },
  { year: 'Mar 2026', event: 'Versione ufficiale',       desc: 'Prima versione completa con dati real-time e integrazione app.',                 icon: '🏎️', color: 'border-yellow-500/40 bg-yellow-500/10', dot: 'bg-yellow-500' },
];

const YOUTUBE_VIDEOS = [
  { id: 'Ku6j9PU_kAY', title: 'Presentazione Formula Rossa',     views: '2.5K', duration: '12:34' },
  { id: 'sOelL-Jfw6o', title: 'Analisi GP Monaco 2025',          views: '1.8K', duration: '18:22' },
  { id: 'RhIJ3ghifzc', title: 'Storia Ferrari: 75 anni di dati', views: '3.2K', duration: '24:15' },
];

const TECH_STACK = [
  { name: 'Next.js 14', category: 'Framework',  color: 'hover:border-white/30 hover:text-white'     },
  { name: 'React 18',   category: 'UI Library', color: 'hover:border-sky-500/40 hover:text-sky-300' },
  { name: 'Tailwind',   category: 'Styling',    color: 'hover:border-cyan-500/40 hover:text-cyan-300' },
  { name: 'Framer',     category: 'Animations', color: 'hover:border-purple-500/40 hover:text-purple-300' },
  { name: 'Recharts',   category: 'Data Viz',   color: 'hover:border-green-500/40 hover:text-green-300' },
  { name: 'F1DB',       category: 'Data',       color: 'hover:border-red-500/40 hover:text-red-300'  },
  { name: 'Next-Auth',  category: 'Auth',       color: 'hover:border-yellow-500/40 hover:text-yellow-300' },
  { name: 'Vercel',     category: 'Hosting',    color: 'hover:border-white/30 hover:text-white'      },
];

/* ─────────────────────── COMPONENTI ─────────────────────── */

function SectionLabel({ children, color = 'text-red-500/60' }) {
  return (
    <span className={`block text-[10px] font-black uppercase tracking-[0.3em] ${color} mb-4`}>
      {children}
    </span>
  );
}

function SectionTitle({ children, className = '' }) {
  return (
    <h2 className={`text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-[0.92] ${className}`}>
      {children}
    </h2>
  );
}

function YouTubeEmbed({ videoId, title, views, duration, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className="group"
    >
      <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-zinc-900/60 transition-all duration-500 group-hover:border-red-600/30 group-hover:shadow-2xl group-hover:shadow-red-600/10">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&color=red`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        </div>
        <div className="px-4 py-3 border-t border-white/[0.05] flex items-center justify-between gap-3 bg-zinc-900/40">
          <div className="min-w-0">
            <p className="text-white/80 text-[11px] font-bold truncate leading-tight">{title}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-zinc-500 text-[10px] font-mono">👁 {views}</span>
              <span className="text-zinc-500 text-[10px] font-mono">⏱ {duration}</span>
            </div>
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-600/10 hover:bg-red-600 border border-red-600/20 hover:border-red-600 flex items-center justify-center transition-all duration-200"
          >
            <ExternalLink className="w-3 h-3 text-red-500 group-hover:text-white" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── PAGINA ───────────────────────── */

export default function AboutPage({ heroImages = [] }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  const realImages = heroImages.filter(
    (img) => img?.urls?.regular && !img.urls.regular.includes('pinterest')
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Chi Siamo — Formula Rossa',
    url: 'https://formula-rossa.it/about',
    description: 'Formula Rossa è una piattaforma indipendente di data intelligence dedicata alla Scuderia Ferrari in Formula 1, fondata da Joaquim Francalanci.',
    mainEntity: {
      '@type': 'Person',
      name: 'Joaquim Francalanci',
      jobTitle: 'Founder & Full-Stack Developer',
      url: 'https://github.com/J0joFra',
      sameAs: [FOUNDER.github, FOUNDER.linkedin],
    },
  };

  return (
    <>
      <SEO
        title="Chi Siamo"
        description="Formula Rossa è una piattaforma indipendente di data intelligence dedicata alla Scuderia Ferrari in Formula 1."
        path="/about"
        jsonLd={jsonLd}
      />

      <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
        <Navigation />
        <main className="pt-20">

          {/* ══════════════════════════════════════
              1. HERO
          ══════════════════════════════════════ */}
          <section
            ref={heroRef}
            className="relative min-h-[92vh] flex items-center py-24 px-4 overflow-hidden"
            aria-label="Presentazione Formula Rossa"
          >
            {/* Sfondi stratificati (rimangono invariati) */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #DC0000 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }} />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-48 -left-48 w-[800px] h-[800px] bg-red-600 rounded-full blur-[200px]"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute -bottom-32 right-0 w-[500px] h-[500px] bg-yellow-500 rounded-full blur-[160px]"
              />
              <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-red-600/15 to-transparent" />
              <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-yellow-500/8 to-transparent" />
              <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-600/[0.03] to-transparent" />
            </div>

            <div className="relative max-w-7xl mx-auto w-full">
              <div className="grid lg:grid-cols-2 gap-16 items-center">

                {/* Testo hero */}
                <motion.div style={{ y: heroY, opacity: heroOpacity }}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600/20 to-red-600/5 border border-red-600/30 text-red-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                  >
                    <Heart className="w-3 h-3 fill-red-500" />
                    Il Progetto
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-3xl md:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter whitespace-nowrap mb-6"
                  >
                    Una piattaforma <span className="text-red-600">rampante</span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-zinc-400 text-[15px] leading-relaxed max-w-lg mb-10"
                  >
                    Un archivio vivente di 75 anni di storia, da Ascari a Leclerc.
                    Ogni vittoria, ogni pole, ogni stagione — raccontata attraverso
                    i numeri e resa visiva per chi ama davvero il Cavallino Rampante.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="flex flex-wrap gap-4"
                  >
                    <Link
                      href="/statistics"
                      className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black uppercase text-[11px] tracking-widest rounded-xl transition-all shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.02]"
                    >
                      Esplora le Statistiche <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/fanzone"
                      className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/15 hover:border-yellow-500/40 text-white hover:text-yellow-300 font-black uppercase text-[11px] tracking-widest rounded-xl transition-all"
                    >
                      Fan Zone
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Immagine Singola [3] */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative flex justify-center lg:justify-end"
                >
                  {/* Numero "75" decorativo */}
                  <div className="absolute -top-12 -right-6 text-[180px] font-black leading-none select-none pointer-events-none italic bg-gradient-to-b from-red-600/10 to-transparent bg-clip-text text-transparent z-0">
                    75
                  </div>

                  {/* Contenitore Immagine [3] */}
                  <div className="relative z-10 w-[200px] md:w-[280px] aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900 border border-white/[0.08] shadow-2xl shadow-black/60 ring-1 ring-white/10">
                    {realImages[3] && (
                      <img 
                        src={realImages[3].urls.regular} 
                        alt={realImages[3].alt_description ?? 'Ferrari F1 Detail'} 
                        className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" 
                      />
                    )}
                    {/* Overlay per profondità */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                </motion.div>

              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════
              2. IL NOSTRO IMPEGNO — card premium
          ══════════════════════════════════════ */}
          <section className="py-28 px-4 relative overflow-hidden" aria-label="Il nostro impegno">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-red-600/50 to-transparent" />

            <div className="max-w-6xl mx-auto">
              {/* Header sezione */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <SectionLabel>Il nostro impegno</SectionLabel>
                <SectionTitle>
                  Dati al servizio dei <span className="text-red-600">Tifosi</span>
                </SectionTitle>
              </motion.div>

              {/* Card grandi premium — stile screenshot */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* CARD 1 — Trasparenza / rosso scuro */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0 }}
                  className="group relative rounded-2xl overflow-hidden border border-red-900/50 hover:border-red-600/60 transition-all duration-300 flex flex-col"
                  style={{ background: 'linear-gradient(160deg, #1a0505 0%, #0f0303 60%, #080808 100%)' }}
                >
                  {/* Glow interno */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(220,0,0,0.18)_0%,transparent_60%)]" />
                  <div className="relative flex flex-col flex-1 p-6">
                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500/70">
                        <Target className="w-3.5 h-3.5" />
                        Dati verificati
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-red-400/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Sempre
                      </div>
                    </div>
                    {/* Numero decorativo */}
                    <div className="text-[56px] font-black leading-none tracking-tighter text-red-600/20 mb-2 select-none">100%</div>
                    {/* Titolo grande */}
                    <h3 className="text-2xl font-black text-white leading-tight mb-3">
                      Trasparenza<br />
                      <span className="text-red-500">totale</span>
                    </h3>
                    <p className="text-zinc-500 text-xs leading-relaxed flex-1">
                      Tutti i dati sono verificabili e tracciabili, con fonti ufficiali citate per ogni record.
                    </p>
                    {/* Tag pills */}
                    <div className="flex flex-wrap gap-1.5 my-4">
                      {['FIA', 'Open Source', 'F1DB'].map(t => (
                        <span key={t} className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-800/50 text-red-400/70 bg-red-900/20">{t}</span>
                      ))}
                    </div>
                    {/* Bottom CTA */}
                    <Link href="/statistics" className="mt-auto flex items-center justify-between px-4 py-3 rounded-xl border border-red-800/40 hover:border-red-600/60 hover:bg-red-600/10 text-red-400 hover:text-red-300 transition-all duration-200 group/btn">
                      <span className="text-[10px] font-black uppercase tracking-widest">Esplora i dati</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>

                {/* CARD 2 — Passione / oro scuro */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="group relative rounded-2xl overflow-hidden border border-yellow-900/50 hover:border-yellow-500/60 transition-all duration-300 flex flex-col"
                  style={{ background: 'linear-gradient(160deg, #1a1200 0%, #0f0b00 60%, #080808 100%)' }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(234,179,8,0.15)_0%,transparent_60%)]" />
                  <div className="relative flex flex-col flex-1 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-500/70">
                        <Heart className="w-3.5 h-3.5" />
                        Dal 1950
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-yellow-400/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                        Vivo
                      </div>
                    </div>
                    <div className="text-[56px] font-black leading-none tracking-tighter text-yellow-600/20 mb-2 select-none">❤️</div>
                    <h3 className="text-2xl font-black text-white leading-tight mb-3">
                      Passione<br />
                      <span className="text-yellow-400">Ferrari</span>
                    </h3>
                    <p className="text-zinc-500 text-xs leading-relaxed flex-1">
                      Costruito da tifosi per tifosi, con attenzione ai dettagli che solo chi ama il Cavallino Rampante può capire.
                    </p>
                    <div className="flex flex-wrap gap-1.5 my-4">
                      {['Tifosi', 'Comunità', '75 anni'].map(t => (
                        <span key={t} className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-yellow-800/50 text-yellow-400/70 bg-yellow-900/20">{t}</span>
                      ))}
                    </div>
                    <Link href="/fanzone" className="mt-auto flex items-center justify-between px-4 py-3 rounded-xl border border-yellow-800/40 hover:border-yellow-500/60 hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300 transition-all duration-200 group/btn">
                      <span className="text-[10px] font-black uppercase tracking-widest">Fan Zone</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>

                {/* CARD 3 — Qualità / zinc scuro */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="group relative rounded-2xl overflow-hidden border border-zinc-700/40 hover:border-zinc-500/60 transition-all duration-300 flex flex-col"
                  style={{ background: 'linear-gradient(160deg, #111114 0%, #0c0c0f 60%, #080808 100%)' }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(161,161,170,0.08)_0%,transparent_60%)]" />
                  <div className="relative flex flex-col flex-1 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400/70">
                        <Award className="w-3.5 h-3.5" />
                        Premium
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-400/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                        Pro
                      </div>
                    </div>
                    <div className="text-[56px] font-black leading-none tracking-tighter text-zinc-600/30 mb-2 select-none">★</div>
                    <h3 className="text-2xl font-black text-white leading-tight mb-3">
                      Qualità<br />
                      <span className="text-zinc-300">premium</span>
                    </h3>
                    <p className="text-zinc-500 text-xs leading-relaxed flex-1">
                      Design curato, performance ottimizzata e un'esperienza utente pensata per ogni tifoso.
                    </p>
                    <div className="flex flex-wrap gap-1.5 my-4">
                      {['Design', 'Performance', 'UX'].map(t => (
                        <span key={t} className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-zinc-700/50 text-zinc-400/70 bg-zinc-800/30">{t}</span>
                      ))}
                    </div>
                    <Link href="/statistics" className="mt-auto flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-700/40 hover:border-zinc-500/60 hover:bg-zinc-700/20 text-zinc-400 hover:text-zinc-200 transition-all duration-200 group/btn">
                      <span className="text-[10px] font-black uppercase tracking-widest">Scopri la piattaforma</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>

                {/* CARD 4 — Community / rosso-scuro con numeri */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="group relative rounded-2xl overflow-hidden border border-red-900/50 hover:border-red-500/60 transition-all duration-300 flex flex-col"
                  style={{ background: 'linear-gradient(160deg, #150808 0%, #0e0505 60%, #080808 100%)' }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,0,0,0.12)_0%,transparent_55%)]" />
                  <div className="relative flex flex-col flex-1 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-400/70">
                        <Users className="w-3.5 h-3.5" />
                        Community
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-green-400/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live now
                      </div>
                    </div>
                    {/* Mini stats inline */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { val: '10K+', lbl: 'Utenti' },
                        { val: '500K+', lbl: 'Dataset' },
                        { val: '1000+', lbl: 'Gare' },
                        { val: '75+', lbl: 'Anni' },
                      ].map(s => (
                        <div key={s.lbl} className="bg-red-900/20 border border-red-900/30 rounded-xl px-3 py-2 text-center">
                          <div className="text-lg font-black text-red-400 leading-none">{s.val}</div>
                          <div className="text-[9px] text-zinc-600 uppercase tracking-wider mt-0.5">{s.lbl}</div>
                        </div>
                      ))}
                    </div>
                    <h3 className="text-2xl font-black text-white leading-tight mb-2">
                      Entra nella<br />
                      <span className="text-red-500">Community</span>
                    </h3>
                    <p className="text-zinc-500 text-xs leading-relaxed flex-1">
                      Interagisci con migliaia di tifosi, guadagna SF Tokens e scala la classifica globale.
                    </p>
                    <Link href="/fanzone" className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl border border-red-800/40 hover:border-red-500/60 hover:bg-red-600/10 text-red-400 hover:text-red-300 transition-all duration-200 group/btn">
                      <span className="text-[10px] font-black uppercase tracking-widest">Inizia a giocare</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>

              </div>

              {/* Badge indipendente */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-8 flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-green-500/5 to-transparent border border-green-500/15 max-w-xs mx-auto"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0 shadow-sm shadow-green-500/50" />
                <p className="text-zinc-400 text-xs">
                  <span className="text-green-400 font-bold">100% indipendente</span> — non affiliato a Ferrari S.p.A.
                </p>
              </motion.div>
            </div>
          </section>

          {/* ══════════════════════════════════════
              4. FEATURES
          ══════════════════════════════════════ */}
          <section className="py-28 px-4 relative overflow-hidden" aria-label="Funzionalità">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
            {/* Glow background destro */}
            <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-16"
              >
                <SectionLabel>Funzionalità</SectionLabel>
                <SectionTitle>
                  Tutto su{' '}
                  <span className="text-red-600">
                    Formula Rossa
                  </span>
                </SectionTitle>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={`group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/15 bg-zinc-900/40 transition-all duration-300 shadow-md hover:shadow-2xl ${f.glow} flex flex-col`}
                  >
                    {/* Header colorato */}
                    <div className={`relative h-2 bg-gradient-to-r ${f.gradient}`} />

                    {/* Badge tag */}
                    <div className="absolute top-4 right-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r ${f.gradient} text-white/90`}>
                        {f.tag}
                      </span>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} bg-opacity-20 mb-5 shadow-sm`}>
                        <f.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-black text-white text-sm uppercase tracking-wide mb-3">{f.title}</h3>
                      <p className="text-zinc-500 text-xs leading-relaxed mb-5 flex-1">{f.desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {f.highlights.map((h, j) => (
                          <span key={j} className="text-[10px] px-2 py-1 bg-zinc-800/80 border border-white/[0.06] rounded-lg text-zinc-400 font-mono">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════
              5. TIMELINE
          ══════════════════════════════════════ */}
          <section className="py-28 px-4 relative overflow-hidden" aria-label="Storia del progetto">
            <div className="absolute inset-0 bg-[#060606]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
            {/* Glow sfondo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/[0.04] rounded-full blur-[100px] pointer-events-none" />

            <div className="relative max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-16 text-center"
              >
                <SectionLabel color="text-yellow-500/60">Roadmap</SectionLabel>
                <SectionTitle>
                  Storia del{' '}
                  <span className="text-red-600">
                    Progetto
                  </span>
                </SectionTitle>
              </motion.div>

              <div className="relative">
                {/* Linea centrale desktop */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-yellow-500/40 via-red-600/30 to-transparent hidden md:block" />

                <div className="space-y-0">
                  {TIMELINE.map((item, i) => {
                    const isLeft = i % 2 === 0;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: isLeft ? -28 : 28 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="relative pb-10"
                      >
                        {/* Desktop: alternato */}
                        <div className={`hidden md:flex items-center gap-6 w-full ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                          {/* Card testo */}
                          <div className={`w-[calc(50%-2.5rem)] ${isLeft ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block rounded-xl border ${item.color} p-4 transition-all duration-300`}>
                              <div className="text-[10px] font-black uppercase tracking-widest text-yellow-400/70 font-mono mb-1">{item.year}</div>
                              <h4 className="text-white font-bold text-sm mb-1">{item.event}</h4>
                              <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                          {/* Dot centrale */}
                          <div className="flex-shrink-0 relative z-10">
                            <div className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center shadow-lg">
                              <span className="text-xl">{item.icon}</span>
                            </div>
                            <div className={`absolute inset-0 rounded-full ${item.dot} opacity-20 blur-md`} />
                          </div>
                          <div className="w-[calc(50%-2.5rem)]" />
                        </div>

                        {/* Mobile */}
                        <div className="flex md:hidden gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center flex-shrink-0 text-base">
                              {item.icon}
                            </div>
                            {i < TIMELINE.length - 1 && <div className="w-px flex-1 mt-2 bg-gradient-to-b from-zinc-700 to-transparent" />}
                          </div>
                          <div className={`pb-4 rounded-xl border ${item.color} p-4 flex-1`}>
                            <div className="text-[10px] font-black uppercase tracking-widest text-yellow-400/70 font-mono mb-1">{item.year}</div>
                            <h4 className="text-white font-bold text-sm mb-1">{item.event}</h4>
                            <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════
              6. FOUNDER
          ══════════════════════════════════════ */}
          <section className="py-28 px-4 relative overflow-hidden" aria-label="Il fondatore">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
            {/* Glow sinistra */}
            <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/[0.06] rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12 text-center"
              >
                <SectionLabel>Il team</SectionLabel>
                <SectionTitle>
                  Chi c'è{' '}
                  <span className="text-red-600">
                    dietro
                  </span>
                </SectionTitle>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                {/* Bordo gradient animato */}
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-red-600/40 via-yellow-500/10 to-transparent" />
                <div className="relative rounded-3xl bg-zinc-900/95 overflow-hidden">
                  {/* Stripe superiore */}
                  <div className="h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600" />

                  <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">

                      {/* Avatar */}
                      <div className="flex-shrink-0 text-center md:text-left">
                        <div className="relative inline-block">
                          <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-red-600/50 via-yellow-500/20 to-transparent blur-sm" />
                          <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-white/15 shadow-2xl shadow-red-600/20">
                            <img
                              src="https://github.com/J0joFra.png"
                              alt={`Foto profilo di ${FOUNDER.name}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement.innerHTML =
                                  '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-red-900 text-white text-3xl font-black">JF</div>';
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                          <div>
                            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">{FOUNDER.name}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] mt-1 text-red-500">
                              {FOUNDER.role}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {['Next.js', 'React', 'TypeScript'].map((t) => (
                              <span key={t} className="px-2.5 py-1 bg-zinc-800 border border-white/[0.08] rounded-lg text-[10px] font-mono text-zinc-400">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3 text-zinc-400 text-sm leading-relaxed mb-8 border-t border-white/[0.06] pt-6">
                          <p>
                            Sviluppatore full-stack e tifoso Ferrari da sempre. Ho iniziato questo progetto perché
                            volevo un modo migliore di rivivere la storia della Scuderia attraverso i dati — e alla
                            fine ho deciso di costruirlo io stesso.
                          </p>
                          <p>
                            Formula Rossa è costruita con Next.js, React e una pipeline di dati che aggrega
                            informazioni da F1DB, Motorsport.com e sorgenti ufficiali FIA. Ogni feature è pensata
                            per rendere i dati accessibili, belli e utili per tutti i tifosi.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {[
                            { icon: Github,    href: FOUNDER.github,    name: 'J0joFra',         hoverClass: 'hover:bg-zinc-700 hover:border-zinc-500' },
                            { icon: Linkedin,  href: FOUNDER.linkedin,  name: 'Formula Rossa',   hoverClass: 'hover:bg-blue-600 hover:border-blue-500' },
                            { icon: Youtube,   href: FOUNDER.youtube,   name: '@jofrancalanci',  hoverClass: 'hover:bg-red-600 hover:border-red-500'   },
                            { icon: Instagram, href: FOUNDER.instagram, name: '@formularossa.it', hoverClass: 'hover:bg-pink-600 hover:border-pink-500' },
                          ].map((s, i) => (
                            <a
                              key={i}
                              href={s.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2.5 px-4 py-2.5 bg-zinc-800/70 ${s.hoverClass} border border-white/[0.07] rounded-xl text-zinc-300 hover:text-white text-[11px] font-bold transition-all duration-200`}
                            >
                              <s.icon className="w-3.5 h-3.5" />
                              {s.name}
                            </a>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ══════════════════════════════════════
              7. YOUTUBE
          ══════════════════════════════════════ */}
          <section className="py-28 px-4 relative overflow-hidden" aria-label="Video YouTube">
            <div className="absolute inset-0 bg-[#060606]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
            {/* Glow rosso YouTube */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-red-600/[0.06] rounded-full blur-[120px] pointer-events-none" />

            <div className="relative max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14"
              >
                <div>
                  <SectionLabel>YouTube</SectionLabel>
                  <SectionTitle>
                    I nostri{' '}
                    <span className="text-red-600">
                      Video
                    </span>
                  </SectionTitle>
                </div>
                <a
                  href={FOUNDER.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600/15 hover:bg-red-600 border border-red-600/40 hover:border-red-600 rounded-xl text-red-400 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all duration-200 shadow-lg shadow-red-600/10 hover:shadow-red-600/30 self-start sm:self-auto"
                >
                  <Youtube className="w-4 h-4" />
                  Vai al canale
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {YOUTUBE_VIDEOS.map((video, i) => (
                  <YouTubeEmbed
                    key={video.id}
                    videoId={video.id}
                    title={video.title}
                    views={video.views}
                    duration={video.duration}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════
              8. TECH STACK
          ══════════════════════════════════════ */}
          <section className="py-20 px-4 relative overflow-hidden" aria-label="Tecnologie">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <SectionLabel color="text-zinc-500">Open Source</SectionLabel>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">
                  Costruito con{' '}
                  <span className="text-red-600">
                    passione
                  </span>{' '}
                  e tecnologia
                </h2>
                <p className="text-zinc-600 text-xs mb-10">
                  Stack tecnico open-source, dati verificabili, performance ottimizzata.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {TECH_STACK.map((tech, i) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, scale: 0.85 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className={`group flex flex-col items-center gap-1 px-4 py-3 bg-zinc-900/80 border border-white/[0.06] ${tech.color} rounded-xl transition-all duration-200 cursor-default`}
                    >
                      <span className="font-mono text-xs font-bold text-zinc-300 group-hover:text-current transition-colors">{tech.name}</span>
                      <span className="text-[9px] text-zinc-600 uppercase tracking-wider">{tech.category}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* ══════════════════════════════════════
              9. CTA
          ══════════════════════════════════════ */}
          <section className="py-36 px-4 relative overflow-hidden" aria-label="Esplora la piattaforma">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
            {/* Glow radiale pulsante */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.1, 0.04] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#DC0000_0%,transparent_60%)]"
              />
              <motion.div
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.02, 0.06, 0.02] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,#f59e0b_0%,transparent_55%)]"
              />
            </div>

            <div className="relative max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <SectionLabel>Inizia ora</SectionLabel>
                <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter mb-6 leading-[0.92]">
                  Pronto a<br />
                  <span className="text-red-600">
                    esplorare?
                  </span>
                </h2>
                <p className="text-zinc-500 text-sm mb-10 leading-relaxed max-w-md mx-auto">
                  Immergiti in 75 anni di storia Ferrari. Statistiche, analisi,
                  predizioni AI e una community di tifosi ti aspettano.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/statistics"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl transition-all shadow-2xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.02]"
                  >
                    Esplora le Statistiche <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/fanzone"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-yellow-500/30 text-white hover:text-yellow-300 font-black uppercase text-[11px] tracking-widest rounded-2xl transition-all"
                  >
                    Entra nella Fan Zone
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </>
  );
}

export async function getStaticProps() {
  const images = await getHeroImages();
  return {
    props: { heroImages: images },
    revalidate: 60 * 60 * 24,
  };
}