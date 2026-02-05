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
  Loader2
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

  // Carica le domande dal JSON
  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch('/data/trivia-questions.json');
        const data = await response.json();
        setQuestions(data.questions || []);
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
          handleAnswer(null); // Tempo scaduto
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, showResult, currentQuestion, questions]);

  const handleAnswer = (optionIndex) => {
    if (selectedAnswer !== null || questions.length === 0) return;
    
    const question = questions[currentQuestion];
    const isCorrect = optionIndex === question.correct;
    const pointsEarned = isCorrect ? question.points : 0;
    
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
      points: pointsEarned,
      explanation: question.explanation
    }]);
    
    if (isCorrect) {
      setScore(prev => prev + pointsEarned);
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
    
    // Aggiorna token utente (30 SFT base + punti/10)
    const tokensEarned = 30 + Math.floor(finalScore / 10);
    if (session) {
      const newTokens = userTokens + tokensEarned;
      setUserTokens(newTokens);
      localStorage.setItem(`tokens_${session.user?.email}`, newTokens.toString());
    }
    
    setScore(finalScore);
  };

  const startGame = () => {
    if (questions.length === 0) return;
    
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(15);
    setAnswersHistory([]);
    setStreak(0);
    setMaxStreak(0);
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
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-red-600 font-black text-xs uppercase tracking-[0.3em] font-mono italic">
                Scuderia Ferrari Trivia
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6">
              F1 <span className="text-red-600">Knowledge</span> Challenge
            </h1>
            
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg italic">
              Dimostra di essere il più grande tifoso Ferrari rispondendo a {questions.length} domande.
              Più rispondi velocemente e correttamente, più punti guadagni!
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
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Streak Attuale</p>
                <p className="text-3xl font-black text-white flex items-center gap-2">
                  {streak}
                  <TrendingUp className={`w-5 h-5 ${streak >= 3 ? 'text-green-500' : 'text-zinc-500'}`} />
                </p>
              </div>
              <Zap className="text-red-500 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Tempo</p>
                <p className={`text-3xl font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </p>
              </div>
              <Timer className="text-yellow-500 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Token</p>
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
                  <Crown className="w-24 h-24 text-yellow-500 mx-auto mb-8" />
                  <h2 className="text-4xl font-black uppercase mb-4">Pronto per la sfida?</h2>
                  <p className="text-zinc-400 mb-10 max-w-md mx-auto">
                    Rispondi a {questions.length} domande sulla storia Ferrari. Ogni risposta corretta ti dà punti, 
                    il timer aggiunge pressione, e le streak moltiplicano il tuo punteggio!
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-2xl mx-auto">
                    <div className="p-6 bg-zinc-800/50 rounded-2xl">
                      <div className="text-green-500 text-sm font-bold mb-2">⭐ Facile: 30 punti</div>
                      <p className="text-zinc-500 text-xs">Domande base sulla Ferrari</p>
                    </div>
                    <div className="p-6 bg-zinc-800/50 rounded-2xl">
                      <div className="text-yellow-500 text-sm font-bold mb-2">⭐⭐ Medio: 50 punti</div>
                      <p className="text-zinc-500 text-xs">Record e statistiche</p>
                    </div>
                    <div className="p-6 bg-zinc-800/50 rounded-2xl">
                      <div className="text-red-500 text-sm font-bold mb-2">⭐⭐⭐ Difficile: 100 punti</div>
                      <p className="text-zinc-500 text-xs">Curiosità e dettagli tecnici</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-red-600 to-red-800 px-12 py-6 rounded-2xl text-xl font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-2xl"
                >
                  Inizia il Quiz
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
                  <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-8" />
                  <h2 className="text-5xl font-black uppercase mb-4">Quiz Completato!</h2>
                  <p className="text-zinc-400 text-xl mb-2">Il tuo punteggio finale</p>
                  <div className="text-7xl font-black text-yellow-500 mb-10">{score}</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
                    <div className="p-6 bg-zinc-800/50 rounded-2xl">
                      <div className="text-2xl font-black mb-2">{answersHistory.filter(a => a.correct).length}/{questions.length}</div>
                      <p className="text-zinc-500 text-sm">Risposte corrette</p>
                    </div>
                    <div className="p-6 bg-zinc-800/50 rounded-2xl">
                      <div className="text-2xl font-black mb-2">{maxStreak}</div>
                      <p className="text-zinc-500 text-sm">Streak massimo</p>
                    </div>
                    <div className="p-6 bg-zinc-800/50 rounded-2xl">
                      <div className="text-2xl font-black mb-2">+{30 + Math.floor(score/10)}</div>
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
            ) : (
              <motion.div 
                key="question"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* PROGRESS BAR */}
                <div className="mb-10">
                  <div className="flex justify-between text-sm text-zinc-500 mb-2">
                    <span>Domanda {currentQuestion + 1} di {questions.length}</span>
                    <span className={`font-bold ${getDifficultyColor(questions[currentQuestion].difficulty)}`}>
                      {questions[currentQuestion].difficulty} • {questions[currentQuestion].points} punti
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-800"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* QUESTION */}
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="px-4 py-2 bg-zinc-800 rounded-full text-xs font-black uppercase tracking-wider">
                      {questions[currentQuestion].category}
                    </div>
                    <div className="px-4 py-2 bg-red-900/30 border border-red-500/30 rounded-full text-xs font-black uppercase tracking-wider">
                      Streak: {streak} {streak >= 3 && '🔥'}
                    </div>
                  </div>
                  
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
                            <p className="text-zinc-300">+{questions[currentQuestion].points} punti</p>
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

        {/* RULES & INFO */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-zinc-900/20 border border-white/5 rounded-2xl">
            <h4 className="text-lg font-black mb-3 flex items-center gap-2">
              <Timer className="w-5 h-5 text-red-500" /> Regole del Gioco
            </h4>
            <ul className="text-zinc-400 text-sm space-y-2">
              <li>• 15 secondi per ogni risposta</li>
              <li>• Punti basati sulla difficoltà</li>
              <li>• Streak bonus per risposte consecutive</li>
              <li>• Tempo extra per risposte rapide</li>
            </ul>
          </div>
          
          <div className="p-6 bg-zinc-900/20 border border-white/5 rounded-2xl">
            <h4 className="text-lg font-black mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" /> Sistema Punti
            </h4>
            <ul className="text-zinc-400 text-sm space-y-2">
              <li>• Facile: 30 punti</li>
              <li>• Medio: 50 punti</li>
              <li>• Difficile: 100 punti</li>
              <li>• Bonus streak: +10 punti per ogni risposta consecutiva</li>
            </ul>
          </div>
          
          <div className="p-6 bg-zinc-900/20 border border-white/5 rounded-2xl">
            <h4 className="text-lg font-black mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-500" /> Ricompense SFT
            </h4>
            <ul className="text-zinc-400 text-sm space-y-2">
              <li>• Completamento quiz: 30 SFT</li>
              <li>• +1 SFT ogni 10 punti</li>
              <li>• Bonus streak massimo</li>
              <li>• I SFT si salvano automaticamente</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}