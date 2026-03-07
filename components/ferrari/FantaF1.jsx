'use client';
/**
 * components/ferrari/FantaF1.jsx
 * Componente predizioni pre-gara — design upgrade
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  GripVertical, Trophy, Clock, CheckCircle2,
  AlertCircle, ChevronDown, ChevronUp, Zap,
  Shield, RotateCcw, Send, Star, Lock,
} from 'lucide-react';
import {
  DRIVERS_2026, FANTA_CALENDAR, POINTS,
  getCurrentRace, isRaceLocked,
  savePrediction, getUserPrediction, getRaceResult, calculateScore,
  getFantaLeaderboard,
} from '../../lib/fantaF1';

const CIRCUIT_COUNTRY = {
  'albert-park':'au', 'shanghai':'cn', 'suzuka':'jp', 'bahrain':'bh', 'jeddah':'sa',
  'miami':'us', 'villeneuve':'ca', 'monte-carlo':'mc', 'barcelona':'es',
  'red-bull-ring':'at', 'silverstone':'gb', 'spa-francorchamps':'be',
  'hungaroring':'hu', 'zandvoort':'nl', 'monza':'it', 'ifema-madrid':'es',
  'baku':'az', 'marina-bay':'sg', 'austin':'us', 'rodriguez':'mx',
  'interlagos':'br', 'las-vegas':'us', 'lusail':'qa', 'yas-marina':'ae',
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function driverById(id) {
  return DRIVERS_2026.find(d => d.id === id) || {
    id,
    name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    team: '?',
    color: '#666',
  };
}

// Posizione → colore accent
function posColor(i) {
  if (i === 0) return '#FFD700';
  if (i === 1) return '#C0C0C0';
  if (i === 2) return '#CD7F32';
  if (i < 10) return '#3B82F6';
  return '#52525b';
}

function posLabel(i) {
  if (i === 0) return '1°';
  if (i === 1) return '2°';
  if (i === 2) return '3°';
  return `${i + 1}°`;
}

// ─── DRIVER ROW (drag & drop) ─────────────────────────────────────────────────
function DriverRow({ driverId, index }) {
  const d = driverById(driverId);
  const accent = posColor(index);

  // Zone styling basata sulla posizione corrente
  const isPodium = index < 3;
  const isTop10  = index >= 3 && index < 10;

  return (
    <div
      className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all duration-150 cursor-grab active:cursor-grabbing select-none"
      style={{
        background: isPodium
          ? `linear-gradient(90deg, ${d.color}12 0%, rgba(20,20,24,0.8) 70%)`
          : isTop10
          ? 'rgba(28,28,34,0.8)'
          : 'rgba(20,20,24,0.5)',
        borderColor: isPodium
          ? `${accent}35`
          : isTop10
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(255,255,255,0.03)',
      }}
    >
      {/* Grip */}
      <GripVertical className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0" />

      {/* Numero posizione */}
      <span
        className="text-sm font-black w-7 text-center shrink-0 tabular-nums"
        style={{ color: accent }}
      >
        {posLabel(index)}
      </span>

      {/* Color dot team */}
      <div
        className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white/10"
        style={{ backgroundColor: d.color }}
      />

      {/* Nome */}
      <span className="font-black text-base flex-1 text-white tracking-tight">{d.name}</span>

      {/* Team badge */}
      <span
        className="text-[11px] font-bold px-2.5 py-1 rounded-xl hidden sm:inline"
        style={{
          color: d.color,
          background: `${d.color}18`,
          border: `1px solid ${d.color}30`,
        }}
      >
        {d.team}
      </span>
    </div>
  );
}

