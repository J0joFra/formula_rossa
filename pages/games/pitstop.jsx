import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Coins, Trophy, Zap } from 'lucide-react';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';
import { useSession } from "next-auth/react";
import { addTokens, getTokens, initUser } from '../../lib/tokens';

// ─── RATING CONFIG ────────────────────────────────────────────────────────────
const RATINGS = [
  { max: 0.05, label: 'PERFETTO',   emoji: '🏆', color: 'text-yellow-400', glow: 'shadow-yellow-400/40', points: 1000, bg: 'from-yellow-900/40 to-black', border: 'border-yellow-500/30' },
  { max: 0.2,  label: 'OTTIMO',     emoji: '🔥', color: 'text-orange-400', glow: 'shadow-orange-400/40', points: 500,  bg: 'from-orange-900/40 to-black', border: 'border-orange-500/30' },
  { max: 0.5,  label: 'BUONO',      emoji: '✅', color: 'text-green-400',  glow: 'shadow-green-400/40',  points: 200,  bg: 'from-green-900/40 to-black',  border: 'border-green-500/30'  },
  { max: 1.0,  label: 'ACCETTABILE',emoji: '⏱️', color: 'text-blue-400',  glow: 'shadow-blue-400/40',   points: 50,   bg: 'from-blue-900/40 to-black',   border: 'border-blue-500/30'   },
  { max: Infinity, label: 'TROPPO LENTO', emoji: '💨', color: 'text-zinc-400', glow: '', points: 0, bg: 'from-zinc-900/40 to-black', border: 'border-zinc-700/30' },
];

function getRating(diff) {
  return RATINGS.find(r => diff < r.max);
}

