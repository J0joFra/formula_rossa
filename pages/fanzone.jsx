import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2, Coins, Trophy, Star, Zap, ChevronLeft,
  Timer, Flame, Radio, Crown, TrendingUp, Instagram, Twitter,
  Heart, MessageCircle, Share2, ExternalLink, Bell, ChevronRight,
  Award, Target
} from 'lucide-react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';
import { useSession } from "next-auth/react";

// ─── DATI MOCK ────────────────────────────────────────────────────────────────

const LIVE_NEWS = [
  "🏎️  SF-25 conquista la pole position a Barcellona",
  "🔧  Test aerodinamici completati: +0.4s al giro rispetto all'anno scorso",
  "🏆  Leclerc: «Questa macchina è un missile»",
  "📍  Prossima gara: Gran Premio d'Australia — 16 Marzo",
  "⚡  Aggiornamento ERS confermato per il GP di Cina",
  "🎖️  Ferrari in testa al Campionato Costruttori dopo 3 gare",
];

const SOCIAL_POSTS = [
  {
    id: 1, platform: 'instagram', user: 'ScuderiaFerrari',
    avatar: 'https://i.pravatar.cc/40?img=11',
    verified: true,
    image: 'https://images.unsplash.com/photo-1608541737042-87a12275d313?w=600&q=80',
    caption: 'Rosso che brucia. SF-25 in pista durante i test di Barcellona. 🔴🐴 #Ferrari #SF25 #Formula1',
    likes: '142K', comments: '3.2K', time: '2h fa',
  },
  {
    id: 2, platform: 'twitter', user: 'Charles_Leclerc',
    avatar: 'https://i.pravatar.cc/40?img=3',
    verified: true,
    caption: 'Giornata di test incredibile. La macchina si sente davvero diversa quest\'anno. Non vedo l\'ora di vedere cosa possiamo fare in Australia. 🇦🇺❤️',
    likes: '87K', comments: '9.1K', time: '5h fa',
  },
  {
    id: 3, platform: 'instagram', user: 'ScuderiaFerrari',
    avatar: 'https://i.pravatar.cc/40?img=11',
    verified: true,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    caption: 'Dal box di Maranello con amore. Il team che lavora fino a tardi per farvi sognare. 🏭 #Maranello',
    likes: '98K', comments: '1.8K', time: '1g fa',
  },
  {
    id: 4, platform: 'twitter', user: 'Carlossainz55',
    avatar: 'https://i.pravatar.cc/40?img=12',
    verified: true,
    caption: 'Setup quasi perfetto. Dobbiamo solo sistemare qualche dettaglio nel terzo settore ma le sensazioni sono molto positive. Forza Ferrari! 🔴',
    likes: '54K', comments: '4.3K', time: '1g fa',
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'tifoso_ros91', tokens: 48200, badge: '🏆', avatar: 'https://i.pravatar.cc/32?img=5' },
  { rank: 2, name: 'ferrari_forever', tokens: 41500, badge: '🥈', avatar: 'https://i.pravatar.cc/32?img=8' },
  { rank: 3, name: 'maranello_kid', tokens: 38900, badge: '🥉', avatar: 'https://i.pravatar.cc/32?img=15' },
  { rank: 4, name: 'sf25_fan', tokens: 31200, badge: '⭐', avatar: 'https://i.pravatar.cc/32?img=20' },
  { rank: 5, name: 'leclerc16_it', tokens: 28700, badge: '⭐', avatar: 'https://i.pravatar.cc/32?img=22' },
  { rank: 6, name: 'cavallino_rmp', tokens: 22300, badge: '⭐', avatar: 'https://i.pravatar.cc/32?img=25' },
];

// ─── COMPONENTE PRINCIPALE ────────────────────────────────────────────────────

