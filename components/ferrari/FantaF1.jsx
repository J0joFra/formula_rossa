'use client';
/**
 * components/ferrari/FantaF1.jsx
 * Componente predizioni pre-gara — da inserire nella FanZone
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

// Bandiere circuiti (riusa da PredictorSection)
const CIRCUIT_COUNTRY = {
  'albert-park':'au', 'shanghai':'cn', 'suzuka':'jp', 'bahrain':'bh', 'jeddah':'sa',
  'miami':'us', 'imola':'it', 'monte-carlo':'mc', 'barcelona':'es', 'villeneuve':'ca',
  'red-bull-ring':'at', 'silverstone':'gb', 'hungaroring':'hu', 'spa-francorchamps':'be',
  'zandvoort':'nl', 'monza':'it', 'baku':'az', 'marina-bay':'sg', 'austin':'us',
  'rodriguez':'mx', 'interlagos':'br', 'las-vegas':'us', 'lusail':'qa', 'yas-marina':'ae',
};

// ─── HELPER ───────────────────────────────────────────────────────────────────
function driverById(id) {
  return DRIVERS_2026.find(d => d.id === id) || { 
    id, 
    name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), 
    team: '?', 
    color: '#666' 
  };
}

function DriverChip({ driverId, pos, onRemove, small = false }) {
  const d = driverById(driverId);
  return (
    <div className={`flex items-center gap-2 rounded-xl border bg-zinc-900 border-white/10
      ${small ? 'px-2 py-1' : 'px-3 py-2'}`}>
      {pos !== undefined && (
        <span className="text-[10px] font-black text-zinc-500 w-5 text-center">{pos}°</span>
      )}
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
      <span className={`font-black text-white ${small ? 'text-[10px]' : 'text-xs'}`}>{d.name}</span>
      <span className={`text-zinc-600 ${small ? 'text-[9px]' : 'text-[10px]'}`}>{d.team}</span>
      {onRemove && (
        <button onClick={onRemove} className="ml-auto text-zinc-600 hover:text-red-500 transition-colors text-xs">✕</button>
      )}
    </div>
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

  // Predizione utente
  const [fullGrid, setFullGrid] = useState([]);
  const [lastFive, setLastFive] = useState([]);
  const [fastestLap, setFastestLap] = useState('');
  const [safetyCar, setSafetyCar] = useState(null);

  // Risultato + score
  const [existingPred, setExistingPred] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);

  // Inizializza dati piloti
  useEffect(() => {
    setFullGrid(DRIVERS_2026.map(d => d.id));
    setLastFive(DRIVERS_2026.slice(-5).map(d => d.id));
  }, []);

  // Inizializza gara
  useEffect(() => {
    const r = getCurrentRace();
    setRace(r);
    if (r) setLocked(isRaceLocked(r));
    setLoading(false);
  }, []);

  // Controllo lock ogni minuto
  useEffect(() => {
    if (!race) return;
    const id = setInterval(() => setLocked(isRaceLocked(race)), 60000);
    return () => clearInterval(id);
  }, [race]);

  // Carica predizione esistente + risultato
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

  // Leaderboard
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
    if (!session?.user?.email) { 
      setError('Effettua il login per salvare'); 
      return; 
    }
    
    if (!race) {
      setError('Gara non disponibile');
      return;
    }

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
      <section className="mb-24">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      </section>
    );
  }

  const cc = CIRCUIT_COUNTRY[race.circuitId];
  const lockDate = new Date(race.lockDate + 'T15:00:00');

  return (
    <section className="mb-24">
      {/* Header sezione */}
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="text-yellow-500 w-7 h-7" />
        <h3 className="text-2xl font-black uppercase italic tracking-tight">FantaF1 — Predici la Gara</h3>
        <div className="flex-1 h-px bg-white/5 ml-2" />
        {locked && (
          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            <Lock className="w-3 h-3" /> Chiuse
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── COLONNA SINISTRA: info gara + leaderboard ── */}
        <div className="space-y-5">

          {/* Card gara */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60">
            {cc && (
              <div className="absolute inset-0">
                <div className="w-full h-full opacity-10 bg-cover bg-center"
                     style={{ backgroundImage: `url(https://flagcdn.com/w320/${cc}.png)` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 to-zinc-900" />
              </div>
            )}
            <div className="relative z-10 p-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">
                Round {race.round} · 2026
              </p>
              <h4 className="text-xl font-black uppercase italic mb-4">{race.name}</h4>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-bold">
                  {locked
                    ? 'Predizioni chiuse'
                    : `Chiude: ${lockDate.toLocaleDateString('it-IT', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Punti guida */}
          <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-4">Sistema Punti</p>
            <div className="space-y-2">
              {[
                { label: 'Posizione esatta',     pts: POINTS.exactPosition,    color: 'text-green-400' },
                { label: 'Nel podio (pos wrong)', pts: POINTS.podiumWrong,      color: 'text-yellow-400' },
                { label: 'Top 10 (pos wrong)',    pts: POINTS.top10Wrong,       color: 'text-blue-400' },
                { label: 'Ultimi 5 esatti',       pts: POINTS.lastFiveExact,    color: 'text-purple-400' },
                { label: 'Ultimi 5 (pos wrong)',  pts: POINTS.lastFiveWrong,    color: 'text-purple-600' },
                { label: 'Giro veloce',           pts: POINTS.fastestLapExact,  color: 'text-orange-400' },
                { label: 'Safety car',            pts: POINTS.safetyCarCorrect, color: 'text-cyan-400' },
              ].map((r, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                  <span className="text-[10px] text-zinc-500 font-bold">{r.label}</span>
                  <span className={`text-[10px] font-black ${r.color}`}>+{r.pts} pt</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard stagionale */}
          <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-4">
              🏆 Classifica Stagione
            </p>
            {lbLoading ? (
              <p className="text-zinc-600 text-xs text-center py-4">Caricamento...</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-zinc-700 text-xs text-center py-4">Nessuna predizione ancora</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((p, i) => (
                  <div key={p.userId || i}
                    className={`flex items-center gap-3 py-1.5 ${session?.user?.email === p.userId ? 'text-yellow-400' : 'text-white'}`}>
                    <span className="text-[10px] font-black w-5 text-center text-zinc-600">
                      {i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    {p.avatar
                      ? <img src={p.avatar} alt="" className="w-6 h-6 rounded-full" />
                      : <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-black text-zinc-500">
                          {p.name?.[0]?.toUpperCase() || '?'}
                        </div>
                    }
                    <span className="flex-1 text-[11px] font-bold truncate">{p.name || 'Anonimo'}</span>
                    <span className="text-[11px] font-black text-yellow-500">{p.totalPoints || 0} pt</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── COLONNA DESTRA: form predizione ── */}
        <div className="lg:col-span-2">

          {/* Risultato post-gara */}
          {result && score && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-3xl border border-yellow-500/30 bg-yellow-500/5 p-6"
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-yellow-500 mb-3">
                ✓ Risultato — {race.name}
              </p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-5xl font-black text-yellow-400">{score.total}</p>
                  <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">punti totali</p>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  {Object.entries(score.breakdown || {}).map(([key, val]) => val > 0 && (
                    <div key={key} className="flex justify-between text-[10px]">
                      <span className="text-zinc-500 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                      <span className="font-black text-green-400">+{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Login required */}
          {!session && (
            <div className="rounded-3xl border border-white/10 bg-zinc-900/40 p-8 text-center mb-6">
              <Shield className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <p className="font-black text-sm mb-1">Login richiesto</p>
              <p className="text-zinc-600 text-xs">Accedi per salvare le tue predizioni e scalare la classifica.</p>
            </div>
          )}

          {/* Tabs step - mostrati solo se non bloccato O se l'utente ha già salvato */}
          {(!locked || saved) && session ? (
            <>
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {[
                  { id: 'grid',    label: 'Classifica', icon: Trophy },
                  { id: 'lastfive', label: 'Ultimi 5',  icon: ChevronDown },
                  { id: 'bonus',   label: 'Bonus',      icon: Zap },
                  { id: 'confirm', label: 'Conferma',   icon: CheckCircle2 },
                ].map(({ id, label, icon: Icon }) => (
                  <button 
                    key={id} 
                    onClick={() => setStep(id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap
                      ${step === id
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-transparent text-zinc-500 border-white/10 hover:border-white/30'}`}>
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>

              {/* ── STEP: Classifica completa (drag & drop) ── */}
              <AnimatePresence mode="wait">
                {step === 'grid' && (
                  <motion.div 
                    key="grid" 
                    initial={{ opacity: 0, x: 10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -10 }}
                    className="max-h-[600px] overflow-y-auto pr-2"
                  >
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4 sticky top-0 bg-zinc-950 py-2 z-10">
                      Trascina i piloti per ordinarli · Posizione 1→20
                    </p>
                    <Reorder.Group axis="y" values={fullGrid} onReorder={setFullGrid} className="space-y-1.5">
                      {fullGrid.map((driverId, i) => {
                        const d = driverById(driverId);
                        return (
                          <Reorder.Item key={driverId} value={driverId}
                            className={`flex items-center gap-3 p-3 rounded-2xl border bg-zinc-900 cursor-grab active:cursor-grabbing transition-colors
                              ${i < 3 ? 'border-yellow-500/20' : i < 10 ? 'border-white/5' : 'border-white/[0.03]'}`}>
                            <GripVertical className="w-4 h-4 text-zinc-700 shrink-0" />
                            <span className={`text-xs font-black w-5 text-center shrink-0
                              ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-amber-600' : 'text-zinc-600'}`}>
                              {i + 1}
                            </span>
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                            <span className="font-black text-sm flex-1">{d.name}</span>
                            <span className="text-[10px] text-zinc-600">{d.team}</span>
                          </Reorder.Item>
                        );
                      })}
                    </Reorder.Group>
                    <div className="flex justify-between items-center mt-4 sticky bottom-0 bg-zinc-950 py-3">
                      <button onClick={() => setFullGrid(DRIVERS_2026.map(d => d.id))}
                        className="flex items-center gap-1.5 text-zinc-600 hover:text-white transition-colors text-[10px] font-black uppercase">
                        <RotateCcw className="w-3 h-3" /> Reset
                      </button>
                      <button onClick={() => setStep('lastfive')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-colors">
                        Avanti → Ultimi 5
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP: Ultimi 5 ── */}
                {step === 'lastfive' && (
                  <motion.div 
                    key="lastfive" 
                    initial={{ opacity: 0, x: 10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">
                      Chi finirà in fondo? Ordina le posizioni 16–20
                    </p>
                    <p className="text-[9px] text-zinc-700 mb-4">
                      Gli ultimi 5 valgono punti extra — indovinare chi si ritira o chi performa male è la vera sfida.
                    </p>
                    
                    {/* Lista ultimi 5 */}
                    <Reorder.Group axis="y" values={lastFive} onReorder={setLastFive} className="space-y-1.5 mb-4">
                      {lastFive.map((driverId, i) => {
                        const d = driverById(driverId);
                        return (
                          <Reorder.Item key={driverId} value={driverId}
                            className="flex items-center gap-3 p-3 rounded-2xl border border-purple-500/10 bg-zinc-900 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4 text-zinc-700 shrink-0" />
                            <span className="text-xs font-black w-6 text-center shrink-0 text-purple-500">{16 + i}</span>
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                            <span className="font-black text-sm flex-1">{d.name}</span>
                            <span className="text-[10px] text-zinc-600">{d.team}</span>
                            <button 
                              onClick={() => {
                                const newLastFive = lastFive.filter((_, index) => index !== i);
                                setLastFive(newLastFive);
                              }}
                              className="text-zinc-600 hover:text-red-500 transition-colors text-xs"
                            >
                              ✕
                            </button>
                          </Reorder.Item>
                        );
                      })}
                    </Reorder.Group>

                    {/* Piloti disponibili */}
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-4 mb-2">
                      Clicca per aggiungere un pilota (max 5):
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-white/5 rounded-xl">
                      {DRIVERS_2026
                        .filter(d => !lastFive.includes(d.id))
                        .map(d => (
                          <button key={d.id}
                            onClick={() => {
                              if (lastFive.length < 5) {
                                setLastFive(prev => [...prev, d.id]);
                              }
                            }}
                            disabled={lastFive.length >= 5}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-colors text-[10px]
                              ${lastFive.length >= 5 
                                ? 'border-white/5 bg-zinc-900/50 text-zinc-700 cursor-not-allowed' 
                                : 'border-white/10 bg-zinc-900 hover:border-purple-500/40 text-zinc-400 hover:text-white'}`}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="font-bold">{d.name}</span>
                          </button>
                        ))}
                    </div>

                    <div className="flex justify-between mt-6">
                      <button onClick={() => setStep('grid')}
                        className="text-zinc-600 hover:text-white transition-colors text-[10px] font-black uppercase">
                        ← Indietro
                      </button>
                      <button onClick={() => setStep('bonus')}
                        disabled={lastFive.length !== 5}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors
                          ${lastFive.length === 5
                            ? 'bg-red-600 text-white hover:bg-red-500' 
                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}>
                        Avanti → Bonus
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP: Bonus ── */}
                {step === 'bonus' && (
                  <motion.div 
                    key="bonus" 
                    initial={{ opacity: 0, x: 10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-6">
                      Domande bonus — punti extra
                    </p>

                    {/* Giro veloce */}
                    <div className="mb-6">
                      <p className="text-xs font-black text-white mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-400" /> Chi fa il giro veloce?
                        <span className="text-[9px] text-orange-400 font-bold">+{POINTS.fastestLapExact} pt</span>
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                        {DRIVERS_2026.map(d => (
                          <button key={d.id} onClick={() => setFastestLap(d.id)}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all text-[10px] font-bold
                              ${fastestLap === d.id
                                ? 'border-orange-500 bg-orange-500/10 text-white'
                                : 'border-white/5 bg-zinc-900 text-zinc-500 hover:border-white/20'}`}>
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                            {d.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Safety car */}
                    <div className="mb-8">
                      <p className="text-xs font-black text-white mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-400" /> Ci sarà la Safety Car?
                        <span className="text-[9px] text-cyan-400 font-bold">+{POINTS.safetyCarCorrect} pt</span>
                      </p>
                      <div className="flex gap-3">
                        {[
                          { val: true, label: '🟡 Sì' }, 
                          { val: false, label: '🟢 No' }
                        ].map(({ val, label }) => (
                          <button key={String(val)} onClick={() => setSafetyCar(val)}
                            className={`flex-1 py-3 rounded-2xl border font-black text-sm transition-all
                              ${safetyCar === val
                                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                : 'border-white/5 bg-zinc-900 text-zinc-500 hover:border-white/20'}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button onClick={() => setStep('lastfive')}
                        className="text-zinc-600 hover:text-white transition-colors text-[10px] font-black uppercase">
                        ← Indietro
                      </button>
                      <button onClick={() => setStep('confirm')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-colors">
                        Avanti → Conferma
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP: Conferma ── */}
                {step === 'confirm' && (
                  <motion.div 
                    key="confirm" 
                    initial={{ opacity: 0, x: 10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-6">
                      Riepilogo predizione — {race.name}
                    </p>

                    {/* Podio */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {fullGrid.slice(0, 3).map((id, i) => {
                        const d = driverById(id);
                        const medals = ['🥇', '🥈', '🥉'];
                        return (
                          <div key={id} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/10 bg-zinc-900/60 text-center">
                            <span className="text-2xl">{medals[i]}</span>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="font-black text-sm">{d.name}</span>
                            <span className="text-[9px] text-zinc-600">{d.team}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Top 10 resto */}
                    <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-2">Posizioni 4-10</p>
                    <div className="grid grid-cols-2 gap-1.5 mb-4">
                      {fullGrid.slice(3, 10).map((id, i) => (
                        <DriverChip key={id} driverId={id} pos={i + 4} small />
                      ))}
                    </div>

                    {/* Posizioni 11-15 */}
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-2">Posizioni 11-15</p>
                    <div className="grid grid-cols-2 gap-1.5 mb-4">
                      {fullGrid.slice(10, 15).map((id, i) => (
                        <DriverChip key={id} driverId={id} pos={i + 11} small />
                      ))}
                    </div>

                    {/* Ultimi 5 */}
                    <p className="text-[9px] text-purple-400 font-black uppercase tracking-widest mb-2">Ultimi 5 (16-20)</p>
                    <div className="grid grid-cols-2 gap-1.5 mb-4">
                      {lastFive.map((id, i) => (
                        <DriverChip key={id} driverId={id} pos={16 + i} small />
                      ))}
                    </div>

                    {/* Bonus */}
                    <div className="flex flex-wrap gap-3 mb-6">
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

                    {error && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <p className="text-[11px] text-red-400">{error}</p>
                      </div>
                    )}

                    {saved ? (
                      <div className="flex items-center gap-2 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                        <div>
                          <p className="font-black text-green-400 text-sm">Predizione salvata!</p>
                          <p className="text-[10px] text-zinc-500">
                            Puoi modificarla fino al {lockDate.toLocaleDateString('it-IT', { 
                              weekday: 'long', 
                              hour: '2-digit', 
                              minute: '2-digit' 
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
                            : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:scale-[1.02] shadow-lg shadow-red-600/20'}`}>
                        <Send className="w-4 h-4" />
                        {saving ? 'Salvataggio...' : locked ? 'Predizioni chiuse' : !session ? 'Login richiesto' : 'Salva Predizione'}
                      </button>
                    )}

                    {saved && !locked && (
                      <button 
                        onClick={() => { setSaved(false); setStep('grid'); resetToDefault(); }}
                        className="w-full mt-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors flex items-center justify-center gap-1.5">
                        <RotateCcw className="w-3 h-3" /> Nuova predizione
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : locked && (
            /* Locked — */
            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
              <Lock className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <p className="font-black text-lg mb-1">Predizioni chiuse</p>
              <p className="text-zinc-500 text-sm">Le qualifiche sono iniziate. Torna dopo la gara per vedere il tuo punteggio!</p>
              {saved && existingPred && (
                <button 
                  onClick={() => setStep('confirm')} 
                  className="mt-4 text-[10px] text-zinc-400 hover:text-white underline"
                >
                  Visualizza la tua predizione
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}