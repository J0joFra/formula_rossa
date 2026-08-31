import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Gauge, Heart, Zap, Battery } from 'lucide-react';
import GameShell from '../../components/ui/GameShell';
import { useSession } from "next-auth/react";
import { addTokens, getTokens, initUser } from '../../lib/tokens';

// ─── COSTANTI ────────────────────────────────────────────────────────────────
const LANES = [16.66, 50, 83.33]; // % orizzontale delle 3 corsie
const INITIAL_SPEED = 1.2;
const MAX_SPEED = 14;
const MAX_LIVES = 3;

// Colori macchine avversarie
const RIVAL_COLORS = [
  { body: '#3b82f6', roof: '#1d4ed8', label: 'Mercedes' },
  { body: '#a855f7', roof: '#7e22ce', label: 'Alpine' },
  { body: '#f97316', roof: '#c2410c', label: 'McLaren' },
  { body: '#06b6d4', roof: '#0e7490', label: 'Williams' },
  { body: '#84cc16', roof: '#4d7c0f', label: 'Kick' },
];

// ─── SVG MACCHINA RIVALE ─────────────────────────────────────────────────────
function RivalCar({ color }) {
  return (
    <svg viewBox="0 0 40 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Corpo */}
      <rect x="4" y="14" width="32" height="36" rx="6" fill={color.body} />
      {/* Tetto/Abitacolo */}
      <rect x="10" y="18" width="20" height="16" rx="4" fill={color.roof} />
      {/* Parabrezza */}
      <rect x="12" y="19" width="16" height="10" rx="2" fill="#bfdbfe" opacity="0.7" />
      {/* Ruote */}
      <rect x="0" y="18" width="7" height="12" rx="3" fill="#1f2937" />
      <rect x="33" y="18" width="7" height="12" rx="3" fill="#1f2937" />
      <rect x="0" y="38" width="7" height="12" rx="3" fill="#1f2937" />
      <rect x="33" y="38" width="7" height="12" rx="3" fill="#1f2937" />
      {/* Fari anteriori (in basso perché va verso di noi) */}
      <rect x="8" y="44" width="8" height="4" rx="2" fill="#fef08a" />
      <rect x="24" y="44" width="8" height="4" rx="2" fill="#fef08a" />
      {/* Dettagli */}
      <rect x="14" y="50" width="12" height="2" rx="1" fill={color.roof} opacity="0.6" />
    </svg>
  );
}

// ─── SVG MACCHINA FERRARI (PLAYER) ───────────────────────────────────────────
function FerrariCar() {
  return (
    <svg viewBox="0 0 40 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
      {/* Corpo principale */}
      <rect x="5" y="10" width="30" height="44" rx="6" fill="#dc2626" />
      {/* Sfumatura carrozzeria */}
      <rect x="5" y="10" width="30" height="20" rx="6" fill="#ef4444" opacity="0.5" />
      {/* Tetto/Cockpit */}
      <rect x="12" y="14" width="16" height="14" rx="4" fill="#1a1a1a" />
      {/* Visiera pilota */}
      <rect x="14" y="15" width="12" height="8" rx="2" fill="#60a5fa" opacity="0.8" />
      {/* Ruote */}
      <rect x="1" y="14" width="7" height="14" rx="3.5" fill="#111827" />
      <rect x="32" y="14" width="7" height="14" rx="3.5" fill="#111827" />
      <rect x="1" y="36" width="7" height="14" rx="3.5" fill="#111827" />
      <rect x="32" y="36" width="7" height="14" rx="3.5" fill="#111827" />
      {/* Cerchi */}
      <circle cx="4.5" cy="21" r="2" fill="#374151" />
      <circle cx="35.5" cy="21" r="2" fill="#374151" />
      <circle cx="4.5" cy="43" r="2" fill="#374151" />
      <circle cx="35.5" cy="43" r="2" fill="#374151" />
      {/* Fari posteriori (il player va verso l'alto) */}
      <rect x="7" y="8" width="8" height="5" rx="2" fill="#fca5a5" />
      <rect x="25" y="8" width="8" height="5" rx="2" fill="#fca5a5" />
      {/* Ala posteriore */}
      <rect x="2" y="52" width="36" height="4" rx="2" fill="#991b1b" />
      {/* Numero */}
      <text x="20" y="35" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="monospace">16</text>
    </svg>
  );
}

// ─── SVG POWER-UP ENERGIA ────────────────────────────────────────────────────
function EnergyPickup() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="20" cy="20" r="18" fill="#422006" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="20" cy="20" r="18" fill="#f59e0b" opacity="0.15" />
      <polygon points="22,6 10,22 19,22 18,34 30,18 21,18" fill="#fbbf24" />
      <polygon points="22,6 10,22 19,22 18,34 30,18 21,18" fill="#fef08a" opacity="0.4" />
    </svg>
  );
}

// ─── COMPONENTE PRINCIPALE ────────────────────────────────────────────────────
export default function CircuitRush() {
  const router = useRouter();
  const { data: session } = useSession();

  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [carLane, setCarLane] = useState(1);
  const [obstacles, setObstacles] = useState([]);
  const [powerups, setPowerups] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_SPEED);
  const [lives, setLives] = useState(MAX_LIVES);
  const [km, setKm] = useState(0);
  const [earnedTokens, setEarnedTokens] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [flashHit, setFlashHit] = useState(false);
  const [flashEnergy, setFlashEnergy] = useState(false);
  const [roadOffset, setRoadOffset] = useState(0);

  const gameLoopRef = useRef();
  const lastObstacleRef = useRef(0);
  const lastPowerupRef = useRef(0);
  const scoreRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const livesRef = useRef(MAX_LIVES);
  const kmRef = useRef(0);
  const carLaneRef = useRef(1);

  // Sync carLane ref
  useEffect(() => { carLaneRef.current = carLane; }, [carLane]);

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

  const saveTokens = async (points) => {
    if (!session) return;
    const earned = Math.floor(points / 5);
    setEarnedTokens(earned);
    await addTokens(session, earned);
    setTotalTokens(prev => prev + earned);
  };

  const startGame = () => {
    scoreRef.current = 0;
    speedRef.current = INITIAL_SPEED;
    livesRef.current = MAX_LIVES;
    kmRef.current = 0;
    setScore(0);
    setEarnedTokens(0);
    setGameSpeed(INITIAL_SPEED);
    setLives(MAX_LIVES);
    setKm(0);
    setObstacles([]);
    setPowerups([]);
    setCarLane(1);
    setGameState('playing');
  };

  const takeDamage = useCallback(() => {
    const newLives = livesRef.current - 1;
    livesRef.current = newLives;
    setLives(newLives);
    setFlashHit(true);
    setTimeout(() => setFlashHit(false), 400);
    if (newLives <= 0) {
      setGameState('gameover');
      cancelAnimationFrame(gameLoopRef.current);
      saveTokens(scoreRef.current);
    }
  }, [session]);

  const collectEnergy = useCallback(() => {
    if (livesRef.current < MAX_LIVES) {
      const newLives = livesRef.current + 1;
      livesRef.current = newLives;
      setLives(newLives);
    }
    // Bonus score per energy
    scoreRef.current += 25;
    setScore(scoreRef.current);
    setFlashEnergy(true);
    setTimeout(() => setFlashEnergy(false), 500);
  }, []);

  const moveLeft = useCallback(() => {
    setCarLane(prev => {
      const next = Math.max(0, prev - 1);
      carLaneRef.current = next;
      return next;
    });
  }, []);

  const moveRight = useCallback(() => {
    setCarLane(prev => {
      const next = Math.min(2, prev + 1);
      carLaneRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, moveLeft, moveRight]);

  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;
    const now = Date.now();

    // Aggiorna km e velocità
    kmRef.current += speedRef.current * 0.002;
    const newKm = Math.floor(kmRef.current);
    setKm(newKm);

    // Velocità cresce gradualmente con i km, molto lenta all'inizio
    const targetSpeed = Math.min(MAX_SPEED, INITIAL_SPEED + (kmRef.current * 0.08));
    speedRef.current = speedRef.current + (targetSpeed - speedRef.current) * 0.01;
    setGameSpeed(speedRef.current);

    // Score cresce con i km
    scoreRef.current = newKm * 10;
    setScore(scoreRef.current);

    // Animazione strada
    setRoadOffset(prev => (prev + speedRef.current * 1.5) % 80);

    // Spawn ostacoli
    const spawnInterval = Math.max(600, 2200 - (speedRef.current * 120));
    if (now - lastObstacleRef.current > spawnInterval) {
      const rival = RIVAL_COLORS[Math.floor(Math.random() * RIVAL_COLORS.length)];
      setObstacles(prev => [...prev, {
        id: now,
        lane: Math.floor(Math.random() * 3),
        y: -12,
        color: rival,
      }]);
      lastObstacleRef.current = now;
    }

    // Spawn power-up energia (ogni 8-15 secondi circa)
    const powerupInterval = Math.max(8000, 15000 - (speedRef.current * 400));
    if (now - lastPowerupRef.current > powerupInterval) {
      setPowerups(prev => [...prev, {
        id: now + 1,
        lane: Math.floor(Math.random() * 3),
        y: -10,
      }]);
      lastPowerupRef.current = now;
    }

    // Muovi ostacoli e controlla collisioni
    setObstacles(prev =>
      prev.map(obs => ({ ...obs, y: obs.y + speedRef.current }))
        .filter(obs => {
          if (obs.y > 72 && obs.y < 88 && obs.lane === carLaneRef.current) {
            takeDamage();
            return false;
          }
          return obs.y < 110;
        })
    );

    // Muovi power-up e controlla raccolta
    setPowerups(prev =>
      prev.map(p => ({ ...p, y: p.y + speedRef.current }))
        .filter(p => {
          if (p.y > 72 && p.y < 88 && p.lane === carLaneRef.current) {
            collectEnergy();
            return false;
          }
          return p.y < 110;
        })
    );

    gameLoopRef.current = requestAnimationFrame(updateGame);
  }, [gameState, takeDamage, collectEnergy]);

  useEffect(() => {
    if (gameState === 'playing') gameLoopRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, updateGame]);

  const seo = {
    title: 'Circuit Rush — schiva i detriti in pista',
    description: 'Mini-gioco arcade a tema Ferrari: sfreccia in pista, schiva i detriti e raccogli energia per guadagnare SF Token.',
    path: '/games/circuit-rush',
  };

  return (
    <GameShell seo={seo} title="Circuit Rush" className="select-none touch-none">
      <div className="flex flex-col items-center">

        {/* HUD SUPERIORE */}
        <div className="max-w-[400px] w-full mb-4 flex justify-end items-center px-1">
          <div className="flex items-center gap-3 bg-[var(--fr-surface-2)] px-4 py-1.5 rounded-full">
            <Gauge className="w-4 h-4 text-[var(--fr-red)]" aria-hidden="true" />
            <span className="tabular font-bold text-xs text-[var(--fr-red)]">{(speedRef.current * 18).toFixed(0)} KM/H</span>
          </div>
        </div>

        {/* AREA GIOCO */}
        <div
          className={`relative w-full max-w-[400px] h-[650px] rounded-[32px] border-4 overflow-hidden shadow-[0_0_60px_rgba(255,0,0,0.15)] transition-all ${
            flashHit ? 'border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.6)]' :
            flashEnergy ? 'border-yellow-400 shadow-[0_0_60px_rgba(251,191,36,0.6)]' :
            'border-zinc-800'
          }`}
        >
          {/* ── STRADA ── */}
          <div className="absolute inset-0 bg-[#1a1a1a] overflow-hidden">
            {/* Asfalto con texture */}
            <div className="absolute inset-0" style={{
              background: 'repeating-linear-gradient(180deg, #1c1c1c 0px, #181818 4px, #1c1c1c 8px)',
            }} />

            {/* Guard rail sinistro */}
            <div className="absolute left-0 top-0 bottom-0 w-[14%] bg-gradient-to-r from-zinc-900 to-zinc-800 border-r-2 border-zinc-600">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(180deg, #dc2626 0px, #dc2626 20px, #fff 20px, #fff 40px)',
                opacity: 0.15,
              }} />
            </div>

            {/* Guard rail destro */}
            <div className="absolute right-0 top-0 bottom-0 w-[14%] bg-gradient-to-l from-zinc-900 to-zinc-800 border-l-2 border-zinc-600">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(180deg, #dc2626 0px, #dc2626 20px, #fff 20px, #fff 40px)',
                opacity: 0.15,
              }} />
            </div>

            {/* Linee di corsia animate */}
            {[33.33, 66.66].map((pos, i) => (
              <div key={i} className="absolute top-0 bottom-0 w-[3px] bg-transparent overflow-hidden" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
                {[...Array(12)].map((_, j) => (
                  <div
                    key={j}
                    className="absolute w-full bg-yellow-400 opacity-60 rounded-full"
                    style={{
                      height: '40px',
                      top: `${((j * 80 + roadOffset * 2) % (650 + 80)) - 80}px`,
                    }}
                  />
                ))}
              </div>
            ))}

            {/* Linee velocità (sfondo) */}
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute w-[1px] bg-white opacity-5"
                style={{
                  left: `${20 + i * 20}%`,
                  top: `${((roadOffset * 3 + i * 160) % 700) - 100}px`,
                  height: '120px',
                }}
              />
            ))}
          </div>

          {/* ── CONTROLLI TOUCH ── */}
          {gameState === 'playing' && (
            <div className="absolute inset-0 z-40 flex">
              <div className="w-1/2 h-full" onPointerDown={moveLeft} />
              <div className="w-1/2 h-full" onPointerDown={moveRight} />
            </div>
          )}

          {/* ── OVERLAY SCHERMATE ── */}
          <AnimatePresence>
            {gameState === 'idle' && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md"
              >
                <div className="w-28 h-28 mb-6 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]">
                  <FerrariCar />
                </div>
                <h2 className="text-4xl font-black uppercase italic mb-1 tracking-tighter">Circuit Rush</h2>
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-6">Maranello Racing Division</p>
                <div className="grid grid-cols-3 gap-3 w-full mb-8">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                    <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <p className="text-[9px] text-zinc-400 uppercase font-bold">3 Vite</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                    <Battery className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <p className="text-[9px] text-zinc-400 uppercase font-bold">Energia +vita</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                    <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-[9px] text-zinc-400 uppercase font-bold">Evita rivali</p>
                  </div>
                </div>
                {session && (
                  <p className="text-yellow-500 text-xs font-black mb-6">
                    Bilancio: {totalTokens.toLocaleString()} SFT
                  </p>
                )}
                <button onClick={startGame} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-600/30 transition-all active:scale-95">
                  🏁 Start Engine
                </button>
                <p className="text-zinc-600 text-[10px] uppercase tracking-widest mt-4">← Tocca i lati per sterzare →</p>
              </motion.div>
            )}

            {gameState === 'gameover' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md"
              >
                <AlertTriangle className="w-14 h-14 text-red-600 mb-3 animate-pulse" />
                <h2 className="text-4xl font-black uppercase italic mb-1 text-red-500">INCIDENTE</h2>
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-6">Gara terminata</p>

                <div className="grid grid-cols-2 gap-4 w-full mb-5">
                  <div className="bg-zinc-900 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Km percorsi</p>
                    <p className="text-2xl font-black font-mono text-white">{km} <span className="text-xs text-zinc-500">km</span></p>
                  </div>
                  <div className="bg-zinc-900 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Score</p>
                    <p className="text-2xl font-black font-mono text-white">{score}</p>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-3xl w-full mb-3">
                  <span className="text-3xl font-black text-yellow-400">+{earnedTokens} SFT</span>
                  <p className="text-[9px] text-yellow-500/60 uppercase font-bold tracking-widest mt-1">Accreditati</p>
                </div>
                <p className="text-zinc-600 text-xs font-bold mb-7">
                  Totale: <span className="text-zinc-300">{totalTokens.toLocaleString()} SFT</span>
                </p>

                <div className="flex flex-col w-full gap-3">
                  <button onClick={startGame} className="w-full py-4 bg-[var(--fr-red)] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 transition-all active:scale-95">
                    <RefreshCw className="w-5 h-5" /> Riprova
                  </button>
                  <button onClick={() => router.push('/fanzone')} className="w-full py-3 bg-[var(--fr-surface-2)] text-[var(--fr-text-muted)] rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all">
                    Esci
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── HUD IN-GAME ── */}
          {gameState === 'playing' && (
            <>
              {/* Score + KM */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
                <div className="bg-black/70 px-5 py-2 rounded-full border border-white/10 backdrop-blur-md">
                  <span className="font-mono text-xl font-black text-white">{km} <span className="text-xs text-zinc-500">km</span></span>
                </div>
              </div>

              {/* Vite */}
              <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-black/70 px-3 py-2 rounded-full border border-white/10 backdrop-blur-md">
                {[...Array(MAX_LIVES)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 transition-all ${i < lives ? 'text-red-500 fill-red-500' : 'text-[var(--fr-text-dim)]'}`}
                  />
                ))}
              </div>

              {/* Flash energia raccolta */}
              {flashEnergy && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30">
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.8 }}
                    animate={{ opacity: 1, y: -20, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-yellow-400 text-black font-black text-sm px-4 py-1 rounded-full"
                  >
                    ⚡ +ENERGIA!
                  </motion.div>
                </div>
              )}
            </>
          )}

          {/* ── MACCHINA PLAYER ── */}
          {gameState === 'playing' && (
            <motion.div
              animate={{ x: (carLane - 1) * 107 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`absolute bottom-10 left-1/2 -translate-x-1/2 w-[40px] h-[70px] z-20 pointer-events-none transition-opacity ${flashHit ? 'opacity-40' : 'opacity-100'}`}
            >
              <FerrariCar />
            </motion.div>
          )}

          {/* ── OSTACOLI (MACCHINE RIVALI) ── */}
          {obstacles.map(obs => (
            <div
              key={obs.id}
              className="absolute z-10 w-[40px] h-[64px]"
              style={{
                left: `${LANES[obs.lane]}%`,
                top: `${obs.y}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <RivalCar color={obs.color} />
            </div>
          ))}

          {/* ── POWER-UP ENERGIA ── */}
          {powerups.map(p => (
            <motion.div
              key={p.id}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="absolute z-10 w-[36px] h-[36px]"
              style={{
                left: `${LANES[p.lane]}%`,
                top: `${p.y}%`,
                transform: 'translateX(-50%)',
                filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.8))',
              }}
            >
              <EnergyPickup />
            </motion.div>
          ))}

          {/* ── FLASH HIT ── */}
          {flashHit && (
            <div className="absolute inset-0 z-50 bg-red-600/20 pointer-events-none animate-pulse" />
          )}
          {flashEnergy && (
            <div className="absolute inset-0 z-50 bg-yellow-400/10 pointer-events-none" />
          )}
        </div>

        <p className="mt-5 text-[10px] uppercase font-bold tracking-widest text-[var(--fr-text-faint)] md:hidden">
          ← Tocca sinistra/destra per sterzare →
        </p>
      </div>
    </GameShell>
  );
}
