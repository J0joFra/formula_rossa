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
  const [gameSpeed, setGameSpeed] = useState(2.5);
  const [lastDodge, setLastDodge] = useState(false);
  const [earnedTokens, setEarnedTokens] = useState(0);

  const gameLoopRef = useRef();
  const lastSpawnRef = useRef(0);
  const scoreRef = useRef(0); 
  const speedRef = useRef(2.5);

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

  const moveLeft = () => setCarLane((prev) => Math.max(0, prev - 1));
  const moveRight = () => setCarLane((prev) => Math.min(2, prev + 1));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    setObstacles((prev) => {
      const newObstacles = [];
      const now = Date.now();
      const spawnInterval = Math.max(450, 1800 - (speedRef.current * 100));
      
      if (now - lastSpawnRef.current > spawnInterval) {
        newObstacles.push({ id: now, lane: Math.floor(Math.random() * 3), y: -15, passed: false });
        lastSpawnRef.current = now;
      }

      return [...prev, ...newObstacles]
        .map((obs) => ({ ...obs, y: obs.y + speedRef.current }))
        .filter((obs) => {
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
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden select-none touch-none">
      <Navigation />

      <main className="pt-24 pb-12 px-4 flex flex-col items-center">
        
        {/* HEADER GIOCO */}
        <div className="max-w-[400px] w-full mb-6 flex justify-between items-center px-4">
          <button onClick={() => router.push('/fanzone')} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest font-mono">Back</span>
          </button>
          
          <div className="flex items-center gap-3 bg-zinc-900 px-4 py-1.5 rounded-full border border-white/5">
            <Gauge className="w-4 h-4 text-red-500" />
            <span className="font-mono font-bold text-xs text-red-500">{(gameSpeed * 20).toFixed(0)} KM/H</span>
          </div>
        </div>

        {/* AREA TRACK */}
        <div className="relative w-full max-w-[400px] h-[650px] bg-zinc-950 rounded-[40px] border-4 border-zinc-800 overflow-hidden shadow-[0_0_50px_rgba(255,0,0,0.1)]">
          
          {/* CONTROLLI TOUCH INVISIBILI (Solo durante il gioco) */}
          {gameState === 'playing' && (
            <div className="absolute inset-0 z-40 flex">
              <div 
                className="w-1/2 h-full active:bg-white/5 transition-colors" 
                onPointerDown={moveLeft} 
              />
              <div 
                className="w-1/2 h-full active:bg-white/5 transition-colors" 
                onPointerDown={moveRight} 
              />
            </div>
          )}

          <AnimatePresence>
            {gameState === 'idle' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
                <div className="w-24 h-24 mb-6 relative">
                    <img src="/data/images/ferrari-games.png" alt="Ferrari" className="w-full h-full object-contain rotate-[-45deg]" />
                </div>
                <h2 className="text-4xl font-black uppercase italic mb-2 tracking-tighter">Circuit Rush</h2>
                <p className="text-zinc-400 text-sm mb-8">Tocca i lati dello schermo per sterzare!</p>
                <button onClick={startGame} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg">Start Engine</button>
              </motion.div>
            )}

            {gameState === 'gameover' && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
                <AlertTriangle className="w-16 h-16 text-red-600 mb-4 animate-pulse" />
                <h2 className="text-4xl font-black uppercase italic mb-2 text-red-600">INCIDENTE</h2>
                
                <div className="my-6">
                    <p className="text-zinc-500 uppercase text-[10px] font-black tracking-[0.2em] mb-1">Score</p>
                    <div className="text-5xl font-black text-white font-mono">{score}</div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-3xl w-full mb-8">
                    <span className="text-2xl font-black text-yellow-500">+{earnedTokens} SFT</span>
                    <p className="text-[9px] text-yellow-500/60 uppercase font-bold tracking-widest">Accreditati</p>
                </div>

                <div className="flex flex-col w-full gap-3">
                    <button onClick={startGame} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
                        <RefreshCw className="w-5 h-5" /> Riprova
                    </button>
                    <button onClick={() => router.push('/fanzone')} className="w-full py-4 bg-zinc-800 text-zinc-400 rounded-2xl font-black uppercase tracking-widest text-xs">
                        Esci
                    </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCORE */}
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
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-20 h-32 z-20 pointer-events-none"
          >
            <img src="/data/images/ferrari-games.png" alt="F1" className="w-full h-full object-contain" />
          </motion.div>

          {/* OSTACOLI */}
          {obstacles.map((obs) => (
            <div key={obs.id} className="absolute w-14 h-14 z-10" style={{ left: `${(obs.lane * 33.33) + 16.66}%`, top: `${obs.y}%`, transform: 'translateX(-50%)' }}>
              <div className="w-full h-full bg-zinc-800 border-2 border-zinc-600 rounded shadow-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-zinc-600" />
              </div>
            </div>
          ))}

          {/* ROAD SPEED LINES */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} initial={{ y: -100 }} animate={{ y: 750 }} transition={{ duration: 2.5 / (gameSpeed / 5), repeat: Infinity, ease: "linear", delay: i * 0.4 }}
                className="absolute left-1/2 -translate-x-1/2 w-[3px] h-32 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
            ))}
          </div>
        </div>

        {/* ISTRUZIONI MOBILE */}
        <p className="mt-8 text-zinc-600 text-[10px] uppercase font-bold tracking-widest italic md:hidden">
          Tocca i lati della pista per sterzare
        </p>
      </main>
      <Footer />
    </div>
  );
}