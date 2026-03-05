// pages/about.jsx
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import SEO from '../components/seo';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getHeroImages } from '../lib/getHeroImages';
import {
  Database, BarChart3, Users, Zap, Trophy, Code2,
  Globe, Heart, Github, Linkedin, Youtube, Instagram,
  ChevronRight, Flag, Star, Activity, Play, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

const FOUNDER = {
  name: 'Joaquim Francalanci',
  role: 'Founder & Developer',
  github: 'https://github.com/J0joFra',
  linkedin: 'https://www.linkedin.com/company/formula-rossa/',
  youtube: 'https://www.youtube.com/@jofrancalanci',
  instagram: 'https://www.instagram.com/formularossa.it',
};

const STATS = [
  { value: '75+',    label: 'Anni di storia Ferrari',  icon: Trophy   },
  { value: '1000+',  label: 'Gare analizzate',          icon: Flag     },
  { value: '100+',   label: 'Piloti nel database',      icon: Users    },
  { value: '500K+',  label: 'Datapoint elaborati',      icon: Database },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Statistiche Storiche',
    desc: 'Dal 1950 ad oggi: vittorie, pole position, giri veloci e punti campionato per ogni stagione Ferrari in Formula 1. Dati verificati e aggiornati ad ogni Gran Premio.',
    accent: 'from-red-600/20 to-transparent',
  },
  {
    icon: Zap,
    title: 'AI Predictor',
    desc: 'Un algoritmo che analizza dati storici, condizioni meteo, risultati delle qualifiche e forma recente per generare previsioni sul prossimo Gran Premio.',
    accent: 'from-yellow-500/10 to-transparent',
  },
  {
    icon: Users,
    title: 'Fan Zone & Community',
    desc: 'Mini-games, classifiche globali, SF Tokens e premi esclusivi. Un luogo dove la passione per la Ferrari diventa esperienza interattiva.',
    accent: 'from-red-600/20 to-transparent',
  },
  {
    icon: Database,
    title: 'Database F1DB',
    desc: 'I dati provengono dal progetto open-source F1DB, arricchiti con fonti ufficiali FIA e Motorsport. Ogni record è tracciabile e verificabile.',
    accent: 'from-zinc-500/10 to-transparent',
  },
  {
    icon: Activity,
    title: 'Live Timing',
    desc: 'Durante i weekend di gara, aggiornamenti in tempo reale su classifiche, tempi sul giro e radiocomandi direttamente dal box Ferrari.',
    accent: 'from-red-600/20 to-transparent',
  },
  {
    icon: Globe,
    title: 'Multipiattaforma',
    desc: 'Formula Rossa è ottimizzata per ogni dispositivo: desktop, tablet e mobile. Accessibile ovunque tu stia seguendo il Gran Premio.',
    accent: 'from-zinc-500/10 to-transparent',
  },
];

const TIMELINE = [
  { year: 'Dec 2025', event: 'Idea e primo prototipo', desc: 'Nasce l\'idea di creare la piattaforma dati Ferrari definitiva per i tifosi.', icon: '💡' },
  { year: 'Jan 2026', event: 'Lancio Beta',              desc: 'Prima versione pubblica con statistiche storiche e confronto piloti.', icon: '🚀' },
  { year: 'Feb 2026', event: 'AI Predictor',             desc: 'Integrazione dell\'algoritmo di previsione basato su machine learning.', icon: '🤖' },
  { year: 'Feb 2026', event: 'Fan Zone',                 desc: 'Lancio della community interattiva con mini-games e sistema di reward.', icon: '🏆' },
  { year: 'Mar 2026', event: 'Lancio versione di prova', desc: 'Prima versione completa con dati real-time e adattamento per in-app', icon: '🏎️' },
];

const YOUTUBE_VIDEOS = [
  {
    id: 'Ku6j9PU_kAY',
    title: 'Video #1',
  },
  {
    id: 'sOelL-Jfw6o',
    title: 'Video #2',
  },
  {
    id: 'RhIJ3ghifzc',
    title: 'Video #3',
  },
];

