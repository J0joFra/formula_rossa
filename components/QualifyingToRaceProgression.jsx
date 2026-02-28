"use client";  
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Cell, ReferenceLine
} from 'recharts';
import { ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TEAM_COLORS = {
  'red-bull': '#3671C6',
  'mercedes': '#6CD3BF',
  'ferrari': '#F91536',
  'mclaren': '#F58020',
  'aston-martin': '#2D826D',
  'alpine': '#2090D0',
  'williams': '#64C4FF',
  'rb': '#6692FF',
  'haas': '#B6BABD',
  'kick-sauber': '#52E252',
  'default': '#888888'
};

export default function QualifyingToRaceProgression({ 
  raceResults, 
  year, 
  grandPrix,
  driverStandings 
}) {
  const [filterType, setFilterType] = useState('all'); // 'gained', 'lost', 'same', 'all'
  const [sortBy, setSortBy] = useState('position'); // 'position', 'gain', 'name'
  const [showAllDrivers, setShowAllDrivers] = useState(false);

  // Prepara i dati per il grafico
  const chartData = useMemo(() => {
    if (!raceResults?.length) return [];

    const sorted = [...raceResults]
      .filter(r => r.gridPositionNumber) // Solo chi ha una posizione di griglia
      .sort((a, b) => a.gridPositionNumber - b.gridPositionNumber);

    return sorted.map(result => {
      const gain = result.positionsGained || 0;
      let gainCategory = 'same';
      if (gain > 0) gainCategory = 'gained';
      if (gain < 0) gainCategory = 'lost';

      // Estrai il nome del pilota dal driverId
      const driverName = result.driverId
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

      // Cerca il costruttore per determinare il colore
      const constructorKey = result.constructorId || 'default';
      
      return {
        ...result,
        driverDisplay: driverName,
        shortCode: result.driverId.split('-').pop().toUpperCase().substring(0, 3),
        qualifyingPos: result.qualificationPositionNumber,
        gridPos: result.gridPositionNumber,
        racePos: result.positionNumber,
        gain,
        gainCategory,
        color: TEAM_COLORS[constructorKey] || TEAM_COLORS.default,
        // Per il tooltip
        team: result.constructorId,
        laps: result.laps,
        time: result.time || result.gap || 'DNF',
        points: result.points || 0
      };
    });
  }, [raceResults]);

  // Filtra i dati in base alla selezione
  const filteredData = useMemo(() => {
    if (filterType === 'all') return chartData;
    return chartData.filter(d => d.gainCategory === filterType);
  }, [chartData, filterType]);

  // Limita il numero di piloti mostrati se non è "show all"
  const displayedData = useMemo(() => {
    if (showAllDrivers) return filteredData;
    return filteredData.slice(0, 15);
  }, [filteredData, showAllDrivers]);

  // Ordina i dati
  const sortedData = useMemo(() => {
    const data = [...displayedData];
    switch(sortBy) {
      case 'gain':
        return data.sort((a, b) => b.gain - a.gain);
      case 'name':
        return data.sort((a, b) => a.driverDisplay.localeCompare(b.driverDisplay));
      case 'position':
      default:
        return data.sort((a, b) => a.gridPos - b.gridPos);
    }
  }, [displayedData, sortBy]);

  // Statistiche
  const stats = useMemo(() => {
    const gained = chartData.filter(d => d.gain > 0).length;
    const lost = chartData.filter(d => d.gain < 0).length;
    const same = chartData.filter(d => d.gain === 0).length;
    const avgGain = chartData.reduce((acc, d) => acc + d.gain, 0) / chartData.length;
    
    return { gained, lost, same, avgGain: avgGain.toFixed(1) };
  }, [chartData]);

  if (!chartData.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <p className="text-zinc-500 font-mono text-sm">No qualifying/race data available</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            QUALIFYING → RACE <span className="text-red-600">PROGRESSION</span>
          </h2>
          <p className="text-xs text-zinc-600 font-mono mt-1">
            {year} {grandPrix} · Grid vs Race position
          </p>
        </div>
        
        {/* Filter buttons */}
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              filterType === 'all' 
                ? 'bg-zinc-700 text-white' 
                : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All ({chartData.length})
          </button>
          <button
            onClick={() => setFilterType('gained')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
              filterType === 'gained' 
                ? 'bg-green-600/20 text-green-400 border border-green-800' 
                : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <TrendingUp className="w-3 h-3" /> Gained ({stats.gained})
          </button>
          <button
            onClick={() => setFilterType('lost')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
              filterType === 'lost' 
                ? 'bg-red-600/20 text-red-400 border border-red-800' 
                : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <TrendingDown className="w-3 h-3" /> Lost ({stats.lost})
          </button>
          <button
            onClick={() => setFilterType('same')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
              filterType === 'same' 
                ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-800' 
                : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Minus className="w-3 h-3" /> Same ({stats.same})
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="text-[10px] text-zinc-600 font-mono">AVG POSITIONS GAINED</div>
          <div className="text-xl font-black text-white">{stats.avgGain}</div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="text-[10px] text-zinc-600 font-mono">BIGGEST GAINER</div>
          <div className="text-xl font-black text-green-400">
            +{Math.max(...chartData.map(d => d.gain))}
          </div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="text-[10px] text-zinc-600 font-mono">BIGGEST LOSER</div>
          <div className="text-xl font-black text-red-400">
            {Math.min(...chartData.map(d => d.gain))}
          </div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="text-[10px] text-zinc-600 font-mono">TOTAL DRIVERS</div>
          <div className="text-xl font-black text-white">{chartData.length}</div>
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600 font-mono">SORT BY:</span>
          <div className="flex bg-zinc-800 rounded-lg p-0.5">
            {[
              ['position', 'Grid'],
              ['gain', 'Gain'],
              ['name', 'Name']
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-3 py-1 text-xs rounded-md font-mono transition-all ${
                  sortBy === key 
                    ? 'bg-red-600 text-white' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowAllDrivers(!showAllDrivers)}
          className="text-xs font-mono text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
        >
          {showAllDrivers ? 'Show less' : 'Show all drivers'}
          <ChevronDown className={`w-3 h-3 transition-transform ${showAllDrivers ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Chart */}
      <div className="h-[500px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
            <XAxis 
              type="number" 
              domain={[1, 20]} 
              stroke="#52525b" 
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `P${v}`}
              reversed
            />
            <YAxis 
              type="category" 
              dataKey="shortCode" 
              stroke="#52525b" 
              tick={{ fontSize: 10, fill: '#a1a1aa' }}
              width={50}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 11 }}
              formatter={(value, name, props) => {
                if (name === 'gridPos') return [`P${value}`, 'Grid'];
                if (name === 'racePos') return [`P${value}`, 'Race'];
                return [value, name];
              }}
              labelFormatter={(label) => {
                const driver = sortedData.find(d => d.shortCode === label);
                return driver ? driver.driverDisplay : label;
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            
            {/* Grid position bars */}
            <Bar 
              dataKey="gridPos" 
              name="Grid Position" 
              fill="#3b82f6" 
              barSize={20}
              radius={[0, 4, 4, 0]}
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-grid-${index}`} fill="#3b82f6" />
              ))}
            </Bar>
            
            {/* Race position bars */}
            <Bar 
              dataKey="racePos" 
              name="Race Position" 
              fill="#ef4444" 
              barSize={20}
              radius={[0, 4, 4, 0]}
            >
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-race-${index}`} 
                  fill={entry.gain > 0 ? '#22c55e' : entry.gain < 0 ? '#ef4444' : '#f59e0b'}
                />
              ))}
            </Bar>
            
            {/* Reference line for position 1 */}
            <ReferenceLine x={1} stroke="#fbbf24" strokeDasharray="3 3" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Driver details table */}
      <div className="mt-6 border-t border-zinc-800 pt-4">
        <div className="text-[10px] text-zinc-600 font-mono mb-3">DETAILS</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-zinc-600">
                <th className="text-left">Driver</th>
                <th className="text-right">Team</th>
                <th className="text-right">Qualifying</th>
                <th className="text-right">Grid</th>
                <th className="text-right">Race</th>
                <th className="text-right">Gain</th>
                <th className="text-right">Laps</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.slice(0, 8).map((driver) => (
                <tr key={driver.driverId} className="border-b border-zinc-800">
                  <td className="py-2">
                    <span style={{ color: driver.color }} className="font-bold">
                      {driver.shortCode}
                    </span>
                    <span className="text-zinc-500 ml-2 text-[9px]">
                      {driver.driverDisplay.split(' ').pop()}
                    </span>
                  </td>
                  <td className="text-right text-zinc-400">{driver.constructorId}</td>
                  <td className="text-right">P{driver.qualifyingPos}</td>
                  <td className="text-right">P{driver.gridPos}</td>
                  <td className="text-right font-bold">P{driver.racePos}</td>
                  <td className={`text-right font-bold ${
                    driver.gain > 0 ? 'text-green-400' : 
                    driver.gain < 0 ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {driver.gain > 0 ? `+${driver.gain}` : driver.gain}
                  </td>
                  <td className="text-right text-zinc-500">{driver.laps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}