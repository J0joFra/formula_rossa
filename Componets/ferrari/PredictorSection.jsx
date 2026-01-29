// PredictorSection.jsx - VERSIONE CORRETTA
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Trophy, Target, TrendingUp, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

const circuits2025 = [
  { id: 'monza', name: 'Italian GP', track: 'Monza', country: 'Italy' },
  { id: 'monaco', name: 'Monaco GP', track: 'Monte Carlo', country: 'Monaco' },
  { id: 'silverstone', name: 'British GP', track: 'Silverstone', country: 'UK' },
  { id: 'spa', name: 'Belgian GP', track: 'Spa-Francorchamps', country: 'Belgium' },
  { id: 'suzuka', name: 'Japanese GP', track: 'Suzuka', country: 'Japan' },
];

const drivers = [
  { id: 'leclerc', name: 'Charles Leclerc', number: 16, color: '#DC0000' },
  { id: 'hamilton', name: 'Lewis Hamilton', number: 44, color: '#FFD700' },
];

const weatherConditions = [
  { id: 'dry', label: 'Asciutto', emoji: '☀️' },
  { id: 'mixed', label: 'Misto', emoji: '⛅' },
  { id: 'wet', label: 'Bagnato', emoji: '🌧️' },
];

export default function PredictorSection() {
  const [selectedCircuit, setSelectedCircuit] = useState(circuits2025[0]);
  const [selectedDriver, setSelectedDriver] = useState(drivers[0]);
  const [weather, setWeather] = useState('dry');
  const [aggressiveness, setAggressiveness] = useState(70);
  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const generatePrediction = () => {
    setIsPredicting(true);
    
    // Simula elaborazione AI
    setTimeout(() => {
      const basePosition = Math.floor(Math.random() * 5) + 1;
      const podiumChance = Math.floor(Math.random() * 30) + 60;
      const winChance = Math.floor(Math.random() * 20) + 30;
      const points = Math.floor(Math.random() * 10) + 15;
      
      const trackType = selectedCircuit.id === 'monza' ? 'alta velocità' : 
                       selectedCircuit.id === 'monaco' ? 'cittadino' : 
                       selectedCircuit.id === 'spa' ? 'misto' : 'medio';
      
      const driverType = selectedDriver.id === 'leclerc' ? 'aggressivo' : 'strategico';
      
      const advice = weather === 'wet' ? 'Pneumatici intermedi, attenzione alle pozzanghere' :
                    weather === 'mixed' ? 'Strategia a due soste, pronto a cambiare gomme' :
                    'Pneumatici soft, attacco fin dal primo giro';
      
      setPrediction({
        position: basePosition,
        podiumChance,
        winChance,
        points,
        analysis: `Il ${trackType} di ${selectedCircuit.track} favorisce lo stile ${driverType} di ${selectedDriver.name.split(' ')[1]}.`,
        strategy: advice,
        bestLap: `1:${Math.floor(Math.random() * 30) + 20}.${Math.floor(Math.random() * 999)}`,
        tireChoice: weather === 'wet' ? 'Intermedi' : weather === 'mixed' ? 'Misto' : 'Soft',
      });
      
      setIsPredicting(false);
    }, 1500);
  };

  return (
    <section className="py-20 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-500" />
            <h2 className="text-4xl font-bold">Ferrari AI Predictor</h2>
          </div>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-6">
            Simula la performance della Ferrari nelle prossime gare con il nostro algoritmo predittivo
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-red-500/20 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">Powered by Machine Learning</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800"
          >
            <h3 className="text-2xl font-bold mb-6">Configura Simulazione</h3>
            
            {/* Circuit Selection */}
            <div className="mb-6">
              <label className="block text-zinc-400 mb-2">Circuito GP</label>
              <div className="grid grid-cols-2 gap-3">
                {circuits2025.map((circuit) => (
                  <button
                    key={circuit.id}
                    onClick={() => setSelectedCircuit(circuit)}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedCircuit.id === circuit.id
                        ? 'border-red-500 bg-red-500/10 text-white'
                        : 'border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-bold">{circuit.name}</div>
                      <div className="text-sm opacity-75">{circuit.track}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Driver Selection */}
            <div className="mb-6">
              <label className="block text-zinc-400 mb-2">Pilota</label>
              <div className="flex gap-4">
                {drivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => setSelectedDriver(driver)}
                    className={`flex-1 p-4 rounded-xl border transition-all ${
                      selectedDriver.id === driver.id
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold">
                        {driver.number}
                      </div>
                      <div className="text-left">
                        <div className="font-bold">{driver.name.split(' ')[1]}</div>
                        <div className="text-sm opacity-75">{driver.name.split(' ')[0]}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Weather */}
            <div className="mb-6">
              <label className="block text-zinc-400 mb-2">Condizioni Meteo</label>
              <div className="flex gap-3">
                {weatherConditions.map((cond) => (
                  <button
                    key={cond.id}
                    onClick={() => setWeather(cond.id)}
                    className={`flex-1 p-3 rounded-xl border transition-all text-center ${
                      weather === cond.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cond.emoji}</div>
                    <div>{cond.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aggressiveness Slider */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <label className="text-zinc-400">Aggressività Strategia</label>
                <span className="text-red-500 font-bold">{aggressiveness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={aggressiveness}
                onChange={(e) => setAggressiveness(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>Conservativa</span>
                <span>Equilibrata</span>
                <span>Aggressiva</span>
              </div>
            </div>

            {/* Predict Button */}
            <Button
              onClick={generatePrediction}
              disabled={isPredicting}
              className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700"
            >
              {isPredicting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analizzando...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Genera Predizione AI
                </>
              )}
            </Button>
          </motion.div>

          {/* Right Panel - Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Risultato Predizione</h3>
              {prediction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generatePrediction}
                  className="border-zinc-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Ricalcola
                </Button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isPredicting ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-zinc-800 rounded-full"></div>
                    <div className="w-24 h-24 border-4 border-transparent border-t-red-500 rounded-full animate-spin absolute top-0"></div>
                  </div>
                  <p className="mt-6 text-zinc-400">Elaborazione dati in corso...</p>
                </motion.div>
              ) : prediction ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Position */}
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-2">{prediction.position}°</div>
                    <div className="text-zinc-400">Posizione Prevista</div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-zinc-800/50 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-red-500">{prediction.podiumChance}%</div>
                      <div className="text-sm text-zinc-400 mt-1">Podio</div>
                    </div>
                    <div className="bg-zinc-800/50 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-yellow-500">{prediction.winChance}%</div>
                      <div className="text-sm text-zinc-400 mt-1">Vittoria</div>
                    </div>
                    <div className="bg-zinc-800/50 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-green-500">{prediction.points}</div>
                      <div className="text-sm text-zinc-400 mt-1">Punti</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <h4 className="font-bold">Analisi Circuito</h4>
                      </div>
                      <p className="text-zinc-400">{prediction.analysis}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <h4 className="font-bold">Strategia Consigliata</h4>
                      </div>
                      <p className="text-zinc-400">{prediction.strategy}</p>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span className="px-3 py-1 bg-zinc-800 rounded-full">Gomme: {prediction.tireChoice}</span>
                        <span className="px-3 py-1 bg-zinc-800 rounded-full">Miglior giro: {prediction.bestLap}</span>
                      </div>
                    </div>
                  </div>

                  {/* Success Indicator */}
                  <div className="pt-4 border-t border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-400">Probabilità Successo</span>
                      <span className="font-bold text-green-500">Alta</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                        style={{ width: `${prediction.podiumChance}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <Brain className="w-16 h-16 text-zinc-700 mb-4" />
                  <h4 className="text-xl font-bold mb-2">Nessuna Predizione</h4>
                  <p className="text-zinc-400 max-w-sm">
                    Configura i parametri e clicca "Genera Predizione" per vedere l'analisi AI
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
