import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, RefreshCw, Trophy, ChevronLeft, Target, Zap, Coins } from 'lucide-react';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';
import { useSession } from "next-auth/react"; // Import sessione

export default function SimplePitStop() {
  const router = useRouter();
  const { data: session } = useSession(); // Accesso dati utente
  
  const [gameState, setGameState] = useState('idle'); // 'idle', 'running', 'result'
  const [targetTime, setTargetTime] = useState(0);
  const [resultTime, setResultTime] = useState(0);
  const [score, setScore] = useState(0);
  const [earnedTokens, setEarnedTokens] = useState(0); // Token guadagnati nel round
  const startTimeRef = useRef(0);

  // Genera un obiettivo casuale tra 2.00 e 5.00 secondi
  const generateTarget = () => {
    const t = (Math.random() * (5 - 2) + 2).toFixed(2);
    setTargetTime(parseFloat(t));
    setGameState('idle');
    setEarnedTokens(0);
  };

  useEffect(() => {
    generateTarget();
  }, []);

  // --- LOGICA SALVATAGGIO TOKEN ---
  const saveTokens = (points) => {
    if (!session) return; // Non salva se non loggato

    const tokensToAward = Math.floor(points / 10); // Conversione: 1000 punti = 100 SFT
    setEarnedTokens(tokensToAward);

    const storageKey = `tokens_${session.user?.email}`;
    const currentTokens = parseInt(localStorage.getItem(storageKey) || '1250');
    
    const newTotal = currentTokens + tokensToAward;
    localStorage.setItem(storageKey, newTotal.toString());
  };

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
      
      if (diff < 0.05) points = 1000;      // PERFETTO
      else if (diff < 0.2) points = 500;   // OTTIMO
      else if (diff < 0.5) points = 200;   // BUONO
      else if (diff < 1.0) points = 50;    // ACCETTABILE
      
      setScore(points);
      setGameState('result');
      saveTokens(points); // Salva i token nel profilo
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <Navigation />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-24 pb-12">
        
        {/* PULSANTE INDIETRO */}
        <div className="max-w-md w-full mb-6">
          <button 
            onClick={() => router.push('/fanzone')}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest font-mono">Back to Fan Zone</span>
          </button>
        </div>

        <div className="max-w-md w-full text-center">
          
          <div className="mb-8">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              PIT STOP <span className="text-red-600">TIME</span>
            </h1>
            <p className="text-zinc-500 text-sm uppercase tracking-widest">Precisione millimetrica</p>
          </div>

          <div className="bg-zinc-900/50 border border-white/10 rounded-[40px] p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            
            <AnimatePresence mode="wait">
              {gameState === 'idle' && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                >
                  <p className="text-zinc-400 uppercase text-xs font-bold mb-2 tracking-widest">Obiettivo:</p>
                  <div className="text-7xl font-black text-red-600 mb-8 font-mono">
                    {targetTime.toFixed(2)}<span className="text-2xl text-white">s</span>
                  </div>
                  <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                    Premi START, conta mentalmente e ferma il tempo esattamente a <span className="text-white font-bold">{targetTime}s</span>.
                  </p>
                </motion.div>
              )}

              {gameState === 'running' && (
                <motion.div 
                  key="running"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="py-10"
                >
                  <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-[0_0_20px_rgba(220,38,38,0.3)]"></div>
                  <h2 className="text-3xl font-black uppercase animate-pulse tracking-tighter text-red-600">CONTA...</h2>
                  <p className="text-zinc-500 mt-2 italic text-xs uppercase tracking-widest">Il cronometro è nascosto</p>
                </motion.div>
              )}

              {gameState === 'result' && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex justify-center gap-8 mb-8">
                     <div className="text-center">
                        <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Target</p>
                        <p className="text-2xl font-bold font-mono text-zinc-400">{targetTime.toFixed(2)}s</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Il tuo tempo</p>
                        <p className="text-2xl font-bold font-mono text-white">{resultTime.toFixed(2)}s</p>
                     </div>
                  </div>

                  {/* BOX TOKEN GUADAGNATI */}
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-6 mb-8">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Coins className="text-yellow-500 w-6 h-6" />
                        <span className="text-4xl font-black text-yellow-500">+{earnedTokens} SFT</span>
                    </div>
                    <p className="text-[9px] text-yellow-500 uppercase font-bold tracking-[0.2em]">Accreditati nel wallet</p>
                  </div>

                  <p className="text-zinc-400 uppercase text-[10px] font-black mb-6 tracking-widest">
                    Differenza: <span className="text-red-500">{(Math.abs(resultTime - targetTime)).toFixed(3)}s</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

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
                {gameState === 'result' && 'NUOVA GARA'}
              </button>

              {gameState === 'result' && (
                <button
                  onClick={() => router.push('/fanzone')}
                  className="w-full py-4 rounded-xl text-zinc-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
                >
                  Esci
                </button>
              )}
            </div>
          </div>

          <div className="mt-10 flex justify-center gap-8 opacity-50">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Riflessi</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-red-500" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Precisione</span>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}