'use client';
/**
 * components/ui/GameShell.jsx
 * Cornice condivisa dei mini-giochi.
 *
 * Intestazione, briciole e colori sono quelli delle altre pagine del sito
 * (PageHeader, token --fr-*): prima ogni gioco disegnava un titolo enorme in
 * corsivo con colori scritti a mano (`text-zinc-*`, `bg-black`) che col tema
 * chiaro diventavano illeggibili. Il gioco vero e proprio sta in `children`;
 * sotto, i link agli altri giochi e alle app.
 */

import React from 'react';
import Link from 'next/link';
import { Coins, Trophy, Timer, Zap, Award, ArrowRight } from 'lucide-react';
import PageShell, { PageHeader } from './PageShell';

/** Gli altri giochi del sito, per il blocco "Continua a giocare". */
const GIOCHI = [
  { href: '/games/pitstop',      title: 'Pit Stop',     icon: Timer, desc: 'Cambia le quattro gomme più veloce della Ferrari.' },
  { href: '/games/circuit-rush', title: 'Circuit Rush', icon: Zap,   desc: 'Schiva i rivali e resisti più giri che puoi.' },
  { href: '/games/trivia',       title: 'Trivia',       icon: Award, desc: 'Dieci domande sulla storia della Ferrari e della F1.' },
];

/** Badge con il saldo SF Token, se ce n'è. */
function Saldo({ tokens }) {
  if (!tokens) return null;
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--fr-border)] bg-[var(--fr-surface)]">
      <Coins className="w-4 h-4 text-[var(--fr-gold)]" aria-hidden="true" />
      <span className="tabular font-bold">{tokens.toLocaleString('it-IT')}</span>
      <span className="text-xs font-semibold text-[var(--fr-text-faint)]">SFT</span>
    </span>
  );
}

/** Badge con il record personale. */
export function Record({ label = 'Record', value }) {
  if (value === null || value === undefined) return null;
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--fr-border)] bg-[var(--fr-surface)]">
      <Trophy className="w-4 h-4 text-[var(--fr-gold)]" aria-hidden="true" />
      <span className="text-xs font-semibold text-[var(--fr-text-faint)]">{label}</span>
      <span className="tabular font-bold">{value}</span>
    </span>
  );
}

export default function GameShell({
  children, seo, title, accent, subtitle, tokens = 0, record = null, className = '',
}) {
  const altri = GIOCHI.filter((g) => g.href !== seo?.path);

  return (
    <PageShell seo={seo} className={className}>
      <PageHeader
        eyebrow="Fan Zone · Gioco"
        title={title}
        accent={accent}
        subtitle={subtitle}
        breadcrumb={[{ label: 'Fan Zone', href: '/fanzone' }, { label: [title, accent].filter(Boolean).join(' ') }]}
        actions={(record || tokens > 0) ? (
          <>
            {record}
            <Saldo tokens={tokens} />
          </>
        ) : null}
      />

      {children}

      <section className="mt-14" aria-labelledby="altri-giochi">
        <h2 id="altri-giochi" className="text-base font-black uppercase tracking-wide mb-4">
          Continua a giocare
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {altri.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="group flex items-center gap-4 p-5 rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] hover:border-[var(--fr-red)]/40 transition-colors"
            >
              <span className="w-11 h-11 shrink-0 rounded-[13px] grid place-items-center bg-[var(--fr-red-soft)] text-[var(--fr-red)]">
                <g.icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-head text-lg font-black uppercase text-[var(--fr-text)]">{g.title}</span>
                <span className="block text-xs text-[var(--fr-text-muted)]">{g.desc}</span>
              </span>
            </Link>
          ))}
          <Link
            href="/fanzone#app"
            className="group flex items-center justify-between gap-4 p-5 rounded-[var(--radius)] border border-dashed border-[var(--fr-border-strong)] hover:border-[var(--fr-red)]/40 transition-colors"
          >
            <span className="min-w-0">
              <span className="block font-head text-lg font-black uppercase text-[var(--fr-text)]">GridUp e Driver Clash</span>
              <span className="block text-xs text-[var(--fr-text-muted)]">Le app di Formula Rossa, anche sul sito.</span>
            </span>
            <ArrowRight className="w-5 h-5 shrink-0 text-[var(--fr-red)] group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
