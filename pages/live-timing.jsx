import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import {
  Activity, Zap, Gauge, ChevronDown, Search, RefreshCw,
  Radio, Cpu, Thermometer, Wind, Droplets, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell,
} from 'recharts';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import {
  getDrivers, getDriverNumber, getTelemetry, getCircuitMap,
  getWeather, getMeetings, getSessionsForMeeting, getLatestSession,
  getAllDriversSectors, getRacePositions, getAllLaps,
} from '../lib/openf1';

// ─── Costanti ─────────────────────────────────────────────────────────────────
const SESSION_TYPES = [
  { id: 'FP1', name: 'Practice 1' }, { id: 'FP2', name: 'Practice 2' },
  { id: 'FP3', name: 'Practice 3' }, { id: 'Q',   name: 'Qualifying'  },
  { id: 'R',   name: 'Race'        }, { id: 'S',   name: 'Sprint'      },
  { id: 'SQ',  name: 'Sprint Qualifying' },
];
const AVAILABLE_YEARS = [2025, 2024, 2023];

const CIRCUIT_COUNTRY = {
  monza:'it',imola:'it',mugello:'it',silverstone:'gb',spa:'be',
  barcelona:'es',catalunya:'es',hungaroring:'hu',austria:'at',spielberg:'at',
  monaco:'mc',austin:'us',miami:'us','las vegas':'us',montreal:'ca',
  villeneuve:'ca',interlagos:'br',paulo:'br',rodriguez:'mx',mexico:'mx',
  suzuka:'jp',shanghai:'cn',singapore:'sg','marina bay':'sg',bahrain:'bh',
  sakhir:'bh',jeddah:'sa','abu dhabi':'ae','yas marina':'ae',melbourne:'au',
  'albert park':'au',zandvoort:'nl',lusail:'qa',losail:'qa',qatar:'qa',baku:'az',
};

function getFlagCode(loc = '') {
  const l = loc.toLowerCase();
  for (const [k, v] of Object.entries(CIRCUIT_COUNTRY)) if (l.includes(k)) return v;
  return '';
}

function formatTime(s) {
  if (!s) return '—';
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(3).padStart(6, '0');
  return `${m}:${sec}`;
}

function formatDelta(d) {
  if (d == null) return '—';
  return (d > 0 ? '+' : '') + d.toFixed(3) + 's';
}

const FALLBACK_COLORS = ['#ef4444','#3b82f6','#f59e0b','#22c55e','#a855f7',
  '#ec4899','#06b6d4','#f97316','#84cc16','#14b8a6','#6366f1','#e11d48',
  '#0284c7','#ca8a04','#16a34a','#9333ea','#db2777','#0891b2','#ea580c','#65a30d'];

