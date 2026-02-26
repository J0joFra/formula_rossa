import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import {
  Activity, Zap, Gauge, ChevronDown, Search, RefreshCw,
  Radio, Cpu, Thermometer, Wind, Droplets, Flag, Timer
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, ReferenceLine,
} from 'recharts';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import {
  getDrivers, getDriverNumber, getTelemetry,
  getWeather, getMeetings, getSessionsForMeeting,
  getLatestSession, getAllDriversSectors, getRacePositions,
} from '../lib/openf1';

// ─── Costanti ─────────────────────────────────────────────────────────────────
const SESSION_TYPES = [
  { id: 'FP1', name: 'Practice 1' }, { id: 'FP2', name: 'Practice 2' },
  { id: 'FP3', name: 'Practice 3' }, { id: 'Q', name: 'Qualifying' },
  { id: 'R', name: 'Race' },         { id: 'S', name: 'Sprint' },
  { id: 'SQ', name: 'Sprint Qualifying' },
];
const AVAILABLE_YEARS = [2025, 2024, 2023];

const CIRCUIT_COUNTRY = {
  monza: 'it', imola: 'it', mugello: 'it', silverstone: 'gb', spa: 'be',
  barcelona: 'es', catalunya: 'es', hungaroring: 'hu', austria: 'at',
  spielberg: 'at', monaco: 'mc', austin: 'us', miami: 'us', 'las vegas': 'us',
  montreal: 'ca', villeneuve: 'ca', interlagos: 'br', paulo: 'br',
  rodriguez: 'mx', mexico: 'mx', suzuka: 'jp', shanghai: 'cn',
  singapore: 'sg', 'marina bay': 'sg', bahrain: 'bh', sakhir: 'bh',
  jeddah: 'sa', 'abu dhabi': 'ae', 'yas marina': 'ae', melbourne: 'au',
  'albert park': 'au', zandvoort: 'nl', lusail: 'qa', losail: 'qa',
  qatar: 'qa', baku: 'az',
};

function getFlagCode(location = '') {
  const l = location.toLowerCase();
  for (const [k, v] of Object.entries(CIRCUIT_COUNTRY)) if (l.includes(k)) return v;
  return '';
}

function formatTime(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3).padStart(6, '0');
  return `${m}:${s}`;
}

// Colori 20 piloti (fallback se team_colour non disponibile)
const DRIVER_COLORS = [
  '#ef4444','#3b82f6','#f59e0b','#22c55e','#a855f7',
  '#ec4899','#06b6d4','#f97316','#84cc16','#14b8a6',
  '#6366f1','#e11d48','#0284c7','#ca8a04','#16a34a',
  '#9333ea','#db2777','#0891b2','#ea580c','#65a30d',
];

