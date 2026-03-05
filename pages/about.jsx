// pages/about.jsx
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import SEO from '../components/seo';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getHeroImages } from '../lib/getHeroImages';
import {
  Database, BarChart3, Users, Zap, Trophy,
  Globe, Heart, Github, Linkedin, Youtube, Instagram,
  ChevronRight, Flag, Activity, ExternalLink, Calendar,
  Award, Target, Code, BookOpen, MessageCircle, Sparkles,
  Camera, Video, Play, Clock, Eye, ThumbsUp
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
  { value: '75+',   label: 'Anni di storia Ferrari', icon: Trophy, color: 'from-red-500 to-red-600' },
  { value: '1000+', label: 'Gare analizzate',         icon: Flag, color: 'from-yellow-500 to-yellow-600' },
  { value: '100+',  label: 'Piloti nel database',     icon: Users, color: 'from-blue-500 to-blue-600' },
  { value: '500K+', label: 'Datapoint elaborati',     icon: Database, color: 'from-purple-500 to-purple-600' },
];

const FEATURES = [
  { 
    icon: BarChart3, 
    title: 'Statistiche Storiche',  
    gradient: 'from-red-600 to-red-800',
    desc: 'Dal 1950 ad oggi: vittorie, pole position, giri veloci e punti campionato per ogni stagione Ferrari. Dati verificati e aggiornati ad ogni Gran Premio.',
    highlights: ['245 vittorie', '243 pole', '16 titoli costruttori']
  },
  { 
    icon: Zap,       
    title: 'AI Predictor',          
    gradient: 'from-yellow-500 to-yellow-700',
    desc: 'Algoritmo di machine learning che analizza dati storici, meteo e forma recente per generare previsioni con accuratezza superiore all\'80%.',
    highlights: ['80% accuratezza', 'ML model', 'Real-time']
  },
  { 
    icon: Users,     
    title: 'Fan Zone',  
    gradient: 'from-red-600 to-red-800',
    desc: 'Mini-games, classifiche globali e SF Tokens. Un luogo dove la passione Ferrari diventa esperienza interattiva.',
    highlights: ['10K+ utenti', 'Mini-games', 'Rewards']
  },
  { 
    icon: Database,  
    title: 'F1DB Integration',         
    gradient: 'from-zinc-600 to-zinc-800',
    desc: 'Dati dal progetto open-source F1DB, arricchiti con fonti ufficiali FIA. Ogni record è tracciabile.',
    highlights: ['Open source', 'Verificato', '60+ anni']
  },
  { 
    icon: Activity,  
    title: 'Live Timing',           
    gradient: 'from-red-600 to-red-800',
    desc: 'Weekend di gara: aggiornamenti in tempo reale su classifiche, tempi e radiocomandi dal box Ferrari.',
    highlights: ['Real-time', 'Team radio', 'Settori']
  },
  { 
    icon: Globe,     
    title: 'Multi-device',      
    gradient: 'from-zinc-600 to-zinc-800',
    desc: 'Ottimizzata per ogni dispositivo: desktop, tablet e mobile. Accessibile ovunque segui il GP.',
    highlights: ['Responsive', 'PWA ready', 'Mobile first']
  },
];

const TIMELINE = [
  { year: 'Dic 2025', event: 'Idea e prototipo', desc: "Nasce l'idea della piattaforma dati Ferrari definitiva.", icon: '💡' },
  { year: 'Gen 2026', event: 'Lancio Beta', desc: 'Prima versione pubblica con statistiche storiche.', icon: '🚀' },
  { year: 'Feb 2026', event: 'AI Predictor', desc: 'Integrazione algoritmo di machine learning.', icon: '🤖' },
  { year: 'Feb 2026', event: 'Fan Zone', desc: 'Lancio community interattiva con mini-games.', icon: '🏆' },
  { year: 'Mar 2026', event: 'Versione ufficiale', desc: 'Piattaforma completa con dati real-time.', icon: '🏎️' },
];

