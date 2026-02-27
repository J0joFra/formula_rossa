import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import {
  Activity, Zap, Gauge, ChevronDown, Search, RefreshCw,
  Radio, Cpu, Thermometer, Wind, ChevronLeft, ChevronRight, Play, Pause,
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
  getAllDriversSectors, getRacePositions, getAllLaps,
} from '../lib/openf1';

// ─── Constants ────────────────────────────────────────────────────────────────
const SESSION_TYPES = [
  { id: 'FP1', name: 'Practice 1' }, { id: 'FP2', name: 'Practice 2' },
  { id: 'FP3', name: 'Practice 3' }, { id: 'Q',   name: 'Qualifying'  },
  { id: 'R',   name: 'Race'        }, { id: 'S',   name: 'Sprint'      },
  { id: 'SQ',  name: 'Sprint Qualifying' },
];
const AVAILABLE_YEARS = [2025, 2024, 2023];

const CIRCUIT_COUNTRY = {
  monza:'it',imola:'it',mugello:'it',silverstone:'gb',spa:'be',barcelona:'es',
  catalunya:'es',hungaroring:'hu',austria:'at',spielberg:'at',monaco:'mc',
  austin:'us',miami:'us','las vegas':'us',montreal:'ca',villeneuve:'ca',
  interlagos:'br',paulo:'br',rodriguez:'mx',mexico:'mx',suzuka:'jp',shanghai:'cn',
  singapore:'sg','marina bay':'sg',bahrain:'bh',sakhir:'bh',jeddah:'sa',
  'abu dhabi':'ae','yas marina':'ae',melbourne:'au','albert park':'au',
  zandvoort:'nl',lusail:'qa',losail:'qa',qatar:'qa',baku:'az',
};
const getFlagCode = (loc = '') => {
  const l = loc.toLowerCase();
  for (const [k, v] of Object.entries(CIRCUIT_COUNTRY)) if (l.includes(k)) return v;
  return '';
};
const formatTime = (s) => {
  if (!s) return '—';
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(3).padStart(6, '0')}`;
};
const formatDelta = (d) => d == null ? '—' : (d > 0 ? '+' : '') + d.toFixed(3) + 's';
const FALLBACK_COLORS = ['#ef4444','#3b82f6','#f59e0b','#22c55e','#a855f7',
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

// ─── TELEMETRY CHART — single lap overlay + full session ──────────────────────
// ALL useMemo hooks are declared unconditionally at the top of this component.
function TelemetryChart({ data1, data2, code1, code2, color1, color2, tab, mode, fullData1, fullData2 }) {
  const cs = { backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 11, borderRadius: '8px' };
  const kmFmt = v => `${(v / 1000).toFixed(1)}km`;

  // ── Downsample full-session data ────────────────────────────────────────────
  const rd1 = useMemo(() => {
    if (!fullData1?.points?.length) return [];
    return fullData1.points
      .filter((_, i) => i % 6 === 0)
      .map((p, i) => ({ i, lap: p.lap_number, speed: p.speed, rpm: p.rpm }));
  }, [fullData1]);

  const rd2 = useMemo(() => {
    if (!fullData2?.points?.length) return [];
    return fullData2.points
      .filter((_, i) => i % 6 === 0)
      .map((p, i) => ({ i, lap: p.lap_number, speed: p.speed, rpm: p.rpm }));
  }, [fullData2]);

  // ── Race-mode merged array (by index) ────────────────────────────────────────
  const raceMerged = useMemo(() => {
    if (!rd1.length && !rd2.length) return [];
    const len = Math.max(rd1.length, rd2.length);
    return Array.from({ length: len }, (_, idx) => ({
      idx,
      [`${code1}_speed`]: rd1[idx]?.speed ?? null,
      [`${code1}_rpm`]:   rd1[idx]?.rpm   ?? null,
      [`${code2}_speed`]: rd2[idx]?.speed ?? null,
      [`${code2}_rpm`]:   rd2[idx]?.rpm   ?? null,
    }));
  }, [rd1, rd2, code1, code2]);

  // ── Lap-tick markers for race mode ────────────────────────────────────────────
  const lapTicks = useMemo(() => {
    const ticks = [];
    let last = null;
    rd1.forEach(p => { if (p.lap !== last) { ticks.push({ idx: p.i, lap: p.lap }); last = p.lap; } });
    return ticks;
  }, [rd1]);

  // ── Single-lap merged array (interpolated by distance %) ─────────────────────
  const lapMerged = useMemo(() => {
    if (!data1.length) return [];
    const d1 = data1.filter((_, i) => i % 3 === 0);
    const d2 = data2.filter((_, i) => i % 3 === 0);
    const empty2 = { speed: null, rpm: null, gear: null, throttle: null, brake: null };

    const interp = (norm) => {
      if (!d2.length) return empty2;
      const maxD2 = d2[d2.length - 1]?.distance || 1;
      const target = norm * maxD2;
      let lo = 0, hi = d2.length - 1;
      while (lo < hi - 1) { const m = (lo + hi) >> 1; d2[m].distance <= target ? lo = m : hi = m; }
      const a = d2[lo], b = d2[Math.min(lo + 1, d2.length - 1)];
      if (!b || a.distance === b.distance) return a;
      const t = (target - a.distance) / (b.distance - a.distance);
      const lerp = (x, y) => Math.round(x + (y - x) * t);
      return { speed: lerp(a.speed, b.speed), rpm: lerp(a.rpm, b.rpm), gear: lerp(a.gear, b.gear), throttle: lerp(a.throttle, b.throttle), brake: lerp(a.brake, b.brake) };
    };

    const maxD1 = d1[d1.length - 1]?.distance || 1;
    return d1.map(p => {
      const q = interp(p.distance / maxD1);
      return {
        dist: p.distance,
        [`${code1}_speed`]: p.speed,        [`${code2}_speed`]: q.speed,
        [`${code1}_rpm`]:   p.rpm,          [`${code2}_rpm`]:   q.rpm,
        [`${code1}_gear`]:  p.gear,         [`${code2}_gear`]:  q.gear,
        [`${code1}_throttle`]: p.throttle,  [`${code2}_throttle`]: q.throttle,
        [`${code1}_brake`]:    p.brake,     [`${code2}_brake`]:    q.brake,
      };
    });
  }, [data1, data2, code1, code2]);

  // ── Render ──────────────────────────────────────────────────────────────────
  if (mode === 'race') {
    const k1 = `${code1}_${tab === 'rpm' ? 'rpm' : 'speed'}`;
    const k2 = `${code2}_${tab === 'rpm' ? 'rpm' : 'speed'}`;
    const unit = tab === 'rpm' ? '' : ' km/h';

    if (!raceMerged.length) return (
      <div className="flex items-center justify-center h-48 text-zinc-600 font-mono text-sm">
        Full session data not available
      </div>
    );

    return (
      <div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={raceMerged} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="idx" stroke="#52525b" tick={false}
              label={{ value: '← Full session progress →', position: 'insideBottom', fill: '#52525b', fontSize: 10, dy: 8 }} />
            <YAxis stroke="#52525b" tick={{ fontSize: 10 }} unit={unit} width={46} />
            <Tooltip contentStyle={cs}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const v1 = payload.find(p => p.dataKey === k1);
                const v2 = payload.find(p => p.dataKey === k2);
                const lap = rd1[label]?.lap;
                return (
                  <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs font-mono">
                    {lap != null && <div className="text-zinc-500 mb-1">Lap {lap}</div>}
                    {v1?.value != null && <div style={{ color: color1 }}>{code1}: {v1.value}{unit}</div>}
                    {v2?.value != null && <div style={{ color: color2 }}>{code2}: {v2.value}{unit}</div>}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey={k1} name={code1} stroke={color1} fill={`${color1}20`} strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
            {rd2.length > 0 && (
              <Area type="monotone" dataKey={k2} name={code2} stroke={color2} fill={`${color2}10`} strokeWidth={1.5} dot={false} strokeDasharray="4 2" connectNulls isAnimationActive={false} />
            )}
          </AreaChart>
        </ResponsiveContainer>
        {/* Lap markers */}
        <div className="relative h-5 mt-1 px-2 overflow-hidden">
          {lapTicks.map(t => {
            const pct = rd1.length > 0 ? (t.idx / rd1.length) * 100 : 0;
            return (
              <span key={t.lap} className="absolute text-[8px] font-mono text-zinc-700 -translate-x-1/2" style={{ left: `${pct}%` }}>
                L{t.lap}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // Single-lap mode
  const merged = lapMerged;

  if (tab === 'inputs') {
    return (
      <div className="space-y-2">
        {[
          ['Throttle %', `${code1}_throttle`, `${code2}_throttle`, '#22c55e', '#4ade80', 80],
          ['Brake %',    `${code1}_brake`,    `${code2}_brake`,    '#ef4444', '#f87171', 60],
        ].map(([name, k1, k2, c1, c2, h]) => (
          <div key={name}>
            <div className="text-[9px] text-zinc-600 font-mono mb-0.5 uppercase tracking-widest">{name}</div>
            <ResponsiveContainer width="100%" height={h}>
              <AreaChart data={merged} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="dist" stroke="#3f3f46" tick={{ fontSize: 9 }} tickFormatter={kmFmt} />
                <YAxis stroke="#3f3f46" tick={{ fontSize: 9 }} domain={[0, 100]} width={28} />
                <Tooltip contentStyle={cs} formatter={(v, n) => [`${v}%`, n]} />
                <Area type="monotone" dataKey={k1} name={code1} stroke={c1} fill={`${c1}25`} strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
                {data2.length > 0 && (
                  <Area type="monotone" dataKey={k2} name={code2} stroke={c2} fill={`${c2}10`} strokeWidth={1.5} dot={false} strokeDasharray="4 2" connectNulls isAnimationActive={false} />
                )}
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
        <BarChart data={merged} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="dist" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={kmFmt} />
          <YAxis stroke="#52525b" tick={{ fontSize: 10 }} domain={[1, 8]} />
          <Tooltip contentStyle={cs} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey={`${code1}_gear`} name={code1} fill={color1} maxBarSize={3} opacity={0.9} isAnimationActive={false} />
          {data2.length > 0 && <Bar dataKey={`${code2}_gear`} name={code2} fill={color2} maxBarSize={3} opacity={0.65} isAnimationActive={false} />}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // speed or rpm
  const k1 = `${code1}_${tab}`;
  const k2 = `${code2}_${tab}`;
  const unit = tab === 'speed' ? ' km/h' : '';

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={merged} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="dist" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={kmFmt} />
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
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey={k1} name={code1} stroke={color1} fill={`${color1}20`} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
        {data2.length > 0 && (
          <Area type="monotone" dataKey={k2} name={code2} stroke={color2} fill={`${color2}10`} strokeWidth={2} dot={false} strokeDasharray="5 3" connectNulls isAnimationActive={false} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── ANIMATED GPS CIRCUIT MAP ─────────────────────────────────────────────────
// Default: first lap, speed heatmap. Animate button: loops through GPS points
// like a replay at ~600ms/frame. Compare mode: dominance colors.
function CircuitSpeedMap({ circuitMap, compareCircuitMap, color1, color2, code1, code2, showCompare }) {
  const W = 500, H = 320, PAD = 28;
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  // Normalize both tracks using main track bounds
  const { mainPts, comparePts } = useMemo(() => {
    if (!circuitMap?.length) return { mainPts: [], comparePts: [] };
    const xs = circuitMap.map(p => p.x), ys = circuitMap.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rX = maxX - minX || 1, rY = maxY - minY || 1;
    const scale = Math.min((W - PAD * 2) / rX, (H - PAD * 2) / rY);
    const oX = (W - rX * scale) / 2, oY = (H - rY * scale) / 2;
    const toSVG = p => ({
      x: oX + (p.x - minX) * scale,
      y: H - (oY + (p.y - minY) * scale),
      speed: p.speed,
    });
    return {
      mainPts: circuitMap.map(toSVG),
      comparePts: compareCircuitMap?.length ? compareCircuitMap.map(toSVG) : [],
    };
  }, [circuitMap, compareCircuitMap]);

  // Segment colors
  const segColors = useMemo(() => {
    if (!mainPts.length) return [];
    if (!showCompare || !comparePts.length) {
      const speeds = mainPts.map(p => p.speed);
      const minS = Math.min(...speeds), maxS = Math.max(...speeds, 1);
      return mainPts.slice(0, -1).map(p => {
        const t = Math.max(0, Math.min(1, (p.speed - minS) / (maxS - minS)));
        if (t < 0.25) return `hsl(${220 + t * 60},90%,60%)`;
        if (t < 0.5)  return `hsl(${175 - t * 60},85%,55%)`;
        if (t < 0.75) return `hsl(${90  - t * 60},90%,50%)`;
        return               `hsl(${30  - t * 30},95%,55%)`;
      });
    }
    // Dominance
    return mainPts.slice(0, -1).map((p, i) => {
      const mx = (p.x + mainPts[i + 1].x) / 2, my = (p.y + mainPts[i + 1].y) / 2;
      let best = comparePts[0], bestD = Infinity;
      for (const cp of comparePts) {
        const d = (cp.x - mx) ** 2 + (cp.y - my) ** 2;
        if (d < bestD) { best = cp; bestD = d; }
      }
      return p.speed >= (best?.speed ?? 0) ? color1 : color2;
    });
  }, [mainPts, comparePts, showCompare, color1, color2]);

  // Play / pause
  useEffect(() => {
    clearInterval(timerRef.current);
    if (playing && mainPts.length > 1) {
      timerRef.current = setInterval(() => setFrame(f => (f + 1) % mainPts.length), 600);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, mainPts.length]);

  // Reset on new data
  useEffect(() => { setFrame(0); setPlaying(false); }, [circuitMap]);

  const carPt = mainPts[frame] ?? mainPts[0];
  const isEmpty = !mainPts.length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase">
          Circuit Map{!isEmpty ? (showCompare && comparePts.length ? ' · dominance' : ' · speed') : ''}
        </div>
        <div className="flex items-center gap-3">
          {!isEmpty && (
            <button onClick={() => setPlaying(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all
                ${playing ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
              {playing ? <><Pause className="w-3 h-3" />STOP</> : <><Play className="w-3 h-3" />ANIMATE</>}
            </button>
          )}
          {!isEmpty && !showCompare && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded inline-block" style={{ background: 'hsl(0,95%,55%)' }} />Fast</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded inline-block" style={{ background: 'hsl(220,90%,60%)' }} />Slow</span>
            </div>
          )}
          {!isEmpty && showCompare && comparePts.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded inline-block" style={{ background: color1 }} />{code1}</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded inline-block" style={{ background: color2 }} />{code2}</span>
            </div>
          )}
        </div>
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center h-48 text-zinc-700 font-mono text-sm">GPS data not available</div>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* Background */}
            {mainPts.slice(0, -1).map((p, i) => (
              <line key={`bg${i}`} x1={p.x} y1={p.y} x2={mainPts[i+1].x} y2={mainPts[i+1].y}
                stroke="#3f3f46" strokeWidth={9} strokeLinecap="round" />
            ))}
            {/* Colored segments */}
            {mainPts.slice(0, -1).map((p, i) => (
              <line key={`c${i}`} x1={p.x} y1={p.y} x2={mainPts[i+1].x} y2={mainPts[i+1].y}
                stroke={segColors[i]} strokeWidth={4} strokeLinecap="round" />
            ))}
            {/* Start/finish */}
            {mainPts[0] && (
              <>
                <circle cx={mainPts[0].x} cy={mainPts[0].y} r={5} fill="#18181b" stroke="#fff" strokeWidth={2} />
                <text x={mainPts[0].x + 8} y={mainPts[0].y + 4} fill="#71717a" fontSize="9" fontFamily="monospace">S/F</text>
              </>
            )}
            {/* Animated car */}
            {playing && carPt && (
              <>
                <circle cx={carPt.x} cy={carPt.y} r={10} fill={color1} opacity={0.18} />
                <circle cx={carPt.x} cy={carPt.y} r={6}  fill={color1} opacity={0.9} />
              </>
            )}
          </svg>
          <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-zinc-700">
            <span>{mainPts.length} GPS pts</span>
            {playing && carPt && <span style={{ color: color1 }}>{Math.round(carPt.speed)} km/h</span>}
          </div>
        </>
      )}
    </div>
  );
}

// ─── SECTOR TABLE ─────────────────────────────────────────────────────────────
function SectorTable({ sectorsData, highlightCode, compareCode }) {
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
  const refRow = tableData.find(d => d.code === highlightCode) || leader;
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
              const dS1 = (d.s1 ?? 0) - (refRow?.s1 ?? 0);
              const dS2 = (d.s2 ?? 0) - (refRow?.s2 ?? 0);
              const dS3 = (d.s3 ?? 0) - (refRow?.s3 ?? 0);
              const isHL = d.code === highlightCode, isCmp = d.code === compareCode;
              return (
                <tr key={d.code} className={`border-b border-zinc-900 hover:bg-zinc-800/30 transition-colors ${isHL ? 'bg-zinc-800/50' : isCmp ? 'bg-zinc-800/20' : ''}`}>
                  <td className="py-1.5 pr-2 text-zinc-500">{i + 1}</td>
                  <td className="py-1.5 pr-2">
                    <span className={isHL ? 'text-white font-bold' : 'font-bold'} style={{ color: isHL ? undefined : d.color }}>{d.code}</span>
                    {isHL && <span className="text-zinc-600 ml-1 text-[9px]">◀</span>}
                    {isCmp && <span className="text-zinc-600 ml-1 text-[9px]">◁</span>}
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
export default function LiveTimingPage() {
  // Selections
  const [year, setYear]               = useState(null);
  const [meetings, setMeetings]       = useState([]);
  const [meeting, setMeeting]         = useState(null);
  const [sessionType, setSessionType] = useState('Q');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [drivers, setDrivers]         = useState([]);
  const [driverCode, setDriverCode]   = useState(null);
  const [compareCode, setCompareCode] = useState(null);
  const [showCompare, setShowCompare] = useState(false);

  // Lap selectors
  const [driver1Laps, setDriver1Laps]     = useState([]);
  const [driver2Laps, setDriver2Laps]     = useState([]);
  const [selectedLap1, setSelectedLap1]   = useState(null);
  const [selectedLap2, setSelectedLap2]   = useState(null);

  // Data
  const [telemetry, setTelemetry]                   = useState([]);
  const [compareTelemetry, setCompareTelemetry]     = useState([]);
  const [fastestLap1, setFastestLap1]               = useState(null);
  const [fastestLap2, setFastestLap2]               = useState(null);
  const [fullData1, setFullData1]                   = useState(null);
  const [fullData2, setFullData2]                   = useState(null);
  const [circuitMap, setCircuitMap]                 = useState([]);
  const [compareCircuitMap, setCompareCircuitMap]   = useState([]);
  const [weather, setWeather]                       = useState(null);
  const [sectorsData, setSectorsData]               = useState(null);
  const [positionsData, setPositionsData]           = useState(null);

  // UI
  const [chartMode, setChartMode]   = useState('lap');
  const [activeTab, setActiveTab]   = useState('speed');
  const [loading, setLoading]       = useState(false);
  const [loadStep, setLoadStep]     = useState('');
  const [error, setError]           = useState(null);
  const [lastQuery, setLastQuery]   = useState(null);

  // Dropdown open states
  const [openYear, setOpenYear]       = useState(false);
  const [openMeeting, setOpenMeeting] = useState(false);
  const [openSession, setOpenSession] = useState(false);
  const [openDriver, setOpenDriver]   = useState(false);
  const [openCompare, setOpenCompare] = useState(false);

  const r1=useRef(null),r2=useRef(null),r3=useRef(null),r4=useRef(null),r5=useRef(null);
  useOutsideClose([r1,r2,r3,r4,r5],[setOpenYear,setOpenMeeting,setOpenSession,setOpenDriver,setOpenCompare]);

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
    try { await loadDriversForSession(m, SESSION_TYPES.find(s => s.id === sessionType)?.name || 'Qualifying'); }
    catch { setDrivers([]); }
  };

  const handleSessionChange = async (sid) => {
    setSessionType(sid); setOpenSession(false); setDrivers([]); setSessionInfo(null);
    if (!meeting) return;
    try { await loadDriversForSession(meeting, SESSION_TYPES.find(s => s.id === sid)?.name || sid); }
    catch { setDrivers([]); }
  };

  const fetchAll = async () => {
    if (!year || !meeting || !driverCode || !sessionInfo) return;
    setLoading(true); setError(null);
    setTelemetry([]); setCompareTelemetry([]);
    setFastestLap1(null); setFastestLap2(null);
    setFullData1(null); setFullData2(null);
    setCircuitMap([]); setCompareCircuitMap([]);
    setWeather(null); setSectorsData(null); setPositionsData(null);
    setDriver1Laps([]); setDriver2Laps([]);

    const sk = sessionInfo.session_key;
    try {
      setLoadStep('Telemetria giro…');
      const num1 = await getDriverNumber(sk, driverCode);
      const r1 = await getTelemetry(sk, num1, selectedLap1);
      setTelemetry(r1.telemetry); setFastestLap1(r1.target_lap);
      setDriver1Laps(await getAllLaps(sk, num1));

      setLoadStep('GPS circuito (giro 1)…');
      try { setCircuitMap(await getCircuitMap(sk, num1, null)); } catch { /* optional */ }

      setLoadStep('Sessione completa…');
      try { setFullData1(await getFullSessionTelemetry(sk, num1)); } catch { /* optional */ }

      if (showCompare && compareCode && compareCode !== driverCode) {
        setLoadStep(`Dati ${compareCode}…`);
        try {
          const num2 = await getDriverNumber(sk, compareCode);
          const r2 = await getTelemetry(sk, num2, selectedLap2);
          setCompareTelemetry(r2.telemetry); setFastestLap2(r2.target_lap);
          setDriver2Laps(await getAllLaps(sk, num2));
          try { setCompareCircuitMap(await getCircuitMap(sk, num2, null)); } catch { /* optional */ }
          try { setFullData2(await getFullSessionTelemetry(sk, num2)); } catch { /* optional */ }
        } catch { /* optional */ }
      }

      setLoadStep('Meteo + settori…');
      try { setWeather(await getWeather(sk)); } catch { /* optional */ }
      try { setSectorsData(await getAllDriversSectors(sk)); } catch { /* optional */ }
      if (sessionType === 'R') {
        try { setPositionsData(await getRacePositions(sk)); } catch { /* optional */ }
      }

      setLastQuery({ year, gp: meeting.meeting_name, session: sessionType, driver: driverCode });
    } catch (e) {
      setError(e.message || 'Errore sconosciuto');
    } finally { setLoading(false); setLoadStep(''); }
  };

  const refetchLap = async (lapNum, isCompare) => {
    if (!sessionInfo) return;
    const sk = sessionInfo.session_key;
    try {
      if (!isCompare) {
        const num = await getDriverNumber(sk, driverCode);
        const r = await getTelemetry(sk, num, lapNum);
        setTelemetry(r.telemetry); setFastestLap1(r.target_lap);
        try { setCircuitMap(await getCircuitMap(sk, num, lapNum)); } catch { /* optional */ }
      } else {
        const num = await getDriverNumber(sk, compareCode);
        const r = await getTelemetry(sk, num, lapNum);
        setCompareTelemetry(r.telemetry); setFastestLap2(r.target_lap);
        try { setCompareCircuitMap(await getCircuitMap(sk, num, lapNum)); } catch { /* optional */ }
      }
    } catch (e) { setError(e.message); }
  };

  const handleLap1 = n => { setSelectedLap1(n); if (telemetry.length) refetchLap(n, false); };
  const handleLap2 = n => { setSelectedLap2(n); if (compareTelemetry.length) refetchLap(n, true); };

  const stats = useMemo(() => {
    if (!telemetry.length) return null;
    const spd = telemetry.map(d => d.speed).filter(Boolean);
    const rpm = telemetry.map(d => d.rpm).filter(Boolean);
    return {
      maxSpeed: spd.length ? Math.max(...spd) : 0,
      avgSpeed: spd.length ? Math.round(spd.reduce((a,b)=>a+b,0)/spd.length) : 0,
      maxRpm:   rpm.length ? Math.max(...rpm) : 0,
      points:   telemetry.length,
    };
  }, [telemetry]);

  const driverInfo  = drivers.find(d => d.name_acronym === driverCode);
  const compareInfo = drivers.find(d => d.name_acronym === compareCode);
  const color1 = driverInfo?.team_colour  ? `#${driverInfo.team_colour}`  : '#ef4444';
  const color2 = compareInfo?.team_colour ? `#${compareInfo.team_colour}` : '#3b82f6';

  const canFetch = !!year && !!meeting && !!driverCode && !!sessionInfo && !loading;
  const flagCode = meeting ? getFlagCode(meeting.location || meeting.meeting_name || '') : '';
  const fast1 = driver1Laps.length ? driver1Laps.reduce((a,b)=>a.lap_duration<b.lap_duration?a:b).lap_number : null;
  const fast2 = driver2Laps.length ? driver2Laps.reduce((a,b)=>a.lap_duration<b.lap_duration?a:b).lap_number : null;

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

          {/* Compare + Fetch row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5">
              <span className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase">Compare</span>
              <button onClick={() => setShowCompare(v=>!v)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${showCompare?'bg-red-600 text-white':'bg-zinc-800 text-zinc-500 hover:text-white'}`}>
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
                    className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 ${compareCode===d.name_acronym?'bg-red-600/15 border-l-2 border-red-600 pl-4':''}`}>
                    {d.headshot_url && <img src={d.headshot_url} alt="" className="w-6 h-6 rounded-full object-cover" />}
                    <span className="font-mono text-sm text-white">{d.name_acronym}</span>
                    <span className="text-zinc-500 text-xs ml-1">{d.team_name}</span>
                  </button>
                ))}
              </Dropdown>
            )}
            <div className="flex-1" />
            {lastQuery && <div className="hidden lg:block text-xs text-zinc-700 font-mono">{lastQuery.year} · {lastQuery.gp} · {lastQuery.driver} · {lastQuery.session}</div>}
            <button onClick={fetchAll} disabled={!canFetch}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono font-bold text-sm transition-all ${canFetch?'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50':'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}>
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />{loadStep||'Loading…'}</> : <><Search className="w-4 h-4" />FETCH TELEMETRY</>}
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
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 flex flex-wrap items-center gap-x-8 gap-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {driver1Laps.length > 0 && (
                    <LapSelector laps={driver1Laps} selectedLap={selectedLap1} onSelect={handleLap1} fastestLapNumber={fast1} color={color1} label={driverCode} />
                  )}
                  {showCompare && driver2Laps.length > 0 && (
                    <LapSelector laps={driver2Laps} selectedLap={selectedLap2} onSelect={handleLap2} fastestLapNumber={fast2} color={color2} label={compareCode} />
                  )}
                </div>
                {fastestLap1 && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <div className="text-xs font-mono">
                      <span className="text-zinc-600 uppercase mr-2">Time</span>
                      <span className="text-white font-black">{formatTime(fastestLap1.lap_duration)}</span>
                      {fastestLap2 && <span className="text-zinc-600 ml-2">vs <span style={{ color: color2 }}>{formatTime(fastestLap2.lap_duration)}</span></span>}
                    </div>
                    {[1,2,3].map(s => fastestLap1[`sector_${s}`] ? (
                      <div key={s} className="text-xs font-mono">
                        <span className="text-zinc-600 mr-1">S{s}</span>
                        <span className="text-zinc-300">{fastestLap1[`sector_${s}`].toFixed(3)}s</span>
                        {fastestLap2?.[`sector_${s}`] && (
                          <span className={`ml-1 ${fastestLap1[`sector_${s}`] < fastestLap2[`sector_${s}`] ? 'text-green-400' : 'text-red-400'}`}>
                            ({formatDelta(fastestLap1[`sector_${s}`] - fastestLap2[`sector_${s}`])})
                          </span>
                        )}
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

              {/* Telemetry chart */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Mode toggle */}
                    <div className="flex bg-zinc-800 rounded-lg p-0.5">
                      {[['lap','Single Lap'],['race','Full Session']].map(([m, lbl]) => (
                        <button key={m} onClick={() => setChartMode(m)}
                          className={`px-3 py-1 text-xs rounded-md font-mono transition-all ${chartMode===m?'bg-zinc-600 text-white':'text-zinc-500 hover:text-zinc-300'}`}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                    <div className="text-[10px] text-zinc-600 font-mono flex items-center gap-2">
                      <span style={{ color: color1 }}>● {driverCode}</span>
                      {showCompare && (compareTelemetry.length > 0 || fullData2) && (
                        <><span className="text-zinc-700">·</span><span style={{ color: color2 }}>╌ {compareCode}</span></>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(chartMode === 'race' ? ['speed','rpm'] : ['speed','rpm','gear','inputs']).map(t => (
                      <button key={t} onClick={() => setActiveTab(t)}
                        className={`px-3 py-1 text-xs rounded-lg font-mono transition-all ${activeTab===t?'bg-red-600 text-white':'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <TelemetryChart
                  data1={telemetry}
                  data2={showCompare ? compareTelemetry : []}
                  code1={driverCode} code2={compareCode || ''}
                  color1={color1} color2={color2}
                  tab={activeTab} mode={chartMode}
                  fullData1={fullData1}
                  fullData2={showCompare ? fullData2 : null}
                />
              </div>

              {/* Map + Sectors */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CircuitSpeedMap
                  circuitMap={circuitMap} compareCircuitMap={showCompare ? compareCircuitMap : []}
                  color1={color1} color2={color2} code1={driverCode} code2={compareCode}
                  showCompare={showCompare && compareCircuitMap.length > 0}
                />
                <SectorTable sectorsData={sectorsData} highlightCode={driverCode} compareCode={showCompare ? compareCode : null} />
              </div>

              {/* Race positions */}
              {sessionType === 'R' && (
                <RacePositionsChart positionsData={positionsData}
                  highlightCodes={[driverCode, showCompare&&compareCode].filter(Boolean)} />
              )}
            </div>
          )}

          {!loading && !error && !telemetry.length && (
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