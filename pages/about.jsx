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
  { value: '75+',   label: 'Anni di storia Ferrari', icon: Trophy   },
  { value: '1000+', label: 'Gare analizzate',         icon: Flag     },
  { value: '100+',  label: 'Piloti nel database',     icon: Users    },
  { value: '500K+', label: 'Datapoint elaborati',     icon: Database },
];

const FEATURES = [
  { icon: BarChart3, title: 'Statistiche Storiche',  accent: 'from-red-600/20',    desc: 'Dal 1950 ad oggi: vittorie, pole position, giri veloci e punti campionato per ogni stagione Ferrari in Formula 1. Dati verificati e aggiornati ad ogni Gran Premio.' },
  { icon: Zap,       title: 'AI Predictor',          accent: 'from-yellow-500/10', desc: 'Un algoritmo che analizza dati storici, condizioni meteo, risultati delle qualifiche e forma recente per generare previsioni sul prossimo Gran Premio.' },
  { icon: Users,     title: 'Fan Zone & Community',  accent: 'from-red-600/20',    desc: 'Mini-games, classifiche globali, SF Tokens e premi esclusivi. Un luogo dove la passione per la Ferrari diventa esperienza interattiva.' },
  { icon: Database,  title: 'Database F1DB',         accent: 'from-zinc-500/10',   desc: 'I dati provengono dal progetto open-source F1DB, arricchiti con fonti ufficiali FIA e Motorsport. Ogni record è tracciabile e verificabile.' },
  { icon: Activity,  title: 'Live Timing',           accent: 'from-red-600/20',    desc: 'Durante i weekend di gara, aggiornamenti in tempo reale su classifiche, tempi sul giro e radiocomandi direttamente dal box Ferrari.' },
  { icon: Globe,     title: 'Multipiattaforma',      accent: 'from-zinc-500/10',   desc: 'Formula Rossa è ottimizzata per ogni dispositivo: desktop, tablet e mobile. Accessibile ovunque tu stia seguendo il Gran Premio.' },
];

const TIMELINE = [
  { year: 'Dic 2025', event: 'Idea e primo prototipo', desc: "Nasce l'idea di creare la piattaforma dati Ferrari definitiva per i tifosi.",         icon: '💡' },
  { year: 'Gen 2026', event: 'Lancio Beta',              desc: 'Prima versione pubblica con statistiche storiche e confronto piloti.',                 icon: '🚀' },
  { year: 'Feb 2026', event: 'AI Predictor',             desc: "Integrazione dell'algoritmo di previsione basato su machine learning.",                icon: '🤖' },
  { year: 'Feb 2026', event: 'Fan Zone',                 desc: 'Lancio della community interattiva con mini-games e sistema di reward.',                icon: '🏆' },
  { year: 'Mar 2026', event: 'Lancio versione di prova', desc: 'Prima versione completa con dati real-time e adattamento per in-app.',                  icon: '🏎️' },
];

const YOUTUBE_VIDEOS = [
  { id: 'Ku6j9PU_kAY', title: 'Video #1' },
  { id: 'sOelL-Jfw6o', title: 'Video #2' },
  { id: 'RhIJ3ghifzc', title: 'Video #3' },
];

/* ─────────────────────── COMPONENTI ─────────────────────── */

