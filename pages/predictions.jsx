/**
 * PredictorSection.jsx — Race Predictor 2026
 * Dati da JSON locali F1DB. Auto-aggiornante.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import {
  TrendingUp, Trophy, Target, Loader2,
  ChevronLeft, ChevronRight, BarChart3,
  Flag, Zap, AlertCircle, MapPin, Activity,
  ChevronDown, Users
} from 'lucide-react';

// ─── PUNTI F1 ─────────────────────────────────────────────────────────────────
const PTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const ptsFor = (p) => (p >= 1 && p <= 10) ? PTS[p - 1] : 0;

// ─── ALIAS circuitId 2026 → id reale nei JSON storici F1DB ─────────────────
const CIRCUIT_ALIAS = {
  'albert-park':      'albert-park',
  'shanghai':         'shanghai',
  'suzuka':           'suzuka',
  'bahrain':          'bahrain',
  'jeddah':           'jeddah',
  'miami':            'miami',
  'imola':            'imola',
  'monte-carlo':      'monte-carlo',
  'barcelona':        'barcelona',
  'villeneuve':       'villeneuve',
  'red-bull-ring':    'red-bull-ring',
  'silverstone':      'silverstone',
  'hungaroring':      'hungaroring',
  'spa-francorchamps':'spa-francorchamps',
  'zandvoort':        'zandvoort',
  'monza':            'monza',
  'baku':             'baku',
  'marina-bay':       'marina-bay',
  'austin':           'austin',
  'rodriguez':        'rodriguez',
  'interlagos':       'interlagos',
  'las-vegas':        'las-vegas',
  'lusail':           'lusail',
  'yas-marina':       'yas-marina',
};

// ─── CODICI PAESE per flagcdn.com (mappa completa, include varianti storiche) ──
const CIRCUIT_COUNTRY = {
  // 2026 calendar
  'albert-park':'au','shanghai':'cn','suzuka':'jp','bahrain':'bh','jeddah':'sa',
  'miami':'us','imola':'it','monte-carlo':'mc','barcelona':'es','villeneuve':'ca',
  'red-bull-ring':'at','silverstone':'gb','hungaroring':'hu','spa-francorchamps':'be',
  'zandvoort':'nl','monza':'it','baku':'az','marina-bay':'sg','austin':'us',
  'rodriguez':'mx','interlagos':'br','las-vegas':'us','lusail':'qa','yas-marina':'ae',
  // varianti storiche F1DB
  'autodromo-nazionale-di-monza':'it','milan':'it','enzo-e-dino-ferrari':'it','mugello':'it',
  'bologna':'it','pescara':'it','silverstone-circuit':'gb','northamptonshire':'gb',
  'brands-hatch':'gb','kent':'gb','donington':'gb','aintree':'gb','liverpool':'gb',
  'spa':'be','stavelot':'be','zolder':'be','heusden-zolder':'be','nivelles':'be','brussels':'be',
  'circuit-zandvoort':'nl','catalunya':'es','montmelo':'es','jerez':'es','valencia':'es',
  'valencia-street-circuit':'es','pedralbes':'es','montjuic':'es','madrid':'es','jarama':'es',
  'madring':'es','budapest':'hu','mogyorod':'hu','spielberg':'at','zeltweg':'at',
  'oesterreichring':'at','styria':'at','magny-cours':'fr','nevers':'fr','paul-ricard':'fr',
  'le-castellet':'fr','ricard':'fr','reims':'fr','dijon':'fr','dijon-prenois':'fr',
  'rouen':'fr','essarts':'fr','charade':'fr','clermont-ferrand':'fr','lemans':'fr',
  'nurburgring':'de','nurburg':'de','hockenheimring':'de','hockenheim':'de','avus':'de','berlin':'de',
  'estoril':'pt','cascais':'pt','portimao':'pt','algarve':'pt','boavista':'pt',
  'oporto':'pt','monsanto':'pt','lisbon':'pt','bremgarten':'ch','bern':'ch',
  'anderstorp':'se','scandinavian-raceway':'se','monaco':'mc','circuit-de-monaco':'mc',
  'bakú':'az','azerbaijan':'az','americas':'us','cota':'us','circuit-of-the-americas':'us',
  'miami-international-autodrome':'us','vegas':'us','las-vegas-strip':'us','caesars-palace':'us',
  'indianapolis':'us','indianapolis-motor-speedway':'us','watkins-glen':'us',
  'long-beach':'us','phoenix':'us','detroit':'us','dallas':'us','sebring':'us','riverside':'us',
  'montreal':'ca','circuit-gilles-villeneuve':'ca','mosport':'ca','bowmanville':'ca',
  'tremblant':'ca','st-jovite':'ca','sao-paulo':'br','são-paulo':'br','jose-carlos-pace':'br',
  'jacarepagua':'br','rio-de-janeiro':'br','hermanos-rodriguez':'mx','mexico-city':'mx',
  'galvez':'ar','buenos-aires':'ar','oscar-galvez':'ar','juan-y-oscar-galvez':'ar',
  'suzuka-circuit':'jp','mie':'jp','fuji':'jp','fuji-speedway':'jp','oyama':'jp',
  'okayama':'jp','ti-circuit':'jp','shanghai-international-circuit':'cn',
  'singapore':'sg','sepang':'my','kuala-lumpur':'my','yeongam':'kr',
  'korea-international-circuit':'kr','buddh':'in','greater-noida':'in',
  'sakhir':'bh','manama':'bh','bahrain-international-circuit':'bh',
  'losail':'qa','lusail-international-circuit':'qa','jeddah-corniche-circuit':'sa',
  'abu-dhabi':'ae','yas-marina-circuit':'ae','istanbul':'tr','istanbul-park':'tr',
  'sochi':'ru','sochi-autodrom':'ru','kyalami':'za','midrand':'za','george':'za',
  'adelaide':'au','melbourne':'au','ain-diab':'ma','casablanca':'ma',
  // varianti underscore
  'albert_park':'au','marina_bay':'sg','yas_marina':'ae','paul_ricard':'fr',
  'watkins_glen':'us','long_beach':'us','las_vegas':'us','jose_carlos_pace':'br',
  'hermanos_rodriguez':'mx','mexico_city':'mx','red_bull_ring':'at',
  'silverstone_circuit':'gb','spa_francorchamps':'be','circuit_de_monaco':'mc','fuji_speedway':'jp',
};

// ─── CALENDARIO 2026 ──────────────────────────────────────────────────────────
const CALENDAR_2026 = [
  { round: 1,  circuitId: 'albert-park',      name: 'Australian GP',      date: '2026-03-06' },
  { round: 2,  circuitId: 'shanghai',          name: 'Chinese GP',         date: '2026-03-22' },
  { round: 3,  circuitId: 'suzuka',            name: 'Japanese GP',        date: '2026-04-05' },
  { round: 4,  circuitId: 'bahrain',           name: 'Bahrain GP',         date: '2026-04-19' },
  { round: 5,  circuitId: 'jeddah',            name: 'Saudi Arabia GP',    date: '2026-04-26' },
  { round: 6,  circuitId: 'miami',             name: 'Miami GP',           date: '2026-05-10' },
  { round: 7,  circuitId: 'imola',             name: 'Emilia Romagna GP',  date: '2026-05-24' },
  { round: 8,  circuitId: 'monte-carlo',       name: 'Monaco GP',          date: '2026-05-31' },
  { round: 9,  circuitId: 'barcelona',         name: 'Spanish GP',         date: '2026-06-14' },
  { round: 10, circuitId: 'villeneuve',        name: 'Canadian GP',        date: '2026-06-21' },
  { round: 11, circuitId: 'red-bull-ring',     name: 'Austrian GP',        date: '2026-07-05' },
  { round: 12, circuitId: 'silverstone',       name: 'British GP',         date: '2026-07-19' },
  { round: 13, circuitId: 'hungaroring',       name: 'Hungarian GP',       date: '2026-08-02' },
  { round: 14, circuitId: 'spa-francorchamps', name: 'Belgian GP',         date: '2026-08-30' },
  { round: 15, circuitId: 'zandvoort',         name: 'Dutch GP',           date: '2026-09-06' },
  { round: 16, circuitId: 'monza',             name: 'Italian GP',         date: '2026-09-13' },
  { round: 17, circuitId: 'baku',              name: 'Azerbaijan GP',      date: '2026-09-27' },
  { round: 18, circuitId: 'marina-bay',        name: 'Singapore GP',       date: '2026-10-04' },
  { round: 19, circuitId: 'austin',            name: 'US GP',              date: '2026-10-18' },
  { round: 20, circuitId: 'rodriguez',         name: 'Mexico City GP',     date: '2026-10-25' },
  { round: 21, circuitId: 'interlagos',        name: 'Brazilian GP',       date: '2026-11-08' },
  { round: 22, circuitId: 'las-vegas',         name: 'Las Vegas GP',       date: '2026-11-21' },
  { round: 23, circuitId: 'lusail',            name: 'Qatar GP',           date: '2026-11-29' },
  { round: 24, circuitId: 'yas-marina',        name: 'Abu Dhabi GP',       date: '2026-12-06' },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
async function loadJSON(path) {
  try {
    const res = await fetch(path);
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

function yearWeight(year, currentYear) {
  const d = currentYear - year;
  if (d === 0) return 3.0;
  if (d === 1) return 2.0;
  if (d === 2) return 1.5;
  if (d <= 5)  return 1.0;
  return 0.5;
}

// ─── ENGINE STATISTICO ────────────────────────────────────────────────────────
function buildDriverStats(results, driverId, circuitId = null) {
  const currentYear = Math.max(...results.map(r => r.year));
  const MIN_YEAR    = currentYear - 7;

  // Risolvi alias: cerca sia l'id diretto che varianti comuni
  const matchCircuit = (r) => {
    if (!circuitId) return true;
    const rid = r._circuitId;
    if (!rid) return false;
    const canonical = CIRCUIT_ALIAS[circuitId] ?? circuitId;
    // Match esatto, o match con trattini→underscore e viceversa
    return rid === canonical ||
           rid === circuitId ||
           rid.replace(/-/g, '_') === circuitId.replace(/-/g, '_') ||
           rid.replace(/_/g, '-') === circuitId.replace(/_/g, '-');
  };

  const filtered = results.filter(r =>
    r.driverId === driverId &&
    r.year >= MIN_YEAR &&
    r.positionNumber != null &&
    matchCircuit(r)
  );

  if (!filtered.length) return null;

  let wPosSum = 0, wSum = 0, wPtsSum = 0;
  let wins = 0, podiums = 0, top5 = 0;

  filtered.forEach(r => {
    const w = yearWeight(r.year, currentYear);
    wPosSum  += r.positionNumber * w;
    wSum     += w;
    wPtsSum  += ptsFor(r.positionNumber) * w;
    if (r.positionNumber === 1) wins++;
    if (r.positionNumber <= 3) podiums++;
    if (r.positionNumber <= 5) top5++;
  });

  const avgPos = wPosSum / wSum;
  const avgPts = wPtsSum / wSum;
  const n      = filtered.length;
  const variance = filtered.reduce((s, r) => s + Math.pow(r.positionNumber - avgPos, 2), 0) / n;

  const allRecent = results
    .filter(r => r.driverId === driverId && r.positionNumber != null)
    .sort((a, b) => b.year - a.year || b.round - a.round)
    .slice(0, 5);

  const recentAvgPos = allRecent.length
    ? allRecent.reduce((s, r) => s + r.positionNumber, 0) / allRecent.length
    : avgPos;

  return {
    n, avgPos, avgPts, stdDev: Math.sqrt(variance),
    wins, podiums, top5,
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
  const historicPos = circuitStats?.avgPos ?? globalStats.avgPos;
  const blended     = historicPos * 0.6 + globalStats.recentAvgPos * 0.4;
  const estPos      = Math.max(1, Math.min(20, Math.round(blended)));
  const sigma       = circuitStats?.stdDev ?? globalStats.stdDev;
  const posLow      = Math.max(1,  Math.round(estPos - sigma * 0.7));
  const posHigh     = Math.min(20, Math.round(estPos + sigma * 0.7));
  const ff          = globalStats.avgPos / Math.max(1, globalStats.recentAvgPos);
  const podiumChance = Math.min(95, Math.max(0, Math.round((circuitStats?.podiumRate ?? globalStats.podiumRate) * Math.min(ff, 1.5))));
  const winChance    = Math.min(70, Math.max(0, Math.round((circuitStats?.winRate    ?? globalStats.winRate)    * Math.min(ff, 1.5))));
  return { estPos, posLow, posHigh, podiumChance, winChance, estPts: ptsFor(estPos) };
}

function projectChampionship(results2026, driverId, racesLeft, globalStats) {
  const pts2026 = results2026
    .filter(r => r.driverId === driverId && r.positionNumber != null)
    .reduce((s, r) => s + ptsFor(r.positionNumber), 0);
  const avgPts    = globalStats?.avgPts ?? 8;
  const projected = Math.round(pts2026 + avgPts * racesLeft);
  const sigma     = Math.sqrt(racesLeft) * 4;
  return { current: pts2026, projected, low: Math.max(0, Math.round(projected - sigma)), high: Math.round(projected + sigma) };
}

// ─── SUB-COMPONENT: Bandiera ──────────────────────────────────────────────────
function RaceFlag({ circuitId, className = '' }) {
  const cc = CIRCUIT_COUNTRY[circuitId];
  if (!cc) return <div className={`bg-white-800 ${className}`} />;
  return (
    <img
      src={`https://flagcdn.com/w320/${cc}.png`}
      alt=""
      className={`object-cover ${className}`}
      onError={e => { e.target.style.display = 'none'; }}
    />
  );
}

// ─── COMPONENTE PRINCIPALE ────────────────────────────────────────────────────
export default function PredictorSection() {
  const [dbData, setDbData]             = useState(null);
  const [loadingDB, setLoadingDB]       = useState(true);
  const [loadError, setLoadError]       = useState(null);
  const [primaryDriver, setPrimaryDriver]       = useState(null);
  const [secondaryDriver, setSecondaryDriver]   = useState(null);
  const [showDriverPicker, setShowDriverPicker] = useState(false);
  const [pickerTarget, setPickerTarget]         = useState('primary');
  const [driverSearch, setDriverSearch]         = useState('');
  const [targetRace, setTargetRace]     = useState(CALENDAR_2026[0]);

  // Carica JSON una volta sola
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

        if (!rawResults || !rawRaces || !rawCircuits || !rawDrivers) {
          throw new Error('Uno o più file JSON non trovati in public/data/');
        }

        const racesMap    = Object.fromEntries(rawRaces.map(r => [r.id, r]));
        const circuitsMap = Object.fromEntries(rawCircuits.map(c => [c.id, c]));

        const results = rawResults.map(r => ({
          ...r,
          _circuitId: racesMap[r.raceId]?.circuitId ?? null,
        }));

        // Griglia F1 2026
        const DRIVERS_2026 = [
          'charles-leclerc', 'lewis-hamilton',
          'max-verstappen', 'isack-hadjar',
          'george-russell', 'kimi-antonelli',
          'lando-norris', 'oscar-piastri',
          'fernando-alonso', 'lance-stroll',
          'pierre-gasly', 'franco-colapinto',
          'carlos-sainz-jr', 'alexander-albon',
          'nico-hulkenberg', 'gabriel-bortoleto',
          'esteban-ocon', 'oliver-bearman',
          'liam-lawson', 'arvid-lindblad',
          'sergio-perez', 'valtteri-bottas',
        ];

        const driverMap = Object.fromEntries(rawDrivers.map(d => [d.id, d]));

        const activeDrivers = DRIVERS_2026
          .map(id => ({ id, number: driverMap[id]?.permanentNumber ?? null }))
          .sort((a, b) => a.id.localeCompare(b.id));

        // Gare 2026 già completate
        const results2026        = results.filter(r => r.year === 2026);
        const completedRounds    = new Set(results2026.map(r => r.round));
        const nextRace           = CALENDAR_2026.find(r => !completedRounds.has(r.round)) ?? CALENDAR_2026[0];

        setTargetRace(nextRace);
        setPrimaryDriver(activeDrivers.find(d => d.id === 'charles-leclerc') ?? activeDrivers[0]);
        setSecondaryDriver(activeDrivers.find(d => d.id === 'lewis-hamilton') ?? activeDrivers[1]);
        setDbData({ results, results2026, activeDrivers, circuitsMap, completedRounds });
      } catch (e) {
        setLoadError(e.message);
      } finally {
        setLoadingDB(false);
      }
    }
    load();
  }, []);

  // Calcola predizioni ogni volta che cambiano pilota o gara
  const predictions = useMemo(() => {
    if (!dbData || !primaryDriver || !secondaryDriver) return null;
    const { results, results2026, circuitsMap } = dbData;
    const circuitInfo = circuitsMap[targetRace.circuitId] ?? circuitsMap[CIRCUIT_ALIAS[targetRace.circuitId]];
    const cId = targetRace.circuitId;

    const calc = (dId) => {
      const global  = buildDriverStats(results, dId);
      const circuit = buildDriverStats(results, dId, cId);
      const pred    = computePrediction(global, circuit);
      const racesLeft = CALENDAR_2026.length - targetRace.round + 1;
      return { global, circuit, pred, champ: projectChampionship(results2026, dId, racesLeft, global) };
    };

    return {
      primary:   calc(primaryDriver.id),
      secondary: calc(secondaryDriver.id),
      circuitInfo,
      racesLeft: CALENDAR_2026.length - targetRace.round + 1,
      completedRounds: dbData.completedRounds,
    };
  }, [dbData, primaryDriver, secondaryDriver, targetRace]);

  const filteredDrivers = useMemo(() => {
    if (!dbData) return [];
    const q = driverSearch.toLowerCase();
    return dbData.activeDrivers.filter(d => d.id.toLowerCase().includes(q));
  }, [dbData, driverSearch]);

  const trendLabel = (t) => t === 'up' ? '↑ In forma' : t === 'down' ? '↓ In calo' : '→ Stabile';
  const trendColor = (t) => t === 'up' ? 'text-green-400' : t === 'down' ? 'text-red-400' : 'text-white-400';
  const DRIVER_COLOR = { primary: '#DC0000', secondary: '#FFD700' };

  return (
    <section className="py-20 px-4 bg-[#080808] text-white">
      <Navigation activeSection="predictions" />
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-white-500 font-black uppercase text-[10px] tracking-widest mb-8 hover:text-red-600 transition-colors group">
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Home
        </Link>

        {/* HEADER */}
        
        {loadError && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-3xl p-6 flex gap-4 mb-8">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-red-400">Errore nel caricamento dei dati</p>
              <p className="text-white-500 text-sm mt-1">{loadError}</p>
              <p className="text-white-600 text-xs mt-1">Verifica i JSON in <code className="text-white-400 bg-white-800 px-1 rounded">public/data/</code></p>
            </div>
          </div>
        )}

        {loadingDB && (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-white-800 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-red-600 rounded-full animate-spin" />
            </div>
            <p className="font-black text-sm uppercase tracking-widest">Caricamento database F1</p>
            <p className="text-white-600 text-xs">1950 → 2026</p>
          </div>
        )}

        {!loadingDB && !loadError && predictions && (
          <div className="grid lg:grid-cols-12 gap-8">

            {/* ══ SINISTRA ══ */}
            <div className="lg:col-span-4 space-y-5">

              {/* PILOTI */}
              <div className="bg-white-900/60 border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-white-500" />
                  <p className="text-[10px] font-black text-white-500 uppercase tracking-widest">Piloti a confronto</p>
                </div>
                {(['primary', 'secondary']).map((target) => {
                  const drv   = target === 'primary' ? primaryDriver : secondaryDriver;
                  const color = DRIVER_COLOR[target];
                  const label = target === 'primary' ? 'Pilota A' : 'Pilota B';
                  return (
                    <div key={target} className="mb-3">
                      <p className="text-[9px] text-white-700 uppercase font-bold mb-1">{label}</p>
                      <button
                        onClick={() => {
                          setPickerTarget(target);
                          setDriverSearch('');
                          setShowDriverPicker(p => pickerTarget === target ? !p : true);
                        }}
                        className="w-full p-3 rounded-2xl border border-white-800 hover:border-white-600 transition-all flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                          style={{ backgroundColor: color + '22', color, border: `2px solid ${color}44` }}>
                          {drv?.id?.split('-').pop().slice(0, 3).toUpperCase() ?? '?'}
                        </div>
                        <p className="flex-1 text-left font-black text-sm truncate">{drv?.id ?? '—'}</p>
                        <ChevronDown className="w-4 h-4 text-white-600 shrink-0" />
                      </button>
                    </div>
                  );
                })}

                {/* Picker */}
                <AnimatePresence>
                  {showDriverPicker && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="mt-2 rounded-2xl overflow-hidden shadow-2xl border border-zinc-200"
                      style={{ backgroundColor: '#ffffff' }}>
                      <div className="p-3 border-b border-zinc-200">
                        <input autoFocus value={driverSearch} onChange={e => setDriverSearch(e.target.value)}
                          placeholder="Cerca pilota (es. max-verstappen)..."
                          className="w-full rounded-xl px-3 py-2 text-sm outline-none font-bold border border-zinc-300 text-zinc-900 placeholder-zinc-400"
                          style={{ backgroundColor: '#f1f4b6' }} />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredDrivers.slice(0, 40).map(d => (
                          <button key={d.id}
                            onClick={() => {
                              if (pickerTarget === 'primary') setPrimaryDriver(d);
                              else setSecondaryDriver(d);
                              setShowDriverPicker(false);
                            }}
                            className="w-full px-4 py-2.5 transition-all flex items-center gap-3 text-left hover:bg-zinc-100">
                            <span className="text-[10px] font-black text-zinc-400 w-8 shrink-0">
                              {d.id.split('-').pop().slice(0, 3).toUpperCase()}
                            </span>
                            <span className="text-sm font-bold truncate text-zinc-800">{d.id}</span>
                          </button>
                        ))}
                        {filteredDrivers.length === 0 && (
                          <p className="text-center text-zinc-400 text-xs py-4">Nessun pilota trovato</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* INFO CIRCUITO TARGET */}
              {predictions.circuitInfo && (
                <motion.div key={targetRace.circuitId} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white-900/40 border border-white/5 rounded-3xl overflow-hidden">
                  {/* Bandiera */}
                  <div className="relative h-24 w-full overflow-hidden">
                    <RaceFlag circuitId={targetRace.circuitId} className="w-full h-full opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white-900 via-white-900/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-white-400" />
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">
                          {predictions.circuitInfo.fullName ?? predictions.circuitInfo.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-lg font-black">{predictions.circuitInfo.length?.toFixed(3) ?? '—'}</p>
                        <p className="text-[9px] text-white-600 uppercase font-bold">km</p>
                      </div>
                      <div>
                        <p className="text-lg font-black">{predictions.circuitInfo.turns ?? '—'}</p>
                        <p className="text-[9px] text-white-600 uppercase font-bold">curve</p>
                      </div>
                      <div>
                        <p className="text-lg">{predictions.circuitInfo.type === 'STREET' ? '🏙️' : '🏁'}</p>
                        <p className="text-[9px] text-white-600 uppercase font-bold">{predictions.circuitInfo.type === 'STREET' ? 'Street' : 'Race'}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ CALENDARIO 2026 COMPLETO ═══ */}
              <div className="bg-white-900/60 border border-white/5 rounded-3xl p-5">
                <p className="text-[10px] font-black text-white-500 uppercase tracking-widest mb-4">Calendario 2026</p>
                <div className="grid grid-cols-2 gap-2">
                  {CALENDAR_2026.map(r => {
                    const isDone = predictions.completedRounds.has(r.round);
                    const isNext = !isDone && CALENDAR_2026.find(c => !predictions.completedRounds.has(c.round))?.round === r.round;
                    const isSelected = targetRace.round === r.round;
                    const cc = CIRCUIT_COUNTRY[r.circuitId];
                    return (
                      <button key={r.round} onClick={() => setTargetRace(r)}
                        className={`relative overflow-hidden rounded-xl border transition-all text-left group ${
                          isSelected  ? 'border-red-500 shadow-lg shadow-red-500/10' :
                          isDone      ? 'border-green-500/30' :
                          'border-white-800 hover:border-white-600'
                        }`}
                      >
                        {/* Bandiera di sfondo */}
                        <div className="absolute inset-0">
                          {cc && (
                            <img src={`https://flagcdn.com/w160/${cc}.png`} alt=""
                              className={`w-full h-full object-cover transition-all duration-500 ${
                                isSelected ? 'opacity-30' : 'opacity-15 group-hover:opacity-25'
                              }`}
                            />
                          )}
                          <div className={`absolute inset-0 ${
                            isSelected ? 'bg-red-950/60' : isDone ? 'bg-green-950/40' : 'bg-white-900/70'
                          }`} />
                        </div>

                        {/* Contenuto */}
                        <div className="relative z-10 p-3">
                          {/* Indicatore "prossima gara" */}
                          {isNext && (
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          )}
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                              isSelected ? 'bg-red-500 text-white' :
                              isDone     ? 'bg-green-500/20 text-green-400' :
                              'bg-white-800/80 text-white-500'
                            }`}>R{r.round}</span>
                            {isDone && <span className="text-[9px] text-green-400 font-black">✓</span>}
                          </div>
                          <p className="font-black text-xs text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            {r.name.replace(' GP', '')}
                          </p>
                          <p className="text-[9px] text-white-300 mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            {new Date(r.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ══ DESTRA ══ */}
            <div className="lg:col-span-8 space-y-5">

              {/* GARA TARGET HEADER */}
              <motion.div key={targetRace.round} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl border border-red-500/20">
                {/* Bandiera grande */}
                <div className="absolute inset-0">
                  <RaceFlag circuitId={targetRace.circuitId} className="w-full h-full opacity-20" />
                  <div className="absolute inset-0 bg-gradient-to-r from-red-950/80 via-white-950/70 to-white-950/50" />
                </div>
                <div className="relative z-10 p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-2">
                      {predictions.completedRounds.has(targetRace.round) ? '✓ Completata' : '⬤ Prossima predizione'}
                    </p>
                    <h3 className="text-3xl font-black uppercase italic tracking-tight">{targetRace.name}</h3>
                    <p className="text-white-400 text-xs uppercase tracking-widest mt-1">
                      Round {targetRace.round} · {new Date(targetRace.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  {/* Bandiera nazione grande */}
                  {CIRCUIT_COUNTRY[targetRace.circuitId] && (
                    <img src={`https://flagcdn.com/w80/${CIRCUIT_COUNTRY[targetRace.circuitId]}.png`}
                      className="h-12 rounded-lg shadow-xl border border-white/10 shrink-0" alt="" />
                  )}
                </div>
              </motion.div>

              {/* CONFRONTO PILOTI */}
              <div className="grid grid-cols-2 gap-4">
                {(['primary', 'secondary']).map((key) => {
                  const drv   = key === 'primary' ? primaryDriver : secondaryDriver;
                  const color = DRIVER_COLOR[key];
                  const data  = predictions[key];
                  return (
                    <motion.div key={`${key}-${drv?.id}-${targetRace.round}`}
                      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                      className="bg-white-900/60 border border-white/5 rounded-3xl overflow-hidden">
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
                          <div className="text-center mb-5">
                            <p className="text-[9px] text-white-600 uppercase font-black tracking-widest mb-1">Pos. Stimata</p>
                            <motion.span key={data.pred.estPos} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                              className="text-6xl font-black leading-none" style={{ color }}>
                              {data.pred.estPos}°
                            </motion.span>
                            <p className="text-white-600 text-[10px] mt-1 font-mono">
                              range {data.pred.posLow}° – {data.pred.posHigh}°
                            </p>
                          </div>
                          <div className="space-y-3 mb-5">
                            {[
                              { label: '% Podio',   val: data.pred.podiumChance },
                              { label: '% Vittoria', val: data.pred.winChance },
                            ].map((b, i) => (
                              <div key={i}>
                                <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                  <span className="text-white-600">{b.label}</span>
                                  <span style={{ color }}>{b.val}%</span>
                                </div>
                                <div className="h-1.5 bg-white-800 rounded-full overflow-hidden">
                                  <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, b.val)}%` }}
                                    transition={{ delay: 0.2 + i * 0.1, duration: 0.7 }} />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-white-800/40 rounded-xl p-2 border border-white/5">
                              <p className="text-[8px] text-white-600 uppercase font-bold">Pts stimati</p>
                              <p className="font-black text-sm" style={{ color }}>{data.pred.estPts}</p>
                            </div>
                            <div className="bg-white-800/40 rounded-xl p-2 border border-white/5">
                              <p className="text-[8px] text-white-600 uppercase font-bold">Pts 2026</p>
                              <p className="font-black text-sm text-white">{data.champ?.current ?? 0}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-white-600 text-xs">Dati insufficienti</div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* STORICO SUL CIRCUITO — mostrato solo se ci sono dati */}
              {(predictions.primary.circuit || predictions.secondary.circuit) && (
              <div className="grid grid-cols-2 gap-4">
                {(['primary', 'secondary']).map((key) => {
                  const drv   = key === 'primary' ? primaryDriver : secondaryDriver;
                  const color = DRIVER_COLOR[key];
                  const data  = predictions[key];
                  if (!data.circuit) return (
                    <div key={key} className="bg-white-900/30 border border-white/5 rounded-3xl p-5 flex flex-col items-center justify-center text-center gap-2">
                      <Target className="w-6 h-6 text-white-800" />
                      <p className="text-white-700 text-[10px] uppercase font-bold">Nessuno storico su<br/>{targetRace.name.replace(' GP','')}</p>
                    </div>
                  );
                  return (
                    <div key={key} className="bg-white-900/60 border border-white/5 rounded-3xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-3.5 h-3.5" style={{ color }} />
                        <p className="text-[10px] font-black text-white-500 uppercase tracking-widest truncate">
                          {drv?.id?.split('-').pop()} su {targetRace.name.replace(' GP', '')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {[
                          { label: 'Gare disputate', val: data.circuit.n },
                          { label: 'Media posizione', val: data.circuit.avgPos.toFixed(1) + '°' },
                          { label: 'Vittorie',        val: data.circuit.wins },
                          { label: 'Podi',            val: data.circuit.podiums },
                        ].map((s, i) => (
                          <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                            <span className="text-[9px] text-white-600 uppercase font-bold">{s.label}</span>
                            <span className="font-black text-sm text-white">{s.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              )}

              {/* PROIEZIONE CAMPIONATO */}
              <div className="bg-white-900/60 border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <p className="text-[10px] font-black text-white-500 uppercase tracking-widest">
                    Proiezione Campionato 2026 · {predictions.racesLeft} gare rimanenti
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {(['primary', 'secondary']).map((key) => {
                    const drv   = key === 'primary' ? primaryDriver : secondaryDriver;
                    const color = DRIVER_COLOR[key];
                    const champ = predictions[key].champ;
                    if (!champ) return null;
                    return (
                      <div key={key} className="text-center">
                        <p className="text-[9px] text-white-600 uppercase font-black mb-2">{drv?.id?.split('-').pop()}</p>
                        <p className="text-5xl font-black mb-1" style={{ color }}>{champ.projected}</p>
                        <p className="text-[10px] font-mono text-white-600">
                          <span className="text-red-400">{champ.low}</span>{' – '}<span className="text-green-400">{champ.high}</span> pts
                        </p>
                        <div className="mt-3 h-1.5 bg-white-800 rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (champ.projected / 500) * 100)}%` }}
                            transition={{ delay: 0.5, duration: 0.8 }} />
                        </div>
                        <p className="text-[9px] text-white-700 mt-1">su 500 pts max stimati</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ULTIMI 5 RISULTATI */}
              <div className="grid grid-cols-2 gap-4">
                {(['primary', 'secondary']).map((key) => {
                  const drv   = key === 'primary' ? primaryDriver : secondaryDriver;
                  const color = DRIVER_COLOR[key];
                  const data  = predictions[key];
                  return (
                    <div key={key} className="bg-white-900/60 border border-white/5 rounded-3xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-3.5 h-3.5" style={{ color }} />
                        <p className="text-[10px] font-black text-white-500 uppercase tracking-widest">
                          Ultimi risultati · {drv?.id?.split('-').pop()}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        {data.global?.recent?.map((r, i) => (
                          <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-white/5 last:border-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                              r.positionNumber === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                              r.positionNumber <= 3  ? 'bg-orange-500/20 text-orange-400' :
                              r.positionNumber <= 10 ? 'bg-green-500/10 text-green-500' :
                              'bg-white-800 text-white-500'
                            }`}>{r.positionNumber}</div>
                            {/* Bandierina circuito */}
                            {CIRCUIT_COUNTRY[r._circuitId] ? (
                              <div className="w-7 h-5 rounded overflow-hidden shrink-0 border border-white/10">
                                <img src={`https://flagcdn.com/w40/${CIRCUIT_COUNTRY[r._circuitId]}.png`}
                                  className="w-full h-full object-cover" alt="" />
                              </div>
                            ) : null}
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-[11px] truncate">{r._circuitId ?? '—'}</p>
                              <p className="text-white-700 text-[9px]">{r.year} R{r.round}</p>
                            </div>
                            <p className="font-black text-[11px] text-yellow-400 shrink-0">{ptsFor(r.positionNumber)}p</p>
                          </div>
                        )) ?? <p className="text-white-700 text-xs">Nessun dato</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* NOTA */}
              <div className="bg-white-900/20 border border-white/5 rounded-2xl p-4">
                <p className="text-[9px] text-white-700 leading-relaxed uppercase tracking-wider font-bold">
                  ⚙️ Media ponderata ultimi 7 anni (anno corrente = 3×, -1 anno = 2×, -2 = 1.5×, oltre = 0.5×).
                  Blend storico circuito (60%) + forma recente ultimi 5 risultati (40%).
                  Intervallo confidenza ±0.7σ. Si aggiorna automaticamente aggiungendo risultati ai JSON in <code className="text-white-500">public/data/</code>. Dati: F1DB (f1db.com).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </section>
  );
}