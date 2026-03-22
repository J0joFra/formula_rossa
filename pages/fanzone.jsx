import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2, Coins, Trophy, Zap, ChevronLeft,
  Timer, Flame, Radio, Award, Target, Loader2,
  Flag, ChevronRight
} from 'lucide-react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import FantaF1 from '../components/ferrari/FantaF1';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { getTokens, initUser, claimDailyBonus, hasDailyClaimed, getLeaderboard } from '../lib/tokens';

const LIVE_NEWS = [
  "🏎️  SF-25 conquista la pole position a Barcellona",
  "🔧  Test aerodinamici completati: +0.4s al giro rispetto all'anno scorso",
  "🏆  Leclerc: «Questa macchina è un missile»",
  "📍  Prossima gara: Gran Premio d'Australia — 16 Marzo",
  "⚡  Aggiornamento ERS confermato per il GP di Cina",
  "🎖️  Ferrari in testa al Campionato Costruttori dopo 3 gare",
];

export default function FanZonePage() {
  const { data: session } = useSession();
  const [tokens, setTokens] = useState(0);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [dailyCountdown, setDailyCountdown] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  // Inizializza utente e carica token da Firestore
  useEffect(() => {
    if (!session) return;
    const init = async () => {
      await initUser(session);
      const [t, claimed] = await Promise.all([
        getTokens(session),
        hasDailyClaimed(session), // ← controlla Firestore, non solo stato locale
      ]);
      setTokens(t);
      setDailyClaimed(claimed);
    };
    init();
  }, [session]);

  // Carica leaderboard da Firestore
  useEffect(() => {
    const load = async () => {
      setLeaderboardLoading(true);
      try {
        const data = await getLeaderboard(10);
        setLeaderboard(data);
        if (session?.user?.email) {
          const idx = data.findIndex(p => p.email === session.user.email);
          setUserRank(idx !== -1 ? idx + 1 : null);
        }
      } catch (e) {
        console.error('Errore leaderboard:', e);
      } finally {
        setLeaderboardLoading(false);
      }
    };
    load();
  }, [session]);

  // Ticker news
  useEffect(() => {
    const interval = setInterval(() => setTickerIndex(i => (i + 1) % LIVE_NEWS.length), 4000);
    return () => clearInterval(interval);
  }, []);

  // Countdown mezzanotte
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setDailyCountdown(`${h}:${m}:${s}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const claimDaily = async () => {
    if (dailyClaimed || !session) return;
    const success = await claimDailyBonus(session, 75); // ← salva data su Firestore
    if (success) {
      setTokens(t => t + 75);
      setDailyClaimed(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans overflow-x-hidden">
      <Navigation activeSection="fanzone" />

      {/* LIVE TICKER — navbar è h-16 (64px), ticker subito sotto */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-red-600 h-7 flex items-center overflow-hidden">
        <div className="flex items-center gap-2 px-3 shrink-0 bg-black/40 h-full">
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest">LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden relative h-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={tickerIndex}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 flex items-center px-4 text-[11px] font-bold tracking-wide whitespace-nowrap"
            >
              {LIVE_NEWS[tickerIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* pt = navbar (64px) + ticker (28px) + gap (16px) = 108px */}
      <main className="max-w-7xl mx-auto px-4 pt-[108px] pb-24">

        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <Link href="/" className="group inline-flex items-center gap-2 text-zinc-600 hover:text-red-500 transition-all">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Torna alla Home</span>
          </Link>
          {session && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <span className="text-[10px] font-black uppercase text-zinc-400">Status: <span className="text-green-500">Online</span></span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </motion.div>
          )}
        </div>

        {/* HEADER + TOKEN BALANCE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 items-center">
          <div className="lg:col-span-2">
            {session ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-6 mb-4">
                <img src={session.user.image} className="w-16 h-16 rounded-2xl border-2 border-red-600 shadow-xl" alt="profile" />
                <div>
                  <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                    Ciao, <span className="text-red-600">{session.user.name.split(' ')[0]}</span>
                  </h1>
                  <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Maranello Gaming Division</p>
                </div>
              </motion.div>
            ) : (
              <div>
                <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-4">
                  Fan <span className="text-red-600">Zone</span>
                </h1>
                <p className="text-red-500 font-black uppercase text-[10px] tracking-widest bg-red-600/10 inline-block px-3 py-1 rounded">
                  Effettua il login per salvare i progressi
                </p>
              </div>
            )}
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-zinc-900 to-black border border-yellow-500/30 p-8 rounded-[32px] shadow-2xl flex items-center gap-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
              <Coins className="w-24 h-24 text-yellow-500" />
            </div>
            <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20 relative z-10 shrink-0">
              <Coins className="text-black w-8 h-8" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Bilancio Attuale</p>
              <p className="text-4xl font-black text-white tabular-nums">
                {tokens.toLocaleString()} <span className="text-xs text-yellow-500 uppercase font-mono">SFT</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* DAILY CHALLENGE */}
        <section className="mb-24">
          <SectionHeader icon={<Target className="text-orange-500 w-7 h-7" />} label="Daily Challenge" />
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-[40px] border border-orange-500/20 bg-gradient-to-r from-zinc-900 via-black to-zinc-900 p-10 flex flex-col md:flex-row items-center gap-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-red-600/5 pointer-events-none" />
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/20 shrink-0 relative z-10">
              <Flame className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1 relative z-10 text-center md:text-left">
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Sfida del Giorno</p>
              <h3 className="text-2xl md:text-3xl font-black uppercase italic mb-2">Gioca 3 partite oggi</h3>
              <p className="text-zinc-500 text-sm">Completa 3 partite in qualsiasi gioco per sbloccare il bonus giornaliero.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="text-center">
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-1">{dailyClaimed ? "Torna domani tra" : "Si resetta tra"}</p>
                <p className="text-2xl font-black font-mono text-orange-400 tabular-nums">{dailyCountdown}</p>
              </div>
              <button
                onClick={claimDaily}
                disabled={dailyClaimed || !session}
                className={`px-8 py-4 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-lg ${
                  dailyClaimed || !session
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:scale-105 shadow-orange-500/20 hover:shadow-orange-500/40'
                }`}
              >
                {!session ? 'Login richiesto' : dailyClaimed ? '✓ Già riscattato oggi' : 'Riscatta +75 SFT'}
              </button>
            </div>
          </motion.div>
        </section>

        {/* PLAY & EARN */}
        <section className="mb-24">
          <SectionHeader icon={<Gamepad2 className="text-red-600 w-7 h-7" />} label="Play & Earn" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GameCard title="Pit Stop Challenge" reward="50" icon={Timer} color="from-red-600 to-red-800" desc="Testa i tuoi riflessi al semaforo. Sii veloce come i meccanici al box." link="/games/pitstop" />
            <GameCard title="Circuit Rush" reward="150" icon={Zap} color="from-blue-500 to-blue-800" desc="Sfreccia in pista e schiva i detriti. Più corri veloce, più SFT guadagni." link="/games/circuit-rush" featured />
            <GameCard title="F1 Trivia" reward="30" icon={Award} color="from-yellow-500 to-yellow-700" desc="Dimostra di conoscere ogni bullone della storia della Scuderia Ferrari." link="/games/trivia" />
          </div>
        </section>
        <FantaF1 />
        {/* LEADERBOARD */}
        <section className="mb-24">
        <SectionHeader icon={<Flag className="text-red-500 w-7 h-7" />} label="FantaF1" />
        <Link href="/fantaf1">
          <motion.div
            whileHover={{ y: -3 }}
            className="relative overflow-hidden rounded-[40px] border border-red-500/20 bg-gradient-to-r from-red-950/30 via-black to-zinc-900/60 p-10 cursor-pointer group"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(220,38,38,0.07),transparent_60%)] pointer-events-none" />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.02]"
              style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
      
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Icon */}
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-2xl shadow-red-600/20 shrink-0">
                <Flag className="w-10 h-10 text-white" />
              </div>
      
              {/* Text */}
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-2">🏎️ Season 2026 · Nuovo!</p>
                <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-2">
                  Fanta<span className="text-red-600">F1</span>
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
                  Scegli il tuo pilota prima di ogni GP. Accumula punti con pit stop record, team radio epici e strategie suicide del muretto. Sfida i tuoi amici nella tua lega privata.
                </p>
      
                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {['🏆 Leghe private', '⚡ Pick pre-gara', '📻 Bonus ironici', '🔥 Classifica live'].map(f => (
                    <span key={f} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-zinc-400">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
      
              {/* CTA */}
              <div className="shrink-0 flex items-center gap-2 px-6 py-3 bg-red-600 group-hover:bg-red-500 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-red-600/20">
                Gioca ora
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        </Link>
      </section>
      </main>
      <Footer />
    </div>
  );
}

function SectionHeader({ icon, label }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {icon}
      <h3 className="text-2xl font-black uppercase italic tracking-tight">{label}</h3>
      <div className="flex-1 h-px bg-white/5 ml-2" />
    </div>
  );
}

function GameCard({ title, reward, icon: Icon, color, desc, link, featured }) {
  return (
    <Link href={link}>
      <motion.div
        whileHover={{ y: -4 }}
        className={`relative flex flex-col items-center p-10 rounded-[40px] cursor-pointer overflow-hidden h-full transition-all
          ${featured
            ? 'border border-blue-500/30 bg-gradient-to-b from-blue-950/40 to-black shadow-xl shadow-blue-500/5'
            : 'border border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40'}`}
      >
        {featured && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Popular
          </div>
        )}
        <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-3xl flex items-center justify-center mb-8 shadow-xl`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
        <h4 className="text-xl font-black uppercase italic mb-3 text-center">{title}</h4>
        <p className="text-zinc-500 text-sm mb-8 text-center leading-relaxed">{desc}</p>
        <div className="mt-auto flex items-center gap-2 px-5 py-2 bg-white/5 rounded-full border border-white/10">
          <Coins className="w-3 h-3 text-yellow-500" />
          <span className="text-yellow-500 font-black text-[10px] uppercase tracking-widest">+{reward} SFT</span>
        </div>
      </motion.div>
    </Link>
  );
}

