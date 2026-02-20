import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Clock, Zap, Radio, Map as MapIcon } from 'lucide-react';
import { motion } from 'framer-motion';

// Dati mock spostati FUORI dal componente (a livello globale)
const MOCK_STANDINGS = [
  { pos: 1, car: '16', driver: 'Charles Leclerc', gap: 'LEADER', interval: '-', lastLap: '1:14.562', sector1: '22.1', sector2: '31.4', sector3: '21.0', tyres: 'S', tyreAge: 5, team_colour: 'DC0000' },
  { pos: 2, car: '44', driver: 'Lewis Hamilton', gap: '+1.245', interval: '+1.245', lastLap: '1:14.890', sector1: '22.3', sector2: '31.5', sector3: '21.0', tyres: 'S', tyreAge: 6, team_colour: '00D2BE' },
  { pos: 3, car: '1', driver: 'Max Verstappen', gap: '+3.567', interval: '+2.322', lastLap: '1:15.102', sector1: '22.4', sector2: '31.8', sector3: '21.1', tyres: 'M', tyreAge: 12, team_colour: '3671C6' },
  { pos: 4, car: '63', driver: 'George Russell', gap: '+5.234', interval: '+1.667', lastLap: '1:15.345', sector1: '22.6', sector2: '32.0', sector3: '21.3', tyres: 'M', tyreAge: 14, team_colour: '00D2BE' },
  { pos: 5, car: '55', driver: 'Carlos Sainz', gap: '+7.891', interval: '+2.657', lastLap: '1:15.678', sector1: '22.8', sector2: '32.2', sector3: '21.5', tyres: 'H', tyreAge: 20, team_colour: 'DC0000' },
];

// MOCK per telemetry
const MOCK_TELEMETRY = {
  speed: '312 km/h',
  rpm: '11,400',
  throttle: '100%',
  brake: '0%',
  gear: 8,
  drs: 12
};

// MOCK per weather
const MOCK_WEATHER = {
  airTemp: '24',
  trackTemp: '38',
  humidity: '45',
  rainfall: 0
};

// MOCK per radio
const MOCK_RADIO = [
  { time: '14:32:01', driver: 'LEC', message: 'Pitting this lap.', isYellow: false },
  { time: '14:31:45', driver: 'ENG', message: 'Box box, confirm.', isYellow: false },
  { time: '14:28:10', driver: 'RACE', message: 'Yellow Flag Sector 2', isYellow: true },
];

