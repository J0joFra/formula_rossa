'use client';
/**
 * components/ferrari/GridUpPromo.jsx
 * Sezione "scopri l'app" — promuove GridUp, l'app companion di Formula Rossa.
 * GridUp: calcolatore del Mondiale F1 (punti per il titolo, scenari, classifiche).
 * Web app: https://gridup-f1.web.app · Android: com.gridup.app
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone, Trophy, Calculator, TrendingUp, Users,
  ArrowUpRight, Play, Sparkles, Flag,
} from 'lucide-react';

const GRIDUP_WEB_URL = 'https://gridup-f1.web.app';
const GRIDUP_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.gridup.app';
const GRIDUP_ICON_URL = 'https://gridup-f1.web.app/icons/icon-512.png';

const FEATURES = [
  { icon: Calculator, title: 'Calcolatore titolo', desc: 'I punti che servono per essere sicuri del Mondiale.' },
  { icon: TrendingUp, title: 'Scenari live',        desc: 'Chi può ancora vincere e con quale margine.' },
  { icon: Trophy,     title: 'Classifiche',         desc: 'Piloti e costruttori sempre aggiornati.' },
  { icon: Users,      title: 'Confronti',           desc: 'Metti a paragone i piloti gara dopo gara.' },
];

export default function GridUpPromo() {
  return (
    <section
      aria-labelledby="gridup-heading"
      className="relative py-16 md:py-24 px-4 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-tertiary)]/60 backdrop-blur-sm">
          {/* Glow di sfondo */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-[#E8002D]/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 w-96 h-96 rounded-full bg-[var(--ferrari-yellow)]/5 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(to right,#E8002D 1px,transparent 1px),linear-gradient(to bottom,#E8002D 1px,transparent 1px)',
                backgroundSize: '44px 44px',
              }}
            />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-6 items-center p-6 sm:p-10 lg:p-14">

            {/* ── Testo + CTA ── */}
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase font-bold text-[#E8002D] mb-5">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Companion App · GridUp
              </span>

              <h2
                id="gridup-heading"
                className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase mb-4"
              >
                Scarica <span className="text-[#E8002D]">GridUp</span>
              </h2>

              <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed max-w-md mb-6">
                Tutto sul Mondiale di Formula 1 in tasca: calcola i punti necessari
                per vincere il campionato, esplora gli scenari in tempo reale e
                consulta le classifiche di piloti e costruttori — sempre aggiornati.
              </p>

              {/* Features */}
              <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                {FEATURES.map((f) => (
                  <li
                    key={f.title}
                    className="flex items-start gap-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)]/40 p-3"
                  >
                    <span className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-[#E8002D]/10">
                      <f.icon className="w-4 h-4 text-[#E8002D]" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                        {f.title}
                      </span>
                      <span className="block text-[11px] text-[var(--text-tertiary)] leading-snug mt-0.5">
                        {f.desc}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={GRIDUP_WEB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 bg-[#E8002D] text-white px-7 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.14em] transition-all duration-200 hover:bg-[#c40026] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(232,0,45,0.4)]"
                >
                  <Smartphone className="w-4 h-4" aria-hidden="true" />
                  Apri l&apos;app
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </a>

                <a
                  href={GRIDUP_PLAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Scarica GridUp su Google Play"
                  className="inline-flex items-center justify-center gap-2.5 bg-transparent text-[var(--text-primary)] px-6 py-3.5 rounded-xl font-bold border-2 border-[var(--border-strong)] transition-all duration-200 hover:border-[#E8002D] hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span className="text-left leading-none">
                    <span className="block text-[8px] uppercase tracking-widest text-[var(--text-tertiary)]">Scarica su</span>
                    <span className="block text-sm font-black">Google Play</span>
                  </span>
                </a>
              </div>

              <p className="mt-4 text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                Gratis · Android &amp; Web · Nessuna registrazione richiesta
              </p>
            </div>

            {/* ── Mockup telefono ── */}
            <div className="relative flex justify-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: -3 }}
                whileInView={{ opacity: 1, y: 0, rotate: -3 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="relative w-[220px] sm:w-[260px] aspect-[9/19] rounded-[2.2rem] border-[6px] border-black bg-black shadow-2xl shadow-black/50"
              >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-20" aria-hidden="true" />
                {/* Schermo */}
                <div className="absolute inset-0 rounded-[1.7rem] overflow-hidden bg-gradient-to-b from-[#12000a] via-[#1a0410] to-black flex flex-col items-center pt-10 px-4">
                  {/* App icon */}
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden mb-4 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={GRIDUP_ICON_URL}
                      alt="Icona dell'app GridUp"
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.insertAdjacentHTML(
                          'beforeend',
                          '<span class="text-2xl font-black text-[#E8002D]">GU</span>'
                        );
                      }}
                    />
                  </div>
                  <p className="font-black text-white text-lg tracking-widest">GridUp</p>
                  <p className="text-[9px] text-white/50 uppercase tracking-[0.2em] mb-5">F1 Title Calculator</p>

                  {/* Fake standings rows */}
                  <div className="w-full space-y-2">
                    {[
                      { p: '1', n: 'Leader', pts: '—', lead: true },
                      { p: '2', n: 'Rivale', pts: '−18' },
                      { p: '3', n: 'Rivale', pts: '−44' },
                    ].map((r) => (
                      <div
                        key={r.p}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 border ${
                          r.lead
                            ? 'bg-[#E8002D]/15 border-[#E8002D]/40'
                            : 'bg-white/[0.03] border-white/10'
                        }`}
                      >
                        <span className="text-[10px] font-black text-white/70 w-4">{r.p}</span>
                        <Flag className="w-3 h-3 text-white/40" aria-hidden="true" />
                        <span className="text-[10px] font-bold text-white/80 flex-1 truncate">{r.n}</span>
                        <span className={`text-[10px] font-black ${r.lead ? 'text-[#E8002D]' : 'text-white/50'}`}>{r.pts}</span>
                      </div>
                    ))}
                  </div>

                  {/* Fake "points to secure title" chip */}
                  <div className="mt-5 w-full rounded-xl bg-white/[0.04] border border-white/10 p-3 text-center">
                    <p className="text-[8px] uppercase tracking-widest text-white/40">Punti per il titolo</p>
                    <p className="text-2xl font-black text-[#E8002D] leading-none mt-1">137</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
