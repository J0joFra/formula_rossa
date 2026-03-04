/**
 * PredictorSection.jsx
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Trophy, Target, Loader2,
  ChevronLeft, ChevronRight, BarChart3,
  Flag, Zap, AlertCircle, MapPin, Activity
} from 'lucide-react';

// ─── PUNTI F1 ─────────────────────────────────────────────────────────────────
const PTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const pointsForPos = (p) => PTS[p - 1] ?? 0;

// ─── PILOTI FERRARI DA ANALIZZARE ────────────────────────────────────────────
const FERRARI_DRIVERS = [
  { id: 'charles-leclerc', name: 'Charles Leclerc', short: 'Leclerc', number: 16, color: '#DC0000' },
  { id: 'lewis-hamilton',  name: 'Lewis Hamilton',  short: 'Hamilton', number: 44, color: '#FFD700' },
  { id: 'carlos-sainz',    name: 'Carlos Sainz',    short: 'Sainz',    number: 55, color: '#FF6B35' },
];

// ─── CALENDARIO 2025 (round, circuitId) ──────────────────────────────────────
const CALENDAR_2025 = [
  { round: 1,  circuitId: 'bahrain',           name: 'Bahrain GP',       country: '🇧🇭' },
  { round: 2,  circuitId: 'jeddah',            name: 'Saudi Arabia GP',  country: '🇸🇦' },
  { round: 3,  circuitId: 'albert-park',       name: 'Australian GP',    country: '🇦🇺' },
  { round: 4,  circuitId: 'suzuka',            name: 'Japanese GP',      country: '🇯🇵' },
  { round: 5,  circuitId: 'shanghai',          name: 'Chinese GP',       country: '🇨🇳' },
  { round: 6,  circuitId: 'miami',             name: 'Miami GP',         country: '🇺🇸' },
  { round: 7,  circuitId: 'imola',             name: 'Emilia Romagna GP',country: '🇮🇹' },
  { round: 8,  circuitId: 'monte-carlo',       name: 'Monaco GP',        country: '🇲🇨' },
  { round: 9,  circuitId: 'villeneuve',        name: 'Canadian GP',      country: '🇨🇦' },
  { round: 10, circuitId: 'barcelona',         name: 'Spanish GP',       country: '🇪🇸' },
  { round: 11, circuitId: 'red-bull-ring',     name: 'Austrian GP',      country: '🇦🇹' },
  { round: 12, circuitId: 'silverstone',       name: 'British GP',       country: '🇬🇧' },
  { round: 13, circuitId: 'hungaroring',       name: 'Hungarian GP',     country: '🇭🇺' },
  { round: 14, circuitId: 'spa-francorchamps', name: 'Belgian GP',       country: '🇧🇪' },
  { round: 15, circuitId: 'zandvoort',         name: 'Dutch GP',         country: '🇳🇱' },
  { round: 16, circuitId: 'monza',             name: 'Italian GP',       country: '🇮🇹' },
  { round: 17, circuitId: 'baku',              name: 'Azerbaijan GP',    country: '🇦🇿' },
  { round: 18, circuitId: 'marina-bay',        name: 'Singapore GP',     country: '🇸🇬' },
  { round: 19, circuitId: 'austin',            name: 'US GP',            country: '🇺🇸' },
  { round: 20, circuitId: 'rodriguez',         name: 'Mexico City GP',   country: '🇲🇽' },
  { round: 21, circuitId: 'interlagos',        name: 'Brazilian GP',     country: '🇧🇷' },
  { round: 22, circuitId: 'las-vegas',         name: 'Las Vegas GP',     country: '🇺🇸' },
  { round: 23, circuitId: 'lusail',            name: 'Qatar GP',         country: '🇶🇦' },
  { round: 24, circuitId: 'yas-marina',        name: 'Abu Dhabi GP',     country: '🇦🇪' },
];

// ─── CARICAMENTO JSON LOCALI ──────────────────────────────────────────────────
async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

// ─── ENGINE PREDITTIVO ────────────────────────────────────────────────────────
function buildStats(results, driverId, circuitId = null) {
  const filtered = results.filter(r =>
    r.driverId === driverId &&
    r.year >= 2022 &&
    r.positionNumber != null &&
    (circuitId == null || r._circuitId === circuitId)
  );
  if (!filtered.length) return null;

  const positions = filtered.map(r => r.positionNumber);
  const wins    = positions.filter(p => p === 1).length;
  const podiums = positions.filter(p => p <= 3).length;
  const top5    = positions.filter(p => p <= 5).length;
  const avgPos  = positions.reduce((s, p) => s + p, 0) / positions.length;
  const avgPts  = filtered.reduce((s, r) => s + (r.points ?? pointsForPos(r.positionNumber)), 0) / filtered.length;

  // Forma recente: ultime 5 gare globali (non filtrate per circuito)
  const globalRecent = results
    .filter(r => r.driverId === driverId && r.positionNumber != null && r.year >= 2022)
    .sort((a, b) => b.year - a.year || b.round - a.round)
    .slice(0, 5);
  const recentAvgPos = globalRecent.length
    ? globalRecent.reduce((s, r) => s + r.positionNumber, 0) / globalRecent.length
    : avgPos;

  return {
    races: filtered.length,
    wins, podiums, top5, avgPos, avgPts,
    recentAvgPos,
    winRate:    (wins    / filtered.length) * 100,
    podiumRate: (podiums / filtered.length) * 100,
    top5Rate:   (top5   / filtered.length) * 100,
    recent: globalRecent,
  };
}

function predict(globalStats, circuitStats, circuitType) {
  if (!globalStats) return null;

  // Peso: storico sul circuito (60%) + forma recente (40%)
  const historicPos = circuitStats?.avgPos ?? globalStats.avgPos;
  const blendedPos  = historicPos * 0.6 + globalStats.recentAvgPos * 0.4;

  // Boost per tipo circuito (Ferrari storicamente forte su certi tracciati)
  const typeBoost = { STREET: 0.93, RACE: 1.0 }[circuitType] ?? 1.0;
  const estPos = Math.max(1, Math.min(20, Math.round(blendedPos * typeBoost)));

  // Probabilità
  const podiumBase = circuitStats?.podiumRate ?? globalStats.podiumRate;
  const winBase    = circuitStats?.winRate    ?? globalStats.winRate;

  // Forma recente: se stai andando meglio della media, aumenta le probabilità
  const formFactor = globalStats.avgPos / Math.max(1, globalStats.recentAvgPos);
  const podiumChance = Math.min(95, Math.round(podiumBase * formFactor));
  const winChance    = Math.min(70, Math.round(winBase    * formFactor));
  const estPoints    = pointsForPos(estPos);

  // Trend forma (ultimi 5 vs media storica)
  const formTrend = globalStats.recentAvgPos < globalStats.avgPos ? 'up' :
                    globalStats.recentAvgPos > globalStats.avgPos ? 'down' : 'stable';

  return { estPos, podiumChance, winChance, estPoints, formTrend, blendedPos };
}

function projectChampionship(currentPoints, avgPtsPerRace, racesLeft) {
  const projected = Math.round(currentPoints + avgPtsPerRace * racesLeft);
  const sigma = Math.sqrt(racesLeft) * 4; // spread stimato ±4 pts/gara
  return {
    projected,
    low:  Math.max(0, Math.round(projected - sigma)),
    high: Math.round(projected + sigma),
  };
}

// ─── COMPONENTE ────────────────────────────────────────────────────────────────
export default function PredictorSection() {
  const [driver, setDriver]         = useState(FERRARI_DRIVERS[0]);
  const [race, setRace]             = useState(CALENDAR_2025[2]);
  const [page, setPage]             = useState(0);
  const PER_PAGE = 6;

  const [data, setData]             = useState(null);   // JSON caricati
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError]   = useState(null);
  const [result, setResult]         = useState(null);

  // Carica tutti i JSON una sola volta
  useEffect(() => {
    async function load() {
      setLoadingData(true);
      try {
        const [results, races, circuits, standings] = await Promise.all([
          loadJSON('/data/f1db-races-race-results.json'),
          loadJSON('/data/f1db-races.json'),
          loadJSON('/data/f1db-circuits.json'),
          loadJSON('/data/f1db-races-driver-standings.json'),
        ]);

        // Arricchisce i risultati con circuitId
        const racesMap = Object.fromEntries(races.map(r => [r.id, r]));
        const circuitsMap = Object.fromEntries(circuits.map(c => [c.id, c]));
        const enriched = results.map(r => ({
          ...r,
          _circuitId: racesMap[r.raceId]?.circuitId ?? null,
          _circuitType: circuitsMap[racesMap[r.raceId]?.circuitId]?.type ?? 'RACE',
        }));

        setData({ results: enriched, races, racesMap, circuitsMap, standings });
      } catch (e) {
        setLoadError(e.message);
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, []);

  // Calcola predizione ogni volta che cambia pilota o gara
  useEffect(() => {
    if (!data) return;
    const { results, circuitsMap, standings } = data;

    const circuitId = race.circuitId;
    const circuitInfo = circuitsMap[circuitId];

    // Stats globali pilota (tutti i circuiti)
    const globalStats = buildStats(results, driver.id);
    // Stats specifiche per questo circuito
    const circuitStats = buildStats(results, driver.id, circuitId);

    const pred = predict(globalStats, circuitStats, circuitInfo?.type);

    // Punti campionato attuali (ultima voce 2024)
    const driverStandings2024 = standings
      .filter(s => s.driverId === driver.id && s.year === 2024)
      .sort((a, b) => b.round - a.round);
    const currentPoints = driverStandings2024[0]?.points ?? 0;
    const racesLeft = CALENDAR_2025.length - race.round;
    const champ = globalStats
      ? projectChampionship(currentPoints, globalStats.avgPts, racesLeft)
      : null;

    setResult({
      pred,
      globalStats,
      circuitStats,
      circuitInfo,
      currentPoints,
      champ,
      racesLeft,
    });
  }, [data, driver, race]);

  const pagedRaces = CALENDAR_2025.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(CALENDAR_2025.length / PER_PAGE);

  const trendIcon  = result?.pred?.formTrend === 'up'   ? '↑' :
                     result?.pred?.formTrend === 'down'  ? '↓' : '→';
  const trendColor = result?.pred?.formTrend === 'up'   ? 'text-green-400' :
                     result?.pred?.formTrend === 'down'  ? 'text-red-400'   : 'text-zinc-400';

  return (
    <section className="py-20 px-4 bg-[#080808] text-white">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.5em] mb-3">Scuderia Ferrari · Analisi Statistica</p>
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-4">
            Race<br /><span className="text-red-600">Predictor</span>
          </h2>
          <p className="text-zinc-500 max-w-xl text-sm leading-relaxed">
            Predizioni basate su dati storici F1DB reali — risultati dal 2022 ad oggi.
            Algoritmo: media storica · forma recente · tipo circuito.
          </p>
        </motion.div>

        {loadError && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-3xl p-6 flex items-center gap-4 mb-8">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="font-black text-red-400">Errore nel caricamento dei JSON</p>
              <p className="text-zinc-500 text-sm mt-1">{loadError}</p>
              <p className="text-zinc-600 text-xs mt-1">Verifica che i file siano in <code className="text-zinc-400">public/data/</code></p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-8">

          {/* ── LEFT: CONFIG ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Pilota */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Pilota Ferrari</p>
              <div className="space-y-2">
                {FERRARI_DRIVERS.map(d => (
                  <button key={d.id} onClick={() => setDriver(d)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                      driver.id === d.id ? 'border-red-500 bg-red-500/10' : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0"
                      style={{ backgroundColor: d.color + '22', color: d.color, border: `2px solid ${d.color}44` }}>
                      {d.number}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm">{d.short}</p>
                      <p className="text-zinc-600 text-[10px] uppercase tracking-wider">{d.name.split(' ')[0]}</p>
                    </div>
                    {driver.id === d.id && result?.globalStats && (
                      <div className="ml-auto text-right">
                        <p className="text-[9px] text-zinc-500 uppercase font-bold">Avg Pos</p>
                        <p className="font-black text-sm" style={{ color: d.color }}>
                          {result.globalStats.avgPos.toFixed(1)}°
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Circuito */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Gara Target 2025</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 flex items-center justify-center transition-all">
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <span className="text-[9px] text-zinc-600 font-bold px-1">{page + 1}/{totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                    className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 flex items-center justify-center transition-all">
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {pagedRaces.map(r => (
                  <button key={r.round} onClick={() => setRace(r)}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      race.round === r.round
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-zinc-800 hover:border-zinc-600 bg-zinc-800/20'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{r.country}</span>
                      <span className="text-[9px] text-zinc-600 font-black">R{r.round}</span>
                    </div>
                    <p className="font-black text-[11px] truncate">{r.name.replace(' GP', '')}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Info circuito */}
            {result?.circuitInfo && (
              <motion.div
                key={race.circuitId}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-zinc-500" />
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{result.circuitInfo.name}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-black text-white">{result.circuitInfo.length?.toFixed(2) ?? '—'}</p>
                    <p className="text-[9px] text-zinc-600 uppercase font-bold">km/giro</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-white">{result.circuitInfo.turns ?? '—'}</p>
                    <p className="text-[9px] text-zinc-600 uppercase font-bold">curve</p>
                  </div>
                  <div>
                    <p className={`text-sm font-black ${result.circuitInfo.type === 'STREET' ? 'text-orange-400' : 'text-blue-400'}`}>
                      {result.circuitInfo.type === 'STREET' ? '🏙️' : '🏁'}
                    </p>
                    <p className="text-[9px] text-zinc-600 uppercase font-bold">{result.circuitInfo.type === 'STREET' ? 'Street' : 'Race'}</p>
                  </div>
                </div>
                {result.circuitStats && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[9px] text-zinc-600 uppercase font-bold">Storico su questa pista</span>
                    <span className="text-xs font-black text-white">
                      {result.circuitStats.races} gare · avg {result.circuitStats.avgPos.toFixed(1)}°
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* ── RIGHT: RISULTATI ── */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">

              {loadingData && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-zinc-900/40 border border-white/5 rounded-3xl p-16 flex flex-col items-center justify-center gap-5"
                >
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
                    <div className="absolute inset-0 border-4 border-transparent border-t-red-600 rounded-full animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-sm uppercase tracking-widest mb-1">Caricamento dati F1DB</p>
                    <p className="text-zinc-600 text-xs">Risultati · Circuiti · Classifiche</p>
                  </div>
                </motion.div>
              )}

              {!loadingData && result && result.pred && (
                <motion.div key={`${driver.id}-${race.round}`}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  {/* PREDIZIONE PRINCIPALE */}
                  <div className="bg-zinc-900/60 border border-white/5 rounded-3xl overflow-hidden">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-red-950/20 to-transparent">
                      <div className="flex items-center gap-3">
                        <Flag className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="font-black text-sm">{race.name}</p>
                          <p className="text-zinc-500 text-[10px] uppercase tracking-widest">
                            Round {race.round} · 2025 · {result.circuitInfo?.name ?? race.circuitId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-zinc-800/60 px-3 py-1 rounded-full">
                        <Activity className="w-3 h-3 text-zinc-400" />
                        <span className={`text-xs font-black ${trendColor}`}>Forma {trendIcon}</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start gap-8 mb-6">
                        {/* Posizione stimata */}
                        <div className="text-center shrink-0">
                          <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">Posizione Stimata</p>
                          <motion.span
                            key={result.pred.estPos}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-8xl font-black leading-none"
                            style={{ color: driver.color }}
                          >
                            {result.pred.estPos}°
                          </motion.span>
                          <p className="text-[9px] text-zinc-600 uppercase font-bold mt-1">
                            {result.pred.estPoints} pts stimati
                          </p>
                        </div>

                        {/* Barre probabilità */}
                        <div className="flex-1 space-y-4">
                          {[
                            { label: '% Podio',   value: result.pred.podiumChance, color: 'bg-yellow-500' },
                            { label: '% Vittoria', value: result.pred.winChance,   color: 'bg-red-500' },
                            { label: '% Top 5',   value: result.globalStats?.top5Rate ?? 0, color: 'bg-blue-500' },
                          ].map((bar, i) => (
                            <div key={i}>
                              <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                                <span className="text-zinc-500">{bar.label}</span>
                                <span className="text-white">{Math.round(bar.value)}%</span>
                              </div>
                              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div className={`h-full rounded-full ${bar.color}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, bar.value)}%` }}
                                  transition={{ delay: i * 0.1 + 0.2, duration: 0.7, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Fonte dati */}
                      <div className="flex items-center gap-2 text-[9px] text-zinc-700 uppercase tracking-widest font-bold border-t border-white/5 pt-4">
                        <BarChart3 className="w-3 h-3" />
                        {result.globalStats.races} gare analizzate (2022–2024) ·
                        {result.circuitStats ? ` ${result.circuitStats.races} su questo circuito` : ' nessuna storia su questa pista'}
                      </div>
                    </div>
                  </div>

                  {/* STORICO + CAMPIONATO */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Storico */}
                    <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Storico 2022–24</p>
                      </div>
                      {result.globalStats ? (
                        <div className="space-y-2">
                          {[
                            { label: 'Gare',      val: result.globalStats.races,               color: 'text-zinc-300' },
                            { label: 'Vittorie',  val: result.globalStats.wins,                color: 'text-yellow-400' },
                            { label: 'Podi',      val: result.globalStats.podiums,             color: 'text-orange-400' },
                            { label: 'Avg Pos',   val: result.globalStats.avgPos.toFixed(1) + '°', color: 'text-white' },
                            { label: 'Avg Punti', val: result.globalStats.avgPts.toFixed(1),   color: 'text-green-400' },
                          ].map((s, i) => (
                            <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                              <span className="text-[10px] text-zinc-600 uppercase font-bold">{s.label}</span>
                              <span className={`font-black text-sm ${s.color}`}>{s.val}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-zinc-600 text-sm">Nessun dato</p>}
                    </div>

                    {/* Proiezione campionato */}
                    <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Campionato 2025</p>
                      </div>
                      {result.champ ? (
                        <>
                          <div className="text-center mb-4">
                            <p className="text-[9px] text-zinc-600 uppercase font-black mb-1">Punti Finali Stimati</p>
                            <motion.p key={result.champ.projected}
                              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                              className="text-5xl font-black text-white">
                              {result.champ.projected}
                            </motion.p>
                          </div>
                          <div className="bg-zinc-800/40 rounded-2xl p-3 text-center mb-3 border border-white/5">
                            <p className="text-[9px] text-zinc-600 uppercase font-black mb-1">Range confidenza</p>
                            <p className="font-black font-mono text-sm">
                              <span className="text-red-400">{result.champ.low}</span>
                              <span className="text-zinc-600"> – </span>
                              <span className="text-green-400">{result.champ.high}</span>
                            </p>
                          </div>
                          <div className="flex justify-between text-[9px] text-zinc-600 uppercase font-bold">
                            <span>Attuali: {result.currentPoints} pts</span>
                            <span>{result.racesLeft} gare left</span>
                          </div>
                        </>
                      ) : <p className="text-zinc-600 text-sm">Nessun dato</p>}
                    </div>
                  </div>

                  {/* ULTIMI RISULTATI */}
                  {result.globalStats?.recent?.length > 0 && (
                    <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 text-zinc-400" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ultimi 5 Risultati</p>
                      </div>
                      <div className="space-y-2">
                        {result.globalStats.recent.map((r, i) => (
                          <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                              r.positionNumber === 1  ? 'bg-yellow-500/20 text-yellow-400' :
                              r.positionNumber <= 3   ? 'bg-orange-500/20 text-orange-400' :
                              r.positionNumber <= 10  ? 'bg-green-500/10 text-green-500'   :
                              'bg-zinc-800 text-zinc-500'
                            }`}>
                              {r.positionNumber ?? 'DNF'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-xs truncate">{r._circuitId ?? 'Gara'}</p>
                              <p className="text-zinc-600 text-[9px]">{r.year} · Round {r.round}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="font-black text-xs text-yellow-400">
                                {r.points ?? pointsForPos(r.positionNumber)} pts
                              </p>
                              {r.gridPositionNumber && (
                                <p className="text-zinc-700 text-[9px]">Grid {r.gridPositionNumber}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nota metodologia */}
                  <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
                    <p className="text-[9px] text-zinc-700 leading-relaxed uppercase tracking-wider font-bold">
                      ⚙️ Metodologia: media posizioni 2022–2024 (peso 60%) + forma recente ultimi 5 risultati (peso 40%).
                      Tipo circuito (street/race) applica un coefficiente correttivo basato su performance storiche Ferrari.
                      Proiezione campionato: punti attuali + media punti/gara × gare rimanenti con intervallo ±σ.
                      I dati sono forniti da F1DB (f1db.com).
                    </p>
                  </div>
                </motion.div>
              )}

              {!loadingData && result && !result.pred && (
                <motion.div key="nodata" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-zinc-900/40 border border-white/5 rounded-3xl p-16 flex flex-col items-center justify-center text-center"
                >
                  <Target className="w-12 h-12 text-zinc-700 mb-4" />
                  <p className="font-black text-sm uppercase tracking-widest mb-2">Dati insufficienti</p>
                  <p className="text-zinc-600 text-xs max-w-xs">
                    Non ci sono abbastanza dati storici per {driver.short} su questo circuito.
                    Prova un altro pilota o un circuito con più storia.
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