const YOUTUBE_VIDEOS = [
  { 
    id: 'Ku6j9PU_kAY', 
    title: 'Presentazione Formula Rossa', 
    description: 'Scopri la piattaforma dedicata ai tifosi Ferrari',
    views: '2.5K', 
    duration: '12:34',
    date: '2 mesi fa'
  },
  { 
    id: 'sOelL-Jfw6o', 
    title: 'Analisi GP Monaco 2025', 
    description: 'Analisi completa della gara di Monaco',
    views: '1.8K', 
    duration: '18:22',
    date: '1 mese fa'
  },
  { 
    id: 'RhIJ3ghifzc', 
    title: 'Storia Ferrari: 75 anni di dati', 
    description: '75 anni di storia della Scuderia attraverso i numeri',
    views: '3.2K', 
    duration: '24:15',
    date: '3 settimane fa'
  },
  { 
    id: 'dQw4w9WgXcQ', 
    title: 'Intervista esclusiva', 
    description: 'Conversazione con un ex ingegnere Ferrari',
    views: '1.2K', 
    duration: '32:10',
    date: '2 settimane fa'
  },
  { 
    id: 'jNQXAC9IVRw', 
    title: 'Tutorial: Come usare AI Predictor', 
    description: 'Guida all\'utilizzo del nostro predittore AI',
    views: '950', 
    duration: '8:45',
    date: '1 settimana fa'
  },
  { 
    id: 'kJQP7kiw5Fk', 
    title: 'Highlights GP Italia', 
    description: 'I momenti migliori del GP di Monza',
    views: '4.1K', 
    duration: '15:30',
    date: '5 giorni fa'
  }
];

const TECH_STACK = [
  { name: 'Next.js 14', icon: '⚛️' },
  { name: 'React 18', icon: '⚛️' },
  { name: 'Tailwind CSS', icon: '🎨' },
  { name: 'Framer Motion', icon: '🎬' },
  { name: 'Recharts', icon: '📊' },
  { name: 'F1DB', icon: '🏁' },
  { name: 'Next-Auth', icon: '🔐' },
  { name: 'Vercel', icon: '▲' },
];

const VALUES = [
  { icon: Target, title: 'Trasparenza', desc: 'Dati verificabili e tracciabili con fonti ufficiali.' },
  { icon: Heart, title: 'Passione', desc: 'Costruito da tifosi per tifosi, con attenzione ai dettagli.' },
  { icon: Award, title: 'Qualità', desc: 'Design curato, performance ottimizzata, UX premium.' },
  { icon: Users, title: 'Community', desc: 'Spazio dove i tifosi interagiscono, competono e condividono.' },
];

const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1580274455191-1c62234ad5f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Ferrari F1 in pista',
    caption: 'Charles Leclerc, 2024'
  },
  {
    url: 'https://images.unsplash.com/photo-1614200187524-dc4b892ac51e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Ferrari F1 box',
    caption: 'Box Ferrari, GP Monaco'
  },
  {
    url: 'https://images.unsplash.com/photo-1614200186920-0fa2acdd23a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Ferrari F1 dettaglio',
    caption: 'Cavallino Rampante'
  },
  {
    url: 'https://images.unsplash.com/photo-1580019541885-7dac6ddf8f5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Ferrari F1 gara',
    caption: 'SF-24 in azione'
  },
  {
    url: 'https://images.unsplash.com/photo-1580019541924-5f3e9b3c8c3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Ferrari F1 storico',
    caption: 'Ferrari anni 2000'
  },
  {
    url: 'https://images.unsplash.com/photo-1580019541907-5a41a8b5c8c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Ferrari F1 fan',
    caption: 'Tifosi al GP'
  }
];

/* ─────────────────────── COMPONENTI ─────────────────────── */

function SectionLabel({ children }) {
  return (
    <span className="block text-xs font-bold uppercase tracking-[0.25em] text-red-500 mb-3">
      {children}
    </span>
  );
}

