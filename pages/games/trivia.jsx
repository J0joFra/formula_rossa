import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  CheckCircle, 
  XCircle, 
  Timer, 
  Zap,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  Crown,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useSession } from "next-auth/react";

export default function F1TriviaQuiz() {
  const router = useRouter();
  const { data: session } = useSession();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameStarted, setGameStarted] = useState(false);
  const [userTokens, setUserTokens] = useState(0);
  const [answersHistory, setAnswersHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeExpired, setTimeExpired] = useState(false);

  // Carica le domande dal JSON
  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch('/data/trivia-questions.json');
        const data = await response.json();
        
        // Mescola le domande casualmente
        const allQuestions = data.questions || [];
        const shuffledQuestions = [...allQuestions].sort(() => Math.random() - 0.5);
        
        // Prendi solo le prime 10 domande (opzionale)
        const limitedQuestions = shuffledQuestions.slice(0, 10);
        
        setQuestions(limitedQuestions);
      } catch (error) {
        console.error("Errore nel caricamento delle domande:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  // Caricamento token utente
  useEffect(() => {
    if (session) {
      const saved = localStorage.getItem(`tokens_${session.user?.email}`) || '1250';
      setUserTokens(parseInt(saved));
    }
  }, [session]);

  // Timer per ogni domanda
  useEffect(() => {
    if (!gameStarted || showResult || currentQuestion >= questions.length || questions.length === 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // TEMPO SCADUTO - FINE QUIZ
          clearInterval(timer);
          setTimeExpired(true);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, showResult, currentQuestion, questions]);

  const handleAnswer = (optionIndex) => {
    if (selectedAnswer !== null || questions.length === 0 || timeExpired) return;
    
    const question = questions[currentQuestion];
    const isCorrect = optionIndex === question.correct;
    const pointsEarned = isCorrect ? question.points : 0;
    
    // Bonus per risposta rapida 
    const speedBonus = timeLeft > 10 ? Math.floor(question.points * 0.2) : 0;
    const totalPoints = pointsEarned + speedBonus;
    
    // Aggiorna streak
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setStreak(0);
    }
    
    setSelectedAnswer(optionIndex);
    setAnswersHistory([...answersHistory, { 
      questionId: question.id, 
      answer: optionIndex, 
      correct: isCorrect,
      points: totalPoints,
      explanation: question.explanation,
      speedBonus: speedBonus > 0 ? speedBonus : 0
    }]);
    
    if (isCorrect) {
      setScore(prev => prev + totalPoints);
    }
    
    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setTimeLeft(15);
      } else {
        endGame();
      }
    }, 1500);
  };

  const endGame = () => {
    setShowResult(true);
    
    // Assegna bonus per streak massimo
    const streakBonus = Math.floor(maxStreak * 10);
    const finalScore = score + streakBonus;
    
    // Penalità se il tempo è scaduto
    const timePenalty = timeExpired ? Math.floor(finalScore * 0.3) : 0;
    const adjustedScore = Math.max(0, finalScore - timePenalty);
    
    // Aggiorna token utente (30 SFT base + punti/10)
    const tokensEarned = 30 + Math.floor(adjustedScore / 10);
    if (session) {
      const newTokens = userTokens + tokensEarned;
      setUserTokens(newTokens);
      localStorage.setItem(`tokens_${session.user?.email}`, newTokens.toString());
    }
    
    setScore(adjustedScore);
  };

  const startGame = () => {
    if (questions.length === 0) return;
    
    // Rimescola le domande ad ogni nuovo gioco
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffledQuestions);
    
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(15);
    setAnswersHistory([]);
    setStreak(0);
    setMaxStreak(0);
    setTimeExpired(false);
  };

  const getAnswerColor = (optionIndex) => {
    if (selectedAnswer === null || questions.length === 0) return "bg-zinc-800 hover:bg-zinc-700";
    if (optionIndex === questions[currentQuestion].correct) {
      return "bg-green-900/50 border-green-500";
    }
    if (optionIndex === selectedAnswer && optionIndex !== questions[currentQuestion].correct) {
      return "bg-red-900/50 border-red-500";
    }
    return "bg-zinc-800";
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'Hard': return 'text-red-500';
      default: return 'text-zinc-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-6" />
          <p className="text-red-600 font-black tracking-widest uppercase italic">Caricamento domande...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <Navigation />
        <main className="max-w-6xl mx-auto pt-32 px-4 pb-20 text-center">
          <h1 className="text-5xl font-black uppercase mb-6">Errore nel caricamento</h1>
          <p className="text-zinc-400 mb-8">Le domande del quiz non sono disponibili.</p>
          <button
            onClick={() => router.push('/fanzone')}
            className="bg-gradient-to-r from-red-600 to-red-800 px-8 py-4 rounded-2xl font-black uppercase"
          >
            Torna alla Fan Zone
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation />
      
      <main className="max-w-6xl mx-auto pt-32 px-4 pb-20">
        {/* HEADER */}
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <Timer className="w-8 h-8 text-red-500" />
              <span className="text-red-600 font-black text-xs uppercase tracking-[0.3em] font-mono italic">
                Scuderia Ferrari Trivia • TIMED • DOMANDE RANDOM
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6">
              F1 <span className="text-red-600">Speed</span> Challenge
            </h1>
            
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg italic">
              <span className="text-red-500 font-bold">15 secondi totali per rispondere!</span><br/>
              Rispondi velocemente e correttamente prima che il tempo scada.<br/>
              <span className="text-yellow-500 font-bold">Domande random ad ogni gioco!</span>
            </p>
          </motion.div>
        </header>

        {/* GAME STATS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Punteggio</p>
                <p className="text-3xl font-black text-white">{score}</p>
              </div>
              <Star className="text-yellow-500 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Tempo Restante</p>
                <p className={`text-3xl font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 
                             timeLeft <= 10 ? 'text-yellow-500' : 'text-white'}`}>
                  {timeLeft}s
                </p>
              </div>
              <Timer className="text-red-500 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Domanda</p>
                <p className="text-3xl font-black text-white">
                  {currentQuestion + 1}<span className="text-zinc-500 text-lg">/{questions.length}</span>
                </p>
              </div>
              <Zap className="text-yellow-500 w-8 h-8" />
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

        {/* GAME AREA */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm p-8">
          <AnimatePresence mode="wait">
            {!gameStarted ? (
              <motion.div 
                key="start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="mb-10">
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    <Timer className="w-32 h-32 text-red-500 absolute inset-0" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-black text-white">15s</span>
                    </div>
                  </div>
                  <h2 className="text-4xl font-black uppercase mb-4">Sfida a Tempo!</h2>
                  <p className="text-zinc-400 mb-10 max-w-md mx-auto">
                    <span className="text-red-500 font-bold">SOLO 15 SECONDI TOTALI!</span><br/>
                    Rispondi alle domande il più velocemente possibile prima che il tempo scada.<br/>
                    <span className="text-yellow-500 font-bold">Domande random ad ogni gioco!</span>
                  </p>
                  
                  {/* REGOLE RAPIDE */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-2xl mx-auto">
                    <div className="p-6 bg-zinc-800/50 rounded-2xl border border-red-500/20">
                      <div className="text-red-500 text-sm font-bold mb-2">🎲 Random</div>
                      <p className="text-zinc-500 text-xs">Domande diverse ogni volta</p>
                    </div>
                    <div className="p-6 bg-zinc-800/50 rounded-2xl border border-yellow-500/20">
                      <div className="text-yellow-500 text-sm font-bold mb-2">⚡ Bonus Velocità</div>
                      <p className="text-zinc-500 text-xs">+20% punti se rispondi in 5s</p>
                    </div>
                    <div className="p-6 bg-zinc-800/50 rounded-2xl border border-red-500/20">
                      <div className="text-red-500 text-sm font-bold mb-2">⚠️ Fine Quiz</div>
                      <p className="text-zinc-500 text-xs">Tempo scaduto = quiz finito</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-red-600 to-red-800 px-12 py-6 rounded-2xl text-xl font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-2xl"
                >
                  Accetta la Sfida
                </button>
              </motion.div>
            ) : showResult ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="mb-12">
                  {timeExpired ? (
                    <>
                      <AlertTriangle className="w-32 h-32 text-red-500 mx-auto mb-8" />
                      <h2 className="text-5xl font-black uppercase mb-4">Tempo Scaduto!</h2>
                      <p className="text-zinc-400 text-xl mb-2">
                        Il timer di 15 secondi è terminato. Il quiz è finito.
                      </p>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-8" />
                      <h2 className="text-5xl font-black uppercase mb-4">Quiz Completato!</h2>
                    </>
                  )}
                  
                  <p className="text-zinc-400 text-xl mb-2">Il tuo punteggio finale</p>
                  <div className={`text-7xl font-black mb-10 ${timeExpired ? 'text-red-500' : 'text-yellow-500'}`}>
                    {score}
                  </div>
                  
                  {timeExpired && (
                    <div className="mb-8 p-6 bg-red-900/20 border border-red-500/30 rounded-2xl max-w-md mx-auto">
                      <p className="text-red-300">
                        <span className="font-bold">Penalità tempo:</span> -30% del punteggio
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
                    <div className="p-6 bg-zinc-800/50 rounded-2xl">
                      <div className="text-2xl font-black mb-2">
                        {answersHistory.filter(a => a.correct).length}/{answersHistory.length}
                      </div>
                      <p className="text-zinc-500 text-sm">Risposte corrette</p>
                    </div>
                    <div className="p-6 bg-zinc-800/50 rounded-2xl">
                      <div className="text-2xl font-black mb-2">
                        {timeExpired ? '0' : questions.length - answersHistory.length}
                      </div>
                      <p className="text-zinc-500 text-sm">Domande saltate</p>
                    </div>
                    <div className="p-6 bg-zinc-800/50 rounded-2xl">
                      <div className="text-2xl font-black mb-2">+{30 + Math.floor(score/10)}</div>
                      <p className="text-zinc-500 text-sm">SFT guadagnati</p>
                    </div>
                  </div>
                  
                  {/* BONUS VELOCITÀ */}
                  {answersHistory.filter(a => a.speedBonus > 0).length > 0 && (
                    <div className="mb-8 p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-2xl max-w-md mx-auto">
                      <h4 className="text-yellow-500 font-bold mb-2">⚡ Bonus Velocità</h4>
                      <p className="text-zinc-300">
                        Hai ottenuto <span className="text-yellow-500 font-bold">
                          +{answersHistory.reduce((sum, a) => sum + (a.speedBonus || 0), 0)} punti
                        </span> per risposte rapide!
                      </p>
                    </div>
                  )}
                  
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
            ) : (
              <motion.div 
                key="question"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* TIMER VISIVO GRANDE */}
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-zinc-500">
                      Tempo totale rimasto: <span className={`font-bold ${timeLeft <= 5 ? 'text-red-500' : 
                                                           timeLeft <= 10 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {timeLeft}s
                      </span>
                    </div>
                    <div className="text-sm text-zinc-500">
                      Domanda: {currentQuestion + 1}/{questions.length}
                    </div>
                  </div>
                  
                  {/* PROGRESS BAR DEL TEMPO TOTALE */}
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-2">
                    <motion.div 
                      className={`h-full ${timeLeft <= 5 ? 'bg-red-600' : 
                                  timeLeft <= 10 ? 'bg-yellow-600' : 'bg-green-600'}`}
                      initial={{ width: '100%' }}
                      animate={{ width: `${(timeLeft / 15) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                  
                  {/* INDICATORI TEMPO */}
                  <div className="flex justify-between text-[10px] text-zinc-600 font-bold">
                    <span>15s</span>
                    <span>10s</span>
                    <span>5s</span>
                    <span>0s</span>
                  </div>
                </div>

                {/* DIFFICOLTÀ */}
                <div className="flex justify-between text-sm text-zinc-500 mb-6">
                  <span className={`font-bold ${getDifficultyColor(questions[currentQuestion].difficulty)}`}>
                    {questions[currentQuestion].difficulty} • {questions[currentQuestion].points} punti
                  </span>
                  <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs">
                    {questions[currentQuestion].category}
                  </span>
                </div>

                {/* QUESTION */}
                <div className="mb-12">
                  <h3 className="text-3xl md:text-4xl font-black leading-tight mb-10">
                    {questions[currentQuestion].question}
                  </h3>

                  {/* OPTIONS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {questions[currentQuestion].options.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                        whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                        onClick={() => selectedAnswer === null && handleAnswer(index)}
                        className={`p-6 text-left rounded-2xl border-2 transition-all ${getAnswerColor(index)}`}
                        disabled={selectedAnswer !== null}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                              ${selectedAnswer === null ? 'bg-zinc-700' : 
                                index === questions[currentQuestion].correct ? 'bg-green-700' :
                                index === selectedAnswer ? 'bg-red-700' : 'bg-zinc-700'}`}
                            >
                              <span className="font-black">{String.fromCharCode(65 + index)}</span>
                            </div>
                            <span className="text-xl font-medium">{option}</span>
                          </div>
                          
                          {selectedAnswer !== null && (
                            <div>
                              {index === questions[currentQuestion].correct ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              ) : index === selectedAnswer ? (
                                <XCircle className="w-6 h-6 text-red-500" />
                              ) : null}
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* FEEDBACK */}
                {selectedAnswer !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-2xl mb-8 ${selectedAnswer === questions[currentQuestion].correct ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}
                  >
                    <div className="flex items-center gap-4">
                      {selectedAnswer === questions[currentQuestion].correct ? (
                        <>
                          <CheckCircle className="w-8 h-8 text-green-500" />
                          <div>
                            <h4 className="text-xl font-black text-green-500">Esatto!</h4>
                            <p className="text-zinc-300">
                              +{questions[currentQuestion].points} punti
                              {answersHistory[answersHistory.length - 1]?.speedBonus > 0 && (
                                <span className="text-yellow-500 ml-2">
                                  (+{answersHistory[answersHistory.length - 1].speedBonus} bonus velocità!)
                                </span>
                              )}
                            </p>
                            <p className="text-zinc-400 text-sm mt-2">{questions[currentQuestion].explanation}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-8 h-8 text-red-500" />
                          <div>
                            <h4 className="text-xl font-black text-red-500">Risposta errata!</h4>
                            <p className="text-zinc-300">
                              La risposta corretta era: <span className="text-white font-bold">
                                {questions[currentQuestion].options[questions[currentQuestion].correct]}
                              </span>
                            </p>
                            <p className="text-zinc-400 text-sm mt-2">{questions[currentQuestion].explanation}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AVVISO TEMPO */}
        {gameStarted && !showResult && timeLeft <= 5 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-8 p-6 bg-red-900/30 border border-red-500/50 rounded-2xl text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
              <span className="text-red-300 font-bold">
                ATTENZIONE! Solo {timeLeft} secondi rimasti!
              </span>
            </div>
          </motion.div>
        )}

        {/* RULES & INFO */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-zinc-900/20 border border-white/5 rounded-2xl border-red-500/20">
            <h4 className="text-lg font-black mb-3 flex items-center gap-2">
              <Timer className="w-5 h-5 text-red-500" /> Regole Tempo
            </h4>
            <ul className="text-zinc-400 text-sm space-y-2">
              <li>• <span className="text-red-500 font-bold">15 secondi TOTALI</span> per il quiz</li>
              <li>• Tempo scaduto = quiz terminato</li>
              <li>• Penalità -30% se il tempo scade</li>
              <li>• Bonus +20% per risposte in &lt;5s</li>
            </ul>
          </div>
          
          <div className="p-6 bg-zinc-900/20 border border-white/5 rounded-2xl">
            <h4 className="text-lg font-black mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" /> Strategia
            </h4>
            <ul className="text-zinc-400 text-sm space-y-2">
              <li>• Rispondi velocemente, non riflettere troppo</li>
              <li>• Salta le domande difficili se necessario</li>
              <li>• Concentrati su quelle che sai</li>
              <li>• Il tempo non si ferma tra le domande</li>
            </ul>
          </div>
          
          <div className="p-6 bg-zinc-900/20 border border-white/5 rounded-2xl">
            <h4 className="text-lg font-black mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-500" /> Ricompense
            </h4>
            <ul className="text-zinc-400 text-sm space-y-2">
              <li>• Completamento: 30 SFT</li>
              <li>• +1 SFT ogni 10 punti</li>
              <li>• Bonus velocità extra</li>
              <li>• Penalità tempo: -30%</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}