import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, CheckCircle, XCircle, Timer, Zap,
  ChevronRight, RefreshCw, Loader2, AlertTriangle,
  Flame, Star, ChevronLeft
} from 'lucide-react';
import { useSession } from "next-auth/react";
import { addTokens, getTokens, initUser } from '../../lib/tokens';

// ─── DIFFICOLTÀ ───────────────────────────────────────────────────────────────
const DIFF_CONFIG = {
  Easy:   { color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30',  dot: 'bg-green-400'  },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', dot: 'bg-yellow-400' },
  Hard:   { color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30',    dot: 'bg-red-400'    },
};

// ─── LOADING ──────────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-red-600 font-black tracking-[0.3em] uppercase text-sm">Caricamento domande...</p>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPALE ────────────────────────────────────────────────────
export default function F1TriviaQuiz() {
  const router = useRouter();
  const { data: session } = useSession();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('intro');   // intro | playing | result
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [userTokens, setUserTokens] = useState(0);
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeExpired, setTimeExpired] = useState(false);
  const [tokensEarned, setTokensEarned] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const maxStreakRef = useRef(0);

  // Carica domande
  useEffect(() => {
    fetch('/data/trivia-questions.json')
      .then(r => r.json())
      .then(data => {
        const shuffled = [...(data.questions || [])].sort(() => Math.random() - 0.5).slice(0, 10);
        setQuestions(shuffled);
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, []);

  // Init Firestore
  useEffect(() => {
    if (!session) return;
    initUser(session).then(() => getTokens(session).then(setUserTokens));
  }, [session]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || selected !== null || timeExpired) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setTimeExpired(true);
          finishGame(scoreRef.current, maxStreakRef.current, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, current, selected, timeExpired]);

  const startGame = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    scoreRef.current = 0;
    streakRef.current = 0;
    maxStreakRef.current = 0;
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCurrent(0);
    setSelected(null);
    setTimeLeft(15);
    setHistory([]);
    setTimeExpired(false);
    setPhase('playing');
  };

  const handleAnswer = (idx) => {
    if (selected !== null || timeExpired) return;
    const q = questions[current];
    const isCorrect = idx === q.correct;
    const pts = isCorrect ? q.points : 0;
    const speedBonus = timeLeft > 10 ? Math.floor(q.points * 0.2) : 0;
    const total = pts + speedBonus;

    if (isCorrect) {
      streakRef.current += 1;
      if (streakRef.current > maxStreakRef.current) maxStreakRef.current = streakRef.current;
      setStreak(streakRef.current);
      setMaxStreak(maxStreakRef.current);
    } else {
      streakRef.current = 0;
      setStreak(0);
    }

    scoreRef.current += total;
    setScore(scoreRef.current);
    setSelected(idx);
    setHistory(prev => [...prev, { correct: isCorrect, points: total, speedBonus }]);

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1);
        setSelected(null);
        setTimeLeft(15);
      } else {
        finishGame(scoreRef.current, maxStreakRef.current, false);
      }
    }, 1600);
  };

  const finishGame = async (sc, ms, expired) => {
    const streakBonus = ms * 10;
    const raw = sc + streakBonus;
    const penalty = expired ? Math.floor(raw * 0.3) : 0;
    const adj = Math.max(0, raw - penalty);
    const earned = 30 + Math.floor(adj / 10);

    setFinalScore(adj);
    setTokensEarned(earned);
    setPhase('result');

    if (session) {
      await addTokens(session, earned);
      setUserTokens(prev => prev + earned);
    }
  };

  const q = questions[current];
  const timerPct = timeLeft / 15;
  const timerColor = timeLeft > 10 ? '#22c55e' : timeLeft > 5 ? '#f59e0b' : '#ef4444';
  const diff = q ? DIFF_CONFIG[q.difficulty] ?? DIFF_CONFIG.Medium : null;

  if (loading) return <LoadingScreen />;
  if (questions.length === 0) return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navigation />
      <main className="max-w-2xl mx-auto pt-32 px-4 text-center">
        <p className="text-zinc-400 mb-6">Domande non disponibili.</p>
        <button onClick={() => router.push('/fanzone')} className="bg-red-600 px-8 py-4 rounded-2xl font-black uppercase">Torna alla Fan Zone</button>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans">
      <Navigation />

      <main className="max-w-3xl mx-auto pt-28 px-4 pb-20">

        {/* BACK */}
        <div className="mb-8">
          <button onClick={() => router.push('/fanzone')} className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Fan Zone</span>
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* ══════════════ INTRO ══════════════ */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

              {/* Header */}
              <div className="text-center mb-12">
                <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.5em] mb-3">Scuderia Ferrari</p>
                <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-4">
                  F1<br /><span className="text-red-600">Trivia</span>
                </h1>
                <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
                  15 secondi per rispondere. Rispondi veloce per il bonus velocità. Sbaglia e perdi lo streak.
                </p>
              </div>

              {/* Regole */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  { icon: <Timer className="w-6 h-6 text-red-500" />, title: '15 sec', sub: 'per domanda' },
                  { icon: <Flame className="w-6 h-6 text-orange-400" />, title: 'Streak', sub: '+10 pts bonus' },
                  { icon: <Zap className="w-6 h-6 text-yellow-400" />, title: 'Velocità', sub: '+20% se <5s' },
                ].map((r, i) => (
                  <div key={i} className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 text-center">
                    <div className="flex justify-center mb-3">{r.icon}</div>
                    <p className="font-black text-white text-sm">{r.title}</p>
                    <p className="text-zinc-600 text-[10px] uppercase tracking-wider mt-1">{r.sub}</p>
                  </div>
                ))}
              </div>

              {/* Wallet */}
              {session && (
                <div className="flex items-center justify-center gap-2 mb-8 bg-yellow-500/10 border border-yellow-500/20 rounded-full py-2 px-6 w-fit mx-auto">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-black text-sm">{userTokens.toLocaleString()} SFT</span>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={startGame}
                className="w-full py-6 bg-red-600 hover:bg-red-500 text-white rounded-3xl text-xl font-black uppercase tracking-widest shadow-2xl shadow-red-600/20 transition-all"
              >
                🏎️ Accetta la Sfida
              </motion.button>
            </motion.div>
          )}

          {/* ══════════════ PLAYING ══════════════ */}
          {phase === 'playing' && q && (
            <motion.div key={`q-${current}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>

              {/* HUD */}
              <div className="flex items-center justify-between mb-6">
                {/* Progresso */}
                <div className="flex items-center gap-2">
                  {questions.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${
                      i < current ? 'bg-red-600 w-6' :
                      i === current ? 'bg-white w-8' :
                      'bg-zinc-800 w-4'
                    }`} />
                  ))}
                </div>

                {/* Streak */}
                {streak > 0 && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full"
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-orange-400 font-black text-xs">{streak}x</span>
                  </motion.div>
                )}

                {/* Score */}
                <div className="font-black text-white tabular-nums">
                  {score} <span className="text-zinc-600 text-xs font-bold">pts</span>
                </div>
              </div>

              {/* Timer bar */}
              <div className="relative h-2 bg-zinc-800 rounded-full mb-8 overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ backgroundColor: timerColor }}
                  initial={{ width: '100%' }}
                  animate={{ width: `${timerPct * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>

              {/* Meta domanda */}
              <div className="flex items-center justify-between mb-5">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black ${diff.bg} ${diff.border} border ${diff.color}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                  {q.difficulty} · {q.points} pts
                </div>
                <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">{q.category}</span>
                <div className={`font-black font-mono text-lg tabular-nums transition-colors`} style={{ color: timerColor }}>
                  {timeLeft}s
                </div>
              </div>

              {/* Domanda */}
              <h2 className="text-2xl md:text-3xl font-black leading-snug mb-8">{q.question}</h2>

              {/* Opzioni */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.correct;
                  const isSelected = i === selected;
                  let cls = 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900';
                  if (selected !== null) {
                    if (isCorrect) cls = 'bg-green-900/30 border-green-500';
                    else if (isSelected) cls = 'bg-red-900/30 border-red-500';
                    else cls = 'bg-zinc-900/30 border-zinc-800 opacity-50';
                  }

                  return (
                    <motion.button
                      key={i}
                      whileHover={selected === null ? { scale: 1.02 } : {}}
                      whileTap={selected === null ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(i)}
                      disabled={selected !== null}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all ${cls}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${
                          selected === null ? 'bg-zinc-800 text-zinc-400' :
                          isCorrect ? 'bg-green-600 text-white' :
                          isSelected ? 'bg-red-600 text-white' :
                          'bg-zinc-800 text-zinc-600'
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="font-bold text-sm leading-snug">{opt}</span>
                        {selected !== null && isCorrect && <CheckCircle className="w-5 h-5 text-green-400 ml-auto shrink-0" />}
                        {selected !== null && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 ml-auto shrink-0" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {selected !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-2xl border ${selected === q.correct
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-red-900/20 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {selected === q.correct
                        ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                        : <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      }
                      <div>
                        <p className={`font-black text-sm mb-1 ${selected === q.correct ? 'text-green-400' : 'text-red-400'}`}>
                          {selected === q.correct ? `Corretto! +${history[history.length - 1]?.points} pts` : `Risposta errata`}
                        </p>
                        {selected !== q.correct && (
                          <p className="text-zinc-400 text-xs mb-1">
                            Risposta corretta: <span className="text-white font-bold">{q.options[q.correct]}</span>
                          </p>
                        )}
                        <p className="text-zinc-500 text-xs leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Alert tempo */}
              <AnimatePresence>
                {timeLeft <= 5 && selected === null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 flex items-center justify-center gap-2 bg-red-900/30 border border-red-500/40 rounded-2xl py-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                    <span className="text-red-300 font-black text-sm uppercase tracking-widest">Solo {timeLeft}s!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ══════════════ RESULT ══════════════ */}
          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>

              {/* Titolo */}
              <div className="text-center mb-10">
                {timeExpired
                  ? <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-4 animate-pulse" />
                  : <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                }
                <h2 className="text-5xl font-black uppercase italic mb-2">
                  {timeExpired ? 'Tempo!' : 'Completato!'}
                </h2>
                <p className="text-zinc-500 text-sm uppercase tracking-widest">
                  {history.filter(h => h.correct).length}/{history.length} risposte corrette
                </p>
              </div>

              {/* Score grande */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-8 mb-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none" />
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black mb-2">Punteggio Finale</p>
                <p className={`text-7xl font-black font-mono mb-4 ${timeExpired ? 'text-red-400' : 'text-white'}`}>
                  {finalScore}
                </p>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-zinc-600 text-[9px] uppercase font-black mb-1">Max Streak</p>
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span className="font-black text-white">{maxStreak}x</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-zinc-600 text-[9px] uppercase font-black mb-1">Accuratezza</p>
                    <span className="font-black text-white">
                      {history.length > 0 ? Math.round((history.filter(h => h.correct).length / history.length) * 100) : 0}%
                    </span>
                  </div>
                  <div>
                    <p className="text-zinc-600 text-[9px] uppercase font-black mb-1">Bonus velocità</p>
                    <span className="font-black text-yellow-400">
                      +{history.reduce((s, h) => s + (h.speedBonus || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Token */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-6 mb-6 text-center"
              >
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black mb-2">SFT Guadagnati</p>
                <p className="text-4xl font-black text-yellow-400">+{tokensEarned} SFT</p>
                {session && (
                  <p className="text-yellow-500/50 text-xs font-bold mt-1">
                    Totale wallet: {userTokens.toLocaleString()} SFT
                  </p>
                )}
              </motion.div>

              {/* CTA */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={startGame}
                  className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-600/20"
                >
                  <RefreshCw className="w-5 h-5" /> Rigioca
                </button>
                <button
                  onClick={() => router.push('/fanzone')}
                  className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all border border-white/5"
                >
                  <ChevronRight className="w-4 h-4" /> Fan Zone
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
