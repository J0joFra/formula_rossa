import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Trophy, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';

export default function CircuitRush() {
  const router = useRouter();
  const [gameState, setGameState] = useState('idle'); // 'idle', 'playing', 'gameover'
  const [score, setScore] = useState(0);
  const [carLane, setCarLane] = useState(1); // 0: Left, 1: Center, 2: Right
  const [obstacles, setObstacles] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(5);
  const gameLoopRef = useRef();
  const lastSpawnRef = useRef(0);

  // Comandi da tastiera
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') setCarLane((prev) => Math.max(0, prev - 1));
      if (e.key === 'ArrowRight') setCarLane((prev) => Math.min(2, prev + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setObstacles([]);
    setGameSpeed(5);
    setCarLane(1);
  };

  const endGame = useCallback(() => {
    setGameState('gameover');
    cancelAnimationFrame(gameLoopRef.current);
  }, []);

  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    setObstacles((prev) => {
      const newObstacles = [];
      const now = Date.now();

      // Spawn nuovo ostacolo ogni 1.5 secondi (riducendosi con la velocità)
      if (now - lastSpawnRef.current > 1500 - (gameSpeed * 50)) {
        newObstacles.push({
          id: now,
          lane: Math.floor(Math.random() * 3),
          y: -10,
        });
        lastSpawnRef.current = now;
      }

      // Muovi e filtra ostacoli
      const updated = [...prev, ...newObstacles]
        .map((obs) => ({ ...obs, y: obs.y + gameSpeed }))
        .filter((obs) => {
          // Collision Detection
          if (obs.y > 75 && obs.y < 85 && obs.lane === carLane) {
            endGame();
            return false;
          }
          return obs.y < 110;
        });

      return updated;
    });

    setScore((prev) => prev + 1);
    setGameSpeed((prev) => Math.min(15, prev + 0.001)); // Aumenta difficoltà
    gameLoopRef.current = requestAnimationFrame(updateGame);
  }, [gameState, carLane, gameSpeed, endGame]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(updateGame);
    }
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, updateGame]);

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden">
      <Navigation />

      <main className="pt-24 pb-12 px-4 flex flex-col items-center">
        {/* BACK BUTTON */}
        <div className="max-w-xl w-full mb-6">
          <button onClick={() => router.push('/fanzone')} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Esci</span>
          </button>
        </div>

        {/* TRACK AREA */}
        <div className="relative w-full max-w-[400px] h-[600px] bg-zinc-900 rounded-[40px] border-4 border-zinc-800 overflow-hidden shadow-2xl">
          
          {/* LANES MARKERS */}
          <div className="absolute inset-0 flex justify-evenly">
            <div className="w-[2px] h-full bg-white/5 border-dashed border-l-2" />
            <div className="w-[2px] h-full bg-white/5 border-dashed border-l-2" />
          </div>

          <AnimatePresence>
            {gameState === 'idle' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center p-8 text-center">
                <Zap className="w-16 h-16 text-yellow-500 mb-6" />
                <h2 className="text-3xl font-black uppercase italic mb-4 text-red-600">Circuit Rush</h2>
                <p className="text-zinc-400 text-sm mb-8">Usa le frecce della tastiera per schivare i detriti in pista!</p>
                <button onClick={startGame} className="w-full py-4 bg-red-600 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform">Inizia</button>
              </motion.div>
            )}

            {gameState === 'gameover' && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-red-600 mb-4" />
                <h2 className="text-4xl font-black uppercase italic mb-2">INCIDENTE!</h2>
                <p className="text-zinc-500 uppercase text-xs font-bold mb-6 tracking-widest">Punteggio: {score}</p>
                <div className="text-yellow-500 font-black mb-8">+{Math.floor(score / 10)} SFT GUADAGNATI</div>
                <button onClick={startGame} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
                  <RefreshCw className="w-5 h-5" /> Riprova
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCORE OVERLAY */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/50 px-6 py-2 rounded-full border border-white/10 z-10">
            <span className="font-mono text-xl font-black text-yellow-500">{score.toString().padStart(5, '0')}</span>
          </div>

          {/* PLAYER CAR */}
          <motion.div 
            animate={{ x: (carLane - 1) * 110 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-16 h-24 z-20"
          >
            {/* Semplice forma di auto F1 dall'alto */}
            <div className="w-full h-full bg-red-600 rounded-lg relative shadow-[0_10px_20px_rgba(220,38,38,0.4)]">
              <div className="absolute -top-2 left-0 w-full h-4 bg-red-700 rounded-t-full" /> {/* Ala anteriore */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-8 h-10 bg-black/40 rounded-md" /> {/* Abitacolo */}
              <div className="absolute -bottom-2 -left-2 w-20 h-4 bg-red-800 rounded-sm" /> {/* Ala posteriore */}
            </div>
          </motion.div>

          {/* OBSTACLES */}
          {obstacles.map((obs) => (
            <div 
              key={obs.id}
              className="absolute w-12 h-12 bg-zinc-400 rounded-lg flex items-center justify-center shadow-lg"
              style={{ 
                left: `${(obs.lane * 33.33) + 16.66}%`, 
                top: `${obs.y}%`,
                transform: 'translateX(-50%)' 
              }}
            >
              <div className="w-8 h-8 bg-zinc-600 rotate-45 border-2 border-zinc-500" />
            </div>
          ))}

          {/* ROAD ANIMATION (SPEED EFFECT) */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -100 }}
                animate={{ y: 600 }}
                transition={{ duration: 2 / (gameSpeed / 5), repeat: Infinity, ease: "linear", delay: i * 0.4 }}
                className="absolute left-1/2 -translate-x-1/2 w-[2px] h-20 bg-white"
              />
            ))}
          </div>
        </div>

        {/* MOBILE CONTROLS */}
        <div className="mt-8 flex gap-4 md:hidden">
            <button 
              onPointerDown={() => setCarLane((prev) => Math.max(0, prev - 1))}
              className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center active:bg-red-600"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button 
              onPointerDown={() => setCarLane((prev) => Math.min(2, prev + 1))}
              className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center active:bg-red-600"
            >
              <div className="rotate-180"><ChevronLeft className="w-10 h-10" /></div>
            </button>
        </div>

        <p className="mt-8 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Schiva i detriti per guadagnare SFT</p>
      </main>
      <Footer />
    </div>
  );
}