// ─── SVG SEMAFORO ─────────────────────────────────────────────────────────────
function Semaphore({ phase }) {
  // phase: 'off' | 'red' | 'go'
  const lights = [
    { on: phase === 'red' || phase === 'go', color: phase === 'go' ? '#22c55e' : '#ef4444' },
    { on: phase === 'red' || phase === 'go', color: phase === 'go' ? '#22c55e' : '#ef4444' },
    { on: phase === 'red' || phase === 'go', color: phase === 'go' ? '#22c55e' : '#ef4444' },
    { on: phase === 'red' || phase === 'go', color: phase === 'go' ? '#22c55e' : '#ef4444' },
    { on: phase === 'red' || phase === 'go', color: phase === 'go' ? '#22c55e' : '#ef4444' },
  ];

  return (
    <div className="flex gap-3 justify-center mb-8">
      {lights.map((l, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className="w-10 h-10 rounded-full border-2 border-zinc-700 transition-all duration-150"
            style={{
              backgroundColor: l.on ? l.color : '#1a1a1a',
              boxShadow: l.on ? `0 0 16px ${l.color}88` : 'none',
            }}
          />
          <div className="w-2 h-6 bg-zinc-700 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── SVG CRONOMETRO ANALOGICO ─────────────────────────────────────────────────
function AnalogTimer({ progress, color }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - progress);
  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={r} fill="none" stroke="#27272a" strokeWidth="8" />
      <circle
        cx="65" cy="65" r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        transform="rotate(-90 65 65)"
        style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.3s' }}
      />
      <circle cx="65" cy="65" r="6" fill={color} />
    </svg>
  );
}

// ─── COMPONENTE PRINCIPALE ────────────────────────────────────────────────────
export default function PitStopGame() {
  const router = useRouter();
  const { data: session } = useSession();

  const [gameState, setGameState] = useState('idle');  // idle | countdown | running | result
  const [targetTime, setTargetTime] = useState(0);
  const [resultTime, setResultTime] = useState(0);
  const [earnedTokens, setEarnedTokens] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [rating, setRating] = useState(null);
  const [elapsedDisplay, setElapsedDisplay] = useState(0);
  const [semaphorePhase, setSemaphorePhase] = useState('off');
  const [countdown, setCountdown] = useState(3);
  const [bestTime, setBestTime] = useState(null); // best diff this session

  const startTimeRef = useRef(0);
  const rafRef = useRef();
  const countdownRef = useRef();

  // Init Firestore
  useEffect(() => {
    if (!session) return;
    const init = async () => {
      await initUser(session);
      const t = await getTokens(session);
      setTotalTokens(t);
    };
    init();
  }, [session]);

  const generateTarget = () => {
    const t = parseFloat((Math.random() * 3 + 2).toFixed(2)); // 2.00 – 5.00s
    setTargetTime(t);
  };

  useEffect(() => { generateTarget(); }, []);

  // Tick elapsed durante il gioco
  useEffect(() => {
    if (gameState !== 'running') {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = () => {
      setElapsedDisplay((Date.now() - startTimeRef.current) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameState]);

  const startSequence = () => {
    if (gameState !== 'idle') return;
    setGameState('countdown');
    setSemaphorePhase('off');
    setCountdown(3);

    let count = 3;
    // Accendi luci rosse una alla volta (simulato con un solo cambio qui)
    setTimeout(() => setSemaphorePhase('red'), 200);

    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownRef.current);
        // Lights out! Vai!
        setSemaphorePhase('go');
        setTimeout(() => {
          setSemaphorePhase('off');
          startTimeRef.current = Date.now();
          setElapsedDisplay(0);
          setGameState('running');
        }, 400);
      }
    }, 800);
  };

  const stopTimer = () => {
    if (gameState !== 'running') return;
    cancelAnimationFrame(rafRef.current);
    const duration = (Date.now() - startTimeRef.current) / 1000;
    setResultTime(duration);

    const diff = Math.abs(duration - targetTime);
    const r = getRating(diff);
    setRating(r);

    // Aggiorna best session
    if (bestTime === null || diff < bestTime) setBestTime(diff);

    // Salva token
    const save = async () => {
      if (!session) return;
      const earned = Math.floor(r.points / 10);
      setEarnedTokens(earned);
      if (earned > 0) {
        await addTokens(session, earned);
        setTotalTokens(prev => prev + earned);
      }
    };
    save();

    setGameState('result');
  };

  const handleMain = () => {
    if (gameState === 'idle') startSequence();
    else if (gameState === 'running') stopTimer();
    else if (gameState === 'result') {
      generateTarget();
      setGameState('idle');
      setSemaphorePhase('off');
      setEarnedTokens(0);
      setRating(null);
      setElapsedDisplay(0);
    }
  };

  // Barra progresso cronometro (0→1 in base a targetTime)
  const timerProgress = Math.min(elapsedDisplay / (targetTime * 1.5), 1);
  const timerColor = timerProgress < 0.6 ? '#22c55e' : timerProgress < 0.9 ? '#f59e0b' : '#ef4444';

  const mainLabel = {
    idle: '🏁 PRONTI',
    countdown: '...',
    running: '🛑 STOP!',
    result: '🔄 RIPROVA',
  }[gameState];

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans flex flex-col">
      <Navigation />

      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-24 pb-12">

        {/* BACK */}
        <div className="max-w-md w-full mb-6">
          <button onClick={() => router.push('/fanzone')} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest font-mono">Fan Zone</span>
          </button>
        </div>

        <div className="max-w-md w-full">

          {/* TITOLO */}
          <div className="text-center mb-8">
            <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Scuderia Ferrari</p>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
              Pit Stop<br /><span className="text-red-600">Challenge</span>
            </h1>
            <p className="text-zinc-600 text-xs uppercase tracking-widest mt-3">Ferma il cronometro al momento esatto</p>
          </div>

          {/* CARD PRINCIPALE */}
          <div className="bg-zinc-900/60 border border-white/8 rounded-[40px] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">

            {/* Glow decorativo */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">

              {/* ── IDLE ── */}
              {gameState === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="text-center">
                  <Semaphore phase="off" />
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-2">Obiettivo</p>
                  <div className="text-8xl font-black text-white font-mono mb-2 leading-none">
                    {targetTime.toFixed(2)}<span className="text-3xl text-red-600">s</span>
                  </div>
                  <p className="text-zinc-600 text-sm mb-6">
                    Aspetta il via, poi premi <span className="text-white font-bold">STOP</span> esattamente a <span className="text-red-400 font-bold">{targetTime}s</span>
                  </p>
                  {bestTime !== null && (
                    <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full mb-4">
                      <Trophy className="w-3 h-3 text-yellow-400" />
                      <span className="text-[10px] text-yellow-400 font-black uppercase tracking-widest">Miglior diff: {bestTime.toFixed(3)}s</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── COUNTDOWN ── */}
              {gameState === 'countdown' && (
                <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-4">
                  <Semaphore phase={semaphorePhase} />
                  <motion.div
                    key={countdown}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl font-black font-mono text-red-500 mb-4"
                  >
                    {countdown > 0 ? countdown : '🟢'}
                  </motion.div>
                  <p className="text-zinc-500 text-sm uppercase tracking-widest">Preparati...</p>
                </motion.div>
              )}

              {/* ── RUNNING ── */}
              {gameState === 'running' && (
                <motion.div key="running" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
                  <Semaphore phase="off" />
                  <div className="relative flex items-center justify-center mb-4">
                    <AnalogTimer progress={timerProgress} color={timerColor} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black font-mono" style={{ color: timerColor }}>
                        {elapsedDisplay.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-zinc-600 uppercase font-bold">secondi</span>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm italic">
                    Target: <span className="text-white font-black">{targetTime}s</span>
                  </p>
                </motion.div>
              )}

              {/* ── RESULT ── */}
              {gameState === 'result' && rating && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                    className="text-6xl mb-3"
                  >
                    {rating.emoji}
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className={`text-3xl font-black uppercase italic mb-6 ${rating.color}`}
                  >
                    {rating.label}
                  </motion.h2>

                  {/* Confronto tempi */}
                  <div className={`grid grid-cols-3 gap-3 mb-6 p-4 rounded-3xl bg-gradient-to-b ${rating.bg} border ${rating.border}`}>
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase font-black mb-1">Target</p>
                      <p className="text-xl font-black font-mono text-zinc-300">{targetTime.toFixed(2)}s</p>
                    </div>
                    <div className="border-x border-white/5 px-2">
                      <p className="text-[9px] text-zinc-500 uppercase font-black mb-1">Diff</p>
                      <p className={`text-xl font-black font-mono ${rating.color}`}>
                        {Math.abs(resultTime - targetTime).toFixed(3)}s
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase font-black mb-1">Tuo</p>
                      <p className="text-xl font-black font-mono text-white">{resultTime.toFixed(2)}s</p>
                    </div>
                  </div>

                  {/* Token */}
                  {earnedTokens > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-5 mb-4"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Coins className="text-yellow-400 w-6 h-6" />
                        <span className="text-3xl font-black text-yellow-400">+{earnedTokens} SFT</span>
                      </div>
                      <p className="text-[9px] text-yellow-500/60 uppercase font-bold tracking-widest mt-1">Accreditati</p>
                    </motion.div>
                  ) : (
                    <div className="bg-zinc-800/40 rounded-3xl p-4 mb-4">
                      <p className="text-zinc-500 text-sm">Nessun token — riprova ad avvicinarti al target!</p>
                    </div>
                  )}

                  {session && (
                    <p className="text-zinc-600 text-xs font-bold">
                      Totale wallet: <span className="text-zinc-300">{totalTokens.toLocaleString()} SFT</span>
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── BOTTONE PRINCIPALE ── */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleMain}
              disabled={gameState === 'countdown'}
              className={`mt-8 w-full py-6 rounded-2xl text-xl font-black uppercase tracking-widest transition-all shadow-xl
                ${gameState === 'idle'
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                  : gameState === 'running'
                  ? 'bg-white hover:bg-zinc-100 text-black shadow-white/10'
                  : gameState === 'countdown'
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                }`}
            >
              {mainLabel}
            </motion.button>

            {gameState === 'result' && (
              <button
                onClick={() => router.push('/fanzone')}
                className="mt-3 w-full py-3 rounded-2xl text-zinc-600 hover:text-white text-xs font-bold uppercase tracking-widest transition-all"
              >
                Torna alla Fan Zone
              </button>
            )}
          </div>

          {/* STATS BOTTOM */}
          <div className="mt-8 grid grid-cols-3 gap-4 opacity-60">
            {[
              { icon: <Zap className="w-4 h-4 text-yellow-500" />, label: 'Riflessi' },
              { icon: <Trophy className="w-4 h-4 text-red-500" />, label: 'Precisione' },
              { icon: <Coins className="w-4 h-4 text-yellow-400" />, label: 'Guadagna SFT' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 bg-zinc-900/40 rounded-2xl py-3 border border-white/5">
                {s.icon}
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Bilancio se loggato */}
          {session && (
            <p className="text-center text-zinc-700 text-[10px] font-black uppercase tracking-widest mt-5">
              Wallet: <span className="text-yellow-500">{totalTokens.toLocaleString()} SFT</span>
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
