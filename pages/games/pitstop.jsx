import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  Zap, 
  Target, 
  RefreshCw,
  ChevronRight,
  Trophy,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Gauge,
  Award
} from 'lucide-react';
import { useSession } from "next-auth/react";

export default function PitStopChallenge() {
  const router = useRouter();
  const { data: session } = useSession();
  
  // STATI DEL GIOCO
  const [gameState, setGameState] = useState('idle'); // 'idle', 'ready', 'countdown', 'waiting', 'reaction', 'result'
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [userTokens, setUserTokens] = useState(0);
  
  // TIMER E TEMPI
  const [countdown, setCountdown] = useState(3);
  const [targetTime, setTargetTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [gameTimer, setGameTimer] = useState(15);
  const [timeStarted, setTimeStarted] = useState(null);
  const [timeStopped, setTimeStopped] = useState(null);
  
  // STATISTICHE
  const [attempts, setAttempts] = useState([]);
  const [averageDiff, setAverageDiff] = useState(0);
  const [consecutiveHits, setConsecutiveHits] = useState(0);
  const [maxConsecutive, setMaxConsecutive] = useState(0);
  
  // REF PER TIMER
  const timerRef = useRef(null);
  const reactionStartRef = useRef(null);
  
  // Caricamento token utente
  useEffect(() => {
    if (session) {
      const saved = localStorage.getItem(`tokens_${session.user?.email}`) || '1250';
      setUserTokens(parseInt(saved));
    }
  }, [session]);

  // GENERA TEMPO TARGET CASUALE (tra 2 e 5 secondi)
  const generateTargetTime = () => {
    // Tempo in millisecondi con centesimi e millesimi
    const min = 2000; // 2 secondi
    const max = 5000; // 5 secondi
    const randomMs = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Aggiungi centesimi e millesimi casuali
    const hundredths = Math.floor(Math.random() * 100); // 0-99
    const thousandths = Math.floor(Math.random() * 10); // 0-9
    
    // Calcola tempo totale in millisecondi
    const totalMs = randomMs + (hundredths * 10) + thousandths;
    
    // Formatta per visualizzazione
    const seconds = Math.floor(totalMs / 1000);
    const remainingMs = totalMs % 1000;
    const hundredthsPart = Math.floor(remainingMs / 10);
    const thousandthsPart = remainingMs % 10;
    
    return {
      totalMs,
      display: `${seconds}.${hundredthsPart.toString().padStart(2, '0')}${thousandthsPart}s`
    };
  };

  // CALCOLA PUNTEGGIO BASATO SULLA DIFFERENZA
  const calculateScore = (targetMs, reactionMs) => {
    const diffMs = Math.abs(reactionMs - targetMs);
    const diffSeconds = diffMs / 1000;
    
    // SISTEMA A RANGE CON BONUS/MALUS ESPONENZIALE
    
    if (diffSeconds <= 0.001) { // PERFEZIONE (entro 1 millesimo)
      return {
        points: 1000,
        bonus: 500,
        multiplier: 3.0,
        message: "PERFEZIONE ASSOLUTA! ⭐⭐⭐",
        rating: "legendary"
      };
    } else if (diffSeconds <= 0.01) { // FANTASTICO (entro 10 millesimi)
      return {
        points: 800,
        bonus: Math.floor(400 * (1 - diffSeconds / 0.01)),
        multiplier: 2.5,
        message: "FANTASTICO! Riflessi da campione!",
        rating: "perfect"
      };
    } else if (diffSeconds <= 0.05) { // ECCELLENTE (entro 50 millesimi)
      return {
        points: 600,
        bonus: Math.floor(300 * (1 - diffSeconds / 0.05)),
        multiplier: 2.0,
        message: "ECCELLENTE! Precisione incredibile!",
        rating: "excellent"
      };
    } else if (diffSeconds <= 0.1) { // OTTIMO (entro 100 millesimi)
      return {
        points: 400,
        bonus: Math.floor(200 * (1 - diffSeconds / 0.1)),
        multiplier: 1.5,
        message: "OTTIMO! Sei nel mirino!",
        rating: "great"
      };
    } else if (diffSeconds <= 0.2) { // BUONO (entro 200 millesimi)
      return {
        points: 200,
        bonus: Math.floor(100 * (1 - diffSeconds / 0.2)),
        multiplier: 1.2,
        message: "BUONO! Continua così!",
        rating: "good"
      };
    } else if (diffSeconds <= 0.5) { // ACCETTABILE (entro 500 millesimi)
      return {
        points: 50,
        bonus: 0,
        multiplier: 1.0,
        message: "Accettabile",
        rating: "ok"
      };
    } else if (diffSeconds <= 1.0) { // SCARSO (entro 1 secondo)
      const malus = Math.floor(30 * (diffSeconds / 1.0));
      return {
        points: -malus,
        bonus: 0,
        multiplier: 0.8,
        message: "Troppo lento!",
        rating: "poor"
      };
    } else if (diffSeconds <= 2.0) { // MOLTO SCARSO (entro 2 secondi)
      const malus = 50 + Math.floor(50 * ((diffSeconds - 1.0) / 1.0));
      return {
        points: -malus,
        bonus: 0,
        multiplier: 0.5,
        message: "Devi migliorare i riflessi!",
        rating: "bad"
      };
    } else { // DISASTRO
      const malus = 100 + Math.floor((diffSeconds - 2.0) * 20);
      return {
        points: -Math.min(malus, 300),
        bonus: 0,
        multiplier: 0.2,
        message: "DISASTRO!",
        rating: "disaster"
      };
    }
  };

  // INIZIA IL GIOCO
  const startGame = () => {
    setGameState('ready');
    setScore(0);
    setRound(1);
    setTotalScore(0);
    setAttempts([]);
    setAverageDiff(0);
    setConsecutiveHits(0);
    setMaxConsecutive(0);
    setBestTime(null);
    setGameTimer(15);
    
    // Genera primo target
    const target = generateTargetTime();
    setTargetTime(target);
    
    // Avvia timer di gioco (15 secondi)
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setGameTimer(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // AVVIA COUNTDOWN PER TURNO
  const startTurn = () => {
    setGameState('countdown');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startReaction();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // INIZIA FASE REAZIONE
  const startReaction = () => {
    setGameState('waiting');
    
    // Aspetta tempo random prima di dare il via (1-3 secondi)
    const waitTime = 1000 + Math.random() * 2000;
    
    setTimeout(() => {
      setGameState('reaction');
      setTimeStarted(Date.now());
      reactionStartRef.current = Date.now();
    }, waitTime);
  };

  // CLICK DEL GIOCATORE
  const handleClick = () => {
    if (gameState !== 'reaction') {
      // Click prematuro - penalità
      setGameState('result');
      setReactionTime(0);
      setScore(-100);
      setTotalScore(prev => prev - 100);
      setConsecutiveHits(0);
      
      setTimeout(() => {
        nextTurn();
      }, 2000);
      return;
    }
    
    const endTime = Date.now();
    const reactionMs = endTime - reactionStartRef.current;
    
    setReactionTime(reactionMs);
    setGameState('result');
    
    // Calcola punteggio
    const result = calculateScore(targetTime.totalMs, reactionMs);
    const roundScore = result.points + result.bonus;
    
    setScore(roundScore);
    setTotalScore(prev => prev + roundScore);
    
    // Aggiorna statistiche
    const diffSeconds = Math.abs(reactionMs - targetTime.totalMs) / 1000;
    const newAttempts = [...attempts, {
      round,
      target: targetTime.totalMs,
      reaction: reactionMs,
      diff: diffSeconds,
      score: roundScore,
      rating: result.rating,
      message: result.message
    }];
    
    setAttempts(newAttempts);
    
    // Calcola media differenze
    const avgDiff = newAttempts.reduce((sum, a) => sum + a.diff, 0) / newAttempts.length;
    setAverageDiff(avgDiff);
    
    // Aggiorna streak
    if (result.rating === "good" || result.rating === "great" || 
        result.rating === "excellent" || result.rating === "perfect" || 
        result.rating === "legendary") {
      const newStreak = consecutiveHits + 1;
      setConsecutiveHits(newStreak);
      if (newStreak > maxConsecutive) setMaxConsecutive(newStreak);
    } else {
      setConsecutiveHits(0);
    }
    
    // Aggiorna miglior tempo
    if (!bestTime || diffSeconds < bestTime.diff) {
      setBestTime({
        time: diffSeconds,
        round: round,
        reactionMs: reactionMs,
        targetMs: targetTime.totalMs
      });
    }
    
    // Prossimo turno dopo 2 secondi
    setTimeout(() => {
      nextTurn();
    }, 2000);
  };

  // PROSSIMO TURNO
  const nextTurn = () => {
    if (gameTimer <= 0) return;
    
    setRound(prev => prev + 1);
    const newTarget = generateTargetTime();
    setTargetTime(newTarget);
    setGameState('ready');
  };

  // TERMINA GIOCO
  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('finished');
    
    // Calcola ricompensa SFT
    let tokensEarned = 50; // Base
    
    // Bonus per punteggio
    if (totalScore > 0) {
      tokensEarned += Math.floor(totalScore / 100);
    }
    
    // Bonus per precisione (se averageDiff < 0.2s)
    if (averageDiff > 0 && averageDiff < 0.2) {
      tokensEarned += Math.floor((0.2 - averageDiff) * 100);
    }
    
    // Bonus per streak
    tokensEarned += maxConsecutive * 5;
    
    // Bonus per miglior tempo
    if (bestTime && bestTime.time < 0.1) {
      tokensEarned += Math.floor((0.1 - bestTime.time) * 200);
    }
    
    // Aggiorna token utente
    if (session) {
      const newTokens = userTokens + tokensEarned;
      setUserTokens(newTokens);
      localStorage.setItem(`tokens_${session.user?.email}`, newTokens.toString());
    }
  };

  // FORMATTA TEMPO
  const formatTime = (ms) => {
    if (!ms) return "0.000s";
    const seconds = Math.floor(ms / 1000);
    const remainingMs = ms % 1000;
    const hundredths = Math.floor(remainingMs / 10);
    const thousandths = remainingMs % 10;
    return `${seconds}.${hundredths.toString().padStart(2, '0')}${thousandths}s`;
  };

  // FORMATTA DIFFERENZA
  const formatDiff = (diffSeconds) => {
    const absDiff = Math.abs(diffSeconds);
    if (absDiff < 0.001) return "0.000s";
    const ms = absDiff * 1000;
    const hundredths = Math.floor(ms / 10);
    const thousandths = Math.floor(ms % 10);
    return `${(absDiff).toFixed(3)}s`;
  };

  // GET COLOR BASED ON RATING
  const getRatingColor = (rating) => {
    switch(rating) {
      case 'legendary': return 'text-purple-500';
      case 'perfect': return 'text-yellow-500';
      case 'excellent': return 'text-green-500';
      case 'great': return 'text-blue-500';
      case 'good': return 'text-emerald-500';
      case 'ok': return 'text-zinc-400';
      case 'poor': return 'text-orange-500';
      case 'bad': return 'text-red-500';
      case 'disaster': return 'text-red-700';
      default: return 'text-zinc-500';
    }
  };

  // GET BG COLOR BASED ON RATING
  const getRatingBgColor = (rating) => {
    switch(rating) {
      case 'legendary': return 'bg-purple-500/10 border-purple-500/30';
      case 'perfect': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'excellent': return 'bg-green-500/10 border-green-500/30';
      case 'great': return 'bg-blue-500/10 border-blue-500/30';
      case 'good': return 'bg-emerald-500/10 border-emerald-500/30';
      case 'ok': return 'bg-zinc-500/10 border-zinc-500/30';
      case 'poor': return 'bg-orange-500/10 border-orange-500/30';
      case 'bad': return 'bg-red-500/10 border-red-500/30';
      case 'disaster': return 'bg-red-700/10 border-red-700/30';
      default: return 'bg-zinc-500/10 border-zinc-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation />
      
      <main className="max-w-6xl mx-auto pt-32 px-4 pb-20">
        {/* HEADER */}
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <Timer className="w-8 h-8 text-red-500" />
              <span className="text-red-600 font-black text-xs uppercase tracking-[0.3em] font-mono italic">
                Scuderia Ferrari • Pit Stop Challenge
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6">
              Testa i tuoi <span className="text-red-600">Riflessi</span>
            </h1>
            
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg italic">
              Sii veloce come i meccanici Ferrari! Clicca esattamente quando il timer raggiunge il tempo target.
              Precisione al <span className="text-yellow-500 font-bold">millesimo di secondo</span>!
            </p>
          </motion.div>
        </header>

        {/* GAME STATS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Punteggio</p>
                <p className="text-3xl font-black text-white">{totalScore}</p>
              </div>
              <Trophy className="text-yellow-500 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Tempo Restante</p>
                <p className={`text-3xl font-black ${gameTimer <= 5 ? 'text-red-500 animate-pulse' : 
                             gameTimer <= 10 ? 'text-yellow-500' : 'text-white'}`}>
                  {gameTimer}s
                </p>
              </div>
              <Clock className="text-red-500 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Round</p>
                <p className="text-3xl font-black text-white">
                  {round}<span className="text-zinc-500 text-lg">/∞</span>
                </p>
              </div>
              <Target className="text-green-500 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">SFT Totali</p>
                <p className="text-3xl font-black text-white">{userTokens} SFT</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                <span className="text-black font-bold text-xs">SFT</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GAME AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COL: GAME CONTROLS */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm p-8">
              <AnimatePresence mode="wait">
                {/* IDLE SCREEN */}
                {gameState === 'idle' && (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-20"
                  >
                    <div className="mb-10">
                      <div className="relative w-40 h-40 mx-auto mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-yellow-600 rounded-full blur-xl opacity-30" />
                        <Timer className="w-40 h-40 text-red-500 absolute inset-0" />
                      </div>
                      
                      <h2 className="text-4xl font-black uppercase mb-4">Pit Stop Challenge</h2>
                      <p className="text-zinc-400 mb-10 max-w-md mx-auto">
                        <span className="text-red-500 font-bold">15 secondi totali!</span><br/>
                        Clicca quando il timer raggiunge esattamente il tempo target. 
                        La precisione è tutto!
                      </p>
                      
                      {/* DIFFICULTY INFO */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-2xl mx-auto">
                        <div className="p-6 bg-zinc-800/50 rounded-2xl border border-red-500/20">
                          <div className="text-red-500 text-sm font-bold mb-2">🎯 Precisione Millesimi</div>
                          <p className="text-zinc-500 text-xs">Bonus fino a 500 punti</p>
                        </div>
                        <div className="p-6 bg-zinc-800/50 rounded-2xl border border-yellow-500/20">
                          <div className="text-yellow-500 text-sm font-bold mb-2">⚡ Malus Progressivo</div>
                          <p className="text-zinc-500 text-xs">Fino a -300 per errori grossi</p>
                        </div>
                        <div className="p-6 bg-zinc-800/50 rounded-2xl border border-green-500/20">
                          <div className="text-green-500 text-sm font-bold mb-2">🏆 50 SFT Base</div>
                          <p className="text-zinc-500 text-xs">+ bonus per performance</p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={startGame}
                      className="bg-gradient-to-r from-red-600 to-red-800 px-12 py-6 rounded-2xl text-xl font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-2xl"
                    >
                      Inizia la Sfida
                    </button>
                  </motion.div>
                )}

                {/* READY / COUNTDOWN */}
                {(gameState === 'ready' || gameState === 'countdown') && (
                  <motion.div 
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <div className="mb-10">
                      <h3 className="text-3xl font-black uppercase mb-6">Round {round}</h3>
                      
                      {/* TARGET TIME DISPLAY */}
                      <div className="mb-12">
                        <p className="text-zinc-500 mb-4 text-sm uppercase tracking-widest">Tempo Target</p>
                        <div className="text-7xl font-black text-green-500 font-mono tracking-tighter">
                          {targetTime.display}
                        </div>
                        <p className="text-zinc-400 mt-4">Clicca quando il timer raggiunge questo tempo esatto</p>
                      </div>
                      
                      {/* COUNTDOWN */}
                      {gameState === 'countdown' && (
                        <motion.div 
                          key="countdown"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-8xl font-black text-red-500 mb-10"
                        >
                          {countdown}
                        </motion.div>
                      )}
                      
                      {/* INSTRUCTIONS */}
                      <div className="max-w-md mx-auto p-6 bg-zinc-800/30 rounded-2xl">
                        <p className="text-zinc-400 mb-3">
                          <span className="text-yellow-500 font-bold">Pronto?</span> Il countdown partirà a 3...
                        </p>
                        <p className="text-zinc-500 text-sm">
                          Dopo il countdown, aspetta il semaforo verde prima di cliccare!
                        </p>
                      </div>
                    </div>
                    
                    {gameState === 'ready' && (
                      <button
                        onClick={startTurn}
                        className="bg-gradient-to-r from-yellow-600 to-yellow-800 px-10 py-5 rounded-2xl font-black uppercase tracking-wider hover:scale-105 transition-transform"
                      >
                        Preparati al Round
                      </button>
                    )}
                  </motion.div>
                )}

                {/* WAITING FOR GREEN LIGHT */}
                {gameState === 'waiting' && (
                  <motion.div 
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <div className="mb-10">
                      <h3 className="text-3xl font-black uppercase mb-6">Round {round}</h3>
                      
                      {/* TRAFFIC LIGHT */}
                      <div className="flex justify-center gap-8 mb-12">
                        <div className="w-24 h-24 rounded-full bg-red-600 shadow-[0_0_40px_rgba(239,68,68,0.5)] animate-pulse" />
                        <div className="w-24 h-24 rounded-full bg-zinc-800" />
                        <div className="w-24 h-24 rounded-full bg-zinc-800" />
                      </div>
                      
                      <div className="text-4xl font-black text-red-500 mb-6">
                        ATTENDI IL VIA!
                      </div>
                      
                      <p className="text-zinc-400 max-w-md mx-auto">
                        Non cliccare ora! Aspetta che il semaforo diventi verde.
                        Se clicchi prima, penalità di <span className="text-red-500 font-bold">-100 punti</span>!
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* REACTION PHASE */}
                {gameState === 'reaction' && (
                  <motion.div 
                    key="reaction"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <div className="mb-10">
                      <h3 className="text-3xl font-black uppercase mb-6">Round {round}</h3>
                      
                      {/* TRAFFIC LIGHT GREEN */}
                      <div className="flex justify-center gap-8 mb-12">
                        <div className="w-24 h-24 rounded-full bg-zinc-800" />
                        <div className="w-24 h-24 rounded-full bg-green-600 shadow-[0_0_40px_rgba(34,197,94,0.5)]" />
                        <div className="w-24 h-24 rounded-full bg-zinc-800" />
                      </div>
                      
                      <div className="text-4xl font-black text-green-500 mb-6 animate-pulse">
                        VIA! CLICCA ORA!
                      </div>
                      
                      {/* REACTION TIMER */}
                      <div className="text-7xl font-black font-mono text-white mb-10">
                        {formatTime(Date.now() - reactionStartRef.current)}
                      </div>
                      
                      <p className="text-zinc-400 max-w-md mx-auto">
                        Target: <span className="text-green-500 font-bold">{targetTime.display}</span><br/>
                        Clicca quando pensi di aver raggiunto il tempo esatto!
                      </p>
                    </div>
                    
                    <button
                      onClick={handleClick}
                      className="w-full py-8 bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl text-2xl font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-2xl"
                    >
                      CLICCA!
                    </button>
                  </motion.div>
                )}

                {/* RESULT DISPLAY */}
                {gameState === 'result' && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <div className="mb-10">
                      <h3 className="text-3xl font-black uppercase mb-6">Round {round} - Risultato</h3>
                      
                      {/* SCORE CARD */}
                      <div className={`p-8 rounded-3xl mb-10 ${getRatingBgColor(attempts[attempts.length - 1]?.rating)}`}>
                        <div className="text-6xl font-black mb-4">
                          {score >= 0 ? '+' : ''}{score}
                          <span className="text-2xl text-zinc-400"> punti</span>
                        </div>
                        
                        <p className="text-2xl font-bold mb-6">
                          {attempts[attempts.length - 1]?.message}
                        </p>
                        
                        {/* TIMES COMPARISON */}
                        <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
                          <div className="text-center">
                            <p className="text-zinc-500 text-sm mb-2">Target</p>
                            <p className="text-3xl font-mono text-green-500">{targetTime.display}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-zinc-500 text-sm mb-2">Il tuo tempo</p>
                            <p className="text-3xl font-mono text-white">{formatTime(reactionTime)}</p>
                          </div>
                        </div>
                        
                        {/* DIFFERENCE */}
                        <div className="mt-8 p-4 bg-black/30 rounded-xl">
                          <p className="text-zinc-400 mb-2">Differenza</p>
                          <p className={`text-2xl font-black font-mono ${
                            Math.abs(reactionTime - targetTime.totalMs) / 1000 <= 0.2 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {formatDiff(Math.abs(reactionTime - targetTime.totalMs) / 1000)}
                          </p>
                        </div>
                      </div>
                      
                      {/* NEXT ROUND COUNTDOWN */}
                      <div className="text-zinc-500">
                        Prossimo round tra 2 secondi...
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* FINISHED GAME */}
                {gameState === 'finished' && (
                  <motion.div 
                    key="finished"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                  >
                    <div className="mb-12">
                      <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-8" />
                      <h2 className="text-5xl font-black uppercase mb-4">Sfida Completata!</h2>
                      
                      <p className="text-zinc-400 text-xl mb-2">Il tuo punteggio finale</p>
                      <div className="text-7xl font-black text-yellow-500 mb-10">{totalScore}</div>
                      
                      {/* STATS SUMMARY */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
                        <div className="p-6 bg-zinc-800/50 rounded-2xl">
                          <div className="text-2xl font-black mb-2">{attempts.length}</div>
                          <p className="text-zinc-500 text-sm">Round giocati</p>
                        </div>
                        <div className="p-6 bg-zinc-800/50 rounded-2xl">
                          <div className="text-2xl font-black mb-2">
                            {bestTime ? formatDiff(bestTime.time) : 'N/A'}
                          </div>
                          <p className="text-zinc-500 text-sm">Miglior precisione</p>
                        </div>
                        <div className="p-6 bg-zinc-800/50 rounded-2xl">
                          <div className="text-2xl font-black mb-2">+{50 + Math.floor(totalScore/100)}</div>
                          <p className="text-zinc-500 text-sm">SFT guadagnati</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button
                          onClick={startGame}
                          className="bg-gradient-to-r from-red-600 to-red-800 px-10 py-4 rounded-2xl font-black uppercase tracking-wider hover:scale-105 transition-transform flex items-center justify-center gap-3"
                        >
                          <RefreshCw className="w-5 h-5" />
                          Rigiochi
                        </button>
                        <button
                          onClick={() => router.push('/fanzone')}
                          className="bg-gradient-to-r from-yellow-600 to-yellow-800 px-10 py-4 rounded-2xl font-black uppercase tracking-wider hover:scale-105 transition-transform flex items-center justify-center gap-3"
                        >
                          <ChevronRight className="w-5 h-5" />
                          Torna alla Fan Zone
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT COL: STATS & HISTORY */}
          <div className="space-y-8">
            {/* CURRENT STATS */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-500" /> Statistiche Round
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Media differenza:</span>
                  <span className="font-mono font-bold">
                    {averageDiff > 0 ? formatDiff(averageDiff) : '0.000s'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Streak attuale:</span>
                  <span className="font-bold text-green-500">
                    {consecutiveHits} {consecutiveHits >= 3 && '🔥'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Streak massimo:</span>
                  <span className="font-bold text-yellow-500">{maxConsecutive}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Round completati:</span>
                  <span className="font-bold">{attempts.length}</span>
                </div>
              </div>
            </div>

            {/* SCORING GUIDE */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" /> Sistema Punteggio
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-green-500">≤ 1ms</span>
                  <span className="font-bold text-purple-500">+1000 ⭐</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-400">≤ 10ms</span>
                  <span className="font-bold text-yellow-500">+800</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400">≤ 50ms</span>
                  <span className="font-bold text-green-500">+600</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-400">≤ 100ms</span>
                  <span className="font-bold text-blue-500">+400</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">≤ 200ms</span>
                  <span className="font-bold text-emerald-500">+200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-400">≤ 500ms</span>
                  <span className="font-bold text-zinc-400">+50</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-500">≤ 1s</span>
                  <span className="font-bold text-orange-500">-30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-400">≤ 2s</span>
                  <span className="font-bold text-red-500">-100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-600">&gt; 2s</span>
                  <span className="font-bold text-red-700">-300</span>
                </div>
              </div>
            </div>

            {/* RECENT ATTEMPTS */}
            {attempts.length > 0 && (
              <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" /> Ultimi Round
                </h3>
                
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {[...attempts].reverse().slice(0, 5).map((attempt, index) => (
                    <div key={attempt.round} className="p-3 bg-zinc-800/30 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-zinc-500">Round {attempt.round}</span>
                        <span className={`text-xs font-bold ${getRatingColor(attempt.rating)}`}>
                          {attempt.score >= 0 ? '+' : ''}{attempt.score}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Diff: {formatDiff(attempt.diff)}</span>
                        <span className="text-zinc-500">{attempt.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TIMER WARNING */}
        {gameState !== 'idle' && gameState !== 'finished' && gameTimer <= 5 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-8 p-6 bg-red-900/30 border border-red-500/50 rounded-2xl text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 animate-pulse" />
              <span className="text-red-300 font-bold">
                ATTENZIONE! Solo {gameTimer} secondi rimasti!
              </span>
            </div>
          </motion.div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}