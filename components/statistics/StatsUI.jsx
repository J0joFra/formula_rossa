'use client';
/**
 * components/statistics/StatsUI.jsx
 * Componenti di presentazione della pagina Statistiche: tooltip dei grafici,
 * sezioni a fisarmonica e riga della classifica vincitori.
 *
 * Estratti da pages/statistics.jsx per separare la presentazione dal recupero
 * dati: la pagina superava le 1.200 righe. Comportamento invariato.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User } from 'lucide-react';
import { driverPhoto, inquadratura } from '../../lib/driverPhoto';

const RED  = 'var(--fr-red)';
const GOLD = 'var(--fr-accent-amber)';

const MEDAL = [

  { color: RED,      label: '1ST' },
  { color: 'var(--fr-text-muted)', label: '2ND' },
  { color: 'var(--fr-accent-orange)', label: '3RD' },
];

export function DarkTooltip({ active, payload, label, accentColor, extra }) {
  if (!active || !payload?.length) return null;
  const color = accentColor || payload[0]?.color || RED;
  return (
    <div className="rounded-xl px-4 py-3 min-w-[160px]"
      style={{ background: '#0d0d0d', border: `1px solid ${color}40`, boxShadow: `0 16px 48px rgba(0,0,0,0.9), 0 0 20px ${color}15` }}>
      {label && <p className="text-[10px] uppercase tracking-widest text-[var(--fr-text-faint)] font-black mb-2">{label}</p>}
      {extra && <div className="mb-2">{extra}</div>}
      {payload.map((p, i) => (
        <p key={i} className="font-black text-xl" style={{ color }}>
          {typeof p.value === 'number' ? p.value.toLocaleString('it-IT') : p.value}
          {p.name && <span className="text-[var(--fr-text-faint)] text-[10px] ml-2 font-black uppercase">{p.name}</span>}
        </p>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ACCORDION SECTION
───────────────────────────────────────────────────────────────────────────── */
export function AccordionSection({ id, title, subtitle, icon: Icon, children, isOpen, onToggle, accent = 'red' }) {
  const color = accent === 'gold' ? GOLD : RED;
  return (
    <div 
      className={`rounded-2xl overflow-hidden transition-all duration-300 group ${
        !isOpen ? 'hover:border-red-600/30' : ''
      }`}
      style={{
        background: 'var(--fr-surface)',
        border: `1px solid ${isOpen ? color : 'var(--fr-border)'}`,
        boxShadow: isOpen ? `0 0 60px ${color}08` : 'none',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 md:px-8 py-5 md:py-6 text-left group"
        aria-expanded={isOpen}
        aria-controls={`section-${id}`}
      >
        <div className="flex items-center gap-4 md:gap-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
            style={{ background: color + '15', border: `1px solid ${color}30` }}>
            <Icon className="w-4 h-4" style={{ color }} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-black uppercase tracking-tight leading-none mb-0.5 transition-colors"
              style={{ color: isOpen ? 'var(--fr-text)' : 'var(--fr-text-muted)' }}>
              {title}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] transition-colors"
              style={{ color: isOpen ? color : 'var(--fr-text-faint)' }}>
              {subtitle}
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5" style={{ color: isOpen ? color : 'var(--fr-text-faint)' }} aria-hidden="true" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`section-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="px-4 md:px-8 pb-8 pt-3" style={{ borderTop: '1px solid var(--fr-border)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TROPHY SVG
───────────────────────────────────────────────────────────────────────────── */
export function TrophySVG({ size = 16, color = GOLD, opacity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color} style={{ opacity }} aria-hidden="true">
      <path d="M3 1h10v3a5 5 0 0 1-4 4.9V11h2v2H5v-2h2V8.9A5 5 0 0 1 3 4V1zm1 1v2a4 4 0 0 0 8 0V2H4zM1 2h2v2.5A5.02 5.02 0 0 1 1 3V2zm12 0h2v1a5.02 5.02 0 0 1-2 1.5V2z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   WINNER ROW
───────────────────────────────────────────────────────────────────────────── */
export function WinnerRow({ driver, index, max }) {
  const foto = driverPhoto(null, driver.name);
  const [rotta, setRotta] = useState(false);
  const pct    = max > 0 ? (driver.count / max) * 100 : 0;
  const isTop3 = index < 3;
  const accent = isTop3 ? MEDAL[index].color : 'var(--fr-text-faint)';
  const label  = isTop3 ? MEDAL[index].label : null;

  const multiplier   = Math.floor(driver.count / 10);
  const remainder    = driver.count % 10;
  const trophyColor  = isTop3 ? accent : GOLD;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.045 }}
      className="group relative flex items-start gap-4 md:gap-5 py-5 px-1 border-b border-[var(--fr-border)] last:border-0 hover:bg-[var(--fr-overlay)] transition-colors"
    >
      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: accent }} aria-hidden="true" />

      <div className="shrink-0 w-9 text-right select-none pt-1">
        {label
          ? <span className="text-[10px] font-black tracking-widest" style={{ color: accent }}>{label}</span>
          : <span className="text-xl font-black tabular-nums" style={{ color: 'var(--fr-text-faint)' }}>{index + 1}</span>
        }
      </div>

      {/* La sagoma sta sotto e si vede se la foto manca o non carica: prima
          l'`onError` la scopriva a mano toccando `nextSibling.style`, che è
          il DOM modificato alle spalle di React. */}
      <div className="relative shrink-0 w-11 h-11 md:w-13 md:h-13 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105 mt-0.5 bg-[var(--fr-surface-2)] grid place-items-center"
        style={{ border: `1.5px solid ${isTop3 ? accent : 'var(--fr-border)'}` }}>
        <User className="w-4 h-4 text-[var(--fr-text-faint)]" aria-hidden="true" />
        {foto && !rotta && (
          <img src={foto} alt="" loading="lazy" onError={() => setRotta(true)} style={inquadratura(foto)} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-2 flex-wrap">
          <span className="text-sm font-black uppercase tracking-tight truncate transition-colors group-hover:text-red-400"
            style={{ color: isTop3 ? accent : 'var(--fr-text)' }}>
            {driver.name}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2.5 flex-wrap" aria-label={`${driver.count} vittorie`}>
          {multiplier >= 1 ? (
            <>
              <div className="flex items-center gap-0.5">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.045 + i * 0.03 + 0.15 }}
                  >
                    <TrophySVG size={15} color={trophyColor} />
                  </motion.div>
                ))}
              </div>
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.045 + 0.45 }}
                className="text-xs font-black italic"
                style={{ color: trophyColor }}
              >
                ×{multiplier}
              </motion.span>
              {remainder > 0 && (
                <div className="flex items-center gap-0.5 opacity-50">
                  {[...Array(remainder)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 0.5, y: 0 }}
                      transition={{ delay: index * 0.045 + i * 0.03 + 0.5 }}
                    >
                      <TrophySVG size={12} color={trophyColor} />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-0.5">
              {[...Array(driver.count)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.045 + i * 0.04 + 0.15 }}
                >
                  <TrophySVG size={15} color={trophyColor} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="h-px w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, delay: index * 0.045 + 0.2, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(to right, ${accent}, ${accent}60)` }}
          />
        </div>
      </div>

      <div className="shrink-0 text-right min-w-[3rem] pt-0.5">
        <span className="text-2xl md:text-3xl font-black tabular-nums transition-colors"
          style={{ color: isTop3 ? accent : 'var(--fr-text)' }}>
          {driver.count}
        </span>
        <p className="text-[9px] text-[var(--fr-text-faint)] uppercase tracking-widest">vitt.</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */
