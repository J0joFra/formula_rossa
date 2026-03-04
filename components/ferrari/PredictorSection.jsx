/**
 * PredictorSection.jsx
 *
 * Self-updating Race Predictor basato sui JSON locali F1DB.
 *
 * LOGICA AUTO-AGGIORNANTE:
 *  - Legge f1db-races-race-results.json → trova l'ultima gara disponibile
 *  - La prossima gara da predire è automaticamente la successiva nel calendario
 *  - Quando aggiungi un risultato 2026 al JSON, la predizione avanza alla gara dopo
 *
 * ALGORITMO (tutto sui dati storici reali):
 *  1. Filtra risultati del pilota negli ultimi 5 anni (peso maggiore agli anni recenti)
 *  2. Statistiche specifiche per circuito se disponibili
 *  3. Trend forma: ultimi 5 risultati vs media storica
 *  4. Stima posizione finale con intervallo di confidenza
 *  5. Proiezione punti campionato 2026
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Trophy, Target, Loader2,
  ChevronLeft, ChevronRight, BarChart3,
  Flag, Zap, AlertCircle, MapPin, Activity,
  ChevronDown, Users, RefreshCw
} from 'lucide-react';

// ─── PUNTI F1 ─────────────────────────────────────────────────────────────────
const PTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const ptsFor = (p) => (p >= 1 && p <= 10) ? PTS[p - 1] : 0;

// ─── CALENDARIO 2026 ──────────────────────────────────────────────────────────
// circuitId deve corrispondere agli id in f1db-races.json/f1db-circuits.json
const CALENDAR_2026 = [
  { round: 1,  circuitId: 'albert-park',       name: 'Australian GP',     country: '🇦🇺', date: '2026-03-15' },
  { round: 2,  circuitId: 'shanghai',           name: 'Chinese GP',        country: '🇨🇳', date: '2026-03-22' },
  { round: 3,  circuitId: 'suzuka',             name: 'Japanese GP',       country: '🇯🇵', date: '2026-04-05' },
  { round: 4,  circuitId: 'bahrain',            name: 'Bahrain GP',        country: '🇧🇭', date: '2026-04-19' },
  { round: 5,  circuitId: 'jeddah',             name: 'Saudi Arabia GP',   country: '🇸🇦', date: '2026-04-26' },
  { round: 6,  circuitId: 'miami',              name: 'Miami GP',          country: '🇺🇸', date: '2026-05-10' },
  { round: 7,  circuitId: 'imola',              name: 'Emilia Romagna GP', country: '🇮🇹', date: '2026-05-24' },
  { round: 8,  circuitId: 'monte-carlo',        name: 'Monaco GP',         country: '🇲🇨', date: '2026-05-31' },
  { round: 9,  circuitId: 'barcelona',          name: 'Spanish GP',        country: '🇪🇸', date: '2026-06-14' },
  { round: 10, circuitId: 'villeneuve',         name: 'Canadian GP',       country: '🇨🇦', date: '2026-06-21' },
  { round: 11, circuitId: 'red-bull-ring',      name: 'Austrian GP',       country: '🇦🇹', date: '2026-07-05' },
  { round: 12, circuitId: 'silverstone',        name: 'British GP',        country: '🇬🇧', date: '2026-07-19' },
  { round: 13, circuitId: 'hungaroring',        name: 'Hungarian GP',      country: '🇭🇺', date: '2026-08-02' },
  { round: 14, circuitId: 'spa-francorchamps',  name: 'Belgian GP',        country: '🇧🇪', date: '2026-08-30' },
  { round: 15, circuitId: 'zandvoort',          name: 'Dutch GP',          country: '🇳🇱', date: '2026-09-06' },
  { round: 16, circuitId: 'monza',              name: 'Italian GP',        country: '🇮🇹', date: '2026-09-13' },
  { round: 17, circuitId: 'baku',               name: 'Azerbaijan GP',     country: '🇦🇿', date: '2026-09-27' },
  { round: 18, circuitId: 'marina-bay',         name: 'Singapore GP',      country: '🇸🇬', date: '2026-10-04' },
  { round: 19, circuitId: 'austin',             name: 'US GP',             country: '🇺🇸', date: '2026-10-18' },
  { round: 20, circuitId: 'rodriguez',          name: 'Mexico City GP',    country: '🇲🇽', date: '2026-10-25' },
  { round: 21, circuitId: 'interlagos',         name: 'Brazilian GP',      country: '🇧🇷', date: '2026-11-08' },
  { round: 22, circuitId: 'las-vegas',          name: 'Las Vegas GP',      country: '🇺🇸', date: '2026-11-21' },
  { round: 23, circuitId: 'lusail',             name: 'Qatar GP',          country: '🇶🇦', date: '2026-11-29' },
  { round: 24, circuitId: 'yas-marina',         name: 'Abu Dhabi GP',      country: '🇦🇪', date: '2026-12-06' },
];

// ─── PILOTI FERRARI 2026 (default) ───────────────────────────────────────────
const FERRARI_DEFAULT = ['charles-leclerc', 'lewis-hamilton'];

// ─── CARICA JSON ──────────────────────────────────────────────────────────────
async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Cannot load ${path}`);
  return res.json();
}

// ─── PESI ANNO (più recente = più peso) ───────────────────────────────────────
function yearWeight(year, currentYear) {
  const delta = currentYear - year;
  if (delta === 0) return 3.0;
  if (delta === 1) return 2.0;
  if (delta === 2) return 1.5;
  if (delta <= 5)  return 1.0;
  return 0.5; // dati storici lontani contano meno
}

// ─── ENGINE STATISTICO ────────────────────────────────────────────────────────
function buildDriverStats(results, driverId, circuitId = null) {
  const currentYear = Math.max(...results.map(r => r.year));
  const MIN_YEAR = currentYear - 7; // ultimi 7 anni

  const filtered = results.filter(r =>
    r.driverId === driverId &&
    r.year >= MIN_YEAR &&
    r.positionNumber != null &&
    (circuitId == null || r._circuitId === circuitId)
  );

  if (!filtered.length) return null;

  // Calcola medie pesate per anno
  let weightedPosSum = 0, weightSum = 0;
  let wins = 0, podiums = 0, top5 = 0, top10 = 0;
  let totalPoints = 0;

  filtered.forEach(r => {
    const w = yearWeight(r.year, currentYear);
    weightedPosSum += r.positionNumber * w;
    weightSum += w;
    totalPoints += ptsFor(r.positionNumber) * w;
    if (r.positionNumber === 1) wins++;
    if (r.positionNumber <= 3) podiums++;
    if (r.positionNumber <= 5) top5++;
    if (r.positionNumber <= 10) top10++;
  });

  const avgPos  = weightedPosSum / weightSum;
  const avgPts  = totalPoints / weightSum;
  const n       = filtered.length;

  // Forma recente: ultimi 5 risultati (non filtrati per circuito)
  const allRecent = results
    .filter(r => r.driverId === driverId && r.positionNumber != null)
    .sort((a, b) => b.year - a.year || b.round - a.round)
    .slice(0, 5);

  const recentAvgPos = allRecent.length
    ? allRecent.reduce((s, r) => s + r.positionNumber, 0) / allRecent.length
    : avgPos;

  // Deviazione standard (per intervallo confidenza)
  const variance = filtered.reduce((s, r) => s + Math.pow(r.positionNumber - avgPos, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  return {
    n, avgPos, avgPts, stdDev,
    wins, podiums, top5, top10,
    winRate:    (wins    / n) * 100,
    podiumRate: (podiums / n) * 100,
    top5Rate:   (top5   / n) * 100,
    recentAvgPos,
    recent: allRecent,
    formTrend: recentAvgPos < avgPos - 0.5 ? 'up' :
               recentAvgPos > avgPos + 0.5 ? 'down' : 'stable',
  };
}

function computePrediction(globalStats, circuitStats) {
  if (!globalStats) return null;

  // Stima posizione: blend storico circuito (60%) + forma recente (40%)
  const historicPos = circuitStats?.avgPos ?? globalStats.avgPos;
  const blended     = historicPos * 0.6 + globalStats.recentAvgPos * 0.4;
  const estPos      = Math.max(1, Math.min(20, Math.round(blended)));

  // Intervallo confidenza ±1σ
  const sigma = circuitStats?.stdDev ?? globalStats.stdDev;
  const posLow  = Math.max(1,  Math.round(estPos - sigma * 0.7));
  const posHigh = Math.min(20, Math.round(estPos + sigma * 0.7));

  // Probabilità: storico base + boost/malus dalla forma recente
  const formFactor = globalStats.avgPos / Math.max(1, globalStats.recentAvgPos);
  const podiumChance = Math.min(95, Math.max(0, Math.round(
    (circuitStats?.podiumRate ?? globalStats.podiumRate) * Math.min(formFactor, 1.5)
  )));
  const winChance = Math.min(70, Math.max(0, Math.round(
    (circuitStats?.winRate ?? globalStats.winRate) * Math.min(formFactor, 1.5)
  )));
  const estPts = ptsFor(estPos);

  return { estPos, posLow, posHigh, podiumChance, winChance, estPts, sigma };
}

function projectChampionship(results2026, driverId, racesLeft, globalStats) {
  const pts2026 = results2026
    .filter(r => r.driverId === driverId && r.positionNumber != null)
    .reduce((s, r) => s + ptsFor(r.positionNumber), 0);

  const avgPts = globalStats?.avgPts ?? 8;
  const projected = Math.round(pts2026 + avgPts * racesLeft);
  const sigma = Math.sqrt(racesLeft) * 4;
  return {
    current: pts2026,
    projected,
    low:  Math.max(0, Math.round(projected - sigma)),
    high: Math.round(projected + sigma),
  };
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
export default function PredictorSection() {
  // ── State ──
  const [dbData, setDbData]           = useState(null);
  const [loadingDB, setLoadingDB]     = useState(true);
  const [loadError, setLoadError]     = useState(null);

  // Piloti selezionati (default: Leclerc + Hamilton)
  const [primaryDriver, setPrimaryDriver]     = useState(null);
  const [secondaryDriver, setSecondaryDriver] = useState(null);
  const [showDriverPicker, setShowDriverPicker] = useState(false);
  const [pickerTarget, setPickerTarget]       = useState('primary'); // 'primary' | 'secondary'
  const [driverSearch, setDriverSearch]       = useState('');

  // Gara target (auto: prima gara senza risultato)
  const [targetRace, setTargetRace]   = useState(CALENDAR_2026[0]);
  const [racePage, setRacePage]       = useState(0);
  const RACES_PER_PAGE = 6;

  // ── Carica JSON al mount ──
  useEffect(() => {
    async function load() {
      setLoadingDB(true);
      try {
        const [rawResults, rawRaces, rawCircuits, rawDrivers] = await Promise.all([
          loadJSON('/data/f1db-races-race-results.json'),
          loadJSON('/data/f1db-races.json'),
          loadJSON('/data/f1db-circuits.json'),
          loadJSON('/data/f1db-drivers.json'),
        ]);

        // Mappa gare → circuito
        const racesMap    = Object.fromEntries(rawRaces.map(r => [r.id, r]));
        const circuitsMap = Object.fromEntries(rawCircuits.map(c => [c.id, c]));

        // Arricchisci risultati con circuitId + circuitType
        const results = rawResults.map(r => ({
          ...r,
          _circuitId:   racesMap[r.raceId]?.circuitId ?? null,
          _circuitType: circuitsMap[racesMap[r.raceId]?.circuitId]?.type ?? 'RACE',
        }));

        // Estrai tutti i piloti con almeno 20 gare (per evitare piloti con 1 gara)
        const driverMap = Object.fromEntries(rawDrivers.map(d => [d.id, d]));
        const driverRaceCounts = results.reduce((acc, r) => {
          acc[r.driverId] = (acc[r.driverId] ?? 0) + 1;
          return acc;
        }, {});
        const activeDrivers = Object.entries(driverRaceCounts)
          .filter(([, count]) => count >= 20)
          .map(([id]) => ({
            id,
            
            number: driverMap[id]?.permanentNumber ?? null,
          }))
          .sort((a, b) => a.id.localeCompare(b.id));

        // Trova la prima gara 2026 senza risultato → gara da predire
        const results2026 = results.filter(r => r.year === 2026);
        const completedRounds2026 = new Set(results2026.map(r => r.round));
        const nextRace = CALENDAR_2026.find(r => !completedRounds2026.has(r.round)) ?? CALENDAR_2026[0];

        setTargetRace(nextRace);
        setRacePage(Math.floor((nextRace.round - 1) / RACES_PER_PAGE));

        // Imposta default drivers
        const lec = activeDrivers.find(d => d.id === 'charles-leclerc');
        const ham = activeDrivers.find(d => d.id === 'lewis-hamilton');
        setPrimaryDriver(lec ?? activeDrivers[0]);
        setSecondaryDriver(ham ?? activeDrivers[1]);

        setDbData({ results, results2026, activeDrivers, circuitsMap, completedRounds2026 });
      } catch (e) {
        setLoadError(e.message);
      } finally {
        setLoadingDB(false);
      }
    }
    load();
  }, []);

  // ── Calcola predizioni ──
  const predictions = useMemo(() => {
    if (!dbData || !primaryDriver || !secondaryDriver) return null;
    const { results, results2026, circuitsMap } = dbData;
    const circuitInfo = circuitsMap[targetRace.circuitId];
    const circuitId   = targetRace.circuitId;

    const calc = (dId) => {
      const global  = buildDriverStats(results, dId);
      const circuit = buildDriverStats(results, dId, circuitId);
      const pred    = computePrediction(global, circuit);
      const racesLeft = CALENDAR_2026.length - targetRace.round + 1;
      const champ   = projectChampionship(results2026, dId, racesLeft, global);
      return { global, circuit, pred, champ };
    };

    return {
      primary:   calc(primaryDriver.id),
      secondary: calc(secondaryDriver.id),
      circuitInfo,
      racesLeft: CALENDAR_2026.length - targetRace.round + 1,
      completedRounds: dbData.completedRounds2026,
    };
  }, [dbData, primaryDriver, secondaryDriver, targetRace]);

  // ── Driver picker filtrato ──
  const filteredDrivers = useMemo(() => {
    if (!dbData) return [];
    const q = driverSearch.toLowerCase();
    return dbData.activeDrivers.filter(d =>
      d.id.toLowerCase().includes(q)
    );
  }, [dbData, driverSearch]);

  const pagedRaces    = CALENDAR_2026.slice(racePage * RACES_PER_PAGE, (racePage + 1) * RACES_PER_PAGE);
  const totalRacePages = Math.ceil(CALENDAR_2026.length / RACES_PER_PAGE);

  const trendLabel = (t) => t === 'up' ? '↑ In forma' : t === 'down' ? '↓ In calo' : '→ Stabile';
  const trendColor = (t) => t === 'up' ? 'text-green-400' : t === 'down' ? 'text-red-400' : 'text-zinc-400';

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <section className="py-20 px-4 bg-[#080808] text-white">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.5em] mb-3">
            Scuderia Ferrari · Predizione 2026
          </p>
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-4">
            Race<br /><span className="text-red-600">Predictor</span>
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xl">
              Predizioni statistiche basate su dati F1DB (1950→2026). Si aggiorna automaticamente
              ogni volta che aggiungi risultati al JSON.
            </p>
            {predictions?.completedRounds && (
              <div className="flex items-center gap-2 bg-zinc-900/60 border border-white/5 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {predictions.completedRounds.size} gare 2026 completate
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ERRORE */}
        {loadError && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-3xl p-6 flex items-center gap-4 mb-8">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="font-black text-red-400">Errore nel caricamento dei dati</p>
              <p className="text-zinc-500 text-sm mt-1">{loadError}</p>
              <p className="text-zinc-600 text-xs mt-1">Verifica che i JSON siano in <code className="text-zinc-400 bg-zinc-800 px-1 rounded">public/data/</code></p>
            </div>
          </div>
        )}

        {loadingDB && (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-red-600 rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-black text-sm uppercase tracking-widest mb-1">Caricamento database F1</p>
              <p className="text-zinc-600 text-xs">1950 → 2026 · Risultati · Circuiti · Piloti</p>
            </div>
          </div>
        )}

        {!loadingDB && !loadError && predictions && (
          <div className="grid lg:grid-cols-12 gap-8">

            {/* ── COLONNA SINISTRA: CONFIG ── */}
            <div className="lg:col-span-4 space-y-5">

              {/* SELEZIONE PILOTI */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-zinc-500" />
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Piloti a confronto</p>
                </div>

                {/* Pilota primario */}
                {[
                  { label: 'Pilota A', driver: primaryDriver, target: 'primary',   color: '#DC0000' },
                  { label: 'Pilota B', driver: secondaryDriver, target: 'secondary', color: '#FFD700' },
                ].map(({ label, driver: drv, target, color }) => (
                  <div key={target} className="mb-3">
                    <p className="text-[9px] text-zinc-700 uppercase font-bold mb-1">{label}</p>
                    <button
                      onClick={() => {
                        setPickerTarget(target);
                        setDriverSearch('');
                        setShowDriverPicker(p => pickerTarget === target ? !p : true);
                      }}
                      className="w-full p-3 rounded-2xl border border-zinc-800 hover:border-zinc-600 transition-all flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                        style={{ backgroundColor: color + '22', color, border: `2px solid ${color}44` }}>
                        {drv?.id?.split('-').pop().slice(0, 3).toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-black text-sm truncate">{drv?.id ?? '—'}</p>
                        {predictions[target]?.global && (
                          <p className="text-zinc-600 text-[9px] uppercase">
                            Avg {predictions[target].global.avgPos.toFixed(1)}° · {predictions[target].global.n} gare
                          </p>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4 text-zinc-600 shrink-0" />
                    </button>
                  </div>
                ))}

                {/* Driver picker dropdown */}
                <AnimatePresence>
                  {showDriverPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
                    >
                      <div className="p-3 border-b border-zinc-800">
                        <input
                          autoFocus
                          value={driverSearch}
                          onChange={e => setDriverSearch(e.target.value)}
                          placeholder="Cerca pilota..."
                          className="w-full bg-zinc-800 rounded-xl px-3 py-2 text-sm outline-none text-white placeholder-zinc-600 font-bold"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredDrivers.slice(0, 30).map(d => (
                          <button key={d.id}
                            onClick={() => {
                              if (pickerTarget === 'primary') setPrimaryDriver(d);
                              else setSecondaryDriver(d);
                              setShowDriverPicker(false);
                            }}
                            className="w-full px-4 py-2.5 hover:bg-zinc-800 transition-all flex items-center gap-3 text-left"
                          >
                            <span className="text-[10px] font-black text-zinc-500 w-8">{d.short}</span>
                            <span className="text-sm font-bold truncate">{d.id}</span>
                          </button>
                        ))}
                        {filteredDrivers.length === 0 && (
                          <p className="text-center text-zinc-600 text-xs py-4">Nessun pilota trovato</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SELEZIONE GARA */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Calendario 2026</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setRacePage(p => Math.max(0, p - 1))} disabled={racePage === 0}
                      className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 flex items-center justify-center transition-all">
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span className="text-[9px] text-zinc-600 font-bold px-1">{racePage + 1}/{totalRacePages}</span>
                    <button onClick={() => setRacePage(p => Math.min(totalRacePages - 1, p + 1))} disabled={racePage === totalRacePages - 1}
                      className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 flex items-center justify-center transition-all">
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {pagedRaces.map(r => {
                    const isDone = predictions.completedRounds.has(r.round);
                    const isNext = !isDone && CALENDAR_2026.find(c =>
                      !predictions.completedRounds.has(c.round))?.round === r.round;
                    return (
                      <button key={r.round} onClick={() => setTargetRace(r)}
                        className={`p-3 rounded-xl border transition-all text-left relative ${
                          targetRace.round === r.round
                            ? 'border-red-500 bg-red-500/10'
                            : isDone
                            ? 'border-green-500/30 bg-green-500/5 opacity-70'
                            : 'border-zinc-800 hover:border-zinc-600 bg-zinc-800/20'
                        }`}
                      >
                        {isNext && (
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        )}
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm">{r.country}</span>
                          <span className="text-[9px] text-zinc-600 font-black">R{r.round}</span>
                          {isDone && <span className="text-[8px] text-green-500 font-black ml-auto">✓</span>}
                        </div>
                        <p className="font-black text-[11px] truncate">{r.name.replace(' GP', '')}</p>
                        <p className="text-zinc-700 text-[9px]">{new Date(r.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* INFO CIRCUITO */}
              {predictions.circuitInfo && (
                <motion.div key={targetRace.circuitId} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-zinc-600" />
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      {predictions.circuitInfo.fullName ?? predictions.circuitInfo.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-black">{predictions.circuitInfo.length?.toFixed(3) ?? '—'}</p>
                      <p className="text-[9px] text-zinc-600 uppercase font-bold">km/giro</p>
                    </div>
                    <div>
                      <p className="text-lg font-black">{predictions.circuitInfo.turns ?? '—'}</p>
                      <p className="text-[9px] text-zinc-600 uppercase font-bold">curve</p>
                    </div>
                    <div>
                      <p className="text-lg font-black">{predictions.circuitInfo.type === 'STREET' ? '🏙️' : '🏁'}</p>
                      <p className="text-[9px] text-zinc-600 uppercase font-bold">{predictions.circuitInfo.type === 'STREET' ? 'Street' : 'Race'}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── COLONNA DESTRA: RISULTATI ── */}
            <div className="lg:col-span-8 space-y-5">

              {/* HEADER GARA TARGET */}
              <motion.div key={targetRace.round}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-950/30 to-zinc-900/60 border border-red-500/20 rounded-3xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{targetRace.country}</div>
                    <div>
                      <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-1">
                        Prossima predizione
                      </p>
                      <h3 className="text-2xl font-black uppercase italic tracking-tight">{targetRace.name}</h3>
                      <p className="text-zinc-500 text-xs uppercase tracking-widest">
                        Round {targetRace.round} · {new Date(targetRace.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {predictions.completedRounds.has(targetRace.round) && (
                    <div className="bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full">
                      <p className="text-green-400 text-xs font-black uppercase tracking-widest">✓ Completata</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* CONFRONTO PILOTI */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'primary',   driver: primaryDriver,   color: '#DC0000', data: predictions.primary },
                  { key: 'secondary', driver: secondaryDriver, color: '#FFD700', data: predictions.secondary },
                ].map(({ key, driver: drv, color, data }) => (
                  <motion.div key={`${key}-${drv?.id}-${targetRace.round}`}
                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-900/60 border border-white/5 rounded-3xl overflow-hidden"
                  >
                    {/* Header pilota */}
                    <div className="p-4 border-b border-white/5 flex items-center gap-3"
                      style={{ background: `linear-gradient(135deg, ${color}15 0%, transparent 60%)` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                        style={{ backgroundColor: color + '22', color, border: `2px solid ${color}44` }}>
                        {drv?.id?.split('-').pop().slice(0, 3).toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-black text-sm">{drv?.id ?? '—'}</p>
                        {data.global && (
                          <p className={`text-[9px] font-black ${trendColor(data.global.formTrend)}`}>
                            {trendLabel(data.global.formTrend)}
                          </p>
                        )}
                      </div>
                    </div>

                    {data.pred ? (
                      <div className="p-5">
                        {/* Posizione stimata */}
                        <div className="text-center mb-5">
                          <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">Pos. Stimata</p>
                          <div className="flex items-end justify-center gap-1">
                            <motion.span
                              key={data.pred.estPos}
                              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                              className="text-6xl font-black leading-none"
                              style={{ color }}
                            >
                              {data.pred.estPos}°
                            </motion.span>
                          </div>
                          <p className="text-zinc-600 text-[10px] mt-1 font-mono">
                            range {data.pred.posLow}° – {data.pred.posHigh}°
                          </p>
                        </div>

                        {/* Barre */}
                        <div className="space-y-3 mb-5">
                          {[
                            { label: '% Podio',   val: data.pred.podiumChance },
                            { label: '% Vittoria', val: data.pred.winChance },
                          ].map((b, i) => (
                            <div key={i}>
                              <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                <span className="text-zinc-600">{b.label}</span>
                                <span style={{ color }}>{b.val}%</span>
                              </div>
                              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div className="h-full rounded-full"
                                  style={{ backgroundColor: color }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, b.val)}%` }}
                                  transition={{ delay: 0.2 + i * 0.1, duration: 0.7 }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Mini stats */}
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="bg-zinc-800/40 rounded-xl p-2 border border-white/5">
                            <p className="text-[8px] text-zinc-600 uppercase font-bold">Pts stimati</p>
                            <p className="font-black text-sm" style={{ color }}>{data.pred.estPts}</p>
                          </div>
                          <div className="bg-zinc-800/40 rounded-xl p-2 border border-white/5">
                            <p className="text-[8px] text-zinc-600 uppercase font-bold">Pts 2026</p>
                            <p className="font-black text-sm text-white">{data.champ?.current ?? 0}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-zinc-600 text-xs">Dati insufficienti</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* STORICO SUL CIRCUITO */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'primary',   driver: primaryDriver,   color: '#DC0000', data: predictions.primary },
                  { key: 'secondary', driver: secondaryDriver, color: '#FFD700', data: predictions.secondary },
                ].map(({ key, driver: drv, color, data }) => (
                  <div key={key} className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-3.5 h-3.5" style={{ color }} />
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest truncate">
                        {drv?.id ?? '—'} su {targetRace.name.replace(' GP', '')}
                      </p>
                    </div>
                    {data.circuit ? (
                      <div className="space-y-2">
                        {[
                          { label: 'Gare su questo circuito', val: data.circuit.n },
                          { label: 'Media posizione',         val: data.circuit.avgPos.toFixed(1) + '°' },
                          { label: 'Vittorie',                val: data.circuit.wins },
                          { label: 'Podi',                    val: data.circuit.podiums },
                        ].map((s, i) => (
                          <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                            <span className="text-[9px] text-zinc-600 uppercase font-bold">{s.label}</span>
                            <span className="font-black text-sm text-white">{s.val}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-700 text-xs">Nessuno storico su questo circuito</p>
                    )}
                  </div>
                ))}
              </div>

              {/* PROIEZIONE CAMPIONATO */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    Proiezione Campionato 2026 · {predictions.racesLeft} gare rimanenti
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { driver: primaryDriver,   color: '#DC0000', champ: predictions.primary.champ },
                    { driver: secondaryDriver, color: '#FFD700', champ: predictions.secondary.champ },
                  ].map(({ driver: drv, color, champ }, i) => champ && (
                    <div key={i} className="text-center">
                      <p className="text-[9px] text-zinc-600 uppercase font-black mb-2">{drv?.id ?? '—'}</p>
                      <p className="text-5xl font-black mb-1" style={{ color }}>{champ.projected}</p>
                      <p className="text-[10px] font-mono text-zinc-600">
                        <span className="text-red-400">{champ.low}</span>
                        {' – '}
                        <span className="text-green-400">{champ.high}</span>
                        {' pts'}
                      </p>
                      <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (champ.projected / 500) * 100)}%` }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                        />
                      </div>
                      <p className="text-[9px] text-zinc-700 mt-1">su 500 pts max stagione</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ULTIMI 5 RISULTATI */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'primary',   driver: primaryDriver,   color: '#DC0000', data: predictions.primary },
                  { key: 'secondary', driver: secondaryDriver, color: '#FFD700', data: predictions.secondary },
                ].map(({ key, driver: drv, color, data }) => (
                  <div key={key} className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-3.5 h-3.5" style={{ color }} />
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        Ultimi risultati · {drv?.id ?? '—'}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {data.global?.recent?.map((r, i) => (
                        <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-white/5 last:border-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                            r.positionNumber === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                            r.positionNumber <= 3  ? 'bg-orange-500/20 text-orange-400' :
                            r.positionNumber <= 10 ? 'bg-green-500/10 text-green-500'   :
                            'bg-zinc-800 text-zinc-500'
                          }`}>
                            {r.positionNumber}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-[11px] truncate">{r._circuitId ?? '—'}</p>
                            <p className="text-zinc-700 text-[9px]">{r.year} R{r.round}</p>
                          </div>
                          <p className="font-black text-[11px] text-yellow-400 shrink-0">
                            {ptsFor(r.positionNumber)}p
                          </p>
                        </div>
                      )) ?? <p className="text-zinc-700 text-xs">Nessun dato</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* NOTA METODOLOGIA */}
              <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-4">
                <p className="text-[9px] text-zinc-700 leading-relaxed uppercase tracking-wider font-bold">
                  ⚙️ Algoritmo: media ponderata per anno (recente = peso maggiore) degli ultimi 7 anni.
                  Blend storico circuito (60%) + forma recente ultimi 5 risultati (40%).
                  Intervallo confidenza ±0.7σ. Proiezione campionato: punti attuali +
                  media pts/gara × gare rimanenti.
                  Il predictor si aggiorna automaticamente aggiungendo risultati ai file JSON in <code className="text-zinc-500">public/data/</code>.
                  Dati: F1DB (f1db.com) · 1950–2026.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}