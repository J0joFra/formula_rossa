"use client";
import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Flag, Timer } from 'lucide-react';

// ─── Team Colors ─────────────────────────────────────────────────────────────
const TEAM_COLORS = {
  'ferrari': '#F91536',
  'mercedes': '#6CD3BF',
  'red-bull': '#3671C6',
  'mclaren': '#F58020',
  'aston-martin': '#2D826D',
  'alpine': '#2090D0',
  'williams': '#64C4FF',
  'rb': '#6692FF',
  'haas': '#B6BABD',
  'kick-sauber': '#52E252',
  'sauber': '#006F62',
  'bmw-sauber': '#1B3C8C',
  'alfa-romeo': '#9B0000',
  'renault': '#FFD800',
  'lotus-renault': '#111111',
  'lotus': '#005A2C',
  'team-lotus': '#005A2C',
  'brabham': '#003366',
  'tyrrell': '#0033A0',
  'benetton': '#008C45',
  'brawn': '#B7E000',
  'honda': '#FFFFFF',
  'jaguar': '#005A2C',
  'stewart': '#FFFFFF',
  'bar': '#FFFFFF',
  'toyota': '#CC0000',
  'toro-rosso': '#1E5BC6',
  'force-india': '#FF5F00',
  'jordan': '#FFD800',
  'arrows': '#FF6600',
  'minardi': '#1a1a1a',
  'hrt': '#B30000',
  'caterham': '#005030',
  'marussia': '#9B0000',
  'manor': '#003A8F',
  'super-aguri': '#CCCCCC',
  'spyker': '#FF6600',
  'default': '#888888',
};

function getGainColor(gain) {
  if (gain > 0) return '#22c55e';
  if (gain < 0) return '#ef4444';
  return '#71717a';
}