// ─── Hook ──────────────────────────────────────────────────────────────────────
function useOutsideClose(refs, setters) {
  useEffect(() => {
    const h = (e) => refs.forEach((r, i) => { if (r.current && !r.current.contains(e.target)) setters[i](false); });
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
}

// ─── Dropdown ────────────────────────────────────────────────────────────────
function Dropdown({ label, isOpen, onToggle, disabled, header, children, dropdownRef, compact }) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={onToggle} disabled={disabled}
        className={`w-full bg-zinc-900 border rounded-xl text-left transition-all
          ${compact ? 'p-3' : 'p-4'}
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

// ─── Stat card ────────────────────────────────────────────────────────────────
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

// ─── LAP SELECTOR ────────────────────────────────────────────────────────────
function LapSelector({ laps, selectedLap, onSelect, fastestLapNumber, color, label }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const current = laps.find(l => l.lap_number === selectedLap) || laps.find(l => l.lap_number === fastestLapNumber);
  const idx = current ? laps.indexOf(current) : 0;

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => { const prev = laps[idx - 1]; if (prev) onSelect(prev.lap_number); }}
        disabled={idx <= 0}
        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors">
        <ChevronLeft className="w-3 h-3" />
      </button>
      <div className="relative" ref={ref}>
        <button onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono hover:border-zinc-600 transition-colors">
          <span className="text-zinc-500">{label}</span>
          <span className="font-bold" style={{ color }}>
            L{current?.lap_number ?? '?'}
          </span>
          {current?.lap_number === fastestLapNumber && (
            <span className="text-purple-400 text-[9px]">★FAST</span>
          )}
          <span className="text-zinc-500">{formatTime(current?.lap_duration)}</span>
          <ChevronDown className={`w-3 h-3 text-zinc-600 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl z-50 w-52 max-h-60 overflow-y-auto shadow-2xl shadow-black/60">
            {laps.map(l => (
              <button key={l.lap_number}
                onClick={() => { onSelect(l.lap_number); setOpen(false); }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs font-mono hover:bg-zinc-800 transition-colors
                  ${l.lap_number === current?.lap_number ? 'bg-zinc-800/60' : ''}`}>
                <span className={l.lap_number === fastestLapNumber ? 'text-purple-400 font-bold' : 'text-zinc-300'}>
                  Lap {l.lap_number} {l.lap_number === fastestLapNumber ? '★' : ''}
                </span>
                <span className="text-zinc-500">{formatTime(l.lap_duration)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => { const next = laps[idx + 1]; if (next) onSelect(next.lap_number); }}
        disabled={idx >= laps.length - 1}
        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors">
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── GRAFICI OVERLAY (telemetria sovrapposta) ─────────────────────────────────
function OverlayChart({ data1, data2, code1, code2, color1, color2, tab }) {
  // Interpola data2 sui punti distance di data1
  const merged = useMemo(() => {
    if (!data1.length) return [];
    const d1 = data1.filter((_, i) => i % 3 === 0);
    if (!data2.length) return d1.map(p => ({ ...p, [`${code2}_speed`]: null, [`${code2}_rpm`]: null, [`${code2}_gear`]: null, [`${code2}_throttle`]: null, [`${code2}_brake`]: null }));
    const d2 = data2.filter((_, i) => i % 3 === 0);
    const d2Map = new Map(d2.map(p => [p.distance, p]));
    return d1.map(p => {
      // Trova il punto più vicino in d2
      let closest = d2[0];
      let closestDiff = Math.abs((d2[0]?.distance ?? 0) - p.distance);
      for (const q of d2) {
        const diff = Math.abs(q.distance - p.distance);
        if (diff < closestDiff) { closest = q; closestDiff = diff; }
        if (diff > closestDiff + 20) break;
      }
      return {
        distance: p.distance,
        [`${code1}_speed`]: p.speed, [`${code1}_rpm`]: p.rpm, [`${code1}_gear`]: p.gear,
        [`${code1}_throttle`]: p.throttle, [`${code1}_brake`]: p.brake,
        [`${code2}_speed`]: closest?.speed ?? null, [`${code2}_rpm`]: closest?.rpm ?? null,
        [`${code2}_gear`]: closest?.gear ?? null, [`${code2}_throttle`]: closest?.throttle ?? null,
        [`${code2}_brake`]: closest?.brake ?? null,
      };
    });
  }, [data1, data2, code1, code2]);

  const tickFmt = v => `${(v / 1000).toFixed(1)}km`;
  const cs = { backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 11 };

  if (tab === 'inputs') {
    return (
      <div className="space-y-1">
        {[['Throttle', `${code1}_throttle`, `${code2}_throttle`, '#22c55e', '#4ade80'],
          ['Brake',    `${code1}_brake`,    `${code2}_brake`,    '#ef4444', '#f87171']].map(([name, k1, k2, c1, c2]) => (
          <div key={name}>
            <div className="text-[9px] text-zinc-600 font-mono mb-1 uppercase">{name}</div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={merged}>
                <XAxis dataKey="distance" stroke="#3f3f46" tick={{ fontSize: 9 }} tickFormatter={tickFmt} />
                <YAxis stroke="#3f3f46" tick={{ fontSize: 9 }} domain={[0, 100]} width={28} />
                <Tooltip contentStyle={cs} formatter={(v, n) => [`${v}%`, n]} />
                <Area type="monotone" dataKey={k1} stroke={c1} fill={`${c1}20`} strokeWidth={1.5} dot={false} name={code1} />
                {data2.length > 0 && <Area type="monotone" dataKey={k2} stroke={c2} fill={`${c2}10`} strokeWidth={1.5} dot={false} name={code2} strokeDasharray="4 2" />}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    );
  }

  const configs = {
    speed: { k1: `${code1}_speed`, k2: `${code2}_speed`, unit: ' km/h', type: 'area' },
    rpm:   { k1: `${code1}_rpm`,   k2: `${code2}_rpm`,   unit: '',       type: 'area' },
    gear:  { k1: `${code1}_gear`,  k2: `${code2}_gear`,  unit: '',       type: 'bar'  },
  };
  const cfg = configs[tab] || configs.speed;

  if (cfg.type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={merged}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="distance" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={tickFmt} />
          <YAxis stroke="#52525b" tick={{ fontSize: 10 }} domain={[1, 8]} />
          <Tooltip contentStyle={cs} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey={cfg.k1} name={code1} fill={color1} maxBarSize={3} opacity={0.9} />
          {data2.length > 0 && <Bar dataKey={cfg.k2} name={code2} fill={color2} maxBarSize={3} opacity={0.7} />}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={merged}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="distance" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={tickFmt} />
        <YAxis stroke="#52525b" tick={{ fontSize: 10 }} unit={cfg.unit} />
        <Tooltip contentStyle={cs} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey={cfg.k1} name={code1} stroke={color1} fill={`${color1}18`} strokeWidth={2} dot={false} />
        {data2.length > 0 && (
          <Area type="monotone" dataKey={cfg.k2} name={code2} stroke={color2} fill={`${color2}12`} strokeWidth={2} dot={false} strokeDasharray="5 3" />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── GPS CIRCUIT MAP con dominanza colori ────────────────────────────────────
function CircuitSpeedMap({ circuitMap, compareCircuitMap, color1, color2, code1, code2, showCompare }) {
  const W = 500, H = 320, PAD = 28;

  const normalize = (pts, boundsRef) => {
    if (!pts?.length) return [];
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
    const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];
    const rX = maxX - minX || 1, rY = maxY - minY || 1;
    const scale = Math.min((W - PAD * 2) / rX, (H - PAD * 2) / rY);
    const oX = (W - rX * scale) / 2, oY = (H - rY * scale) / 2;
    if (boundsRef) { boundsRef.minX = minX; boundsRef.minY = minY; boundsRef.scale = scale; boundsRef.oX = oX; boundsRef.oY = oY; }
    return pts.map(p => ({ x: oX + (p.x - minX) * scale, y: H - (oY + (p.y - minY) * scale), speed: p.speed }));
  };

  // Usa i bounds di circuitMap (driver principale) per entrambi i tracciati
  const boundsRef = useMemo(() => ({}), [circuitMap]);
  const mainPts    = useMemo(() => normalize(circuitMap, boundsRef), [circuitMap]);

  // Ricalcola i punti di confronto usando gli STESSI bounds
  const comparePts = useMemo(() => {
    if (!compareCircuitMap?.length || !boundsRef.scale) return [];
    return compareCircuitMap.map(p => ({
      x: boundsRef.oX + (p.x - boundsRef.minX) * boundsRef.scale,
      y: H - (boundsRef.oY + (p.y - boundsRef.minY) * boundsRef.scale),
      speed: p.speed,
    }));
  }, [compareCircuitMap, boundsRef]);

  const isEmpty = !mainPts.length;

  // Per ogni segmento del tracciato principale: calcola colore
  // - Compare OFF → colore per velocità (heatmap)
  // - Compare ON  → colore del pilota più veloce in quel punto
  const segmentColor = useMemo(() => {
    if (!mainPts.length) return [];

    if (!showCompare || comparePts.length < 2) {
      // Heatmap velocità normale
      const speeds = mainPts.map(p => p.speed);
      const maxS = Math.max(...speeds, 1), minS = Math.min(...speeds);
      return mainPts.slice(0, -1).map((p) => {
        const t = Math.max(0, Math.min(1, (p.speed - minS) / (maxS - minS)));
        if (t < 0.25) return `hsl(${220 + t * 60},90%,60%)`;
        if (t < 0.5)  return `hsl(${175 - t * 60},85%,55%)`;
        if (t < 0.75) return `hsl(${90  - t * 60},90%,50%)`;
        return               `hsl(${30  - t * 30},95%,55%)`;
      });
    }

    // Dominanza: per ogni segmento del percorso 1, trova il punto più vicino nel percorso 2
    return mainPts.slice(0, -1).map((p, i) => {
      const midX = (p.x + mainPts[i + 1].x) / 2;
      const midY = (p.y + mainPts[i + 1].y) / 2;
      // Trova il punto più vicino in comparePts
      let closestComp = comparePts[0];
      let closestDist = Infinity;
      for (const cp of comparePts) {
        const d = (cp.x - midX) ** 2 + (cp.y - midY) ** 2;
        if (d < closestDist) { closestComp = cp; closestDist = d; }
      }
      // Confronta velocità
      return p.speed >= (closestComp?.speed ?? 0) ? color1 : color2;
    });
  }, [mainPts, comparePts, showCompare, color1, color2]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase">
          Circuit Map {isEmpty ? '— no GPS data' : showCompare ? '— dominance' : '— speed'}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
          {showCompare && comparePts.length > 0 ? (
            <>
              <span className="flex items-center gap-1">
                <span className="w-3 h-1.5 rounded inline-block" style={{ background: color1 }} /> {code1} faster
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-1.5 rounded inline-block" style={{ background: color2 }} /> {code2} faster
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded inline-block" style={{ background: 'hsl(0,95%,55%)' }} />Fast</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded inline-block" style={{ background: 'hsl(120,90%,50%)' }} />Med</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded inline-block" style={{ background: 'hsl(220,90%,60%)' }} />Slow</span>
            </>
          )}
        </div>
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center h-48 text-zinc-700 font-mono text-sm">GPS data not available</div>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* Background track */}
            {mainPts.slice(0, -1).map((p, i) => (
              <line key={`bg-${i}`} x1={p.x} y1={p.y} x2={mainPts[i+1].x} y2={mainPts[i+1].y}
                stroke="#3f3f46" strokeWidth={9} strokeLinecap="round" />
            ))}
            {/* Colored segments */}
            {mainPts.slice(0, -1).map((p, i) => (
              <line key={`c-${i}`} x1={p.x} y1={p.y} x2={mainPts[i+1].x} y2={mainPts[i+1].y}
                stroke={segmentColor[i]} strokeWidth={4} strokeLinecap="round" />
            ))}
            {/* Start dot */}
            {mainPts[0] && (
              <>
                <circle cx={mainPts[0].x} cy={mainPts[0].y} r={6} fill="#18181b" stroke="#fff" strokeWidth={2} />
                <text x={mainPts[0].x + 9} y={mainPts[0].y + 4} fill="#71717a" fontSize="9" fontFamily="monospace">START</text>
              </>
            )}
          </svg>
          <div className="text-[10px] font-mono text-zinc-700 mt-1 text-right">{mainPts.length} GPS pts</div>
        </>
      )}
    </div>
  );
}

// ─── SECTOR TABLE — tutti i piloti, con filtro lap ────────────────────────────
function SectorTable({ sectorsData, highlightCode, compareCode }) {
  // Stato locale: quale "lap filter" applicare (null = best lap)
  const [lapFilter, setLapFilter] = useState(null); // null | number
  const [openLapFilter, setOpenLapFilter] = useState(false);
  const filterRef = useRef(null);
  useEffect(() => {
    const h = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setOpenLapFilter(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!sectorsData?.length) return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-center h-40">
      <span className="text-zinc-600 font-mono text-sm">Loading sector data...</span>
    </div>
  );

  // Determina quali lap sono disponibili (intersezione di tutti i piloti)
  const allLapNumbers = useMemo(() => {
    const sets = sectorsData.map(d => new Set(d.all_laps.map(l => l.lap_number)));
    const intersection = [...sets[0]].filter(n => sets.every(s => s.has(n)));
    if (intersection.length) return intersection.sort((a, b) => a - b);
    // fallback: unione
    const union = new Set(sectorsData.flatMap(d => d.all_laps.map(l => l.lap_number)));
    return [...union].sort((a, b) => a - b);
  }, [sectorsData]);

  // Dati per il lap selezionato
  const tableData = useMemo(() => {
    return sectorsData.map(d => {
      let lap;
      if (lapFilter != null) {
        lap = d.all_laps.find(l => l.lap_number === lapFilter);
      }
      // Fallback o best lap
      if (!lap) lap = { lap_number: d.best_lap_number, lap_duration: d.lap_time, s1: d.s1, s2: d.s2, s3: d.s3 };
      return { code: d.code, full_name: d.full_name, team: d.team, color: d.color, isBestLap: lapFilter == null || lap.lap_number === d.best_lap_number, ...lap };
    }).filter(d => d.lap_duration != null).sort((a, b) => a.lap_duration - b.lap_duration);
  }, [sectorsData, lapFilter]);

  const leader = tableData[0];
  const ref = tableData.find(d => d.code === highlightCode) || leader;

  const bestS1 = Math.min(...tableData.map(d => d.s1 ?? Infinity));
  const bestS2 = Math.min(...tableData.map(d => d.s2 ?? Infinity));
  const bestS3 = Math.min(...tableData.map(d => d.s3 ?? Infinity));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase">
          Sector Times · All Drivers
          {ref?.code !== leader?.code && (
            <span className="ml-2 text-zinc-700">Δ vs <span style={{ color: ref?.color }}>{ref?.code}</span></span>
          )}
        </div>
        {/* Filtro lap */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.1em]">Lap:</span>
          <div className="relative" ref={filterRef}>
            <button onClick={() => setOpenLapFilter(v => !v)}
              className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-mono hover:border-zinc-500 transition-colors">
              <span className={lapFilter == null ? 'text-purple-400 font-bold' : 'text-white'}>
                {lapFilter == null ? '★ Best' : `Lap ${lapFilter}`}
              </span>
              <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${openLapFilter ? 'rotate-180' : ''}`} />
            </button>
            {openLapFilter && (
              <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl z-50 w-44 max-h-56 overflow-y-auto shadow-2xl shadow-black/60">
                <button onClick={() => { setLapFilter(null); setOpenLapFilter(false); }}
                  className={`w-full px-3 py-2 text-left text-xs font-mono hover:bg-zinc-800 transition-colors ${lapFilter == null ? 'text-purple-400 font-bold' : 'text-zinc-400'}`}>
                  ★ Best lap (each driver)
                </button>
                {allLapNumbers.map(n => (
                  <button key={n} onClick={() => { setLapFilter(n); setOpenLapFilter(false); }}
                    className={`w-full px-3 py-2 text-left text-xs font-mono hover:bg-zinc-800 transition-colors ${lapFilter === n ? 'bg-zinc-800/60 text-white' : 'text-zinc-400'}`}>
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
            <tr className="border-b border-zinc-800">
              {['P','Driver','Team','Lap','Time','Gap','S1','S2','S3','ΔS1','ΔS2','ΔS3'].map(h => (
                <th key={h} className={`py-2 pr-3 text-zinc-600 font-normal whitespace-nowrap ${['P','Driver'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((d, i) => {
              const gap      = d.lap_duration - leader.lap_duration;
              const dS1      = (d.s1 ?? 0) - (ref?.s1 ?? 0);
              const dS2      = (d.s2 ?? 0) - (ref?.s2 ?? 0);
              const dS3      = (d.s3 ?? 0) - (ref?.s3 ?? 0);
              const isHighlight = d.code === highlightCode;
              const isCompare   = d.code === compareCode;
              return (
                <tr key={d.code}
                  className={`border-b border-zinc-900 hover:bg-zinc-800/30 transition-colors
                    ${isHighlight ? 'bg-zinc-800/50' : isCompare ? 'bg-zinc-800/25' : ''}`}>
                  <td className="py-2 pr-3 text-zinc-500">{i + 1}</td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isHighlight ? 'text-white' : ''}`} style={{ color: isHighlight ? undefined : d.color }}>
                        {d.code}
                      </span>
                      {isHighlight && <span className="text-zinc-600 text-[9px]">◀</span>}
                      {isCompare   && <span className="text-zinc-600 text-[9px]">◁</span>}
                    </div>
                  </td>
                  <td className="py-2 pr-3 text-right text-zinc-500 whitespace-nowrap">{d.team?.slice(0, 10)}</td>
                  <td className="py-2 pr-3 text-right">
                    <span className={d.isBestLap ? 'text-purple-400' : 'text-zinc-400'}>
                      {d.isBestLap ? '★' : ''}{d.lap_number}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-right text-white font-bold">{formatTime(d.lap_duration)}</td>
                  <td className="py-2 pr-3 text-right">
                    <span className={gap === 0 ? 'text-yellow-400' : 'text-red-400'}>
                      {gap === 0 ? 'LEADER' : `+${gap.toFixed(3)}`}
                    </span>
                  </td>
                  {/* S1 S2 S3 */}
                  {[['s1', bestS1], ['s2', bestS2], ['s3', bestS3]].map(([k, best]) => (
                    <td key={k} className={`py-2 pr-3 text-right font-bold ${d[k] === best ? 'text-purple-400' : 'text-zinc-300'}`}>
                      {d[k]?.toFixed(3) ?? '—'}
                    </td>
                  ))}
                  {/* Delta */}
                  {[dS1, dS2, dS3].map((delta, di) => (
                    <td key={di} className={`py-2 pr-3 text-right ${delta === 0 ? 'text-zinc-500' : delta < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {delta === 0 ? 'REF' : formatDelta(delta)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] font-mono text-zinc-600">
        <span><span className="text-purple-400">★</span> Best lap / best sector</span>
        <span><span className="text-yellow-400">●</span> Leader</span>
        {highlightCode && <span style={{ color: sectorsData.find(d=>d.code===highlightCode)?.color }}>◀ {highlightCode}</span>}
        {compareCode   && <span style={{ color: sectorsData.find(d=>d.code===compareCode)?.color   }}>◁ {compareCode}</span>}
      </div>
    </div>
  );
}

// ─── Race positions ───────────────────────────────────────────────────────────
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
      <div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase mb-4">Race Positions — Lap by Lap</div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={byLap}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="lap" stroke="#52525b" tick={{ fontSize: 10 }} />
          <YAxis reversed domain={[1, 20]} stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={v => `P${v}`} />
          <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 11 }} formatter={(v, n) => [`P${v}`, n]} />
          {driverCodes.map(code => (
            <Line key={code} type="monotone" dataKey={code} stroke={colorMap[code]}
              strokeWidth={highlightCodes.includes(code) ? 2.5 : 1} dot={false} connectNulls
              opacity={highlightCodes.length === 0 || highlightCodes.includes(code) ? 1 : 0.12} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── PAGINA PRINCIPALE ────────────────────────────────────────────────────────
export default function LiveTimingPage() {
  const [year, setYear]               = useState(null);
  const [meetings, setMeetings]       = useState([]);
  const [meeting, setMeeting]         = useState(null);
  const [sessionType, setSessionType] = useState('Q');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [drivers, setDrivers]         = useState([]);
  const [driverCode, setDriverCode]   = useState(null);
  const [compareCode, setCompareCode] = useState(null);
  const [showCompare, setShowCompare] = useState(false);

  // Giri disponibili per il selettore
  const [driver1Laps, setDriver1Laps] = useState([]);
  const [driver2Laps, setDriver2Laps] = useState([]);
  const [selectedLap1, setSelectedLap1] = useState(null); // null = fastest
  const [selectedLap2, setSelectedLap2] = useState(null);

  const [telemetry, setTelemetry]           = useState([]);
  const [compareTelemetry, setCompareTelemetry] = useState([]);
  const [fastestLap1, setFastestLap1]       = useState(null);
  const [fastestLap2, setFastestLap2]       = useState(null);
  const [weather, setWeather]               = useState(null);
  const [sectorsData, setSectorsData]       = useState(null);
  const [positionsData, setPositionsData]   = useState(null);
  const [circuitMap, setCircuitMap]         = useState([]);
  const [compareCircuitMap, setCompareCircuitMap] = useState([]);

  const [loading, setLoading]     = useState(false);
  const [loadStep, setLoadStep]   = useState('');
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState('speed');
  const [lastQuery, setLastQuery] = useState(null);

  const [openYear, setOpenYear]       = useState(false);
  const [openMeeting, setOpenMeeting] = useState(false);
  const [openSession, setOpenSession] = useState(false);
  const [openDriver, setOpenDriver]   = useState(false);
  const [openCompare, setOpenCompare] = useState(false);

  const r1=useRef(null),r2=useRef(null),r3=useRef(null),r4=useRef(null),r5=useRef(null);
  useOutsideClose([r1,r2,r3,r4,r5],[setOpenYear,setOpenMeeting,setOpenSession,setOpenDriver,setOpenCompare]);

  useEffect(() => {
    (async () => {
      try {
        const latest = await getLatestSession('Q');
        if (!latest?.year) return;
        const data = await getMeetings(latest.year);
        setYear(latest.year); setMeetings(data);
        const m = data.find(m =>
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

  const handleYearChange = async (y) => {
    setYear(y); setOpenYear(false);
    setMeeting(null); setDrivers([]); setSessionInfo(null);
    try { setMeetings(await getMeetings(y)); } catch { setMeetings([]); }
  };

  const loadSessionDrivers = async (m, sessName) => {
    const sessions = await getSessionsForMeeting(m.meeting_key);
    const sess = sessions.find(s => s.session_name === sessName) || sessions[sessions.length - 1];
    if (sess) {
      const d = await getDrivers(sess.session_key);
      setDrivers(d.sort((a, b) => (a.name_acronym||'').localeCompare(b.name_acronym||'')));
      setSessionInfo(sess);
    }
  };

  const handleMeetingChange = async (m) => {
    setMeeting(m); setOpenMeeting(false); setDrivers([]); setSessionInfo(null);
    try { await loadSessionDrivers(m, SESSION_TYPES.find(s=>s.id===sessionType)?.name||'Qualifying'); }
    catch { setDrivers([]); }
  };

  const handleSessionChange = async (sid) => {
    setSessionType(sid); setOpenSession(false); setDrivers([]); setSessionInfo(null);
    if (!meeting) return;
    try { await loadSessionDrivers(meeting, SESSION_TYPES.find(s=>s.id===sid)?.name||sid); }
    catch { setDrivers([]); }
  };

  // ── FETCH principale ──────────────────────────────────────────────────────
  const fetchTelemetry = async () => {
    if (!year || !meeting || !driverCode || !sessionInfo) return;
    setLoading(true); setError(null);
    setTelemetry([]); setCompareTelemetry([]);
    setFastestLap1(null); setFastestLap2(null);
    setWeather(null); setSectorsData(null); setPositionsData(null);
    setCircuitMap([]); setCompareCircuitMap([]);
    setDriver1Laps([]); setDriver2Laps([]);

    const sk = sessionInfo.session_key;
    try {
      setLoadStep('Telemetria pilota principale...');
      const num1 = await getDriverNumber(sk, driverCode);
      const r1data = await getTelemetry(sk, num1, selectedLap1);
      setTelemetry(r1data.telemetry);
      setFastestLap1(r1data.target_lap);

      // Carica tutti i giri per il selettore
      const laps1 = await getAllLaps(sk, num1);
      setDriver1Laps(laps1);

      setLoadStep('Mappa GPS...');
      try { setCircuitMap(await getCircuitMap(sk, num1, selectedLap1)); } catch { /* opzionale */ }

      if (showCompare && compareCode && compareCode !== driverCode) {
        setLoadStep(`Telemetria ${compareCode}...`);
        try {
          const num2 = await getDriverNumber(sk, compareCode);
          const r2data = await getTelemetry(sk, num2, selectedLap2);
          setCompareTelemetry(r2data.telemetry);
          setFastestLap2(r2data.target_lap);
          const laps2 = await getAllLaps(sk, num2);
          setDriver2Laps(laps2);
          try { setCompareCircuitMap(await getCircuitMap(sk, num2, selectedLap2)); } catch { /* opzionale */ }
        } catch { /* opzionale */ }
      }

      setLoadStep('Meteo...');
      try { setWeather(await getWeather(sk)); } catch { /* opzionale */ }

      setLoadStep('Settori...');
      try { setSectorsData(await getAllDriversSectors(sk)); } catch { /* opzionale */ }

      if (sessionType === 'R') {
        setLoadStep('Posizioni gara...');
        try { setPositionsData(await getRacePositions(sk)); } catch { /* opzionale */ }
      }

      setLastQuery({ year, gp: meeting.meeting_name, session: sessionType, driver: driverCode });
    } catch (e) {
      setError(e.message || 'Errore sconosciuto');
    } finally { setLoading(false); setLoadStep(''); }
  };

  // Re-fetch automatico quando cambia il lap selezionato (solo se dati già caricati)
  const refetchLap = async (lapNum, isCompare) => {
    if (!sessionInfo) return;
    const sk = sessionInfo.session_key;
    try {
      if (!isCompare) {
        const num = await getDriverNumber(sk, driverCode);
        const r = await getTelemetry(sk, num, lapNum);
        setTelemetry(r.telemetry); setFastestLap1(r.target_lap);
        try { setCircuitMap(await getCircuitMap(sk, num, lapNum)); } catch { /* opzionale */ }
      } else {
        const num = await getDriverNumber(sk, compareCode);
        const r = await getTelemetry(sk, num, lapNum);
        setCompareTelemetry(r.telemetry); setFastestLap2(r.target_lap);
        try { setCompareCircuitMap(await getCircuitMap(sk, num, lapNum)); } catch { /* opzionale */ }
      }
    } catch (e) { setError(e.message); }
  };

  const handleLap1Change = (n) => { setSelectedLap1(n); if (telemetry.length) refetchLap(n, false); };
  const handleLap2Change = (n) => { setSelectedLap2(n); if (compareTelemetry.length) refetchLap(n, true); };

  const stats = useMemo(() => {
    if (!telemetry.length) return null;
    const speeds = telemetry.map(d => d.speed).filter(Boolean);
    const rpms   = telemetry.map(d => d.rpm).filter(Boolean);
    return {
      maxSpeed: speeds.length ? Math.max(...speeds) : 0,
      avgSpeed: speeds.length ? Math.round(speeds.reduce((a,b)=>a+b,0)/speeds.length) : 0,
      maxRpm: rpms.length ? Math.max(...rpms) : 0,
      points: telemetry.length,
    };
  }, [telemetry]);

  const driverInfo  = drivers.find(d => d.name_acronym === driverCode);
  const compareInfo = drivers.find(d => d.name_acronym === compareCode);
  const color1 = driverInfo?.team_colour  ? `#${driverInfo.team_colour}`  : '#ef4444';
  const color2 = compareInfo?.team_colour ? `#${compareInfo.team_colour}` : '#3b82f6';

  const canFetch = !!year && !!meeting && !!driverCode && !!sessionInfo && !loading;
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
            <h1 className="text-4xl font-black tracking-tighter">
              TELEMETRY <span className="text-red-600">EXPLORER</span>
            </h1>
            <p className="text-zinc-600 text-sm mt-1 font-mono">
              Speed · RPM · Gear · Throttle · Brake · GPS Map · Sector Analysis
            </p>
          </div>

          {/* Selettori 2×2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Dropdown label="Year" isOpen={openYear} onToggle={() => setOpenYear(v=>!v)} dropdownRef={r1}
              header={<div className="text-2xl font-black font-mono">{year||'—'}</div>}>
              {AVAILABLE_YEARS.map(y => (
                <button key={y} onClick={() => handleYearChange(y)}
                  className={`w-full p-3 text-left font-mono text-sm hover:bg-zinc-800 transition-colors ${year===y ? 'bg-red-600/15 border-l-2 border-red-600 pl-4 text-red-400' : 'text-zinc-300'}`}>
                  {y}
                </button>
              ))}
            </Dropdown>

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
                    className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 ${meeting?.meeting_key===m.meeting_key ? 'bg-red-600/15 border-l-2 border-red-600 pl-4' : ''}`}>
                    {fc && <img src={`https://flagcdn.com/w20/${fc}.png`} alt="" className="w-5 h-3 object-cover rounded-sm flex-shrink-0" />}
                    <div>
                      <div className="text-sm font-bold text-white">{m.meeting_name}</div>
                      <div className="text-xs text-zinc-500">{m.location}</div>
                    </div>
                  </button>
                );
              })}
            </Dropdown>

            <Dropdown label="Session" isOpen={openSession} onToggle={() => setOpenSession(v=>!v)} dropdownRef={r3}
              header={
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black font-mono">{sessionType}</span>
                  <span className="text-zinc-500 text-sm">{SESSION_TYPES.find(s=>s.id===sessionType)?.name}</span>
                </div>
              }>
              {SESSION_TYPES.map(s => (
                <button key={s.id} onClick={() => handleSessionChange(s.id)}
                  className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors ${sessionType===s.id ? 'bg-red-600/15 border-l-2 border-red-600 pl-4' : ''}`}>
                  <span className="font-mono font-bold text-white mr-3">{s.id}</span>
                  <span className="text-zinc-500 text-sm">{s.name}</span>
                </button>
              ))}
            </Dropdown>

            <Dropdown label="Driver" isOpen={openDriver&&!!meeting} onToggle={() => meeting&&drivers.length&&setOpenDriver(v=>!v)}
              disabled={!meeting||!drivers.length} dropdownRef={r4}
              header={
                driverInfo ? (
                  <div className="flex items-center gap-3">
                    {driverInfo.headshot_url && <img src={driverInfo.headshot_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />}
                    <div>
                      <div className="font-black font-mono text-sm flex items-center gap-2">
                        <span style={{ color: color1 }}>{driverInfo.name_acronym}</span>
                        <span className="text-zinc-600 font-normal">#{driverInfo.driver_number}</span>
                      </div>
                      <div className="text-xs text-zinc-500">{driverInfo.full_name} · {driverInfo.team_name}</div>
                    </div>
                  </div>
                ) : <div className="text-sm text-zinc-500">{meeting?(drivers.length?'Select Driver':'Loading...'):'Select GP first'}</div>
              }>
              {drivers.map(d => (
                <button key={d.driver_number}
                  onClick={() => {
                    setDriverCode(d.name_acronym);
                    if (!compareCode||compareCode===d.name_acronym)
                      setCompareCode(drivers.find(x=>x.name_acronym!==d.name_acronym)?.name_acronym||null);
                    setOpenDriver(false);
                  }}
                  className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 ${driverCode===d.name_acronym ? 'bg-red-600/15 border-l-2 border-red-600 pl-4' : ''}`}>
                  {d.headshot_url && <img src={d.headshot_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
                  <div>
                    <div className="font-mono font-bold text-sm text-white">{d.name_acronym} <span className="text-zinc-600 font-normal">#{d.driver_number}</span></div>
                    <div className="text-xs text-zinc-500">{d.full_name} · {d.team_name}</div>
                  </div>
                </button>
              ))}
            </Dropdown>
          </div>

          {/* Barra compare + fetch */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5">
              <span className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase">Compare</span>
              <button onClick={() => setShowCompare(v=>!v)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${showCompare ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}>
                {showCompare ? 'ON' : 'OFF'}
              </button>
            </div>

            {showCompare && (
              <Dropdown label="vs Driver" isOpen={openCompare&&!!meeting} onToggle={() => meeting&&drivers.length&&setOpenCompare(v=>!v)}
                disabled={!meeting||!drivers.length} dropdownRef={r5}
                header={
                  compareInfo ? (
                    <div className="flex items-center gap-2">
                      {compareInfo.headshot_url && <img src={compareInfo.headshot_url} alt="" className="w-6 h-6 rounded-full object-cover" />}
                      <span className="font-mono font-bold text-sm" style={{ color: color2 }}>{compareInfo.name_acronym}</span>
                      <span className="text-zinc-600 text-xs">{compareInfo.team_name}</span>
                    </div>
                  ) : <div className="text-sm text-zinc-500">Select driver</div>
                }>
                {drivers.filter(d=>d.name_acronym!==driverCode).map(d => (
                  <button key={d.driver_number} onClick={() => { setCompareCode(d.name_acronym); setOpenCompare(false); }}
                    className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 ${compareCode===d.name_acronym ? 'bg-red-600/15 border-l-2 border-red-600 pl-4' : ''}`}>
                    {d.headshot_url && <img src={d.headshot_url} alt="" className="w-6 h-6 rounded-full object-cover" />}
                    <span className="font-mono text-sm text-white">{d.name_acronym}</span>
                    <span className="text-zinc-500 text-xs">{d.team_name}</span>
                  </button>
                ))}
              </Dropdown>
            )}

            <div className="flex-1" />
            {lastQuery && <div className="hidden lg:block text-xs text-zinc-700 font-mono">{lastQuery.year} · {lastQuery.gp} · {lastQuery.driver} · {lastQuery.session}</div>}
            <button onClick={fetchTelemetry} disabled={!canFetch}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono font-bold text-sm transition-all ${canFetch ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}>
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />{loadStep||'Loading...'}</> : <><Search className="w-4 h-4" />FETCH TELEMETRY</>}
            </button>
          </div>

          {!canFetch && !loading && (
            <div className="mb-6 text-xs text-zinc-700 font-mono text-center py-2">
              {!year && 'Select a year to begin'}{year&&!meeting&&'Select a Grand Prix'}
              {year&&meeting&&!driverCode&&'Select a driver'}{year&&meeting&&driverCode&&!sessionInfo&&'Loading session...'}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-950/20 border border-red-900/40 rounded-xl p-4">
              <div className="text-red-400 font-mono font-bold text-sm">⚠ {error}</div>
              <div className="text-red-700 text-xs font-mono mt-1">OpenF1 ha dati dal 2023.</div>
            </div>
          )}

          {/* ── SEZIONE DATI ── */}
          {telemetry.length > 0 && (
            <div className="space-y-4">

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard accent label="Top Speed" value={`${stats.maxSpeed} km/h`} icon={<Zap className="w-4 h-4 text-red-500" />} sub="Selected lap" />
                <StatCard label="Avg Speed" value={`${stats.avgSpeed} km/h`} icon={<Gauge className="w-4 h-4 text-yellow-500" />} />
                <StatCard label="Max RPM" value={stats.maxRpm.toLocaleString()} icon={<Activity className="w-4 h-4 text-blue-500" />} />
                <StatCard label="Data Points" value={stats.points.toLocaleString()} icon={<Cpu className="w-4 h-4 text-green-500" />} sub="~3.7 Hz" />
              </div>

              {/* Lap info strip */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 flex flex-wrap gap-x-8 gap-y-3 items-center">
                {/* Lap selectors */}
                <div className="flex items-center gap-3 flex-wrap">
                  {driver1Laps.length > 0 && (
                    <LapSelector
                      laps={driver1Laps} selectedLap={selectedLap1}
                      onSelect={handleLap1Change}
                      fastestLapNumber={fastestLap1?.is_fastest ? fastestLap1?.lap_number : driver1Laps.reduce((a,b)=>a.lap_duration<b.lap_duration?a:b, driver1Laps[0])?.lap_number}
                      color={color1} label={driverCode}
                    />
                  )}
                  {showCompare && driver2Laps.length > 0 && (
                    <LapSelector
                      laps={driver2Laps} selectedLap={selectedLap2}
                      onSelect={handleLap2Change}
                      fastestLapNumber={driver2Laps.reduce((a,b)=>a.lap_duration<b.lap_duration?a:b, driver2Laps[0])?.lap_number}
                      color={color2} label={compareCode}
                    />
                  )}
                </div>
                {/* Tempi */}
                {fastestLap1 && (
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <div>
                      <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mr-2">Time</span>
                      <span className="text-white font-black font-mono">{formatTime(fastestLap1.lap_duration)}</span>
                      {fastestLap2 && (
                        <span className="text-zinc-600 font-mono ml-2">vs <span style={{ color: color2 }}>{formatTime(fastestLap2.lap_duration)}</span></span>
                      )}
                    </div>
                    {[1,2,3].map(s => fastestLap1[`sector_${s}`] ? (
                      <div key={s}>
                        <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mr-1">S{s}</span>
                        <span className="text-zinc-300 font-mono">{fastestLap1[`sector_${s}`].toFixed(3)}s</span>
                        {fastestLap2?.[`sector_${s}`] && (
                          <span className={`font-mono ml-1 text-xs ${fastestLap1[`sector_${s}`] < fastestLap2[`sector_${s}`] ? 'text-green-400' : 'text-red-400'}`}>
                            ({formatDelta(fastestLap1[`sector_${s}`] - fastestLap2[`sector_${s}`])})
                          </span>
                        )}
                      </div>
                    ) : null)}
                  </div>
                )}
                {weather && (
                  <div className="flex gap-4 ml-auto">
                    {weather.air_temp != null && <div><span className="text-[10px] text-zinc-600 font-mono uppercase">Air </span><span className="text-zinc-300 font-mono">{weather.air_temp}°C</span></div>}
                    {weather.track_temp != null && <div><span className="text-[10px] text-zinc-600 font-mono uppercase">Track </span><span className="text-zinc-300 font-mono">{weather.track_temp}°C</span></div>}
                  </div>
                )}
              </div>

              {/* Grafici telemetria overlay */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase flex items-center gap-3">
                    <span style={{ color: color1 }}>● {driverCode}</span>
                    {showCompare && compareTelemetry.length > 0 && (
                      <><span className="text-zinc-700">──</span> <span style={{ color: color2 }}>╌ {compareCode}</span></>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {['speed','rpm','gear','inputs'].map(t => (
                      <button key={t} onClick={() => setActiveTab(t)}
                        className={`px-3 py-1 text-xs rounded-lg font-mono transition-all ${activeTab===t ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <OverlayChart
                  data1={telemetry}
                  data2={showCompare ? compareTelemetry : []}
                  code1={driverCode} code2={compareCode}
                  color1={color1} color2={color2}
                  tab={activeTab}
                />
              </div>

              {/* Mappa + Settori */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CircuitSpeedMap
                  circuitMap={circuitMap}
                  compareCircuitMap={showCompare ? compareCircuitMap : []}
                  color1={color1} color2={color2}
                  code1={driverCode} code2={compareCode}
                  showCompare={showCompare && compareCircuitMap.length > 0}
                />
                <SectorTable
                  sectorsData={sectorsData}
                  highlightCode={driverCode}
                  compareCode={showCompare ? compareCode : null}
                />
              </div>

              {/* Race positions */}
              {sessionType === 'R' && <RacePositionsChart positionsData={positionsData} highlightCodes={[driverCode, showCompare&&compareCode].filter(Boolean)} />}
            </div>
          )}

          {/* Placeholder */}
          {!loading && !error && !telemetry.length && (
            <div className="text-center py-28 border border-zinc-900 rounded-xl">
              <Radio className="w-10 h-10 mx-auto mb-4 text-zinc-800" />
              <div className="text-xl font-black font-mono text-zinc-700 mb-2">NO DATA LOADED</div>
              <div className="text-sm font-mono text-zinc-800">Year → Grand Prix → Session → Driver → FETCH</div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-zinc-900 pt-4 text-xs text-zinc-800 font-mono">
            <span>OpenF1 API · openf1.org</span>
            <span>{meeting?.meeting_name||'—'} · {driverCode||'—'} · {sessionType} · {year||'—'}</span>
            <span>{telemetry.length > 0 ? `${telemetry.length} pts` : 'No data'}</span>
          </div>
        </main>

        {loading && (
          <div className="fixed inset-0 bg-zinc-950/85 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center max-w-xs w-full mx-4">
              <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
              <div className="text-sm font-mono font-bold text-white mb-2">FETCHING DATA</div>
              <div className="text-xs text-zinc-500 font-mono mb-1">{loadStep}</div>
              <div className="text-xs text-zinc-700 font-mono mt-3">{meeting?.meeting_name} · {driverCode} · {sessionType}</div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