// ─── Hook: chiusura dropdown fuori click ──────────────────────────────────────
function useOutsideClose(refs, setters) {
  useEffect(() => {
    const h = (e) => refs.forEach((r, i) => {
      if (r.current && !r.current.contains(e.target)) setters[i](false);
    });
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
}

// ─── Dropdown generico ────────────────────────────────────────────────────────
function Dropdown({ label, isOpen, onToggle, disabled, header, children, dropdownRef }) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`w-full bg-zinc-900 border rounded-xl p-4 text-left transition-all
          ${disabled ? 'border-zinc-800 opacity-40 cursor-not-allowed'
            : 'border-zinc-800 hover:border-red-800/60 cursor-pointer'}`}
      >
        <div className="text-[10px] text-zinc-600 font-mono mb-1 tracking-[0.15em] uppercase">{label}</div>
        <div className="pr-6">{header}</div>
        {!disabled && (
          <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
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

// ─── Mappa circuito SVG colorata per velocità ─────────────────────────────────
function CircuitSpeedMap({ telemetry, compareData, driverColor, compareColor, driverCode, compareCode, showCompare }) {
  const WIDTH = 500, HEIGHT = 300, PADDING = 30;

  const normalize = (points) => {
    if (!points.length) return [];
    // Approssima la traiettoria con seno/coseno modulato dalla distanza
    const totalDist = points[points.length - 1].distance || 1;
    return points.map((p, i) => {
      const t = (p.distance / totalDist) * Math.PI * 2;
      // Forma ovale + sinusoide per simulare il layout
      const rx = (WIDTH / 2 - PADDING) * 0.85;
      const ry = (HEIGHT / 2 - PADDING) * 0.75;
      const wobble = Math.sin(t * 3) * 18 + Math.cos(t * 7) * 8;
      return {
        x: WIDTH / 2 + rx * Math.cos(t - Math.PI / 2) + wobble * Math.cos(t),
        y: HEIGHT / 2 + ry * Math.sin(t - Math.PI / 2) + wobble * Math.sin(t),
        speed: p.speed,
      };
    });
  };

  const mapPoints = useMemo(() => normalize(telemetry.filter((_, i) => i % 4 === 0)), [telemetry]);
  const compareMapPoints = useMemo(() => normalize(compareData.filter((_, i) => i % 4 === 0)), [compareData]);

  if (!mapPoints.length) return null;

  const maxSpeed = Math.max(...mapPoints.map(p => p.speed), 1);
  const minSpeed = Math.min(...mapPoints.map(p => p.speed));

  const speedToColor = (speed) => {
    const t = (speed - minSpeed) / (maxSpeed - minSpeed);
    if (t < 0.33) return `hsl(${240 - t * 60}, 90%, 60%)`;   // blu → viola
    if (t < 0.66) return `hsl(${180 - t * 120}, 90%, 55%)`;  // verde
    return `hsl(${60 - t * 60}, 95%, 55%)`;                  // giallo → rosso
  };

  const renderPath = (pts, color, isCompare = false) => pts.slice(0, -1).map((p, i) => (
    <line
      key={`${isCompare ? 'c' : 'm'}-${i}`}
      x1={p.x} y1={p.y}
      x2={pts[i + 1].x} y2={pts[i + 1].y}
      stroke={isCompare ? color : speedToColor(p.speed)}
      strokeWidth={isCompare ? 2 : 3}
      strokeLinecap="round"
      opacity={isCompare ? 0.5 : 1}
    />
  ));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase">Circuit Speed Map</div>
        <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-1 rounded" style={{ background: 'hsl(60,95%,55%)' }} /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-1 rounded" style={{ background: 'hsl(120,90%,55%)' }} /> Med
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-1 rounded" style={{ background: 'hsl(240,90%,60%)' }} /> Low
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto">
        {/* Shadow/background track */}
        {mapPoints.slice(0, -1).map((p, i) => (
          <line key={`bg-${i}`} x1={p.x} y1={p.y} x2={mapPoints[i+1].x} y2={mapPoints[i+1].y}
            stroke="#27272a" strokeWidth={7} strokeLinecap="round" />
        ))}
        {showCompare && compareMapPoints.length > 0 && renderPath(compareMapPoints, compareColor, true)}
        {renderPath(mapPoints, driverColor)}
        {/* Start dot */}
        {mapPoints[0] && (
          <circle cx={mapPoints[0].x} cy={mapPoints[0].y} r={5} fill="#ffffff" stroke="#ef4444" strokeWidth={2} />
        )}
      </svg>
      <div className="flex items-center gap-4 mt-2 text-xs font-mono text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-white border border-red-500 inline-block" /> Start/Finish
        </span>
        {showCompare && compareCode && (
          <span className="flex items-center gap-1">
            <span className="w-6 h-0.5 inline-block opacity-50" style={{ background: compareColor }} /> {compareCode} (overlay)
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Grafico settori tutti i piloti ──────────────────────────────────────────
function SectorChart({ sectorsData }) {
  if (!sectorsData?.length) return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-center h-48">
      <span className="text-zinc-600 font-mono text-sm">Nessun dato settori</span>
    </div>
  );

  // Top 10 piloti
  const top10 = sectorsData.slice(0, 10);
  // Trova miglior settore per colorare in viola
  const bestS1 = Math.min(...top10.map(d => d.s1));
  const bestS2 = Math.min(...top10.map(d => d.s2));
  const bestS3 = Math.min(...top10.map(d => d.s3));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const driver = top10.find(d => d.code === label);
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs font-mono shadow-xl">
        <div className="font-bold text-white mb-2">{label} — {formatTime(driver?.lap_time)}</div>
        {payload.map(p => (
          <div key={p.name} className="flex justify-between gap-4" style={{ color: p.color }}>
            <span>{p.name}</span><span>{p.value?.toFixed(3)}s</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase mb-4">
        Sector Times — Best Lap (Top 10)
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={top10} layout="vertical" barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
          <XAxis type="number" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={v => `${v.toFixed(1)}s`} />
          <YAxis type="category" dataKey="code" stroke="#52525b" tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#a1a1aa' }} width={36} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', color: '#a1a1aa' }} />
          <Bar dataKey="s1" name="S1" stackId="a" fill="#3b82f6">
            {top10.map((d) => <Cell key={d.code} fill={d.s1 === bestS1 ? '#a855f7' : '#3b82f6'} />)}
          </Bar>
          <Bar dataKey="s2" name="S2" stackId="a" fill="#f59e0b">
            {top10.map((d) => <Cell key={d.code} fill={d.s2 === bestS2 ? '#a855f7' : '#f59e0b'} />)}
          </Bar>
          <Bar dataKey="s3" name="S3" stackId="a" fill="#22c55e" radius={[0, 3, 3, 0]}>
            {top10.map((d) => <Cell key={d.code} fill={d.s3 === bestS3 ? '#a855f7' : '#22c55e'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="text-xs text-zinc-700 font-mono mt-1">
        <span className="text-purple-400">■</span> Miglior settore assoluto
      </div>
    </div>
  );
}

// ─── Grafico posizioni gara ───────────────────────────────────────────────────
function RacePositionsChart({ positionsData, highlightCodes }) {
  if (!positionsData?.byLap?.length) return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-center h-48">
      <span className="text-zinc-600 font-mono text-sm">Disponibile solo per sessione Race</span>
    </div>
  );

  const { byLap, driverCodes, drivers } = positionsData;
  const colorMap = {};
  driverCodes.forEach((code, i) => {
    const driverInfo = drivers.find(d => d.name_acronym === code);
    colorMap[code] = driverInfo?.team_colour ? `#${driverInfo.team_colour}` : DRIVER_COLORS[i % DRIVER_COLORS.length];
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const sorted = [...payload].sort((a, b) => (a.value || 99) - (b.value || 99));
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs font-mono shadow-xl max-h-48 overflow-y-auto">
        <div className="font-bold text-zinc-400 mb-2">Lap {label}</div>
        {sorted.slice(0, 8).map(p => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colorMap[p.dataKey] }} />
            <span style={{ color: colorMap[p.dataKey] }}>{p.dataKey}</span>
            <span className="text-zinc-400 ml-auto">P{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase mb-4">
        Race Positions — Lap by Lap
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={byLap}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="lap" stroke="#52525b" tick={{ fontSize: 10 }} label={{ value: 'Lap', position: 'insideBottom', offset: -2, fill: '#52525b', fontSize: 10 }} />
          <YAxis reversed domain={[1, 20]} stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={v => `P${v}`} />
          <Tooltip content={<CustomTooltip />} />
          {driverCodes.map(code => (
            <Line
              key={code}
              type="monotone"
              dataKey={code}
              stroke={colorMap[code]}
              strokeWidth={highlightCodes.includes(code) ? 2.5 : 1}
              dot={false}
              connectNulls
              opacity={highlightCodes.length === 0 || highlightCodes.includes(code) ? 1 : 0.15}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {/* Legenda piloti evidenziati */}
      {highlightCodes.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {highlightCodes.map(code => (
            <span key={code} className="flex items-center gap-1.5 text-xs font-mono">
              <span className="w-3 h-0.5 inline-block rounded" style={{ background: colorMap[code] }} />
              <span style={{ color: colorMap[code] }}>{code}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Side-by-side telemetria ──────────────────────────────────────────────────
function SideBySide({ data1, data2, code1, code2, color1, color2, tab }) {
  const d1 = useMemo(() => data1.filter((_, i) => i % 3 === 0), [data1]);
  const d2 = useMemo(() => data2.filter((_, i) => i % 3 === 0), [data2]);

  const chartProps = {
    speed: { dataKey: 'speed', unit: ' km/h', stroke1: color1, stroke2: color2, fill: true },
    rpm:   { dataKey: 'rpm',   unit: '',       stroke1: '#f59e0b', stroke2: '#f97316', fill: true },
    gear:  { dataKey: 'gear',  unit: '',       stroke1: color1, stroke2: color2, fill: false, isBar: true },
  };
  const cfg = chartProps[tab] || chartProps.speed;

  const renderChart = (data, code, color, isRight = false) => (
    <div className="flex-1 min-w-0">
      <div className={`text-xs font-mono font-bold mb-2 ${isRight ? 'text-right' : ''}`} style={{ color }}>
        {code}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        {cfg.isBar ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="distance" stroke="#52525b" tick={{ fontSize: 9 }} tickFormatter={v => `${(v/1000).toFixed(1)}k`} />
            <YAxis stroke="#52525b" tick={{ fontSize: 9 }} domain={[1, 8]} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 11 }} />
            <Bar dataKey={cfg.dataKey} fill={color} maxBarSize={3} />
          </BarChart>
        ) : (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="distance" stroke="#52525b" tick={{ fontSize: 9 }} tickFormatter={v => `${(v/1000).toFixed(1)}k`} />
            <YAxis stroke="#52525b" tick={{ fontSize: 9 }} unit={cfg.unit} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 11 }} />
            <Area type="monotone" dataKey={cfg.dataKey} stroke={color} fill={`${color}18`} strokeWidth={2} dot={false} />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="flex gap-3">
      {renderChart(d1, code1, color1)}
      <div className="w-px bg-zinc-800 self-stretch" />
      {renderChart(d2, code2, color2, true)}
    </div>
  );
}

// ─── PAGINA PRINCIPALE ────────────────────────────────────────────────────────
export default function LiveTimingPage() {
  // ── Selezioni (persistenti finché non cambiate) ────────────────────────────
  const [year, setYear]               = useState(null);
  const [meetings, setMeetings]       = useState([]);
  const [meeting, setMeeting]         = useState(null);
  const [sessionType, setSessionType] = useState('Q');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [drivers, setDrivers]         = useState([]);
  const [driverCode, setDriverCode]   = useState(null);
  const [compareCode, setCompareCode] = useState(null);
  const [showCompare, setShowCompare] = useState(false);

  // ── Dati telemetria ────────────────────────────────────────────────────────
  const [telemetry, setTelemetry]           = useState([]);
  const [compareTelemetry, setCompareTelemetry] = useState([]);
  const [fastestLap, setFastestLap]         = useState(null);
  const [weather, setWeather]               = useState(null);
  const [sectorsData, setSectorsData]       = useState(null);
  const [positionsData, setPositionsData]   = useState(null);

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [loading, setLoading]     = useState(false);
  const [loadStep, setLoadStep]   = useState('');
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState('speed');
  const [lastQuery, setLastQuery] = useState(null);

  // ── Dropdown open ──────────────────────────────────────────────────────────
  const [openYear, setOpenYear]       = useState(false);
  const [openMeeting, setOpenMeeting] = useState(false);
  const [openSession, setOpenSession] = useState(false);
  const [openDriver, setOpenDriver]   = useState(false);
  const [openCompare, setOpenCompare] = useState(false);

  const r1 = useRef(null), r2 = useRef(null), r3 = useRef(null),
        r4 = useRef(null), r5 = useRef(null);
  useOutsideClose(
    [r1, r2, r3, r4, r5],
    [setOpenYear, setOpenMeeting, setOpenSession, setOpenDriver, setOpenCompare]
  );

  // ── Mount: pre-popola anno e gara senza fetchare dati ─────────────────────
  useEffect(() => {
    (async () => {
      try {
        const latest = await getLatestSession('Q');
        if (latest?.year) {
          const data = await getMeetings(latest.year);
          setYear(latest.year);
          setMeetings(data);
          // Trova il meeting corrispondente
          const m = data.find(m =>
            m.location?.toLowerCase().includes(latest.location?.toLowerCase()) ||
            latest.location?.toLowerCase().includes(m.location?.toLowerCase())
          );
          if (m) {
            // Pre-imposta il meeting e carica piloti
            setMeeting(m);
            const sessions = await getSessionsForMeeting(m.meeting_key);
            const sess = sessions.find(s => s.session_name === 'Qualifying') || sessions[sessions.length - 1];
            if (sess) {
              const d = await getDrivers(sess.session_key);
              setDrivers(d.sort((a, b) => (a.name_acronym || '').localeCompare(b.name_acronym || '')));
              setSessionInfo(sess);
            }
          }
        }
      } catch { /* silenzioso */ }
    })();
  }, []);

  // ── Cambio anno ────────────────────────────────────────────────────────────
  const handleYearChange = async (y) => {
    setYear(y); setOpenYear(false);
    // Reset solo gara in poi — NON resettare telemetria già caricata
    setMeeting(null); setDrivers([]); setSessionInfo(null);
    try {
      const data = await getMeetings(y);
      setMeetings(data);
    } catch { setMeetings([]); }
  };

  // ── Cambio GP ──────────────────────────────────────────────────────────────
  const handleMeetingChange = async (m) => {
    setMeeting(m); setOpenMeeting(false);
    setDrivers([]); setSessionInfo(null);
    try {
      const sessions = await getSessionsForMeeting(m.meeting_key);
      const sessName = SESSION_TYPES.find(s => s.id === sessionType)?.name || 'Qualifying';
      const sess = sessions.find(s => s.session_name === sessName) || sessions[sessions.length - 1];
      if (sess) {
        const d = await getDrivers(sess.session_key);
        setDrivers(d.sort((a, b) => (a.name_acronym || '').localeCompare(b.name_acronym || '')));
        setSessionInfo(sess);
      }
    } catch { setDrivers([]); }
  };

  // ── Cambio sessione ────────────────────────────────────────────────────────
  const handleSessionChange = async (sid) => {
    setSessionType(sid); setOpenSession(false);
    setDrivers([]); setSessionInfo(null);
    if (!meeting) return;
    try {
      const sessions = await getSessionsForMeeting(meeting.meeting_key);
      const sessName = SESSION_TYPES.find(s => s.id === sid)?.name || sid;
      const sess = sessions.find(s => s.session_name === sessName);
      if (sess) {
        const d = await getDrivers(sess.session_key);
        setDrivers(d.sort((a, b) => (a.name_acronym || '').localeCompare(b.name_acronym || '')));
        setSessionInfo(sess);
      }
    } catch { setDrivers([]); }
  };

  // ── FETCH principale (solo su click) ───────────────────────────────────────
  const fetchTelemetry = async () => {
    if (!year || !meeting || !driverCode || !sessionInfo) return;
    setLoading(true); setError(null);
    setTelemetry([]); setCompareTelemetry([]);
    setFastestLap(null); setWeather(null);
    setSectorsData(null); setPositionsData(null);

    const sk = sessionInfo.session_key;
    try {
      // 1. Telemetria pilota principale
      setLoadStep('Telemetria pilota principale...');
      const driverNum = await getDriverNumber(sk, driverCode);
      const result = await getTelemetry(sk, driverNum);
      setTelemetry(result.telemetry);
      setFastestLap(result.fastest_lap);

      // 2. Telemetria comparazione
      if (showCompare && compareCode && compareCode !== driverCode) {
        setLoadStep(`Telemetria ${compareCode}...`);
        try {
          const compNum = await getDriverNumber(sk, compareCode);
          const compResult = await getTelemetry(sk, compNum);
          setCompareTelemetry(compResult.telemetry);
        } catch { /* opzionale */ }
      }

      // 3. Meteo
      setLoadStep('Meteo sessione...');
      try { setWeather(await getWeather(sk)); } catch { /* opzionale */ }

      // 4. Settori tutti i piloti
      setLoadStep('Settori tutti i piloti...');
      try { setSectorsData(await getAllDriversSectors(sk)); } catch { /* opzionale */ }

      // 5. Posizioni gara (solo per R)
      if (sessionType === 'R') {
        setLoadStep('Posizioni gara...');
        try { setPositionsData(await getRacePositions(sk)); } catch { /* opzionale */ }
      }

      setLastQuery({ year, gp: meeting.meeting_name, session: sessionType, driver: driverCode });
    } catch (e) {
      setError(e.message || 'Errore sconosciuto');
    } finally {
      setLoading(false); setLoadStep('');
    }
  };

  // ── Statistiche ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!telemetry.length) return null;
    const speeds = telemetry.map(d => d.speed).filter(Boolean);
    const rpms   = telemetry.map(d => d.rpm).filter(Boolean);
    return {
      maxSpeed: speeds.length ? Math.max(...speeds) : 0,
      avgSpeed: speeds.length ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0,
      maxRpm:   rpms.length   ? Math.max(...rpms) : 0,
      points:   telemetry.length,
    };
  }, [telemetry]);

  const chartData    = useMemo(() => telemetry.filter((_, i) => i % 3 === 0), [telemetry]);
  const compareChart = useMemo(() => compareTelemetry.filter((_, i) => i % 3 === 0), [compareTelemetry]);

  // Colori piloti
  const driverInfo  = drivers.find(d => d.name_acronym === driverCode);
  const compareInfo = drivers.find(d => d.name_acronym === compareCode);
  const color1 = driverInfo?.team_colour  ? `#${driverInfo.team_colour}`  : '#ef4444';
  const color2 = compareInfo?.team_colour ? `#${compareInfo.team_colour}` : '#3b82f6';

  const canFetch = !!year && !!meeting && !!driverCode && !!sessionInfo && !loading;
  const flagCode = meeting ? getFlagCode(meeting.location || meeting.meeting_name || '') : '';

  // ─────────────────────────────────────────────────────────────────────────
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
              Fastest lap · Speed · RPM · Gear · Throttle · Brake · DRS · Sectors · Circuit Map
            </p>
          </div>

          {/* ── Selettori 2×2 ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">

            {/* Anno */}
            <Dropdown label="Year" isOpen={openYear} onToggle={() => setOpenYear(v => !v)} dropdownRef={r1}
              header={<div className="text-2xl font-black font-mono">{year || '—'}</div>}
            >
              {AVAILABLE_YEARS.map(y => (
                <button key={y} onClick={() => handleYearChange(y)}
                  className={`w-full p-3 text-left font-mono text-sm hover:bg-zinc-800 transition-colors
                    ${year === y ? 'bg-red-600/15 border-l-2 border-red-600 pl-4 text-red-400' : 'text-zinc-300'}`}>
                  {y}
                </button>
              ))}
            </Dropdown>

            {/* Grand Prix */}
            <Dropdown label="Grand Prix" isOpen={openMeeting && !!year} onToggle={() => year && setOpenMeeting(v => !v)}
              disabled={!year || !meetings.length} dropdownRef={r2}
              header={
                meeting ? (
                  <div className="flex items-center gap-2">
                    {flagCode && <img src={`https://flagcdn.com/w20/${flagCode}.png`} alt="" className="w-5 h-3 object-cover rounded-sm flex-shrink-0" />}
                    <div>
                      <div className="text-sm font-bold leading-tight">{meeting.meeting_name}</div>
                      <div className="text-xs text-zinc-500">{meeting.location} · {meeting.country_name}</div>
                    </div>
                  </div>
                ) : <div className="text-sm text-zinc-500">{year ? (meetings.length ? 'Select Grand Prix' : 'Loading...') : 'Select year first'}</div>
              }
            >
              {meetings.map(m => {
                const fc = getFlagCode(m.location || m.meeting_name || '');
                return (
                  <button key={m.meeting_key} onClick={() => handleMeetingChange(m)}
                    className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3
                      ${meeting?.meeting_key === m.meeting_key ? 'bg-red-600/15 border-l-2 border-red-600 pl-4' : ''}`}>
                    {fc && <img src={`https://flagcdn.com/w20/${fc}.png`} alt="" className="w-5 h-3 object-cover rounded-sm flex-shrink-0" />}
                    <div>
                      <div className="text-sm font-bold text-white">{m.meeting_name}</div>
                      <div className="text-xs text-zinc-500">{m.location}</div>
                    </div>
                  </button>
                );
              })}
            </Dropdown>

            {/* Sessione */}
            <Dropdown label="Session" isOpen={openSession} onToggle={() => setOpenSession(v => !v)} dropdownRef={r3}
              header={
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black font-mono">{sessionType}</span>
                  <span className="text-zinc-500 text-sm">{SESSION_TYPES.find(s => s.id === sessionType)?.name}</span>
                </div>
              }
            >
              {SESSION_TYPES.map(s => (
                <button key={s.id} onClick={() => handleSessionChange(s.id)}
                  className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors
                    ${sessionType === s.id ? 'bg-red-600/15 border-l-2 border-red-600 pl-4' : ''}`}>
                  <span className="font-mono font-bold text-white mr-3">{s.id}</span>
                  <span className="text-zinc-500 text-sm">{s.name}</span>
                </button>
              ))}
            </Dropdown>

            {/* Pilota */}
            <Dropdown label="Driver" isOpen={openDriver && !!meeting} onToggle={() => meeting && drivers.length && setOpenDriver(v => !v)}
              disabled={!meeting || !drivers.length} dropdownRef={r4}
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
                ) : <div className="text-sm text-zinc-500">{meeting ? (drivers.length ? 'Select Driver' : 'Loading...') : 'Select GP first'}</div>
              }
            >
              {drivers.map(d => (
                <button key={d.driver_number}
                  onClick={() => {
                    setDriverCode(d.name_acronym);
                    if (!compareCode || compareCode === d.name_acronym) {
                      setCompareCode(drivers.find(x => x.name_acronym !== d.name_acronym)?.name_acronym || null);
                    }
                    setOpenDriver(false);
                  }}
                  className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3
                    ${driverCode === d.name_acronym ? 'bg-red-600/15 border-l-2 border-red-600 pl-4' : ''}`}>
                  {d.headshot_url && <img src={d.headshot_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
                  <div>
                    <div className="font-mono font-bold text-sm text-white">
                      {d.name_acronym} <span className="text-zinc-600 font-normal">#{d.driver_number}</span>
                    </div>
                    <div className="text-xs text-zinc-500">{d.full_name} · {d.team_name}</div>
                  </div>
                </button>
              ))}
            </Dropdown>
          </div>

          {/* ── Barra comparazione + fetch ── */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Toggle comparazione */}
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5">
              <span className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase">Compare</span>
              <button onClick={() => setShowCompare(v => !v)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all
                  ${showCompare ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}>
                {showCompare ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Selettore pilota comparazione */}
            {showCompare && (
              <Dropdown label="vs Driver" isOpen={openCompare && !!meeting} onToggle={() => meeting && drivers.length && setOpenCompare(v => !v)}
                disabled={!meeting || !drivers.length} dropdownRef={r5}
                header={
                  compareInfo ? (
                    <div className="flex items-center gap-2">
                      {compareInfo.headshot_url && <img src={compareInfo.headshot_url} alt="" className="w-6 h-6 rounded-full object-cover" />}
                      <span className="font-mono font-bold text-sm" style={{ color: color2 }}>{compareInfo.name_acronym}</span>
                      <span className="text-zinc-600 text-xs">{compareInfo.team_name}</span>
                    </div>
                  ) : <div className="text-sm text-zinc-500">Select driver to compare</div>
                }
              >
                {drivers.filter(d => d.name_acronym !== driverCode).map(d => (
                  <button key={d.driver_number} onClick={() => { setCompareCode(d.name_acronym); setOpenCompare(false); }}
                    className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3
                      ${compareCode === d.name_acronym ? 'bg-red-600/15 border-l-2 border-red-600 pl-4' : ''}`}>
                    {d.headshot_url && <img src={d.headshot_url} alt="" className="w-6 h-6 rounded-full object-cover" />}
                    <span className="font-mono text-sm text-white">{d.name_acronym}</span>
                    <span className="text-zinc-500 text-xs">{d.team_name}</span>
                  </button>
                ))}
              </Dropdown>
            )}

            <div className="flex-1" />

            {lastQuery && (
              <div className="hidden lg:block text-xs text-zinc-700 font-mono">
                {lastQuery.year} · {lastQuery.gp} · {lastQuery.driver} · {lastQuery.session}
              </div>
            )}

            <button onClick={fetchTelemetry} disabled={!canFetch}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono font-bold text-sm transition-all
                ${canFetch ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}>
              {loading
                ? <><RefreshCw className="w-4 h-4 animate-spin" />{loadStep || 'Loading...'}</>
                : <><Search className="w-4 h-4" />FETCH TELEMETRY</>
              }
            </button>
          </div>

          {/* Hint selezione */}
          {!canFetch && !loading && (
            <div className="mb-6 text-xs text-zinc-700 font-mono text-center py-2">
              {!year && 'Select a year to begin'}
              {year && !meeting && 'Select a Grand Prix'}
              {year && meeting && !driverCode && 'Select a driver'}
              {year && meeting && driverCode && !sessionInfo && 'Loading session...'}
            </div>
          )}

          {/* Errore */}
          {error && (
            <div className="mb-6 bg-red-950/20 border border-red-900/40 rounded-xl p-4">
              <div className="text-red-400 font-mono font-bold text-sm">⚠ {error}</div>
              <div className="text-red-700 text-xs font-mono mt-1">OpenF1 ha dati dal 2023. Verifica che la sessione esista.</div>
            </div>
          )}

          {/* ── SEZIONE DATI ── */}
          {telemetry.length > 0 && (
            <div className="space-y-4">

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard accent label="Top Speed" value={`${stats.maxSpeed} km/h`} icon={<Zap className="w-4 h-4 text-red-500" />} sub="Fastest lap" />
                <StatCard label="Avg Speed" value={`${stats.avgSpeed} km/h`} icon={<Gauge className="w-4 h-4 text-yellow-500" />} />
                <StatCard label="Max RPM" value={stats.maxRpm.toLocaleString()} icon={<Activity className="w-4 h-4 text-blue-500" />} />
                <StatCard label="Data Points" value={stats.points.toLocaleString()} icon={<Cpu className="w-4 h-4 text-green-500" />} sub="~3.7 Hz" />
              </div>

              {/* Lap info + meteo */}
              {(fastestLap || weather) && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex flex-wrap gap-x-8 gap-y-3">
                  {fastestLap && (
                    <>
                      <div>
                        <div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase mb-0.5">Fastest Lap</div>
                        <div className="text-lg font-black font-mono" style={{ color: color1 }}>Lap {fastestLap.lap_number}</div>
                      </div>
                      {fastestLap.lap_duration && (
                        <div>
                          <div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase mb-0.5">Lap Time</div>
                          <div className="text-lg font-black font-mono text-white">{formatTime(fastestLap.lap_duration)}</div>
                        </div>
                      )}
                      {[1, 2, 3].map(s => fastestLap[`sector_${s}`] ? (
                        <div key={s}>
                          <div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase mb-0.5">S{s}</div>
                          <div className="text-lg font-black font-mono text-zinc-300">{fastestLap[`sector_${s}`].toFixed(3)}s</div>
                        </div>
                      ) : null)}
                    </>
                  )}
                  {weather && (
                    <>
                      {weather.air_temp   != null && <div><div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase mb-0.5 flex items-center gap-1"><Thermometer className="w-3 h-3" />Air</div><div className="text-lg font-black font-mono text-zinc-300">{weather.air_temp}°C</div></div>}
                      {weather.track_temp != null && <div><div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase mb-0.5">Track</div><div className="text-lg font-black font-mono text-zinc-300">{weather.track_temp}°C</div></div>}
                      {weather.humidity   != null && <div><div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase mb-0.5 flex items-center gap-1"><Droplets className="w-3 h-3" />Hum</div><div className="text-lg font-black font-mono text-zinc-300">{weather.humidity}%</div></div>}
                      {weather.wind_speed != null && <div><div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase mb-0.5 flex items-center gap-1"><Wind className="w-3 h-3" />Wind</div><div className="text-lg font-black font-mono text-zinc-300">{weather.wind_speed} km/h</div></div>}
                    </>
                  )}
                </div>
              )}

              {/* ── Grafici telemetria ── */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="text-[10px] text-zinc-600 font-mono tracking-[0.15em] uppercase">
                    {driverCode}
                    {showCompare && compareCode && compareTelemetry.length > 0 && (
                      <> <span className="text-zinc-700">vs</span> <span style={{ color: color2 }}>{compareCode}</span></>
                    )} · {meeting?.meeting_name} · {sessionType} · {year}
                  </div>
                  <div className="flex gap-1">
                    {['speed', 'rpm', 'gear', 'inputs'].map(t => (
                      <button key={t} onClick={() => setActiveTab(t)}
                        className={`px-3 py-1 text-xs rounded-lg font-mono transition-all
                          ${activeTab === t ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Side-by-side se compare attivo e dati disponibili */}
                {showCompare && compareTelemetry.length > 0 && activeTab !== 'inputs' ? (
                  <SideBySide
                    data1={telemetry} data2={compareTelemetry}
                    code1={driverCode} code2={compareCode}
                    color1={color1} color2={color2}
                    tab={activeTab}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    {activeTab === 'speed' ? (
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="distance" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(1)}km`} />
                        <YAxis stroke="#52525b" tick={{ fontSize: 10 }} unit=" km/h" />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 11 }} />
                        <Area type="monotone" dataKey="speed" stroke={color1} fill={`${color1}15`} strokeWidth={2} dot={false} name={driverCode} />
                      </AreaChart>
                    ) : activeTab === 'rpm' ? (
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="distance" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(1)}km`} />
                        <YAxis stroke="#52525b" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 11 }} />
                        <Area type="monotone" dataKey="rpm" stroke="#f59e0b" fill="#f59e0b15" strokeWidth={2} dot={false} />
                      </AreaChart>
                    ) : activeTab === 'gear' ? (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="distance" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(1)}km`} />
                        <YAxis stroke="#52525b" tick={{ fontSize: 10 }} domain={[1, 8]} />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 11 }} />
                        <Bar dataKey="gear" fill={color1} maxBarSize={4} />
                      </BarChart>
                    ) : (
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="distance" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(1)}km`} />
                        <YAxis stroke="#52525b" tick={{ fontSize: 10 }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 11 }} formatter={(v, n) => [`${v}%`, n]} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Area type="monotone" dataKey="throttle" stroke="#22c55e" fill="#22c55e15" strokeWidth={1.5} dot={false} name="Throttle" />
                        <Area type="monotone" dataKey="brake"    stroke="#ef4444" fill="#ef444415" strokeWidth={1.5} dot={false} name="Brake" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>

              {/* ── Circuit speed map + Settori (2 colonne) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CircuitSpeedMap
                  telemetry={telemetry}
                  compareData={showCompare ? compareTelemetry : []}
                  driverColor={color1}
                  compareColor={color2}
                  driverCode={driverCode}
                  compareCode={compareCode}
                  showCompare={showCompare && compareTelemetry.length > 0}
                />
                <SectorChart sectorsData={sectorsData} />
              </div>

              {/* ── Posizioni gara (solo R) ── */}
              {sessionType === 'R' && (
                <RacePositionsChart
                  positionsData={positionsData}
                  highlightCodes={[driverCode, showCompare && compareCode].filter(Boolean)}
                />
              )}

            </div>
          )}

          {/* Placeholder */}
          {!loading && !error && !telemetry.length && (
            <div className="text-center py-28 border border-zinc-900 rounded-xl">
              <Radio className="w-10 h-10 mx-auto mb-4 text-zinc-800" />
              <div className="text-xl font-black font-mono text-zinc-700 mb-2">NO DATA LOADED</div>
              <div className="text-sm font-mono text-zinc-800">Year → Grand Prix → Session → Driver → FETCH</div>
              <div className="text-xs font-mono text-zinc-900 mt-2">Powered by OpenF1 · openf1.org · Data from 2023</div>
            </div>
          )}

          {/* Status */}
          <div className="mt-8 flex items-center justify-between border-t border-zinc-900 pt-4 text-xs text-zinc-800 font-mono">
            <span>OpenF1 API · openf1.org</span>
            <span>{meeting?.meeting_name || '—'} · {driverCode || '—'} · {sessionType} · {year || '—'}</span>
            <span>{telemetry.length > 0 ? `${telemetry.length} pts` : 'No data'}</span>
          </div>

        </main>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-zinc-950/85 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center max-w-xs w-full mx-4">
              <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
              <div className="text-sm font-mono font-bold text-white mb-2">FETCHING DATA</div>
              <div className="text-xs text-zinc-500 font-mono mb-1">{loadStep}</div>
              <div className="text-xs text-zinc-700 font-mono mt-3">
                {meeting?.meeting_name} · {driverCode} · {sessionType}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}