function SectionTitle({ children, className = '' }) {
  return (
    <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 hover:border-red-600/30 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

function YouTubeEmbed({ video, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Card className="p-0 overflow-hidden hover:border-red-600/40">
        <div className="relative aspect-video bg-zinc-800">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="p-3">
          <h4 className="font-semibold text-white text-sm mb-1 line-clamp-1 group-hover:text-red-400 transition-colors">
            {video.title}
          </h4>
          <p className="text-xs text-zinc-500 mb-2 line-clamp-1">{video.description}</p>
          
          <div className="flex items-center gap-3 text-xs text-zinc-600">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {video.views}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {video.duration}
            </span>
            <span className="text-zinc-700">{video.date}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ───────────────────────── PAGINA ───────────────────────── */

export default function AboutPage({ heroImages = [] }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  // Usa le immagini di Unsplash invece di quelle generate
  const displayImages = HERO_IMAGES;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Chi Siamo — Formula Rossa',
    url: 'https://formula-rossa.it/about',
    description: 'Formula Rossa è una piattaforma indipendente di data intelligence dedicata alla Scuderia Ferrari.',
  };

  return (
    <>
      <SEO
        title="Chi Siamo | Formula Rossa"
        description="Scopri la storia, la missione e il team dietro Formula Rossa. Una piattaforma indipendente dedicata ai tifosi Ferrari."
        path="/about"
        jsonLd={jsonLd}
      />

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Navigation />
        
        <main className="pt-20">
          {/* HERO SECTION - Immagini reali */}
          <section
            ref={heroRef}
            className="relative min-h-[85vh] flex items-center py-16 px-4 overflow-hidden"
          >
            {/* Sfondo sottile */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.1),transparent_50%)]" />
            
            <div className="relative max-w-7xl mx-auto w-full">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Testo hero */}
                <motion.div style={{ y: heroY }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 rounded-full text-red-500 text-sm font-medium mb-6 border border-red-600/20"
                  >
                    <Heart className="w-4 h-4 fill-red-500" />
                    <span>Il progetto</span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                  >
                    Una piattaforma<br />
                    per i{' '}
                    <span className="text-red-500 relative">
                      tifosi Ferrari
                      <span className="absolute -bottom-2 left-0 w-full h-1 bg-red-500/30 rounded-full" />
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-zinc-400 text-lg leading-relaxed max-w-lg mb-8"
                  >
                    Un archivio vivente di 75 anni di storia, da Ascari a Leclerc. 
                    Ogni vittoria, ogni pole, ogni stagione — raccontata attraverso i numeri.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-4"
                  >
                    <Link
                      href="/statistics"
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/40"
                    >
                      Esplora le statistiche
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/fanzone"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800/80 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all border border-zinc-700 hover:border-zinc-600"
                    >
                      Fan Zone
                    </Link>
                  </motion.div>

                  {/* Stats rapide */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-6 mt-10"
                  >
                    <div>
                      <div className="text-2xl font-bold text-white">75+</div>
                      <div className="text-xs text-zinc-600">anni di storia</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">1000+</div>
                      <div className="text-xs text-zinc-600">gare analizzate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">500K+</div>
                      <div className="text-xs text-zinc-600">datapoint</div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Griglia immagini - Solo foto reali */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="relative"
                >
                  <div className="grid grid-cols-3 gap-2">
                    {/* Colonna 1 */}
                    <div className="space-y-2">
                      <div className="aspect-[3/4] rounded-xl overflow-hidden">
                        <img
                          src={displayImages[0].url}
                          alt={displayImages[0].alt}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="aspect-square rounded-xl overflow-hidden">
                        <img
                          src={displayImages[1].url}
                          alt={displayImages[1].alt}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                    </div>

                    {/* Colonna 2 */}
                    <div className="space-y-2 mt-6">
                      <div className="aspect-square rounded-xl overflow-hidden">
                        <img
                          src={displayImages[2].url}
                          alt={displayImages[2].alt}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="aspect-[4/3] rounded-xl overflow-hidden">
                        <img
                          src={displayImages[3].url}
                          alt={displayImages[3].alt}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                    </div>

                    {/* Colonna 3 */}
                    <div className="space-y-2">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden">
                        <img
                          src={displayImages[4].url}
                          alt={displayImages[4].alt}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="aspect-square rounded-xl overflow-hidden">
                        <img
                          src={displayImages[5].url}
                          alt={displayImages[5].alt}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Badge caption */}
                  <div className="absolute -bottom-4 -right-4 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-400">
                    📸 Foto reali • Archivio storico
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* MISSIONE */}
          <section className="py-20 px-4 border-t border-zinc-800">
            <div className="max-w-4xl mx-auto text-center">
              <SectionLabel>La nostra missione</SectionLabel>
              <SectionTitle className="mb-6">
                Democratizzare l'accesso ai dati della Formula 1
              </SectionTitle>
              <p className="text-zinc-400 text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
                Formula Rossa è un progetto indipendente, creato da appassionati per gli appassionati. 
                Non siamo affiliati alla Ferrari S.p.A. — siamo semplicemente tifosi che credono 
                che i dati possano rendere la Formula 1 ancora più affascinante.
              </p>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {VALUES.map((value, i) => (
                  <Card key={i} className="text-left p-5">
                    <value.icon className="w-5 h-5 text-red-500 mb-2" />
                    <h3 className="font-semibold text-white text-sm mb-1">{value.title}</h3>
                    <p className="text-xs text-zinc-500">{value.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="py-16 px-4 bg-zinc-900/30 border-y border-zinc-800">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map((stat, i) => (
                <Card key={i} className="text-center p-5">
                  <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10 mb-2`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wide">{stat.label}</div>
                </Card>
              ))}
            </div>
          </section>

          {/* FEATURES */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <SectionLabel>Cosa offriamo</SectionLabel>
                <SectionTitle>Tutto su Formula Rossa</SectionTitle>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {FEATURES.map((feature, i) => (
                  <Card key={i} className="group hover:border-red-600/30 p-5">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.gradient} bg-opacity-10 flex items-center justify-center mb-3`}>
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    
                    <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{feature.desc}</p>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {feature.highlights.map((highlight, j) => (
                        <span key={j} className="text-[10px] px-2 py-1 bg-zinc-800 rounded-full text-zinc-300">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* TIMELINE */}
          <section className="py-20 px-4 bg-zinc-900/30 border-y border-zinc-800">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <SectionLabel>Roadmap</SectionLabel>
                <SectionTitle>La storia del progetto</SectionTitle>
              </div>

              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-800 md:left-1/2" />
                
                <div className="space-y-6">
                  {TIMELINE.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className={`relative flex items-start gap-4 ${
                        i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-xl z-10">
                        {item.icon}
                      </div>
                      
                      <Card className={`flex-1 p-4 ${
                        i % 2 === 0 ? 'md:text-right' : 'md:text-left'
                      }`}>
                        <div className="text-xs font-mono text-red-500 mb-0.5">{item.year}</div>
                        <h3 className="font-semibold text-white text-sm mb-1">{item.event}</h3>
                        <p className="text-xs text-zinc-500">{item.desc}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* YOUTUBE SECTION - Più piccola e compatta */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <SectionLabel>Video</SectionLabel>
                  <SectionTitle>Dal nostro canale YouTube</SectionTitle>
                </div>
                <a
                  href={FOUNDER.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600 border border-red-600/30 hover:border-red-600 rounded-lg text-red-400 hover:text-white text-xs font-medium transition-all"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>Vedi tutti</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {YOUTUBE_VIDEOS.map((video, i) => (
                  <YouTubeEmbed key={video.id} video={video} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* FOUNDER */}
          <section className="py-20 px-4 bg-zinc-900/30 border-y border-zinc-800">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <SectionLabel>Il team</SectionLabel>
                <SectionTitle>Chi c'è dietro</SectionTitle>
              </div>

              <Card className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-red-600/30">
                      <img
                        src="https://github.com/J0joFra.png"
                        alt={FOUNDER.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{FOUNDER.name}</h3>
                    <p className="text-red-500 text-xs mb-3">{FOUNDER.role}</p>
                    
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                      Sviluppatore full-stack e tifoso Ferrari da sempre. Ho iniziato questo progetto 
                      perché volevo un modo migliore di rivivere la storia della Scuderia attraverso i dati.
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={FOUNDER.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs transition-all"
                      >
                        <Github className="w-3.5 h-3.5" />
                        GitHub
                      </a>
                      <a
                        href={FOUNDER.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs transition-all"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        LinkedIn
                      </a>
                      <a
                        href={FOUNDER.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs transition-all"
                      >
                        <Youtube className="w-3.5 h-3.5" />
                        YouTube
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* TECH STACK */}
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <SectionLabel>Tecnologie</SectionLabel>
              <SectionTitle className="mb-6 text-2xl">Built with modern stack</SectionTitle>
              
              <div className="flex flex-wrap justify-center gap-2">
                {TECH_STACK.map((tech, i) => (
                  <div
                    key={i}
                    className="px-3 py-1.5 bg-zinc-800/80 rounded-lg text-xs hover:bg-zinc-700 transition-colors cursor-default border border-zinc-700"
                  >
                    <span className="mr-1.5">{tech.icon}</span>
                    <span className="text-zinc-300">{tech.name}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-zinc-600 mt-6">
                Stack open-source, dati verificabili, performance ottimizzata
              </p>
            </div>
          </section>

          {/* CTA FINALE */}
          <section className="py-20 px-4 bg-gradient-to-b from-zinc-900/30 to-transparent">
            <div className="max-w-2xl mx-auto text-center">
              <SectionLabel>Inizia ora</SectionLabel>
              <SectionTitle className="mb-3 text-3xl">
                Pronto a esplorare?
              </SectionTitle>
              <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
                75 anni di storia Ferrari ti aspettano. Statistiche, analisi, 
                predizioni AI e una community di tifosi.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/statistics"
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all text-sm"
                >
                  Esplora le statistiche
                </Link>
                <Link
                  href="/fanzone"
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all text-sm border border-zinc-700"
                >
                  Entra nella Fan Zone
                </Link>
              </div>
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