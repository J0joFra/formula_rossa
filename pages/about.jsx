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
  Award, Target, Code, BookOpen, MessageCircle, Sparkles
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
    highlights: ['245 vittorie', '243 pole position', '16 titoli costruttori']
  },
  { 
    icon: Zap,       
    title: 'AI Predictor',          
    gradient: 'from-yellow-500 to-yellow-700',
    desc: 'Un algoritmo che analizza dati storici, condizioni meteo e forma recente per generare previsioni sul prossimo Gran Premio con accuratezza superiore all\'80%.',
    highlights: ['80% accuratezza', 'Machine Learning', 'Analisi real-time']
  },
  { 
    icon: Users,     
    title: 'Fan Zone & Community',  
    gradient: 'from-red-600 to-red-800',
    desc: 'Mini-games, classifiche globali e SF Tokens. Un luogo dove la passione per la Ferrari diventa esperienza interattiva con migliaia di tifosi.',
    highlights: ['10K+ utenti', 'Mini-games', 'Rewards esclusivi']
  },
  { 
    icon: Database,  
    title: 'Database F1DB',         
    gradient: 'from-zinc-600 to-zinc-800',
    desc: 'I dati provengono dal progetto open-source F1DB, arricchiti con fonti ufficiali FIA. Ogni record è tracciabile e verificabile.',
    highlights: ['Open source', 'Verificato FIA', '60+ anni dati']
  },
  { 
    icon: Activity,  
    title: 'Live Timing',           
    gradient: 'from-red-600 to-red-800',
    desc: 'Durante i weekend di gara, aggiornamenti in tempo reale su classifiche, tempi sul giro e radiocomandi dal box Ferrari.',
    highlights: ['Real-time', 'Team radio', 'Settori cronometrati']
  },
  { 
    icon: Globe,     
    title: 'Multipiattaforma',      
    gradient: 'from-zinc-600 to-zinc-800',
    desc: 'Formula Rossa è ottimizzata per ogni dispositivo: desktop, tablet e mobile. Accessibile ovunque tu stia seguendo il Gran Premio.',
    highlights: ['Responsive', 'PWA ready', 'Mobile first']
  },
];

const TIMELINE = [
  { year: 'Dic 2025', event: 'Idea e primo prototipo', desc: "Nasce l'idea di creare la piattaforma dati Ferrari definitiva per i tifosi.", icon: '💡', color: 'bg-red-600/20' },
  { year: 'Gen 2026', event: 'Lancio Beta', desc: 'Prima versione pubblica con statistiche storiche e confronto piloti.', icon: '🚀', color: 'bg-yellow-600/20' },
  { year: 'Feb 2026', event: 'AI Predictor', desc: "Integrazione dell'algoritmo di previsione basato su machine learning.", icon: '🤖', color: 'bg-blue-600/20' },
  { year: 'Feb 2026', event: 'Fan Zone', desc: 'Lancio della community interattiva con mini-games e sistema di reward.', icon: '🏆', color: 'bg-purple-600/20' },
  { year: 'Mar 2026', event: 'Versione ufficiale', desc: 'Prima versione completa con dati real-time e integrazione app.', icon: '🏎️', color: 'bg-green-600/20' },
];

const YOUTUBE_VIDEOS = [
  { id: 'Ku6j9PU_kAY', title: 'Presentazione Formula Rossa', views: '2.5K', duration: '12:34' },
  { id: 'sOelL-Jfw6o', title: 'Analisi GP Monaco 2025', views: '1.8K', duration: '18:22' },
  { id: 'RhIJ3ghifzc', title: 'Storia Ferrari: 75 anni di dati', views: '3.2K', duration: '24:15' },
];

const TECH_STACK = [
  { name: 'Next.js 14', category: 'Framework', icon: '⚛️' },
  { name: 'React 18', category: 'UI Library', icon: '⚛️' },
  { name: 'Tailwind CSS', category: 'Styling', icon: '🎨' },
  { name: 'Framer Motion', category: 'Animations', icon: '🎬' },
  { name: 'Recharts', category: 'Data Viz', icon: '📊' },
  { name: 'F1DB', category: 'Data Source', icon: '🏁' },
  { name: 'Next-Auth', category: 'Auth', icon: '🔐' },
  { name: 'Vercel', category: 'Hosting', icon: '▲' },
];