// ─── GRID → RACE CHART ───────────────────────────────────────────────────────
function GridToRaceChart({ raceResults, year, grandPrix }) {
  const [highlight, setHighlight] = useState(null);
  const [filter, setFilter]       = useState('all');

  const drivers = useMemo(() => {
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

  const filtered = useMemo(() =>
    filter === 'all' ? drivers : drivers.filter(d => d.gainCategory === filter),
    [drivers, filter]
  );

  const byGrid = useMemo(() => [...filtered].sort((a, b) => a.gridPos - b.gridPos), [filtered]);
  const byRace = useMemo(() => [...filtered].sort((a, b) => a.racePos - b.racePos), [filtered]);

  const stats = useMemo(() => {
    if (!drivers.length) return {};
    const gained = drivers.filter(d => d.gain > 0).length;
    const lost   = drivers.filter(d => d.gain < 0).length;
    const same   = drivers.filter(d => d.gain === 0).length;
    const maxD   = drivers.reduce((a, b) => b.gain > a.gain ? b : a);
    const minD   = drivers.reduce((a, b) => b.gain < a.gain ? b : a);
    return { gained, lost, same, maxD, minD };
  }, [drivers]);

  if (!drivers.length) return (
    <div className="flex items-center justify-center h-40 text-zinc-600 font-mono text-sm tracking-widest uppercase">
      No race results available
    </div>
  );

  const ROW_H = 32, SVG_W = 960;
  const N     = Math.max(byGrid.length, byRace.length);
  const SVG_H = N * ROW_H + 72;
  const LX = 230, RX = 730;

  const gridY = {}, raceY = {};
  byGrid.forEach((d, i) => { gridY[d.id] = 54 + i * ROW_H; });
  byRace.forEach((d, i) => { raceY[d.id] = 54 + i * ROW_H; });

  const FILTERS = [
    { key: 'all',    label: `ALL · ${drivers.length}`,    ac: 'bg-white/10 text-white border-white/25' },
    { key: 'gained', label: `▲ GAINED · ${stats.gained}`, ac: 'bg-green-500/15 text-green-400 border-green-500/40' },
    { key: 'lost',   label: `▼ LOST · ${stats.lost}`,     ac: 'bg-red-500/15 text-red-400 border-red-500/40' },
    { key: 'same',   label: `● SAME · ${stats.same}`,     ac: 'bg-zinc-700/60 text-zinc-300 border-zinc-600/40' },
  ];

  return (
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label, ac }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3.5 py-2 rounded-xl text-[11px] font-mono tracking-widest border transition-all duration-200 ${
              filter === key ? ac : 'bg-white/5 text-zinc-600 border-white/8 hover:text-zinc-300 hover:bg-white/8'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'GAINED',     value: `+${stats.gained}`, color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)' },
          { label: 'LOST',       value: stats.lost,          color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)' },
          { label: 'BEST GAIN',  value: stats.maxD?.code ? `${stats.maxD.code}  +${stats.maxD.gain}` : '—',
            color: stats.maxD?.color || '#22c55e', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)' },
          { label: 'WORST DROP', value: stats.minD?.code ? `${stats.minD.code}  ${stats.minD.gain}` : '—',
            color: '#ef4444', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className="rounded-xl px-4 py-3" style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="text-[9px] text-zinc-600 font-mono tracking-[0.25em] uppercase mb-1">{label}</div>
            <div className="text-2xl font-black font-mono leading-none" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Slope chart */}
      <div className="overflow-x-auto rounded-xl" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ minWidth: 500, display: 'block' }}>
          <defs>
            {filtered.map(d => (
              <linearGradient key={`g-${d.id}`} id={`gr-${d.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor={d.color} stopOpacity="1" />
                <stop offset="40%"  stopColor={d.color} stopOpacity="0.7" />
                <stop offset="60%"  stopColor={d.color} stopOpacity="0.7" />
                <stop offset="100%" stopColor={d.color} stopOpacity="1" />
              </linearGradient>
            ))}
          </defs>

          {/* Column header backgrounds */}
          <rect x={0}      y={0} width={LX + 30}         height={SVG_H} fill="rgba(255,255,255,0.012)" />
          <rect x={RX - 30} y={0} width={SVG_W - (RX - 30)} height={SVG_H} fill="rgba(255,255,255,0.012)" />

          {/* Column labels */}
          <text x={LX / 2 + 15}        y={28} textAnchor="middle" fill="#3f3f46" fontSize={10} fontFamily="monospace" letterSpacing="6">GRIGLIA PARTENZA</text>
          <text x={(SVG_W + RX) / 2 - 15} y={28} textAnchor="middle" fill="#3f3f46" fontSize={10} fontFamily="monospace" letterSpacing="6">ARRIVO GARA</text>

          {/* Vertical rails */}
          <line x1={LX} y1={36} x2={LX} y2={SVG_H - 8} stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="3 6" />
          <line x1={RX} y1={36} x2={RX} y2={SVG_H - 8} stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="3 6" />

          {/* Zebra row bands */}
          {byGrid.map((d, i) => i % 2 === 0 && (
            <rect key={`z-${d.id}`} x={LX + 1} y={gridY[d.id] - ROW_H / 2}
              width={RX - LX - 2} height={ROW_H} fill="rgba(255,255,255,0.014)" />
          ))}

          {/* Curves */}
          {[false, true].map(hlPass =>
            filtered.map(d => {
              const y1 = gridY[d.id], y2 = raceY[d.id];
              if (y1 == null || y2 == null) return null;
              const isHL  = highlight === d.id;
              if (hlPass !== isHL) return null;
              const dimmed = highlight && !isHL;

              const opacity = dimmed ? 0.08 : 1;
              const sw      = isHL ? 9 : 7;
              const cx1 = LX + (RX - LX) * 0.35;
              const cx2 = LX + (RX - LX) * 0.65;
              const path = `M ${LX} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${RX} ${y2}`;

              return (
                <g key={d.id}>
                  <path d={path} fill="none" stroke="transparent" strokeWidth={22}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHighlight(d.id)}
                    onMouseLeave={() => setHighlight(null)} />
                  {isHL && <path d={path} fill="none" stroke={d.color} strokeWidth={16} opacity={0.15} strokeLinecap="round" />}
                  <path d={path} fill="none" stroke={`url(#gr-${d.id})`} strokeWidth={sw} opacity={opacity} strokeLinecap="round" />
                  {isHL && <>
                    <circle cx={LX} cy={y1} r={9} fill={d.color} opacity={0.18} />
                    <circle cx={RX} cy={y2} r={9} fill={d.color} opacity={0.18} />
                  </>}
                  <circle cx={LX} cy={y1} r={isHL ? 8 : 6} fill={d.color} opacity={opacity} />
                  <circle cx={RX} cy={y2} r={isHL ? 8 : 6} fill={d.color} opacity={opacity} />
                </g>
              );
            })
          )}

          {/* Left labels */}
          {byGrid.map(d => {
            const y = gridY[d.id];
            const isHL = highlight === d.id;
            const dim  = highlight && !isHL;
            return (
              <g key={`L-${d.id}`}
                onMouseEnter={() => setHighlight(d.id)}
                onMouseLeave={() => setHighlight(null)}
                style={{ cursor: 'pointer' }}>
                {isHL && <rect x={6} y={y - 14} width={LX - 16} height={28} rx={5} fill={d.color} fillOpacity={0.12} />}
                <text x={36} y={y + 5} textAnchor="middle" fontSize={dim ? 9 : isHL ? 11 : 10} fontWeight={700} fontFamily="monospace"
                  fill={dim ? '#2a2a2a' : isHL ? d.color : '#4b4b4b'}>P{d.gridPos}</text>
                <text x={LX - 14} y={y + 5} textAnchor="end" fontSize={dim ? 11 : isHL ? 15 : 13} fontWeight={isHL ? 900 : 700} fontFamily="monospace"
                  fill={dim ? '#252525' : isHL ? '#ffffff' : '#fffefe'}>{d.code}</text>
              </g>
            );
          })}

          {/* Right labels */}
          {byRace.map(d => {
            const y = raceY[d.id];
            const isHL = highlight === d.id;
            const dim  = highlight && !isHL;
            const gc   = getGainColor(d.gain);
            return (
              <g key={`R-${d.id}`}
                onMouseEnter={() => setHighlight(d.id)}
                onMouseLeave={() => setHighlight(null)}
                style={{ cursor: 'pointer' }}>
                {isHL && <rect x={RX + 16} y={y - 14} width={SVG_W - RX - 22} height={28} rx={5} fill={d.color} fillOpacity={0.12} />}
                <text x={RX + 16} y={y + 5} textAnchor="start" fontSize={dim ? 11 : isHL ? 15 : 13} fontWeight={isHL ? 900 : 700} fontFamily="monospace"
                  fill={dim ? '#252525' : isHL ? '#ffffff' : '#fffefe'}>{d.code}</text>
                <text x={SVG_W - 10} y={y + 5} textAnchor="end" fontSize={dim ? 9 : isHL ? 11 : 10} fontWeight={700} fontFamily="monospace"
                  fill={dim ? '#2a2a2a' : isHL ? gc : '#4b4b4b'}>
                  {isHL && d.gain !== 0
                    ? (d.gain > 0 ? `▲+${d.gain}` : `▼${d.gain}`)
                    : `P${d.racePos}`}
                </text>
              </g>
            );
          })}

          {/* Hover tooltip */}
          {highlight && (() => {
            const d  = filtered.find(x => x.id === highlight);
            if (!d) return null;
            const gy  = gridY[d.id] ?? 0;
            const ry  = raceY[d.id] ?? 0;
            const midY = Math.min(Math.max((gy + ry) / 2, 55), SVG_H - 75);
            const midX = (LX + RX) / 2;
            const gc   = getGainColor(d.gain);
            const tw   = 168;
            return (
              <g>
                <rect x={midX - tw / 2 + 3} y={midY - 42 + 3} width={tw} height={78} rx={10} fill="rgba(0,0,0,0.6)" />
                <rect x={midX - tw / 2}     y={midY - 42}     width={tw} height={78} rx={10} fill="#0d0d0d" stroke={d.color} strokeWidth={1.5} strokeOpacity={0.7} />
                <rect x={midX - tw / 2}     y={midY - 42}     width={4} height={78} rx={3} fill={d.color} />
                <circle cx={midX - tw / 2 + 20} cy={midY - 18} r={4} fill={d.color} />
                <text x={midX - tw / 2 + 32} y={midY - 14} textAnchor="start" fill="#ffffff" fontSize={16} fontWeight={900} fontFamily="monospace">{d.code}</text>
                <text x={midX - tw / 2 + 12} y={midY + 2}  textAnchor="start" fill="#6b7280" fontSize={9.5} fontFamily="monospace" letterSpacing={1}>
                  GRID P{d.gridPos}  →  RACE P{d.racePos}
                </text>
                <text x={midX} y={midY + 22} textAnchor="middle" fill={gc} fontSize={14} fontWeight={900} fontFamily="monospace">
                  {d.gain > 0 ? `▲ +${d.gain} POSITIONS` : d.gain < 0 ? `▼ ${d.gain} POSITIONS` : '● NO CHANGE'}
                </text>
                {d.points > 0 && (
                  <text x={midX} y={midY + 36} textAnchor="middle" fill="#3f3f46" fontSize={9} fontFamily="monospace">{d.points} PTS</text>
                )}
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5">
        <span className="text-[9px] text-zinc-700 font-mono tracking-[0.3em] uppercase">Legend</span>
        <span className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
          <span className="inline-block w-8 h-0.5 rounded" style={{ background: 'linear-gradient(90deg,#888,#888)' }} /> Team color (all lines)
        </span>
        <span className="ml-auto text-[10px] text-zinc-800 font-mono tracking-widest">HOVER TO HIGHLIGHT</span>
      </div>
    </div>
  );
}

// ─── Q1 → Q2 → Q3 PROGRESSION CHART ─────────────────────────────────────────
function QualiProgressionChart({ qualiResults, year, grandPrix }) {
  const [highlight, setHighlight] = useState(null);
  const [filterElim, setFilterElim] = useState(true); // show elimination markers

  // qualiResults: array of { driverId, constructorId, q1Millis, q2Millis, q3Millis, q1pos, q2pos, q3pos }
  const drivers = useMemo(() => {
    if (!qualiResults?.length) return [];
    return qualiResults.map(r => {
      const parts = (r.driverId || '').split('-');
      const code  = parts[parts.length - 1].toUpperCase().substring(0, 3);
      return {
        id: r.driverId, code,
        color: TEAM_COLORS[r.constructorId] || TEAM_COLORS.default,
        q1pos: r.q1pos ?? null,
        q2pos: r.q2pos ?? null,
        q3pos: r.q3pos ?? null,
        q1t: r.q1Millis ?? null,
        q2t: r.q2Millis ?? null,
        q3t: r.q3Millis ?? null,
        eliminatedAfter: r.q3pos != null ? null : r.q2pos != null ? 'Q2' : 'Q1',
      };
    });
  }, [qualiResults]);

  if (!drivers.length) return (
    <div className="flex items-center justify-center h-40 text-zinc-600 font-mono text-sm tracking-widest uppercase">
      No qualifying data available
    </div>
  );

  // Layout: 3 columns for Q1, Q2, Q3
  const ROW_H = 30, SVG_W = 960, PAD_TOP = 54;
  const totalRows = Math.max(
    drivers.filter(d => d.q1pos != null).length,
    drivers.filter(d => d.q2pos != null).length,
    drivers.filter(d => d.q3pos != null).length,
    15
  );
  const SVG_H = totalRows * ROW_H + PAD_TOP + 24;

  // Column X positions
  const COLS = [200, 480, 760];
  const LABELS = ['Q1', 'Q2', 'Q3'];
  const COL_COLORS = ['#6366f1', '#f59e0b', '#ef4444'];

  // Build position maps per round
  const q1sorted = [...drivers].filter(d => d.q1pos != null).sort((a, b) => a.q1pos - b.q1pos);
  const q2sorted = [...drivers].filter(d => d.q2pos != null).sort((a, b) => a.q2pos - b.q2pos);
  const q3sorted = [...drivers].filter(d => d.q3pos != null).sort((a, b) => a.q3pos - b.q3pos);

  const makeYMap = (sorted) => {
    const m = {};
    sorted.forEach((d, i) => { m[d.id] = PAD_TOP + i * ROW_H; });
    return m;
  };

  const y1map = makeYMap(q1sorted);
  const y2map = makeYMap(q2sorted);
  const y3map = makeYMap(q3sorted);

  const getY = (d, round) => {
    if (round === 0) return y1map[d.id];
    if (round === 1) return y2map[d.id];
    return y3map[d.id];
  };
  const hasRound = (d, round) => {
    if (round === 0) return d.q1pos != null;
    if (round === 1) return d.q2pos != null;
    return d.q3pos != null;
  };

  return (
    <div className="space-y-6">
      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Q1 RUNNERS', value: q1sorted.length, color: COL_COLORS[0], bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
          { label: 'Q2 RUNNERS', value: q2sorted.length, color: COL_COLORS[1], bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
          { label: 'Q3 RUNNERS', value: q3sorted.length, color: COL_COLORS[2], bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className="rounded-xl px-4 py-3" style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="text-[9px] font-mono tracking-[0.25em] uppercase mb-1" style={{ color: `${color}99` }}>{label}</div>
            <div className="text-3xl font-black font-mono leading-none" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="overflow-x-auto rounded-xl" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ minWidth: 500, display: 'block' }}>
          <defs>
            {drivers.map(d => (
              <linearGradient key={`qg-${d.id}`} id={`qg-${d.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor={d.color} stopOpacity="1" />
                <stop offset="100%" stopColor={d.color} stopOpacity="0.8" />
              </linearGradient>
            ))}
          </defs>

          {/* Column backgrounds */}
          {COLS.map((cx, ci) => (
            <g key={`colbg-${ci}`}>
              <rect x={ci === 0 ? 0 : COLS[ci - 1] + 40} y={0}
                width={ci === 0 ? COLS[0] + 40 : (ci === 2 ? SVG_W - (COLS[1] + 40) : COLS[1] - COLS[0] - 80)}
                height={SVG_H} fill="rgba(255,255,255,0.012)" />
            </g>
          ))}

          {/* Column headers */}
          {COLS.map((cx, ci) => (
            <g key={`ch-${ci}`}>
              <rect x={cx - 20} y={8} width={40} height={28} rx={6}
                fill={COL_COLORS[ci]} fillOpacity={0.15} />
              <rect x={cx - 20} y={8} width={40} height={28} rx={6}
                fill="none" stroke={COL_COLORS[ci]} strokeWidth={1} strokeOpacity={0.4} />
              <text x={cx} y={26} textAnchor="middle" fill={COL_COLORS[ci]}
                fontSize={12} fontWeight={900} fontFamily="monospace" letterSpacing={2}>
                {LABELS[ci]}
              </text>
            </g>
          ))}

          {/* Vertical rails */}
          {COLS.map((cx, ci) => (
            <line key={`vr-${ci}`} x1={cx} y1={42} x2={cx} y2={SVG_H - 8}
              stroke={COL_COLORS[ci]} strokeWidth={1} strokeOpacity={0.2} strokeDasharray="3 6" />
          ))}

          {/* Zebra bands per column */}
          {q1sorted.map((d, i) => i % 2 === 0 && (
            <rect key={`zq1-${d.id}`} x={COLS[0] + 1} y={y1map[d.id] - ROW_H / 2}
              width={COLS[1] - COLS[0] - 2} height={ROW_H} fill="rgba(255,255,255,0.012)" />
          ))}

          {/* Curves: Q1→Q2 and Q2→Q3 */}
          {[false, true].map(hlPass =>
            drivers.map(d => {
              const isHL = highlight === d.id;
              if (hlPass !== isHL) return null;
              const dimmed = highlight && !isHL;
              const opacity = dimmed ? 0.07 : 1;
              const sw = isHL ? 8 : 6;

              const segments = [];
              // Q1 → Q2
              if (hasRound(d, 0) && hasRound(d, 1)) {
                const y1 = getY(d, 0), y2 = getY(d, 1);
                const cx1 = COLS[0] + (COLS[1] - COLS[0]) * 0.38;
                const cx2 = COLS[0] + (COLS[1] - COLS[0]) * 0.62;
                segments.push({ path: `M ${COLS[0]} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${COLS[1]} ${y2}`, fromX: COLS[0], fromY: y1, toX: COLS[1], toY: y2 });
              }
              // Q2 → Q3
              if (hasRound(d, 1) && hasRound(d, 2)) {
                const y1 = getY(d, 1), y2 = getY(d, 2);
                const cx1 = COLS[1] + (COLS[2] - COLS[1]) * 0.38;
                const cx2 = COLS[1] + (COLS[2] - COLS[1]) * 0.62;
                segments.push({ path: `M ${COLS[1]} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${COLS[2]} ${y2}`, fromX: COLS[1], fromY: y1, toX: COLS[2], toY: y2 });
              }

              return (
                <g key={d.id}>
                  {segments.map((seg, si) => (
                    <g key={si}>
                      <path d={seg.path} fill="none" stroke="transparent" strokeWidth={20}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHighlight(d.id)}
                        onMouseLeave={() => setHighlight(null)} />
                      {isHL && <path d={seg.path} fill="none" stroke={d.color} strokeWidth={14} opacity={0.18} strokeLinecap="round" />}
                      <path d={seg.path} fill="none" stroke={`url(#qg-${d.id})`} strokeWidth={sw} opacity={opacity} strokeLinecap="round" />
                    </g>
                  ))}
                  {/* Endpoint dots per round */}
                  {[0, 1, 2].map(ri => {
                    if (!hasRound(d, ri)) return null;
                    const cx = COLS[ri];
                    const cy = getY(d, ri);
                    return (
                      <g key={ri}
                        onMouseEnter={() => setHighlight(d.id)}
                        onMouseLeave={() => setHighlight(null)}
                        style={{ cursor: 'pointer' }}>
                        {isHL && <circle cx={cx} cy={cy} r={10} fill={d.color} opacity={0.15} />}
                        <circle cx={cx} cy={cy} r={isHL ? 7 : 5} fill={d.color} opacity={opacity} />
                        {/* Eliminated marker: X on last round dot if not in next */}
                        {!hasRound(d, ri + 1) && ri < 2 && (
                          <g>
                            <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} stroke="#1a1a1a" strokeWidth={2.5} />
                            <line x1={cx + 5} y1={cy - 5} x2={cx - 5} y2={cy + 5} stroke="#1a1a1a" strokeWidth={2.5} />
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })
          )}

          {/* Left labels (Q1 order) */}
          {q1sorted.map(d => {
            const y = y1map[d.id];
            const isHL = highlight === d.id;
            const dim  = highlight && !isHL;
            return (
              <g key={`ql1-${d.id}`}
                onMouseEnter={() => setHighlight(d.id)}
                onMouseLeave={() => setHighlight(null)}
                style={{ cursor: 'pointer' }}>
                {isHL && <rect x={6} y={y - 14} width={COLS[0] - 16} height={28} rx={5} fill={d.color} fillOpacity={0.12} />}
                <text x={32} y={y + 5} textAnchor="middle" fontSize={dim ? 9 : isHL ? 11 : 10}
                  fontWeight={700} fontFamily="monospace" fill={dim ? '#2a2a2a' : isHL ? d.color : '#4b4b4b'}>
                  P{d.q1pos}
                </text>
                <text x={COLS[0] - 12} y={y + 5} textAnchor="end"
                  fontSize={dim ? 11 : isHL ? 15 : 13} fontWeight={isHL ? 900 : 700} fontFamily="monospace"
                  fill={dim ? '#252525' : isHL ? '#ffffff' : '#e0e0e0'}>
                  {d.code}
                </text>
              </g>
            );
          })}

          {/* Right labels (Q3 order, or Q2 if no Q3) */}
          {(q3sorted.length > 0 ? q3sorted : q2sorted).map(d => {
            const y = q3sorted.length > 0 ? y3map[d.id] : y2map[d.id];
            const pos = q3sorted.length > 0 ? d.q3pos : d.q2pos;
            const isHL = highlight === d.id;
            const dim  = highlight && !isHL;
            return (
              <g key={`qlr-${d.id}`}
                onMouseEnter={() => setHighlight(d.id)}
                onMouseLeave={() => setHighlight(null)}
                style={{ cursor: 'pointer' }}>
                {isHL && <rect x={COLS[2] + 14} y={y - 14} width={SVG_W - COLS[2] - 20} height={28} rx={5} fill={d.color} fillOpacity={0.12} />}
                <text x={COLS[2] + 14} y={y + 5} textAnchor="start"
                  fontSize={dim ? 11 : isHL ? 15 : 13} fontWeight={isHL ? 900 : 700} fontFamily="monospace"
                  fill={dim ? '#252525' : isHL ? '#ffffff' : '#e0e0e0'}>
                  {d.code}
                </text>
                <text x={SVG_W - 8} y={y + 5} textAnchor="end"
                  fontSize={dim ? 9 : isHL ? 11 : 10} fontWeight={700} fontFamily="monospace"
                  fill={dim ? '#2a2a2a' : isHL ? d.color : '#4b4b4b'}>
                  P{pos}
                </text>
              </g>
            );
          })}

          {/* Hover tooltip */}
          {highlight && (() => {
            const d = drivers.find(x => x.id === highlight);
            if (!d) return null;
            const bestY = y3map[d.id] ?? y2map[d.id] ?? y1map[d.id] ?? 100;
            const midX  = COLS[1];
            const midY  = Math.min(Math.max(bestY, 55), SVG_H - 90);
            const tw    = 190;
            const fmtT  = (ms) => ms == null ? '—' : `${Math.floor(ms/60000)}:${((ms%60000)/1000).toFixed(3).padStart(6,'0')}`;
            return (
              <g>
                <rect x={midX - tw / 2 + 3} y={midY - 46 + 3} width={tw} height={90} rx={10} fill="rgba(0,0,0,0.6)" />
                <rect x={midX - tw / 2}     y={midY - 46}     width={tw} height={90} rx={10} fill="#0d0d0d" stroke={d.color} strokeWidth={1.5} strokeOpacity={0.7} />
                <rect x={midX - tw / 2}     y={midY - 46}     width={4}  height={90} rx={3}  fill={d.color} />
                <circle cx={midX - tw / 2 + 22} cy={midY - 22} r={5} fill={d.color} />
                <text x={midX - tw / 2 + 35} y={midY - 18} textAnchor="start" fill="#ffffff" fontSize={17} fontWeight={900} fontFamily="monospace">{d.code}</text>
                <text x={midX - tw / 2 + 12} y={midY}      textAnchor="start" fill={COL_COLORS[0]} fontSize={9} fontFamily="monospace" letterSpacing={1}>Q1 {fmtT(d.q1t)}</text>
                {d.q2t != null && <text x={midX - tw / 2 + 12} y={midY + 14} textAnchor="start" fill={COL_COLORS[1]} fontSize={9} fontFamily="monospace" letterSpacing={1}>Q2 {fmtT(d.q2t)}</text>}
                {d.q3t != null && <text x={midX - tw / 2 + 12} y={midY + 28} textAnchor="start" fill={COL_COLORS[2]} fontSize={9} fontFamily="monospace" letterSpacing={1}>Q3 {fmtT(d.q3t)}</text>}
                {d.eliminatedAfter && (
                  <text x={midX} y={midY + 42} textAnchor="middle" fill="#ef4444" fontSize={9} fontFamily="monospace" letterSpacing={1}>
                    ELIMINATED AFTER {d.eliminatedAfter}
                  </text>
                )}
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5">
        <span className="text-[9px] text-zinc-700 font-mono tracking-[0.3em] uppercase">Legend</span>
        {[
          { color: COL_COLORS[0], label: 'Q1' },
          { color: COL_COLORS[1], label: 'Q2' },
          { color: COL_COLORS[2], label: 'Q3' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: color, opacity: 0.6 }} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
          <span className="inline-block w-3 h-3 text-center text-[9px]" style={{ color: '#666' }}>✕</span>
          Eliminated
        </span>
        <span className="ml-auto text-[10px] text-zinc-800 font-mono tracking-widest">HOVER TO HIGHLIGHT</span>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function QualifyingToRaceProgression({ raceResults, qualiResults, year, grandPrix }) {
  const [mode, setMode] = useState('race'); // 'race' | 'quali'

  const hasQuali = qualiResults?.length > 0;
  const hasRace  = raceResults?.length > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8"
         style={{ background: 'linear-gradient(135deg,#0c0c0c 0%,#111 50%,#0a0a0a 100%)' }}>

      {/* Ambient glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle,rgba(220,0,0,0.22) 0%,transparent 70%)' }} />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle,rgba(220,0,0,0.1) 0%,transparent 70%)' }} />
      <div className="absolute top-0 right-1/3 w-80 h-80 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle,rgba(255,255,255,0.02) 0%,transparent 70%)' }} />

      {/* Dot grid texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,#fff 1px,transparent 0)', backgroundSize: '40px 40px' }} />

      {/* Top scan line */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none overflow-hidden">
        <div className="h-px w-1/3 bg-gradient-to-r from-transparent via-red-500/70 to-transparent"
             style={{ animation: 'scan 4s linear infinite' }} />
      </div>
      <style>{`@keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>

      <div className="relative z-10 p-6 md:p-10">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-red-500 font-mono tracking-[0.3em] uppercase">
                Position Analysis
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none uppercase">
              {mode === 'race'
                ? <>Grid <span className="text-red-600">→</span> Race</>
                : <>Q1 <span className="text-indigo-500">→</span> Q2 <span className="text-amber-500">→</span> Q3</>
              }
            </h2>
            <p className="text-zinc-500 font-mono text-xs mt-2 tracking-[0.2em] uppercase">
              {year} · {grandPrix} · {mode === 'race' ? 'Position Gains & Losses' : 'Qualifying Progression'}
            </p>
          </div>

          {/* Mode switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('race')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-mono tracking-widest border transition-all duration-200 ${
                mode === 'race'
                  ? 'bg-red-500/15 text-red-400 border-red-500/40'
                  : 'bg-white/5 text-zinc-600 border-white/8 hover:text-zinc-300 hover:bg-white/8'
              }`}>
              <Flag className="w-3.5 h-3.5" />
              GRID → RACE
            </button>
            <button
              onClick={() => setMode('quali')}
              disabled={!hasQuali}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-mono tracking-widest border transition-all duration-200 ${
                mode === 'quali'
                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/40'
                  : hasQuali
                    ? 'bg-white/5 text-zinc-600 border-white/8 hover:text-zinc-300 hover:bg-white/8'
                    : 'bg-white/3 text-zinc-800 border-white/5 cursor-not-allowed opacity-40'
              }`}>
              <Timer className="w-3.5 h-3.5" />
              Q1 → Q2 → Q3
            </button>
          </div>
        </div>

        {/* Content */}
        {mode === 'race'
          ? <GridToRaceChart raceResults={raceResults} year={year} grandPrix={grandPrix} />
          : <QualiProgressionChart qualiResults={qualiResults} year={year} grandPrix={grandPrix} />
        }

      </div>
    </div>
  );
}