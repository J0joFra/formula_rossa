import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart3, Trophy, Gamepad2 } from 'lucide-react';

import Navigation from '../components/ferrari/Navigation';
import HeroSection from '../components/ferrari/HeroSection';
import StatsSection from '../components/ferrari/StatsSection';
import NewsSection from '../components/ferrari/NewsSection';
import GridUpPromo from '../components/ferrari/GridUpPromo';
import Footer from '../components/ferrari/Footer';
import SEO from '../components/seo';
import { GRIDUP_URL } from '../lib/gridup';

/* I tre pilastri: stessa struttura del menu, così la home spiega il sito.
   Qui restano solo i dati che non cambiano con la lingua — icona, colore,
   destinazioni. Titoli e descrizioni sono chiavi, risolte al render: prima
   erano scritti in italiano dentro l'array, quindi restavano in italiano
   anche col sito in inglese. Le voci dei link riusano le chiavi del menu. */
const PILLARS = [
  {
    n: '01',
    id: 'archivio',
    icon: BarChart3,
    title: 'Archivio',
    desc: 'Il cuore del sito: {years} anni di Ferrari in Formula 1. Record, statistiche, schede piloti e circuiti, con numeri verificabili.',
    tone: 'red',
    links: [
      { href: '/statistics', label: 'Statistiche' },
      { href: '/piloti',     label: 'Piloti' },
      { href: '/circuiti',   label: 'Circuiti' },
    ],
  },
  {
    n: '02',
    id: 'stagione',
    icon: Trophy,
    title: 'Stagione',
    desc: 'Il campionato in corso: classifiche aggiornate, l’analisi di ogni Gran Premio e le notizie dal mondo Ferrari.',
    tone: 'teal',
    links: [
      { href: '/standings', label: 'Classifiche' },
      { href: '/gp',        label: 'Analisi GP' },
      { href: '/news',      label: 'News' },
    ],
  },
  {
    n: '03',
    id: 'gioca',
    icon: Gamepad2,
    title: 'Gioca',
    desc: 'Un angolo leggero: mini-giochi a tema Ferrari per mettere alla prova la tua conoscenza tra un GP e l’altro.',
    tone: 'gold',
    links: [
      { href: '/fanzone',            label: 'Fan Zone' },
      { href: '/games/trivia',       label: 'Trivia' },
      { href: '/games/pitstop',      label: 'Pit Stop' },
      { href: '/games/circuit-rush', label: 'Circuit Rush' },
    ],
  },
];

const TONE = {
  red:  { bg: 'var(--fr-red-soft)', fg: 'var(--fr-red)' },
  teal: { bg: 'color-mix(in srgb, var(--fr-teal) 16%, transparent)', fg: 'var(--fr-teal)' },
  gold: { bg: 'color-mix(in srgb, var(--fr-gold) 20%, transparent)', fg: 'var(--fr-gold)' },
};

function PillarCard({ pillar, index, years }) {
  const tone = TONE[pillar.tone];
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: .45, delay: index * .08 }}
      className="relative flex flex-col min-h-[290px] p-7 rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] shadow-[var(--fr-shadow-sm)] transition-all hover:-translate-y-1 hover:border-[var(--fr-border-strong)] overflow-hidden"
    >
      <span
        className="absolute top-5 right-6 font-head font-black text-[44px] leading-none text-[var(--fr-surface-2)] select-none"
        aria-hidden="true"
      >
        {pillar.n}
      </span>

      <span
        className="w-[52px] h-[52px] rounded-[15px] grid place-items-center mb-4"
        style={{ background: tone.bg, color: tone.fg }}
        aria-hidden="true"
      >
        <pillar.icon className="w-6 h-6" />
      </span>

      <h3 className="uppercase mb-2">{pillar.title}</h3>
      <p className="text-sm text-[var(--fr-text-muted)] mb-5">{pillar.desc.replace('{years}', years)}</p>

      <div className="mt-auto flex flex-wrap gap-1.5">
        {pillar.links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="text-xs font-semibold px-3 py-1.5 rounded-[9px] bg-[var(--fr-surface-2)] text-[var(--fr-text-muted)] hover:bg-[var(--fr-red)] hover:text-white transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </motion.article>
  );
}

