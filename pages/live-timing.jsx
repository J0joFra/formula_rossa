import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import {
  Activity, Zap, Gauge, ChevronDown, Search, RefreshCw,
  Radio, Cpu, Thermometer, Wind, Droplets, Clock, Flag
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import {
  getSessionKey, getDrivers, getDriverNumber,
  getTelemetry, getWeather, getMeetings,
  getSessionsForMeeting, getLatestSession
} from '../lib/openf1';

const SESSION_TYPES = [
  { id: 'FP1', name: 'Practice 1' },
  { id: 'FP2', name: 'Practice 2' },
  { id: 'FP3', name: 'Practice 3' },
  { id: 'Q',   name: 'Qualifying' },
  { id: 'R',   name: 'Race' },
  { id: 'S',   name: 'Sprint' },
  { id: 'SQ',  name: 'Sprint Qualifying' },
];

const AVAILABLE_YEARS = [2025, 2024, 2023];

const circuitToCountry = {
  monza: 'it', imola: 'it', mugello: 'it',
  silverstone: 'gb',
  spa: 'be',
  barcelona: 'es', catalunya: 'es',
  hungaroring: 'hu',
  austria: 'at', spielberg: 'at',
  monaco: 'mc',
  austin: 'us', miami: 'us', 'las vegas': 'us',
  montreal: 'ca', villeneuve: 'ca',
  interlagos: 'br', paulo: 'br',
  rodriguez: 'mx', mexico: 'mx',
  suzuka: 'jp',
  shanghai: 'cn',
  singapore: 'sg', 'marina bay': 'sg',
  bahrain: 'bh', sakhir: 'bh',
  jeddah: 'sa',
  'abu dhabi': 'ae', 'yas marina': 'ae',
  melbourne: 'au', 'albert park': 'au',
  zandvoort: 'nl',
  lusail: 'qa', losail: 'qa', qatar: 'qa',
  baku: 'az',
};

function getFlagCode(location = '') {
  const l = location.toLowerCase();
  for (const [key, code] of Object.entries(circuitToCountry)) {
    if (l.includes(key)) return code;
  }
  return '';
}

// ─── Dropdown riutilizzabile ──────────────────────────────────────────────────
function Dropdown({ label, isOpen, onToggle, disabled, header, children, dropdownRef }) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`w-full bg-zinc-900 border rounded-lg p-4 text-left transition-all
          ${disabled
            ? 'border-zinc-800 opacity-40 cursor-not-allowed'
            : 'border-zinc-800 hover:border-red-900/60 cursor-pointer'
          }`}
      >
        <div className="text-xs text-zinc-500 font-mono mb-1 tracking-widest">{label}</div>
        {header}
        {!disabled && (
          <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg z-50 max-h-72 overflow-y-auto shadow-2xl">
          {children}
        </div>
      )}
    </div>
  );
}

function useOutsideClose(refs, setters) {
  useEffect(() => {
    const h = (e) => refs.forEach((r, i) => {
      if (r.current && !r.current.contains(e.target)) setters[i](false);
    });
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, sub }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-zinc-500 font-mono tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-black text-white font-mono">{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
    </div>
  );
}