function LeaderboardRow({ player, index, isYou }) {
  const badges = ['🏆', '🥈', '🥉'];
  const rankColors = ['text-yellow-400', 'text-zinc-300', 'text-amber-600'];
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 transition-all
        ${isYou ? 'bg-yellow-500/10' : 'hover:bg-white/[0.02]'}`}
    >
      <span className={`text-sm font-black w-6 text-center ${rankColors[index] ?? 'text-zinc-600'}`}>
        {index < 3 ? badges[index] : `#${player.rank}`}
      </span>
      {player.avatar
        ? <img src={player.avatar} className="w-8 h-8 rounded-full border border-white/10" alt={player.name} />
        : <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-500">{player.name?.[0]?.toUpperCase()}</div>
      }
      <span className="flex-1 text-sm font-bold text-zinc-300 truncate">
        {player.name ?? player.email?.split('@')[0]}
        {isYou && <span className="ml-2 text-[9px] text-yellow-500 font-black uppercase tracking-widest">tu</span>}
      </span>
      <div className="flex items-center gap-1">
        <Coins className="w-3 h-3 text-yellow-500" />
        <span className="text-[11px] font-black text-yellow-400 tabular-nums">{player.tokens.toLocaleString()}</span>
      </div>
    </motion.div>
  );
}