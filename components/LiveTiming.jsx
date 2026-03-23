// components/LiveTiming.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Zap, Radio, Map as MapIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  getLatestSession,
  getDrivers,
  getIntervals,
  openf1Fetch, // Per fetch generici
  getCarData,
  getWeatherData,
  getTeamRadio,
  MOCK_STANDINGS,
  MOCK_TELEMETRY,
  MOCK_WEATHER,
  MOCK_RADIO
} from '../lib/openf1';

export default function LiveTiming() {
  const [activeSession, setActiveSession] = useState('Race');
  const [sessionKey, setSessionKey] = useState(null);
  const [standings, setStandings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [telemetry, setTelemetry] = useState(MOCK_TELEMETRY);
  const [weather, setWeather] = useState(MOCK_WEATHER);
  const [radioMessages, setRadioMessages] = useState(MOCK_RADIO);
  const [loading, setLoading] = useState(true);
  const [currentLap, setCurrentLap] = useState(42);
  const [totalLaps, setTotalLaps] = useState(70);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  // Funzioni di formattazione
  const formatLapTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '--:--.---';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
  };

  const formatSectorTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '--.--';
    return seconds.toFixed(2);
  };

  // Inizializzazione sessione
  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const session = await getLatestSession(activeSession);
        
        if (session) {
          setSessionKey(session.session_key);
          setTotalLaps(session.total_laps || 70);
          setUseMockData(false);
          
          // Fetch drivers
          const driversData = await getDrivers(session.session_key);
          setDrivers(driversData);
        } else {
          console.log('Nessuna sessione attiva, uso dati mock');
          setUseMockData(true);
          setStandings(MOCK_STANDINGS);
        }
      } catch (err) {
        console.error('Errore inizializzazione:', err);
        setError(err.message);
        setUseMockData(true);
        setStandings(MOCK_STANDINGS);
      } finally {
        setLoading(false);
      }
    };
    
    initSession();
  }, [activeSession]);

  // Fetch dati live
  useEffect(() => {
    if (!sessionKey || useMockData) return;

    const fetchLiveData = async () => {
      try {
        // Fetch intervals and ALL laps once to optimize requests
        const [intervals, allLaps] = await Promise.all([
          getIntervals(sessionKey),
          openf1Fetch('/laps', { session_key: sessionKey })
        ]);
        
        if (intervals.length > 0) {
          // Raggruppa per driver (ultimo intervallo)
          const latestByDriver = intervals.reduce((acc, curr) => {
            if (!acc[curr.driver_number] || new Date(curr.date) > new Date(acc[curr.driver_number].date)) {
              acc[curr.driver_number] = curr;
            }
            return acc;
          }, {});

          // Costruisci classifica usando i dati già fetchati
          const standingsData = Object.values(latestByDriver).map((interval) => {
            const driver = drivers.find(d => d.driver_number === interval.driver_number) || {};
            // Filtra i laps per questo driver
            const driverLaps = allLaps.filter(l => l.driver_number === interval.driver_number);
            const latestLap = driverLaps[driverLaps.length - 1];

            return {
              pos: interval.position || 'N/A',
              car: interval.driver_number,
              driver: driver.full_name || `Driver ${interval.driver_number}`,
              gap: interval.gap_to_leader === null ? 'LEADER' : `+${interval.gap_to_leader?.toFixed(3) || '0'}s`,
              interval: interval.interval === null ? '-' : `+${interval.interval?.toFixed(3) || '0'}s`,
              lastLap: latestLap ? formatLapTime(latestLap.lap_duration) : '--:--.---',
              sector1: latestLap?.duration_sector_1 ? formatSectorTime(latestLap.duration_sector_1) : '--.--',
              sector2: latestLap?.duration_sector_2 ? formatSectorTime(latestLap.duration_sector_2) : '--.--',
              sector3: latestLap?.duration_sector_3 ? formatSectorTime(latestLap.duration_sector_3) : '--.--',
              tyres: latestLap?.compound || '?',
              tyreAge: latestLap?.tyre_age || 0,
              team_colour: driver.team_colour || '666666'
            };
          });

          standingsData.sort((a, b) => (a.pos > b.pos ? 1 : -1));
          setStandings(standingsData);
          
          // Aggiorna giro corrente (prendi il massimo giro trovato)
          const maxLap = Math.max(...allLaps.map(l => l.lap_number || 0));
          if (maxLap > 0) setCurrentLap(maxLap);
        }

        // Fetch telemetry per Leclerc (driver 16)
        const carData = await getCarData(sessionKey, 16);
        if (carData.length > 0) {
          const latest = carData[carData.length - 1];
          setTelemetry({
            speed: `${latest.speed || 0} km/h`,
            rpm: latest.rpm?.toLocaleString() || '0',
            throttle: `${latest.throttle || 0}%`,
            brake: typeof latest.brake === 'boolean' ? (latest.brake ? '100%' : '0%') : `${latest.brake || 0}%`,
            gear: latest.n_gear || 0,
            drs: latest.drs || 0
          });
        }

        // Fetch weather
        const weatherData = await getWeatherData(sessionKey);
        if (weatherData.length > 0) {
          const latest = weatherData[weatherData.length - 1];
          setWeather({
            airTemp: latest.air_temperature || '--',
            trackTemp: latest.track_temperature || '--',
            humidity: latest.humidity || '--',
            rainfall: latest.rainfall || 0
          });
        }

        // Fetch team radio
        const radioData = await getTeamRadio(sessionKey);
        if (radioData.length > 0) {
          const recent = radioData.slice(-3).reverse();
          setRadioMessages(recent.map(msg => ({
            time: new Date(msg.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            driver: drivers.find(d => d.driver_number === msg.driver_number)?.name_acronym || msg.driver_number,
            message: msg.recording_url ? '🎙️ Team radio' : msg.message || 'Radio communication',
            isYellow: false
          })));
        }
      } catch (error) {
        console.error('Error fetching live data:', error);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 10000); // Riduciamo a 10 secondi per essere più sicuri

    return () => clearInterval(interval);
  }, [sessionKey, useMockData, drivers]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ferrari-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Caricamento dati live...</p>
          {error && <p className="text-red-500 text-sm mt-2">Errore: {error}</p>}
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
                {useMockData ? '📁 Modalità Demo' : '🔴 Live • OpenF1'}
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase italic text-white">
              FERRARI <span className="text-ferrari-red">LIVE</span>
            </h1>
            <p className="text-gray-400 text-sm">
              {useMockData 
                ? 'Dati dimostrativi - Nessuna sessione in corso' 
                : 'Dati telemetrici in tempo reale'}
            </p>
          </div>
          
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
            {['Practice', 'Qualifying', 'Race'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSession(tab)}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${
                  activeSession === tab ? 'bg-ferrari-red text-white shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab === 'Practice' ? 'Prove' : tab === 'Qualifying' ? 'Qualifiche' : 'Gara'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Classifica */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/80">
              <h2 className="font-bold uppercase text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-ferrari-red" /> Classifica Live
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
                    <th className="p-4 text-center">Gomme</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {standings.map((driver, i) => (
                    <tr key={i} className="hover:bg-red-900/10 transition-colors">
                      <td className="p-4 font-bold text-white">{driver.pos}</td>
                      <td className="p-4 font-bold flex items-center gap-2">
                        <div 
                          className="w-1 h-4 rounded-full" 
                          style={{ backgroundColor: `#${driver.team_colour}` }}
                        />
                        <span className="text-white">{driver.driver}</span>
                      </td>
                      <td className="p-4 text-gray-400">{driver.gap}</td>
                      <td className="p-4 text-gray-300">{driver.interval}</td>
                      <td className="p-4 text-ferrari-yellow">{driver.lastLap}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                          driver.tyres === 'S' ? 'border-red-600 text-red-600' : 
                          driver.tyres === 'M' ? 'border-yellow-600 text-yellow-600' : 
                          driver.tyres === 'H' ? 'border-white text-white' :
                          'border-gray-600 text-gray-400'
                        }`}>
                          {driver.tyres}
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
            <p className="text-gray-500 uppercase font-bold text-xs">Mappa Circuito</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            <div className="mt-4 grid grid-cols-2 gap-4 w-full text-[10px] uppercase font-bold">
              <div className="bg-gray-800 p-2 rounded">Aria: {weather.airTemp}°C</div>
              <div className="bg-gray-800 p-2 rounded">Pista: {weather.trackTemp}°C</div>
              <div className="bg-gray-800 p-2 rounded">Umidità: {weather.humidity}%</div>
              <div className="bg-gray-800 p-2 rounded">Pioggia: {weather.rainfall ? 'Sì' : 'No'}</div>
            </div>
          </div>

          {/* Telemetry Focus */}
          <div className="bg-ferrari-red/10 border border-ferrari-red/30 rounded-xl p-6">
            <h3 className="text-ferrari-red font-black uppercase text-xs mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-ferrari-yellow" /> Leclerc Telemetria
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
                    className="h-full bg-ferrari-red"
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
                    animate={{ width: `${(parseInt(String(telemetry.rpm).replace(/,/g, '')) / 12000) * 100}%` }}
                    className="h-full bg-ferrari-red"
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
              {radioMessages.length === 0 && (
                <p className="text-gray-600">Nessun messaggio radio</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}