// services/ferrariPredictionService.js 
import { OpenF1Client } from '../lib/openf1/client';
import { FERRARI_DRIVERS, CIRCUITS_2025 } from '../lib/openf1/constants';
import ferrariStats from '../lib/db/ferrariStats.json';

export class FerrariPredictionService {
  static async predictRace(circuitId, sessionKey) {

    const circuit = CIRCUITS_2025.find(c => c.id === circuitId);
    const historical = ferrariStats.historicalPerformance[circuitId] || { strength: 0.5 };
    
    const weather = await OpenF1Client.getWeather(sessionKey);
    const weatherFactor = this.calculateWeatherFactor(weather);

    const [leclercRecent, sainzRecent] = await Promise.all([
      this.getRecentPerformance(FERRARI_DRIVERS.LECLERC.number),
      this.getRecentPerformance(FERRARI_DRIVERS.SAINZ.number)
    ]);
    
    const prediction = {
      circuit: circuit.name,
      date: new Date().toISOString(),
      podiumProbability: this.calculatePodiumProbability({
        historicalStrength: historical.strength,
        weatherFactor,
        leclercForm: leclercRecent.form,
        sainzForm: sainzRecent.form,
        circuitType: circuit.type
      }),
      predictedPositions: {
        leclerc: this.predictDriverPosition(leclercRecent, historical, weatherFactor),
        sainz: this.predictDriverPosition(sainzRecent, historical, weatherFactor)
      },
      keyFactors: this.identifyKeyFactors(circuit, weather, historical),
      confidence: 0.85 // 0-1
    };
    
    return prediction;
  }
  
  static calculateWeatherFactor(weatherData) {
    if (!weatherData || weatherData.length === 0) return 0.7;
    const latest = weatherData[weatherData.length - 1];

    let score = 0.5;
    
    if (latest.air_temperature >= 20 && latest.air_temperature <= 30) score += 0.3;
    if (latest.humidity >= 40 && latest.humidity <= 60) score += 0.2;
    if (latest.rainfall === 0) score += 0.2;
    
    return Math.min(1, score);
  }
  
  static async getRecentPerformance(driverNumber, sessions = 5) {
    // Ottieni ultime 5 sessioni del pilota
    const laps = await OpenF1Client.getDriverLaps(driverNumber);
    const recentLaps = laps.slice(-sessions * 50); // ~50 giri per sessione
    
    return {
      averageLapTime: this.calculateAverage(recentLaps.map(l => l.lap_duration)),
      consistency: this.calculateConsistency(recentLaps),
      bestLap: Math.min(...recentLaps.map(l => l.lap_duration)),
      form: 0.7 // Questo sarebbe calcolato in base ai risultati
    };
  }
  
  static calculatePodiumProbability(factors) {
    const weights = {
      historicalStrength: 0.4,
      weatherFactor: 0.2,
      leclercForm: 0.2,
      sainzForm: 0.1,
      circuitType: 0.1
    };
    
    let probability = 0;
    for (const [factor, weight] of Object.entries(weights)) {
      probability += factors[factor] * weight;
    }
    
    return Math.round(probability * 100);
  }
  
  static predictDriverPosition(performance, historical, weather) {
    const basePosition = Math.floor(performance.form * 10); // 1-10
    const adjusted = basePosition * (1 - historical.strength * 0.3) * weather;
    return Math.max(1, Math.min(20, Math.round(adjusted)));
  }
  
  static identifyKeyFactors(circuit, weather, historical) {
    const factors = [];
    
    if (historical.strength > 0.8) {
      factors.push({ 
        name: 'Performance Storica', 
        impact: 'Molto Alto', 
        icon: '📈',
        description: `Ferrari ha ${historical.wins || 0} vittorie qui`
      });
    }
    
    if (weather && weather.length > 0) {
      const w = weather[weather.length - 1];
      if (w.rainfall > 0) {
        factors.push({ 
          name: 'Condizioni Bagnate', 
          impact: 'Alto', 
          icon: '🌧️',
          description: 'Pioggia prevista durante la gara'
        });
      }
    }
    
    if (circuit.length > 6) {
      factors.push({ 
        name: 'Circuito Veloce', 
        impact: 'Medio', 
        icon: '⚡',
        description: 'Pista lunga favorevole alla potenza Ferrari'
      });
    }
    
    return factors;
  }
  
  // Helper functions
  static calculateAverage(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  
  static calculateConsistency(laps) {
    const times = laps.map(l => l.lap_duration).filter(t => t > 0);
    if (times.length < 2) return 1;
    const mean = this.calculateAverage(times);
    const variance = times.reduce((acc, t) => acc + Math.pow(t - mean, 2), 0) / times.length;
    return 1 / (1 + Math.sqrt(variance));
  }
}
