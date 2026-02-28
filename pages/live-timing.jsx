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

// QualifyingToRaceProgression defined inline below

// ─── Constants ────────────────────────────────────────────────────────────────

var SESSION_TYPES = [
  { id: 'FP1', name: 'Practice 1' }, { id: 'FP2', name: 'Practice 2' },
  { id: 'FP3', name: 'Practice 3' }, { id: 'Q',   name: 'Qualifying'  },
  { id: 'R',   name: 'Race'        }, { id: 'S',   name: 'Sprint'      },
  { id: 'SQ',  name: 'Sprint Qualifying' },
];
var AVAILABLE_YEARS = [2025, 2024, 2023];

var CIRCUIT_COUNTRY = {
  monza:'it',imola:'it',mugello:'it',silverstone:'gb',spa:'be',barcelona:'es',
  catalunya:'es',hungaroring:'hu',austria:'at',spielberg:'at',monaco:'mc',
  austin:'us',miami:'us','las vegas':'us',montreal:'ca',villeneuve:'ca',
  interlagos:'br',paulo:'br',rodriguez:'mx',mexico:'mx',suzuka:'jp',shanghai:'cn',
  singapore:'sg','marina bay':'sg',bahrain:'bh',sakhir:'bh',jeddah:'sa',
  'abu dhabi':'ae','yas marina':'ae',melbourne:'au','albert park':'au',
  zandvoort:'nl',lusail:'qa',losail:'qa',qatar:'qa',baku:'az',
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-center h-40">
      <span className="text-zinc-600 font-mono text-sm">Loading sector data…</span>
    </div>
  );

  const leader = tableData[0];
  const bS1 = Math.min(...tableData.map(d => d.s1 ?? Infinity));
  const bS2 = Math.min(...tableData.map(d => d.s2 ?? Infinity));
  const bS3 = Math.min(...tableData.map(d => d.s3 ?? Infinity));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase">
          Sector Times · All Drivers
        </div>
        <div className="flex items-center gap-2" ref={filterRef}>
          <span className="text-[10px] text-zinc-600 font-mono">LAP:</span>
          <div className="relative">
            <button onClick={() => setOpenFilter(v => !v)}
              className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-mono hover:border-zinc-500 transition-colors">
              <span className={lapFilter == null ? 'text-purple-400 font-bold' : 'text-white'}>
                {lapFilter == null ? '★ Best' : `Lap ${lapFilter}`}
              </span>
              <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${openFilter ? 'rotate-180' : ''}`} />
            </button>
            {openFilter && (
              <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl z-50 w-40 max-h-52 overflow-y-auto shadow-2xl">
                <button onClick={() => { setLapFilter(null); setOpenFilter(false); }}
                  className={`w-full px-3 py-2 text-left text-xs font-mono hover:bg-zinc-800 ${lapFilter == null ? 'text-purple-400 font-bold' : 'text-zinc-400'}`}>
                  ★ Best lap each
                </button>
                {allLapNumbers.map(n => (
                  <button key={n} onClick={() => { setLapFilter(n); setOpenFilter(false); }}
                    className={`w-full px-3 py-2 text-left text-xs font-mono hover:bg-zinc-800 ${lapFilter === n ? 'bg-zinc-800/60 text-white' : 'text-zinc-400'}`}>
                    Lap {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-600 font-normal">
              {['P','Driver','Lap','Time','Gap','S1','S2','S3','ΔS1','ΔS2','ΔS3'].map(h => (
                <th key={h} className={`py-1.5 pr-2 whitespace-nowrap ${['P','Driver'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((d, i) => {
              const gap = d.lap_duration - leader.lap_duration;
              const dS1 = (d.s1 ?? 0) - (leader?.s1 ?? 0);
              const dS2 = (d.s2 ?? 0) - (leader?.s2 ?? 0);
              const dS3 = (d.s3 ?? 0) - (leader?.s3 ?? 0);
              const isHL = d.code === highlightCode;
              return (
                <tr key={d.code} className={`border-b border-zinc-900 hover:bg-zinc-800/30 transition-colors ${isHL ? 'bg-zinc-800/50' : ''}`}>
                  <td className="py-1.5 pr-2 text-zinc-500">{i + 1}</td>
                  <td className="py-1.5 pr-2">
                    <span className={isHL ? 'text-white font-bold' : 'font-bold'} style={{ color: isHL ? undefined : d.color }}>{d.code}</span>
                    {isHL && <span className="text-zinc-600 ml-1 text-[9px]">◀</span>}
                  </td>
                  <td className="py-1.5 pr-2 text-right">
                    <span className={d.isBest ? 'text-purple-400' : 'text-zinc-500'}>{d.isBest ? '★' : ''}{d.lap_number}</span>
                  </td>
                  <td className="py-1.5 pr-2 text-right text-white font-bold">{formatTime(d.lap_duration)}</td>
                  <td className="py-1.5 pr-2 text-right">
                    <span className={gap === 0 ? 'text-yellow-400' : 'text-red-400'}>{gap === 0 ? 'LDR' : `+${gap.toFixed(3)}`}</span>
                  </td>
                  {[['s1', bS1], ['s2', bS2], ['s3', bS3]].map(([k, best]) => (
                    <td key={k} className={`py-1.5 pr-2 text-right font-bold ${d[k] === best ? 'text-purple-400' : 'text-zinc-300'}`}>
                      {d[k]?.toFixed(3) ?? '—'}
                    </td>
                  ))}
                  {[dS1, dS2, dS3].map((delta, di) => (
                    <td key={di} className={`py-1.5 pr-2 text-right ${delta === 0 ? 'text-zinc-500' : delta < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {delta === 0 ? 'REF' : formatDelta(delta)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
// ─── QUALIFYING→RACE SLOPE CHART ────────────────────────────────────────────
const TEAM_COLORS = {
  'red-bull':    '#3671C6',
  'mercedes':    '#6CD3BF',
  'ferrari':     '#F91536',
  'mclaren':     '#F58020',
  'aston-martin':'#2D826D',
  'alpine':      '#2090D0',
  'williams':    '#64C4FF',
  'rb':          '#6692FF',
  'haas':        '#B6BABD',
  'kick-sauber': '#52E252',
  'default':     '#888888',
};

function getColor(constructorId, gain) {
  return TEAM_COLORS[constructorId] || TEAM_COLORS.default;
}

function getGainColor(gain) {
  if (gain > 0) return '#22c55e';
  if (gain < 0) return '#ef4444';
  return '#a1a1aa';
}

function QualifyingToRaceProgression({ raceResults, year, grandPrix }) {
  const [highlight, setHighlight] = useState(null);
  const [filter, setFilter]       = useState('all'); // 'all' | 'gained' | 'lost' | 'same'

  const drivers = useMemo(() => {
    if (!raceResults?.length) return [];
    return raceResults
      .filter(r => r.gridPositionNumber && r.positionNumber)
      .map(r => {
        const gain = (r.gridPositionNumber || 0) - (r.positionNumber || 0); // positive = gained
        const driverName = (r.driverId || '')
          .split('-')
          .map(p => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ');
        const lastName = driverName.split(' ').pop();
        const code = (r.driverId || '').split('-').pop().toUpperCase().substring(0, 3);
        return {
          id: r.driverId,
          code,
          lastName,
          constructorId: r.constructorId || 'default',
          color: TEAM_COLORS[r.constructorId] || TEAM_COLORS.default,
          gridPos: r.gridPositionNumber,
          qualPos: r.qualificationPositionNumber || r.gridPositionNumber,
          racePos: r.positionNumber,
          gain,
          gainCategory: gain > 0 ? 'gained' : gain < 0 ? 'lost' : 'same',
          points: r.points || 0,
          laps: r.laps,
          time: r.time || r.gap || '',
        };
      });
  }, [raceResults]);

  const filteredDrivers = useMemo(() => {
    if (filter === 'all') return drivers;
    return drivers.filter(d => d.gainCategory === filter);
  }, [drivers, filter]);

  // Sorted by grid position (left column) and race position (right column)
  const byGrid = useMemo(() =>
    [...filteredDrivers].sort((a, b) => a.gridPos - b.gridPos),
    [filteredDrivers]
  );
  const byRace = useMemo(() =>
    [...filteredDrivers].sort((a, b) => a.racePos - b.racePos),
    [filteredDrivers]
  );

  const stats = useMemo(() => {
    const gained = drivers.filter(d => d.gain > 0).length;
    const lost   = drivers.filter(d => d.gain < 0).length;
    const same   = drivers.filter(d => d.gain === 0).length;
    const max    = drivers.reduce((a, b) => b.gain > a.gain ? b : a, drivers[0] || {});
    const min    = drivers.reduce((a, b) => b.gain < a.gain ? b : a, drivers[0] || {});
    return { gained, lost, same, max, min };
  }, [drivers]);

  if (!drivers.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <p className="text-zinc-500 font-mono text-sm">No race results available</p>
      </div>
    );
  }

  // SVG layout
  const ROW_H   = 28;
  const N       = Math.max(byGrid.length, byRace.length);
  const SVG_H   = Math.max(N * ROW_H + 40, 200);
  const SVG_W   = 900;
  const LEFT_X  = 200;  // x of left column (grid) dots
  const RIGHT_X = 700;  // x of right column (race) dots
  const LABEL_LEFT  = LEFT_X - 10;
  const LABEL_RIGHT = RIGHT_X + 10;

  // Map position → Y coordinate
  const gridYMap = {};
  byGrid.forEach((d, i) => { gridYMap[d.id] = 24 + i * ROW_H; });
  const raceYMap = {};
  byRace.forEach((d, i) => { raceYMap[d.id] = 24 + i * ROW_H; });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between mb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            QUALIFYING → RACE <span className="text-red-600">PROGRESSION</span>
          </h2>
          <p className="text-xs text-zinc-600 font-mono mt-1">
            {year} {grandPrix} · Grid vs Race finish
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            ['all',    'All',    null],
            ['gained', 'Gained', <TrendingUp  key="g" className="w-3 h-3" />],
            ['lost',   'Lost',   <TrendingDown key="l" className="w-3 h-3" />],
            ['same',   'Same',   <Minus       key="s" className="w-3 h-3" />],
          ].map(([key, label, icon]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all border ${
                filter === key
                  ? key === 'gained' ? 'bg-green-600/20 text-green-400 border-green-800'
                  : key === 'lost'   ? 'bg-red-600/20 text-red-400 border-red-800'
                  : key === 'same'   ? 'bg-yellow-600/20 text-yellow-400 border-yellow-800'
                  : 'bg-zinc-700 text-white border-zinc-600'
                  : 'bg-zinc-800 text-zinc-500 border-transparent hover:text-zinc-300'
              }`}>
              {icon}{label}
              {key !== 'all' && <span className="ml-1 opacity-60">({stats[key] ?? drivers.length})</span>}
              {key === 'all' && <span className="ml-1 opacity-60">({drivers.length})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <div className="bg-zinc-800/50 rounded-lg px-3 py-2">
          <div className="text-[10px] text-zinc-600 font-mono">GAINED</div>
          <div className="text-lg font-black text-green-400">{stats.gained}</div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg px-3 py-2">
          <div className="text-[10px] text-zinc-600 font-mono">LOST</div>
          <div className="text-lg font-black text-red-400">{stats.lost}</div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg px-3 py-2">
          <div className="text-[10px] text-zinc-600 font-mono">BIGGEST GAINER</div>
          <div className="text-lg font-black text-green-400">
            {stats.max?.code} <span className="text-sm">+{stats.max?.gain}</span>
          </div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg px-3 py-2">
          <div className="text-[10px] text-zinc-600 font-mono">BIGGEST LOSER</div>
          <div className="text-lg font-black text-red-400">
            {stats.min?.code} <span className="text-sm">{stats.min?.gain}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-4 text-[10px] font-mono text-zinc-500">
        <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-green-500 inline-block rounded" /> Gained positions</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-red-500 inline-block rounded" /> Lost positions</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-zinc-500 inline-block rounded" /> No change</span>
      </div>

      {/* Slope chart */}
      <div className="overflow-x-auto">
        <svg
          width="100%"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ minWidth: 520 }}
        >
          {/* Column headers */}
          <text x={LEFT_X}  y={10} textAnchor="middle" fill="#52525b" fontSize={10} fontFamily="monospace" letterSpacing={2}>GRID</text>
          <text x={RIGHT_X} y={10} textAnchor="middle" fill="#52525b" fontSize={10} fontFamily="monospace" letterSpacing={2}>RACE</text>

          {/* Vertical guide lines */}
          <line x1={LEFT_X}  y1={16} x2={LEFT_X}  y2={SVG_H - 4} stroke="#27272a" strokeWidth={1} />
          <line x1={RIGHT_X} y1={16} x2={RIGHT_X} y2={SVG_H - 4} stroke="#27272a" strokeWidth={1} />

          {/* Connecting curves — draw unhighlighted first, then highlighted on top */}
          {[false, true].map(isHighlightPass =>
            filteredDrivers.map(d => {
              const y1 = gridYMap[d.id];
              const y2 = raceYMap[d.id];
              if (y1 == null || y2 == null) return null;
              const isHL = highlight === d.id;
              if (isHighlightPass !== isHL) return null;

              const color = getGainColor(d.gain);
              const opacity = highlight && !isHL ? 0.06 : isHL ? 1 : 0.55;
              const strokeW = isHL ? 3 : 1.5;

              // Cubic bezier: control points at 40% and 60% of the width
              const cx1 = LEFT_X  + (RIGHT_X - LEFT_X) * 0.42;
              const cx2 = LEFT_X  + (RIGHT_X - LEFT_X) * 0.58;
              const path = `M ${LEFT_X} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${RIGHT_X} ${y2}`;

              return (
                <g key={d.id}>
                  {/* Wider invisible hit area */}
                  <path d={path} fill="none" stroke="transparent" strokeWidth={12}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHighlight(d.id)}
                    onMouseLeave={() => setHighlight(null)}
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeW}
                    opacity={opacity}
                    strokeLinecap="round"
                  />
                  {/* Dots at endpoints */}
                  <circle cx={LEFT_X}  cy={y1} r={isHL ? 5 : 3} fill={d.color} opacity={opacity} />
                  <circle cx={RIGHT_X} cy={y2} r={isHL ? 5 : 3} fill={d.color} opacity={opacity} />
                </g>
              );
            })
          )}

          {/* Left labels (grid order) */}
          {byGrid.map((d, i) => {
            const y = gridYMap[d.id];
            const isHL = highlight === d.id;
            const dimmed = highlight && !isHL;
            return (
              <g key={`gl-${d.id}`}
                onMouseEnter={() => setHighlight(d.id)}
                onMouseLeave={() => setHighlight(null)}
                style={{ cursor: 'pointer' }}>
                <text
                  x={LABEL_LEFT} y={y + 4}
                  textAnchor="end"
                  fontSize={isHL ? 12 : 10.5}
                  fontWeight={isHL ? 700 : 500}
                  fontFamily="monospace"
                  fill={isHL ? '#ffffff' : dimmed ? '#3f3f46' : '#a1a1aa'}
                  style={{ transition: 'all 0.15s' }}
                >
                  <tspan fill={isHL ? d.color : dimmed ? '#3f3f46' : '#6b7280'} fontSize={9}>P{d.gridPos} </tspan>
                  {d.code}
                </text>
              </g>
            );
          })}

          {/* Right labels (race order) */}
          {byRace.map((d, i) => {
            const y = raceYMap[d.id];
            const isHL = highlight === d.id;
            const dimmed = highlight && !isHL;
            const gainColor = getGainColor(d.gain);
            return (
              <g key={`rl-${d.id}`}
                onMouseEnter={() => setHighlight(d.id)}
                onMouseLeave={() => setHighlight(null)}
                style={{ cursor: 'pointer' }}>
                <text
                  x={LABEL_RIGHT} y={y + 4}
                  textAnchor="start"
                  fontSize={isHL ? 12 : 10.5}
                  fontWeight={isHL ? 700 : 500}
                  fontFamily="monospace"
                  fill={isHL ? '#ffffff' : dimmed ? '#3f3f46' : '#a1a1aa'}
                  style={{ transition: 'all 0.15s' }}
                >
                  {d.code}
                  <tspan fill={isHL ? d.color : dimmed ? '#3f3f46' : '#6b7280'} fontSize={9}> P{d.racePos}</tspan>
                  {isHL && d.gain !== 0 && (
                    <tspan fill={gainColor} fontSize={9} dx={4}>
                      {d.gain > 0 ? `+${d.gain}` : d.gain}
                    </tspan>
                  )}
                </text>
              </g>
            );
          })}

          {/* Hover tooltip */}
          {highlight && (() => {
            const d = drivers.find(x => x.id === highlight);
            if (!d) return null;
            const gy = gridYMap[d.id] ?? 0;
            const ry = raceYMap[d.id] ?? 0;
            const midY = (gy + ry) / 2;
            const midX = (LEFT_X + RIGHT_X) / 2;
            const gainColor = getGainColor(d.gain);
            return (
              <g>
                <rect x={midX - 70} y={midY - 36} width={140} height={62}
                  rx={6} fill="#18181b" stroke="#3f3f46" strokeWidth={1} />
                <text x={midX} y={midY - 18} textAnchor="middle" fill={d.color}
                  fontSize={12} fontWeight={700} fontFamily="monospace">{d.code}</text>
                <text x={midX} y={midY - 4} textAnchor="middle" fill="#a1a1aa"
                  fontSize={9} fontFamily="monospace">Grid P{d.gridPos} → Race P{d.racePos}</text>
                <text x={midX} y={midY + 12} textAnchor="middle" fill={gainColor}
                  fontSize={11} fontWeight={700} fontFamily="monospace">
                  {d.gain > 0 ? `▲ +${d.gain}` : d.gain < 0 ? `▼ ${d.gain}` : '● No change'}
                </text>
                {d.points > 0 && (
                  <text x={midX} y={midY + 24} textAnchor="middle" fill="#52525b"
                    fontSize={8} fontFamily="monospace">{d.points} pts</text>
                )}
              </g>
            );
          })()}
        </svg>
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
  const [loadingResults, setLoadingResults] = useState(false);
  // Carica i risultati di gara dal JSON locale, matchando per anno + nome/location del meeting
  const loadRaceResults = async (year, meetingObj) => {
    if (typeof window === 'undefined' || !meetingObj) return;

    setLoadingResults(true);
    try {
      const [resultsRes, racesRes] = await Promise.all([
        fetch('/data/f1db-races-race-results.json'),
        fetch('/data/f1db-races.json').catch(() => null),
      ]);
      const allResults = await resultsRes.json();

      // Debug: log struttura primo elemento per capire i campi
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

      // Strategia 1: usa f1db-races.json per trovare il round corretto
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
          // Controlla tutti i possibili campi nome/location
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

      // Strategia 2: match diretto su f1db-races-race-results.json
      // I risultati potrebbero avere campi come grandPrixId, raceId che matchano location
      if (!filtered.length) {
        const loc = (meetingObj.location || '').toLowerCase();
        const country = (meetingObj.country_name || '').toLowerCase();
        const meetingName = (meetingObj.meeting_name || '').toLowerCase()
          .replace(' grand prix', '').replace(' gp', '').trim();

        // Raggruppa per round, testa ogni round
        const rounds = [...new Set(allResults.filter(r => r.year === parseInt(year)).map(r => r.round))];
        let bestRound = null, bestScore = -1;

        for (const round of rounds) {
          const sample = allResults.find(r => r.year === parseInt(year) && r.round === round);
          if (!sample) continue;
          
          // Controlla tutti i campi stringa del sample
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
  const [sessionType, setSessionType] = useState('Q');
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
        const latest = await getLatestSession('Q');
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
    setRaceResults(null);
    if (sessionType === 'R') loadRaceResults(year, m);
    try { await loadDriversForSession(m, SESSION_TYPES.find(s => s.id === sessionType)?.name || 'Qualifying'); }
    catch { setDrivers([]); }
  };

  const handleSessionChange = async (sid) => {
    setSessionType(sid); setOpenSession(false); setDrivers([]); setSessionInfo(null);
    setRaceResults(null);
    if (sid === 'R' && meeting) loadRaceResults(year, meeting);
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
                    {flagCode && <img src={`https://flagcdn.com/w20/${flagCode}.png`} alt="" className="w-5 h-3 object-cover rounded-sm flex-shrink-0" />}
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
                    {fc && <img src={`https://flagcdn.com/w20/${fc}.png`} alt="" className="w-5 h-3 object-cover rounded-sm flex-shrink-0" />}
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
                    {driverInfo.headshot_url && <img src={driverInfo.headshot_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />}
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
                  {d.headshot_url && <img src={d.headshot_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
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
