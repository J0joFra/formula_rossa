import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Trophy, Target, TrendingUp, Loader2, Sparkles, RefreshCw } from 'lucide-react';

const circuits2025 = [
  { name: 'Bahrain GP', track: 'Sakhir' },
  { name: 'Saudi Arabian GP', track: 'Jeddah' },
  { name: 'Australian GP', track: 'Melbourne' },
  { name: 'Japanese GP', track: 'Suzuka' },
  { name: 'Chinese GP', track: 'Shanghai' },
  { name: 'Miami GP', track: 'Miami' },
  { name: 'Emilia Romagna GP', track: 'Imola' },
  { name: 'Monaco GP', track: 'Monte Carlo' },
  { name: 'Spanish GP', track: 'Barcelona' },
  { name: 'Canadian GP', track: 'Montreal' },
  { name: 'Azerbaijan GP', track: 'Baku' },
  { name: 'British GP', track: 'Silverstone' },
  { name: 'Belgian GP', track: 'Spa' },
  { name: 'Italian GP', track: 'Monza' },
  { name: 'Singapore GP', track: 'Marina Bay' },
  { name: 'Abu Dhabi GP', track: 'Yas Marina' },
];

const drivers = [
  { id: 'leclerc', name: 'Charles Leclerc', number: 16 },
  { id: 'hamilton', name: 'Lewis Hamilton', number: 44 },
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
    
    setTimeout(() => {
      const basePosition = Math.floor(Math.random() * 5) + 1;
      const podiumChance = Math.floor(Math.random() * 30) + 60;
      const winChance = Math.floor(Math.random() * 20) + 30;
      const points = Math.floor(Math.random() * 10) + 15;
      
      setPrediction({
        position: basePosition,
        podiumChance,
        winChance,
        points,
        analysis: `Il circuito ${selectedCircuit.track} favorisce uno stile aggressivo come quello di ${selectedDriver.name.split(' ')[1]}.`,
        strategy: weather === 'wet' ? 'Pneumatici intermedi, attenzione alle pozzanghere' : 'Pneumatici soft, attacco fin dal primo giro',
        bestLap: `1:${Math.floor(Math.random() * 30) + 20}.${Math.floor(Math.random() * 999)}`,
        tireChoice: weather === 'wet' ? 'Intermedi' : 'Soft',
      });
      
      setIsPredicting(false);
    }, 1500);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-500" />
            <h2 className="text-4xl font-bold text-white">Ferrari AI Predictor</h2>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto mb-6">
            Simula la performance della Ferrari nelle prossime gare con il nostro algoritmo predittivo
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-ferrari-red/20 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-ferrari-yellow" />
            <span className="text-sm text-gray-300">Powered by Machine Learning</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Configura Simulazione</h3>
            
            {/* Circuit Selection */}
            <div className="mb-6">
              <label className="block text-gray-400 mb-3 font-medium">Gran Premio</label>
              <div className="grid grid-cols-2 gap-3">
                {circuits2025.slice(0, 4).map((circuit, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCircuit(circuit)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      selectedCircuit.name === circuit.name
                        ? 'border-ferrari-red bg-ferrari-red/10 text-white'
                        : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-bold">{circuit.name}</div>
                    <div className="text-sm opacity-75">{circuit.track}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Driver Selection */}
            <div className="mb-6">
              <label className="block text-gray-400 mb-3 font-medium">Pilota</label>
              <div className="flex gap-4">
                {drivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => setSelectedDriver(driver)}
                    className={`flex-1 p-4 rounded-xl border transition-all ${
                      selectedDriver.id === driver.id
                        ? 'border-ferrari-red bg-ferrari-red/10'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        selectedDriver.id === driver.id ? 'bg-ferrari-red' : 'bg-gray-700'
                      }`}>
                        {driver.number}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white">{driver.name.split(' ')[1]}</div>
                        <div className="text-sm text-gray-400">{driver.name.split(' ')[0]}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Weather */}
            <div className="mb-6">
              <label className="block text-gray-400 mb-3 font-medium">Condizioni Meteo</label>
              <div className="flex gap-3">
                {[
                  { id: 'dry', label: 'Asciutto', emoji: '☀️' },
                  { id: 'mixed', label: 'Misto', emoji: '⛅' },
                  { id: 'wet', label: 'Pioggia', emoji: '🌧️' },
                ].map((cond) => (
                  <button
                    key={cond.id}
                    onClick={() => setWeather(cond.id)}
                    className={`flex-1 p-3 rounded-xl border transition-all text-center ${
                      weather === cond.id
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-gray-600'
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
                <label className="text-gray-400 font-medium">Aggressività Strategia</label>
                <span className="text-ferrari-red font-bold">{aggressiveness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={aggressiveness}
                onChange={(e) => setAggressiveness(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Conservativa</span>
                <span>Equilibrata</span>
                <span>Aggressiva</span>
              </div>
            </div>

            {/* Predict Button */}
            <button
              onClick={generatePrediction}
              disabled={isPredicting}
              className="w-full py-4 text-lg bg-gradient-to-r from-purple-600 to-ferrari-red hover:from-purple-700 hover:to-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPredicting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                  Analizzando...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2 inline" />
                  Calcola Predizione AI
                </>
              )}
            </button>
          </motion.div>

          {/* Right Panel - Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Risultati Predizione</h3>
              {prediction && (
                <button
                  onClick={generatePrediction}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors text-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Ricalcola
                </button>
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
                    <div className="w-24 h-24 border-4 border-gray-800 rounded-full"></div>
                    <div className="w-24 h-24 border-4 border-transparent border-t-ferrari-red rounded-full animate-spin absolute top-0"></div>
                  </div>
                  <p className="mt-6 text-gray-400">Elaborazione dati in corso...</p>
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
                    <div className="text-6xl font-bold text-white mb-2">{prediction.position}°</div>
                    <div className="text-gray-400">Posizione Prevista</div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-ferrari-red">{prediction.podiumChance}%</div>
                      <div className="text-sm text-gray-400 mt-1">Podio</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-ferrari-yellow">{prediction.winChance}%</div>
                      <div className="text-sm text-gray-400 mt-1">Vittoria</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-green-500">{prediction.points}</div>
                      <div className="text-sm text-gray-400 mt-1">Punti</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <h4 className="font-bold text-white">Analisi Circuito</h4>
                      </div>
                      <p className="text-gray-400">{prediction.analysis}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <h4 className="font-bold text-white">Strategia Consigliata</h4>
                      </div>
                      <p className="text-gray-400">{prediction.strategy}</p>
                      <div className="mt-3 flex gap-4">
                        <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">Gomme: {prediction.tireChoice}</span>
                        <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">Miglior giro: {prediction.bestLap}</span>
                      </div>
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
                  <Brain className="w-16 h-16 text-gray-700 mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">Nessuna Predizione</h4>
                  <p className="text-gray-400 max-w-sm">
                    Configura i parametri e clicca "Calcola Predizione" per vedere l'analisi AI
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
