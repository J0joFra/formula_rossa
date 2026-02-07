import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, RefreshCw, Trophy, ChevronLeft, Target, Zap, X } from 'lucide-react';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';

export default function SimplePitStop() {
  const router = useRouter();
  const [gameState, setGameState] = useState('idle'); // 'idle', 'running', 'result'
  const [targetTime, setTargetTime] = useState(0);
  const [resultTime, setResultTime] = useState(0);
  const [score, setScore] = useState(0);
  const startTimeRef = useRef(0);

  // Genera un obiettivo casuale tra 2.00 e 5.00 secondi
  const generateTarget = () => {
    const t = (Math.random() * (5 - 2) + 2).toFixed(2);
    setTargetTime(parseFloat(t));
    setGameState('idle');
  };

  useEffect(() => {
    generateTarget();
  }, []);

  const handleAction = () => {
    if (gameState === 'idle') {
      startTimeRef.current = Date.now();
      setGameState('running');
    } else if (gameState === 'running') {
      const endTime = Date.now();
      const duration = (endTime - startTimeRef.current) / 1000;
      setResultTime(duration);
      
      const diff = Math.abs(duration - targetTime);
      let points = 0;
      if (diff < 0.05) points = 1000;      
      else if (diff < 0.2) points = 500;   
      else if (diff < 0.5) points = 200;   
      else if (diff < 1.0) points = 50;    
      
      setScore(points);
      setGameState('result');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <Navigation />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-24 pb-12">
        
        {/* PULSANTE INDIETRO / ESCI */}
        <div className="max-w-md w-full mb-6">
          <button 
            onClick={() => router.push('/fanzone')}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Torna alla Fan Zone</span>
          </button>
        </div>

        <div className="max-w-md w-full text-center">
          
          {/* HEADER TITOLO */}
          <div className="mb-8">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              PIT STOP <span className="text-red-600">TIME</span>
            </h1>
            <p className="text-zinc-500 text-sm uppercase tracking-widest">Sfida il millesimo di secondo</p>
          </div>

          {/* AREA DI GIOCO PRINCIPALE */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-[40px] p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            
            <AnimatePresence mode="wait">
              {/* STATO: PRONTO (IDLE) */}
              {gameState === 'idle' && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                >
                  <p className="text-zinc-400 uppercase text-xs font-bold mb-2">Obiettivo:</p>
                  <div className="text-7xl font-black text-red-600 mb-8 font-mono">
                    {targetTime.toFixed(2)}<span className="text-2xl text-white">s</span>
                  </div>
                  <p className="text-zinc-500 text-sm mb-8">Memorizza il tempo, premi START e riclicca quando pensi sia scaduto.</p>
                </motion.div>
              )}

              {/* STATO: IN CORSO (RUNNING) */}
              {gameState === 'running' && (
                <motion.div 
                  key="running"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="py-10"
                >
                  <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <h2 className="text-3xl font-black uppercase animate-pulse">CONTA...</h2>
                  <p className="text-zinc-500 mt-2 italic">Il timer è nascosto!</p>
                </motion.div>
              )}

              {/* STATO: RISULTATO (RESULT) */}
              {gameState === 'result' && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex justify-center gap-4 mb-4">
                     <div className="text-center">
                        <p className="text-[10px] text-zinc-500 uppercase">Target</p>
                        <p className="text-xl font-bold font-mono text-zinc-400">{targetTime.toFixed(2)}s</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] text-zinc-500 uppercase">Tu</p>
                        <p className="text-xl font-bold font-mono text-white">{resultTime.toFixed(2)}s</p>
                     </div>
                  </div>

                  <div className={`text-6xl font-black mb-2 ${score > 0 ? 'text-green-500' : 'text-zinc-600'}`}>
                    +{score}
                  </div>
                  <p className="text-zinc-400 uppercase text-xs font-bold mb-8">
                    Differenza: <span className="text-red-500">{Math.abs(resultTime - targetTime).toFixed(3)}s</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PULSANTI AZIONE */}
            <div className="flex flex-col gap-3">
              <button
                onClick={gameState === 'result' ? generateTarget : handleAction}
                className={`w-full py-6 rounded-2xl text-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg
                  ${gameState === 'idle' ? 'bg-red-600 hover:bg-red-700 text-white' : 
                    gameState === 'running' ? 'bg-white text-black hover:bg-zinc-200' : 
                    'bg-red-600 text-white hover:bg-red-700'}`}
              >
                {gameState === 'idle' && 'START'}
                {gameState === 'running' && 'STOP!'}
                {gameState === 'result' && 'PROVA ANCORA'}
              </button>

              {gameState === 'result' && (
                <button
                  onClick={() => router.push('/fanzone')}
                  className="w-full py-4 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest"
                >
                  Esci dal gioco
                </button>
              )}
            </div>
          </div>

          {/* TIPS RAPIDI */}
          <div className="mt-10 flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Riflessi</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-red-500" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Precisione</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-green-500" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Premi</span>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}