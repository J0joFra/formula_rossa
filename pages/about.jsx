// pages/about.jsx
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import {
  Database, BarChart3, Users, Zap, Trophy, Code2,
  Globe, Heart, Github, Linkedin, Youtube, Instagram,
  ChevronRight, Flag, Star, Activity
} from 'lucide-react';
import Link from 'next/link';

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
  },
  {
    icon: Zap,
    title: 'AI Predictor',
    desc: 'Un algoritmo che analizza dati storici, condizioni meteo, risultati delle qualifiche e forma recente per generare previsioni sul prossimo Gran Premio.',
  },
  {
    icon: Users,
    title: 'Fan Zone & Community',
    desc: 'Mini-games, classifiche globali, SF Tokens e premi esclusivi. Un luogo dove la passione per la Ferrari diventa esperienza interattiva.',
  },
  {
    icon: Database,
    title: 'Database F1DB',
    desc: 'I dati provengono dal progetto open-source F1DB, arricchiti con fonti ufficiali FIA e Motorsport. Ogni record è tracciabile e verificabile.',
  },
  {
    icon: Activity,
    title: 'Live Timing',
    desc: 'Durante i weekend di gara, aggiornamenti in tempo reale su classifiche, tempi sul giro e radiocomandi direttamente dal box Ferrari.',
  },
  {
    icon: Globe,
    title: 'Multipiattaforma',
    desc: 'Formula Rossa è ottimizzata per ogni dispositivo: desktop, tablet e mobile. Accessibile ovunque tu stia seguendo il Gran Premio.',
  },
];

const TIMELINE = [
  { year: '2024', event: 'Idea e primo prototipo', desc: 'Nasce l\'idea di creare la piattaforma dati Ferrari definitiva per i tifosi.' },
  { year: '2025', event: 'Lancio Beta',              desc: 'Prima versione pubblica con statistiche storiche e confronto piloti.' },
  { year: '2025', event: 'AI Predictor',             desc: 'Integrazione dell\'algoritmo di previsione basato su machine learning.' },
  { year: '2026', event: 'Fan Zone',                 desc: 'Lancio della community interattiva con mini-games e sistema di reward.' },
];

