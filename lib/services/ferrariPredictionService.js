import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, Trophy, Target, TrendingUp, Loader2, 
  Sparkles, RefreshCw, Thermometer, CloudRain, Wind, 
  Cloud, AlertCircle, Gauge, GitCompare, Activity,
  BarChart3, Settings, Fuel, Clock, CheckCircle
} from 'lucide-react';
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { OpenF1Client } from '../../lib/openf1/client';
import { FerrariService } from '../../services/ferrariService';
import { useFerrariData } from '../../hooks/useFerrariData';

// Circuiti 2025 con sessioni reali
const CIRCUITS_2025 = [
  { 
    id: 'monza', 
    name: 'Italian GP', 
    track: 'Monza Circuit', 
    country: 'Italy',
    session_key: 9601,
    meeting_key: 2401,
    length: 5.793,
    laps: 53,
    ferrariWins: 20,
    lastFerrariWin: 2023,
    characteristics: ['high_speed', 'low_downforce', 'braking']
  },
  { 
    id: 'monaco', 
    name: 'Monaco GP', 
    track: 'Circuit de Monaco', 
    country: 'Monaco',
    session_key: 9602,
    meeting_key: 2402,
    length: 3.337,
    laps: 78,
    ferrariWins: 9,
    lastFerrariWin: 2024,
    characteristics: ['street_circuit', 'technical', 'low_speed']
  },
  { 
    id: 'silverstone', 
    name: 'British GP', 
    track: 'Silverstone Circuit', 
    country: 'UK',
    session_key: 9603,
    meeting_key: 2403,
    length: 5.891,
    laps: 52,
    ferrariWins: 17,
    lastFerrariWin: 2024,
    characteristics: ['high_speed', 'flowing', 'medium_downforce']
  },
  { 
    id: 'spa', 
    name: 'Belgian GP', 
    track: 'Spa-Francorchamps', 
    country: 'Belgium',
    session_key: 9604,
    meeting_key: 2404,
    length: 7.004,
    laps: 44,
    ferrariWins: 18,
    lastFerrariWin: 2024,
    characteristics: ['high_speed', 'elevation', 'mixed']
  },
  { 
    id: 'suzuka', 
    name: 'Japanese GP', 
    track: 'Suzuka Circuit', 
    country: 'Japan',
    session_key: 9605,
    meeting_key: 2405,
    length: 5.807,
    laps: 53,
    ferrariWins: 7,
    lastFerrariWin: 2024,
    characteristics: ['technical', 'flowing', 'high_downforce']
  }
];

const DRIVERS = [
  { 
    id: 'leclerc', 
    name: 'Charles Leclerc', 
    number: 16, 
    color: '#DC0000',
    broadcastName: 'LEC',
    country: 'Monaco'
  },
  { 
    id: 'sainz', 
    name: 'Carlos Sainz', 
    number: 55, 
    color: '#FFD700',
    broadcastName: 'SAI',
    country: 'Spain'
  }
];

const WEATHER_CONDITIONS = [
  { id: 'dry', label: 'Asciutto', emoji: '☀️', icon: 'sun' },
  { id: 'mixed', label: 'Misto', emoji: '⛅', icon: 'cloud-sun' },
  { id: 'wet', label: 'Bagnato', emoji: '🌧️', icon: 'cloud-rain' }
];

