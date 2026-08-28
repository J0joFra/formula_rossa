'use client';
/**
 * components/livetiming/Controls.jsx
 * Controlli del Live Timing: menu a tendina, schede statistiche e selettore giri.
 * Estratti da pages/live-timing.jsx per separare i controlli dalla logica dati.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export function useOutsideClose(refs, setters) {
  useEffect(() => {
    const h = (e) => refs.forEach((r, i) => { if (r.current && !r.current.contains(e.target)) setters[i](false); });
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
}

// ─── Small UI pieces ──────────────────────────────────────────────────────────
export function Dropdown({ label, isOpen, onToggle, disabled, header, children, dropdownRef }) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={onToggle} disabled={disabled}
        className={`w-full bg-zinc-900 border rounded-xl p-4 text-left transition-all
          ${disabled ? 'border-zinc-800 opacity-40 cursor-not-allowed' : 'border-zinc-800 hover:border-red-800/60 cursor-pointer'}`}>
        {label && <div className="text-[10px] text-white/35 font-mono mb-1 tracking-[0.15em] uppercase">{label}</div>}
        <div className="pr-6">{header}</div>
        {!disabled && <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl z-50 max-h-72 overflow-y-auto shadow-2xl shadow-black/60">
          {children}
        </div>
      )}
    </div>
  );
}

export function StatCard({ label, value, icon, sub, accent }) {
  return (
    <div className={`bg-zinc-900 border rounded-xl p-4 ${accent ? 'border-red-900/40' : 'border-zinc-800'}`}>
      <div className="flex items-center gap-2 mb-2">{icon}
        <span className="text-[10px] text-white/35 font-mono tracking-[0.15em] uppercase">{label}</span>
      </div>
      <div className="text-2xl font-black text-white font-mono leading-none">{value}</div>
      {sub && <div className="text-xs text-white/35 mt-1 font-mono">{sub}</div>}
    </div>
  );
}

export function LapSelector({ laps, selectedLap, onSelect, fastestLapNumber, color, label }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const current = laps.find(l => l.lap_number === selectedLap)
    || laps.find(l => l.lap_number === fastestLapNumber)
    || laps[0];
  const idx = current ? laps.indexOf(current) : 0;
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => { const p = laps[idx - 1]; if (p) onSelect(p.lap_number); }} disabled={idx <= 0}
        className="p-1.5 rounded-lg bg-zinc-800 text-white/70 hover:text-white disabled:opacity-30 transition-colors">
        <ChevronLeft className="w-3 h-3" />
      </button>
      <div className="relative" ref={ref}>
        <button onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono hover:border-zinc-600 transition-colors">
          <span className="text-white/50">{label}</span>
          <span className="font-bold" style={{ color }}>L{current?.lap_number ?? '?'}</span>
          {current?.lap_number === fastestLapNumber && <span className="text-purple-400 text-[9px]">★</span>}
          <span className="text-white/50">{formatTime(current?.lap_duration)}</span>
          <ChevronDown className={`w-3 h-3 text-white/35 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl z-50 w-48 max-h-56 overflow-y-auto shadow-2xl">
            {laps.map(l => (
              <button key={l.lap_number} onClick={() => { onSelect(l.lap_number); setOpen(false); }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs font-mono hover:bg-zinc-800 transition-colors
                  ${l.lap_number === current?.lap_number ? 'bg-zinc-800/60' : ''}`}>
                <span className={l.lap_number === fastestLapNumber ? 'text-purple-400 font-bold' : 'text-white/80'}>
                  Lap {l.lap_number}{l.lap_number === fastestLapNumber ? ' ★' : ''}
                </span>
                <span className="text-white/50">{formatTime(l.lap_duration)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => { const n = laps[idx + 1]; if (n) onSelect(n.lap_number); }} disabled={idx >= laps.length - 1}
        className="p-1.5 rounded-lg bg-zinc-800 text-white/70 hover:text-white disabled:opacity-30 transition-colors">
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── TELEMETRY CHART — single lap only ──────────────────────────────────────
