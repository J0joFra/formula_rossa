import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart3, Zap, Gamepad2, ArrowRight } from 'lucide-react';

import Navigation from '../components/ferrari/Navigation';
import HeroSection from '../components/ferrari/HeroSection';
import StatsSection from '../components/ferrari/StatsSection';
import NewsSection from '../components/ferrari/NewsSection';
import GridUpPromo from '../components/ferrari/GridUpPromo';
import Footer from '../components/ferrari/Footer';
import SEO from '../components/seo';

/* I tre pilastri: stessa struttura del menu, così la home spiega il sito. */
const PILLARS = [
  {
    n: '01',
    id: 'dati',
    icon: BarChart3,
    title: 'Dati',
    tone: 'red',
    desc: 'Il cuore del sito. Statistiche storiche, classifiche, piloti, circuiti e archivio gare, con numeri verificabili.',
    links: [
      { href: '/statistics', label: 'Statistiche' },
      { href: '/standings',  label: 'Classifiche' },
      { href: '/piloti',     label: 'Piloti' },
      { href: '/circuiti',   label: 'Circuiti' },
      { href: '/races',      label: 'Gare' },
    ],
  },
  {
    n: '02',
    id: 'live',
    icon: Zap,
    title: 'Live',
    tone: 'teal',
    desc: 'Cosa succede ora in pista: tempi in tempo reale durante le sessioni e le notizie dal mondo Ferrari e Formula 1.',
    links: [
      { href: '/live-timing', label: 'Live Timing' },
      { href: '/news',        label: 'News' },
    ],
  },
  {
    n: '03',
    id: 'gioca',
    icon: Gamepad2,
    title: 'Gioca',
    tone: 'gold',
    desc: 'Un angolo leggero: mini-giochi a tema Ferrari per mettere alla prova la tua conoscenza tra un GP e l’altro.',
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

function PillarCard({ pillar, index }) {
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
      <p className="text-sm text-[var(--fr-text-muted)] mb-5">{pillar.desc}</p>

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
function FactsBand() {
  const seasons = new Date().getFullYear() - 1950;
  const facts = [
    { value: `${seasons}`, label: 'Stagioni in F1' },
    { value: '1.000+',     label: 'GP disputati' },
    { value: '16',         label: 'Titoli costruttori' },
    { value: '15',         label: 'Titoli piloti' },
    { value: '1950',       label: 'Dal primo GP' },
  ];
  return (
    <div className="border-y border-[var(--fr-border)] bg-[var(--fr-surface-3)]">
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
  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Formula Rossa',
    url: 'https://formula-rossa.it',
    description: 'Piattaforma di statistiche e analisi dati della Scuderia Ferrari F1.',
    inLanguage: 'it',
  };

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

  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: 'GridUp',
    operatingSystem: 'Android, Web',
    applicationCategory: 'SportsApplication',
    description: 'Calcola i punti necessari per vincere il Campionato del Mondo di F1: scenari in tempo reale, classifiche piloti e costruttori e confronti tra piloti.',
    url: 'https://gridup-f1.web.app',
    installUrl: 'https://play.google.com/store/apps/details?id=com.gridup.app',
    inLanguage: 'it',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    author: { '@type': 'Organization', name: 'Formula Rossa', url: 'https://formula-rossa.it' },
  };

  return (
    <div className="min-h-screen bg-[var(--fr-bg)] text-[var(--fr-text)]">
      <SEO
        title="Statistiche e Analisi Dati Ferrari F1"
        description="Formula Rossa è la piattaforma italiana per i tifosi della Scuderia Ferrari: statistiche F1, dati storici e classifiche sempre aggiornate."
        path="/"
        jsonLd={homeJsonLd}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />

      <Navigation />

      <main>
        <HeroSection />

        {/* ── I tre pilastri ── */}
        <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-wrap mx-auto">
            <header className="mb-9">
              <span className="fr-eyebrow">La piattaforma</span>
              <h2 className="uppercase mt-3">Tre modi per vivere la Rossa</h2>
              <p className="text-[var(--fr-text-muted)] mt-2.5 max-w-[56ch]">
                I dati al centro, il live sempre a portata e un angolo per giocare.
                Il fanta e il calcolatore del Mondiale vivono nell&apos;app GridUp.
              </p>
            </header>

            <div className="grid md:grid-cols-3 gap-5">
              {PILLARS.map((p, i) => <PillarCard key={p.id} pillar={p} index={i} />)}
            </div>
          </div>
        </section>

        <FactsBand />

        <GridUpPromo />

        <StatsSection />

        <NewsSection />
      </main>

      <Footer />
    </div>
  );
}
