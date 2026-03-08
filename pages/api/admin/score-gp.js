'use client';
/**
 * pages/admin/score-gp.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Pagina admin per inserire risultati GP, calcolare punteggi e assegnare token.
 * Stile coerente con FanZone (dark Ferrari).
 * Accesso solo se email in ADMIN_EMAILS (controllato lato API).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Trophy, Zap, Shield, AlertCircle, CheckCircle2,
  ChevronDown, Plus, X, Loader2, Flag,
  Users, Coins, RotateCcw,
} from 'lucide-react';
import { FANTA_CALENDAR, DRIVERS_2026 } from '../../lib/fantaF1';

// ─── Piloti ordinati per visualizzazione ─────────────────────────────────────
const DRIVERS = DRIVERS_2026;
const TEAMS = [...new Set(DRIVERS.map(d => d.team))];

function teamId(teamName) {
  return teamName.toLowerCase().replace(/\s+/g, '-');
}

// ─── Componente select pilota ─────────────────────────────────────────────────
function DriverSelect({ value, onChange, placeholder = 'Seleziona pilota', exclude = [] }) {
  const available = DRIVERS.filter(d => !exclude.includes(d.id) || d.id === value);
  const selected  = DRIVERS.find(d => d.id === value);
  return (
    <div className="relative">
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white pr-10
          focus:outline-none focus:border-red-500/50 transition-colors cursor-pointer"
        style={selected ? { borderColor: `${selected.color}40` } : {}}
      >
        <option value="">{placeholder}</option>
        {available.map(d => (
          <option key={d.id} value={d.id}>{d.name} — {d.team}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
      {selected && (
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: selected.color }}
        />
      )}
    </div>
  );
}

// ─── Label sezione ─────────────────────────────────────────────────────────
function SLabel({ children, color = 'text-zinc-500' }) {
  return (
    <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-3 ${color}`}>
      {children}
    </p>
  );
}

// ─── Card sezione ─────────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`bg-zinc-900/50 border border-white/5 rounded-3xl p-6 ${className}`}>
      {children}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function AdminScoreGP() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ── State ──
  const [raceId,    setRaceId]    = useState('');
  const [gpStatus,  setGpStatus]  = useState('provisional');
  const [fullGrid,  setFullGrid]  = useState(Array(10).fill(''));   // pos 1–10
  const [lastTail,  setLastTail]  = useState(Array(12).fill(''));   // pos 11–22
  const [fl,        setFl]        = useState('');
  const [sc,        setSc]        = useState(null);    // true | false | null
  const [dnfs,      setDnfs]      = useState(['', '', '']);
  const [winTeam,   setWinTeam]   = useState('');
  const [doublePod, setDoublePod] = useState('');

  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);   // risposta API
  const [error,     setError]     = useState(null);

  // ── Redirect se non admin (opzionale, la vera protezione è lato API) ──
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
  }, [status]);

  // ── Auto-fill winningConstructor dal vincitore selezionato ──
  useEffect(() => {
    if (!fullGrid[0]) return;
    const d = DRIVERS.find(d => d.id === fullGrid[0]);
    if (d) setWinTeam(teamId(d.team));
  }, [fullGrid[0]]);

  // ── Auto-detect doppietta ──
  useEffect(() => {
    const [p1, p2, p3] = fullGrid;
    if (!p1 || !p2 || !p3) { setDoublePod(''); return; }
    const d1 = DRIVERS.find(d => d.id === p1);
    const d2 = DRIVERS.find(d => d.id === p2);
    const d3 = DRIVERS.find(d => d.id === p3);
    if (d1?.team === d2?.team) setDoublePod(teamId(d1.team));
    else if (d1?.team === d3?.team) setDoublePod(teamId(d1.team));
    else if (d2?.team === d3?.team) setDoublePod(teamId(d2.team));
    else setDoublePod('');
  }, [fullGrid[0], fullGrid[1], fullGrid[2]]);

  const usedDrivers = [...fullGrid, ...lastTail, fl, ...dnfs].filter(Boolean);

  // ── Submit ──
  async function handleSubmit() {
    setError(null);
    setResult(null);

    if (!raceId)           return setError('Seleziona la gara');
    if (fullGrid.some(d => !d)) return setError('Completa tutti i 10 piloti nella griglia principale');
    if (!fl)               return setError('Inserisci il giro veloce');
    if (sc === null)       return setError('Specifica se c\'era Safety Car / VSC');

    const body = {
      raceId,
      status: gpStatus,
      fullGrid: fullGrid.map((driverId, i) => ({ pos: i + 1, driverId })),
      lastTail: lastTail.filter(Boolean).map((driverId, i) => ({ pos: 11 + i, driverId })),
      bonuses: {
        fastestLap:         fl,
        safetyCar:          sc,
        dnfDrivers:         dnfs.filter(Boolean),
        winningConstructor: winTeam,
        teamDoublePodium:   doublePod || null,
      },
    };

    setLoading(true);
    try {
      const res  = await fetch('/api/admin/score-gp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore sconosciuto');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setRaceId(''); setFullGrid(Array(10).fill('')); setLastTail(Array(6).fill(''));
    setPole(''); setFl(''); setSc(null); setDnfs(['','','']);
    setWinTeam(''); setDoublePod(''); setResult(null); setError(null);
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
      </div>
    );
  }

  const selectedRace = FANTA_CALENDAR.find(r => r.raceId === raceId);

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans">
      <div className="max-w-3xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-3">
            Admin · FantaF1
          </p>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">
            Score <span className="text-red-600">GP</span>
          </h1>
          <p className="text-zinc-500 text-sm">
            Inserisci i risultati, salva su Firestore e assegna i punti automaticamente.
          </p>
        </div>

        {result ? (
          /* ── RISULTATO ── */
          <div className="space-y-6">
            <div className="bg-green-500/8 border border-green-500/20 rounded-3xl p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-black uppercase italic mb-1">{result.race}</h2>
              <p className="text-green-400 font-black text-sm uppercase tracking-widest mb-6">Completato con successo</p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Partecipanti', value: result.participants, icon: Users },
                  { label: 'Token assegnati', value: result.tokenAwarded, icon: Coins },
                  { label: 'Top scorer', value: result.leaderboard[0]?.total + ' pt', icon: Trophy },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-white/5 rounded-2xl p-4">
                    <Icon className="w-4 h-4 text-zinc-500 mx-auto mb-2" />
                    <p className="text-xl font-black text-white">{value}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Classifica */}
            <Card>
              <SLabel color="text-yellow-500">Classifica finale</SLabel>
              <div className="space-y-2">
                {result.leaderboard.map((p, i) => (
                  <div key={p.userId} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-sm font-black w-6 text-center text-zinc-500">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                    </span>
                    <span className="flex-1 font-bold text-sm text-zinc-200 truncate">{p.userName}</span>
                    <span className="font-black text-white tabular-nums">{p.total} pt</span>
                    {p.tokensAwarded > 0 && (
                      <span className="text-[10px] font-black text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">
                        +{p.tokensAwarded} SFT
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <button onClick={reset}
              className="w-full py-4 rounded-2xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Nuovo GP
            </button>
          </div>

        ) : (
          /* ── FORM ── */
          <div className="space-y-6">

            {/* Selezione gara */}
            <Card>
              <SLabel color="text-red-500">Gara</SLabel>
              <div className="relative">
                <select
                  value={raceId}
                  onChange={e => setRaceId(e.target.value)}
                  className="w-full appearance-none bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white pr-10 focus:outline-none focus:border-red-500/50 transition-colors"
                >
                  <option value="">— Seleziona GP —</option>
                  {FANTA_CALENDAR.map(r => (
                    <option key={r.raceId} value={r.raceId}>
                      R{String(r.round).padStart(2,'0')} · {r.name} · {r.date}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
              {selectedRace && (
                <div className="flex gap-3 mt-3">
                  {['provisional','official'].map(s => (
                    <button key={s} onClick={() => setGpStatus(s)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                        ${gpStatus === s
                          ? 'bg-red-600/20 border-red-500/40 text-red-400'
                          : 'bg-transparent border-white/10 text-zinc-600 hover:text-zinc-300'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Griglia top 10 */}
            <Card>
              <SLabel color="text-blue-400">Classifica · Posizioni 1 – 10</SLabel>
              <div className="space-y-2">
                {fullGrid.map((val, i) => {
                  const accent = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#3B82F6';
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm font-black w-6 text-center shrink-0 tabular-nums" style={{ color: accent }}>
                        {i + 1}°
                      </span>
                      <DriverSelect
                        value={val}
                        onChange={v => setFullGrid(g => { const n=[...g]; n[i]=v; return n; })}
                        placeholder={`Posizione ${i + 1}`}
                        exclude={usedDrivers.filter(d => d !== val)}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Zona coda 11–16 */}
            <Card>
              <SLabel>Zona coda · Posizioni 11 – 22</SLabel>
              <p className="text-[11px] text-zinc-600 mb-3">Tutti i 12 piloti rimanenti in ordine. Per i DNF/DNS inseriscili comunque nella posizione in cui sono stati classificati.</p>
              <div className="space-y-2">
                {lastTail.map((val, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-black w-6 text-center shrink-0 tabular-nums" style={{color: i >= 7 ? '#a855f7' : '#52525b'}}>
                      {11 + i}°
                    </span>
                    <DriverSelect
                      value={val}
                      onChange={v => setLastTail(t => { const n=[...t]; n[i]=v; return n; })}
                      placeholder={`Posizione ${11 + i} (opzionale)`}
                      exclude={usedDrivers.filter(d => d !== val)}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Bonus */}
            <Card>
              <SLabel color="text-yellow-500">Bonus gara</SLabel>
              <div className="space-y-4">

                {/* Giro veloce */}
                <div>
                  <p className="text-[11px] text-zinc-500 font-bold mb-2 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-orange-400" /> Giro Veloce
                  </p>
                  <DriverSelect value={fl} onChange={setFl} placeholder="Chi ha fatto il giro veloce?" />
                </div>

                {/* Safety Car / VSC */}
                <div>
                  <p className="text-[11px] text-zinc-500 font-bold mb-2 flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-cyan-400" /> Safety Car / VSC
                  </p>
                  <div className="flex gap-3">
                    {[true, false].map(v => (
                      <button key={String(v)} onClick={() => setSc(v)}
                        className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border
                          ${sc === v
                            ? v ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                                : 'bg-zinc-800 border-zinc-600 text-zinc-300'
                            : 'bg-transparent border-white/10 text-zinc-600 hover:text-zinc-300'}`}>
                        {v ? '✅ Sì (SC o VSC)' : '❌ No'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DNF */}
                <div>
                  <p className="text-[11px] text-zinc-500 font-bold mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-red-400" /> DNF / DNS (max 6)
                  </p>
                  <div className="space-y-2">
                    {dnfs.map((val, i) => (
                      <div key={i} className="flex gap-2">
                        <DriverSelect
                          value={val}
                          onChange={v => setDnfs(d => { const n=[...d]; n[i]=v; return n; })}
                          placeholder={`Ritiro ${i + 1} (opzionale)`}
                          exclude={usedDrivers.filter(d => d !== val)}
                        />
                        {i === dnfs.length - 1 && dnfs.length < 6 ? (
                          <button onClick={() => setDnfs(d => [...d, ''])}
                            className="shrink-0 w-11 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center">
                            <Plus className="w-4 h-4 text-zinc-400" />
                          </button>
                        ) : i > 0 ? (
                          <button onClick={() => setDnfs(d => d.filter((_,j) => j !== i))}
                            className="shrink-0 w-11 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 transition-colors flex items-center justify-center">
                            <X className="w-4 h-4 text-zinc-400" />
                          </button>
                        ) : <div className="w-11" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Costruttore + Doppietta (auto-fill) */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div>
                    <p className="text-[11px] text-zinc-500 font-bold mb-2 flex items-center gap-1.5">
                      <Trophy className="w-3 h-3 text-green-400" /> Costruttore vincitore
                    </p>
                    <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white">
                      {winTeam || <span className="text-zinc-600">Auto dal 1° posto</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-500 font-bold mb-2 flex items-center gap-1.5">
                      <Flag className="w-3 h-3 text-purple-400" /> Doppietta podio
                    </p>
                    <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white">
                      {doublePod || <span className="text-zinc-600">Nessuna doppietta</span>}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Errore */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all
                ${loading
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-700 to-red-500 text-white hover:scale-[1.01] shadow-xl shadow-red-600/25'}`}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Elaborazione...</>
                : <><Trophy className="w-4 h-4" /> Salva risultati & assegna punti</>
              }
            </button>

            <p className="text-center text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
              L'operazione è irreversibile — verifica i dati prima di procedere
            </p>
          </div>
        )}
      </div>
    </div>
  );
}