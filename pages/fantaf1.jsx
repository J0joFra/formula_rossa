'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Users, Plus, LogIn, ChevronRight, ChevronLeft,
  Flag, Zap, AlertCircle, CheckCircle2, Loader2,
  TrendingUp, TrendingDown, Minus, Star, Clock,
  Copy, Check, Shield, Flame, Medal
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/ferrari/Navigation';
import Footer from '@/components/ferrari/Footer';
import {
  createLeague, joinLeague, getUserLeagues,
  getLeagueStandings, submitPick, getUserPick,
  getAllPicksForRace, getNextRace, getSeasonRaces,
} from '@/lib/fantaf1/fantaService';
import { SCORING_RULES } from '@/lib/fantaf1/scoring';

// ─── DRIVER LIST 2026 — allineata a lib/fantaF1.js ──────────────────────────
// I numeri di gara 2026 non sono ancora ufficiali per tutti — aggiorna a inizio stagione
const DRIVERS_2026 = [
  { number: 16, name: 'Charles Leclerc',   team: 'Ferrari',       color: '#DC0000', short: 'LEC' },
  { number: 44, name: 'Lewis Hamilton',    team: 'Ferrari',       color: '#DC0000', short: 'HAM' },
  { number: 1,  name: 'Max Verstappen',    team: 'Red Bull',      color: '#3671C6', short: 'VER' },
  { number: 6,  name: 'Isack Hadjar',      team: 'Red Bull',      color: '#3671C6', short: 'HAD' },
  { number: 63, name: 'George Russell',    team: 'Mercedes',      color: '#27F4D2', short: 'RUS' },
  { number: 12, name: 'Kimi Antonelli',    team: 'Mercedes',      color: '#27F4D2', short: 'ANT' },
  { number: 4,  name: 'Lando Norris',      team: 'McLaren',       color: '#FF8000', short: 'NOR' },
  { number: 81, name: 'Oscar Piastri',     team: 'McLaren',       color: '#FF8000', short: 'PIA' },
  { number: 14, name: 'Fernando Alonso',   team: 'Aston Martin',  color: '#358C75', short: 'ALO' },
  { number: 18, name: 'Lance Stroll',      team: 'Aston Martin',  color: '#358C75', short: 'STR' },
  { number: 10, name: 'Pierre Gasly',      team: 'Alpine',        color: '#FF87BC', short: 'GAS' },
  { number: 43, name: 'Franco Colapinto',  team: 'Alpine',        color: '#FF87BC', short: 'COL' },
  { number: 55, name: 'Carlos Sainz',      team: 'Williams',      color: '#64C4FF', short: 'SAI' },
  { number: 23, name: 'Alexander Albon',   team: 'Williams',      color: '#64C4FF', short: 'ALB' },
  { number: 27, name: 'Nico Hülkenberg',   team: 'Audi',          color: '#A8A8A8', short: 'HUL' },
  { number: 5,  name: 'Gabriel Bortoleto', team: 'Audi',          color: '#A8A8A8', short: 'BOR' },
  { number: 31, name: 'Esteban Ocon',      team: 'Haas',          color: '#B6BABD', short: 'OCO' },
  { number: 87, name: 'Oliver Bearman',    team: 'Haas',          color: '#B6BABD', short: 'BEA' },
  { number: 30, name: 'Liam Lawson',       team: 'Racing Bulls',  color: '#6692FF', short: 'LAW' },
  { number: 8,  name: 'Arvid Lindblad',    team: 'Racing Bulls',  color: '#6692FF', short: 'LIN' },
  { number: 11, name: 'Sergio Pérez',      team: 'Cadillac',      color: '#FFFFFF', short: 'PER' },
  { number: 77, name: 'Valtteri Bottas',   team: 'Cadillac',      color: '#FFFFFF', short: 'BOT' },
];

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Overview',   icon: Flag },
  { id: 'pick',      label: 'Pick GP',    icon: Zap },
  { id: 'leagues',   label: 'Le Mie Leghe', icon: Users },
  { id: 'rules',     label: 'Regolamento', icon: Shield },
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function FantaF1Page() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [nextRace, setNextRace] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const race = await getNextRace();
        setNextRace(race);
        if (session) {
          const l = await getUserLeagues(session);
          setLeagues(l);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);

  // Countdown al prossimo GP
  useEffect(() => {
    if (!nextRace?.date) return;
    const target = new Date(nextRace.date);
    const tick = () => {
      const diff = target - new Date();
      if (diff <= 0) { setCountdown('INIZIATA'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d}g ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextRace]);

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans overflow-x-hidden">
      <Navigation activeSection="fanzone" />

      {/* HERO */}
      <div className="relative pt-24 pb-12 overflow-hidden">
        {/* BG grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Red glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4">
          <Link href="/fanzone" className="inline-flex items-center gap-2 text-zinc-600 hover:text-red-500 transition-all mb-8 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Fan Zone</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-3">
                🏎️ Season 2026
              </p>
              <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                Fanta<span className="text-red-600">F1</span>
              </h1>
              <p className="text-zinc-500 text-sm mt-3 max-w-md leading-relaxed">
                Scegli il tuo pilota prima di ogni GP, accumula punti con bonus e malus epici. Scala la classifica della tua lega.
              </p>
            </div>

            {/* Countdown prossima gara */}
            {nextRace && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center md:items-end gap-1"
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Prossimo GP — Pick si chiude tra</p>
                <p className="text-3xl font-black font-mono text-red-500 tabular-nums">{countdown || '...'}</p>
                <p className="text-[10px] font-bold text-zinc-400">{nextRace.name}</p>
              </motion.div>
            )}
          </div>

          {/* TABS */}
          <div className="flex gap-1 bg-white/[0.03] border border-white/5 rounded-2xl p-1 w-fit">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : 'text-zinc-500 hover:text-white'
                }`}>
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview'  && <OverviewTab session={session} leagues={leagues} nextRace={nextRace} onTabChange={setActiveTab} />}
            {activeTab === 'pick'      && <PickTab session={session} nextRace={nextRace} leagues={leagues} />}
            {activeTab === 'leagues'   && <LeaguesTab session={session} leagues={leagues} setLeagues={setLeagues} />}
            {activeTab === 'rules'     && <RulesTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

// ─── TAB: OVERVIEW ────────────────────────────────────────────────────────────
function OverviewTab({ session, leagues, nextRace, onTabChange }) {
  return (
    <div className="space-y-10">
      {/* Stats rapide utente */}
      {session && leagues.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {[
            { label: 'Leghe', value: leagues.length, icon: Users, color: 'text-blue-400' },
            { label: 'Punteggio migliore', value: Math.max(...leagues.map(l => l.myScore ?? 0)), icon: Trophy, color: 'text-yellow-400' },
            { label: 'Prossimo GP', value: nextRace?.country ?? '—', icon: Flag, color: 'text-red-400' },
            { label: 'Pick disponibile', value: nextRace ? 'Sì' : 'No', icon: Zap, color: 'text-green-400' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{stat.label}</p>
              <p className="text-xl font-black text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA se non loggato */}
      {!session && (
        <div className="relative overflow-hidden rounded-[32px] border border-red-500/20 bg-gradient-to-br from-red-950/30 to-black p-10 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.05),transparent_70%)]" />
          <Flag className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-black uppercase italic mb-2">Entra in Pista</h2>
          <p className="text-zinc-500 mb-6 max-w-sm mx-auto text-sm">Fai login per creare la tua lega, scegliere il pilota e scalare la classifica.</p>
          <Link href="/api/auth/signin"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">
            <LogIn className="w-4 h-4" /> Accedi
          </Link>
        </div>
      )}

      {/* Leghe rapide */}
      {session && (
        <div>
          <SectionHeader icon={<Users className="text-blue-400 w-6 h-6" />} label="Le Tue Leghe" action={
            <button onClick={() => onTabChange('leagues')} className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition flex items-center gap-1">
              Gestisci <ChevronRight className="w-3 h-3" />
            </button>
          } />
          {leagues.length === 0 ? (
            <EmptyState icon={Users} title="Nessuna lega" desc="Crea la tua prima lega o unisciti a quella di un amico." action={<button onClick={() => onTabChange('leagues')} className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition">Inizia</button>} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leagues.slice(0, 4).map((l, i) => <LeagueCard key={l.id} league={l} index={i} />)}
            </div>
          )}
        </div>
      )}

      {/* Come funziona */}
      <div>
        <SectionHeader icon={<Star className="text-yellow-400 w-6 h-6" />} label="Come Funziona" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '01', title: 'Crea una Lega', desc: 'Invita i tuoi amici con un codice segreto. Max flessibilità, zero iscrizioni.', icon: Users, color: 'from-blue-600 to-blue-800' },
            { step: '02', title: 'Scegli il Pilota', desc: 'Prima di ogni GP, scegli chi pensi farà la gara della vita. Pick chiuso 1h prima della partenza.', icon: Zap, color: 'from-red-600 to-red-800' },
            { step: '03', title: 'Accumula Punti', desc: 'Vittorie, pit stop epici, team radio leggendari e malus per gli errori del muretto. Chi ride ultimo...', icon: Trophy, color: 'from-yellow-500 to-yellow-700' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden rounded-[28px] border border-white/5 bg-zinc-900/20 p-8">
              <span className="absolute top-4 right-4 text-[60px] font-black text-white/[0.03] leading-none select-none">{item.step}</span>
              <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black uppercase italic mb-2">{item.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: PICK GP ─────────────────────────────────────────────────────────────
function PickTab({ session, nextRace, leagues }) {
  const [selected, setSelected] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [existingPick, setExistingPick] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!session || !selectedLeague || !nextRace) return;
    getUserPick(session, selectedLeague, nextRace.id).then(pick => {
      if (pick) {
        setExistingPick(pick);
        setSelected(pick.driverNumber);
      }
    }).catch(console.error);
  }, [session, selectedLeague, nextRace]);

  const handleSubmit = async () => {
    if (!selected || !selectedLeague || !session || !nextRace) return;
    setSaving(true);
    setError('');
    try {
      await submitPick(session, selectedLeague, nextRace.id, selected);
      setSaved(true);
      setExistingPick({ driverNumber: selected });
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = DRIVERS_2026.filter(d =>
    d.name.toLowerCase().includes(filter.toLowerCase()) ||
    d.team.toLowerCase().includes(filter.toLowerCase())
  );

  if (!session) return <LoginPrompt />;
  if (!nextRace) return <EmptyState icon={Clock} title="Nessuna gara in programma" desc="Il calendario non ha ancora gare disponibili." />;

  const isLocked = nextRace.status === 'locked' || nextRace.status === 'completed';

  return (
    <div className="space-y-8">
      {/* Info prossima gara */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/5 bg-zinc-900/30 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">Prossima gara</p>
          <h2 className="text-2xl font-black uppercase italic">{nextRace.name}</h2>
          <p className="text-zinc-500 text-sm mt-1">{nextRace.circuit} · {nextRace.country}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black mb-1">Data</p>
          <p className="font-black text-white">{new Date(nextRace.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 rounded-[28px] flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400">🔒 Pick Chiusi</p>
              <p className="text-xs text-zinc-500 mt-1">La finestra di selezione è terminata</p>
            </div>
          </div>
        )}
      </div>

      {/* Selezione lega */}
      {leagues.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">1. Seleziona lega</p>
          <div className="flex flex-wrap gap-3">
            {leagues.map(l => (
              <button key={l.id} onClick={() => setSelectedLeague(l.id)}
                className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                  selectedLeague === l.id
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'border-white/10 text-zinc-400 hover:border-white/30'
                }`}>
                {l.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {leagues.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />
          <p className="text-xs text-yellow-300 font-bold">Devi essere in almeno una lega per fare un pick. Vai alla tab <span className="underline">Le Mie Leghe</span>.</p>
        </div>
      )}

      {/* Selezione pilota */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">2. Scegli il tuo pilota</p>
        <input
          type="text" placeholder="Cerca per nome o team..."
          value={filter} onChange={e => setFilter(e.target.value)}
          className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 mb-4 focus:outline-none focus:border-red-500/50 transition"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(driver => {
            const isSelected = selected === driver.number;
            const isPicked = existingPick?.driverNumber === driver.number;
            return (
              <motion.button
                key={driver.number}
                whileHover={{ scale: isLocked ? 1 : 1.03 }}
                whileTap={{ scale: isLocked ? 1 : 0.97 }}
                onClick={() => !isLocked && setSelected(driver.number)}
                disabled={isLocked}
                className={`relative p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10'
                    : 'border-white/5 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-white/10'
                } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isPicked && !isSelected && (
                  <span className="absolute top-2 right-2 text-[8px] font-black text-yellow-400 uppercase tracking-wide">Attuale</span>
                )}
                {isSelected && (
                  <span className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-red-400" />
                  </span>
                )}
                <div className="w-8 h-1 rounded-full mb-3" style={{ backgroundColor: driver.color }} />
                <p className="text-[10px] font-black text-white">{driver.short}</p>
                <p className="text-[9px] text-zinc-500 truncate mt-0.5">{driver.team}</p>
                <p className="text-[8px] text-zinc-700 mt-1">#{driver.number}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      {!isLocked && (
        <div className="flex flex-col items-start gap-3">
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={!selected || !selectedLeague || saving || !session}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg ${
              saved
                ? 'bg-green-600 text-white shadow-green-600/20'
                : selected && selectedLeague
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20 hover:scale-105'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> :
             saved   ? <><Check className="w-4 h-4" /> Pick Salvato!</> :
             existingPick ? <><Zap className="w-4 h-4" /> Aggiorna Pick</> :
             <><Zap className="w-4 h-4" /> Conferma Pick</>}
          </button>
          {selected && (
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              Pilota selezionato: <span className="text-white">{DRIVERS_2026.find(d => d.number === selected)?.name}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TAB: LEGHE ───────────────────────────────────────────────────────────────
function LeaguesTab({ session, leagues, setLeagues }) {
  const [mode, setMode] = useState(null); // 'create' | 'join' | null
  const [leagueName, setLeagueName] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeLeague, setActiveLeague] = useState(null);
  const [standings, setStandings] = useState([]);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!leagueName.trim() || !session) return;
    setLoading(true); setError('');
    try {
      const { leagueId, inviteCode } = await createLeague(session, leagueName.trim());
      const updated = await getUserLeagues(session); // ricarica
      setLeagues(updated);
      setSuccess(`Lega creata! Codice invito: ${inviteCode}`);
      setMode(null); setLeagueName('');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!inviteInput.trim() || !session) return;
    setLoading(true); setError('');
    try {
      const { leagueName: name } = await joinLeague(session, inviteInput.trim());
      const updated = await getUserLeagues(session);
      setLeagues(updated);
      setSuccess(`Sei entrato in "${name}"!`);
      setMode(null); setInviteInput('');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const openLeague = async (league) => {
    setActiveLeague(league);
    setStandingsLoading(true);
    try {
      const s = await getLeagueStandings(league.id);
      setStandings(s);
    } catch (e) { console.error(e); }
    finally { setStandingsLoading(false); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!session) return <LoginPrompt />;

  // Vista dettaglio lega
  if (activeLeague) {
    return (
      <div>
        <button onClick={() => setActiveLeague(null)}
          className="flex items-center gap-2 text-zinc-600 hover:text-white transition mb-6 text-[10px] font-black uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4" /> Tutte le leghe
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase italic">{activeLeague.name}</h2>
            <p className="text-zinc-600 text-sm mt-1">{activeLeague.memberCount ?? standings.length} partecipanti</p>
          </div>
          <button onClick={() => copyCode(activeLeague.inviteCode)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiato!' : activeLeague.inviteCode}
          </button>
        </div>

        {standingsLoading ? (
          <div className="flex items-center gap-3 text-zinc-600 py-12 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest">Caricamento...</span>
          </div>
        ) : (
          <div className="bg-zinc-900/40 border border-white/5 rounded-[24px] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Classifica</span>
            </div>
            {standings.length === 0 ? (
              <p className="text-center text-zinc-600 text-xs py-12">Nessun punteggio ancora — aspettate il primo GP!</p>
            ) : standings.map((member, i) => (
              <StandingsRow key={member.userId} member={member} index={i} sessionEmail={session.user.email} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Feedback */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-bold ${
              success ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}>
            {success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {success || error}
            <button onClick={() => { setSuccess(''); setError(''); }} className="ml-auto text-xs opacity-50 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Azioni */}
      <div className="flex gap-3">
        <button onClick={() => setMode(mode === 'create' ? null : 'create')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${
            mode === 'create' ? 'bg-red-600 border-red-600 text-white' : 'border-white/10 text-zinc-400 hover:border-white/30'
          }`}>
          <Plus className="w-4 h-4" /> Crea Lega
        </button>
        <button onClick={() => setMode(mode === 'join' ? null : 'join')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${
            mode === 'join' ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/10 text-zinc-400 hover:border-white/30'
          }`}>
          <LogIn className="w-4 h-4" /> Unisciti
        </button>
      </div>

      {/* Form crea */}
      <AnimatePresence>
        {mode === 'create' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="bg-zinc-900/40 border border-red-500/20 rounded-2xl p-6 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Nuova Lega</p>
              <input type="text" placeholder="Nome della lega (es. Scuderia degli Amici)"
                value={leagueName} onChange={e => setLeagueName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 transition"
              />
              <button onClick={handleCreate} disabled={loading || !leagueName.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest transition disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Crea
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'join' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="bg-zinc-900/40 border border-blue-500/20 rounded-2xl p-6 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Unisciti con codice</p>
              <input type="text" placeholder="Codice invito (es. K7X3QM)"
                value={inviteInput} onChange={e => setInviteInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                maxLength={6}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition font-mono tracking-widest uppercase"
              />
              <button onClick={handleJoin} disabled={loading || inviteInput.length < 6}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-[10px] uppercase tracking-widest transition disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Entra
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista leghe */}
      {leagues.length === 0 ? (
        <EmptyState icon={Users} title="Nessuna lega" desc="Crea la tua prima lega o unisciti a quella di un amico con il codice invito." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leagues.map((l, i) => (
            <motion.button key={l.id} onClick={() => openLeague(l)}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}
              className="text-left relative overflow-hidden rounded-[24px] border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/60 p-6 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-black uppercase text-lg italic truncate">{l.name}</p>
                  <p className="text-zinc-600 text-xs mt-1">{l.memberCount ?? '?'} membri · Codice: {l.inviteCode}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black">Il tuo score</p>
                  <p className="text-2xl font-black text-yellow-400">{l.myScore ?? 0}</p>
                </div>
              </div>
              <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TAB: REGOLAMENTO ────────────────────────────────────────────────────────
function RulesTab() {
  const autoRules = Object.entries(SCORING_RULES).filter(([, v]) => v.type === 'auto');
  const manualRules = Object.entries(SCORING_RULES).filter(([, v]) => v.type === 'manual');

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <SectionHeader icon={<Zap className="text-yellow-400 w-6 h-6" />} label="Punti Automatici" />
        <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
          Calcolati dopo ogni gara dai dati ufficiali OpenF1. Nessuna discrezionalità.
        </p>
        <div className="space-y-2">
          {autoRules.map(([key, rule]) => (
            <div key={key} className="flex items-center justify-between px-5 py-3 rounded-xl border border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40 transition">
              <span className="text-sm font-bold text-zinc-300">{rule.label}</span>
              <span className={`text-sm font-black tabular-nums ${rule.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {rule.points > 0 ? '+' : ''}{rule.points}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader icon={<Flame className="text-orange-500 w-6 h-6" />} label="Bonus & Malus Speciali" />
        <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
          Assegnati dall'admin dopo ogni gara. Sono quelli che fanno la differenza — e che fanno ridere.
        </p>
        <div className="space-y-2">
          {manualRules.map(([key, rule]) => (
            <div key={key} className="flex items-center justify-between px-5 py-3 rounded-xl border border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40 transition">
              <span className="text-sm font-bold text-zinc-300">{rule.label}</span>
              <span className={`text-sm font-black tabular-nums ${rule.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {rule.points > 0 ? '+' : ''}{rule.points}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
        <h3 className="font-black uppercase italic text-lg mb-3">📋 Regole generali</h3>
        <ul className="space-y-2 text-sm text-zinc-500 leading-relaxed">
          <li>• Il pick si chiude <strong className="text-white">1 ora prima</strong> della partenza ufficiale del GP.</li>
          <li>• Ogni utente può scegliere <strong className="text-white">un solo pilota</strong> per gara, per ogni lega.</li>
          <li>• I punteggi vengono elaborati entro <strong className="text-white">24 ore</strong> dalla fine della gara.</li>
          <li>• In caso di errori nei dati OpenF1, l'admin può correggere manualmente i punteggi.</li>
          <li>• I punti SFT della Fan Zone sono <strong className="text-white">separati</strong> dal punteggio FantaF1.</li>
        </ul>
      </div>
    </div>
  );
}

// ─── COMPONENTI CONDIVISI ────────────────────────────────────────────────────
function SectionHeader({ icon, label, action }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {icon}
      <h3 className="text-xl font-black uppercase italic tracking-tight">{label}</h3>
      <div className="flex-1 h-px bg-white/5 ml-2" />
      {action}
    </div>
  );
}

function LeagueCard({ league, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
      className="rounded-[24px] border border-white/5 bg-zinc-900/30 p-6 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-black uppercase italic truncate">{league.name}</p>
        <p className="text-zinc-600 text-xs mt-0.5">{league.memberCount ?? '?'} membri</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black">Score</p>
        <p className="text-xl font-black text-yellow-400">{league.myScore ?? 0}</p>
      </div>
    </motion.div>
  );
}

function StandingsRow({ member, index, sessionEmail }) {
  const isYou = member.email === sessionEmail;
  const medals = ['🏆', '🥈', '🥉'];
  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 ${isYou ? 'bg-yellow-500/5' : 'hover:bg-white/[0.02]'} transition`}>
      <span className="text-sm font-black w-7 text-center text-zinc-500">
        {index < 3 ? medals[index] : `#${index + 1}`}
      </span>
      {member.avatar
        ? <img src={member.avatar} className="w-8 h-8 rounded-full border border-white/10" alt={member.displayName} />
        : <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-500">{member.displayName?.[0]?.toUpperCase()}</div>
      }
      <span className="flex-1 text-sm font-bold text-zinc-300 truncate">
        {member.displayName ?? member.email?.split('@')[0]}
        {isYou && <span className="ml-2 text-[9px] text-yellow-400 font-black uppercase tracking-widest">tu</span>}
      </span>
      <span className="text-lg font-black text-yellow-400 tabular-nums">{member.fantaScore ?? 0}</span>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <Icon className="w-10 h-10 text-zinc-700" />
      <div>
        <p className="font-black uppercase italic text-zinc-500">{title}</p>
        <p className="text-zinc-700 text-sm mt-1 max-w-xs mx-auto">{desc}</p>
      </div>
      {action}
    </div>
  );
}

function LoginPrompt() {
  return (
    <EmptyState icon={Shield} title="Accesso richiesto" desc="Fai login per accedere al FantaF1."
      action={
        <Link href="/api/auth/signin"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition">
          <LogIn className="w-4 h-4" /> Accedi
        </Link>
      }
    />
  );
}