/* Fatti solidi e verificabili — niente cifre gonfiate. */
function FactsBand({ years }) {
  /* Niente `toLocaleString` qui: questi numeri si dipingono anche sul server,
     e Node e browser non raggruppano le migliaia allo stesso modo — in
     italiano il primo dà "1000" e il secondo "1.000", e React fallisce
     l'idratazione. Il separatore giusto per ogni lingua sta nel dizionario. */
  const facts = [
    { label: 'Stagioni in F1', value: String(years) },
    { label: 'GP disputati',      value: '1.000+' },
    { label: 'Titoli costruttori',    value: '16' },
    { label: 'Titoli piloti',  value: '15' },
    { label: 'Dal primo GP',   value: '1950' },
  ];
  return (
    <div className="snap-section border-y border-[var(--fr-border)] bg-[var(--fr-surface-3)]">
      <div className="max-w-wrap mx-auto px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 md:grid-cols-5">
          {facts.map((f, i) => (
            <div
              key={f.label}
              className={`py-8 px-3 text-center border-[var(--fr-border)] ${i < facts.length - 1 ? 'md:border-r' : ''} ${i < 3 ? 'border-b md:border-b-0' : ''}`}
            >
              <dt className="sr-only">{f.label}</dt>
              <dd>
                <span className="tabular block text-[30px] font-bold leading-none tracking-tight text-[var(--fr-text)]">
                  {f.value}
                </span>
                <span className="block text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--fr-text-faint)] mt-2">
                  {f.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export default function Home() {
  // 1950 è la prima stagione, quindi va contata.
  const stagioni = new Date().getFullYear() - 1950 + 1;

  /* Qui c'erano un secondo nodo WebSite e un secondo Organization, che
     ripetevano quelli già emessi da _document.jsx e da components/seo.js su
     ogni pagina — con una contraddizione: `foundingDate` diceva 2024 qui e
     2025 là. Due entità con lo stesso nome e dati diversi non si sommano: chi
     legge deve scegliere quale credere, ed è il tipo di incoerenza che fa
     scartare tutto lo structured data. Resta solo l'applicazione, che è
     l'unica entità che questa pagina aggiunge davvero. */
  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: 'GridUp',
    operatingSystem: 'Android, Web',
    applicationCategory: 'SportsApplication',
    description: 'Calcola i punti necessari per vincere il Campionato del Mondo di F1: scenari in tempo reale, classifiche piloti e costruttori e confronti tra piloti.',
    /* `url` è la pagina canonica dell'app: ora è la scheda dello store, la
       stessa a cui puntano i link del sito. */
    url: GRIDUP_URL,
    installUrl: GRIDUP_URL,
    inLanguage: 'it',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    author: { '@type': 'Organization', name: 'Formula Rossa', url: 'https://formula-rossa.it' },
  };

  return (
    <div className="min-h-screen text-[var(--fr-text)]">
      <SEO
        title="Statistiche e Analisi Dati Ferrari F1"
        description="Formula Rossa è la piattaforma italiana per i tifosi della Scuderia Ferrari: statistiche F1, dati storici e classifiche sempre aggiornate."
        path="/"
        /* Passa dal componente SEO, quindi finisce nella <head> come gli
           altri: i due <script> sciolti qui sotto stavano nel <body>. */
        jsonLd={appJsonLd}
      />

      <Navigation />

      <main>
        <HeroSection />

        {/* ── I tre pilastri ── */}
        <section className="snap-section py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-wrap mx-auto">
            <header className="mb-9">
              <span className="fr-eyebrow">La piattaforma</span>
              <h2 className="uppercase mt-3">Tre modi per vivere la Rossa</h2>
              <p className="text-[var(--fr-text-muted)] mt-2.5 max-w-[56ch]">
                L’archivio storico al centro, la stagione in corso sempre aggiornata e un angolo per giocare. Il calcolatore del Mondiale vive nell’app GridUp.
              </p>
            </header>

            <div className="grid md:grid-cols-3 gap-5">
              {PILLARS.map((p, i) => (
                <PillarCard key={p.id} pillar={p} index={i} years={stagioni} />
              ))}
            </div>
          </div>
        </section>

        <FactsBand years={stagioni} />

        <GridUpPromo />

        <StatsSection />

        <NewsSection />
      </main>

      <Footer />
    </div>
  );
}
