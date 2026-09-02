'use client';
/**
 * components/ferrari/HeroSection.jsx
 * Hero della home: tesi del sito a sinistra, riepilogo dati reali a destra.
 *
 * I quattro numeri arrivano dalla riga `constructor` della Ferrari. Prima si
 * ricavavano contando a mano dentro /data/f1db-races-race-results.json: un
 * file da 19 MB scaricato dal browser a ogni apertura della home, per
 * calcolare quattro totali. Su rete mobile era il costo più alto del sito.
 *
 * I totali dell'archivio sono anche più corretti di quelli che venivano
 * contati: le pole si ricavavano da `gridPositionNumber === 1`, che è la prima
 * casella in griglia, non la pole position — chi conquista la pole e prende
 * una penalità parte più indietro, e il conteggio cambia.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BarChart3, Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

/* Finché la riga non arriva si mostra lo scheletro, quindi i valori iniziali
   non compaiono mai: servono solo a dare forma all'oggetto. */
const VUOTO = { wins: 0, podiums: 0, poles: 0, fastestLaps: 0, constructorTitles: 0 };

/* I titoli piloti vinti al volante di una Ferrari non stanno nella riga della
   scuderia: è un dato del pilota, non del costruttore. Resta una costante,
   aggiornabile a fine stagione. */
const TITOLI_PILOTI = 15;

export default function HeroSection() {
  const [stats, setStats] = useState(VUOTO);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!supabase) { setLoading(false); setFailed(true); return; }
      try {
        const { data, error } = await supabase
          .from('constructor')
          .select('total_race_wins, total_podiums, total_pole_positions, total_fastest_laps, total_championship_wins')
          .eq('id', 'ferrari')
          .maybeSingle();
        if (error) throw new Error(error.message);
        if (!alive) return;
        if (!data) throw new Error('riga Ferrari non trovata');

        setStats({
          wins:              data.total_race_wins ?? 0,
          podiums:           data.total_podiums ?? 0,
          poles:             data.total_pole_positions ?? 0,
          fastestLaps:       data.total_fastest_laps ?? 0,
          constructorTitles: data.total_championship_wins ?? 0,
        });
        setFailed(false);
      } catch (err) {
        console.error('Statistiche Ferrari non disponibili:', err);
        if (alive) setFailed(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  const anno = new Date().getFullYear();

  const cells = [
    { key: 'wins',        label: 'Vittorie',        value: stats.wins, accent: true },
    { key: 'podiums',     label: 'Podi',     value: stats.podiums },
    { key: 'poles',       label: 'Pole position',       value: stats.poles },
    { key: 'fastestLaps', label: 'Giri veloci', value: stats.fastestLaps },
  ];

  return (
    <section className="snap-section relative overflow-hidden pt-[70px]">
      {/* Alone ambientale */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'radial-gradient(60% 80% at 85% 0%, var(--fr-red-soft), transparent 70%)' }}
      />

      <div className="relative max-w-wrap mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
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
              Ogni vittoria, pole e giro veloce della Scuderia Ferrari dal 1950 a oggi. Statistiche, classifiche e archivio storico, in un’unica piattaforma indipendente.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/statistics" className="btn btn-primary">
                <BarChart3 className="w-4 h-4" aria-hidden="true" />
                Esplora le statistiche
              </Link>
              <Link href="/standings" className="btn btn-outline-light">
                <Trophy className="w-4 h-4" aria-hidden="true" />
                Classifiche {anno}
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
                1950 → {anno}
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
                      ? <span className="skeleton block w-20 h-8 rounded-lg" role="status" aria-label="Caricamento dati…" />
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
              <span className="tabular">{TITOLI_PILOTI} Titoli Piloti</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