export default function LiveTiming() {
  const [activeSession, setActiveSession] = useState('Race');
  const [sessionKey, setSessionKey] = useState(null);
  const [standings, setStandings] = useState([]);
  const [telemetry, setTelemetry] = useState(MOCK_TELEMETRY);
  const [weather, setWeather] = useState(MOCK_WEATHER);
  const [radioMessages, setRadioMessages] = useState(MOCK_RADIO);
  const [loading, setLoading] = useState(true);
  const [currentLap, setCurrentLap] = useState(42);
  const [totalLaps, setTotalLaps] = useState(70);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  // Funzione per formattare i tempi in modo sicuro
  const formatValue = (value, defaultValue = '--') => {
    if (value === undefined || value === null) return defaultValue;
    return String(value);
  };

  // Ottieni la sessione corrente
  useEffect(() => {
    const fetchLatestSession = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prima prova a ottenere il meeting più recente
        const meetingResponse = await fetch('https://api.openf1.org/v1/meetings?meeting_key=latest');
        
        if (!meetingResponse.ok) {
          throw new Error(`HTTP ${meetingResponse.status}`);
        }
        
        const meetings = await meetingResponse.json();
        
        if (meetings.length === 0) {
          throw new Error('No meetings found');
        }
        
        const meetingKey = meetings[0].meeting_key;
        
        // Poi ottieni le sessioni
        const sessionResponse = await fetch(`https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}&session_name=${activeSession}`);
        
        if (!sessionResponse.ok) {
          throw new Error(`HTTP ${sessionResponse.status}`);
        }
        
        const sessions = await sessionResponse.json();
        
        if (sessions.length > 0) {
          setSessionKey(sessions[0].session_key);
          setTotalLaps(sessions[0].total_laps || 70);
          setUseMockData(false);
        } else {
          // Nessuna sessione trovata, usa mock
          setUseMockData(true);
          setStandings(MOCK_STANDINGS);
        }
      } catch (err) {
        console.error('Errore nel fetch:', err.message);
        setError(err.message);
        setUseMockData(true);
        setStandings(MOCK_STANDINGS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestSession();
  }, [activeSession]);

  // Fetch dati live solo se non siamo in modalità mock
  useEffect(() => {
    if (!sessionKey || useMockData || !sessionKey.startsWith('9')) return; // Le sessioni reali iniziano con 9 di solito
    
    const fetchLiveData = async () => {
      try {
        // Fetch intervals
        const intervalsRes = await fetch(`https://api.openf1.org/v1/intervals?session_key=${sessionKey}`);
        if (intervalsRes.ok) {
          const intervals = await intervalsRes.json();
          if (intervals.length > 0) {
            // Processa i dati...
            const formatted = intervals.slice(0, 5).map((item, idx) => ({
              pos: idx + 1,
              car: item.driver_number,
              driver: `Driver ${item.driver_number}`,
              gap: item.gap_to_leader === null ? 'LEADER' : `+${item.gap_to_leader?.toFixed(3) || '0'}s`,
              interval: item.interval === null ? '-' : `+${item.interval?.toFixed(3) || '0'}s`,
              lastLap: '--:--.---',
              sector1: '--.--',
              sector2: '--.--',
              sector3: '--.--',
              tyres: '?',
              tyreAge: 0,
              team_colour: '666666'
            }));
            setStandings(formatted);
          }
        }
      } catch (err) {
        console.error('Errore fetch live:', err);
        // Non cambiare i dati in caso di errore
      }
    };
    
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 10000); // Ogni 10 secondi
    
    return () => clearInterval(interval);
  }, [sessionKey, useMockData]);

  // Funzioni di formattazione sicure
  const formatLapTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '--:--.---';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Caricamento dati OpenF1...</p>
          {error && <p className="text-red-500 text-sm mt-2">Errore: {error}</p>}
          <p className="text-gray-600 text-xs mt-4">Uso dati di esempio in assenza di connessione</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 ${useMockData ? 'bg-yellow-500' : 'bg-green-500'} rounded-full animate-pulse`} />
              <span className={`${useMockData ? 'text-yellow-500' : 'text-green-500'} font-bold uppercase tracking-widest text-xs`}>
                {useMockData ? '📁 Dati di Esempio' : '🔴 Live • OpenF1'}
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase italic">Grand Prix Centre</h1>
            <p className="text-gray-400 text-sm">
              {useMockData 
                ? 'Modalità demo - nessuna sessione attiva' 
                : 'Dati reali da OpenF1 API'}
            </p>
          </div>
          
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
            {['Practice', 'Qualifying', 'Race'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSession(tab)}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${
                  activeSession === tab ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Standings Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/80">
              <h2 className="font-bold uppercase text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" /> Classifica Live
              </h2>
              <span className="text-[10px] text-gray-500 font-mono">
                GIRO {currentLap}/{totalLaps}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800 text-[10px] uppercase">
                    <th className="p-4">Pos</th>
                    <th className="p-4">Pilota</th>
                    <th className="p-4">Distacco</th>
                    <th className="p-4">Interval</th>
                    <th className="p-4">Ultimo Giro</th>
                    <th className="p-4 text-center">Pneum.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {standings.map((driver, i) => (
                    <tr key={i} className="hover:bg-red-900/10 transition-colors">
                      <td className="p-4 font-bold">{driver.pos}</td>
                      <td className="p-4 font-bold flex items-center gap-2">
                        <div 
                          className="w-1 h-4" 
                          style={{ backgroundColor: `#${driver.team_colour || '666666'}` }}
                        />
                        <span>{driver.driver}</span>
                      </td>
                      <td className="p-4 text-gray-400">{formatValue(driver.gap)}</td>
                      <td className="p-4 text-gray-300">{formatValue(driver.interval)}</td>
                      <td className="p-4 text-yellow-400">{formatValue(driver.lastLap)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                          driver.tyres === 'S' ? 'border-red-600 text-red-600' : 
                          driver.tyres === 'M' ? 'border-yellow-600 text-yellow-600' : 
                          driver.tyres === 'H' ? 'border-white text-white' :
                          'border-gray-600 text-gray-400'
                        }`}>
                          {formatValue(driver.tyres, '?')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Track Map */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] relative">
            <MapIcon className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-gray-500 uppercase font-bold text-xs">Mappa del Circuito</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            <div className="mt-4 grid grid-cols-2 gap-4 w-full text-[10px] uppercase font-bold">
              <div className="bg-gray-800 p-2 rounded">Aria: {weather.airTemp}°C</div>
              <div className="bg-gray-800 p-2 rounded">Pista: {weather.trackTemp}°C</div>
              <div className="bg-gray-800 p-2 rounded">Umidità: {weather.humidity}%</div>
              <div className="bg-gray-800 p-2 rounded">Pioggia: {weather.rainfall ? 'Sì' : 'No'}</div>
            </div>
          </div>

          {/* Telemetry Focus */}
          <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-6">
            <h3 className="text-red-600 font-black uppercase text-xs mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Leclerc Telemetria
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                  <span>Velocità</span>
                  <span className="text-gray-300">{telemetry.speed}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, parseInt(telemetry.speed) / 3.5)}%` }}
                    className="h-full bg-red-600"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                  <span>RPM</span>
                  <span className="text-gray-300">{telemetry.rpm}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(parseInt(String(telemetry.rpm).replace(',', '')) / 12000) * 100}%` }}
                    className="h-full bg-red-600"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                  <span>Acceleratore</span>
                  <span className="text-gray-300">{telemetry.throttle}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: telemetry.throttle }}
                    className="h-full bg-green-600"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                  <span>Freno</span>
                  <span className="text-gray-300">{telemetry.brake}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: telemetry.brake }}
                    className="h-full bg-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Radio Messages */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 font-bold uppercase text-[10px] mb-3 flex items-center gap-2">
              <Radio className="w-3 h-3" /> Team Radio
            </h3>
            <div className="space-y-2 text-[10px] font-mono">
              {radioMessages.map((msg, i) => (
                <p key={i} className={msg.isYellow ? 'text-yellow-400' : 'text-blue-400'}>
                  {msg.time} - {msg.driver}: "{msg.message}"
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}