// ─── Componente principale ────────────────────────────────────────────────────
export default function LiveTimingPage() {
  // Selezioni utente
  const [year, setYear]           = useState(null);
  const [meetings, setMeetings]   = useState([]);  // lista gare dell'anno
  const [meeting, setMeeting]     = useState(null); // gara selezionata
  const [sessionType, setSessionType] = useState('Q');
  const [drivers, setDrivers]     = useState([]);  // piloti della sessione
  const [driverCode, setDriverCode] = useState(null);

  // Stato interno OpenF1
  const [sessionInfo, setSessionInfo] = useState(null); // { session_key, ... }

  // Telemetria
  const [telemetry, setTelemetry]   = useState([]);
  const [fastestLap, setFastestLap] = useState(null);
  const [weather, setWeather]       = useState(null);

  // Comparazione
  const [compareCode, setCompareCode]     = useState(null);
  const [compareTelemetry, setCompareTelemetry] = useState([]);
  const [showCompare, setShowCompare]     = useState(false);

  // UI
  const [loading, setLoading]   = useState(false);
  const [loadStep, setLoadStep] = useState('');
  const [error, setError]       = useState(null);
  const [activeTab, setActiveTab] = useState('speed');
  const [lastQuery, setLastQuery] = useState(null);

  // Dropdown open
  const [openYear, setOpenYear]       = useState(false);
  const [openMeeting, setOpenMeeting] = useState(false);
  const [openSession, setOpenSession] = useState(false);
  const [openDriver, setOpenDriver]   = useState(false);

  const refYear    = useRef(null);
  const refMeeting = useRef(null);
  const refSession = useRef(null);
  const refDriver  = useRef(null);
  useOutsideClose(
    [refYear, refMeeting, refSession, refDriver],
    [setOpenYear, setOpenMeeting, setOpenSession, setOpenDriver]
  );

  useEffect(() => {
    (async () => {
      try {
        const latest = await getLatestSession('Q');
        if (latest.year) {
          await handleYearChange(latest.year, false);
        }
      } catch (e) {
        handleYearChange(2024, false);
      }
    })();
  }, []);

  const handleYearChange = async (y, resetAll = true) => {
    setYear(y);
    if (resetAll) {
      setMeeting(null);
      setDrivers([]);
      setDriverCode(null);
      setSessionInfo(null);
      setTelemetry([]);
      setError(null);
    }
    setOpenYear(false);

    try {
      const data = await getMeetings(y);
      data.sort((a, b) => new Date(a.date_start || 0) - new Date(b.date_start || 0));
      setMeetings(data);
    } catch {
      setMeetings([]);
    }
  };

  const handleMeetingChange = async (m) => {
    setMeeting(m);
    setDriverCode(null);
    setSessionInfo(null);
    setTelemetry([]);
    setError(null);
    setOpenMeeting(false);

    try {
      const sessions = await getSessionsForMeeting(m.meeting_key);
      const sessionName = SESSION_TYPES.find(s => s.id === sessionType)?.name || 'Qualifying';
      const sess = sessions.find(s => s.session_name === sessionName) || sessions[sessions.length - 1];
      if (sess) {
        const d = await getDrivers(sess.session_key);
        setDrivers(d.sort((a, b) => (a.name_acronym || '').localeCompare(b.name_acronym || '')));
        setSessionInfo(sess);
      }
    } catch {
      setDrivers([]);
    }
  };

  const handleSessionChange = async (sid) => {
    setSessionType(sid);
    setOpenSession(false);
    setDriverCode(null);
    setTelemetry([]);

    if (!meeting) return;
    try {
      const sessions = await getSessionsForMeeting(meeting.meeting_key);
      const sessionName = SESSION_TYPES.find(s => s.id === sid)?.name || sid;
      const sess = sessions.find(s => s.session_name === sessionName);
      if (sess) {
        const d = await getDrivers(sess.session_key);
        setDrivers(d.sort((a, b) => (a.name_acronym || '').localeCompare(b.name_acronym || '')));
        setSessionInfo(sess);
      }
    } catch {
      setDrivers([]);
    }
  };

  const fetchTelemetry = async () => {
    if (!year || !meeting || !driverCode || !sessionInfo) return;

    setLoading(true);
    setError(null);
    setTelemetry([]);
    setCompareTelemetry([]);
    setFastestLap(null);
    setWeather(null);

    const sk = sessionInfo.session_key;

    try {
      setLoadStep('Ricerca pilota...');
      const driverNumber = await getDriverNumber(sk, driverCode);

      setLoadStep('Download telemetria giro più veloce...');
      const result = await getTelemetry(sk, driverNumber);
      setTelemetry(result.telemetry);
      setFastestLap(result.fastest_lap);

      setLoadStep('Caricamento meteo...');
      try {
        const w = await getWeather(sk);
        setWeather(w);
      } catch { /* meteo opzionale */ }

      if (showCompare && compareCode && compareCode !== driverCode) {
        setLoadStep(`Comparazione con ${compareCode}...`);
        try {
          const compNum = await getDriverNumber(sk, compareCode);
          const compResult = await getTelemetry(sk, compNum);
          setCompareTelemetry(compResult.telemetry);
        } catch { /* comparazione fallisce silenziosamente */ }
      }

      setLastQuery({
        year,
        gp: meeting.meeting_name,
        session: sessionType,
        driver: driverCode,
      });

    } catch (e) {
      setError(e.message || 'Errore sconosciuto');
    } finally {
      setLoading(false);
      setLoadStep('');
    }
  };

  const stats = React.useMemo(() => {
    if (!telemetry.length) return null;
    const speeds = telemetry.map(d => d.speed).filter(Boolean);
    const rpms   = telemetry.map(d => d.rpm).filter(Boolean);
    return {
      maxSpeed: speeds.length ? Math.max(...speeds) : 0,
      avgSpeed: speeds.length ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0,
      maxRpm:   rpms.length   ? Math.max(...rpms)   : 0,
      points:   telemetry.length,
    };
  }, [telemetry]);

  const chartData = React.useMemo(() =>
    telemetry.filter((_, i) => i % 3 === 0),
    [telemetry]
  );
  const compareChartData = React.useMemo(() =>
    compareTelemetry.filter((_, i) => i % 3 === 0),
    [compareTelemetry]
  );

  const canFetch  = !!year && !!meeting && !!driverCode && !!sessionInfo && !loading;
  const flagCode  = meeting ? getFlagCode(meeting.location || meeting.meeting_name || '') : '';
  const driverInfo = drivers.find(d => d.name_acronym === driverCode);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Head><title>Telemetry Explorer | Ferrari F1</title></Head>
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 pt-24 pb-20">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-red-500 font-mono tracking-widest mb-2">
              <Radio className="w-3 h-3" />
              OPENF1 API • TELEMETRY EXPLORER • DATI DAL 2023
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              TELEMETRY <span className="text-red-600">EXPLORER</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1 font-mono">
              Giro più veloce • Speed · RPM · Gear · Throttle · Brake · DRS
            </p>
          </div>

          {/* ── Selettori 2×2 ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

            {/* Anno */}
            <Dropdown
              label="YEAR"
              isOpen={openYear}
              onToggle={() => setOpenYear(v => !v)}
              dropdownRef={refYear}
              header={
                <div className="text-xl font-black font-mono text-white">
                  {year || '—'}
                </div>
              }
            >
              {AVAILABLE_YEARS.map(y => (
                <button
                  key={y}
                  onClick={() => handleYearChange(y)}
                  className={`w-full p-3 text-left font-mono hover:bg-zinc-800 transition-colors
                    ${year === y ? 'bg-red-600/20 border-l-4 border-red-600 pl-4' : ''}`}
                >
                  {y}
                </button>
              ))}
            </Dropdown>

            {/* Grand Prix */}
            <Dropdown
              label="GRAND PRIX"
              isOpen={openMeeting && !!year}
              onToggle={() => year && setOpenMeeting(v => !v)}
              disabled={!year || !meetings.length}
              dropdownRef={refMeeting}
              header={
                meeting ? (
                  <div className="flex items-center gap-2 pr-6">
                    {flagCode && (
                      <img src={`https://flagcdn.com/w20/${flagCode}.png`} alt="" className="w-5 h-3 object-cover rounded-sm flex-shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-bold text-white leading-tight">{meeting.meeting_name}</div>
                      <div className="text-xs text-zinc-400">{meeting.location} · {meeting.country_name}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-400">
                    {year ? (meetings.length ? 'Seleziona GP' : 'Caricamento...') : 'Seleziona anno prima'}
                  </div>
                )
              }
            >
              {meetings.map(m => {
                const fc = getFlagCode(m.location || m.meeting_name || '');
                return (
                  <button
                    key={m.meeting_key}
                    onClick={() => handleMeetingChange(m)}
                    className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3
                      ${meeting?.meeting_key === m.meeting_key ? 'bg-red-600/20 border-l-4 border-red-600 pl-4' : ''}`}
                  >
                    {fc && <img src={`https://flagcdn.com/w20/${fc}.png`} alt="" className="w-5 h-3 object-cover rounded-sm flex-shrink-0" />}
                    <div>
                      <div className="text-sm font-bold text-white">{m.meeting_name}</div>
                      <div className="text-xs text-zinc-400">{m.location}</div>
                    </div>
                  </button>
                );
              })}
            </Dropdown>

            {/* Sessione */}
            <Dropdown
              label="SESSION"
              isOpen={openSession}
              onToggle={() => setOpenSession(v => !v)}
              dropdownRef={refSession}
              header={
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black font-mono text-white">{sessionType}</span>
                  <span className="text-zinc-400 text-sm">
                    {SESSION_TYPES.find(s => s.id === sessionType)?.name}
                  </span>
                </div>
              }
            >
              {SESSION_TYPES.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSessionChange(s.id)}
                  className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors
                    ${sessionType === s.id ? 'bg-red-600/20 border-l-4 border-red-600 pl-4' : ''}`}
                >
                  <span className="font-mono font-bold text-white mr-3">{s.id}</span>
                  <span className="text-zinc-400 text-sm">{s.name}</span>
                </button>
              ))}
            </Dropdown>

            {/* Pilota */}
            <Dropdown
              label="DRIVER"
              isOpen={openDriver && !!meeting}
              onToggle={() => meeting && drivers.length && setOpenDriver(v => !v)}
              disabled={!meeting || !drivers.length}
              dropdownRef={refDriver}
              header={
                driverInfo ? (
                  <div className="flex items-center gap-3 pr-6">
                    {driverInfo.headshot_url && (
                      <img src={driverInfo.headshot_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-black font-mono text-white text-sm">
                        {driverInfo.name_acronym}
                        <span className="text-zinc-400 font-normal ml-2 text-xs">#{driverInfo.driver_number}</span>
                      </div>
                      <div className="text-xs text-zinc-400">{driverInfo.full_name} · {driverInfo.team_name}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-400">
                    {meeting ? (drivers.length ? 'Seleziona pilota' : 'Caricamento piloti...') : 'Seleziona GP prima'}
                  </div>
                )
              }
            >
              {drivers.map(d => (
                <button
                  key={d.driver_number}
                  onClick={() => {
                    setDriverCode(d.name_acronym);
                    if (!compareCode) setCompareCode(drivers.find(x => x.name_acronym !== d.name_acronym)?.name_acronym || null);
                    setOpenDriver(false);
                  }}
                  className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3
                    ${driverCode === d.name_acronym ? 'bg-red-600/20 border-l-4 border-red-600 pl-4' : ''}`}
                >
                  {d.headshot_url && (
                    <img src={d.headshot_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-mono font-bold text-white text-sm">
                      {d.name_acronym}
                      <span className="text-zinc-500 font-normal ml-2">#{d.driver_number}</span>
                    </div>
                    <div className="text-xs text-zinc-400">{d.full_name} · {d.team_name}</div>
                  </div>
                </button>
              ))}
            </Dropdown>
          </div>

          {/* ── Barra comparazione + fetch ── */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
              <span className="text-xs text-zinc-500 font-mono tracking-widest">COMPARE:</span>
              <select
                value={compareCode || ''}
                onChange={e => setCompareCode(e.target.value || null)}
                disabled={!showCompare || !drivers.length}
                className="bg-zinc-800 text-white rounded px-2 py-1 text-sm font-mono disabled:opacity-40"
              >
                {drivers.filter(d => d.name_acronym !== driverCode).map(d => (
                  <option key={d.driver_number} value={d.name_acronym}>
                    {d.name_acronym} — {d.full_name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowCompare(v => !v)}
                className={`px-3 py-1 rounded text-xs font-mono transition-all
                  ${showCompare ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
              >
                {showCompare ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex-1" />

            {lastQuery && (
              <div className="hidden md:block text-xs text-zinc-600 font-mono">
                {lastQuery.year} · {lastQuery.gp} · {lastQuery.driver} · {lastQuery.session}
              </div>
            )}

            <button
              onClick={fetchTelemetry}
              disabled={!canFetch}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-mono font-bold text-sm transition-all
                ${canFetch
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
            >
              {loading
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> {loadStep || 'LOADING...'}</>
                : <><Search className="w-4 h-4" /> FETCH TELEMETRY</>
              }
            </button>
          </div>

          {/* Hint */}
          {!canFetch && !loading && (
            <div className="mb-4 text-xs text-zinc-600 font-mono text-center">
              {!year && '← Seleziona un anno per iniziare'}
              {year && !meeting && '← Seleziona un Grand Prix'}
              {year && meeting && !driverCode && '← Seleziona un pilota'}
              {year && meeting && driverCode && !sessionInfo && '← Sessione non ancora caricata'}
            </div>
          )}

          {/* Errore */}
          {error && (
            <div className="mb-6 bg-red-950/30 border border-red-900/50 rounded-xl p-4">
              <div className="text-red-400 font-mono font-bold text-sm mb-1">⚠ {error}</div>
              <div className="text-red-500/60 text-xs font-mono">
                OpenF1 ha dati dal 2023. Prova anno 2023 o 2024, e verifica che la sessione esista per questo GP.
              </div>
            </div>
          )}

          {/* ── Contenuto dati ── */}
          {telemetry.length > 0 && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label="TOP SPEED"   value={`${stats.maxSpeed} km/h`}        icon={<Zap className="w-4 h-4 text-red-500" />} sub="Giro più veloce" />
                <StatCard label="AVG SPEED"   value={`${stats.avgSpeed} km/h`}        icon={<Gauge className="w-4 h-4 text-yellow-500" />} />
                <StatCard label="MAX RPM"     value={stats.maxRpm.toLocaleString()}    icon={<Activity className="w-4 h-4 text-blue-500" />} />
                <StatCard label="DATA POINTS" value={stats.points.toLocaleString()}   icon={<Cpu className="w-4 h-4 text-green-500" />} sub="~3.7 Hz sample rate" />
              </div>

              {/* Lap time */}
              {fastestLap && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 flex flex-wrap gap-6">
                  <div>
                    <div className="text-xs text-zinc-500 font-mono tracking-widest mb-1">FASTEST LAP</div>
                    <div className="text-lg font-black font-mono text-red-500">
                      Lap {fastestLap.lap_number}
                    </div>
                  </div>
                  {fastestLap.lap_duration && (
                    <div>
                      <div className="text-xs text-zinc-500 font-mono tracking-widest mb-1">LAP TIME</div>
                      <div className="text-lg font-black font-mono text-white">
                        {formatLapTime(fastestLap.lap_duration)}
                      </div>
                    </div>
                  )}
                  {[1, 2, 3].map(s => fastestLap[`sector_${s}`] ? (
                    <div key={s}>
                      <div className="text-xs text-zinc-500 font-mono tracking-widest mb-1">S{s}</div>
                      <div className="text-lg font-black font-mono text-zinc-300">
                        {fastestLap[`sector_${s}`].toFixed(3)}s
                      </div>
                    </div>
                  ) : null)}
                  {/* Meteo */}
                  {weather && (
                    <>
                      {weather.air_temp != null && (
                        <div>
                          <div className="text-xs text-zinc-500 font-mono tracking-widest mb-1 flex items-center gap-1"><Thermometer className="w-3 h-3" /> ARIA</div>
                          <div className="text-lg font-black font-mono text-zinc-300">{weather.air_temp}°C</div>
                        </div>
                      )}
                      {weather.track_temp != null && (
                        <div>
                          <div className="text-xs text-zinc-500 font-mono tracking-widest mb-1">PISTA</div>
                          <div className="text-lg font-black font-mono text-zinc-300">{weather.track_temp}°C</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Grafico principale */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="text-xs text-zinc-500 font-mono tracking-widest">
                    {driverCode} · {meeting?.meeting_name} · {sessionType} · {year}
                    {showCompare && compareCode && compareTelemetry.length > 0 && (
                      <span className="text-blue-400 ml-2">vs {compareCode}</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {['speed', 'rpm', 'gear', 'inputs'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 text-xs rounded font-mono transition-all
                          ${activeTab === tab ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                  {activeTab === 'speed' ? (
                    <AreaChart data={mergeCompare(chartData, compareChartData, showCompare, compareCode)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="distance" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(1)}km`} />
                      <YAxis stroke="#52525b" tick={{ fontSize: 10 }} unit=" km/h" />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 12 }} formatter={(v, n) => [`${v} km/h`, n]} />
                      {showCompare && compareTelemetry.length > 0 && <Legend />}
                      <Area type="monotone" dataKey="speed" stroke="#ef4444" fill="#ef444415" strokeWidth={2} dot={false} name={driverCode} />
                      {showCompare && compareTelemetry.length > 0 && (
                        <Area type="monotone" dataKey="speed_compare" stroke="#3b82f6" fill="#3b82f615" strokeWidth={2} dot={false} name={compareCode} />
                      )}
                    </AreaChart>
                  ) : activeTab === 'rpm' ? (
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="distance" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(1)}km`} />
                      <YAxis stroke="#52525b" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 12 }} />
                      <Area type="monotone" dataKey="rpm" stroke="#f59e0b" fill="#f59e0b15" strokeWidth={2} dot={false} />
                    </AreaChart>
                  ) : activeTab === 'gear' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="distance" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(1)}km`} />
                      <YAxis stroke="#52525b" tick={{ fontSize: 10 }} domain={[1, 8]} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 12 }} />
                      <Bar dataKey="gear" fill="#8b5cf6" maxBarSize={4} />
                    </BarChart>
                  ) : (
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="distance" stroke="#52525b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(1)}km`} />
                      <YAxis stroke="#52525b" tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 12 }} formatter={(v, n) => [`${v}%`, n]} />
                      <Legend />
                      <Area type="monotone" dataKey="throttle" stroke="#22c55e" fill="#22c55e15" strokeWidth={1.5} dot={false} name="Throttle" />
                      <Area type="monotone" dataKey="brake" stroke="#ef4444" fill="#ef444415" strokeWidth={1.5} dot={false} name="Brake" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* Placeholder */}
          {!loading && !error && !telemetry.length && (
            <div className="text-center py-24 border border-zinc-800/50 rounded-xl">
              <Radio className="w-10 h-10 mx-auto mb-4 text-zinc-700" />
              <div className="text-xl font-black font-mono text-zinc-600 mb-2">NO DATA</div>
              <div className="text-sm font-mono text-zinc-700">
                Seleziona Anno → GP → Sessione → Pilota → FETCH TELEMETRY
              </div>
              <div className="text-xs font-mono text-zinc-800 mt-2">
                Powered by OpenF1 · Dati disponibili dal 2023
              </div>
            </div>
          )}

          {/* Status bar */}
          <div className="mt-8 flex items-center justify-between border-t border-zinc-800/50 pt-4 text-xs text-zinc-700 font-mono">
            <span>OpenF1 API · openf1.org</span>
            <span>{meeting?.meeting_name || '—'} · {driverCode || '—'} · {sessionType} · {year || '—'}</span>
            <span>{telemetry.length > 0 ? `${telemetry.length} punti` : 'Nessun dato'}</span>
          </div>

        </main>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-zinc-950/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8 text-center max-w-sm w-full mx-4">
              <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
              <div className="text-sm font-mono font-bold text-zinc-300 mb-2">FETCHING OPENF1 DATA</div>
              <div className="text-xs text-zinc-500 font-mono mb-3">{loadStep}</div>
              <div className="text-xs text-zinc-700 font-mono">
                {meeting?.meeting_name} · {driverCode} · {sessionType} · {year}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}

function formatLapTime(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3).padStart(6, '0');
  return `${m}:${s}`;
}

function mergeCompare(main, compare, showCompare, compareCode) {
  if (!showCompare || !compare.length) return main;

  const compMap = new Map();
  compare.forEach(d => compMap.set(d.distance, d.speed));

  return main.map(d => {
    const compSpeed = compMap.get(d.distance) ?? findClosest(compare, d.distance);
    return { ...d, speed_compare: compSpeed };
  });
}

function findClosest(arr, dist) {
  if (!arr.length) return null;
  let best = arr[0];
  let bestDiff = Math.abs(arr[0].distance - dist);
  for (const p of arr) {
    const diff = Math.abs(p.distance - dist);
    if (diff < bestDiff) { best = p; bestDiff = diff; }
  }
  return best.speed;
}