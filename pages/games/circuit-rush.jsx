import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Zap, AlertTriangle, RefreshCw, Gauge, Coins } from 'lucide-react';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';
import { useSession } from "next-auth/react"; // Importiamo la sessione

export default function CircuitRush() {
  const router = useRouter();
  const { data: session } = useSession(); // Recuperiamo i dati dell'utente
  
  const [gameState, setGameState] = useState('idle'); 
  const [score, setScore] = useState(0);
  const [carLane, setCarLane] = useState(1); 
  const [obstacles, setObstacles] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(5);
  const [lastDodge, setLastDodge] = useState(false);
  const [earnedTokens, setEarnedTokens] = useState(0); // Token vinti in questa partita

  const gameLoopRef = useRef();
  const lastSpawnRef = useRef(0);
  const scoreRef = useRef(0); 
  const speedRef = useRef(5);

  // --- LOGICA TOKEN ---
  const saveTokens = (points) => {
    if (!session) return; // Se non è loggato, non salva

    const tokensEarned = Math.floor(points / 5); // 1 Token ogni 5 punti (2 schivate)
    setEarnedTokens(tokensEarned);

    // Recupera i token attuali dal localStorage
    const storageKey = `tokens_${session.user?.email}`;
    const currentTokens = parseInt(localStorage.getItem(storageKey) || '1250');
    
    // Somma e salva
    const newTotal = currentTokens + tokensEarned;
    localStorage.setItem(storageKey, newTotal.toString());
  };

  const handleDodge = useCallback(() => {
    scoreRef.current += 10;
    setScore(scoreRef.current);
    speedRef.current = Math.min(18, speedRef.current + 0.2);
    setGameSpeed(speedRef.current);
    setLastDodge(true);
    setTimeout(() => setLastDodge(false), 200);
  }, []);

  const startGame = () => {
    scoreRef.current = 0;
    speedRef.current = 5;
    setScore(0);
    setEarnedTokens(0);
    setGameSpeed(5);
    setObstacles([]);
    setCarLane(1);
    setGameState('playing');
  };

  const endGame = useCallback(() => {
    setGameState('gameover');
    cancelAnimationFrame(gameLoopRef.current);
    saveTokens(scoreRef.current); // Salva i token quando perdi
  }, [session]);

  // Gestione comandi
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') setCarLane((prev) => Math.max(0, prev - 1));
      if (e.key === 'ArrowRight') setCarLane((prev) => Math.min(2, prev + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    setObstacles((prev) => {
      const newObstacles = [];
      const now = Date.now();
      const spawnInterval = Math.max(400, 1200 - (speedRef.current * 40));
      
      if (now - lastSpawnRef.current > spawnInterval) {
        newObstacles.push({ id: now, lane: Math.floor(Math.random() * 3), y: -10, passed: false });
        lastSpawnRef.current = now;
      }

      return [...prev, ...newObstacles]
        .map((obs) => ({ ...obs, y: obs.y + speedRef.current }))
        .filter((obs) => {
          if (obs.y > 72 && obs.y < 82 && obs.lane === carLane) {
            endGame();
            return false;
          }
          if (obs.y >= 82 && !obs.passed) {
            obs.passed = true;
            handleDodge();
          }
          return obs.y < 110;
        });
    });

    gameLoopRef.current = requestAnimationFrame(updateGame);
  }, [gameState, carLane, endGame, handleDodge]);

  useEffect(() => {
    if (gameState === 'playing') gameLoopRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, updateGame]);

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden">
      <Navigation />

      <main className="pt-24 pb-12 px-4 flex flex-col items-center">
        
        {/* HEADER GIOCO */}
        <div className="max-w-[400px] w-full mb-6 flex justify-between items-center">
          <button onClick={() => router.push('/fanzone')} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Fan Zone</span>
          </button>
          
          <div className="flex items-center gap-3 bg-zinc-900 px-3 py-1 rounded-full border border-white/5">
            <Gauge className="w-4 h-4 text-blue-400" />
            <span className="font-mono font-bold text-xs text-blue-400">{(gameSpeed * 20).toFixed(0)} KM/H</span>
          </div>
        </div>

        {/* AREA TRACK */}
        <div className="relative w-full max-w-[400px] h-[600px] bg-zinc-900 rounded-[40px] border-4 border-zinc-800 overflow-hidden shadow-2xl">
          
          <AnimatePresence>
            {/* SCHERMATA INIZIALE */}
            {gameState === 'idle' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
                <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-red-600/30">
                    <Zap className="w-10 h-10 text-white fill-white" />
                </div>
                <h2 className="text-4xl font-black uppercase italic mb-2 tracking-tighter">Circuit Rush</h2>
                <p className="text-zinc-400 text-sm mb-8">Schiva i detriti per accumulare SFT!</p>
                <button onClick={startGame} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Start Engine</button>
              </motion.div>
            )}

            {/* SCHERMATA GAME OVER - MOSTRA I TOKEN GUADAGNATI */}
            {gameState === 'gameover' && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 z-30 bg-black/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
                <AlertTriangle className="w-16 h-16 text-red-600 mb-4 animate-pulse" />
                <h2 className="text-4xl font-black uppercase italic mb-2">Gara Finita</h2>
                
                <div className="my-6">
                    <p className="text-zinc-500 uppercase text-[10px] font-black tracking-[0.2em] mb-1">Punti schivata</p>
                    <div className="text-5xl font-black text-white font-mono">{score}</div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-3xl w-full mb-8">
                    <div className="flex items-center justify-center gap-3 mb-1">
                        <Coins className="text-yellow-500 w-5 h-5" />
                        <span className="text-2xl font-black text-yellow-500">+{earnedTokens} SFT</span>
                    </div>
                    <p className="text-[9px] text-yellow-500/60 uppercase font-bold tracking-widest">Accreditati nel tuo account</p>
                </div>

                <div className="flex flex-col w-full gap-3">
                    <button onClick={startGame} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-700 transition-all">
                        <RefreshCw className="w-5 h-5" /> Riprova
                    </button>
                    <button onClick={() => router.push('/fanzone')} className="w-full py-4 bg-zinc-800 text-zinc-400 rounded-2xl font-black uppercase tracking-widest text-xs">
                        Torna alla Fan Zone
                    </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCORE FLOATING */}
          <motion.div 
            animate={{ scale: lastDodge ? 1.2 : 1, color: lastDodge ? '#ef4444' : '#eab308' }}
            className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 px-8 py-3 rounded-3xl border border-white/10 z-10 backdrop-blur-md"
          >
            <span className="font-mono text-3xl font-black">{score.toString().padStart(4, '0')}</span>
          </motion.div>

          {/* AUTO F1 */}
          <motion.div animate={{ x: (carLane - 1) * 110 }} transition={{ type: "spring", stiffness: 400, damping: 35 }} className="absolute bottom-12 left-1/2 -translate-x-1/2 w-14 h-22 z-20">
            <div className="w-full h-full bg-red-600 rounded-b-md relative shadow-[0_15px_30px_rgba(220,38,38,0.5)]">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-16 h-3 bg-red-700 rounded-sm" />
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-6 h-8 bg-zinc-900 rounded-full border border-white/10" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-18 h-4 bg-red-800 rounded-sm" />
            </div>
          </motion.div>

          {/* OSTACOLI */}
          {obstacles.map((obs) => (
            <div key={obs.id} className="absolute w-14 h-14 z-10" style={{ left: `${(obs.lane * 33.33) + 16.66}%`, top: `${obs.y}%`, transform: 'translateX(-50%)' }}>
              <div className="w-full h-full bg-gradient-to-br from-zinc-500 to-zinc-700 rotate-12 border-2 border-zinc-400 rounded-sm shadow-lg" />
            </div>
          ))}

          {/* STRADE (EFFETTO VELOCITÀ) */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} initial={{ y: -100 }} animate={{ y: 700 }} transition={{ duration: 1.5 / (gameSpeed / 5), repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                className="absolute left-1/2 -translate-x-1/2 w-[2px] h-24 bg-white" />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}