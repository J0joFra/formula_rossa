import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import {
  Activity, Zap, Gauge, ChevronDown, Search, RefreshCw, Radio, Cpu, ChevronLeft,
} from 'lucide-react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import {
  getDrivers, getDriverNumber, getTelemetry, getCircuitMap, getFullSessionTelemetry,
  getWeather, getMeetings, getSessionsForMeeting, getLatestSession,
  getAllDriversSectors, getRacePositions, getAllLaps, openf1Fetch,
} from '../lib/openf1';
import { createClient } from '@supabase/supabase-js';
import { CIRCUIT_COUNTRY } from '../lib/f1/circuitCountry';
import { useOutsideClose, Dropdown, StatCard, LapSelector } from '../components/livetiming/Controls';
import {
  TelemetryChart, SectorTable, RacePositionsChart,
  GridToRaceChart, QualiProgressionChart, QualifyingToRaceProgression,
} from '../components/livetiming/Charts';

const supabase = typeof window !== 'undefined'
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null;

// ─── Constants ────────────────────────────────────────────────────────────────

var SESSION_TYPES = [
  { id: 'R',   name: 'Race'},
  { id: 'S',   name: 'Sprint'}
];
var AVAILABLE_YEARS = [2026, 2025, 2024, 2023];

export default function LiveTimingPage() {

  // Session-level cache refs — avoid re-fetching same data within a session
  const cachedDriverNum = React.useRef(null);   // { sk, code, num }
  const cachedCarData   = React.useRef(null);   // { sk, num, data }
  const cachedRawLaps   = React.useRef(null);   // { sk, num, data }

  const [raceResults, setRaceResults] = useState(null);
  const [qualiResults, setQualiResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const loadQualiResults = async (year, meetingObj) => {
    if (!supabase || !meetingObj) return;
    try {
      // Trova la race in Supabase corrispondente al meeting OpenF1
      const loc         = (meetingObj.location      || '').toLowerCase();
      const country     = (meetingObj.country_name  || '').toLowerCase();
      const meetingName = (meetingObj.meeting_name  || '').toLowerCase()
        .replace(' grand prix','').replace(' gp','').trim();

      const { data: races } = await supabase
        .from('race')
        .select('id, round, circuit_id, official_name, grand_prix_id')
        .eq('year', parseInt(year));

      if (!races?.length) return;

      // Match fuzzy: cerca il round con più corrispondenze nel nome
      const matched = races.find(r => {
        const fields = [r.official_name, r.circuit_id, r.grand_prix_id]
          .map(f => (f || '').toLowerCase());
        return fields.some(f =>
          f.includes(loc) || loc.includes(f) ||
          f.includes(country) || country.includes(f) ||
          f.includes(meetingName) || meetingName.includes(f)
        );
      }) || races[0];

      if (!matched) return;

      // Carica dati qualifiche dalla view
      const { data: qualiRaw } = await supabase
        .from('race_qualifying_results')
        .select('driver_id, constructor_id, position_number, qualifying_q1_millis, qualifying_q2_millis, qualifying_q3_millis, qualifying_q1, qualifying_q2, qualifying_q3')
        .eq('race_id', matched.id)
        .order('position_number');

      if (!qualiRaw?.length) return;

      // Converti in formato atteso da QualiProgressionChart
      const driverMap = {};
      qualiRaw.forEach(r => {
        driverMap[r.driver_id] = {
          driverId:       r.driver_id,
          constructorId:  r.constructor_id,
          q1pos:  r.qualifying_q1_millis ? null : null, // calcolato sotto
          q1Millis: r.qualifying_q1_millis ?? (r.qualifying_q1 ? parseFloat(r.qualifying_q1.replace(':','').replace('.','')/1000) : null),
          q2Millis: r.qualifying_q2_millis ?? null,
          q3Millis: r.qualifying_q3_millis ?? null,
        };
      });

      // Assegna posizioni per round in base al tempo
      const assignPos = (key, posKey) => {
        const sorted = Object.values(driverMap)
          .filter(d => d[key] != null)
          .sort((a,b) => a[key] - b[key]);
        sorted.forEach((d, i) => { driverMap[d.driverId][posKey] = i + 1; });
      };
      assignPos('q1Millis', 'q1pos');
      assignPos('q2Millis', 'q2pos');
      assignPos('q3Millis', 'q3pos');

      const result = Object.values(driverMap);
      if (result.length) setQualiResults(result);
    } catch(e) { console.error('Quali Supabase load error:', e); }
  };

  const loadRaceResults = async (year, meetingObj) => {
    if (!supabase || !meetingObj) return;

    setLoadingResults(true);
    try {
      const loc         = (meetingObj.location      || '').toLowerCase();
      const country     = (meetingObj.country_name  || '').toLowerCase();
      const circuitShort = (meetingObj.circuit_short_name || '').toLowerCase();
      const meetingName = (meetingObj.meeting_name  || '').toLowerCase()
        .replace(' grand prix', '').replace(' gp', '').trim();

      // 1. Trova la race corrispondente
      const { data: races } = await supabase
        .from('race')
        .select('id, round, circuit_id, official_name, grand_prix_id')
        .eq('year', parseInt(year));

      if (!races?.length) { setRaceResults(null); return; }

      const matched = races.find(r => {
        const fields = [r.official_name, r.circuit_id, r.grand_prix_id]
          .map(f => (f || '').toLowerCase());
        return fields.some(f =>
          f.includes(loc) || loc.includes(f) ||
          f.includes(country) || country.includes(f) ||
          f.includes(meetingName) || meetingName.includes(f) ||
          (circuitShort && (f.includes(circuitShort) || circuitShort.includes(f)))
        );
      });

      if (!matched) { setRaceResults(null); return; }

      // 2. Carica risultati gara dalla view
      const { data: resultsRaw } = await supabase
        .from('race_grid_results')
        .select('driver_id, constructor_id, position_number, position_text, points, grid_position_number, reason_retired, laps')
        .eq('race_id', matched.id)
        .order('position_number');

      if (!resultsRaw?.length) { setRaceResults(null); return; }

      // 3. Converti in formato atteso da GridToRaceChart / QualifyingToRaceProgression
      const filtered = resultsRaw.map(r => ({
        driverId:            r.driver_id,
        constructorId:       r.constructor_id,
        positionNumber:      r.position_number,
        positionText:        r.position_text,
        points:              r.points ?? 0,
        gridPositionNumber:  r.grid_position_number,
        reasonRetired:       r.reason_retired,
        laps:                r.laps,
        year:                parseInt(year),
        round:               matched.round,
      }));

      setRaceResults(filtered.length ? filtered : null);
    } catch (error) {
      console.error('❌ Error loading race results from Supabase:', error);
      setRaceResults(null);
    } finally {
      setLoadingResults(false);
    }
  };
  
  // Selections
  const [year, setYear]               = useState(null);
  const [meetings, setMeetings]       = useState([]);
  const [meeting, setMeeting]         = useState(null);
  const [sessionType, setSessionType] = useState('R');
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

  const dropdownRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  useOutsideClose(dropdownRefs, [setOpenYear, setOpenMeeting, setOpenSession, setOpenDriver]);

  // Auto-populate on mount
  useEffect(() => {
    (async () => {
      try {
        const latest = await getLatestSession('R');
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
    setRaceResults(null); setQualiResults(null);
    if (sessionType === 'R') { loadRaceResults(year, m); loadQualiResults(year, m); }
    try { await loadDriversForSession(m, SESSION_TYPES.find(s => s.id === sessionType)?.name || 'Qualifying'); }
    catch { setDrivers([]); }
  };

  const handleSessionChange = async (sid) => {
    setSessionType(sid); setOpenSession(false); setDrivers([]); setSessionInfo(null);
    setRaceResults(null); setQualiResults(null);
    if (sid === 'R' && meeting) { loadRaceResults(year, meeting); loadQualiResults(year, meeting); }
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
              <Radio className="w-3 h-3" /> OPENF1 API · TELEMETRY EXPLORER · 2023–2026
            </div>
            <h1 className="text-4xl font-black tracking-tighter">TELEMETRY <span className="text-red-600">EXPLORER</span></h1>
          </div>

          {/* ── HERO GUIDE — visible before any selection ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">

            {/* Left: intro text */}
            <div className="lg:col-span-3 relative overflow-hidden rounded-2xl border border-white/8 p-8"
                 style={{background:'linear-gradient(135deg,#0e0e0e 0%,#111 100%)'}}>
              <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
                   style={{background:'radial-gradient(circle,rgba(220,0,0,0.14) 0%,transparent 70%)'}}/>
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                   style={{backgroundImage:'radial-gradient(circle at 1px 1px,#fff 1px,transparent 0)',backgroundSize:'32px 32px'}}/>
              <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
                <div className="h-px w-1/2 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
                     style={{animation:'scan 5s linear infinite'}}/>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
                  <span className="text-[10px] text-red-500 font-mono tracking-[0.3em] uppercase">OpenF1 API · Live Data</span>
                </div>
                <h2 className="text-3xl font-black tracking-tighter leading-none uppercase mb-1">
                  Come leggere<br/>la <span className="text-red-600">Telemetria</span>
                </h2>
                <p className="text-white/40 font-mono text-[11px] tracking-widest uppercase mb-6">Formula 1 · 2023–2026</p>

                <div className="space-y-4 text-sm text-white/70 leading-relaxed">
                  <p>
                    La <strong className="text-white">telemetria</strong> è il flusso continuo di dati che ogni monoposto F1 trasmette ai box a ~50Hz durante la sessione. Ogni punto registra velocità, RPM, marcia inserita, posizione del pedale del gas e del freno.
                  </p>
                  <p>
                    Il grafico <strong className="text-white">Speed</strong> mostra l'andamento della velocità lungo il giro: i picchi corrispondono ai rettilinei, le valli alle frenate. Confronta curve simili per capire dove un pilota frena più tardi o accelera prima.
                  </p>
                  <p>
                    I <strong className="text-white">Settori</strong> dividono il circuito in tre tratti cronometrati. Il miglior tempo teorico è la somma dei migliori S1+S2+S3 di tutti i piloti — nessuno li ottiene insieme nello stesso giro.
                  </p>
                  <p>
                    Il grafico <strong className="text-white">Grid → Race</strong> mostra quante posizioni ha guadagnato o perso ogni pilota dalla griglia all'arrivo. <strong className="text-white">Q1 → Q2 → Q3</strong> traccia l'evoluzione delle qualifiche per vedere chi si è migliorato nel corso delle sessioni.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: how-to steps + data glossary */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* Steps */}
              <div className="rounded-2xl border border-white/8 p-6"
                   style={{background:'rgba(255,255,255,0.02)'}}>
                <div className="text-[10px] text-white/30 font-mono tracking-[0.25em] uppercase mb-4">Come usarlo</div>
                <div className="space-y-3">
                  {[
                    {n:'01', title:'Anno + Gran Premio', desc:'Seleziona la stagione e la gara che vuoi analizzare'},
                    {n:'02', title:'Sessione + Pilota',  desc:'Gara o Sprint, poi il pilota da esaminare'},
                    {n:'03', title:'Fetch Telemetry',    desc:'Carica i dati — velocità, RPM, settori e posizioni'},
                    {n:'04', title:'Esplora i grafici',  desc:'Cambia tab, lap, e passa da Grid→Race a Q1→Q3'},
                  ].map(({n,title,desc})=>(
                    <div key={n} className="flex gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black font-mono text-red-500"
                           style={{background:'rgba(220,0,0,0.1)',border:'1px solid rgba(220,0,0,0.2)'}}>
                        {n}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-tight">{title}</div>
                        <div className="text-[11px] text-white/40 mt-0.5">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini glossary */}
              <div className="rounded-2xl border border-white/8 p-6 flex-1"
                   style={{background:'rgba(255,255,255,0.02)'}}>
                <div className="text-[10px] text-white/30 font-mono tracking-[0.25em] uppercase mb-4">Glossario dati</div>
                <div className="space-y-2">
                  {[
                    {key:'Speed',   val:'Velocità istantanea in km/h',           color:'#f59e0b'},
                    {key:'RPM',     val:'Giri motore — massimo ~18.000 rpm',      color:'#ef4444'},
                    {key:'Gear',    val:'Marcia inserita (0 = folle)',             color:'#6366f1'},
                    {key:'Throttle', val:'Apertura gas in % (0–100)',              color:'#22c55e'},
                    {key:'Brake',   val:'Intensità frenata in % (0–100)',          color:'#ef4444'},
                    {key:'DRS',     val:'Drag Reduction System attivo',            color:'#06b6d4'},
                    {key:'S1/S2/S3',val:'Tempo per settore in secondi',            color:'#a855f7'},
                  ].map(({key,val,color})=>(
                    <div key={key} className="flex items-baseline gap-2">
                      <span className="text-[11px] font-black font-mono w-16 flex-shrink-0" style={{color}}>{key}</span>
                      <span className="text-[11px] text-white/45">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* 2×2 selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {/* Year */}
            <Dropdown label="Year" isOpen={openYear} onToggle={() => setOpenYear(v=>!v)} dropdownRef={dropdownRefs[0]}
              header={<div className="text-2xl font-black font-mono">{year||'—'}</div>}>
              {AVAILABLE_YEARS.map(y => (
                <button key={y} onClick={() => handleYearChange(y)}
                  className={`w-full p-3 text-left font-mono text-sm hover:bg-zinc-800 transition-colors ${year===y?'bg-red-600/15 border-l-2 border-red-600 pl-4 text-red-400':'text-white/80'}`}>
                  {y}
                </button>
              ))}
            </Dropdown>

            {/* Grand Prix */}
            <Dropdown label="Grand Prix" isOpen={openMeeting&&!!year} onToggle={() => year&&setOpenMeeting(v=>!v)}
              disabled={!year||!meetings.length} dropdownRef={dropdownRefs[1]}
              header={
                meeting ? (
                  <div className="flex items-center gap-2">
                    {flagCode && <img src={`https://flagcdn.com/w20/${flagCode}.png`} alt="Bandiera nazione" className="w-5 h-3 object-cover rounded-sm flex-shrink-0" />}
                    <div>
                      <div className="text-sm font-bold leading-tight">{meeting.meeting_name}</div>
                      <div className="text-xs text-white/50">{meeting.location} · {meeting.country_name}</div>
                    </div>
                  </div>
                ) : <div className="text-sm text-white/50">{year?(meetings.length?'Select Grand Prix':'Loading...'):'Select year first'}</div>
              }>
              {meetings.map(m => {
                const fc = getFlagCode(m.location||m.meeting_name||'');
                return (
                  <button key={m.meeting_key} onClick={() => handleMeetingChange(m)}
                    className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 ${meeting?.meeting_key===m.meeting_key?'bg-red-600/15 border-l-2 border-red-600 pl-4':''}`}>
                    {fc && <img src={`https://flagcdn.com/w20/${fc}.png`} alt="Bandiera nazione" className="w-5 h-3 object-cover rounded-sm flex-shrink-0" />}
                    <div>
                      <div className="text-sm font-bold text-white">{m.meeting_name}</div>
                      <div className="text-xs text-white/50">{m.location}</div>
                    </div>
                  </button>
                );
              })}
            </Dropdown>

            {/* Session */}
            <Dropdown label="Session" isOpen={openSession} onToggle={() => setOpenSession(v=>!v)} dropdownRef={dropdownRefs[2]}
              header={<div className="flex items-center gap-3"><span className="text-2xl font-black font-mono">{sessionType}</span><span className="text-white/50 text-sm">{SESSION_TYPES.find(s=>s.id===sessionType)?.name}</span></div>}>
              {SESSION_TYPES.map(s => (
                <button key={s.id} onClick={() => handleSessionChange(s.id)}
                  className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors ${sessionType===s.id?'bg-red-600/15 border-l-2 border-red-600 pl-4':''}`}>
                  <span className="font-mono font-bold text-white mr-3">{s.id}</span>
                  <span className="text-white/50 text-sm">{s.name}</span>
                </button>
              ))}
            </Dropdown>

            {/* Driver */}
            <Dropdown label="Driver" isOpen={openDriver&&!!meeting} onToggle={() => meeting&&drivers.length&&setOpenDriver(v=>!v)}
              disabled={!meeting||!drivers.length} dropdownRef={dropdownRefs[3]}
              header={
                driverInfo ? (
                  <div className="flex items-center gap-3">
                    {driverInfo.headshot_url && <img src={driverInfo.headshot_url} alt="Foto del pilota" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />}
                    <div>
                      <div className="font-black font-mono text-sm flex items-center gap-2">
                        <span style={{ color }}>{driverInfo.name_acronym}</span>
                        <span className="text-white/35 font-normal">#{driverInfo.driver_number}</span>
                      </div>
                      <div className="text-xs text-white/50">{driverInfo.full_name} · {driverInfo.team_name}</div>
                    </div>
                  </div>
                ) : <div className="text-sm text-white/50">{meeting?(drivers.length?'Select Driver':'Loading...'):'Select GP first'}</div>
              }>
              {drivers.map(d => (
                <button key={d.driver_number}
                  onClick={() => { setDriverCode(d.name_acronym); setOpenDriver(false); }}
                  className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 ${driverCode===d.name_acronym?'bg-red-600/15 border-l-2 border-red-600 pl-4':''}`}>
                  {d.headshot_url && <img src={d.headshot_url} alt="Foto del pilota" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
                  <div>
                    <div className="font-mono font-bold text-sm text-white">{d.name_acronym} <span className="text-white/35 font-normal">#{d.driver_number}</span></div>
                    <div className="text-xs text-white/50">{d.full_name} · {d.team_name}</div>
                  </div>
                </button>
              ))}
            </Dropdown>
          </div>

          {/* Fetch row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex-1" />
            {lastQuery && <div className="hidden lg:block text-xs text-white/25 font-mono">{lastQuery.year} · {lastQuery.gp} · {lastQuery.driver} · {lastQuery.session}</div>}
            <button onClick={fetchAll} disabled={!canFetch}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono font-bold text-sm transition-all ${canFetch?'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50':'bg-zinc-800 text-white/35 cursor-not-allowed'}`}>
              {isFetching ? <><RefreshCw className="w-4 h-4 animate-spin" />LOADING…</> : <><Search className="w-4 h-4" />FETCH TELEMETRY</>}
            </button>
          </div>

          {!canFetch && !loading && (
            <div className="mb-6 text-xs text-white/25 font-mono text-center py-2">
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
                      <span className="text-white/35 uppercase mr-2">Time</span>
                      <span className="text-white font-black">{formatTime(fastestLap.lap_duration)}</span>
                    </div>
                    {[1,2,3].map(s => fastestLap[`sector_${s}`] ? (
                      <div key={s} className="text-xs font-mono">
                        <span className="text-white/35 mr-1">S{s}</span>
                        <span className="text-white/80">{fastestLap[`sector_${s}`].toFixed(3)}s</span>
                      </div>
                    ) : null)}
                  </div>
                )}
                {weather && (
                  <div className="flex gap-4 ml-auto">
                    {weather.air_temp   != null && <div className="text-xs font-mono"><span className="text-white/35">Air </span><span className="text-white/80">{weather.air_temp}°C</span></div>}
                    {weather.track_temp != null && <div className="text-xs font-mono"><span className="text-white/35">Track </span><span className="text-white/80">{weather.track_temp}°C</span></div>}
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
                    <div className="text-[10px] text-white/35 font-mono flex items-center gap-2">
                      <span style={{ color }}>● {driverCode}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {['speed','rpm','gear','inputs'].map(t => (
                      <button key={t} onClick={() => setActiveTab(t)}
                        className={`px-3 py-1 text-xs rounded-lg font-mono transition-all ${activeTab===t?'bg-red-600 text-white':'text-white/50 hover:text-white hover:bg-zinc-800'}`}>
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
                    qualiResults={qualiResults}
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
                  <p className="text-white/50 font-mono text-sm">No race results available for this session</p>
                </div>
              )}
            </div>
          )}



          {!isFetching && !error && !telemetry.length && !driverLaps.length && canFetch && (
            <div className="mt-2 flex items-center justify-center gap-3 py-10 rounded-2xl border border-white/6"
                 style={{background:'rgba(255,255,255,0.015)'}}>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
              <span className="text-white/40 font-mono text-sm tracking-widest uppercase">Pronto — clicca Fetch Telemetry per caricare i dati</span>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-zinc-900 pt-4 text-xs text-white/15 font-mono">
            <span>OpenF1 API · openf1.org · 2023–{new Date().getFullYear()}</span>
            <span>{meeting?.meeting_name||'—'} · {driverCode||'—'} · {sessionType} · {year||'—'}</span>
            <span>{telemetry.length ? `${telemetry.length} pts` : 'No data'}</span>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}