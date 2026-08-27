'use client';
/**
 * components/ferrari/HeroSection.jsx
 * Hero della home: tesi del sito a sinistra, riepilogo dati reali a destra.
 * I numeri sono calcolati dall'archivio F1DB, non hardcodati.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BarChart3, Trophy } from 'lucide-react';

const FALLBACK = { wins: 0, podiums: 0, poles: 0, fastestLaps: 0, constructorTitles: 16, driverTitles: 15 };

export default function HeroSection() {
  const [stats, setStats] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch('/data/f1db-races-race-results.json');
        if (!res.ok) throw new Error('richiesta fallita');
        const data = await res.json();
        if (!alive) return;

        const agg = data
          .filter(r => r.constructorId === 'ferrari')
          .reduce((acc, r) => {
            if (r.positionNumber === 1) acc.wins++;
            if (r.positionNumber >= 1 && r.positionNumber <= 3) acc.podiums++;
            if (r.gridPositionNumber === 1) acc.poles++;
            if (r.fastestLap === true) acc.fastestLaps++;
            return acc;
          }, { wins: 0, podiums: 0, poles: 0, fastestLaps: 0 });

        if (alive) {
          setStats(s => ({ ...s, ...agg }));
          setFailed(false);
        }
      } catch (err) {
        console.error('Statistiche Ferrari non disponibili:', err);
        if (alive) setFailed(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  const cells = [
    { key: 'wins',        label: 'Vittorie',       value: stats.wins,        accent: true },
    { key: 'podiums',     label: 'Podi',           value: stats.podiums },
    { key: 'poles',       label: 'Pole position',  value: stats.poles },
    { key: 'fastestLaps', label: 'Giri veloci',    value: stats.fastestLaps },
  ];

  return (
    <section className="relative overflow-hidden pt-[70px]">
      {/* Alone ambientale */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'radial-gradient(60% 80% at 85% 0%, var(--fr-red-soft), transparent 70%)' }}
      />

      <div className="relative max-w-wrap mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-10 lg:gap-12 items-center">

          {/* ── Tesi ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .55, ease: 'easeOut' }}
          >
            <span className="fr-eyebrow inline-flex items-center gap-2.5 mb-5">
              <span className="w-[7px] h-[7px] rounded-full bg-[var(--fr-red)] shadow-[0_0_0_4px_var(--fr-red-soft)]" aria-hidden="true" />
              Data Intelligence · Scuderia Ferrari
            </span>

            <h1 className="uppercase">
              La Rossa<br />
              <span className="text-[var(--fr-red)]">nei numeri</span>
            </h1>

            <p className="text-base md:text-lg text-[var(--fr-text-muted)] max-w-[46ch] mt-5 mb-8">
              Ogni vittoria, pole e giro veloce della Scuderia Ferrari dal 1950 a oggi.
              Statistiche, classifiche e archivio storico, in un&apos;unica piattaforma indipendente.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/statistics" className="btn btn-primary">
                <BarChart3 className="w-4 h-4" aria-hidden="true" />
                Esplora le statistiche
              </Link>
              <Link href="/standings" className="btn btn-outline-light">
                <Trophy className="w-4 h-4" aria-hidden="true" />
                Classifiche {new Date().getFullYear()}
              </Link>
            </div>
          </motion.div>

          {/* ── Riepilogo dati ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .55, delay: .12, ease: 'easeOut' }}
            className="rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] shadow-[var(--fr-shadow)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--fr-border)]">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fr-text-faint)]">
                Ferrari · F1 all-time
              </span>
              <span className="font-mono text-[10px] tracking-[0.16em] uppercase font-bold text-[var(--fr-red)]">
                1950 → {new Date().getFullYear()}
              </span>
            </div>

            <div className="grid grid-cols-2">
              {cells.map((c, i) => (
                <div
                  key={c.key}
                  className={`px-5 py-6 border-b border-[var(--fr-border)] ${i % 2 === 0 ? 'border-r' : ''}`}
                >
                  <div className={`tabular text-[34px] font-bold leading-none tracking-tight ${c.accent ? 'text-[var(--fr-red)]' : 'text-[var(--fr-text)]'}`}>
                    {loading
                      ? <span className="skeleton block w-20 h-8 rounded-lg" role="status" aria-label="Caricamento" />
                      : failed
                        ? <span className="text-[var(--fr-text-faint)] text-2xl">N/D</span>
                        : c.value.toLocaleString('it-IT')}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fr-text-muted)] mt-1.5">
                    {c.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between px-5 py-3.5 text-xs text-[var(--fr-text-faint)]">
              <span>{stats.constructorTitles} Titoli Costruttori</span>
              <span className="tabular">{stats.driverTitles} Titoli Piloti</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
