import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import {
  Activity, Zap, Gauge, ChevronDown, Search, RefreshCw,
  Radio, Cpu, Thermometer, Wind, ChevronLeft, ChevronRight, Play, Pause,
  TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import {
  getDrivers, getDriverNumber, getTelemetry, getCircuitMap, getFullSessionTelemetry,
  getWeather, getMeetings, getSessionsForMeeting, getLatestSession,
  getAllDriversSectors, getRacePositions, getAllLaps, openf1Fetch,
} from '../lib/openf1';

// ─── Constants ────────────────────────────────────────────────────────────────

var SESSION_TYPES = [
  { id: 'R',   name: 'Race'},
  { id: 'S',   name: 'Sprint'}
];
var AVAILABLE_YEARS = [2026, 2025, 2024, 2023];

const CIRCUIT_COUNTRY = {
  'monza': 'it', 'autodromo_nazionale_di_monza': 'it', 'milan': 'it', 'imola': 'it', 'enzo_e_dino_ferrari': 'it',
  'mugello': 'it', 'bologna': 'it', 'pescara': 'it', 'silverstone': 'gb', 'silverstone_circuit': 'gb',
  'northamptonshire': 'gb', 'brands_hatch': 'gb', 'kent': 'gb', 'donington': 'gb', 'aintree': 'gb',
  'liverpool': 'gb', 'spa': 'be', 'spa_francorchamps': 'be', 'stavelot': 'be', 'zolder': 'be',
  'heusden_zolder': 'be', 'nivelles': 'be', 'brussels': 'be', 'zandvoort': 'nl', 'circuit_zandvoort': 'nl',
  'catalunya': 'es', 'barcelona': 'es', 'montmelo': 'es', 'jerez': 'es', 'valencia': 'es',
  'valencia_street_circuit': 'es', 'pedralbes': 'es', 'montjuic': 'es', 'madrid': 'es', 'madring': 'es', 'jarama': 'es',
  'hungaroring': 'hu', 'budapest': 'hu', 'mogyorod': 'hu', 'red_bull_ring': 'at', 'spielberg': 'at',
  'zeltweg': 'at', 'oesterreichring': 'at', 'styria': 'at', 'magny_cours': 'fr', 'nevers': 'fr',
  'paul_ricard': 'fr', 'le_castellet': 'fr', 'ricard': 'fr', 'reims': 'fr', 'dijon': 'fr',
  'dijon_prenois': 'fr', 'rouen': 'fr', 'essarts': 'fr', 'charade': 'fr', 'clermont_ferrand': 'fr',
  'lemans': 'fr', 'nurburgring': 'de', 'nurburg': 'de', 'hockenheimring': 'de', 'hockenheim': 'de',
  'avus': 'de', 'berlin': 'de', 'estoril': 'pt', 'cascais': 'pt', 'portimao': 'pt',
  'algarve': 'pt', 'boavista': 'pt', 'oporto': 'pt', 'monsanto': 'pt', 'lisbon': 'pt',
  'bremgarten': 'ch', 'bern': 'ch', 'anderstorp': 'se', 'scandinavian_raceway': 'se', 'monaco': 'mc',
  'monte_carlo': 'mc', 'circuit_de_monaco': 'mc', 'bakú': 'az', 'baku': 'az', 'azerbaijan': 'az',
  'americas': 'us', 'cota': 'us', 'austin': 'us', 'circuit_of_the_americas': 'us', 'miami': 'us',
  'miami_international_autodrome': 'us', 'vegas': 'us', 'las_vegas': 'us', 'las_vegas_strip': 'us', 'caesars_palace': 'us',
  'indianapolis': 'us', 'indianapolis_motor_speedway': 'us', 'watkins_glen': 'us', 'long_beach': 'us', 'phoenix': 'us',
  'detroit': 'us', 'dallas': 'us', 'sebring': 'us', 'riverside': 'us', 'villeneuve': 'ca',
  'montreal': 'ca', 'circuit_gilles_villeneuve': 'ca', 'mosport': 'ca', 'bowmanville': 'ca', 'tremblant': 'ca',
  'st_jovite': 'ca', 'interlagos': 'br', 'sao_paulo': 'br', 'são_paulo': 'br', 'jose_carlos_pace': 'br',
  'jacarepagua': 'br', 'rio_de_janeiro': 'br', 'rodriguez': 'mx', 'hermanos_rodriguez': 'mx', 'mexico_city': 'mx',
  'galvez': 'ar', 'buenos_aires': 'ar', 'oscar_galvez': 'ar',
  'juan_y_oscar_galvez': 'ar', 'juan_y_ignacio_cobos': 'ar', 'carlos_pace': 'br', 'juan_y_ignacio_cobos': 'ar',
  'suzuka': 'jp', 'suzuka_circuit': 'jp', 'mie': 'jp', 'fuji': 'jp', 'fuji_speedway': 'jp',
  'oyama': 'jp', 'okayama': 'jp', 'ti_circuit': 'jp', 'shanghai': 'cn', 'shanghai_international_circuit': 'cn',
  'marina_bay': 'sg', 'singapore': 'sg', 'sepang': 'my', 'kuala_lumpur': 'my', 'yeongam': 'kr',
  'korea_international_circuit': 'kr', 'buddh': 'in', 'greater_noida': 'in', 'bahrain': 'bh', 'sakhir': 'bh',
  'manama': 'bh', 'bahrain_international_circuit': 'bh', 'losail': 'qa', 'lusail': 'qa', 'lusail_international_circuit': 'qa',
  'jeddah': 'sa', 'jeddah_corniche_circuit': 'sa', 'yas_marina': 'ae', 'abu_dhabi': 'ae', 'yas_marina_circuit': 'ae',
  'istanbul': 'tr', 'istanbul_park': 'tr', 'sochi': 'ru', 'sochi_autodrom': 'ru', 'kyalami': 'za',
  'midrand': 'za', 'george': 'za', 'prince_george': 'za', 'adelaide': 'au', 'albert_park': 'au',
  'melbourne': 'au', 'ain_diab': 'ma', 'casablanca': 'ma',
  'albert_park': 'au', 'marina_bay': 'sg', 'yas_marina': 'ae', 'paul_ricard': 'fr', 'watkins_glen': 'us',
  'long_beach': 'us', 'las_vegas': 'us', 'jose_carlos_pace': 'br', 'hermanos_rodriguez': 'mx', 'mexico_city': 'mx',
  'red_bull_ring': 'at', 'silverstone_circuit': 'gb', 'spa_francorchamps': 'be', 'circuit_de_monaco': 'mc', 'fuji_speedway': 'jp'
};
var getFlagCode = (loc = '') => {
  const l = loc.toLowerCase();
  for (const [k, v] of Object.entries(CIRCUIT_COUNTRY)) if (l.includes(k)) return v;
  return '';
};
var formatTime = (s) => {
  if (!s) return '—';
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(3).padStart(6, '0')}`;
};
var formatDelta = (d) => d == null ? '—' : (d > 0 ? '+' : '') + d.toFixed(3) + 's';
var FALLBACK_COLORS = ['#ef4444','#3b82f6','#f59e0b','#22c55e','#a855f7',
  '#ec4899','#06b6d4','#f97316','#84cc16','#14b8a6'];

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useOutsideClose(refs, setters) {
  useEffect(() => {
    const h = (e) => refs.forEach((r, i) => { if (r.current && !r.current.contains(e.target)) setters[i](false); });
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
}

// ─── Small UI pieces ──────────────────────────────────────────────────────────
function Dropdown({ label, isOpen, onToggle, disabled, header, children, dropdownRef }) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={onToggle} disabled={disabled}
        className={`w-full bg-zinc-900 border rounded-xl p-4 text-left transition-all
          ${disabled ? 'border-zinc-800 opacity-40 cursor-not-allowed' : 'border-zinc-800 hover:border-red-800/60 cursor-pointer'}`}>
        {label && <div className="text-[10px] text-zinc-600 font-mono mb-1 tracking-[0.15em] uppercase">{label}</div>}
        <div className="pr-6">{header}</div>
        {!disabled && <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl z-50 max-h-72 overflow-y-auto shadow-2xl shadow-black/60">
          {children}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, sub, accent }) {
  return (
    <div className={`bg-zinc-900 border rounded-xl p-4 ${accent ? 'border-red-900/40' : 'border-zinc-800'}`}>
      <div className="flex items-center gap-2 mb-2">{icon}
        <span className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase">{label}</span>
      </div>
      <div className="text-2xl font-black text-white font-mono leading-none">{value}</div>
      {sub && <div className="text-xs text-zinc-600 mt-1 font-mono">{sub}</div>}
    </div>
  );
}

function LapSelector({ laps, selectedLap, onSelect, fastestLapNumber, color, label }) {
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
        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors">
        <ChevronLeft className="w-3 h-3" />
      </button>
      <div className="relative" ref={ref}>
        <button onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono hover:border-zinc-600 transition-colors">
          <span className="text-zinc-500">{label}</span>
          <span className="font-bold" style={{ color }}>L{current?.lap_number ?? '?'}</span>
          {current?.lap_number === fastestLapNumber && <span className="text-purple-400 text-[9px]">★</span>}
          <span className="text-zinc-500">{formatTime(current?.lap_duration)}</span>
          <ChevronDown className={`w-3 h-3 text-zinc-600 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl z-50 w-48 max-h-56 overflow-y-auto shadow-2xl">
            {laps.map(l => (
              <button key={l.lap_number} onClick={() => { onSelect(l.lap_number); setOpen(false); }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs font-mono hover:bg-zinc-800 transition-colors
                  ${l.lap_number === current?.lap_number ? 'bg-zinc-800/60' : ''}`}>
                <span className={l.lap_number === fastestLapNumber ? 'text-purple-400 font-bold' : 'text-zinc-300'}>
                  Lap {l.lap_number}{l.lap_number === fastestLapNumber ? ' ★' : ''}
                </span>
                <span className="text-zinc-500">{formatTime(l.lap_duration)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => { const n = laps[idx + 1]; if (n) onSelect(n.lap_number); }} disabled={idx >= laps.length - 1}
        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors">
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── TELEMETRY CHART — single lap only ──────────────────────────────────────
function TelemetryChart({ data, code, color, tab }) {
  const cs = { backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 11, borderRadius: '8px' };
  const kmFmt = v => `${(v / 1000).toFixed(1)}km`;

  // Downsample per performance
  const chartData = useMemo(() => {
    if (!data.length) return [];
    return data.filter((_, i) => i % 3 === 0);
  }, [data]);

  if (tab === 'inputs') {
    return (
      <div className="space-y-2">
        {[
          ['Throttle %', 'throttle', '#22c55e', 80],
          ['Brake %',    'brake',    '#ef4444', 60],
        ].map(([name, key, c, h]) => (
          <div key={name}>
            <div className="text-[9px] text-zinc-600 font-mono mb-0.5 uppercase tracking-widest">{name}</div>
            <ResponsiveContainer width="100%" height={h}>
              <AreaChart data={chartData} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="distance" stroke="#3f3f46" tick={{ fontSize: 9 }} tickFormatter={kmFmt} />
                <YAxis stroke="#3f3f46" tick={{ fontSize: 9 }} domain={[0, 100]} width={28} />
                <Tooltip contentStyle={cs} formatter={(v) => [`${v}%`, '']} />
                <Area type="monotone" dataKey={key} name={code} stroke={c} fill={`${c}25`} strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'gear') {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="distance" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={kmFmt} />
          <YAxis stroke="#52525b" tick={{ fontSize: 10 }} domain={[1, 8]} />
          <Tooltip contentStyle={cs} />
          <Bar dataKey="gear" name={code} fill={color} maxBarSize={3} opacity={0.9} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  const unit = tab === 'speed' ? ' km/h' : '';
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="distance" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={kmFmt} />
        <YAxis stroke="#52525b" tick={{ fontSize: 10 }} unit={unit} width={46} />
        <Tooltip contentStyle={cs}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs font-mono">
                <div className="text-zinc-600 mb-1">{kmFmt(label)}</div>
                {payload.map(p => p.value != null && (
                  <div key={p.name} style={{ color: p.stroke }}>{p.name}: {p.value}{unit}</div>
                ))}
              </div>
            );
          }}
        />
        <Area type="monotone" dataKey={tab} name={code} stroke={color} fill={`${color}20`} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── SECTOR TABLE — TUTTI I PILOTI ─────────────────────────────────────────────
function SectorTable({ sectorsData, highlightCode }) {
  const [lapFilter, setLapFilter] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  const filterRef = useRef(null);
  useEffect(() => {
    const h = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setOpenFilter(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const allLapNumbers = useMemo(() => {
    if (!sectorsData?.length) return [];
    const union = new Set(sectorsData.flatMap(d => (d.all_laps || []).map(l => l.lap_number)));
    return [...union].sort((a, b) => a - b);
  }, [sectorsData]);

  const tableData = useMemo(() => {
    if (!sectorsData?.length) return [];
    return sectorsData.map(d => {
      const lap = lapFilter != null ? (d.all_laps || []).find(l => l.lap_number === lapFilter) : null;
      const best = lap ?? { lap_number: d.best_lap_number, lap_duration: d.lap_time, s1: d.s1, s2: d.s2, s3: d.s3 };
      return { code: d.code, team: d.team, color: d.color, isBest: !lap, ...best };
    }).filter(d => d.lap_duration != null).sort((a, b) => a.lap_duration - b.lap_duration);
  }, [sectorsData, lapFilter]);

  if (!sectorsData?.length) return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 p-10 flex items-center justify-center h-40"
         style={{ background: 'linear-gradient(135deg,#0c0c0c,#111)' }}>
      <span className="text-zinc-600 font-mono text-sm tracking-widest uppercase">Loading sector data…</span>
    </div>
  );

  const leader = tableData[0];
  const bS1 = Math.min(...tableData.map(d => d.s1 ?? Infinity));
  const bS2 = Math.min(...tableData.map(d => d.s2 ?? Infinity));
  const bS3 = Math.min(...tableData.map(d => d.s3 ?? Infinity));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8"
         style={{ background: 'linear-gradient(135deg,#0c0c0c 0%,#111 50%,#0a0a0a 100%)' }}>

      {/* Ambient glow */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,#fff 1px,transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 p-5 md:p-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] text-indigo-500 font-mono tracking-[0.3em] uppercase">Sector Analysis</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight uppercase">
              Sector <span className="text-indigo-500">Times</span>
            </h3>
          </div>

          <div className="flex items-center gap-2" ref={filterRef}>
            <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">Lap</span>
            <div className="relative">
              <button onClick={() => setOpenFilter(v => !v)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-mono border transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <span className={lapFilter == null ? 'text-purple-400 font-bold' : 'text-white'}>
                  {lapFilter == null ? '★ Best' : `Lap ${lapFilter}`}
                </span>
                <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${openFilter ? 'rotate-180' : ''}`} />
              </button>
              {openFilter && (
                <div className="absolute top-full right-0 mt-1 rounded-xl z-50 w-40 max-h-52 overflow-y-auto shadow-2xl"
                     style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <button onClick={() => { setLapFilter(null); setOpenFilter(false); }}
                    className={`w-full px-3 py-2 text-left text-xs font-mono hover:bg-white/5 transition-colors ${lapFilter == null ? 'text-purple-400 font-bold' : 'text-zinc-400'}`}>
                    ★ Best lap each
                  </button>
                  {allLapNumbers.map(n => (
                    <button key={n} onClick={() => { setLapFilter(n); setOpenFilter(false); }}
                      className={`w-full px-3 py-2 text-left text-xs font-mono hover:bg-white/5 transition-colors ${lapFilter === n ? 'bg-white/8 text-white' : 'text-zinc-400'}`}>
                      Lap {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Best sector indicators */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: 'Sector 1', best: bS1, key: 's1', color: '#a855f7' },
            { label: 'Sector 2', best: bS2, key: 's2', color: '#6366f1' },
            { label: 'Sector 3', best: bS3, key: 's3', color: '#8b5cf6' },
          ].map(({ label, best, key, color }) => {
            const bestDriver = tableData.find(d => d[key] === best);
            return (
              <div key={key} className="rounded-xl px-3 py-2.5"
                   style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
                <div className="text-[9px] font-mono tracking-widest uppercase mb-0.5" style={{ color: `${color}99` }}>{label}</div>
                <div className="text-base font-black font-mono" style={{ color }}>{best !== Infinity ? `${best.toFixed(3)}s` : '—'}</div>
                {bestDriver && <div className="text-[9px] text-zinc-600 font-mono mt-0.5">{bestDriver.code}</div>}
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { h: 'P',      align: 'left'  },
                  { h: 'Driver', align: 'left'  },
                  { h: 'Lap',    align: 'right' },
                  { h: 'Time',   align: 'right' },
                  { h: 'Gap',    align: 'right' },
                  { h: 'S1',     align: 'right' },
                  { h: 'S2',     align: 'right' },
                  { h: 'S3',     align: 'right' },
                  { h: 'ΔS1',    align: 'right' },
                  { h: 'ΔS2',    align: 'right' },
                  { h: 'ΔS3',    align: 'right' },
                ].map(({ h, align }) => (
                  <th key={h} className={`py-2.5 px-2 whitespace-nowrap text-[10px] tracking-[0.15em] font-normal text-zinc-600 uppercase ${align === 'left' ? 'text-left' : 'text-right'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((d, i) => {
                const gap   = d.lap_duration - leader.lap_duration;
                const dS1   = (d.s1 ?? 0) - (leader?.s1 ?? 0);
                const dS2   = (d.s2 ?? 0) - (leader?.s2 ?? 0);
                const dS3   = (d.s3 ?? 0) - (leader?.s3 ?? 0);
                const isHL  = d.code === highlightCode;
                const isLdr = i === 0;
                return (
                  <tr key={d.code}
                    className="transition-colors"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: isHL
                        ? `${d.color}12`
                        : isLdr
                          ? 'rgba(255,255,255,0.03)'
                          : 'transparent',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = isHL ? `${d.color}20` : 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = isHL ? `${d.color}12` : isLdr ? 'rgba(255,255,255,0.03)' : 'transparent'}>

                    {/* Pos */}
                    <td className="py-2 px-2">
                      <span className="text-zinc-600 font-mono text-[10px]">{i + 1}</span>
                    </td>

                    {/* Driver */}
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-0.5 h-4 rounded-full" style={{ background: d.color }} />
                        <span className="font-black text-[13px]" style={{ color: isHL ? '#fff' : d.color }}>
                          {d.code}
                        </span>
                        {isHL && <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: `${d.color}30`, color: d.color }}>YOU</span>}
                      </div>
                    </td>

                    {/* Lap */}
                    <td className="py-2 px-2 text-right">
                      <span className={`text-[11px] ${d.isBest ? 'text-purple-400 font-bold' : 'text-zinc-500'}`}>
                        {d.isBest ? '★' : ''}{d.lap_number}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-2 px-2 text-right">
                      <span className={`font-black text-[12px] ${isLdr ? 'text-yellow-400' : 'text-white'}`}>
                        {formatTime(d.lap_duration)}
                      </span>
                    </td>

                    {/* Gap */}
                    <td className="py-2 px-2 text-right">
                      <span className={`text-[11px] font-mono ${gap === 0 ? 'text-yellow-400 font-bold' : 'text-red-400'}`}>
                        {gap === 0 ? 'LDR' : `+${gap.toFixed(3)}`}
                      </span>
                    </td>

                    {/* S1, S2, S3 */}
                    {[['s1', bS1, '#a855f7'], ['s2', bS2, '#6366f1'], ['s3', bS3, '#8b5cf6']].map(([k, best, sc]) => (
                      <td key={k} className="py-2 px-2 text-right">
                        <span className={`text-[11px] font-bold ${d[k] === best ? '' : 'text-zinc-300'}`}
                          style={d[k] === best ? { color: sc } : {}}>
                          {d[k]?.toFixed(3) ?? '—'}
                        </span>
                      </td>
                    ))}

                    {/* ΔS1, ΔS2, ΔS3 */}
                    {[dS1, dS2, dS3].map((delta, di) => (
                      <td key={di} className="py-2 px-2 text-right">
                        <span className={`text-[10px] font-mono ${delta === 0 ? 'text-zinc-600' : delta < 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {delta === 0 ? 'REF' : formatDelta(delta)}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── RACE POSITIONS ───────────────────────────────────────────────────────────
function RacePositionsChart({ positionsData, highlightCodes }) {
  if (!positionsData?.byLap?.length) return null;
  const { byLap, driverCodes, drivers } = positionsData;
  const colorMap = {};
  driverCodes.forEach((code, i) => {
    const info = drivers.find(d => d.name_acronym === code);
    colorMap[code] = info?.team_colour ? `#${info.team_colour}` : FALLBACK_COLORS[i % FALLBACK_COLORS.length];
  });
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase mb-4">Race Positions</div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={byLap}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="lap" stroke="#52525b" tick={{ fontSize: 10 }} />
          <YAxis reversed domain={[1, 20]} stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={v => `P${v}`} />
          <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 11 }} formatter={(v, n) => [`P${v}`, n]} />
          {driverCodes.map(code => (
            <Line key={code} type="monotone" dataKey={code} stroke={colorMap[code]}
              strokeWidth={highlightCodes.includes(code) ? 2.5 : 1} dot={false} connectNulls
              opacity={!highlightCodes.length || highlightCodes.includes(code) ? 1 : 0.1} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── QUALIFYING→RACE SLOPE CHART ────────────────────────────────────────────
const TEAM_COLORS = {
  'ferrari':'#F91536','mercedes':'#6CD3BF','red-bull':'#3671C6','mclaren':'#F58020',
  'aston-martin':'#2D826D','alpine':'#2090D0','williams':'#64C4FF','rb':'#6692FF',
  'haas':'#B6BABD','kick-sauber':'#52E252','sauber':'#006F62','bmw-sauber':'#1B3C8C',
  'alfa-romeo':'#9B0000','renault':'#FFD800','lotus':'#005A2C','brawn':'#B7E000',
  'toyota':'#CC0000','toro-rosso':'#1E5BC6','force-india':'#FF5F00','jordan':'#FFD800',
  'arrows':'#FF6600','minardi':'#1a1a1a','hrt':'#B30000','caterham':'#005030',
  'marussia':'#9B0000','manor':'#003A8F','super-aguri':'#CCCCCC','spyker':'#FF6600',
  'default':'#888888',
};

function getGainColor(gain) {
  if (gain > 0) return '#22c55e';
  if (gain < 0) return '#ef4444';
  return '#71717a';
}

// ── Grid→Race inner chart ──
function GridToRaceChart({ raceResults, year, grandPrix }) {
  const [highlight, setHighlight] = React.useState(null);
  const [filter, setFilter]       = React.useState('all');

  const drivers = React.useMemo(() => {
    if (!raceResults?.length) return [];
    return raceResults
      .filter(r => r.gridPositionNumber && r.positionNumber)
      .map(r => {
        const gain = (r.gridPositionNumber || 0) - (r.positionNumber || 0);
        const parts = (r.driverId || '').split('-');
        const code  = parts[parts.length - 1].toUpperCase().substring(0, 3);
        return {
          id: r.driverId, code,
          constructorId: r.constructorId || 'default',
          color: TEAM_COLORS[r.constructorId] || TEAM_COLORS.default,
          gridPos: r.gridPositionNumber,
          racePos: r.positionNumber,
          gain,
          gainCategory: gain > 0 ? 'gained' : gain < 0 ? 'lost' : 'same',
          points: r.points || 0,
        };
      });
  }, [raceResults]);

  const filtered = React.useMemo(() =>
    filter === 'all' ? drivers : drivers.filter(d => d.gainCategory === filter),
    [drivers, filter]
  );
  const byGrid = React.useMemo(() => [...filtered].sort((a,b) => a.gridPos - b.gridPos), [filtered]);
  const byRace = React.useMemo(() => [...filtered].sort((a,b) => a.racePos - b.racePos), [filtered]);
  const stats  = React.useMemo(() => {
    if (!drivers.length) return {};
    return {
      gained: drivers.filter(d => d.gain > 0).length,
      lost:   drivers.filter(d => d.gain < 0).length,
      same:   drivers.filter(d => d.gain === 0).length,
      maxD:   drivers.reduce((a,b) => b.gain > a.gain ? b : a),
      minD:   drivers.reduce((a,b) => b.gain < a.gain ? b : a),
    };
  }, [drivers]);

  if (!drivers.length) return (
    <div className="flex items-center justify-center h-32 text-zinc-600 font-mono text-sm tracking-widest uppercase">
      No race results available
    </div>
  );

  const ROW_H = 32, SVG_W = 960;
  const SVG_H = Math.max(byGrid.length, byRace.length) * ROW_H + 72;
  const LX = 230, RX = 730;
  const gridY = {}, raceY = {};
  byGrid.forEach((d,i) => { gridY[d.id] = 54 + i * ROW_H; });
  byRace.forEach((d,i) => { raceY[d.id] = 54 + i * ROW_H; });

  const FILTERS = [
    {key:'all',    label:`ALL · ${drivers.length}`,    ac:'bg-white/10 text-white border-white/25'},
    {key:'gained', label:`▲ GAINED · ${stats.gained}`, ac:'bg-green-500/15 text-green-400 border-green-500/40'},
    {key:'lost',   label:`▼ LOST · ${stats.lost}`,     ac:'bg-red-500/15 text-red-400 border-red-500/40'},
    {key:'same',   label:`● SAME · ${stats.same}`,     ac:'bg-zinc-700/60 text-zinc-300 border-zinc-600/40'},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({key,label,ac}) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3.5 py-2 rounded-xl text-[11px] font-mono tracking-widest border transition-all duration-200 ${
              filter === key ? ac : 'bg-white/5 text-zinc-600 border-white/8 hover:text-zinc-300 hover:bg-white/8'
            }`}>{label}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label:'GAINED',     value:`+${stats.gained}`, color:'#22c55e', bg:'rgba(34,197,94,0.08)',  border:'rgba(34,197,94,0.2)'},
          {label:'LOST',       value:stats.lost,          color:'#ef4444', bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.2)'},
          {label:'BEST GAIN',  value: stats.maxD?.code ? `${stats.maxD.code}  +${stats.maxD.gain}` : '—',
            color: stats.maxD?.color || '#22c55e', bg:'rgba(255,255,255,0.03)', border:'rgba(255,255,255,0.08)'},
          {label:'WORST DROP', value: stats.minD?.code ? `${stats.minD.code}  ${stats.minD.gain}` : '—',
            color:'#ef4444', bg:'rgba(255,255,255,0.03)', border:'rgba(255,255,255,0.08)'},
        ].map(({label,value,color,bg,border}) => (
          <div key={label} className="rounded-xl px-4 py-3" style={{background:bg,border:`1px solid ${border}`}}>
            <div className="text-[9px] text-zinc-600 font-mono tracking-[0.25em] uppercase mb-1">{label}</div>
            <div className="text-2xl font-black font-mono leading-none" style={{color}}>{value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl" style={{background:'rgba(0,0,0,0.35)',border:'1px solid rgba(255,255,255,0.05)'}}>
        <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{minWidth:500,display:'block'}}>
          <defs>
            {filtered.map(d => (
              <linearGradient key={`g-${d.id}`} id={`g-${d.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor={d.color} stopOpacity="1" />
                <stop offset="40%"  stopColor={d.color} stopOpacity="0.65" />
                <stop offset="60%"  stopColor={d.color} stopOpacity="0.65" />
                <stop offset="100%" stopColor={d.color} stopOpacity="1" />
              </linearGradient>
            ))}
          </defs>
          <rect x={0}     y={0} width={LX+30}           height={SVG_H} fill="rgba(255,255,255,0.012)" />
          <rect x={RX-30} y={0} width={SVG_W-(RX-30)}   height={SVG_H} fill="rgba(255,255,255,0.012)" />
          <text x={LX/2+15}        y={28} textAnchor="middle" fill="#3f3f46" fontSize={10} fontFamily="monospace" letterSpacing="6">GRIGLIA PARTENZA</text>
          <text x={(SVG_W+RX)/2-15} y={28} textAnchor="middle" fill="#3f3f46" fontSize={10} fontFamily="monospace" letterSpacing="6">ARRIVO GARA</text>
          <line x1={LX} y1={36} x2={LX} y2={SVG_H-8} stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="3 6"/>
          <line x1={RX} y1={36} x2={RX} y2={SVG_H-8} stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="3 6"/>
          {byGrid.map((d,i) => i%2===0 && (
            <rect key={`z-${d.id}`} x={LX+1} y={gridY[d.id]-ROW_H/2} width={RX-LX-2} height={ROW_H} fill="rgba(255,255,255,0.014)"/>
          ))}
          {[false,true].map(hlPass =>
            filtered.map(d => {
              const y1=gridY[d.id], y2=raceY[d.id];
              if(y1==null||y2==null) return null;
              const isHL=highlight===d.id;
              if(hlPass!==isHL) return null;
              const dimmed=highlight&&!isHL;
              const opacity=dimmed?0.08:1, sw=isHL?9:7;
              const cx1=LX+(RX-LX)*0.35, cx2=LX+(RX-LX)*0.65;
              const path=`M ${LX} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${RX} ${y2}`;
              return (
                <g key={d.id}>
                  <path d={path} fill="none" stroke="transparent" strokeWidth={22} style={{cursor:'pointer'}}
                    onMouseEnter={()=>setHighlight(d.id)} onMouseLeave={()=>setHighlight(null)}/>
                  {isHL&&<path d={path} fill="none" stroke={d.color} strokeWidth={16} opacity={0.15} strokeLinecap="round"/>}
                  <path d={path} fill="none" stroke={`url(#g-${d.id})`} strokeWidth={sw} opacity={opacity} strokeLinecap="round"/>
                  {isHL&&<><circle cx={LX} cy={y1} r={9} fill={d.color} opacity={0.18}/><circle cx={RX} cy={y2} r={9} fill={d.color} opacity={0.18}/></>}
                  <circle cx={LX} cy={y1} r={isHL?8:6} fill={d.color} opacity={opacity}/>
                  <circle cx={RX} cy={y2} r={isHL?8:6} fill={d.color} opacity={opacity}/>
                </g>
              );
            })
          )}
          {byGrid.map(d => {
            const y=gridY[d.id],isHL=highlight===d.id,dim=highlight&&!isHL;
            return (
              <g key={`L-${d.id}`} onMouseEnter={()=>setHighlight(d.id)} onMouseLeave={()=>setHighlight(null)} style={{cursor:'pointer'}}>
                {isHL&&<rect x={6} y={y-14} width={LX-16} height={28} rx={5} fill={d.color} fillOpacity={0.12}/>}
                <text x={36} y={y+5} textAnchor="middle" fontSize={dim?9:isHL?11:10} fontWeight={700} fontFamily="monospace" fill={dim?'#2a2a2a':isHL?d.color:'#4b4b4b'}>P{d.gridPos}</text>
                <text x={LX-14} y={y+5} textAnchor="end" fontSize={dim?11:isHL?15:13} fontWeight={isHL?900:700} fontFamily="monospace" fill={dim?'#252525':isHL?'#ffffff':'#fffefe'}>{d.code}</text>
              </g>
            );
          })}
          {byRace.map(d => {
            const y=raceY[d.id],isHL=highlight===d.id,dim=highlight&&!isHL,gc=getGainColor(d.gain);
            return (
              <g key={`R-${d.id}`} onMouseEnter={()=>setHighlight(d.id)} onMouseLeave={()=>setHighlight(null)} style={{cursor:'pointer'}}>
                {isHL&&<rect x={RX+16} y={y-14} width={SVG_W-RX-22} height={28} rx={5} fill={d.color} fillOpacity={0.12}/>}
                <text x={RX+16} y={y+5} textAnchor="start" fontSize={dim?11:isHL?15:13} fontWeight={isHL?900:700} fontFamily="monospace" fill={dim?'#252525':isHL?'#ffffff':'#fffefe'}>{d.code}</text>
                <text x={SVG_W-10} y={y+5} textAnchor="end" fontSize={dim?9:isHL?11:10} fontWeight={700} fontFamily="monospace" fill={dim?'#2a2a2a':isHL?gc:'#4b4b4b'}>
                  {isHL&&d.gain!==0?(d.gain>0?`▲+${d.gain}`:`▼${d.gain}`):`P${d.racePos}`}
                </text>
              </g>
            );
          })}
          {highlight&&(()=>{
            const d=filtered.find(x=>x.id===highlight);
            if(!d) return null;
            const gy=gridY[d.id]??0,ry=raceY[d.id]??0;
            const midY=Math.min(Math.max((gy+ry)/2,55),SVG_H-75),midX=(LX+RX)/2,gc=getGainColor(d.gain),tw=168;
            return (
              <g>
                <rect x={midX-tw/2+3} y={midY-42+3} width={tw} height={78} rx={10} fill="rgba(0,0,0,0.6)"/>
                <rect x={midX-tw/2} y={midY-42} width={tw} height={78} rx={10} fill="#0d0d0d" stroke={d.color} strokeWidth={1.5} strokeOpacity={0.7}/>
                <rect x={midX-tw/2} y={midY-42} width={4} height={78} rx={3} fill={d.color}/>
                <circle cx={midX-tw/2+20} cy={midY-18} r={4} fill={d.color}/>
                <text x={midX-tw/2+32} y={midY-14} textAnchor="start" fill="#ffffff" fontSize={16} fontWeight={900} fontFamily="monospace">{d.code}</text>
                <text x={midX-tw/2+12} y={midY+2} textAnchor="start" fill="#6b7280" fontSize={9.5} fontFamily="monospace" letterSpacing={1}>GRID P{d.gridPos}  →  RACE P{d.racePos}</text>
                <text x={midX} y={midY+22} textAnchor="middle" fill={gc} fontSize={14} fontWeight={900} fontFamily="monospace">
                  {d.gain>0?`▲ +${d.gain} POSITIONS`:d.gain<0?`▼ ${d.gain} POSITIONS`:'● NO CHANGE'}
                </text>
                {d.points>0&&<text x={midX} y={midY+36} textAnchor="middle" fill="#3f3f46" fontSize={9} fontFamily="monospace">{d.points} PTS</text>}
              </g>
            );
          })()}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-6 pt-5 border-t border-white/5">
        <span className="text-[9px] text-zinc-700 font-mono tracking-[0.3em] uppercase">Legend</span>
        <span className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
          <span className="inline-block w-8 h-0.5 rounded" style={{background:'linear-gradient(90deg,#888,#888)'}}/> Team color (tutti i piloti)
        </span>
        <span className="ml-auto text-[10px] text-zinc-800 font-mono tracking-widest">HOVER TO HIGHLIGHT</span>
      </div>
    </div>
  );
}

// ── Q1→Q2→Q3 inner chart ──
function QualiProgressionChart({ qualiResults }) {
  const [highlight, setHighlight] = React.useState(null);

  const drivers = React.useMemo(() => {
    if (!qualiResults?.length) return [];
    return qualiResults.map(r => {
      const parts = (r.driverId || '').split('-');
      const code  = parts[parts.length - 1].toUpperCase().substring(0, 3);
      return {
        id: r.driverId, code,
        color: TEAM_COLORS[r.constructorId] || TEAM_COLORS.default,
        q1pos: r.q1pos ?? null, q1t: r.q1Millis ?? null,
        q2pos: r.q2pos ?? null, q2t: r.q2Millis ?? null,
        q3pos: r.q3pos ?? null, q3t: r.q3Millis ?? null,
        eliminatedAfter: r.q3pos != null ? null : r.q2pos != null ? 'Q2' : 'Q1',
      };
    });
  }, [qualiResults]);

  if (!drivers.length) return (
    <div className="flex items-center justify-center h-32 text-zinc-600 font-mono text-sm tracking-widest uppercase">
      No qualifying data available
    </div>
  );

  const ROW_H=30, SVG_W=960, PAD=54;
  const q1s=[...drivers].filter(d=>d.q1pos!=null).sort((a,b)=>a.q1pos-b.q1pos);
  const q2s=[...drivers].filter(d=>d.q2pos!=null).sort((a,b)=>a.q2pos-b.q2pos);
  const q3s=[...drivers].filter(d=>d.q3pos!=null).sort((a,b)=>a.q3pos-b.q3pos);
  const N=Math.max(q1s.length,q2s.length,q3s.length,15);
  const SVG_H=N*ROW_H+PAD+24;
  const COLS=[200,480,760];
  const COL_COLORS=['#6366f1','#f59e0b','#ef4444'];
  const makeY=(sorted)=>{ const m={}; sorted.forEach((d,i)=>{m[d.id]=PAD+i*ROW_H;}); return m; };
  const y1=makeY(q1s), y2=makeY(q2s), y3=makeY(q3s);
  const getY=(d,ri)=>ri===0?y1[d.id]:ri===1?y2[d.id]:y3[d.id];
  const hasR=(d,ri)=>ri===0?d.q1pos!=null:ri===1?d.q2pos!=null:d.q3pos!=null;
  const fmtT=(ms)=>ms==null?'—':`${Math.floor(ms/60000)}:${((ms%60000)/1000).toFixed(3).padStart(6,'0')}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          {label:'Q1 RUNNERS',value:q1s.length,color:COL_COLORS[0],bg:'rgba(99,102,241,0.08)',border:'rgba(99,102,241,0.2)'},
          {label:'Q2 RUNNERS',value:q2s.length,color:COL_COLORS[1],bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.2)'},
          {label:'Q3 RUNNERS',value:q3s.length,color:COL_COLORS[2],bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.2)'},
        ].map(({label,value,color,bg,border})=>(
          <div key={label} className="rounded-xl px-4 py-3" style={{background:bg,border:`1px solid ${border}`}}>
            <div className="text-[9px] font-mono tracking-[0.25em] uppercase mb-1" style={{color:`${color}99`}}>{label}</div>
            <div className="text-3xl font-black font-mono leading-none" style={{color}}>{value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl" style={{background:'rgba(0,0,0,0.35)',border:'1px solid rgba(255,255,255,0.05)'}}>
        <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{minWidth:500,display:'block'}}>
          <defs>
            {drivers.map(d=>(
              <linearGradient key={`qg-${d.id}`} id={`qg-${d.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={d.color} stopOpacity="1"/>
                <stop offset="100%" stopColor={d.color} stopOpacity="0.8"/>
              </linearGradient>
            ))}
          </defs>
          {/* Column headers */}
          {COLS.map((cx,ci)=>(
            <g key={`ch-${ci}`}>
              <rect x={cx-22} y={8} width={44} height={28} rx={6} fill={COL_COLORS[ci]} fillOpacity={0.15}/>
              <rect x={cx-22} y={8} width={44} height={28} rx={6} fill="none" stroke={COL_COLORS[ci]} strokeWidth={1} strokeOpacity={0.4}/>
              <text x={cx} y={26} textAnchor="middle" fill={COL_COLORS[ci]} fontSize={12} fontWeight={900} fontFamily="monospace" letterSpacing={2}>{['Q1','Q2','Q3'][ci]}</text>
            </g>
          ))}
          {/* Rails */}
          {COLS.map((cx,ci)=>(
            <line key={`vr-${ci}`} x1={cx} y1={42} x2={cx} y2={SVG_H-8} stroke={COL_COLORS[ci]} strokeWidth={1} strokeOpacity={0.2} strokeDasharray="3 6"/>
          ))}
          {/* Column bg */}
          <rect x={0}          y={0} width={COLS[0]+50}            height={SVG_H} fill="rgba(255,255,255,0.012)"/>
          <rect x={SVG_W-200}  y={0} width={200}                   height={SVG_H} fill="rgba(255,255,255,0.012)"/>
          {/* Curves */}
          {[false,true].map(hlPass=>
            drivers.map(d=>{
              const isHL=highlight===d.id;
              if(hlPass!==isHL) return null;
              const dimmed=highlight&&!isHL;
              const opacity=dimmed?0.07:1, sw=isHL?8:6;
              const segs=[];
              if(hasR(d,0)&&hasR(d,1)){
                const ya=getY(d,0),yb=getY(d,1);
                const cx1=COLS[0]+(COLS[1]-COLS[0])*0.38,cx2=COLS[0]+(COLS[1]-COLS[0])*0.62;
                segs.push(`M ${COLS[0]} ${ya} C ${cx1} ${ya}, ${cx2} ${yb}, ${COLS[1]} ${yb}`);
              }
              if(hasR(d,1)&&hasR(d,2)){
                const ya=getY(d,1),yb=getY(d,2);
                const cx1=COLS[1]+(COLS[2]-COLS[1])*0.38,cx2=COLS[1]+(COLS[2]-COLS[1])*0.62;
                segs.push(`M ${COLS[1]} ${ya} C ${cx1} ${ya}, ${cx2} ${yb}, ${COLS[2]} ${yb}`);
              }
              return (
                <g key={d.id}>
                  {segs.map((path,si)=>(
                    <g key={si}>
                      <path d={path} fill="none" stroke="transparent" strokeWidth={20} style={{cursor:'pointer'}}
                        onMouseEnter={()=>setHighlight(d.id)} onMouseLeave={()=>setHighlight(null)}/>
                      {isHL&&<path d={path} fill="none" stroke={d.color} strokeWidth={14} opacity={0.18} strokeLinecap="round"/>}
                      <path d={path} fill="none" stroke={`url(#qg-${d.id})`} strokeWidth={sw} opacity={opacity} strokeLinecap="round"/>
                    </g>
                  ))}
                  {[0,1,2].map(ri=>{
                    if(!hasR(d,ri)) return null;
                    const cx=COLS[ri],cy=getY(d,ri);
                    return (
                      <g key={ri} onMouseEnter={()=>setHighlight(d.id)} onMouseLeave={()=>setHighlight(null)} style={{cursor:'pointer'}}>
                        {isHL&&<circle cx={cx} cy={cy} r={10} fill={d.color} opacity={0.15}/>}
                        <circle cx={cx} cy={cy} r={isHL?7:5} fill={d.color} opacity={opacity}/>
                        {!hasR(d,ri+1)&&ri<2&&(
                          <g>
                            <line x1={cx-5} y1={cy-5} x2={cx+5} y2={cy+5} stroke="#111" strokeWidth={2.5}/>
                            <line x1={cx+5} y1={cy-5} x2={cx-5} y2={cy+5} stroke="#111" strokeWidth={2.5}/>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })
          )}
          {/* Left labels */}
          {q1s.map(d=>{
            const y_=y1[d.id],isHL=highlight===d.id,dim=highlight&&!isHL;
            return (
              <g key={`ql-${d.id}`} onMouseEnter={()=>setHighlight(d.id)} onMouseLeave={()=>setHighlight(null)} style={{cursor:'pointer'}}>
                {isHL&&<rect x={6} y={y_-14} width={COLS[0]-16} height={28} rx={5} fill={d.color} fillOpacity={0.12}/>}
                <text x={32} y={y_+5} textAnchor="middle" fontSize={dim?9:isHL?11:10} fontWeight={700} fontFamily="monospace" fill={dim?'#2a2a2a':isHL?d.color:'#4b4b4b'}>P{d.q1pos}</text>
                <text x={COLS[0]-12} y={y_+5} textAnchor="end" fontSize={dim?11:isHL?15:13} fontWeight={isHL?900:700} fontFamily="monospace" fill={dim?'#252525':isHL?'#ffffff':'#e0e0e0'}>{d.code}</text>
              </g>
            );
          })}
          {/* Right labels */}
          {(q3s.length>0?q3s:q2s).map(d=>{
            const ymap=q3s.length>0?y3:y2;
            const y_=ymap[d.id],pos=q3s.length>0?d.q3pos:d.q2pos;
            const isHL=highlight===d.id,dim=highlight&&!isHL;
            return (
              <g key={`qr-${d.id}`} onMouseEnter={()=>setHighlight(d.id)} onMouseLeave={()=>setHighlight(null)} style={{cursor:'pointer'}}>
                {isHL&&<rect x={COLS[2]+14} y={y_-14} width={SVG_W-COLS[2]-20} height={28} rx={5} fill={d.color} fillOpacity={0.12}/>}
                <text x={COLS[2]+14} y={y_+5} textAnchor="start" fontSize={dim?11:isHL?15:13} fontWeight={isHL?900:700} fontFamily="monospace" fill={dim?'#252525':isHL?'#ffffff':'#e0e0e0'}>{d.code}</text>
                <text x={SVG_W-8} y={y_+5} textAnchor="end" fontSize={dim?9:isHL?11:10} fontWeight={700} fontFamily="monospace" fill={dim?'#2a2a2a':isHL?d.color:'#4b4b4b'}>P{pos}</text>
              </g>
            );
          })}
          {/* Tooltip */}
          {highlight&&(()=>{
            const d=drivers.find(x=>x.id===highlight);
            if(!d) return null;
            const by=y3[d.id]??y2[d.id]??y1[d.id]??100;
            const midY=Math.min(Math.max(by,55),SVG_H-100),midX=COLS[1],tw=200;
            return (
              <g>
                <rect x={midX-tw/2+3} y={midY-50+3} width={tw} height={96} rx={10} fill="rgba(0,0,0,0.6)"/>
                <rect x={midX-tw/2} y={midY-50} width={tw} height={96} rx={10} fill="#0d0d0d" stroke={d.color} strokeWidth={1.5} strokeOpacity={0.7}/>
                <rect x={midX-tw/2} y={midY-50} width={4} height={96} rx={3} fill={d.color}/>
                <circle cx={midX-tw/2+22} cy={midY-28} r={5} fill={d.color}/>
                <text x={midX-tw/2+36} y={midY-24} textAnchor="start" fill="#ffffff" fontSize={17} fontWeight={900} fontFamily="monospace">{d.code}</text>
                <text x={midX-tw/2+12} y={midY-6}  textAnchor="start" fill={COL_COLORS[0]} fontSize={9} fontFamily="monospace" letterSpacing={1}>Q1  {fmtT(d.q1t)}</text>
                {d.q2t!=null&&<text x={midX-tw/2+12} y={midY+8}  textAnchor="start" fill={COL_COLORS[1]} fontSize={9} fontFamily="monospace" letterSpacing={1}>Q2  {fmtT(d.q2t)}</text>}
                {d.q3t!=null&&<text x={midX-tw/2+12} y={midY+22} textAnchor="start" fill={COL_COLORS[2]} fontSize={9} fontFamily="monospace" letterSpacing={1}>Q3  {fmtT(d.q3t)}</text>}
                {d.eliminatedAfter&&<text x={midX} y={midY+40} textAnchor="middle" fill="#ef4444" fontSize={9} fontFamily="monospace" letterSpacing={1}>ELIMINATED AFTER {d.eliminatedAfter}</text>}
              </g>
            );
          })()}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5">
        <span className="text-[9px] text-zinc-700 font-mono tracking-[0.3em] uppercase">Legend</span>
        {[{color:COL_COLORS[0],label:'Q1'},{color:COL_COLORS[1],label:'Q2'},{color:COL_COLORS[2],label:'Q3'}].map(({color,label})=>(
          <span key={label} className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
            <span className="inline-block w-3 h-3 rounded-full" style={{background:color,opacity:0.6}}/>{label}
          </span>
        ))}
        <span className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
          <span style={{color:'#555',fontSize:11}}>✕</span> Eliminato
        </span>
        <span className="ml-auto text-[10px] text-zinc-800 font-mono tracking-widest">HOVER TO HIGHLIGHT</span>
      </div>
    </div>
  );
}

// ── Main exported component ──
function QualifyingToRaceProgression({ raceResults, qualiResults, year, grandPrix }) {
  const [mode, setMode] = React.useState('race');
  const hasQuali = qualiResults?.length > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8"
         style={{background:'linear-gradient(135deg,#0c0c0c 0%,#111 50%,#0a0a0a 100%)'}}>
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
           style={{background:'radial-gradient(circle,rgba(220,0,0,0.22) 0%,transparent 70%)'}}/>
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
           style={{background:'radial-gradient(circle,rgba(220,0,0,0.1) 0%,transparent 70%)'}}/>
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
           style={{backgroundImage:'radial-gradient(circle at 1px 1px,#fff 1px,transparent 0)',backgroundSize:'40px 40px'}}/>
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none overflow-hidden">
        <div className="h-px w-1/3 bg-gradient-to-r from-transparent via-red-500/70 to-transparent"
             style={{animation:'scan 4s linear infinite'}}/>
      </div>
      <style>{`@keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>

      <div className="relative z-10 p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"/>
              <span className="text-[10px] text-red-500 font-mono tracking-[0.3em] uppercase">Position Analysis</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none uppercase">
              {mode==='race'
                ? <>Grid <span className="text-red-600">→</span> Race</>
                : <>Q1 <span style={{color:'#6366f1'}}>→</span> Q2 <span style={{color:'#f59e0b'}}>→</span> Q3</>}
            </h2>
            <p className="text-zinc-500 font-mono text-xs mt-2 tracking-[0.2em] uppercase">
              {year} · {grandPrix} · {mode==='race'?'Position Gains & Losses':'Qualifying Progression'}
            </p>
          </div>

          {/* Mode switcher */}
          <div className="flex gap-2">
            <button onClick={()=>setMode('race')}
              className={`px-4 py-2.5 rounded-xl text-[11px] font-mono tracking-widest border transition-all duration-200 ${
                mode==='race'?'bg-red-500/15 text-red-400 border-red-500/40':'bg-white/5 text-zinc-600 border-white/8 hover:text-zinc-300 hover:bg-white/8'
              }`}>
              🏁 GRID → RACE
            </button>
            <button onClick={()=>setMode('quali')} disabled={!hasQuali}
              className={`px-4 py-2.5 rounded-xl text-[11px] font-mono tracking-widest border transition-all duration-200 ${
                mode==='quali'?'bg-indigo-500/15 text-indigo-400 border-indigo-500/40'
                :hasQuali?'bg-white/5 text-zinc-600 border-white/8 hover:text-zinc-300 hover:bg-white/8'
                :'opacity-30 bg-white/3 text-zinc-800 border-white/5 cursor-not-allowed'
              }`}>
              ⏱ Q1 → Q2 → Q3
            </button>
          </div>
        </div>

        {mode==='race'
          ? <GridToRaceChart raceResults={raceResults} year={year} grandPrix={grandPrix}/>
          : <QualiProgressionChart qualiResults={qualiResults} year={year} grandPrix={grandPrix}/>}
      </div>
    </div>
  );
}
export default function LiveTimingPage() {

  // Session-level cache refs — avoid re-fetching same data within a session
  const cachedDriverNum = React.useRef(null);   // { sk, code, num }
  const cachedCarData   = React.useRef(null);   // { sk, num, data }
  const cachedRawLaps   = React.useRef(null);   // { sk, num, data }

  const [raceResults, setRaceResults] = useState(null);
  const [qualiResults, setQualiResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const loadQualiResults = async (year, meetingObj) => {
    if (typeof window === 'undefined' || !meetingObj) return;
    try {
      const [q1Res, q2Res, qRes, racesRes] = await Promise.all([
        fetch('/data/f1db-races-qualifying-1-results.json').catch(() => null),
        fetch('/data/f1db-races-qualifying-2-results.json').catch(() => null),
        fetch('/data/f1db-races-qualifying-results.json').catch(() => null),
        fetch('/data/f1db-races.json').catch(() => null),
      ]);
      if (!racesRes?.ok) return;
      const allRaces   = await racesRes.json();
      const q1All      = q1Res?.ok ? await q1Res.json() : [];
      const q2All      = q2Res?.ok ? await q2Res.json() : [];
      const qAll       = qRes?.ok  ? await qRes.json()  : [];

      const loc         = (meetingObj.location || '').toLowerCase();
      const country     = (meetingObj.country_name || '').toLowerCase();
      const meetingName = (meetingObj.meeting_name || '').toLowerCase().replace(' grand prix','').replace(' gp','').trim();

      const racesForYear = allRaces.filter(r => r.year === parseInt(year));
      const matchedRace  = racesForYear.find(r => {
        const fields = [r.name, r.officialName, r.grandPrixId, r.circuitId].map(f => (f||'').toLowerCase());
        return fields.some(f => f && (f.includes(loc)||loc.includes(f)||f.includes(country)||country.includes(f)||f.includes(meetingName)||meetingName.includes(f)));
      });
      if (!matchedRace) return;

      const rId = matchedRace.id;
      const q1  = q1All.filter(r => r.raceId === rId);
      const q2  = q2All.filter(r => r.raceId === rId);
      const q   = qAll.filter(r => r.raceId === rId);

      // Merge into per-driver objects
      const driverMap = {};
      const addRound = (arr, posKey, timeKey) => arr.forEach(r => {
        if (!driverMap[r.driverId]) driverMap[r.driverId] = { driverId: r.driverId, constructorId: r.constructorId };
        driverMap[r.driverId][posKey]  = r.positionNumber;
        driverMap[r.driverId][timeKey] = r.timeMillis;
      });

      if (q1.length && q2.length) {
        // Has separate Q1/Q2 files
        addRound(q1, 'q1pos', 'q1Millis');
        addRound(q2, 'q2pos', 'q2Millis');
        // Q3 would be in a separate file; for now mark Q3 as q2pos<=10
        Object.values(driverMap).forEach(d => {
          if (d.q2pos != null && d.q2pos <= 10) { d.q3pos = d.q2pos; d.q3Millis = d.q2Millis; }
        });
      } else if (q.length) {
        // Modern Q1/Q2/Q3 combined
        q.forEach(r => {
          if (!driverMap[r.driverId]) driverMap[r.driverId] = { driverId: r.driverId, constructorId: r.constructorId };
          const d = driverMap[r.driverId];
          if (r.q1Millis) { d.q1pos = r.positionNumber; d.q1Millis = r.q1Millis; }
          if (r.q2Millis) { d.q2pos = r.positionNumber; d.q2Millis = r.q2Millis; }
          if (r.q3Millis) { d.q3pos = r.positionNumber; d.q3Millis = r.q3Millis; }
        });
        // Assign Q1 positions to those that only have q1Millis
        const byQ1 = Object.values(driverMap).filter(d => d.q1Millis).sort((a,b)=>a.q1Millis-b.q1Millis);
        byQ1.forEach((d, i) => { if (!d.q1pos) d.q1pos = i + 1; });
        const byQ2 = Object.values(driverMap).filter(d => d.q2Millis).sort((a,b)=>a.q2Millis-b.q2Millis);
        byQ2.forEach((d, i) => { if (!d.q2pos) d.q2pos = i + 1; });
        const byQ3 = Object.values(driverMap).filter(d => d.q3Millis).sort((a,b)=>a.q3Millis-b.q3Millis);
        byQ3.forEach((d, i) => { if (!d.q3pos) d.q3pos = i + 1; });
      }

      const result = Object.values(driverMap);
      if (result.length) setQualiResults(result);
    } catch(e) { console.error('Quali load error:', e); }
  };

  const loadRaceResults = async (year, meetingObj) => {
    if (typeof window === 'undefined' || !meetingObj) return;

    setLoadingResults(true);
    try {
      const [resultsRes, racesRes] = await Promise.all([
        fetch('/data/f1db-races-race-results.json'),
        fetch('/data/f1db-races.json').catch(() => null),
      ]);
      const allResults = await resultsRes.json();

      const sampleResult = allResults.find(r => r.year === parseInt(year));
      console.log('🏁 Sample result entry:', sampleResult);
      console.log('🏟 Meeting obj:', { 
        meeting_name: meetingObj.meeting_name, 
        location: meetingObj.location,
        country_name: meetingObj.country_name,
        circuit_key: meetingObj.circuit_key,
        circuit_short_name: meetingObj.circuit_short_name,
      });

      let filtered = [];

      if (racesRes?.ok) {
        const allRaces = await racesRes.json();
        const racesForYear = allRaces.filter(r => r.year === parseInt(year));
        console.log('📋 Races for year, first entry:', racesForYear[0]);

        const loc = (meetingObj.location || '').toLowerCase();
        const country = (meetingObj.country_name || '').toLowerCase();
        const circuitShort = (meetingObj.circuit_short_name || '').toLowerCase();
        const meetingName = (meetingObj.meeting_name || '').toLowerCase()
          .replace(' grand prix', '').replace(' gp', '').trim();

        const matchedRace = racesForYear.find(r => {
          const fields = [
            r.name, r.officialName, r.grandPrixId, r.circuitId,
            r.location, r.country, r.circuit,
          ].map(f => (f || '').toLowerCase());

          return fields.some(f =>
            f && (
              f.includes(loc) || loc.includes(f) ||
              f.includes(country) || country.includes(f) ||
              f.includes(meetingName) || meetingName.includes(f) ||
              (circuitShort && (f.includes(circuitShort) || circuitShort.includes(f)))
            )
          );
        });

        console.log('🎯 Matched race:', matchedRace);

        if (matchedRace) {
          filtered = allResults.filter(r =>
            r.year === parseInt(year) && r.round === matchedRace.round
          );
          console.log('✅ Filtered results count:', filtered.length);
        }
      }

      if (!filtered.length) {
        const loc = (meetingObj.location || '').toLowerCase();
        const country = (meetingObj.country_name || '').toLowerCase();
        const meetingName = (meetingObj.meeting_name || '').toLowerCase()
          .replace(' grand prix', '').replace(' gp', '').trim();

        const rounds = [...new Set(allResults.filter(r => r.year === parseInt(year)).map(r => r.round))];
        let bestRound = null, bestScore = -1;

        for (const round of rounds) {
          const sample = allResults.find(r => r.year === parseInt(year) && r.round === round);
          if (!sample) continue;
          
          const fields = Object.values(sample)
            .filter(v => typeof v === 'string')
            .map(v => v.toLowerCase());
          
          let score = 0;
          for (const f of fields) {
            if (f.includes(loc) || loc.includes(f)) score += 3;
            if (f.includes(country) || country.includes(f)) score += 2;
            if (f.includes(meetingName) || meetingName.includes(f)) score += 1;
          }
          
          console.log(`Round ${round} score: ${score}`, Object.values(sample).filter(v => typeof v === 'string').slice(0,5));
          if (score > bestScore) { bestScore = score; bestRound = round; }
        }

        if (bestRound && bestScore > 0) {
          filtered = allResults.filter(r => r.year === parseInt(year) && r.round === bestRound);
          console.log(`✅ Fallback matched round ${bestRound} (score ${bestScore}), results:`, filtered.length);
        }
      }

      setRaceResults(filtered.length ? filtered : null);
    } catch (error) {
      console.error('❌ Error loading race results:', error);
      setRaceResults(null);
    } finally {
      setLoadingResults(false);
    }
  };
  
  // Selections
  const [year, setYear]               = useState(null);
  const [meetings, setMeetings]       = useState([]);
  const [meeting, setMeeting]         = useState(null);
  const [sessionType, setSessionType] = useState('R');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [drivers, setDrivers]         = useState([]);
  const [driverCode, setDriverCode]   = useState(null);

  // Lap selectors
  const [driverLaps, setDriverLaps]   = useState([]);
  const [selectedLap, setSelectedLap] = useState(null);

  // Data
  const [telemetry, setTelemetry]               = useState([]);
  const [fastestLap, setFastestLap]             = useState(null);
  const [circuitMap, setCircuitMap]             = useState([]);
  const [weather, setWeather]                   = useState(null);
  const [sectorsData, setSectorsData]           = useState(null);
  const [positionsData, setPositionsData]       = useState(null);

  // UI
  const [activeTab, setActiveTab]   = useState('speed');
  const [loading, setLoading]       = useState(false);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [loadingSectors, setLoadingSectors]     = useState(false);
  const [loadStep, setLoadStep]     = useState('');
  const [error, setError]           = useState(null);
  const [lastQuery, setLastQuery]   = useState(null);

  // Dropdown open states
  const [openYear, setOpenYear]       = useState(false);
  const [openMeeting, setOpenMeeting] = useState(false);
  const [openSession, setOpenSession] = useState(false);
  const [openDriver, setOpenDriver]   = useState(false);

  const r1=useRef(null),r2=useRef(null),r3=useRef(null),r4=useRef(null);
  useOutsideClose([r1,r2,r3,r4],[setOpenYear,setOpenMeeting,setOpenSession,setOpenDriver]);

  // Auto-populate on mount
  useEffect(() => {
    (async () => {
      try {
        const latest = await getLatestSession('R');
        if (!latest?.year) return;
        const ms = await getMeetings(latest.year);
        setYear(latest.year); setMeetings(ms);
        const m = ms.find(m =>
          m.location?.toLowerCase().includes(latest.location?.toLowerCase()) ||
          latest.location?.toLowerCase().includes(m.location?.toLowerCase()));
        if (!m) return;
        setMeeting(m);
        const sessions = await getSessionsForMeeting(m.meeting_key);
        const sess = sessions.find(s => s.session_name === 'Qualifying') || sessions[sessions.length - 1];
        if (sess) {
          const d = await getDrivers(sess.session_key);
          setDrivers(d.sort((a, b) => (a.name_acronym||'').localeCompare(b.name_acronym||'')));
          setSessionInfo(sess);
        }
      } catch { /* silent */ }
    })();
  }, []);

  const loadDriversForSession = async (m, sessName) => {
    const sessions = await getSessionsForMeeting(m.meeting_key);
    const sess = sessions.find(s => s.session_name === sessName) || sessions[sessions.length - 1];
    if (!sess) return;
    const d = await getDrivers(sess.session_key);
    setDrivers(d.sort((a, b) => (a.name_acronym||'').localeCompare(b.name_acronym||'')));
    setSessionInfo(sess);
  };

  const handleYearChange = async (y) => {
    setYear(y); setOpenYear(false); setMeeting(null); setDrivers([]); setSessionInfo(null);
    try { setMeetings(await getMeetings(y)); } catch { setMeetings([]); }
  };

  const handleMeetingChange = async (m) => {
    setMeeting(m); setOpenMeeting(false); setDrivers([]); setSessionInfo(null);
    setRaceResults(null); setQualiResults(null);
    if (sessionType === 'R') { loadRaceResults(year, m); loadQualiResults(year, m); }
    try { await loadDriversForSession(m, SESSION_TYPES.find(s => s.id === sessionType)?.name || 'Qualifying'); }
    catch { setDrivers([]); }
  };

  const handleSessionChange = async (sid) => {
    setSessionType(sid); setOpenSession(false); setDrivers([]); setSessionInfo(null);
    setRaceResults(null); setQualiResults(null);
    if (sid === 'R' && meeting) { loadRaceResults(year, meeting); loadQualiResults(year, meeting); }
    if (!meeting) return;
    try { await loadDriversForSession(meeting, SESSION_TYPES.find(s => s.id === sid)?.name || sid); }
    catch { setDrivers([]); }
  };

const fetchAll = async () => {
  if (!year || !meeting || !driverCode || !sessionInfo) return;

  setLoading(true);
  setError(null);
  setTelemetry([]);
  setFastestLap(null);
  setCircuitMap([]);
  setWeather(null);
  setSectorsData(null);
  setPositionsData(null);
  setDriverLaps([]);
  setLoadingTelemetry(true);
  setLoadingSectors(true);

  const sk = sessionInfo.session_key;

  try {
    // Resolve driver number — use cached if same session+driver
    let num;
    if (cachedDriverNum.current?.sk === sk && cachedDriverNum.current?.code === driverCode) {
      num = cachedDriverNum.current.num;
    } else {
      num = await getDriverNumber(sk, driverCode);
      cachedDriverNum.current = { sk, code: driverCode, num };
    }

    // Fetch /laps and /car_data once, in parallel — reuse both everywhere below
    const rawLapsPromise = (cachedRawLaps.current?.sk === sk && cachedRawLaps.current?.num === num)
      ? Promise.resolve(cachedRawLaps.current.data)
      : openf1Fetch('/laps', { session_key: sk, driver_number: num }).then(d => {
          cachedRawLaps.current = { sk, num, data: d };
          return d;
        });

    const carDataPromise = (cachedCarData.current?.sk === sk && cachedCarData.current?.num === num)
      ? Promise.resolve(cachedCarData.current.data)
      : openf1Fetch('/car_data', { session_key: sk, driver_number: num }).then(d => {
          cachedCarData.current = { sk, num, data: d };
          return d;
        });

    // Step 1: laps resolve first (cheap) — show lap list + fastest lap immediately
    const telemetryPromise = (async () => {
      try {
        const rawLaps = await rawLapsPromise;
        const allLaps = rawLaps
          .filter(l => l.lap_duration != null && l.lap_duration > 0)
          .sort((a, b) => a.lap_number - b.lap_number);

        if (allLaps.length) {
          setDriverLaps(allLaps);
          const fastestLapNum = allLaps.reduce((a, b) =>
            a.lap_duration < b.lap_duration ? a : b
          ).lap_number;
          setSelectedLap(fastestLapNum);
          const fl = allLaps.find(l => l.lap_number === fastestLapNum);
          if (fl) setFastestLap(fl);
          // Circuit map reuses laps + car_data already being fetched
          carDataPromise.then(carData =>
            getCircuitMap(sk, num, fastestLapNum, rawLaps, carData)
              .then(setCircuitMap)
              .catch(() => {})
          );
        }

        // Step 2: wait for car_data then build telemetry — no extra fetch
        const carData = await carDataPromise;
        const telemetryResult = await getTelemetry(sk, num, null, rawLaps, carData).catch(() => null);
        if (telemetryResult) {
          setTelemetry(telemetryResult.telemetry);
          if (telemetryResult.target_lap) setFastestLap(telemetryResult.target_lap);
        }
      } finally {
        setLoadingTelemetry(false);
      }
    })();

    // Sectors + weather — independent, no overlap with above
    const sectorsPromise = (async () => {
      try {
        const [weatherResult, sectorsResult] = await Promise.all([
          getWeather(sk).catch(() => null),
          getAllDriversSectors(sk).catch(() => null),
        ]);
        setWeather(weatherResult);
        setSectorsData(sectorsResult);
      } finally {
        setLoadingSectors(false);
      }
    })();

    await Promise.all([telemetryPromise, sectorsPromise]);
    setLastQuery({ year, gp: meeting.meeting_name, session: sessionType, driver: driverCode });
  } catch (e) {
    setError(e.message || 'Errore sconosciuto');
    setLoadingTelemetry(false);
    setLoadingSectors(false);
  } finally {
    setLoading(false);
    setLoadStep('');
  }
};

  const refetchLap = async (lapNum) => {
    if (!sessionInfo) return;
    const sk = sessionInfo.session_key;
    try {
      // Reuse cached driver number, laps and car_data — zero extra API calls
      const num = cachedDriverNum.current?.sk === sk && cachedDriverNum.current?.code === driverCode
        ? cachedDriverNum.current.num
        : await getDriverNumber(sk, driverCode);
      const rawLaps = cachedRawLaps.current?.sk === sk && cachedRawLaps.current?.num === num
        ? cachedRawLaps.current.data : null;
      const carData = cachedCarData.current?.sk === sk && cachedCarData.current?.num === num
        ? cachedCarData.current.data : null;

      const r = await getTelemetry(sk, num, lapNum, rawLaps, carData);
      setTelemetry(r.telemetry);
      setFastestLap(r.target_lap);
      // Circuit map also reuses cached data
      getCircuitMap(sk, num, lapNum, rawLaps, carData).then(setCircuitMap).catch(() => {});
    } catch (e) { setError(e.message); }
  };

  const handleLapChange = (n) => { 
    setSelectedLap(n); 
    if (telemetry.length) refetchLap(n); 
  };

  // Must be defined BEFORE stats useMemo to avoid circular reference in minified build
  const fastestLapNumber = driverLaps.length ? 
    driverLaps.reduce((a,b)=>a.lap_duration<b.lap_duration?a:b).lap_number : null;

  const stats = useMemo(() => {
    // If telemetry is loaded, use full point-by-point data
    if (telemetry.length) {
      const spd = telemetry.map(d => d.speed).filter(Boolean);
      const rpm = telemetry.map(d => d.rpm).filter(Boolean);
      return {
        maxSpeed: spd.length ? Math.max(...spd) : 0,
        avgSpeed: spd.length ? Math.round(spd.reduce((a,b)=>a+b,0)/spd.length) : 0,
        maxRpm:   rpm.length ? Math.max(...rpm) : 0,
        points:   telemetry.length,
        fromLaps: false,
      };
    }
    // Fallback: show lap-based stats immediately while telemetry is loading
    if (driverLaps.length) {
      const fl = fastestLapNumber ? driverLaps.find(l => l.lap_number === fastestLapNumber) : null;
      return {
        maxSpeed: fl?.top_speed ?? null,
        avgSpeed: null,
        maxRpm: null,
        points: driverLaps.length,
        fastestTime: fl?.lap_duration ?? null,
        fromLaps: true,
      };
    }
    return null;
  }, [telemetry, driverLaps, fastestLapNumber]);

  const driverInfo = drivers.find(d => d.name_acronym === driverCode);
  const color = driverInfo?.team_colour ? `#${driverInfo.team_colour}` : '#ef4444';

  const canFetch = !!year && !!meeting && !!driverCode && !!sessionInfo;
  const isFetching = loading || loadingTelemetry || loadingSectors;
  const flagCode = meeting ? getFlagCode(meeting.location || meeting.meeting_name || '') : '';

  return (
    <>
      <Head><title>Telemetry Explorer | Ferrari F1</title></Head>
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 pt-24 pb-20">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-[10px] text-red-600 font-mono tracking-[0.2em] mb-2">
              <Radio className="w-3 h-3" /> OPENF1 API · TELEMETRY EXPLORER · 2023–2025
            </div>
            <h1 className="text-4xl font-black tracking-tighter">TELEMETRY <span className="text-red-600">EXPLORER</span></h1>
            <p className="text-zinc-600 text-sm mt-1 font-mono">Speed · RPM · Gear · Inputs · GPS Map · Sectors</p>
          </div>

          {/* 2×2 selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {/* Year */}
            <Dropdown label="Year" isOpen={openYear} onToggle={() => setOpenYear(v=>!v)} dropdownRef={r1}
              header={<div className="text-2xl font-black font-mono">{year||'—'}</div>}>
              {AVAILABLE_YEARS.map(y => (
                <button key={y} onClick={() => handleYearChange(y)}
                  className={`w-full p-3 text-left font-mono text-sm hover:bg-zinc-800 transition-colors ${year===y?'bg-red-600/15 border-l-2 border-red-600 pl-4 text-red-400':'text-zinc-300'}`}>
                  {y}
                </button>
              ))}
            </Dropdown>

            {/* Grand Prix */}
            <Dropdown label="Grand Prix" isOpen={openMeeting&&!!year} onToggle={() => year&&setOpenMeeting(v=>!v)}
              disabled={!year||!meetings.length} dropdownRef={r2}
              header={
                meeting ? (
                  <div className="flex items-center gap-2">
                    {flagCode && <img src={`https://flagcdn.com/w20/${flagCode}.png`} alt="Bandiera nazione" className="w-5 h-3 object-cover rounded-sm flex-shrink-0" />}
                    <div>
                      <div className="text-sm font-bold leading-tight">{meeting.meeting_name}</div>
                      <div className="text-xs text-zinc-500">{meeting.location} · {meeting.country_name}</div>
                    </div>
                  </div>
                ) : <div className="text-sm text-zinc-500">{year?(meetings.length?'Select Grand Prix':'Loading...'):'Select year first'}</div>
              }>
              {meetings.map(m => {
                const fc = getFlagCode(m.location||m.meeting_name||'');
                return (
                  <button key={m.meeting_key} onClick={() => handleMeetingChange(m)}
                    className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 ${meeting?.meeting_key===m.meeting_key?'bg-red-600/15 border-l-2 border-red-600 pl-4':''}`}>
                    {fc && <img src={`https://flagcdn.com/w20/${fc}.png`} alt="Bandiera nazione" className="w-5 h-3 object-cover rounded-sm flex-shrink-0" />}
                    <div>
                      <div className="text-sm font-bold text-white">{m.meeting_name}</div>
                      <div className="text-xs text-zinc-500">{m.location}</div>
                    </div>
                  </button>
                );
              })}
            </Dropdown>

            {/* Session */}
            <Dropdown label="Session" isOpen={openSession} onToggle={() => setOpenSession(v=>!v)} dropdownRef={r3}
              header={<div className="flex items-center gap-3"><span className="text-2xl font-black font-mono">{sessionType}</span><span className="text-zinc-500 text-sm">{SESSION_TYPES.find(s=>s.id===sessionType)?.name}</span></div>}>
              {SESSION_TYPES.map(s => (
                <button key={s.id} onClick={() => handleSessionChange(s.id)}
                  className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors ${sessionType===s.id?'bg-red-600/15 border-l-2 border-red-600 pl-4':''}`}>
                  <span className="font-mono font-bold text-white mr-3">{s.id}</span>
                  <span className="text-zinc-500 text-sm">{s.name}</span>
                </button>
              ))}
            </Dropdown>

            {/* Driver */}
            <Dropdown label="Driver" isOpen={openDriver&&!!meeting} onToggle={() => meeting&&drivers.length&&setOpenDriver(v=>!v)}
              disabled={!meeting||!drivers.length} dropdownRef={r4}
              header={
                driverInfo ? (
                  <div className="flex items-center gap-3">
                    {driverInfo.headshot_url && <img src={driverInfo.headshot_url} alt="Foto del pilota" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />}
                    <div>
                      <div className="font-black font-mono text-sm flex items-center gap-2">
                        <span style={{ color }}>{driverInfo.name_acronym}</span>
                        <span className="text-zinc-600 font-normal">#{driverInfo.driver_number}</span>
                      </div>
                      <div className="text-xs text-zinc-500">{driverInfo.full_name} · {driverInfo.team_name}</div>
                    </div>
                  </div>
                ) : <div className="text-sm text-zinc-500">{meeting?(drivers.length?'Select Driver':'Loading...'):'Select GP first'}</div>
              }>
              {drivers.map(d => (
                <button key={d.driver_number}
                  onClick={() => { setDriverCode(d.name_acronym); setOpenDriver(false); }}
                  className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 ${driverCode===d.name_acronym?'bg-red-600/15 border-l-2 border-red-600 pl-4':''}`}>
                  {d.headshot_url && <img src={d.headshot_url} alt="Foto del pilota" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
                  <div>
                    <div className="font-mono font-bold text-sm text-white">{d.name_acronym} <span className="text-zinc-600 font-normal">#{d.driver_number}</span></div>
                    <div className="text-xs text-zinc-500">{d.full_name} · {d.team_name}</div>
                  </div>
                </button>
              ))}
            </Dropdown>
          </div>

          {/* Fetch row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex-1" />
            {lastQuery && <div className="hidden lg:block text-xs text-zinc-700 font-mono">{lastQuery.year} · {lastQuery.gp} · {lastQuery.driver} · {lastQuery.session}</div>}
            <button onClick={fetchAll} disabled={!canFetch}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono font-bold text-sm transition-all ${canFetch?'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50':'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}>
              {isFetching ? <><RefreshCw className="w-4 h-4 animate-spin" />LOADING…</> : <><Search className="w-4 h-4" />FETCH TELEMETRY</>}
            </button>
          </div>

          {!canFetch && !loading && (
            <div className="mb-6 text-xs text-zinc-700 font-mono text-center py-2">
              {!year&&'Select a year'}{year&&!meeting&&' → Select a Grand Prix'}{year&&meeting&&!driverCode&&' → Select a driver'}{year&&meeting&&driverCode&&!sessionInfo&&' → Loading session…'}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-950/20 border border-red-900/40 rounded-xl p-4">
              <div className="text-red-400 font-mono font-bold text-sm">⚠ {error}</div>
            </div>
          )}

          {/* ── DATA SECTION ── */}
          {(telemetry.length > 0 || driverLaps.length > 0 || loadingTelemetry || loadingSectors) && (
            <div className="space-y-4">

              {/* Stats — show immediately from lap data, upgrade values once telemetry loads */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard accent label="Top Speed"
                    value={stats.maxSpeed != null ? `${stats.maxSpeed} km/h` : loadingTelemetry ? '…' : '—'}
                    icon={<Zap className="w-4 h-4 text-red-500" />}
                    sub={stats.fromLaps ? 'Fastest lap' : 'Selected lap'}
                  />
                  <StatCard label="Avg Speed"
                    value={stats.avgSpeed != null ? `${stats.avgSpeed} km/h` : loadingTelemetry ? '…' : '—'}
                    icon={<Gauge className="w-4 h-4 text-yellow-500" />}
                    sub={stats.fromLaps ? 'Loading…' : undefined}
                  />
                  <StatCard label="Max RPM"
                    value={stats.maxRpm != null ? stats.maxRpm.toLocaleString() : loadingTelemetry ? '…' : '—'}
                    icon={<Activity className="w-4 h-4 text-blue-500" />}
                    sub={stats.fromLaps ? 'Loading…' : undefined}
                  />
                  <StatCard label="Total Laps"
                    value={stats.points.toLocaleString()}
                    icon={<Cpu className="w-4 h-4 text-green-500" />}
                    sub={stats.fromLaps ? 'Laps' : 'Data points · ~3.7 Hz'}
                  />
                </div>
              )}

              {/* Lap info strip */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 flex flex-wrap items-center gap-x-8 gap-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {driverLaps.length > 0 && (
                    <LapSelector 
                      laps={driverLaps} 
                      selectedLap={selectedLap} 
                      onSelect={handleLapChange} 
                      fastestLapNumber={fastestLapNumber} 
                      color={color} 
                      label={driverCode} 
                    />
                  )}
                </div>
                {fastestLap && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <div className="text-xs font-mono">
                      <span className="text-zinc-600 uppercase mr-2">Time</span>
                      <span className="text-white font-black">{formatTime(fastestLap.lap_duration)}</span>
                    </div>
                    {[1,2,3].map(s => fastestLap[`sector_${s}`] ? (
                      <div key={s} className="text-xs font-mono">
                        <span className="text-zinc-600 mr-1">S{s}</span>
                        <span className="text-zinc-300">{fastestLap[`sector_${s}`].toFixed(3)}s</span>
                      </div>
                    ) : null)}
                  </div>
                )}
                {weather && (
                  <div className="flex gap-4 ml-auto">
                    {weather.air_temp   != null && <div className="text-xs font-mono"><span className="text-zinc-600">Air </span><span className="text-zinc-300">{weather.air_temp}°C</span></div>}
                    {weather.track_temp != null && <div className="text-xs font-mono"><span className="text-zinc-600">Track </span><span className="text-zinc-300">{weather.track_temp}°C</span></div>}
                  </div>
                )}
              </div>

              {/* Telemetry chart - solo single lap */}
              {loadingTelemetry ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
                  <div className="h-4 bg-zinc-800 rounded w-1/4 mb-4" />
                  <div className="h-56 bg-zinc-800/50 rounded-lg" />
                </div>
              ) : telemetry.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-[10px] text-zinc-600 font-mono flex items-center gap-2">
                      <span style={{ color }}>● {driverCode}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {['speed','rpm','gear','inputs'].map(t => (
                      <button key={t} onClick={() => setActiveTab(t)}
                        className={`px-3 py-1 text-xs rounded-lg font-mono transition-all ${activeTab===t?'bg-red-600 text-white':'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <TelemetryChart
                  data={telemetry}
                  code={driverCode}
                  color={color}
                  tab={activeTab}
                />
              </div>
              )}

              {/* Race progression — loads as soon as JSON is ready (before telemetry) */}
              {sessionType === 'R' && (
                loadingResults ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
                    <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4" />
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-8 bg-zinc-800/50 rounded mb-1" />
                    ))}
                  </div>
                ) : raceResults && raceResults.length > 0 && (
                  <QualifyingToRaceProgression
                    raceResults={raceResults}
                    qualiResults={qualiResults}
                    year={year}
                    grandPrix={meeting?.meeting_name}
                    driverStandings={null}
                  />
                )
              )}

              {sessionType !== 'R' && (
                loadingSectors ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
                    <div className="h-3 bg-zinc-800 rounded w-1/3 mb-4" />
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-8 bg-zinc-800/50 rounded mb-1" />
                    ))}
                  </div>
                ) : sectorsData && (
                  <div className="grid grid-cols-1 gap-4">
                    <SectorTable sectorsData={sectorsData} highlightCode={driverCode} />
                  </div>
                )
              )}

              {sessionType === 'R' && !raceResults && !loadingResults && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                  <p className="text-zinc-500 font-mono text-sm">No race results available for this session</p>
                </div>
              )}
            </div>
          )}

          {!isFetching && !error && !telemetry.length && !driverLaps.length && (
            <div className="text-center py-28 border border-zinc-900 rounded-xl">
              <Radio className="w-10 h-10 mx-auto mb-4 text-zinc-800" />
              <div className="text-xl font-black font-mono text-zinc-700 mb-2">NO DATA LOADED</div>
              <div className="text-sm font-mono text-zinc-800">Year → Grand Prix → Session → Driver → FETCH</div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-zinc-900 pt-4 text-xs text-zinc-800 font-mono">
            <span>OpenF1 API · openf1.org · 2023–2025</span>
            <span>{meeting?.meeting_name||'—'} · {driverCode||'—'} · {sessionType} · {year||'—'}</span>
            <span>{telemetry.length ? `${telemetry.length} pts` : 'No data'}</span>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}