export default function FanZonePage() {
  const { data: session } = useSession();
  const [tokens, setTokens] = useState(0);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [likedPosts, setLikedPosts] = useState({});
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [dailyCountdown, setDailyCountdown] = useState('');

  // Token
  useEffect(() => {
    const saved = localStorage.getItem(`tokens_${session?.user?.email}`) || '1250';
    setTokens(parseInt(saved));
  }, [session]);

  // Ticker news
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(i => (i + 1) % LIVE_NEWS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Countdown midnight
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

  const toggleLike = (id) => setLikedPosts(p => ({ ...p, [id]: !p[id] }));

  const claimDaily = () => {
    if (!dailyClaimed) {
      setTokens(t => t + 75);
      setDailyClaimed(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans overflow-x-hidden">
      <Navigation activeSection="fanzone" />

      {/* LIVE NEWS TICKER */}
      <div className="fixed top-[64px] left-0 right-0 z-40 bg-red-600 overflow-hidden h-8 flex items-center">
        <div className="flex items-center gap-2 px-4 shrink-0 bg-black/40 h-full pr-4">
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest">LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden relative h-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={tickerIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center px-4 text-[11px] font-bold tracking-wide whitespace-nowrap"
            >
              {LIVE_NEWS[tickerIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pt-36 pb-24">

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

          {/* TOKEN CARD */}
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

        {/* ── DAILY CHALLENGE ─────────────────────────────────────────────── */}
        <section className="mb-24">
          <SectionHeader icon={<Target className="text-orange-500 w-7 h-7" />} label="Daily Challenge" />
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-[40px] border border-orange-500/20 bg-gradient-to-r from-zinc-900 via-black to-zinc-900 p-10 flex flex-col md:flex-row items-center gap-8"
          >
            {/* BG glow */}
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
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Si resetta tra</p>
                <p className="text-2xl font-black font-mono text-orange-400 tabular-nums">{dailyCountdown}</p>
              </div>
              <button
                onClick={claimDaily}
                disabled={dailyClaimed}
                className={`px-8 py-4 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-lg ${
                  dailyClaimed
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:scale-105 shadow-orange-500/20 hover:shadow-orange-500/40'
                }`}
              >
                {dailyClaimed ? '✓ Riscattato' : 'Riscatta +75 SFT'}
              </button>
            </div>
          </motion.div>
        </section>

        {/* ── PLAY & EARN ──────────────────────────────────────────────────── */}
        <section className="mb-24">
          <SectionHeader icon={<Gamepad2 className="text-red-600 w-7 h-7" />} label="Play & Earn" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GameCard title="Pit Stop Challenge" reward="50" icon={Timer} color="from-red-600 to-red-800" desc="Testa i tuoi riflessi al semaforo. Sii veloce come i meccanici al box." link="/games/pitstop" />
            <GameCard title="Circuit Rush" reward="150" icon={Zap} color="from-blue-500 to-blue-800" desc="Sfreccia in pista e schiva i detriti. Più corri veloce, più SFT guadagni." link="/games/circuit-rush" featured />
            <GameCard title="F1 Trivia" reward="30" icon={Award} color="from-yellow-500 to-yellow-700" desc="Dimostra di conoscere ogni bullone della storia della Scuderia Ferrari." link="/games/trivia" />
          </div>
        </section>

        {/* ── SOCIAL WALL + LEADERBOARD ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">

          {/* SOCIAL WALL */}
          <div className="lg:col-span-2">
            <SectionHeader icon={<TrendingUp className="text-pink-500 w-7 h-7" />} label="Social Wall" />
            <div className="flex flex-col gap-5">
              {SOCIAL_POSTS.map((post, i) => (
                <SocialCard key={post.id} post={post} liked={likedPosts[post.id]} onLike={() => toggleLike(post.id)} index={i} />
              ))}
            </div>
          </div>

          {/* LEADERBOARD */}
          <div>
            <SectionHeader icon={<Trophy className="text-yellow-500 w-7 h-7" />} label="Classifica" />
            <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] overflow-hidden">
              {LEADERBOARD.map((player, i) => (
                <LeaderboardRow key={player.rank} player={player} index={i} isYou={session?.user?.name && player.name === session?.user?.name?.toLowerCase()} />
              ))}
              {session && (
                <div className="p-4 border-t border-white/5 bg-yellow-500/5">
                  <p className="text-center text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                    La tua posizione: <span className="text-yellow-500">#42</span> — {tokens.toLocaleString()} SFT
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────

function SectionHeader({ icon, label }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {icon}
      <h3 className="text-2xl font-black uppercase italic tracking-tight">{label}</h3>
      <div className="flex-1 h-px bg-white/5 ml-2" />
    </div>
  );
}

// ─── GAME CARD ────────────────────────────────────────────────────────────────

function GameCard({ title, reward, icon: Icon, color, desc, link, featured }) {
  return (
    <Link href={link}>
      <motion.div
        whileHover={{ y: -4 }}
        className={`relative flex flex-col items-center p-10 rounded-[40px] cursor-pointer overflow-hidden h-full transition-all
          ${featured
            ? 'border border-blue-500/30 bg-gradient-to-b from-blue-950/40 to-black shadow-xl shadow-blue-500/5'
            : 'border border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40'
          }`}
      >
        {featured && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Popular
          </div>
        )}
        <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-3xl flex items-center justify-center mb-8 shadow-xl relative z-10`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
        <h4 className="text-xl font-black uppercase italic mb-3 text-center">{title}</h4>
        <p className="text-zinc-500 text-sm mb-8 text-center leading-relaxed">{desc}</p>
        <div className="mt-auto flex items-center gap-2 px-5 py-2 bg-white/5 rounded-full border border-white/10 group-hover:bg-yellow-500 transition-colors">
          <Coins className="w-3 h-3 text-yellow-500" />
          <span className="text-yellow-500 font-black text-[10px] uppercase tracking-widest">+{reward} SFT</span>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── SOCIAL CARD ──────────────────────────────────────────────────────────────

function SocialCard({ post, liked, onLike, index }) {
  const isIG = post.platform === 'instagram';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="bg-zinc-900/30 border border-white/5 rounded-[28px] overflow-hidden hover:border-white/10 transition-all"
    >
      {/* POST HEADER */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <img src={post.avatar} className="w-9 h-9 rounded-full border border-white/10" alt={post.user} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black">@{post.user}</span>
              {post.verified && <span className="text-[10px] text-blue-400">✓</span>}
            </div>
            <span className="text-[10px] text-zinc-600">{post.time}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
          ${isIG ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
          {isIG ? <Instagram className="w-3 h-3" /> : <Twitter className="w-3 h-3" />}
          {isIG ? 'Instagram' : 'Twitter'}
        </div>
      </div>

      {/* CAPTION */}
      <p className="px-5 pb-3 text-sm text-zinc-300 leading-relaxed">{post.caption}</p>

      {/* IMAGE */}
      {post.image && (
        <div className="mx-5 mb-3 rounded-2xl overflow-hidden">
          <img src={post.image} className="w-full h-48 object-cover" alt="" />
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center gap-5 px-5 pb-5 pt-1">
        <button onClick={onLike} className="flex items-center gap-1.5 group">
          <Heart className={`w-4 h-4 transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-zinc-500 group-hover:text-red-400'}`} />
          <span className={`text-[11px] font-bold ${liked ? 'text-red-500' : 'text-zinc-500'}`}>{post.likes}</span>
        </button>
        <button className="flex items-center gap-1.5 group">
          <MessageCircle className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
          <span className="text-[11px] font-bold text-zinc-500">{post.comments}</span>
        </button>
        <button className="flex items-center gap-1.5 group ml-auto">
          <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
          <span className="text-[10px] text-zinc-600 group-hover:text-white transition-colors font-bold uppercase tracking-wider">Vedi originale</span>
        </button>
      </div>
    </motion.div>
  );
}

// ─── LEADERBOARD ROW ──────────────────────────────────────────────────────────

function LeaderboardRow({ player, index, isYou }) {
  const rankColors = ['text-yellow-400', 'text-zinc-300', 'text-amber-600'];
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className={`flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 transition-all
        ${isYou ? 'bg-yellow-500/10' : 'hover:bg-white/3'}`}
    >
      <span className={`text-sm font-black w-5 text-center ${rankColors[index] ?? 'text-zinc-600'}`}>
        {player.rank <= 3 ? player.badge : `#${player.rank}`}
      </span>
      <img src={player.avatar} className="w-7 h-7 rounded-full" alt={player.name} />
      <span className="flex-1 text-sm font-bold text-zinc-300 truncate">{player.name}</span>
      <div className="flex items-center gap-1">
        <Coins className="w-3 h-3 text-yellow-500" />
        <span className="text-[11px] font-black text-yellow-400 tabular-nums">{player.tokens.toLocaleString()}</span>
      </div>
    </motion.div>
  );
}