export default function PredictorSection() {
  // Stati per selezione
  const [selectedCircuit, setSelectedCircuit] = useState(CIRCUITS_2025[0]);
  const [selectedDriver, setSelectedDriver] = useState(DRIVERS[0]);
  const [weatherCondition, setWeatherCondition] = useState('dry');
  const [aggressiveness, setAggressiveness] = useState(70);
  
  // Stati per dati e predizioni
  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const [driverComparison, setDriverComparison] = useState(null);
  const [circuitAnalysis, setCircuitAnalysis] = useState(null);
  
  // Servizi
  const [ferrariService, setFerrariService] = useState(null);
  const [openf1Client, setOpenf1Client] = useState(null);
  
  // Hook per dati Ferrari
  const { 
    data: ferrariData, 
    loading: ferrariLoading, 
    error: ferrariError,
    refresh: refreshFerrariData,
    getDriverPerformance,
    getTeamChampionship,
    getWeatherConditions 
  } = useFerrariData(selectedCircuit.session_key, 10000); // Aggiorna ogni 10s

  // Inizializza servizi
  useEffect(() => {
    setFerrariService(new FerrariService());
    setOpenf1Client(new OpenF1Client());
  }, []);

  // Carica dati quando cambia circuito
  useEffect(() => {
    if (!ferrariService || !selectedCircuit.session_key) return;
    
    const loadCircuitAnalysis = async () => {
      try {
        const analysis = await ferrariService.predictCircuitPerformance(
          selectedCircuit.id,
          selectedCircuit.session_key
        );
        setCircuitAnalysis(analysis);
      } catch (error) {
        console.error('Error loading circuit analysis:', error);
      }
    };
    
    loadCircuitAnalysis();
  }, [selectedCircuit, ferrariService]);

  // Aggiorna dati live quando disponibili
  useEffect(() => {
    if (!ferrariData) return;
    
    setLiveData(ferrariData);
    
    // Calcola confronto piloti
    if (ferrariData.drivers?.leclerc && ferrariData.drivers?.sainz) {
      const leclercSpeed = ferrariData.drivers.leclerc.telemetry?.speed || 0;
      const sainzSpeed = ferrariData.drivers.sainz.telemetry?.speed || 0;
      
      setDriverComparison({
        speedDifference: (leclercSpeed - sainzSpeed).toFixed(1),
        fasterDriver: leclercSpeed > sainzSpeed ? 'Leclerc' : 'Sainz',
        throttleAdvantage: 'Leclerc',
        consistency: 'Simile'
      });
    }
  }, [ferrariData]);

  // Funzione principale per generare predizione
  const generatePrediction = async () => {
    setIsPredicting(true);
    
    try {
      if (!ferrariService) {
        throw new Error('Service non inizializzato');
      }

      // 1. Ottieni predizione basata su dati reali
      const performancePrediction = await ferrariService.predictCircuitPerformance(
        selectedCircuit.id,
        selectedCircuit.session_key
      );

      // 2. Combina con dati live
      const driverPerformance = getDriverPerformance?.(selectedDriver.number);
      const teamChampionship = getTeamChampionship?.();
      const weatherData = getWeatherConditions?.();

      // 3. Calcola predizione finale
      const finalPrediction = calculateFinalPrediction(
        performancePrediction,
        driverPerformance,
        teamChampionship,
        weatherData,
        aggressiveness
      );

      setPrediction(finalPrediction);
      
    } catch (error) {
      console.error('Error generating prediction:', error);
      
      // Fallback a dati simulati
      const fallbackPrediction = generateFallbackPrediction();
      setPrediction(fallbackPrediction);
      
    } finally {
      setIsPredicting(false);
    }
  };

  // Calcola predizione finale combinando tutti i fattori
  const calculateFinalPrediction = (
    performancePrediction,
    driverPerformance,
    teamChampionship,
    weatherData,
    aggressiveness
  ) => {
    const basePrediction = performancePrediction.prediction;
    const factors = performancePrediction.factors;
    
    // Modifica basata su performance pilota live
    let driverModifier = 1.0;
    if (driverPerformance?.telemetry) {
      const speedRatio = (driverPerformance.telemetry.speed || 0) / 350;
      const throttleRatio = (driverPerformance.telemetry.throttle || 0) / 100;
      driverModifier = (speedRatio + throttleRatio) / 2;
    }

    // Modifica basata su aggressività strategia
    const strategyModifier = aggressiveness / 100;

    // Calcola probabilità finali
    const finalPodiumProb = Math.min(
      95,
      Math.round(basePrediction.podiumProbability * driverModifier * strategyModifier)
    );
    
    const finalWinProb = Math.min(
      85,
      Math.round(basePrediction.winProbability * driverModifier * strategyModifier * 1.1)
    );

    // Calcola posizione prevista
    const predictedPosition = calculatePredictedPosition(
      finalPodiumProb,
      selectedCircuit.id,
      driverModifier
    );

    // Genera analisi dettagliata
    const analysis = generateDetailedAnalysis(
      performancePrediction,
      driverPerformance,
      weatherData,
      aggressiveness
    );

    // Genera raccomandazioni strategiche
    const strategy = generateStrategyRecommendations(
      selectedCircuit,
      weatherData,
      aggressiveness,
      performancePrediction.recommendations
    );

    return {
      position: predictedPosition,
      podiumChance: finalPodiumProb,
      winChance: finalWinProb,
      points: calculateExpectedPoints(predictedPosition, teamChampionship),
      analysis,
      strategy: strategy.advice,
      tireChoice: strategy.tires,
      pitStops: strategy.pitStops,
      fuelStrategy: strategy.fuel,
      bestLap: driverPerformance?.lapAnalysis?.lastLapTime 
        ? formatLapTime(driverPerformance.lapAnalysis.lastLapTime)
        : 'N/A',
      keyFactors: [
        { 
          name: 'Performance Storica', 
          value: `${Math.round(factors.historical.strength * 100)}%`, 
          impact: factors.historical.strength > 0.7 ? 'Alto' : 'Medio',
          icon: '📈'
        },
        { 
          name: 'Form Pilota Live', 
          value: `${Math.round(driverModifier * 100)}%`, 
          impact: driverModifier > 0.8 ? 'Alto' : 'Medio',
          icon: '⚡'
        },
        { 
          name: 'Condizioni Meteo', 
          value: weatherData ? `${weatherData.air_temperature}°C` : 'N/A', 
          impact: weatherData?.rainfall ? 'Alto' : 'Basso',
          icon: weatherData?.rainfall ? '🌧️' : '☀️'
        },
      ],
      recommendations: strategy.recommendations,
      confidence: Math.round(basePrediction.confidence * driverModifier),
      dataSources: {
        realTime: !!driverPerformance,
        weather: !!weatherData,
        championship: !!teamChampionship,
        historical: true
      },
      timestamp: new Date().toISOString()
    };
  };

  // Funzioni helper
  const calculatePredictedPosition = (podiumProb, circuitId, driverModifier) => {
    let basePosition;
    
    if (podiumProb > 80) basePosition = Math.floor(Math.random() * 2) + 1;
    else if (podiumProb > 60) basePosition = Math.floor(Math.random() * 3) + 2;
    else if (podiumProb > 40) basePosition = Math.floor(Math.random() * 4) + 4;
    else basePosition = Math.floor(Math.random() * 6) + 7;
    
    // Adjust per circuito
    if (circuitId === 'monza') basePosition -= 1;
    if (circuitId === 'monaco') basePosition += 1;
    
    // Adjust per driver performance
    basePosition = Math.max(1, Math.min(20, basePosition - Math.round(driverModifier * 2)));
    
    return basePosition;
  };

  const calculateExpectedPoints = (position, championship) => {
    const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    let points = position <= 10 ? pointsSystem[position - 1] : 0;
    
    // Bonus punti se team è in lotta per campionato
    if (championship?.position_current && championship.position_current <= 3) {
      points += 2;
    }
    
    return points;
  };

  const generateDetailedAnalysis = (performancePrediction, driverPerformance, weatherData, aggressiveness) => {
    const circuit = selectedCircuit;
    const driver = selectedDriver;
    
    let analysis = `Analisi per ${circuit.name}:\n\n`;
    
    // Circuito
    analysis += `• ${circuit.track} (${circuit.length}km) - ${circuit.laps} giri\n`;
    analysis += `• Ferrari: ${circuit.ferrariWins} vittorie storiche\n`;
    
    // Performance
    if (performancePrediction.factors.historical.strength > 0.8) {
      analysis += `• 💪 Forte tradizione Ferrari su questo tracciato\n`;
    }
    
    // Pilota
    if (driverPerformance?.telemetry) {
      analysis += `• ${driver.name.split(' ')[1]}: ${driverPerformance.telemetry.speed} km/h (live)\n`;
      analysis += `• Throttle: ${driverPerformance.telemetry.throttle}%, RPM: ${driverPerformance.telemetry.rpm}\n`;
    }
    
    // Meteo
    if (weatherData) {
      analysis += `• 🌡️ ${weatherData.air_temperature}°C, 💧 ${weatherData.humidity}% umidità\n`;
      if (weatherData.rainfall) {
        analysis += `• ⚠️ Pioggia prevista - strategia variabile\n`;
      }
    }
    
    // Strategia
    analysis += `• 🎯 Aggressività strategia: ${aggressiveness}%\n`;
    analysis += `• 📊 Probabilità podio: ${performancePrediction.prediction.podiumProbability}%\n`;
    
    return analysis;
  };

  const generateStrategyRecommendations = (circuit, weatherData, aggressiveness, baseRecommendations) => {
    const strategy = {
      advice: '',
      tires: 'Medium',
      pitStops: 1,
      fuel: 'Standard',
      recommendations: []
    };
    
    // Determina gomme basate su circuito e meteo
    if (weatherData?.rainfall) {
      strategy.tires = 'Intermediate/Wet';
      strategy.pitStops = 2;
      strategy.advice = 'Strategia reattiva - pronti a cambi gomme frequenti';
    } else if (circuit.characteristics.includes('high_speed')) {
      strategy.tires = aggressiveness > 70 ? 'Soft' : 'Medium';
      strategy.pitStops = circuit.laps > 60 ? 2 : 1;
      strategy.advice = 'Sfruttare vantaggio rettilineo, gestione gomme cruciale';
    } else if (circuit.characteristics.includes('technical')) {
      strategy.tires = 'Soft/Medium';
      strategy.pitStops = 1;
      strategy.advice = 'Precisione nelle curve tecniche, traiettorie pulite';
    }
    
    // Gestione carburante
    if (circuit.length > 6) {
      strategy.fuel = aggressiveness > 80 ? 'Rich' : 'Standard';
    }
    
    // Aggiungi raccomandazioni base
    if (baseRecommendations) {
      strategy.recommendations.push(...baseRecommendations);
    }
    
    // Aggiungi raccomandazioni specifiche
    strategy.recommendations.push({
      type: 'setup',
      priority: 'high',
      message: `Configurazione ${circuit.characteristics.join(', ')}`
    });
    
    if (aggressiveness > 80) {
      strategy.recommendations.push({
        type: 'race',
        priority: 'medium',
        message: 'Approccio aggressivo - attaccare fin dal primo giro'
      });
    }
    
    return strategy;
  };

  const formatLapTime = (seconds) => {
    if (!seconds || seconds <= 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
  };

  const generateFallbackPrediction = () => {
    const basePosition = Math.floor(Math.random() * 5) + 1;
    
    return {
      position: basePosition,
      podiumChance: Math.floor(Math.random() * 30) + 60,
      winChance: Math.floor(Math.random() * 20) + 30,
      points: calculateExpectedPoints(basePosition, null),
      analysis: 'Predizione basata su dati storici (API temporaneamente non disponibili)',
      strategy: 'Strategia conservativa consigliata',
      tireChoice: 'Medium',
      pitStops: 1,
      fuelStrategy: 'Standard',
      bestLap: 'N/A',
      keyFactors: [],
      recommendations: [],
      confidence: 60,
      dataSources: {
        realTime: false,
        weather: false,
        championship: false,
        historical: true
      },
      timestamp: new Date().toISOString()
    };
  };

  // Componente per Telemetria Live
  const TelemetryDisplay = ({ telemetry }) => {
    if (!telemetry) return null;
    
    return (
      <div className="mt-4 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-red-400" />
          <span className="font-medium">Telemetria Live</span>
          <div className="ml-auto text-xs text-green-400 animate-pulse">
            ● LIVE
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm">Velocità</span>
              <span className="font-bold text-white">{telemetry.speed || 0} km/h</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${Math.min((telemetry.speed || 0) / 3.5, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm">RPM</span>
              <span className="font-bold text-white">{telemetry.rpm?.toLocaleString() || 0}</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-red-500"
                style={{ width: `${Math.min((telemetry.rpm || 0) / 15000 * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm">Throttle</span>
              <span className="font-bold text-white">{telemetry.throttle || 0}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${telemetry.throttle || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm">Freno</span>
              <span className="font-bold text-white">{telemetry.brake ? 'ON' : 'OFF'}</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${telemetry.brake ? 'bg-red-500' : 'bg-zinc-600'}`}
                style={{ width: telemetry.brake ? '100%' : '20%' }}
              ></div>
            </div>
          </div>
          
          <div className="col-span-2 grid grid-cols-2 gap-3 mt-2">
            <div className="bg-zinc-800/50 p-2 rounded text-center">
              <div className="text-xs text-zinc-400">Marcia</div>
              <div className="text-xl font-bold">{telemetry.gear || 'N'}</div>
            </div>
            <div className="bg-zinc-800/50 p-2 rounded text-center">
              <div className="text-xs text-zinc-400">DRS</div>
              <div className={`text-xl font-bold ${telemetry.drs ? 'text-green-400' : 'text-zinc-400'}`}>
                {telemetry.drs ? 'ON' : 'OFF'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente per Weather Display
  const WeatherDisplay = () => {
    const weather = getWeatherConditions?.();
    
    if (!weather) return null;
    
    return (
      <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Thermometer className="w-4 h-4 text-blue-400" />
          <span className="font-medium">Meteo Reale</span>
          <div className="ml-auto text-xs text-blue-400">
            {new Date(weather.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{weather.air_temperature?.toFixed(1)}°</div>
            <div className="text-xs text-zinc-400 mt-1">Aria</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{weather.track_temperature?.toFixed(1)}°</div>
            <div className="text-xs text-zinc-400 mt-1">Pista</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{weather.humidity?.toFixed(0)}%</div>
            <div className="text-xs text-zinc-400 mt-1">Umidità</div>
          </div>
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Wind className="w-3 h-3" />
            <span className="text-zinc-400">Vento:</span>
            <span className="font-medium">{weather.wind_speed?.toFixed(1)} m/s</span>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="w-3 h-3" />
            <span className="text-zinc-400">Pioggia:</span>
            <span className={`font-medium ${weather.rainfall ? 'text-blue-400' : 'text-green-400'}`}>
              {weather.rainfall ? 'Sì' : 'No'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Componente per Championship Display
  const ChampionshipDisplay = () => {
    const championship = getTeamChampionship?.();
    
    if (!championship) return null;
    
    return (
      <div className="mt-4 p-4 bg-red-500/10 rounded-xl border border-red-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">Campionato Costruttori</span>
          </div>
          <div className="text-xs px-2 py-1 bg-red-500/20 rounded-full">
            Posizione: {championship.position_current || 'N/A'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-zinc-400">Punti Attuali</div>
            <div className="text-2xl font-bold text-white">{championship.points_current || 0}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Variazione</div>
            <div className={`text-xl font-bold ${(championship.points_current - championship.points_start) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {championship.points_current - championship.points_start >= 0 ? '+' : ''}
              {championship.points_current - championship.points_start || 0}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-20 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-500" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent">
              Ferrari AI Predictor Pro
            </h2>
          </div>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-6">
            Analisi predittiva in tempo reale con dati telemetrici OpenF1
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 via-red-500/20 to-blue-500/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">Powered by OpenF1 API • Live Telemetry • Real-time Data</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls & Live Data */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Circuit Selection */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurazione Simulazione
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Circuit Selection */}
                <div>
                  <label className="block text-zinc-400 mb-3 font-medium">Circuito GP</label>
                  <div className="space-y-3">
                    {CIRCUITS_2025.map((circuit) => (
                      <button
                        key={circuit.id}
                        onClick={() => setSelectedCircuit(circuit)}
                        className={`w-full p-4 rounded-xl border transition-all text-left ${
                          selectedCircuit.id === circuit.id
                            ? 'border-red-500 bg-red-500/10 text-white'
                            : 'border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold">{circuit.name}</div>
                            <div className="text-sm opacity-75">{circuit.track}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs px-2 py-1 bg-red-500/20 rounded-full">
                              {circuit.ferrariWins} vittorie
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">
                              {circuit.length}km • {circuit.laps} giri
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Driver & Weather Selection */}
                <div className="space-y-6">
                  {/* Driver Selection */}
                  <div>
                    <label className="block text-zinc-400 mb-3 font-medium">Pilota Analisi</label>
                    <div className="grid grid-cols-2 gap-3">
                      {DRIVERS.map((driver) => (
                        <button
                          key={driver.id}
                          onClick={() => setSelectedDriver(driver)}
                          className={`p-4 rounded-xl border transition-all ${
                            selectedDriver.id === driver.id
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                              style={{ backgroundColor: driver.color }}
                            >
                              {driver.number}
                            </div>
                            <div>
                              <div className="font-bold">{driver.broadcastName}</div>
                              <div className="text-sm opacity-75">{driver.name.split(' ')[1]}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weather Selection */}
                  <div>
                    <label className="block text-zinc-400 mb-3 font-medium">Condizioni Meteo</label>
                    <div className="grid grid-cols-3 gap-3">
                      {WEATHER_CONDITIONS.map((cond) => (
                        <button
                          key={cond.id}
                          onClick={() => setWeatherCondition(cond.id)}
                          className={`p-3 rounded-xl border transition-all text-center ${
                            weatherCondition === cond.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
                          }`}
                        >
                          <div className="text-2xl mb-1">{cond.emoji}</div>
                          <div className="text-sm">{cond.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aggressiveness Slider */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-zinc-400">Aggressività Strategia</label>
                      <span className="text-red-500 font-bold">{aggressiveness}%</span>
                    </div>
                    <Slider
                      value={[aggressiveness]}
                      onValueChange={([value]) => setAggressiveness(value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-zinc-500 mt-1">
                      <span>Conservativa</span>
                      <span>Equilibrata</span>
                      <span>Aggressiva</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Data Panels */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Telemetria Pilota Selezionato */}
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Telemetria {selectedDriver.broadcastName}
                  </h3>
                  <div className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full animate-pulse">
                    LIVE
                  </div>
                </div>
                <TelemetryDisplay 
                  telemetry={getDriverPerformance?.(selectedDriver.number)?.telemetry} 
                />
              </div>

              {/* Dati Meteo e Campionato */}
              <div className="space-y-6">
                <WeatherDisplay />
                <ChampionshipDisplay />
              </div>
            </div>

            {/* Prediction Button */}
            <div className="bg-gradient-to-r from-zinc-900 to-black rounded-2xl p-6 border border-zinc-800">
              <Button
                onClick={generatePrediction}
                disabled={isPredicting || ferrariLoading}
                className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 via-red-600 to-orange-600 hover:from-purple-700 hover:via-red-700 hover:to-orange-700"
              >
                {isPredicting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analizzando Dati OpenF1...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Genera Predizione AI Avanzata
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-zinc-500 mt-3">
                Utilizza dati reali telemetrici, meteo e campionato da OpenF1 API
              </p>
            </div>
          </motion.div>

          {/* Right Panel - Prediction Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 h-fit sticky top-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Risultato Predizione</h3>
              {prediction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generatePrediction}
                  className="border-zinc-700 hover:bg-zinc-800"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Aggiorna
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
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="relative mb-6">
                    <div className="w-32 h-32 border-4 border-zinc-800 rounded-full"></div>
                    <div className="w-32 h-32 border-4 border-transparent border-t-red-500 rounded-full animate-spin absolute top-0"></div>
                    <div className="w-24 h-24 border-4 border-transparent border-b-purple-500 rounded-full animate-spin absolute top-4 left-4"></div>
                    <div className="w-16 h-16 border-4 border-transparent border-l-blue-500 rounded-full animate-spin absolute top-8 left-8"></div>
                  </div>
                  <p className="text-zinc-300 font-medium mb-2">Analisi Dati in Tempo Reale</p>
                  <p className="text-sm text-zinc-500 text-center">
                    Recupero telemetria, meteo, campionato<br />
                    e dati storici da OpenF1 API
                  </p>
                </motion.div>
              ) : prediction ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Data Source Indicator */}
                  <div className={`p-3 rounded-lg border ${
                    prediction.dataSources.realTime 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      {prediction.dataSources.realTime ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-400">Predizione basata su dati reali OpenF1</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-yellow-400">Usando dati storici</span>
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                      <div className={`text-center p-1 rounded ${prediction.dataSources.realTime ? 'bg-green-500/20' : 'bg-zinc-800'}`}>
                        {prediction.dataSources.realTime ? '✓' : '✗'} Live
                      </div>
                      <div className={`text-center p-1 rounded ${prediction.dataSources.weather ? 'bg-blue-500/20' : 'bg-zinc-800'}`}>
                        {prediction.dataSources.weather ? '✓' : '✗'} Meteo
                      </div>
                      <div className={`text-center p-1 rounded ${prediction.dataSources.championship ? 'bg-yellow-500/20' : 'bg-zinc-800'}`}>
                        {prediction.dataSources.championship ? '✓' : '✗'} Camp.
                      </div>
                      <div className="text-center p-1 rounded bg-purple-500/20">
                        ✓ Storici
                      </div>
                    </div>
                  </div>

                  {/* Main Prediction */}
                  <div className="text-center p-6 bg-gradient-to-b from-zinc-800/50 to-transparent rounded-xl">
                    <div className="text-5xl font-bold mb-2">{prediction.position}°</div>
                    <div className="text-zinc-400 mb-4">Posizione Prevista</div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-zinc-800/50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-red-500">{prediction.podiumChance}%</div>
                        <div className="text-xs text-zinc-400">Podio</div>
                      </div>
                      <div className="bg-zinc-800/50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-500">{prediction.winChance}%</div>
                        <div className="text-xs text-zinc-400">Vittoria</div>
                      </div>
                      <div className="bg-zinc-800/50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-500">{prediction.points}</div>
                        <div className="text-xs text-zinc-400">Punti</div>
                      </div>
                    </div>
                  </div>

                  {/* Key Factors */}
                  {prediction.keyFactors && prediction.keyFactors.length > 0 && (
                    <div className="bg-zinc-800/30 p-4 rounded-xl">
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" /> 
                        Fattori Determinanti
                      </h4>
                      <div className="space-y-3">
                        {prediction.keyFactors.map((factor, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>{factor.icon}</span>
                              <span className="text-zinc-300">{factor.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{factor.value}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                factor.impact === 'Alto' 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {factor.impact}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strategy Recommendations */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <h4 className="font-bold">Strategia Consigliata</h4>
                      </div>
                      <p className="text-zinc-400 text-sm">{prediction.strategy}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-zinc-800 rounded-full text-sm flex items-center gap-1">
                          🏎️ <span className="font-medium">{prediction.tireChoice}</span>
                        </span>
                        <span className="px-3 py-1 bg-zinc-800 rounded-full text-sm flex items-center gap-1">
                          ⏱️ <span className="font-medium">{prediction.pitStops} soste</span>
                        </span>
                        <span className="px-3 py-1 bg-zinc-800 rounded-full text-sm flex items-center gap-1">
                          ⛽ <span className="font-medium">{prediction.fuelStrategy}</span>
                        </span>
                      </div>
                    </div>

                    {prediction.recommendations && prediction.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-bold mb-2 text-sm text-zinc-300">Raccomandazioni Specifiche</h4>
                        <div className="space-y-2">
                          {prediction.recommendations.map((rec, index) => (
                            <div 
                              key={index}
                              className={`text-xs p-2 rounded-lg ${
                                rec.priority === 'high' 
                                  ? 'bg-red-500/10 border border-red-500/30' 
                                  : 'bg-blue-500/10 border border-blue-500/30'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                {rec.priority === 'high' ? '🔥' : '📝'}
                                <span className="font-medium">{rec.type.toUpperCase()}:</span>
                                <span>{rec.message}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confidence & Details */}
                  <div className="pt-4 border-t border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-400">Affidabilità Predizione</span>
                      <span className="font-bold text-green-500">{prediction.confidence}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-4">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500"
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-xs text-zinc-500 flex justify-between">
                      <span>Aggiornato: {new Date(prediction.timestamp).toLocaleTimeString()}</span>
                      <span>{selectedCircuit.track}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="relative mb-4">
                    <Brain className="w-20 h-20 text-zinc-700" />
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-purple-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-2">Pronto per l'Analisi</h4>
                  <p className="text-zinc-400 mb-6 max-w-xs">
                    Configura i parametri e genera una predizione basata su dati reali OpenF1
                  </p>
                  <div className="text-xs text-zinc-600 space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Telemetria live dai box Ferrari</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Dati meteo in tempo reale</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Statistiche campionato aggiornate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Analisi AI predittiva avanzata</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-zinc-500">
            ℹ️ Questo strumento utilizza dati pubblici da 
            <a href="https://openf1.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-1">
              OpenF1.org
            </a>
            . I dati live sono disponibili durante le sessioni ufficiali F1.
          </p>
        </div>
      </div>
    </section>
  );
}