const VALUES = [
  { icon: Target, title: 'Trasparenza', desc: 'Tutti i dati sono verificabili e tracciabili, con fonti ufficiali citate.' },
  { icon: Heart, title: 'Passione', desc: 'Costruito da tifosi per tifosi, con attenzione ai dettagli che contano.' },
  { icon: Award, title: 'Qualità', desc: 'Design curato, performance ottimizzata, esperienza utente premium.' },
  { icon: Users, title: 'Community', desc: 'Uno spazio dove i tifosi possono interagire, competere e condividere.' },
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

function YouTubeEmbed({ videoId, title, views, duration, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="p-0 overflow-hidden">
        <div className="relative aspect-video bg-zinc-800">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        <div className="p-4">
          <h4 className="font-semibold text-white mb-2 line-clamp-1">{title}</h4>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <span>👁️</span> {views}
            </span>
            <span className="flex items-center gap-1">
              <span>⏱️</span> {duration}
            </span>
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
          {/* HERO SECTION - Sfondo pulito */}
          <section
            ref={heroRef}
            className="relative min-h-[80vh] flex items-center py-16 px-4"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none" />
            
            <div className="relative max-w-7xl mx-auto w-full">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Testo hero */}
                <motion.div style={{ y: heroY }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 rounded-full text-red-500 text-sm font-medium mb-6"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Il progetto</span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                  >
                    Una piattaforma per i{' '}
                    <span className="text-red-500">tifosi Ferrari</span>
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
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-all"
                    >
                      Esplora le statistiche
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/fanzone"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all"
                    >
                      Fan Zone
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Immagini hero */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className="space-y-3">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-800">
                      <img
                        src={heroImages[0]?.urls?.regular || '/api/placeholder/400/400'}
                        alt="Ferrari F1"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-800">
                      <img
                        src={heroImages[1]?.urls?.regular || '/api/placeholder/400/300'}
                        alt="Ferrari F1"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 pt-6">
                    <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-800">
                      <img
                        src={heroImages[2]?.urls?.regular || '/api/placeholder/400/300'}
                        alt="Ferrari F1"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-800">
                      <img
                        src={heroImages[3]?.urls?.regular || '/api/placeholder/400/400'}
                        alt="Ferrari F1"
                        className="w-full h-full object-cover"
                      />
                    </div>
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
              <p className="text-zinc-400 text-lg leading-relaxed mb-12">
                Formula Rossa è un progetto indipendente, creato da appassionati per gli appassionati. 
                Non siamo affiliati alla Ferrari S.p.A. — siamo semplicemente tifosi che credono 
                che i dati possano rendere la Formula 1 ancora più affascinante.
              </p>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {VALUES.map((value, i) => (
                  <Card key={i} className="text-left">
                    <value.icon className="w-6 h-6 text-red-500 mb-3" />
                    <h3 className="font-semibold text-white mb-1">{value.title}</h3>
                    <p className="text-sm text-zinc-500">{value.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="py-16 px-4 bg-zinc-900/30 border-y border-zinc-800">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((stat, i) => (
                <Card key={i} className="text-center p-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wide">{stat.label}</div>
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
                  <Card key={i} className="group hover:border-red-600/30">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} bg-opacity-10 flex items-center justify-center mb-4`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{feature.desc}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {feature.highlights.map((highlight, j) => (
                        <span key={j} className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-zinc-300">
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
                {/* Linea temporale */}
                <div className="absolute left-8 top-0 bottom-0 w-px bg-zinc-800 md:left-1/2" />
                
                <div className="space-y-8">
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
                      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-2xl z-10 md:w-12 md:h-12">
                        {item.icon}
                      </div>
                      
                      <Card className={`flex-1 p-5 ${
                        i % 2 === 0 ? 'md:text-right' : 'md:text-left'
                      }`}>
                        <div className="text-sm font-mono text-red-500 mb-1">{item.year}</div>
                        <h3 className="font-semibold text-white mb-1">{item.event}</h3>
                        <p className="text-sm text-zinc-500">{item.desc}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* FOUNDER */}
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <SectionLabel>Il team</SectionLabel>
                <SectionTitle>Chi c'è dietro</SectionTitle>
              </div>

              <Card className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-red-600/30">
                      <img
                        src="https://github.com/J0joFra.png"
                        alt={FOUNDER.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-1">{FOUNDER.name}</h3>
                    <p className="text-red-500 text-sm mb-4">{FOUNDER.role}</p>
                    
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                      Sviluppatore full-stack e tifoso Ferrari da sempre. Ho iniziato questo progetto 
                      perché volevo un modo migliore di rivivere la storia della Scuderia attraverso i dati.
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={FOUNDER.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-all"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                      <a
                        href={FOUNDER.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-all"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                      <a
                        href={FOUNDER.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-all"
                      >
                        <Youtube className="w-4 h-4" />
                        YouTube
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* TECH STACK */}
          <section className="py-16 px-4 bg-zinc-900/30 border-y border-zinc-800">
            <div className="max-w-4xl mx-auto text-center">
              <SectionLabel>Tecnologie</SectionLabel>
              <SectionTitle className="mb-8">Built with modern stack</SectionTitle>
              
              <div className="flex flex-wrap justify-center gap-2">
                {TECH_STACK.map((tech, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700 transition-colors cursor-default"
                  >
                    <span className="mr-2">{tech.icon}</span>
                    <span className="text-zinc-300">{tech.name}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-zinc-600 mt-6">
                Stack open-source, dati verificabili, performance ottimizzata
              </p>
            </div>
          </section>

          {/* CTA FINALE */}
          <section className="py-24 px-4">
            <div className="max-w-2xl mx-auto text-center">
              <SectionLabel>Inizia ora</SectionLabel>
              <SectionTitle className="mb-4">
                Pronto a esplorare?
              </SectionTitle>
              <p className="text-zinc-400 text-lg mb-8">
                75 anni di storia Ferrari ti aspettano. Statistiche, analisi, 
                predizioni AI e una community di tifosi.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/statistics"
                  className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all"
                >
                  Esplora le statistiche
                </Link>
                <Link
                  href="/fanzone"
                  className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all"
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