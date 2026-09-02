'use client';
/**
 * components/ferrari/GridUpPromo.jsx
 * Sezione "scopri l'app" — promuove GridUp, l'app companion di Formula Rossa.
 * GridUp: calcolatore del Mondiale F1 (punti per il titolo, scenari, classifiche).
 *
 * I due bottoni si sono scambiati i ruoli: il principale era "Apri l'app" e
 * portava alla web app, quello di Google Play era il secondario. Ma chi arriva
 * qui vuole installare l'app, e la web app rimbalzava su un altro indirizzo
 * ancora — due passaggi per finire dove non si voleva. Ora il Play Store è il
 * bottone pieno e la web app resta come alternativa, che su desktop serve
 * ancora: lì un link allo store non installa niente.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone, Trophy, Calculator, TrendingUp, Users,
  ArrowUpRight, Play, Sparkles, Flag,
} from 'lucide-react';
import { useI18n } from '../../lib/i18n';

import { GRIDUP_PLAY_URL, GRIDUP_WEB_URL, GRIDUP_ICON_URL } from '../../lib/gridup';

/* Solo icona e chiavi: i testi erano scritti in italiano dentro l'array,
   quindi restavano in italiano anche col sito in un'altra lingua. */
const FEATURES = [
  { icon: Calculator, title: 'gu_f1t', desc: 'gu_f1d' },
  { icon: TrendingUp, title: 'gu_f2t', desc: 'gu_f2d' },
  { icon: Trophy,     title: 'gu_f3t', desc: 'gu_f3d' },
  { icon: Users,      title: 'gu_f4t', desc: 'gu_f4d' },
];

export default function GridUpPromo() {
  const { t } = useI18n();
  return (
    <section
      aria-labelledby="gridup-heading"
      className="snap-section relative py-12 md:py-16 px-4 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-tertiary)]/60 backdrop-blur-sm">
          {/* Glow di sfondo */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-[var(--fr-red)]/10 blur-3xl" />
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
              <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase font-bold text-[var(--fr-red)] mb-5">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                {t('gu_eyebrow')}
              </span>

              <h2
                id="gridup-heading"
                className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase mb-4"
              >
                {t('gu_titleA')} <span className="text-[var(--fr-red)]">{t('gu_titleB')}</span>
              </h2>

              <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed max-w-md mb-6">
                {t('gu_lead')}
              </p>

              {/* Features */}
              <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                {FEATURES.map((f) => (
                  <li
                    key={f.title}
                    className="flex items-start gap-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)]/40 p-3"
                  >
                    <span className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--fr-red)]/10">
                      <f.icon className="w-4 h-4 text-[var(--fr-red)]" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                        {t(f.title)}
                      </span>
                      <span className="block text-[11px] text-[var(--text-tertiary)] leading-snug mt-0.5">
                        {t(f.desc)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={GRIDUP_PLAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('gu_playAria')}
                  className="group inline-flex items-center justify-center gap-2.5 bg-[var(--fr-red)] text-white px-6 py-3.5 rounded-xl transition-all duration-200 hover:bg-[var(--fr-red-ink)] hover:-translate-y-0.5 hover:shadow-[var(--fr-glow-red)]"
                >
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span className="text-left leading-none">
                    <span className="block text-[8px] uppercase tracking-widest opacity-80">{t('gu_getOn')}</span>
                    <span className="block text-sm font-black">Google Play</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </a>

                <a
                  href={GRIDUP_WEB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm border-2 border-[var(--fr-border-strong)] text-[var(--fr-text)] transition-all duration-200 hover:border-[var(--fr-red)] hover:-translate-y-0.5"
                >
                  <Smartphone className="w-4 h-4" aria-hidden="true" />
                  {t('gu_openWeb')}
                </a>
              </div>

              <p className="mt-4 text-[10px] text-[var(--fr-text-faint)] uppercase tracking-wider">
                {t('gu_terms')}
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
                      alt={t('gu_iconAlt')}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.insertAdjacentHTML(
                          'beforeend',
                          '<span class="text-2xl font-black text-[var(--fr-red)]">GU</span>'
                        );
                      }}
                    />
                  </div>
                  <p className="font-black text-fixed-white text-lg tracking-widest">GridUp</p>
                  <p className="text-[9px] text-white/50 uppercase tracking-[0.2em] mb-5">{t('gu_subtitle')}</p>

                  {/* Fake standings rows */}
                  <div className="w-full space-y-2">
                    {[
                      { p: '1', n: t('gu_leader'), pts: '—', lead: true },
                      { p: '2', n: t('gu_rival'), pts: '−18' },
                      { p: '3', n: t('gu_rival'), pts: '−44' },
                    ].map((r) => (
                      <div
                        key={r.p}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 border ${
                          r.lead
                            ? 'bg-[var(--fr-red)]/15 border-[var(--fr-red)]/40'
                            : 'bg-white/[0.03] border-white/10'
                        }`}
                      >
                        <span className="text-[10px] font-black text-white/70 w-4">{r.p}</span>
                        <Flag className="w-3 h-3 text-white/40" aria-hidden="true" />
                        <span className="text-[10px] font-bold text-white/80 flex-1 truncate">{r.n}</span>
                        <span className={`text-[10px] font-black ${r.lead ? 'text-[var(--fr-red)]' : 'text-white/50'}`}>{r.pts}</span>
                      </div>
                    ))}
                  </div>

                  {/* Fake "points to secure title" chip */}
                  <div className="mt-5 w-full rounded-xl bg-white/[0.04] border border-white/10 p-3 text-center">
                    <p className="text-[8px] uppercase tracking-widest text-white/40">{t('gu_toTitle')}</p>
                    <p className="text-2xl font-black text-[var(--fr-red)] leading-none mt-1">137</p>
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
