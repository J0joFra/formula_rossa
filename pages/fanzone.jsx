'use client';
/**
 * pages/fanzone.jsx
 * L'angolo leggero del sito: i tre mini-giochi e le app di Formula Rossa.
 *
 * Prima c'erano anche il Fanta GP, il bonus giornaliero e la classifica degli
 * SF Token, tutti legati all'accesso con Google. Con l'accesso tolto i token
 * restano sul dispositivo di chi gioca (lib/tokens.js) e la pagina presenta
 * solo quello che si può usare senza account: i giochi e le app.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gamepad2, Coins, Zap, Timer, Award, Smartphone } from 'lucide-react';
import PageShell, { PageHeader, Panel } from '../components/ui/PageShell';
import AppsSection from '../components/ferrari/AppsSection';
import { getTokens } from '../lib/tokens';

/* I premi sono letti dalle formule dei giochi, non scritti a occhio: le
   etichette di prima ("+50", "+150", "+30") non corrispondevano a nulla —
   il Pit Stop arriva a 100, e la Trivia parte da 30 invece di fermarcisi. */
const GIOCHI = [
  {
    href: '/games/pitstop',
    title: 'Pit Stop',
    icon: Timer,
    reward: 'fino a 100 SFT',
    desc: 'Riflessi al semaforo: fermare il cronometro al momento giusto, come ai box. Uno stop perfetto vale il massimo.',
  },
  {
    href: '/games/circuit-rush',
    title: 'Circuit Rush',
    icon: Zap,
    reward: 'cresce con la distanza',
    desc: 'Sfreccia in pista e schiva i detriti. Non c’è un tetto: più resisti, più SFT porti a casa.',
  },
  {
    href: '/games/trivia',
    title: 'Trivia',
    icon: Award,
    reward: 'da 30 SFT in su',
    desc: 'Domande sulla storia della Scuderia. Qui contano gli anni passati a guardare le gare.',
  },
];

function GameCard({ gioco, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: .4, delay: index * .07 }}
    >
      <Link
        href={gioco.href}
        className="group flex flex-col h-full p-6 rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] hover:border-[var(--fr-red)]/40 hover:-translate-y-1 transition-all"
      >
        <span
          className="w-12 h-12 rounded-[14px] grid place-items-center mb-4 bg-[var(--fr-red-soft)] text-[var(--fr-red)]"
          aria-hidden="true"
        >
          <gioco.icon className="w-6 h-6" />
        </span>

        <h3 className="uppercase text-lg mb-2">{gioco.title}</h3>
        <p className="text-sm text-[var(--fr-text-muted)] mb-5">{gioco.desc}</p>

        <span className="mt-auto inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-[9px] bg-[var(--fr-surface-2)] text-xs font-bold">
          <Coins className="w-3.5 h-3.5 text-[var(--fr-gold)]" aria-hidden="true" />
          <span className="text-[var(--fr-gold)]">{gioco.reward}</span>
        </span>
      </Link>
    </motion.div>
  );
}

export default function FanZonePage() {
  const [tokens, setTokens] = useState(0);

  useEffect(() => { setTokens(getTokens()); }, []);

  const seo = {
    title: 'Fan Zone — mini-giochi e app Ferrari',
    description: 'Tre mini-giochi a tema Ferrari — riflessi al pit stop, corsa in pista e domande sulla storia della Scuderia — e le app di Formula Rossa: GridUp e Driver Clash.',
    path: '/fanzone',
  };

  return (
    <PageShell seo={seo}>
      <PageHeader
        eyebrow="Gioca"
        title="Fan Zone"
        accent="Ferrari"
        subtitle="Tre mini-giochi a tema Ferrari per riempire l'attesa fra un Gran Premio e l'altro, e le app di Formula Rossa da portare in tasca."
        breadcrumb={[{ label: 'Gioca' }]}
        actions={tokens > 0 ? (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--fr-border)] bg-[var(--fr-surface)]">
            <Coins className="w-4 h-4 text-[var(--fr-gold)]" aria-hidden="true" />
            <span className="tabular font-bold">{tokens.toLocaleString('it-IT')}</span>
            <span className="text-xs font-semibold text-[var(--fr-text-faint)]">SFT</span>
          </span>
        ) : null}
      />

      <div className="grid gap-10">

        {/* I giochi */}
        <section>
          <h2 className="flex items-center gap-2 text-base font-black uppercase tracking-wide mb-4">
            <Gamepad2 className="w-4 h-4 text-[var(--fr-red)]" aria-hidden="true" />
            I giochi
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {GIOCHI.map((g, i) => <GameCard key={g.href} gioco={g} index={i} />)}
          </div>
        </section>

        {/* Le app — l'ancora serve al link "Driver Clash" del footer */}
        <section id="app" className="scroll-mt-24">
          <h2 className="flex items-center gap-2 text-base font-black uppercase tracking-wide mb-4">
            <Smartphone className="w-4 h-4 text-[var(--fr-red)]" aria-hidden="true" />
            Le nostre app
          </h2>
          <AppsSection compact />
        </section>

        <Panel title="Cosa sono gli SF Token">
          <div className="p-6 text-sm text-[var(--fr-text-muted)] space-y-3">
            <p>
              Sono un punteggio, non una valuta: si guadagnano giocando e misurano
              quanto e quanto bene hai giocato. Non si comprano, non si scambiano e
              non danno accesso a nulla.
            </p>
            <p>
              Non serve nessun account: restano salvati su questo dispositivo, nel
              browser con cui giochi. Se cancelli i dati del sito, ripartono da zero.
            </p>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
