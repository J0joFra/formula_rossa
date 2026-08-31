'use client';
/**
 * components/ui/GameShell.jsx
 * Cornice condivisa dei mini-giochi.
 *
 * I tre giochi ripetevano a mano lo stesso scheletro con valori diversi: sfondo
 * `bg-[#080808]` o `bg-black` scritti a mano (che ignorano il tema chiaro e non
 * corrispondono al fondo del resto del sito) e spaziatura superiore `pt-24`,
 * `pt-28` o `pt-32`, tutte sbagliate per una navbar da 70px. Il gioco in sé
 * resta libero di avere il suo aspetto: qui si uniforma solo quello che gli sta
 * intorno.
 */

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Coins } from 'lucide-react';
import PageShell from './PageShell';

export default function GameShell({ children, seo, title, tokens = null, className = '' }) {
  return (
    <PageShell seo={seo} className={className}>
      <div className="flex items-center justify-between gap-4 mb-8">
        <Link
          href="/fanzone"
          className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--fr-text-faint)] hover:text-[var(--fr-red)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
          Fan Zone
        </Link>

        {tokens !== null && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[9px] bg-[var(--fr-surface-2)]">
            <Coins className="w-3.5 h-3.5 text-[var(--fr-gold)]" aria-hidden="true" />
            <span className="tabular text-sm font-bold">{tokens.toLocaleString('it-IT')}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fr-text-faint)]">SFT</span>
          </span>
        )}
      </div>

      {/* I giochi cambiano schermata a ogni fase e il titolo visibile sparisce
          con essa: senza questo, durante la partita la pagina resterebbe senza
          intestazione. Il titolo grande resta quello disegnato dal gioco. */}
      {title && <h1 className="sr-only">{title}</h1>}

      {children}
    </PageShell>
  );
}