// Componente singolo video YouTube
function YouTubeEmbed({ videoId, title, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className="group relative"
    >
      {/* Numero ordinale decorativo */}
      <div className="absolute -top-4 -left-2 text-[80px] font-black text-white/[0.03] leading-none select-none pointer-events-none z-0">
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="relative z-10 rounded-2xl overflow-hidden border border-white/[0.06] bg-zinc-900/40 shadow-xl shadow-black/40 transition-all duration-500 group-hover:border-red-600/30 group-hover:shadow-red-600/10 group-hover:shadow-2xl">
        {/* Embed YouTube */}
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

        {/* Footer card */}
        <div className="px-4 py-3 flex items-center justify-between">
          <p className="text-white/60 text-xs font-medium truncate">{title}</p>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Guarda su YouTube: ${title}`}
            className="ml-3 flex-shrink-0 text-red-500/60 hover:text-red-500 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function AboutPage({ heroImages = [] }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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

          {/* ── HERO ── */}
          <section
            ref={heroRef}
            className="relative min-h-[90vh] flex items-center py-24 px-4 overflow-hidden"
            aria-label="Presentazione Formula Rossa"
          >
            {/* Sfondo animato */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              {/* Grid puntini */}
              <div className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, #DC0000 1px, transparent 0)',
                  backgroundSize: '40px 40px',
                }}
              />
              {/* Glow rosso top-left */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-red-600 rounded-full blur-[160px]"
              />
              {/* Glow giallo bottom-right */}
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px]" />
              {/* Linea diagonale decorativa */}
              <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-red-600/50 to-transparent" />
                <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              </div>
            </div>

            <div className="relative max-w-7xl mx-auto w-full">
              <div className="grid lg:grid-cols-2 gap-16 items-center">

                {/* Testo sinistra */}
                <motion.div style={{ y: heroY, opacity: heroOpacity }}>
                  {/* Badge */}
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
                    className="text-5xl md:text-6xl xl:text-7xl font-black uppercase italic tracking-tighter leading-[0.92] mb-8"
                  >
                    Una piattaforma
                    <br />
                    per i{' '}
                    <span className="relative inline-block">
                      <span className="text-red-600">Tifosi</span>
                      {/* Underline decorativo */}
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
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
                    className="text-zinc-400 text-base leading-relaxed max-w-lg mb-10"
                  >
                    Da quella domanda è nata questa piattaforma: un archivio vivente di 75 anni di storia,
                    da Ascari a Leclerc. Ogni vittoria, ogni pole, ogni stagione — raccontata attraverso
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
                      className="inline-flex items-center gap-2 px-7 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[11px] tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/25 hover:shadow-red-600/40 hover:scale-[1.02]"
                    >
                      Esplora le Statistiche <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/fanzone"
                      className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-black uppercase text-[11px] tracking-widest rounded-xl transition-all"
                    >
                      Fan Zone
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Griglia immagini destra */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative"
                >
                  {/* Decorazione numero grande */}
                  <div className="absolute -top-8 -right-4 text-[160px] font-black text-white/[0.025] leading-none select-none pointer-events-none z-0 italic">
                    75
                  </div>

                  <div className="relative z-10 grid grid-cols-3 grid-rows-3 gap-2.5 h-[480px]">
                    {/* Grande top-left */}
                    <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden relative group">
                      <img
                        src={heroImages[0]?.urls?.regular ?? '/data/images/image1.jpg'}
                        alt={heroImages[0]?.alt_description ?? 'Ferrari in pista'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/70" />
                      {/* Label anno */}
                      <div className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-widest text-white/50">
                        1950 — oggi
                      </div>
                    </div>

                    {/* Colonna destra */}
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

                    {/* Riga bassa */}
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

          {/* ── NUMERI ── */}
          <section className="py-20 px-4 relative overflow-hidden" aria-label="Numeri del progetto">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 mb-4 group-hover:bg-red-600/20 transition-colors">
                    <stat.icon className="w-4 h-4 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white tracking-tighter tabular-nums">{stat.value}</div>
                  <div className="text-[10px] text-zinc-500 mt-2 uppercase tracking-[0.15em]">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── MISSIONE + TIMELINE ── */}
          <section className="py-28 px-4 relative" aria-label="Missione e valori">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-12 items-start">

                {/* Missione */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600/60 mb-4 block">
                      Chi siamo
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight">
                      La nostra<br /><span className="text-red-600">Missione</span>
                    </h2>
                  </motion.div>

                  <div className="space-y-5 text-zinc-400 text-sm leading-relaxed">
                    {[
                      'Formula Rossa è un progetto indipendente, creato da appassionati per gli appassionati. Non siamo affiliati alla Ferrari S.p.A. o alla Scuderia Ferrari — siamo semplicemente tifosi che credono che i dati possano rendere la Formula 1 ancora più affascinante.',
                      'La nostra missione è democratizzare l\'accesso alle statistiche F1: rendere comprensibili dati complessi attraverso visualizzazioni interattive, grafici chiari e strumenti intuitivi che chiunque possa usare, dal tifoso occasionale all\'analista di settore.',
                      'Crediamo che ogni gara, ogni sorpasso, ogni pole position abbia una storia da raccontare attraverso i numeri. Formula Rossa è quel racconto.',
                    ].map((text, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="pl-4 border-l border-zinc-800 hover:border-red-600/40 transition-colors"
                      >
                        {text}
                      </motion.p>
                    ))}
                  </div>
                </div>

                {/* Divisore verticale */}
                <div className="hidden lg:block w-px self-stretch bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                {/* Timeline */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600/60 mb-4 block">
                      Roadmap
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight">
                      Storia del<br /><span className="text-red-600">Progetto</span>
                    </h2>
                  </motion.div>

                  <div className="space-y-0">
                    {TIMELINE.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-5 group"
                      >
                        {/* Linea verticale + dot */}
                        <div className="flex flex-col items-center pt-1">
                          <div className="relative w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 group-hover:border-red-600/50 flex items-center justify-center flex-shrink-0 transition-colors z-10">
                            <span className="text-sm leading-none">{item.icon}</span>
                          </div>
                          {i < TIMELINE.length - 1 && (
                            <div className="w-px flex-1 my-2 bg-gradient-to-b from-zinc-700 to-zinc-800" />
                          )}
                        </div>

                        <div className="pb-7">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-600/60 font-mono">
                              {item.year}
                            </span>
                            {i === TIMELINE.length - 1 && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-600/15 border border-red-600/30 text-red-500">
                                Live
                              </span>
                            )}
                          </div>
                          <h4 className="text-white font-bold text-sm mb-1">{item.event}</h4>
                          <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ── FEATURES ── */}
          <section className="py-28 px-4 relative overflow-hidden" aria-label="Funzionalità della piattaforma">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              <div className="absolute inset-0 bg-[#060606]" />
            </div>

            <div className="relative max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="mb-16"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600/60 mb-4 block text-center">
                  Cosa trovi
                </span>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-center">
                  Tutto su{' '}
                  <span className="text-red-600">Formula Rossa</span>
                </h2>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="relative rounded-2xl overflow-hidden group"
                  >
                    {/* Bordo gradient animato */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-zinc-900/50 border border-white/[0.06] group-hover:border-red-600/20 rounded-2xl p-6 transition-all duration-300 h-full">
                      {/* Accent glow */}
                      <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${f.accent} rounded-t-2xl opacity-60`} />

                      <div className="relative">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 mb-5 group-hover:bg-red-600/20 transition-colors">
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

          {/* ── YOUTUBE ── */}
          <section className="py-28 px-4 relative overflow-hidden" aria-label="Video dal canale YouTube">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600/60 mb-4 block">
                    YouTube
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
                    I nostri{' '}
                    <span className="text-red-600">Video</span>
                  </h2>
                </div>

                <a
                  href={FOUNDER.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600/10 hover:bg-red-600 border border-red-600/30 hover:border-red-600 rounded-xl text-red-400 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all group/btn"
                >
                  <Youtube className="w-4 h-4" aria-hidden="true" />
                  Vai al canale
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover/btn:opacity-100" />
                </a>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {YOUTUBE_VIDEOS.map((video, i) => (
                  <YouTubeEmbed
                    key={video.id}
                    videoId={video.id}
                    title={video.title}
                    index={i}
                  />
                ))}
              </div>


            </div>
          </section>

          {/* ── FOUNDER ── */}
          <section className="py-28 px-4 relative" aria-label="Il fondatore">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600/60 mb-4 block">
                  Il team
                </span>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
                  Chi c'è{' '}
                  <span className="text-red-600">dietro</span>
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative rounded-3xl overflow-hidden"
              >
                {/* Bordo gradient */}
                <div className="absolute inset-0 rounded-3xl p-px bg-gradient-to-br from-red-600/30 via-white/5 to-transparent">
                  <div className="absolute inset-0 rounded-3xl bg-zinc-900/90" />
                </div>

                <div className="relative p-8 md:p-12">
                  {/* Header fondatore */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
                    <div className="relative flex-shrink-0">
                      {/* Ring decorativo */}
                      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-red-600/40 to-transparent blur-sm" />
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-xl shadow-red-600/20">
                        <img
                          src="https://github.com/J0joFra.png"
                          alt="Foto profilo di Joaquim Francalanci"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement.innerHTML =
                              '<span class="text-2xl font-black text-white w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-red-900">JF</span>';
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">{FOUNDER.name}</h3>
                      <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.25em] mt-1">{FOUNDER.role}</p>
                    </div>

                    {/* Tag tech stack */}
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {['Next.js', 'React', 'TypeScript'].map((t) => (
                        <span key={t} className="px-2.5 py-1 bg-zinc-800/80 border border-white/5 rounded-lg text-[10px] font-mono text-zinc-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-4 text-zinc-400 text-sm leading-relaxed mb-10 border-t border-white/5 pt-8">
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

                  {/* Social links */}
                  <div className="flex flex-wrap gap-3">
                    {[
                      { icon: Github,    href: FOUNDER.github,    label: 'GitHub',    name: 'J0joFra'         },
                      { icon: Linkedin,  href: FOUNDER.linkedin,  label: 'LinkedIn',  name: 'Formula Rossa'   },
                      { icon: Youtube,   href: FOUNDER.youtube,   label: 'YouTube',   name: '@jofrancalanci'  },
                      { icon: Instagram, href: FOUNDER.instagram, label: 'Instagram', name: '@formularossa.it' },
                    ].map((s, i) => (
                      <a
                        key={i}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${s.label} di ${s.name}`}
                        className="flex items-center gap-2.5 px-4 py-2.5 bg-zinc-800/60 hover:bg-red-600 border border-white/5 hover:border-red-600 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all group/social"
                      >
                        <s.icon className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="text-[10px]">{s.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ── TECH STACK ── */}
          <section className="py-16 px-4 relative" aria-label="Tecnologie usate">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="absolute inset-0 bg-[#060606]" />

            <div className="relative max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-xl font-black uppercase italic tracking-tighter mb-2">
                  Costruito con <span className="text-red-600">passione</span> e tecnologia
                </h2>
                <p className="text-zinc-600 text-xs mb-8">
                  Stack tecnico open-source, dati verificabili, performance ottimizzata.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Next.js', 'React', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'F1DB', 'Next-Auth', 'Vercel'].map((tech, i) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-3.5 py-2 bg-zinc-900 border border-white/[0.06] hover:border-red-600/30 rounded-xl text-zinc-400 hover:text-white font-mono text-xs font-bold transition-colors cursor-default"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* ── CTA FINALE ── */}
          <section className="py-32 px-4 relative overflow-hidden" aria-label="Esplora la piattaforma">
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#DC0000_0%,transparent_70%)]"
              />
            </div>

            <div className="relative max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600/60 mb-6">
                  Inizia ora
                </div>
                <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter mb-6 leading-tight">
                  Pronto a<br />
                  <span className="text-red-600">esplorare?</span>
                </h2>
                <p className="text-zinc-500 text-sm mb-10 leading-relaxed">
                  Immergiti in 75 anni di storia Ferrari. Statistiche, analisi, predizioni AI
                  e una community di tifosi ti aspettano.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/statistics"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl transition-all shadow-2xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.02]"
                  >
                    Esplora le Statistiche <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/fanzone"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl transition-all"
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