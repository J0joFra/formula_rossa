import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
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

const QualifyingToRaceProgression = dynamic(
  () => import('../components/QualifyingToRaceProgression'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <p className="text-zinc-500 font-mono text-sm">Loading progression data...</p>
      </div>
    )
  }
);

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
export default function LiveTimingPage() {

  const [raceResults, setRaceResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const loadRaceResults = async (year, round) => {
    if (typeof window === 'undefined') return;
    
    setLoadingResults(true);
    try {
      const response = await fetch('/data/f1db-races-race-results.json');
      const allResults = await response.json();
      
      const filtered = allResults.filter(r => 
        r.year === parseInt(year) && r.round === parseInt(round)
      );
      
      setRaceResults(filtered);
    } catch (error) {
      console.error('Error loading race results:', error);
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
  
  setLoading(true); 
  setError(null);
  setTelemetry([]); 
  setFastestLap(null);
  setCircuitMap([]);
  setWeather(null);
  setSectorsData(null); 
  setPositionsData(null);
  setDriverLaps([]);

const sk = sessionInfo.session_key;
  try {
    setLoadStep('Caricamento dati pilota…');
    const num = await getDriverNumber(sk, driverCode);
    setLoadStep('Caricamento giri e telemetria…');
    
    const [allLaps, telemetryResult, weatherResult, sectorsResult] = await Promise.all([
      getAllLaps(sk, num),
      getTelemetry(sk, num, null).catch(() => null), 
      getWeather(sk).catch(() => null),
      getAllDriversSectors(sk).catch(() => null)
    ]);
    
    if (allLaps?.length) {
      setDriverLaps(allLaps);
      const fastestLapNum = allLaps.reduce((a, b) => 
        a.lap_duration < b.lap_duration ? a : b
      ).lap_number;
      setSelectedLap(fastestLapNum);
    }
    
    if (telemetryResult) {
      setTelemetry(telemetryResult.telemetry);
      setFastestLap(telemetryResult.target_lap);
    }
    
    setLoadStep('Caricamento mappa GPS…');
    try { 
      const fastestLapNum = allLaps?.length ? 
        allLaps.reduce((a, b) => a.lap_duration < b.lap_duration ? a : b).lap_number : 
        null;
      if (fastestLapNum) {
        const map = await getCircuitMap(sk, num, fastestLapNum);
        setCircuitMap(map); 
      }
    } catch { /* optional */ }
    
    setWeather(weatherResult);
    setSectorsData(sectorsResult);
    
      if (sessionType === 'R' && meeting?.round && typeof window !== 'undefined') {
      setLoadStep('Caricamento risultati gara…');
      await loadRaceResults(year, meeting.round);
    }
    
    setLastQuery({ year, gp: meeting.meeting_name, session: sessionType, driver: driverCode });
  } catch (e) {
    setError(e.message || 'Errore sconosciuto');
  } finally { 
    setLoading(false); 
    setLoadStep(''); 
  }
};

  const refetchLap = async (lapNum) => {
    if (!sessionInfo) return;
    const sk = sessionInfo.session_key;
    try {
      const num = await getDriverNumber(sk, driverCode);
      const r = await getTelemetry(sk, num, lapNum);
      setTelemetry(r.telemetry); setFastestLap(r.target_lap);
      try { 
        const map = await getCircuitMap(sk, num, lapNum);
        setCircuitMap(map); 
      } catch { /* optional */ }
    } catch (e) { setError(e.message); }
  };

  const handleLapChange = (n) => { 
    setSelectedLap(n); 
    if (telemetry.length) refetchLap(n); 
  };

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

  const driverInfo = drivers.find(d => d.name_acronym === driverCode);
  const color = driverInfo?.team_colour ? `#${driverInfo.team_colour}` : '#ef4444';

  const canFetch = !!year && !!meeting && !!driverCode && !!sessionInfo && !loading;
  const flagCode = meeting ? getFlagCode(meeting.location || meeting.meeting_name || '') : '';
  const fastestLapNumber = driverLaps.length ? 
    driverLaps.reduce((a,b)=>a.lap_duration<b.lap_duration?a:b).lap_number : null;

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

              {/*  */}
              {sessionType === 'R' && raceResults && raceResults.length > 0 && (
                <QualifyingToRaceProgression
                  raceResults={raceResults}
                  year={year}
                  grandPrix={meeting?.meeting_name}
                  driverStandings={null}
                />
              )}

              {sessionType !== 'R' && sectorsData && (
                <div className="grid grid-cols-1 gap-4">
                  <SectorTable sectorsData={sectorsData} highlightCode={driverCode} />
                </div>
              )}

              {sessionType === 'R' && !raceResults && !loading && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                  <p className="text-zinc-500 font-mono text-sm">No race results available for this session</p>
                </div>
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
              <div className="w-full bg-zinc-800 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-red-600 h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <div className="text-xs text-zinc-700 font-mono mt-3">{meeting?.meeting_name} · {driverCode} · {sessionType}</div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
}