// ─── DRIVER CHIP ──────────────────────────────────────────────────────────────
function DriverChip({ driverId, pos, onRemove, small = false }) {
  const d = driverById(driverId);
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border transition-all
        ${small ? 'px-2 py-1.5' : 'px-3 py-2'}`}
      style={{
        background: `${d.color}08`,
        borderColor: `${d.color}25`,
      }}
    >
      {pos !== undefined && (
        <span className="text-[10px] font-black text-zinc-500 w-5 text-center">{pos}°</span>
      )}
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
      <span className={`font-black text-white ${small ? 'text-[10px]' : 'text-xs'}`}>{d.name}</span>
      <span className={`${small ? 'text-[9px]' : 'text-[10px]'}`} style={{ color: `${d.color}99` }}>{d.team}</span>
      {onRemove && (
        <button onClick={onRemove} className="ml-auto text-zinc-600 hover:text-red-400 transition-colors text-xs leading-none">✕</button>
      )}
    </div>
  );
}

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
function SectionLabel({ children, color = 'text-zinc-500' }) {
  return (
    <p className={`text-xs font-black uppercase tracking-[0.12em] mb-2 ${color}`}>
      {children}
    </p>
  );
}

// ─── COMPONENTE PRINCIPALE ────────────────────────────────────────────────────
export default function FantaF1() {
  const { data: session, status } = useSession();
  const [race, setRace] = useState(null);
  const [locked, setLocked] = useState(false);
  const [step, setStep] = useState('grid');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fullGrid, setFullGrid] = useState([]);
  const [lastFive, setLastFive] = useState([]);
  const [fastestLap, setFastestLap] = useState('');
  const [safetyCar, setSafetyCar] = useState(null);

  const [existingPred, setExistingPred] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);

  useEffect(() => {
    setFullGrid(DRIVERS_2026.map(d => d.id));
    setLastFive(DRIVERS_2026.slice(-5).map(d => d.id));
  }, []);

  useEffect(() => {
    const r = getCurrentRace();
    setRace(r);
    if (r) setLocked(isRaceLocked(r));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!race) return;
    const id = setInterval(() => setLocked(isRaceLocked(race)), 60000);
    return () => clearInterval(id);
  }, [race]);

  useEffect(() => {
    if (!race || !session?.user?.email || loading) return;
    const load = async () => {
      try {
        const [pred, res] = await Promise.all([
          getUserPrediction(session, race.raceId),
          getRaceResult(race.raceId),
        ]);
        if (pred) {
          setExistingPred(pred);
          if (pred.fullGrid) setFullGrid(pred.fullGrid.map(p => p.driverId));
          if (pred.lastFive) setLastFive(pred.lastFive.map(p => p.driverId));
          setFastestLap(pred.bonuses?.fastestLap || '');
          setSafetyCar(pred.bonuses?.safetyCar ?? null);
          setSaved(true);
        }
        if (res) {
          setResult(res);
          if (pred) setScore(calculateScore(pred, res));
        }
      } catch (e) {
        console.error('Errore caricamento dati:', e);
      }
    };
    load();
  }, [race, session, loading]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLbLoading(true);
      try {
        const data = await getFantaLeaderboard(10);
        setLeaderboard(data);
      } catch (e) {
        console.error('Errore leaderboard:', e);
      } finally {
        setLbLoading(false);
      }
    };
    loadLeaderboard();
  }, []);

  const handleSave = async () => {
    console.log('Salvataggio con:', {
      email: session?.user?.email,
      raceId: race?.raceId,
      docId: `${session?.user?.email}_${race?.raceId}`,
    });
    if (!race) { setError('Gara non disponibile'); return; }
    setSaving(true);
    setError(null);
    try {
      await savePrediction(session, race.raceId, {
        fullGrid: fullGrid.map((id, i) => ({ pos: i + 1, driverId: id })),
        lastFive: lastFive.map((id, i) => ({ pos: 16 + i, driverId: id })),
        bonuses: { fastestLap, safetyCar },
      });
      setSaved(true);
      setStep('confirm');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    setFullGrid(DRIVERS_2026.map(d => d.id));
    setLastFive(DRIVERS_2026.slice(-5).map(d => d.id));
    setFastestLap('');
    setSafetyCar(null);
    setSaved(false);
    setStep('grid');
  };

  if (loading || !race) {
    return (
      <section className="mb-24 flex items-center justify-center py-16">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-red-600/20" />
          <div className="absolute inset-0 rounded-full border-t-2 border-red-600 animate-spin" />
        </div>
      </section>
    );
  }

  const cc = CIRCUIT_COUNTRY[race.circuitId];
  const lockDate = new Date(race.lockDate + 'T15:00:00');

  // Step tabs config
  const STEPS = [
    { id: 'grid',     label: 'Griglia',  icon: Trophy },
    { id: 'lastfive', label: 'Ultimi 5', icon: ChevronDown },
    { id: 'bonus',    label: 'Bonus',    icon: Zap },
    { id: 'confirm',  label: 'Conferma', icon: CheckCircle2 },
  ];
  const stepIndex = STEPS.findIndex(s => s.id === step);

  return (
    <section className="mb-24">

      {/* ── HEADER ── */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
          <Trophy className="w-5 h-5 text-yellow-500" />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase italic tracking-tight leading-none">FantaF1</h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Predici la gara · Stagione 2026</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-2" />
        {locked && (
          <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
            <Lock className="w-3 h-3" /> Chiuse
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══════════════════════════════════════════
            COLONNA SINISTRA
        ══════════════════════════════════════════ */}
        <div className="space-y-5">

          {/* Card Gara */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            {/* Flag bg */}
            {cc && (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center scale-110"
                  style={{
                    backgroundImage: `url(https://flagcdn.com/w320/${cc}.png)`,
                    filter: 'blur(2px)',
                    opacity: 0.07,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 via-zinc-900/80 to-zinc-950/95" />
              </>
            )}
            {/* Red accent line top */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-transparent" />

            <div className="relative z-10 p-6">
              {/* Round badge */}
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500">Round {race.round}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">2026</span>
              </div>

              {/* Flag emoji + name */}
              <div className="flex items-start gap-3 mb-5">
                {cc && (
                  <img
                    src={`https://flagcdn.com/w40/${cc}.png`}
                    alt=""
                    className="w-8 h-auto rounded mt-0.5 shadow-lg"
                  />
                )}
                <h4 className="text-2xl font-black uppercase italic leading-tight tracking-tight">{race.name}</h4>
              </div>

              {/* Countdown / lock */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold
                ${locked
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-zinc-800/60 border border-white/5 text-zinc-400'}`}>
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {locked
                    ? 'Predizioni chiuse'
                    : `Chiude ${lockDate.toLocaleDateString('it-IT', {
                        weekday: 'short', day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}`}
                </span>
              </div>
            </div>
          </div>

          {/* Sistema Punti */}
          <div className="rounded-3xl border border-white/5 bg-zinc-900/30 overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <SectionLabel>Sistema Punti</SectionLabel>
            </div>
            <div className="px-5 pb-5 space-y-0">
              {[
                { label: 'Posizione esatta',      pts: POINTS.exactPosition,    color: '#4ade80' },
                { label: 'Nel podio (pos wrong)', pts: POINTS.podiumWrong,      color: '#facc15' },
                { label: 'Top 10 (pos wrong)',    pts: POINTS.top10Wrong,       color: '#60a5fa' },
                { label: 'Ultimi 5 esatti',       pts: POINTS.lastFiveExact,    color: '#c084fc' },
                { label: 'Ultimi 5 (pos wrong)',  pts: POINTS.lastFiveWrong,    color: '#a855f7' },
                { label: 'Giro veloce',           pts: POINTS.fastestLapExact,  color: '#fb923c' },
                { label: 'Safety car',            pts: POINTS.safetyCarCorrect, color: '#22d3ee' },
              ].map((r, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/[0.04] last:border-0">
                  <span className="text-xs text-zinc-400">{r.label}</span>
                  <span
                    className="text-xs font-black px-2.5 py-0.5 rounded-lg"
                    style={{ color: r.color, background: `${r.color}15` }}
                  >
                    +{r.pts} pt
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="rounded-3xl border border-white/5 bg-zinc-900/30 overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <SectionLabel>🏆 Classifica Stagione</SectionLabel>
            </div>
            <div className="px-5 pb-5">
              {lbLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 rounded-full border-t-2 border-red-600 animate-spin" />
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-zinc-700 text-xs text-center py-6">Nessuna predizione ancora</p>
              ) : (
                <div className="space-y-1">
                  {leaderboard.map((p, i) => {
                    const isMe = session?.user?.email === p.userId;
                    const medals = ['🏆', '🥈', '🥉'];
                    return (
                      <div
                        key={p.userId || i}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all
                          ${isMe ? 'bg-yellow-500/10 border border-yellow-500/20' : 'hover:bg-white/[0.02]'}`}
                      >
                        <span className="text-[11px] font-black w-5 text-center shrink-0 text-zinc-500">
                          {i < 3 ? medals[i] : `#${i + 1}`}
                        </span>
                        {p.avatar
                          ? <img src={p.avatar} alt="" className="w-7 h-7 rounded-full ring-1 ring-white/10 shrink-0" />
                          : (
                            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-black text-zinc-500 shrink-0">
                              {p.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )
                        }
                        <span className={`flex-1 text-sm font-bold truncate ${isMe ? 'text-yellow-400' : 'text-white'}`}>
                          {p.name || 'Anonimo'}
                          {isMe && <span className="ml-1.5 text-[9px] text-yellow-600 font-black uppercase">tu</span>}
                        </span>
                        <span className={`text-sm font-black tabular-nums ${isMe ? 'text-yellow-400' : 'text-zinc-300'}`}>
                          {p.totalPoints || 0}
                          <span className="text-[10px] text-zinc-600 font-bold ml-0.5">pt</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            COLONNA DESTRA
        ══════════════════════════════════════════ */}
        <div className="lg:col-span-2">

          {/* Risultato post-gara */}
          {result && score && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-3xl border border-yellow-500/25 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.05) 0%, rgba(0,0,0,0) 60%)' }}
            >
              <div className="p-6">
                <SectionLabel color="text-yellow-600">✓ Risultato — {race.name}</SectionLabel>
                <div className="flex items-center gap-8 mt-3">
                  <div>
                    <p className="text-6xl font-black text-yellow-400 tabular-nums leading-none">{score.total}</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">punti totali</p>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1">
                    {Object.entries(score.breakdown || {}).map(([key, val]) => val > 0 && (
                      <div key={key} className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-[10px] text-zinc-500 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                        <span className="text-[11px] font-black text-green-400">+{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Login required */}
          {!session && (
            <div className="rounded-3xl border border-white/8 bg-zinc-900/30 p-8 text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-5 h-5 text-zinc-600" />
              </div>
              <p className="font-black text-sm mb-1">Login richiesto</p>
              <p className="text-zinc-600 text-xs">Accedi per salvare le tue predizioni e scalare la classifica.</p>
            </div>
          )}

          {/* ─── FORM PREDIZIONE ─── */}
          {(!locked || saved) && session ? (
            <>
              {/* Step progress bar */}
              <div className="mb-6">
                {/* Tab buttons */}
                <div className="flex gap-1.5 mb-3">
                  {STEPS.map(({ id, label, icon: Icon }, idx) => {
                    const isActive = step === id;
                    const isDone = idx < stepIndex;
                    return (
                      <button
                        key={id}
                        onClick={() => setStep(id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                          ${isActive
                            ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20'
                            : isDone
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : 'bg-transparent text-zinc-600 border-white/8 hover:border-white/20 hover:text-zinc-400'}`}
                      >
                        {isDone ? <CheckCircle2 className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    );
                  })}
                </div>
                {/* Progress bar */}
                <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                    animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">

                {/* ── STEP: Griglia completa ── */}
                {step === 'grid' && (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="rounded-3xl border border-white/5 bg-zinc-900/20 overflow-hidden">
                      {/* Header sticky */}
                      <div className="px-5 pt-5 pb-4 sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-white/5">
                        <p className="text-sm font-black text-white uppercase tracking-wide mb-2">
                          Trascina i piloti · Posizione 1 → 20
                        </p>
                        <div className="flex gap-4">
                          {[
                            { color: '#FFD700', label: 'Podio +10pt' },
                            { color: '#3B82F6', label: 'Top 10 +2pt' },
                            { color: '#52525b', label: 'Fondo griglia' },
                          ].map(z => (
                            <div key={z.label} className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color }} />
                              <span className="text-[10px] text-zinc-500 font-bold">{z.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Unico Reorder.Group — tutti i 20 piloti insieme */}
                      <div className="p-3 max-h-[620px] overflow-y-auto">
                        <Reorder.Group axis="y" values={fullGrid} onReorder={setFullGrid} className="space-y-1.5">
                          {fullGrid.map((driverId, i) => {
                            // Separatori di zona (non draggabili, solo visivi)
                            const zoneLabel =
                              i === 0  ? { text: '🏆 Podio',         color: 'text-yellow-600/70' } :
                              i === 3  ? { text: '🔵 Top 10',         color: 'text-blue-500/70'   } :
                              i === 10 ? { text: 'Posizioni 11–20',   color: 'text-zinc-600'       } :
                              null;

                            return (
                              <React.Fragment key={driverId}>
                                {zoneLabel && (
                                  <p className={`text-[10px] font-black uppercase tracking-widest px-2 pt-3 pb-1 ${zoneLabel.color}`}>
                                    {zoneLabel.text}
                                  </p>
                                )}
                                <Reorder.Item value={driverId} className="list-none">
                                  <DriverRow driverId={driverId} index={i} />
                                </Reorder.Item>
                              </React.Fragment>
                            );
                          })}
                        </Reorder.Group>
                      </div>

                      <div className="px-5 py-4 border-t border-white/5 flex justify-between items-center bg-zinc-950/50">
                        <button
                          onClick={() => setFullGrid(DRIVERS_2026.map(d => d.id))}
                          className="flex items-center gap-1.5 text-zinc-600 hover:text-white transition-colors text-xs font-black uppercase"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reset
                        </button>
                        <button
                          onClick={() => setStep('lastfive')}
                          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 hover:scale-[1.02]"
                        >
                          Ultimi 5 →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP: Ultimi 5 ── */}
                {step === 'lastfive' && (
                  <motion.div
                    key="lastfive"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="rounded-3xl border border-purple-500/15 bg-zinc-900/20 overflow-hidden">
                      <div className="px-5 pt-5 pb-4 border-b border-white/5">
                        <SectionLabel color="text-purple-500">Chi finirà in fondo? · Posizioni 16–20</SectionLabel>
                        <p className="text-xs text-zinc-500">
                          Indovinare chi si ritira è la vera sfida — e vale punti extra.
                        </p>
                      </div>

                      <div className="p-4">
                        {/* Ultimi 5 selezionati */}
                        <Reorder.Group axis="y" values={lastFive} onReorder={setLastFive} className="space-y-1.5 mb-5">
                          {lastFive.map((driverId, i) => {
                            const d = driverById(driverId);
                            return (
                              <Reorder.Item key={driverId} value={driverId}>
                                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-purple-500/15 bg-purple-500/5 cursor-grab active:cursor-grabbing">
                                  <GripVertical className="w-4 h-4 text-zinc-700 shrink-0" />
                                  <span className="text-sm font-black w-7 text-center shrink-0 text-purple-400">{16 + i}°</span>
                                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                                  <span className="font-black text-base flex-1">{d.name}</span>
                                  <span className="text-xs font-semibold hidden sm:inline" style={{ color: `${d.color}99` }}>{d.team}</span>
                                  <button
                                    onClick={() => setLastFive(lastFive.filter((_, idx) => idx !== i))}
                                    className="text-zinc-700 hover:text-red-400 transition-colors text-sm ml-1 leading-none"
                                  >✕</button>
                                </div>
                              </Reorder.Item>
                            );
                          })}
                        </Reorder.Group>

                        {/* Piloti disponibili */}
                        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-3">
                          <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-2.5">
                            Clicca per aggiungere · {lastFive.length}/5
                          </p>
                          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                            {DRIVERS_2026.filter(d => !lastFive.includes(d.id)).map(d => (
                              <button
                                key={d.id}
                                onClick={() => { if (lastFive.length < 5) setLastFive(prev => [...prev, d.id]); }}
                                disabled={lastFive.length >= 5}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-bold
                                  ${lastFive.length >= 5
                                    ? 'border-white/5 bg-zinc-900/50 text-zinc-700 cursor-not-allowed'
                                    : 'border-white/10 bg-zinc-900 hover:border-purple-500/40 hover:bg-purple-500/5 text-zinc-400 hover:text-white'}`}
                              >
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                {d.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-4 border-t border-white/5 flex justify-between items-center bg-zinc-950/50">
                        <button onClick={() => setStep('grid')} className="text-zinc-600 hover:text-white transition-colors text-xs font-black uppercase">
                          ← Griglia
                        </button>
                        <button
                          onClick={() => setStep('bonus')}
                          disabled={lastFive.length !== 5}
                          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                            ${lastFive.length === 5
                              ? 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20 hover:scale-[1.02]'
                              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                        >
                          Bonus →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP: Bonus ── */}
                {step === 'bonus' && (
                  <motion.div
                    key="bonus"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="rounded-3xl border border-white/5 bg-zinc-900/20 overflow-hidden">
                      <div className="px-5 pt-5 pb-4 border-b border-white/5">
                        <SectionLabel>Bonus — punti extra</SectionLabel>
                      </div>

                      <div className="p-5 space-y-8">

                        {/* Giro veloce */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-orange-500/10 border border-orange-500/20">
                              <Zap className="w-3.5 h-3.5 text-orange-400" />
                            </div>
                            <p className="text-sm font-black text-white">Chi fa il giro veloce?</p>
                            <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20">
                              +{POINTS.fastestLapExact} pt
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                            {DRIVERS_2026.map(d => (
                              <button
                                key={d.id}
                                onClick={() => setFastestLap(d.id)}
                                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all text-xs font-bold
                                  ${fastestLap === d.id
                                    ? 'border-orange-500/50 bg-orange-500/10 text-white'
                                    : 'border-white/5 bg-zinc-900/60 text-zinc-400 hover:border-white/15 hover:text-zinc-200'}`}
                              >
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                                <span>{d.name}</span>
                                {fastestLap === d.id && <Zap className="w-3 h-3 text-orange-400 ml-auto" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Safety car */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                              <Shield className="w-3.5 h-3.5 text-cyan-400" />
                            </div>
                            <p className="text-sm font-black text-white">Ci sarà la Safety Car?</p>
                            <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                              +{POINTS.safetyCarCorrect} pt
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {[{ val: true, label: '🟡 Sì, ci sarà' }, { val: false, label: '🟢 No, gara pulita' }].map(({ val, label }) => (
                              <button
                                key={String(val)}
                                onClick={() => setSafetyCar(val)}
                                className={`py-3.5 rounded-2xl border font-black text-sm transition-all
                                  ${safetyCar === val
                                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/10'
                                    : 'border-white/5 bg-zinc-900/60 text-zinc-500 hover:border-white/15'}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-4 border-t border-white/5 flex justify-between items-center bg-zinc-950/50">
                        <button onClick={() => setStep('lastfive')} className="text-zinc-600 hover:text-white transition-colors text-xs font-black uppercase">
                          ← Ultimi 5
                        </button>
                        <button
                          onClick={() => setStep('confirm')}
                          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 hover:scale-[1.02]"
                        >
                          Conferma →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP: Conferma ── */}
                {step === 'confirm' && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="rounded-3xl border border-white/8 bg-zinc-900/20 overflow-hidden">
                      <div className="px-5 pt-5 pb-4 border-b border-white/5">
                        <SectionLabel>Riepilogo predizione — {race.name}</SectionLabel>
                      </div>

                      <div className="p-5 space-y-5">

                        {/* Podio */}
                        <div>
                          <SectionLabel color="text-yellow-600">🏆 Podio</SectionLabel>
                          <div className="grid grid-cols-3 gap-2">
                            {fullGrid.slice(0, 3).map((id, i) => {
                              const d = driverById(id);
                              const medals = ['🥇', '🥈', '🥉'];
                              const sizes = ['scale-105', 'scale-100', 'scale-100'];
                              return (
                                <div
                                  key={id}
                                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-transform ${sizes[i]}`}
                                  style={{
                                    borderColor: `${d.color}25`,
                                    background: `linear-gradient(135deg, ${d.color}0a 0%, transparent 70%)`,
                                  }}
                                >
                                  <span className="text-2xl">{medals[i]}</span>
                                  <div className="w-3 h-3 rounded-full ring-2 ring-white/10" style={{ backgroundColor: d.color }} />
                                  <span className="font-black text-sm leading-tight">{d.name}</span>
                                  <span className="text-[9px] font-semibold" style={{ color: `${d.color}80` }}>{d.team}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Top 10 */}
                        <div>
                          <SectionLabel color="text-blue-500">Posizioni 4–10</SectionLabel>
                          <div className="grid grid-cols-2 gap-1">
                            {fullGrid.slice(3, 10).map((id, i) => (
                              <DriverChip key={id} driverId={id} pos={i + 4} small />
                            ))}
                          </div>
                        </div>

                        {/* 11-15 */}
                        <div>
                          <SectionLabel>Posizioni 11–15</SectionLabel>
                          <div className="grid grid-cols-2 gap-1">
                            {fullGrid.slice(10, 15).map((id, i) => (
                              <DriverChip key={id} driverId={id} pos={i + 11} small />
                            ))}
                          </div>
                        </div>

                        {/* Ultimi 5 */}
                        <div>
                          <SectionLabel color="text-purple-500">Ultimi 5 · Posizioni 16–20</SectionLabel>
                          <div className="grid grid-cols-2 gap-1">
                            {lastFive.map((id, i) => (
                              <DriverChip key={id} driverId={id} pos={16 + i} small />
                            ))}
                          </div>
                        </div>

                        {/* Bonus pills */}
                        {(fastestLap || safetyCar !== null) && (
                          <div className="flex flex-wrap gap-2">
                            {fastestLap && (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[10px]">
                                <Zap className="w-3 h-3 text-orange-400" />
                                <span className="text-zinc-400">Giro veloce:</span>
                                <span className="font-black text-white">{driverById(fastestLap).name}</span>
                              </div>
                            )}
                            {safetyCar !== null && (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[10px]">
                                <Shield className="w-3 h-3 text-cyan-400" />
                                <span className="text-zinc-400">Safety car:</span>
                                <span className="font-black text-white">{safetyCar ? 'Sì' : 'No'}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Error */}
                        {error && (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                            <p className="text-[11px] text-red-400">{error}</p>
                          </div>
                        )}

                        {/* Saved / Save button */}
                        {saved ? (
                          <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/8 border border-green-500/20">
                            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-green-500/15 border border-green-500/20 shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            </div>
                            <div>
                              <p className="font-black text-green-400 text-sm">Predizione salvata!</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">
                                Modificabile fino a {lockDate.toLocaleDateString('it-IT', {
                                  weekday: 'long', hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={handleSave}
                            disabled={saving || !session || locked}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all
                              ${saving || !session || locked
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-red-700 to-red-500 text-white hover:scale-[1.01] shadow-xl shadow-red-600/25'}`}
                          >
                            {saving
                              ? <><div className="w-4 h-4 rounded-full border-t-2 border-white/50 animate-spin" /> Salvataggio...</>
                              : locked ? <><Lock className="w-4 h-4" /> Predizioni chiuse</>
                              : !session ? <><Shield className="w-4 h-4" /> Login richiesto</>
                              : <><Send className="w-4 h-4" /> Salva Predizione</>
                            }
                          </button>
                        )}

                        {saved && !locked && (
                          <button
                            onClick={() => { setSaved(false); setStep('grid'); resetToDefault(); }}
                            className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw className="w-3 h-3" /> Nuova predizione
                          </button>
                        )}
                      </div>

                      <div className="px-5 py-4 border-t border-white/5 bg-zinc-950/50">
                        <button onClick={() => setStep('bonus')} className="text-zinc-600 hover:text-white transition-colors text-xs font-black uppercase">
                          ← Bonus
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : locked && (
            /* Locked state */
            <div className="rounded-3xl border border-red-500/15 overflow-hidden">
              <div
                className="p-10 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.04) 0%, transparent 60%)' }}
              >
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                  <Lock className="w-6 h-6 text-red-500" />
                </div>
                <p className="font-black text-xl mb-2 uppercase italic tracking-tight">Predizioni chiuse</p>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                  Le qualifiche sono iniziate. Torna dopo la gara per vedere il tuo punteggio!
                </p>
                {saved && existingPred && (
                  <button
                    onClick={() => setStep('confirm')}
                    className="mt-6 px-5 py-2 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                  >
                    Visualizza la tua predizione →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}