export default function AboutPage() {
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

      <div className="min-h-screen bg-black text-white">
        <Navigation />

        <main className="pt-20">

          {/* ── HERO ── */}
          <section className="relative py-24 md:py-36 px-4 overflow-hidden" aria-label="Presentazione Formula Rossa">
            {/* Sfondo */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, #DC0000 1px, transparent 0)',
                  backgroundSize: '48px 48px',
                }}
              />
              <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-[80px]" />
            </div>

            <div className="relative max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                  <Heart className="w-3 h-3 fill-red-500" aria-hidden="true" /> Il Progetto
                </span>

                <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-8">
                  Dati al servizio<br />
                  della <span className="text-red-600">Passione</span>
                </h1>

                <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-6">
                  Formula Rossa nasce da una semplice domanda: <em>"Perché non esiste un posto dove trovare 
                  tutti i dati Ferrari in modo bello e accessibile?"</em>
                </p>
                <p className="text-zinc-500 text-base max-w-2xl mx-auto leading-relaxed">
                  Dal 1950 ad oggi, la Scuderia Ferrari è la squadra più vincente e iconica della Formula 1. 
                  Oltre 240 vittorie, 16 titoli costruttori, piloti leggendari da Ascari a Schumacher, 
                  da Lauda a Leclerc. Questa storia merita una piattaforma all'altezza.
                </p>
              </motion.div>
            </div>
          </section>

          {/* ── NUMERI ── */}
          <section className="py-16 px-4 border-y border-white/5 bg-zinc-950/50" aria-label="Numeri del progetto">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-5 h-5 text-red-600 mx-auto mb-3" aria-hidden="true" />
                  <div className="text-3xl md:text-4xl font-black text-white tracking-tighter">{stat.value}</div>
                  <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── MISSIONE ── */}
          <section className="py-24 px-4" aria-label="Missione e valori">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-6">
                    La nostra <span className="text-red-600">Missione</span>
                  </h2>
                  <div className="space-y-4 text-zinc-400 leading-relaxed">
                    <p>
                      Formula Rossa è un progetto indipendente, creato da appassionati per gli appassionati. 
                      Non siamo affiliati alla Ferrari S.p.A. o alla Scuderia Ferrari — siamo semplicemente 
                      tifosi che credono che i dati possano rendere la Formula 1 ancora più affascinante.
                    </p>
                    <p>
                      La nostra missione è democratizzare l'accesso alle statistiche F1: rendere comprensibili 
                      dati complessi attraverso visualizzazioni interattive, grafici chiari e strumenti intuitivi 
                      che chiunque possa usare, dal tifoso occasionale all'analista di settore.
                    </p>
                    <p>
                      Crediamo che ogni gara, ogni sorpasso, ogni pole position abbia una storia da raccontare 
                      attraverso i numeri. Formula Rossa è quel racconto.
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-red-600 mb-6">Storia del Progetto</h3>
                  {TIMELINE.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-600/40 flex items-center justify-center flex-shrink-0">
                          <span className="text-red-500 text-[9px] font-black">{item.year.slice(2)}</span>
                        </div>
                        {i < TIMELINE.length - 1 && (
                          <div className="w-px h-full bg-white/5 mt-2" aria-hidden="true" />
                        )}
                      </div>
                      <div className="pb-6">
                        <div className="text-[10px] text-red-600/60 font-black uppercase tracking-widest mb-0.5">{item.year}</div>
                        <h4 className="text-white font-bold text-sm mb-1">{item.event}</h4>
                        <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── FEATURES ── */}
          <section className="py-24 px-4 bg-zinc-950/50 border-y border-white/5" aria-label="Funzionalità della piattaforma">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
                  Cosa trovi su <span className="text-red-600">Formula Rossa</span>
                </h2>
                <p className="text-zinc-500 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">
                  Una piattaforma completa per esplorare la storia della Ferrari in Formula 1, 
                  con strumenti di analisi avanzati e una community di appassionati.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 hover:border-red-600/30 transition-colors"
                  >
                    <f.icon className="w-6 h-6 text-red-600 mb-4" aria-hidden="true" />
                    <h3 className="font-black text-white text-sm uppercase tracking-wide mb-2">{f.title}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FOUNDER ── */}
          <section className="py-24 px-4" aria-label="Il fondatore">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">
                Chi c'è <span className="text-red-600">dietro</span>
              </h2>
              <p className="text-zinc-500 text-sm mb-12 max-w-xl mx-auto leading-relaxed">
                Formula Rossa è un progetto personale, costruito una riga di codice alla volta durante 
                notti insonni e weekend di gara.
              </p>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 md:p-12 text-left"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                  {/* Avatar placeholder */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center flex-shrink-0 shadow-xl shadow-red-600/20">
                    <span className="text-3xl font-black text-white">JF</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{FOUNDER.name}</h3>
                    <p className="text-red-500 text-xs font-black uppercase tracking-widest mt-1">{FOUNDER.role}</p>
                  </div>
                </div>

                <div className="space-y-4 text-zinc-400 text-sm leading-relaxed mb-8">
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
                    { icon: Github,    href: FOUNDER.github,    label: 'GitHub di Joaquim Francalanci'    },
                    { icon: Linkedin,  href: FOUNDER.linkedin,  label: 'LinkedIn di Formula Rossa'        },
                    { icon: Youtube,   href: FOUNDER.youtube,   label: 'YouTube di Joaquim Francalanci'   },
                    { icon: Instagram, href: FOUNDER.instagram, label: 'Instagram di Formula Rossa'       },
                  ].map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-red-600 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all"
                    >
                      <s.icon className="w-4 h-4" aria-hidden="true" />
                      {s.label.split(' ')[0]}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* ── TECNOLOGIE ── */}
          <section className="py-16 px-4 bg-zinc-950/50 border-t border-white/5" aria-label="Tecnologie usate">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">
                Costruito con <span className="text-red-600">passione</span> e tecnologia
              </h2>
              <p className="text-zinc-600 text-xs mb-8">
                Stack tecnico open-source, dati verificabili, performance ottimizzata.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-xs">
                {['Next.js', 'React', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'F1DB', 'Next-Auth', 'Vercel'].map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-lg text-zinc-400 font-mono font-bold"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="py-24 px-4" aria-label="Esplora la piattaforma">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">
                Pronto a esplorare?
              </h2>
              <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                Immergiti in 75 anni di storia Ferrari. Statistiche, analisi, predizioni AI 
                e una community di tifosi ti aspettano.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/statistics"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-lg shadow-red-600/20"
                >
                  Esplora le Statistiche <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/fanzone"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all"
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
