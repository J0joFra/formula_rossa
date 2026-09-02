'use client';
/**
 * components/livetiming/Charts.jsx
 * Grafici del Live Timing: telemetria, settori, posizioni in gara,
 * griglia → arrivo e progressione delle qualifiche.
 *
 * Erano 807 righe dentro pages/live-timing.jsx, che superava le 1.700.
 * Comportamento invariato.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';

export function TelemetryChart({ data, code, color, tab }) {
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
            <div className="text-[9px] text-white/35 font-mono mb-0.5 uppercase tracking-widest">{name}</div>
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
                <div className="text-white/35 mb-1">{kmFmt(label)}</div>
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
export function SectorTable({ sectorsData, highlightCode }) {
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
      <span className="text-white/35 font-mono text-sm tracking-widest uppercase">Loading sector data…</span>
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
            <span className="text-[10px] text-white/35 font-mono tracking-widest uppercase">Lap</span>
            <div className="relative">
              <button onClick={() => setOpenFilter(v => !v)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-mono border transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <span className={lapFilter == null ? 'text-purple-400 font-bold' : 'text-white'}>
                  {lapFilter == null ? '★ Best' : `Lap ${lapFilter}`}
                </span>
                <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${openFilter ? 'rotate-180' : ''}`} />
              </button>
              {openFilter && (
                <div className="absolute top-full right-0 mt-1 rounded-xl z-50 w-40 max-h-52 overflow-y-auto shadow-2xl"
                     style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <button onClick={() => { setLapFilter(null); setOpenFilter(false); }}
                    className={`w-full px-3 py-2 text-left text-xs font-mono hover:bg-white/5 transition-colors ${lapFilter == null ? 'text-purple-400 font-bold' : 'text-white/70'}`}>
                    ★ Best lap each
                  </button>
                  {allLapNumbers.map(n => (
                    <button key={n} onClick={() => { setLapFilter(n); setOpenFilter(false); }}
                      className={`w-full px-3 py-2 text-left text-xs font-mono hover:bg-white/5 transition-colors ${lapFilter === n ? 'bg-white/8 text-white' : 'text-white/70'}`}>
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
                {bestDriver && <div className="text-[9px] text-white/35 font-mono mt-0.5">{bestDriver.code}</div>}
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
                  <th key={h} className={`py-2.5 px-2 whitespace-nowrap text-[10px] tracking-[0.15em] font-normal text-white/35 uppercase ${align === 'left' ? 'text-left' : 'text-right'}`}>
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
                      <span className="text-white/35 font-mono text-[10px]">{i + 1}</span>
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
                      <span className={`text-[11px] ${d.isBest ? 'text-purple-400 font-bold' : 'text-white/50'}`}>
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
                        <span className={`text-[11px] font-bold ${d[k] === best ? '' : 'text-white/80'}`}
                          style={d[k] === best ? { color: sc } : {}}>
                          {d[k]?.toFixed(3) ?? '—'}
                        </span>
                      </td>
                    ))}

                    {/* ΔS1, ΔS2, ΔS3 */}
                    {[dS1, dS2, dS3].map((delta, di) => (
                      <td key={di} className="py-2 px-2 text-right">
                        <span className={`text-[10px] font-mono ${delta === 0 ? 'text-white/35' : delta < 0 ? 'text-green-400' : 'text-red-400'}`}>
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
export function RacePositionsChart({ positionsData, highlightCodes }) {
  if (!positionsData?.byLap?.length) return null;
  const { byLap, driverCodes, drivers } = positionsData;
  const colorMap = {};
  driverCodes.forEach((code, i) => {
    const info = drivers.find(d => d.name_acronym === code);
    colorMap[code] = info?.team_colour ? `#${info.team_colour}` : FALLBACK_COLORS[i % FALLBACK_COLORS.length];
  });
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="text-[10px] text-white/35 font-mono tracking-[0.15em] uppercase mb-4">Race Positions</div>
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
export const TEAM_COLORS = {
  'ferrari':'#F91536','mercedes':'#6CD3BF','red-bull':'#3671C6','mclaren':'#F58020',
  'aston-martin':'#2D826D','alpine':'#2090D0','williams':'#64C4FF','rb':'#6692FF',
  'haas':'#B6BABD','kick-sauber':'#52E252','sauber':'#006F62','bmw-sauber':'#1B3C8C',
  'alfa-romeo':'#9B0000','renault':'#FFD800','lotus':'#005A2C','brawn':'#B7E000',
  'toyota':'#CC0000','toro-rosso':'#1E5BC6','force-india':'#FF5F00','jordan':'#FFD800',
  'arrows':'#FF6600','minardi':'#1a1a1a','hrt':'#B30000','caterham':'#005030',
  'marussia':'#9B0000','manor':'#003A8F','super-aguri':'#CCCCCC','spyker':'#FF6600',
  'default':'#888888',
};

// ── Grid→Race inner chart ──
/**
 * Dalla griglia all'arrivo.
 *
 * Nato dentro il Live Timing, che è una pagina nera: i colori erano scritti a
 * mano su quel fondo (`text-white/35`, `#3f3f46`, riquadri su `rgba(0,0,0,.35)`).
 * Riusato nella scheda GP, che segue il tema del sito, quei valori diventavano
 * bianco su bianco — i filtri sembravano vuoti e le intestazioni delle due
 * colonne sparivano nel grigio.
 *
 * Ora i colori arrivano dai token del tema. Il Live Timing, che resta nero a
 * prescindere dal tema scelto, passa `dark` e si porta dietro la sua tavolozza.
 */
const PALETTE_DARK = {
  '--gtr-text':    '#fafafa',
  '--gtr-muted':   'rgba(255,255,255,0.62)',
  '--gtr-faint':   'rgba(255,255,255,0.38)',
  '--gtr-dim':     'rgba(255,255,255,0.16)',
  '--gtr-surface': 'rgba(255,255,255,0.05)',
  '--gtr-well':    'rgba(0,0,0,0.35)',
  '--gtr-band':    'rgba(255,255,255,0.03)',
  '--gtr-border':  'rgba(255,255,255,0.10)',
  '--gtr-up':      '#22c55e',
  '--gtr-down':    '#ef4444',
  '--gtr-flat':    'rgba(255,255,255,0.45)',
  '--gtr-tip-bg':  '#0d0d0d',
};

const PALETTE_SITE = {
  '--gtr-text':    'var(--fr-text)',
  '--gtr-muted':   'var(--fr-text-muted)',
  '--gtr-faint':   'var(--fr-text-faint)',
  '--gtr-dim':     'var(--fr-text-dim)',
  '--gtr-surface': 'var(--fr-surface-2)',
  '--gtr-well':    'var(--fr-surface-3)',
  '--gtr-band':    'var(--fr-overlay)',
  '--gtr-border':  'var(--fr-border)',
  '--gtr-up':      'var(--fr-success)',
  '--gtr-down':    'var(--fr-danger)',
  '--gtr-flat':    'var(--fr-text-faint)',
  '--gtr-tip-bg':  'var(--fr-surface)',
};

/**
 * Sigla di tre lettere del pilota.
 *
 * Prima si prendeva l'ultimo pezzo dell'id, che per i suffissi dà la sigla
 * sbagliata: `carlos-sainz-jr` diventava "JR" e `nyck-de-vries` "VRI". Il
 * cognome è tutto ciò che sta fra il nome e l'eventuale suffisso.
 */
const SUFFISSI = new Set(['jr', 'sr', 'ii', 'iii']);

function siglaPilota(driverId, nomeCompleto) {
  if (nomeCompleto) {
    const cognome = nomeCompleto.trim().split(/\s+/).slice(1).join('') || nomeCompleto;
    if (cognome.length >= 3) return cognome.toUpperCase().slice(0, 3);
  }
  const parti = (driverId || '').split('-').filter(p => !SUFFISSI.has(p));
  const cognome = parti.slice(1).join('') || parti[0] || '';
  return cognome.toUpperCase().slice(0, 3) || '???';
}

export function GridToRaceChart({ raceResults, year, grandPrix, driverNames, dark = false }) {
  const [highlight, setHighlight] = React.useState(null);
  const [filter, setFilter]       = React.useState('all');

  const drivers = React.useMemo(() => {
    if (!raceResults?.length) return [];
    return raceResults
      .filter(r => r.gridPositionNumber && r.positionNumber)
      .map(r => {
        const gain = (r.gridPositionNumber || 0) - (r.positionNumber || 0);
        return {
          id: r.driverId,
          code: siglaPilota(r.driverId, driverNames?.[r.driverId]),
          name: driverNames?.[r.driverId] || null,
          constructorId: r.constructorId || 'default',
          color: TEAM_COLORS[r.constructorId] || TEAM_COLORS.default,
          gridPos: r.gridPositionNumber,
          racePos: r.positionNumber,
          gain,
          gainCategory: gain > 0 ? 'gained' : gain < 0 ? 'lost' : 'same',
          points: r.points || 0,
        };
      });
  }, [raceResults, driverNames]);

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

  const vars = dark ? PALETTE_DARK : PALETTE_SITE;

  if (!drivers.length) return (
    <div
      style={vars}
      className="flex items-center justify-center h-32 text-sm text-[var(--gtr-faint)]"
    >
      Nessun dato di griglia per questa gara.
    </div>
  );

  const ROW_H = 32, SVG_W = 960;
  const SVG_H = Math.max(byGrid.length, byRace.length) * ROW_H + 72;
  const LX = 230, RX = 730;
  const gridY = {}, raceY = {};
  byGrid.forEach((d,i) => { gridY[d.id] = 54 + i * ROW_H; });
  byRace.forEach((d,i) => { raceY[d.id] = 54 + i * ROW_H; });

  /* Il colore di guadagno/perdita segue il tema come tutto il resto: prima
     `getGainColor` restituiva due verdi e rossi fissi, illeggibili sul chiaro. */
  const gainColor = (g) =>
    g > 0 ? 'var(--gtr-up)' : g < 0 ? 'var(--gtr-down)' : 'var(--gtr-flat)';

  const FILTERS = [
    { key:'all',    label:`Tutti · ${drivers.length}`,     on:'border-[var(--gtr-border)] bg-[var(--gtr-surface)] text-[var(--gtr-text)]' },
    { key:'gained', label:`▲ Guadagnate · ${stats.gained}`, on:'border-[var(--gtr-up)] bg-[var(--gtr-up)]/10 text-[var(--gtr-up)]' },
    { key:'lost',   label:`▼ Perse · ${stats.lost}`,        on:'border-[var(--gtr-down)] bg-[var(--gtr-down)]/10 text-[var(--gtr-down)]' },
    { key:'same',   label:`● Invariate · ${stats.same}`,    on:'border-[var(--gtr-border)] bg-[var(--gtr-surface)] text-[var(--gtr-muted)]' },
  ];

  const TILES = [
    { label:'Guadagnate', value:`+${stats.gained}`, color:'var(--gtr-up)' },
    { label:'Perse',      value:stats.lost,          color:'var(--gtr-down)' },
    { label:'Miglior rimonta', value: stats.maxD?.gain > 0 ? `${stats.maxD.code} +${stats.maxD.gain}` : '—', color:'var(--gtr-up)' },
    { label:'Peggior calo',    value: stats.minD?.gain < 0 ? `${stats.minD.code} ${stats.minD.gain}` : '—', color:'var(--gtr-down)' },
  ];

  return (
    <div className="space-y-6" style={vars}>
      <div role="group" aria-label="Filtra i piloti" className="flex flex-wrap gap-2">
        {FILTERS.map(({key,label,on}) => (
          <button key={key} type="button" onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-colors ${
              filter === key
                ? on
                : 'border-[var(--gtr-border)] text-[var(--gtr-muted)] hover:text-[var(--gtr-text)] hover:bg-[var(--gtr-surface)]'
            }`}>{label}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TILES.map(({label,value,color}) => (
          <div key={label} className="rounded-xl px-4 py-3 bg-[var(--gtr-surface)] border border-[var(--gtr-border)]">
            <div className="text-[10px] text-[var(--gtr-muted)] tracking-[0.14em] uppercase mb-1">{label}</div>
            <div className="text-2xl font-black tabular-nums leading-none" style={{color}}>{value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl bg-[var(--gtr-well)] border border-[var(--gtr-border)]">
        <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{minWidth:500,display:'block'}}
          role="img"
          aria-label={`Posizioni dalla griglia all'arrivo${grandPrix ? `: ${grandPrix}` : ''}${year ? ` ${year}` : ''}`}>
          <rect x={0}     y={0} width={LX+30}         height={SVG_H} fill="var(--gtr-band)" />
          <rect x={RX-30} y={0} width={SVG_W-(RX-30)} height={SVG_H} fill="var(--gtr-band)" />
          <text x={LX/2+15}         y={28} textAnchor="middle" fill="var(--gtr-muted)" fontSize={11} fontWeight={700} letterSpacing="4">GRIGLIA</text>
          <text x={(SVG_W+RX)/2-15} y={28} textAnchor="middle" fill="var(--gtr-muted)" fontSize={11} fontWeight={700} letterSpacing="4">ARRIVO</text>
          <line x1={LX} y1={36} x2={LX} y2={SVG_H-8} stroke="var(--gtr-dim)" strokeWidth={1} strokeDasharray="3 6"/>
          <line x1={RX} y1={36} x2={RX} y2={SVG_H-8} stroke="var(--gtr-dim)" strokeWidth={1} strokeDasharray="3 6"/>
          {byGrid.map((d,i) => i%2===0 && (
            <rect key={`z-${d.id}`} x={LX+1} y={gridY[d.id]-ROW_H/2} width={RX-LX-2} height={ROW_H} fill="var(--gtr-band)"/>
          ))}
          {[false,true].map(hlPass =>
            filtered.map(d => {
              const y1=gridY[d.id], y2=raceY[d.id];
              if(y1==null||y2==null) return null;
              const isHL=highlight===d.id;
              if(hlPass!==isHL) return null;
              const dimmed=highlight&&!isHL;
              const opacity=dimmed?0.12:1, sw=isHL?9:7;
              const cx1=LX+(RX-LX)*0.35, cx2=LX+(RX-LX)*0.65;
              const path=`M ${LX} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${RX} ${y2}`;
              return (
                <g key={d.id}>
                  <path d={path} fill="none" stroke="transparent" strokeWidth={22} style={{cursor:'pointer'}}
                    onMouseEnter={()=>setHighlight(d.id)} onMouseLeave={()=>setHighlight(null)}/>
                  {isHL&&<path d={path} fill="none" stroke={d.color} strokeWidth={16} opacity={0.15} strokeLinecap="round"/>}
                  <path d={path} fill="none" stroke={d.color} strokeWidth={sw} opacity={opacity} strokeLinecap="round"/>
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
                <title>{`${d.name || d.code} — partito P${d.gridPos}, arrivato P${d.racePos}`}</title>
                {isHL&&<rect x={6} y={y-14} width={LX-16} height={28} rx={5} fill={d.color} fillOpacity={0.12}/>}
                <text x={36} y={y+5} textAnchor="middle" fontSize={isHL?11:10} fontWeight={700}
                  fill={isHL?d.color:'var(--gtr-faint)'} opacity={dim?0.45:1}>P{d.gridPos}</text>
                <text x={LX-14} y={y+5} textAnchor="end" fontSize={isHL?15:13} fontWeight={isHL?900:700}
                  fill="var(--gtr-text)" opacity={dim?0.35:1}>{d.code}</text>
              </g>
            );
          })}
          {byRace.map(d => {
            const y=raceY[d.id],isHL=highlight===d.id,dim=highlight&&!isHL;
            return (
              <g key={`R-${d.id}`} onMouseEnter={()=>setHighlight(d.id)} onMouseLeave={()=>setHighlight(null)} style={{cursor:'pointer'}}>
                <title>{`${d.name || d.code} — partito P${d.gridPos}, arrivato P${d.racePos}`}</title>
                {isHL&&<rect x={RX+16} y={y-14} width={SVG_W-RX-22} height={28} rx={5} fill={d.color} fillOpacity={0.12}/>}
                <text x={RX+16} y={y+5} textAnchor="start" fontSize={isHL?15:13} fontWeight={isHL?900:700}
                  fill="var(--gtr-text)" opacity={dim?0.35:1}>{d.code}</text>
                <text x={SVG_W-10} y={y+5} textAnchor="end" fontSize={isHL?11:10} fontWeight={700}
                  fill={isHL?gainColor(d.gain):'var(--gtr-faint)'} opacity={dim?0.45:1}>
                  {isHL&&d.gain!==0?(d.gain>0?`▲+${d.gain}`:`▼${d.gain}`):`P${d.racePos}`}
                </text>
              </g>
            );
          })}
          {highlight&&(()=>{
            const d=filtered.find(x=>x.id===highlight);
            if(!d) return null;
            const gy=gridY[d.id]??0,ry=raceY[d.id]??0;
            const midY=Math.min(Math.max((gy+ry)/2,55),SVG_H-75),midX=(LX+RX)/2,tw=200;
            return (
              <g pointerEvents="none">
                <rect x={midX-tw/2} y={midY-42} width={tw} height={78} rx={10}
                  fill="var(--gtr-tip-bg)" stroke={d.color} strokeWidth={1.5} strokeOpacity={0.8}/>
                <rect x={midX-tw/2} y={midY-42} width={4} height={78} rx={3} fill={d.color}/>
                <circle cx={midX-tw/2+20} cy={midY-18} r={4} fill={d.color}/>
                <text x={midX-tw/2+32} y={midY-14} textAnchor="start" fill="var(--gtr-text)" fontSize={15} fontWeight={900}>{d.code}</text>
                <text x={midX-tw/2+12} y={midY+2} textAnchor="start" fill="var(--gtr-muted)" fontSize={10}>
                  Griglia P{d.gridPos} → Arrivo P{d.racePos}
                </text>
                <text x={midX} y={midY+22} textAnchor="middle" fill={gainColor(d.gain)} fontSize={13} fontWeight={900}>
                  {d.gain>0?`▲ +${d.gain} posizioni`:d.gain<0?`▼ ${d.gain} posizioni`:'● nessun cambio'}
                </text>
                {d.points>0&&<text x={midX} y={midY+34} textAnchor="middle" fill="var(--gtr-faint)" fontSize={9}>{d.points} punti</text>}
              </g>
            );
          })()}
        </svg>
      </div>

      <p className="text-xs text-[var(--gtr-muted)]">
        Ogni linea è un pilota, colorata come la sua scuderia: a sinistra la posizione di
        partenza, a destra quella d&apos;arrivo. Passa il mouse — o tocca — per isolarne una.
      </p>
    </div>
  );
}

// ── Q1→Q2→Q3 inner chart ──
export function QualiProgressionChart({ qualiResults, year }) {
  const [highlight, setHighlight] = React.useState(null);

  // 2026: 22 drivers, Q1 eliminates 6 (→16 advance), Q2 eliminates 6 (→10 advance)
  // Pre-2026: 20 drivers, Q1 eliminates 5 (→15 advance), Q2 eliminates 5 (→10 advance)
  const is2026Plus = parseInt(year) >= 2026;
  const Q1_ADVANCE = is2026Plus ? 16 : 15;  // drivers advancing from Q1
  const Q2_ADVANCE = 10;                     // always 10 for Q3

  const drivers = React.useMemo(() => {
    if (!qualiResults?.length) return [];
    // First pass: determine who advances based on actual data
    const all = qualiResults.map(r => {
      const parts = (r.driverId || '').split('-');
      const code  = parts[parts.length - 1].toUpperCase().substring(0, 3);
      return {
        id: r.driverId, code,
        color: TEAM_COLORS[r.constructorId] || TEAM_COLORS.default,
        q1pos: r.q1pos ?? null, q1t: r.q1Millis ?? null,
        q2pos: r.q2pos ?? null, q2t: r.q2Millis ?? null,
        q3pos: r.q3pos ?? null, q3t: r.q3Millis ?? null,
      };
    });
    // If q2/q3 data not present from DB, infer from Q1 times who advanced
    const hasQ2Data = all.some(d => d.q2t != null || d.q2pos != null);
    const hasQ3Data = all.some(d => d.q3t != null || d.q3pos != null);
    if (!hasQ2Data) {
      const q1sorted = [...all].filter(d=>d.q1t!=null).sort((a,b)=>a.q1t-b.q1t);
      q1sorted.slice(0, Q1_ADVANCE).forEach((d,i)=>{ d.q2pos=i+1; d.q2t=d.q1t; });
    }
    if (!hasQ3Data) {
      const q2sorted = [...all].filter(d=>d.q2t!=null).sort((a,b)=>a.q2t-b.q2t);
      q2sorted.slice(0, Q2_ADVANCE).forEach((d,i)=>{ d.q3pos=i+1; d.q3t=d.q2t; });
    }
    return all.map(d => ({
      ...d,
      eliminatedAfter: d.q3pos != null ? null : d.q2pos != null ? 'Q2' : 'Q1',
    }));
  }, [qualiResults, Q1_ADVANCE, Q2_ADVANCE]);

  if (!drivers.length) return (
    <div className="flex items-center justify-center h-32 text-white/35 font-mono text-sm tracking-widest uppercase">
      No qualifying data available
    </div>
  );

  const ROW_H=30, SVG_W=960, PAD=54;
  // Sort each round by lap time (fastest at top = P1), fallback to position
  const q1s=[...drivers].filter(d=>d.q1t!=null||d.q1pos!=null).sort((a,b)=>(a.q1t??Infinity)-(b.q1t??Infinity)||(a.q1pos??99)-(b.q1pos??99));
  const q2s=[...drivers].filter(d=>d.q2t!=null||d.q2pos!=null).sort((a,b)=>(a.q2t??Infinity)-(b.q2t??Infinity)||(a.q2pos??99)-(b.q2pos??99));
  const q3s=[...drivers].filter(d=>d.q3t!=null||d.q3pos!=null).sort((a,b)=>(a.q3t??Infinity)-(b.q3t??Infinity)||(a.q3pos??99)-(b.q3pos??99));
  // Re-assign visual rank (1 = fastest)
  q1s.forEach((d,i)=>{ d.q1rank=i+1; });
  q2s.forEach((d,i)=>{ d.q2rank=i+1; });
  q3s.forEach((d,i)=>{ d.q3rank=i+1; });
  const N=Math.max(q1s.length,q2s.length,q3s.length,15);
  const SVG_H=N*ROW_H+PAD+24;
  const COLS=[200,480,760];
  const COL_COLORS=['#6366f1','#f59e0b','#ef4444'];
  const makeY=(sorted)=>{ const m={}; sorted.forEach((d,i)=>{m[d.id]=PAD+i*ROW_H;}); return m; };
  const y1=makeY(q1s), y2=makeY(q2s), y3=makeY(q3s);
  const getY=(d,ri)=>ri===0?y1[d.id]:ri===1?y2[d.id]:y3[d.id];
  const hasR=(d,ri)=>ri===0?(d.q1t!=null||d.q1pos!=null):ri===1?(d.q2t!=null||d.q2pos!=null):(d.q3t!=null||d.q3pos!=null);
  const getRank=(d,ri)=>ri===0?d.q1rank:ri===1?d.q2rank:d.q3rank;
  const fmtT=(ms)=>ms==null?'—':`${Math.floor(ms/60000)}:${((ms%60000)/1000).toFixed(3).padStart(6,'0')}`;

  const q1elim = q1s.length - q2s.length;
  const q2elim = q2s.length - q3s.length;

  return (
    <div className="space-y-6">
      {/* 2026 format notice */}
      {is2026Plus && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-mono text-indigo-300"
             style={{background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.2)'}}>
          <span className="text-indigo-400">ℹ</span>
          <span className="text-white/50">2026 Format: 22 drivers · Q1 eliminates 6 → Q2 eliminates 6 → 10 in Q3</span>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        {[
          {label:`Q1  –${q1elim} elim.`, value:q1s.length,  color:COL_COLORS[0], bg:'rgba(99,102,241,0.08)', border:'rgba(99,102,241,0.2)'},
          {label:`Q2  –${q2elim} elim.`, value:q2s.length,  color:COL_COLORS[1], bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.2)'},
          {label:'Q3  Pole shoot-out',   value:q3s.length,  color:COL_COLORS[2], bg:'rgba(239,68,68,0.08)',  border:'rgba(239,68,68,0.2)'},
        ].map(({label,value,color,bg,border})=>(
          <div key={label} className="rounded-xl px-4 py-3" style={{background:bg,border:`1px solid ${border}`}}>
            <div className="text-[9px] font-mono tracking-[0.2em] uppercase mb-1" style={{color:`${color}99`}}>{label}</div>
            <div className="text-3xl font-black font-mono leading-none" style={{color}}>{value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl" style={{background:'rgba(0,0,0,0.35)',border:'1px solid rgba(255,255,255,0.05)'}}>
        <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{minWidth:500,display:'block'}}>
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
          {/* Curves — direct color stroke, no gradient (gradients break on horizontal lines) */}
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
                      <path d={path} fill="none" stroke={d.color} strokeWidth={sw} opacity={opacity} strokeLinecap="round"/>
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
          {/* Left labels — Q1, sorted by time */}
          {q1s.map(d=>{
            const y_=y1[d.id],isHL=highlight===d.id,dim=highlight&&!isHL;
            return (
              <g key={`ql-${d.id}`} onMouseEnter={()=>setHighlight(d.id)} onMouseLeave={()=>setHighlight(null)} style={{cursor:'pointer'}}>
                {isHL&&<rect x={6} y={y_-14} width={COLS[0]-16} height={28} rx={5} fill={d.color} fillOpacity={0.12}/>}
                <text x={32} y={y_+5} textAnchor="middle" fontSize={dim?9:isHL?11:10} fontWeight={700} fontFamily="monospace" fill={dim?'#2a2a2a':isHL?d.color:'#4b4b4b'}>P{d.q1rank}</text>
                <text x={COLS[0]-12} y={y_+5} textAnchor="end" fontSize={dim?11:isHL?15:13} fontWeight={isHL?900:700} fontFamily="monospace" fill={dim?'#252525':isHL?'#ffffff':'#e0e0e0'}>{d.code}</text>
              </g>
            );
          })}
          {/* Right labels */}
          {(q3s.length>0?q3s:q2s).map(d=>{
            const ymap=q3s.length>0?y3:y2;
            const y_=ymap[d.id],pos=q3s.length>0?d.q3rank:d.q2rank;
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
        <span className="text-[9px] text-white/25 font-mono tracking-[0.3em] uppercase">Legend</span>
        {[{color:COL_COLORS[0],label:'Q1'},{color:COL_COLORS[1],label:'Q2'},{color:COL_COLORS[2],label:'Q3'}].map(({color,label})=>(
          <span key={label} className="flex items-center gap-2 text-[11px] text-white/50 font-mono">
            <span className="inline-block w-3 h-3 rounded-full" style={{background:color,opacity:0.6}}/>{label}
          </span>
        ))}
        <span className="flex items-center gap-2 text-[11px] text-white/50 font-mono">
          <span style={{color:'#555',fontSize:11}}>✕</span> Eliminato
        </span>
        <span className="ml-auto text-[10px] text-white/15 font-mono tracking-widest">HOVER TO HIGHLIGHT</span>
      </div>
    </div>
  );
}

// ── Main exported component ──
export function QualifyingToRaceProgression({ raceResults, qualiResults, year, grandPrix }) {
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
            <p className="text-white/50 font-mono text-xs mt-2 tracking-[0.2em] uppercase">
              {year} · {grandPrix} · {mode==='race'?'Position Gains & Losses':'Qualifying Progression'}
            </p>
          </div>

          {/* Mode switcher */}
          <div className="flex gap-2">
            <button onClick={()=>setMode('race')}
              className={`px-4 py-2.5 rounded-xl text-[11px] font-mono tracking-widest border transition-all duration-200 ${
                mode==='race'?'bg-red-500/15 text-red-400 border-red-500/40':'bg-white/5 text-white/35 border-white/8 hover:text-white/80 hover:bg-white/8'
              }`}>
              🏁 GRID → RACE
            </button>
            <button onClick={()=>setMode('quali')} disabled={!hasQuali}
              className={`px-4 py-2.5 rounded-xl text-[11px] font-mono tracking-widest border transition-all duration-200 ${
                mode==='quali'?'bg-indigo-500/15 text-indigo-400 border-indigo-500/40'
                :hasQuali?'bg-white/5 text-white/35 border-white/8 hover:text-white/80 hover:bg-white/8'
                :'opacity-30 bg-white/3 text-white/15 border-white/5 cursor-not-allowed'
              }`}>
              ⏱ Q1 → Q2 → Q3
            </button>
          </div>
        </div>

        {mode==='race'
          ? <GridToRaceChart raceResults={raceResults} year={year} grandPrix={grandPrix} dark/>
          : <QualiProgressionChart qualiResults={qualiResults} year={year} grandPrix={grandPrix}/>}
      </div>
    </div>
  );
}
