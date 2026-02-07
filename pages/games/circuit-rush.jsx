import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Zap, AlertTriangle, RefreshCw, Gauge, Coins } from 'lucide-react';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';
import { useSession } from "next-auth/react";

export default function CircuitRush() {
  const router = useRouter();
  const { data: session } = useSession(); 
  
  const [gameState, setGameState] = useState('idle'); 
  const [score, setScore] = useState(0);
  const [carLane, setCarLane] = useState(1); 
  const [obstacles, setObstacles] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(2.5); // Partenza lenta
  const [lastDodge, setLastDodge] = useState(false);
  const [earnedTokens, setEarnedTokens] = useState(0);

  const gameLoopRef = useRef();
  const lastSpawnRef = useRef(0);
  const scoreRef = useRef(0); 
  const speedRef = useRef(2.5);

  // --- LOGICA TOKEN ---
  const saveTokens = (points) => {
    if (!session) return;
    const tokensEarned = Math.floor(points / 5);
    setEarnedTokens(tokensEarned);
    const storageKey = `tokens_${session.user?.email}`;
    const currentTokens = parseInt(localStorage.getItem(storageKey) || '1250');
    const newTotal = currentTokens + tokensEarned;
    localStorage.setItem(storageKey, newTotal.toString());
  };

  const handleDodge = useCallback(() => {
    scoreRef.current += 10;
    setScore(scoreRef.current);
    // Incremento velocità più graduale
    speedRef.current = Math.min(18, speedRef.current + 0.15);
    setGameSpeed(speedRef.current);
    setLastDodge(true);
    setTimeout(() => setLastDodge(false), 200);
  }, []);

  const startGame = () => {
    scoreRef.current = 0;
    speedRef.current = 2.5;
    setScore(0);
    setEarnedTokens(0);
    setGameSpeed(2.5);
    setObstacles([]);
    setCarLane(1);
    setGameState('playing');
  };

  const endGame = useCallback(() => {
    setGameState('gameover');
    cancelAnimationFrame(gameLoopRef.current);
    saveTokens(scoreRef.current);
  }, [session]);

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
      
      // Calcolo spawn ostacoli proporzionale alla velocità
      // Più si va piano, più tempo passa tra un ostacolo e l'altro
      const spawnInterval = Math.max(450, 1800 - (speedRef.current * 100));
      
      if (now - lastSpawnRef.current > spawnInterval) {
        newObstacles.push({ id: now, lane: Math.floor(Math.random() * 3), y: -15, passed: false });
        lastSpawnRef.current = now;
      }

      return [...prev, ...newObstacles]
        .map((obs) => ({ ...obs, y: obs.y + speedRef.current }))
        .filter((obs) => {
          // Collisione (regolata per l'ingombro dell'immagine)
          if (obs.y > 70 && obs.y < 85 && obs.lane === carLane) {
            endGame();
            return false;
          }
          if (obs.y >= 85 && !obs.passed) {
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
          
          <div className="flex items-center gap-3 bg-zinc-900 px-3 py-1 rounded-full border border-white/5 shadow-inner">
            <Gauge className="w-4 h-4 text-red-500" />
            <span className="font-mono font-bold text-xs text-red-500">{(gameSpeed * 20).toFixed(0)} KM/H</span>
          </div>
        </div>

        {/* AREA TRACK */}
        <div className="relative w-full max-w-[400px] h-[650px] bg-zinc-950 rounded-[40px] border-4 border-zinc-800 overflow-hidden shadow-[0_0_50px_rgba(255,0,0,0.1)]">
          
          <AnimatePresence>
            {gameState === 'idle' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
                <div className="w-24 h-24 mb-6 relative">
                    <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse" />
                    <img src="/data/images/ferrari-games.png" alt="Ferrari" className="w-full h-full object-contain relative z-10 rotate-[-45deg]" />
                </div>
                <h2 className="text-4xl font-black uppercase italic mb-2 tracking-tighter">Circuit Rush</h2>
                <p className="text-zinc-400 text-sm mb-8">Schiva i detriti per accumulare SFT!</p>
                <button onClick={startGame} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/40">Start Engine</button>
              </motion.div>
            )}

            {gameState === 'gameover' && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
                <AlertTriangle className="w-16 h-16 text-red-600 mb-4 animate-pulse" />
                <h2 className="text-4xl font-black uppercase italic mb-2 font-mono tracking-tighter text-red-600">INCIDENTE</h2>
                
                <div className="my-6">
                    <p className="text-zinc-500 uppercase text-[10px] font-black tracking-[0.2em] mb-1">Punti schivata</p>
                    <div className="text-5xl font-black text-white font-mono">{score}</div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-3xl w-full mb-8">
                    <div className="flex items-center justify-center gap-3 mb-1">
                        <Coins className="text-yellow-500 w-5 h-5" />
                        <span className="text-2xl font-black text-yellow-500">+{earnedTokens} SFT</span>
                    </div>
                    <p className="text-[9px] text-yellow-500/60 uppercase font-bold tracking-widest">Inviati alla tua Fan Zone</p>
                </div>

                <div className="flex flex-col w-full gap-3">
                    <button onClick={startGame} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all">
                        <RefreshCw className="w-5 h-5" /> Riprova
                    </button>
                    <button onClick={() => router.push('/fanzone')} className="w-full py-4 bg-zinc-800 text-zinc-400 rounded-2xl font-black uppercase tracking-widest text-xs">
                        Esci
                    </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCORE FLOATING */}
          <motion.div 
            animate={{ scale: lastDodge ? 1.2 : 1, color: lastDodge ? '#ef4444' : '#ffffff' }}
            className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/60 px-8 py-3 rounded-full border border-white/10 z-10 backdrop-blur-md"
          >
            <span className="font-mono text-3xl font-black italic tracking-tighter">{score.toString().padStart(4, '0')}</span>
          </motion.div>

          {/* AUTO F1 */}
          <motion.div 
            animate={{ x: (carLane - 1) * 110 }} 
            transition={{ type: "spring", stiffness: 350, damping: 30 }} 
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-20 h-32 z-20"
          >
            <img 
              src="/data/images/ferrari-games.png" 
              alt="Ferrari F1 Player" 
              className="w-full h-full object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]"
            />
          </motion.div>

          {/* OSTACOLI */}
          {obstacles.map((obs) => (
            <div key={obs.id} className="absolute w-14 h-14 z-10" style={{ left: `${(obs.lane * 33.33) + 16.66}%`, top: `${obs.y}%`, transform: 'translateX(-50%)' }}>
              {/* Grafica ostacolo */}
              <div className="w-full h-full bg-zinc-700 border-2 border-zinc-500 rounded flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="w-full h-1 bg-zinc-600 rotate-45 absolute opacity-30" />
                <div className="w-full h-1 bg-zinc-600 -rotate-45 absolute opacity-30" />
                <Zap className="w-6 h-6 text-zinc-500" />
              </div>
            </div>
          ))}

          {/* STRADE (EFFETTO VELOCITÀ) */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} 
                initial={{ y: -100 }} 
                animate={{ y: 750 }} 
                transition={{ 
                    duration: 2.5 / (gameSpeed / 5), 
                    repeat: Infinity, 
                    ease: "linear", 
                    delay: i * 0.4 
                }}
                className="absolute left-1/2 -translate-x-1/2 w-[3px] h-32 bg-gradient-to-b from-transparent via-white/50 to-transparent" 
              />
            ))}
          </div>
        </div>

        {/* CONTROLLI DESKTOP */}
        <div className="mt-8 flex flex-col items-center opacity-40">
            <div className="flex gap-2 mb-2">
                <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-[10px] font-mono">←</div>
                <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-[10px] font-mono">→</div>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest italic">Usa le frecce per sterzare</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}