function SectionLabel({ children }) {
  return (
    <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-red-600/50 mb-4">
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

function Divider() {
  return (
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
  );
}

function YouTubeEmbed({ videoId, title, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className="group relative"
    >
      <div className="absolute -top-5 -left-1 text-[90px] font-black text-white/[0.025] leading-none select-none pointer-events-none italic">
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="relative z-10 rounded-2xl overflow-hidden border border-white/[0.06] bg-zinc-900/50 transition-all duration-500 group-hover:border-red-600/25 group-hover:shadow-xl group-hover:shadow-red-600/5">
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
        <div className="px-4 py-2.5 flex items-center justify-between border-t border-white/[0.04]">
          <p className="text-white/40 text-[11px] font-medium truncate">{title}</p>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Guarda su YouTube: ${title}`}
            className="ml-3 flex-shrink-0 text-red-600/40 hover:text-red-500 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
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
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

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
        description="Formula Rossa è una piattaforma indipendente di data intelligence dedicata alla Scuderia Ferrari in Formula 1. Scopri la storia del progetto, il team e la missione."
        path="/about"
        jsonLd={jsonLd}
      />

      <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
        <Navigation />
        <main className="pt-20">

          {/* ══════════════════════════════════════════
              1. HERO — Chi siamo / Cos'è Formula Rossa
          ══════════════════════════════════════════ */}
          <section
            ref={heroRef}
            className="relative min-h-[92vh] flex items-center py-24 px-4 overflow-hidden"
            aria-label="Presentazione Formula Rossa"
          >
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute inset-0 opacity-[0.035]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, #DC0000 1px, transparent 0)',
                  backgroundSize: '40px 40px',
                }}
              />
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.07, 0.13, 0.07] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-red-600 rounded-full blur-[180px]"
              />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-500/[0.04] rounded-full blur-[100px]" />
              <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-red-600/10 to-transparent" />
              <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />
            </div>

            <div className="relative max-w-7xl mx-auto w-full">
              <div className="grid lg:grid-cols-2 gap-16 items-center">

                <motion.div style={{ y: heroY, opacity: heroOpacity }}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                  >
                    <Heart className="w-3 h-3 fill-red-500" aria-hidden="true" />
                    Il Progetto
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-5xl md:text-6xl xl:text-7xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8"
                  >
                    Una piattaforma
                    <br />per i{' '}
                    <span className="relative inline-block">
                      <span className="text-red-600">Tifosi</span>
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                        className="absolute -bottom-1 left-0 w-full h-0.5 bg-red-600 origin-left"
                      />
                    </span>
                    <br />
                    <span className="text-red-600">Ferrari</span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-zinc-400 text-[15px] leading-relaxed max-w-lg mb-10"
                  >
                    Un archivio vivente di 75 anni di storia, da Ascari a Leclerc. Ogni vittoria,
                    ogni pole, ogni stagione — raccontata attraverso i numeri e resa visiva
                    per chi ama davvero il Cavallino Rampante.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="flex flex-wrap gap-4"
                  >
                    <Link
                      href="/statistics"
                      className="inline-flex items-center gap-2 px-7 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[11px] tracking-widest rounded-xl transition-all shadow-xl shadow-red-600/20 hover:shadow-red-600/35 hover:scale-[1.02]"
                    >
                      Esplora le Statistiche <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/fanzone"
                      className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white font-black uppercase text-[11px] tracking-widest rounded-xl transition-all"
                    >
                      Fan Zone
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Griglia immagini */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute -top-10 -right-4 text-[160px] font-black text-white/[0.02] leading-none select-none pointer-events-none italic">
                    75
                  </div>
                  <div className="relative z-10 grid grid-cols-3 grid-rows-3 gap-2.5 h-[480px]">
                    <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden relative group">
                      <img
                        src={heroImages[0]?.urls?.regular ?? '/data/images/image1.jpg'}
                        alt={heroImages[0]?.alt_description ?? 'Ferrari in pista'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/70" />
                      <div className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                        1950 — oggi
                      </div>
                    </div>
                    {[1, 2].map((n) => (
                      <div key={n} className="rounded-xl overflow-hidden relative group">
                        <img
                          src={heroImages[n]?.urls?.small ?? `/data/images/image${n + 1}.jpg`}
                          alt={heroImages[n]?.alt_description ?? `Ferrari ${n}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    ))}
                    {[3, 4, 5].map((n) => (
                      <div key={n} className="rounded-xl overflow-hidden relative group">
                        <img
                          src={heroImages[n]?.urls?.small ?? `/data/images/image${n + 1}.jpg`}
                          alt={heroImages[n]?.alt_description ?? `Ferrari ${n}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    ))}
                  </div>
                </motion.div>

              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              2. MISSIONE — Il perché del progetto
          ══════════════════════════════════════════ */}
          <section className="py-28 px-4 relative" aria-label="Missione e valori">
            <Divider />
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-start">

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <SectionLabel>Chi siamo</SectionLabel>
                  <SectionTitle className="mb-8">
                    La nostra<br /><span className="text-red-600">Missione</span>
                  </SectionTitle>
                  <div className="space-y-5">
                    {[
                      "Formula Rossa è un progetto indipendente, creato da appassionati per gli appassionati. Non siamo affiliati alla Ferrari S.p.A. o alla Scuderia Ferrari — siamo semplicemente tifosi che credono che i dati possano rendere la Formula 1 ancora più affascinante.",
                      "La nostra missione è democratizzare l'accesso alle statistiche F1: rendere comprensibili dati complessi attraverso visualizzazioni interattive, grafici chiari e strumenti intuitivi che chiunque possa usare, dal tifoso occasionale all'analista di settore.",
                      "Crediamo che ogni gara, ogni sorpasso, ogni pole position abbia una storia da raccontare attraverso i numeri. Formula Rossa è quel racconto.",
                    ].map((text, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="text-zinc-400 text-sm leading-relaxed pl-4 border-l border-zinc-800 hover:border-red-600/40 transition-colors duration-300"
                      >
                        {text}
                      </motion.p>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="lg:pt-16 space-y-4"
                >
                  <div className="relative rounded-3xl overflow-hidden bg-zinc-900/30 border border-white/[0.05] p-8 md:p-10">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-red-600/60 via-red-600/20 to-transparent" />
                    <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-red-600/[0.06] to-transparent" />
                    <div className="text-6xl font-black text-red-600/20 leading-none mb-4 italic">"</div>
                    <p className="text-white/70 text-lg md:text-xl font-black italic leading-snug uppercase tracking-tight mb-6">
                      Ogni numero racconta una storia.<br />
                      Noi la rendiamo visibile.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-px bg-red-600/40" />
                      <span className="text-red-600/60 text-[10px] font-black uppercase tracking-widest">
                        Formula Rossa
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-900/40 border border-white/[0.05]">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                    <p className="text-zinc-500 text-xs">
                      Progetto <span className="text-white/70 font-bold">100% indipendente</span> — non affiliato a Ferrari S.p.A.
                    </p>
                  </div>
                </motion.div>

              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              3. NUMERI — Prova concreta della missione
          ══════════════════════════════════════════ */}
          <section className="py-20 px-4 relative overflow-hidden" aria-label="Numeri del progetto">
            <div className="absolute inset-0 bg-[#060606]" />
            <Divider />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/[0.04] via-transparent to-transparent pointer-events-none" />

            <div className="relative max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 mb-4 group-hover:bg-red-600/20 transition-colors duration-300">
                    <stat.icon className="w-4 h-4 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white tracking-tighter tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-2 uppercase tracking-[0.15em]">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════
              4. FEATURES — Cosa offre la piattaforma
          ══════════════════════════════════════════ */}
          <section className="py-28 px-4 relative overflow-hidden" aria-label="Funzionalità della piattaforma">
            <Divider />
            <div className="relative max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-16"
              >
                <SectionLabel>Funzionalità</SectionLabel>
                <SectionTitle>
                  Tutto su <span className="text-red-600">Formula Rossa</span>
                </SectionTitle>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="relative rounded-2xl overflow-hidden group"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-zinc-900/40 border border-white/[0.06] group-hover:border-red-600/20 rounded-2xl p-6 transition-all duration-300 h-full">
                      <div className={`absolute top-0 left-0 right-0 h-20 bg-gradient-to-b ${f.accent} to-transparent rounded-t-2xl opacity-50`} />
                      <div className="relative">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 mb-5 group-hover:bg-red-600/20 transition-colors duration-300">
                          <f.icon className="w-5 h-5 text-red-600" aria-hidden="true" />
                        </div>
                        <h3 className="font-black text-white text-sm uppercase tracking-wide mb-3">{f.title}</h3>
                        <p className="text-zinc-500 text-xs leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              5. TIMELINE — Come ci siamo arrivati
          ══════════════════════════════════════════ */}
          <section className="py-28 px-4 relative" aria-label="Storia del progetto">
            <div className="absolute inset-0 bg-[#060606]" />
            <Divider />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

            <div className="relative max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-16 text-center"
              >
                <SectionLabel>Roadmap</SectionLabel>
                <SectionTitle>
                  Storia del <span className="text-red-600">Progetto</span>
                </SectionTitle>
              </motion.div>

              <div className="relative">
                {/* Linea verticale centrale desktop */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-red-600/30 via-white/10 to-transparent hidden md:block" />

                <div className="space-y-0">
                  {TIMELINE.map((item, i) => {
                    const isLeft = i % 2 === 0;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="relative pb-10"
                      >
                        {/* Desktop: alternato sinistra/destra */}
                        <div className={`hidden md:flex items-start gap-6 w-full ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                          <div className={`w-[calc(50%-2rem)] ${isLeft ? 'text-right' : 'text-left'}`}>
                            <div className={`text-[10px] font-black uppercase tracking-widest text-red-600/50 font-mono mb-1`}>
                              {item.year}
                            </div>
                            <h4 className="text-white font-bold text-sm mb-1">{item.event}</h4>
                            <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                          </div>
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 hover:border-red-600/50 flex items-center justify-center z-10 transition-colors">
                            <span className="text-base leading-none">{item.icon}</span>
                          </div>
                          <div className="w-[calc(50%-2rem)]" />
                        </div>

                        {/* Mobile: lineare */}
                        <div className="flex md:hidden gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm">{item.icon}</span>
                            </div>
                            {i < TIMELINE.length - 1 && (
                              <div className="w-px flex-1 mt-2 bg-zinc-800" />
                            )}
                          </div>
                          <div className="pb-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-red-600/50 font-mono mb-1">{item.year}</div>
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

          {/* ══════════════════════════════════════════
              6. FOUNDER — Chi c'è dietro al progetto
          ══════════════════════════════════════════ */}
          <section className="py-28 px-4 relative" aria-label="Il fondatore">
            <Divider />
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12 text-center"
              >
                <SectionLabel>Il team</SectionLabel>
                <SectionTitle>
                  Chi c'è <span className="text-red-600">dietro</span>
                </SectionTitle>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative rounded-3xl overflow-hidden"
              >
                <div className="absolute inset-0 rounded-3xl p-px bg-gradient-to-br from-red-600/25 via-white/[0.04] to-transparent">
                  <div className="absolute inset-0 rounded-3xl bg-zinc-900/90" />
                </div>

                <div className="relative p-8 md:p-12">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
                    <div className="relative flex-shrink-0">
                      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-red-600/35 to-transparent blur-sm" />
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-xl shadow-red-600/15">
                        <img
                          src="https://github.com/J0joFra.png"
                          alt="Foto profilo di Joaquim Francalanci"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement.innerHTML =
                              '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-red-900 text-white text-2xl font-black">JF</div>';
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">{FOUNDER.name}</h3>
                      <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.25em] mt-1">{FOUNDER.role}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Next.js', 'React', 'TypeScript'].map((t) => (
                        <span key={t} className="px-2.5 py-1 bg-zinc-800/80 border border-white/[0.06] rounded-lg text-[10px] font-mono text-zinc-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 text-zinc-400 text-sm leading-relaxed mb-10 border-t border-white/[0.06] pt-8">
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
                    <p>
                      Se vuoi contribuire al progetto, segnalare un errore o semplicemente scrivere per parlare
                      di Ferrari, trovi tutti i contatti qui sotto.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {[
                      { icon: Github,    href: FOUNDER.github,    name: 'J0joFra'          },
                      { icon: Linkedin,  href: FOUNDER.linkedin,  name: 'Formula Rossa'    },
                      { icon: Youtube,   href: FOUNDER.youtube,   name: '@jofrancalanci'   },
                      { icon: Instagram, href: FOUNDER.instagram, name: '@formularossa.it' },
                    ].map((s, i) => (
                      <a
                        key={i}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-4 py-2.5 bg-zinc-800/60 hover:bg-red-600 border border-white/[0.06] hover:border-red-600 rounded-xl text-zinc-300 hover:text-white text-[11px] font-bold transition-all duration-200"
                      >
                        <s.icon className="w-3.5 h-3.5" aria-hidden="true" />
                        {s.name}
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              7. YOUTUBE — Il canale, il volto del progetto
          ══════════════════════════════════════════ */}
          <section className="py-28 px-4 relative overflow-hidden" aria-label="Video dal canale YouTube">
            <div className="absolute inset-0 bg-[#060606]" />
            <Divider />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-red-600/[0.04] rounded-full blur-[120px] pointer-events-none" />

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
                    I nostri <span className="text-red-600">Video</span>
                  </SectionTitle>
                </div>
                <a
                  href={FOUNDER.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600/10 hover:bg-red-600 border border-red-600/30 hover:border-red-600 rounded-xl text-red-400 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all duration-200 self-start sm:self-auto"
                >
                  <Youtube className="w-4 h-4" />
                  Vai al canale
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {YOUTUBE_VIDEOS.map((video, i) => (
                  <YouTubeEmbed key={video.id} videoId={video.id} title={video.title} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              8. TECH STACK — Per i curiosi / dev
          ══════════════════════════════════════════ */}
          <section className="py-20 px-4 relative" aria-label="Tecnologie usate">
            <Divider />
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <SectionLabel>Open Source</SectionLabel>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">
                  Costruito con <span className="text-red-600">passione</span> e tecnologia
                </h2>
                <p className="text-zinc-600 text-xs mb-8">
                  Stack tecnico open-source, dati verificabili, performance ottimizzata.
                </p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {['Next.js', 'React', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'F1DB', 'Next-Auth', 'Vercel'].map((tech, i) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="px-3.5 py-2 bg-zinc-900/80 border border-white/[0.06] hover:border-red-600/30 hover:text-white rounded-xl text-zinc-400 font-mono text-xs font-bold transition-all duration-200 cursor-default"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              9. CTA — Chiusura all'azione
          ══════════════════════════════════════════ */}
          <section className="py-36 px-4 relative overflow-hidden" aria-label="Esplora la piattaforma">
            <Divider />
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.03, 0.07, 0.03] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#DC0000_0%,transparent_65%)]"
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
                  <span className="text-red-600">esplorare?</span>
                </h2>
                <p className="text-zinc-500 text-sm mb-10 leading-relaxed max-w-md mx-auto">
                  Immergiti in 75 anni di storia Ferrari. Statistiche, analisi,
                  predizioni AI e una community di tifosi ti aspettano.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/statistics"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl transition-all shadow-2xl shadow-red-600/25 hover:shadow-red-600/45 hover:scale-[1.02]"
                  >
                    Esplora le Statistiche <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/fanzone"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl transition-all"
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