"use client";
import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TEAM_COLORS = {
  // Attuali / moderni
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

  // Sauber lineage
  'sauber': '#006F62',
  'bmw-sauber': '#1B3C8C',
  'alfa-romeo': '#9B0000',

  // Renault lineage
  'renault': '#FFD800',
  'lotus-renault': '#111111',
  'lotus': '#005A2C',
  'team-lotus': '#005A2C',

  // Brabham
  'brabham': '#003366',

  // Tyrrell
  'tyrrell': '#0033A0',

  // Benetton
  'benetton': '#008C45',

  // Brawn
  'brawn': '#B7E000',

  // Honda works
  'honda': '#FFFFFF',

  // Jaguar
  'jaguar': '#005A2C',

  // Stewart
  'stewart': '#FFFFFF',

  // BAR
  'bar': '#FFFFFF',

  // Toyota
  'toyota': '#CC0000',

  // Porsche
  'porsche': '#E60000',

  // Maserati
  'maserati': '#003A8F',

  // Alfa Romeo (storico)
  'alfa-romeo-works': '#8B0000',

  // Cooper
  'cooper': '#0033A0',

  // Matra
  'matra': '#0055A4',

  // Ligier
  'ligier': '#0055A4',

  // Arrows
  'arrows': '#FF6600',

  // Minardi
  'minardi': '#000000',

  // Toro Rosso
  'toro-rosso': '#1E5BC6',

  // HRT
  'hrt': '#B30000',

  // Caterham
  'caterham': '#005030',

  // Manor / Marussia / Virgin
  'virgin': '#CC0000',
  'marussia': '#9B0000',
  'manor': '#003A8F',

  // Super Aguri
  'super-aguri': '#FFFFFF',

  // Force India
  'force-india': '#FF5F00',

  // Spyker
  'spyker': '#FF6600',
  'jordan': '#FFD800',
  'prost': '#0055A4',
  'footwork': '#0033A0',
  'pacific': '#003A8F',
  'simtek': '#000000',
  'lola': '#0033A0',
  'shadow': '#000000',
  'march': '#0033A0',
  'ats': '#000000',
  'osella': '#000000',
  'coloni': '#000000',
  'zakspeed': '#000000',
  'eurobrun': '#000000',
  'onyx': '#000000',
  'larrousse': '#0055A4',
  'forti': '#FFD800',
  'andrea-moda': '#000000',
  'life': '#000000',
  // Default
  'default': '#888888'
};


function getColor(constructorId, gain) {
  return TEAM_COLORS[constructorId] || TEAM_COLORS.default;
}

function getGainColor(gain) {
  if (gain > 0) return '#22c55e';
  if (gain < 0) return '#ef4444';
  return '#a1a1aa';
}

export default function QualifyingToRaceProgression({ raceResults, year, grandPrix }) {
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
