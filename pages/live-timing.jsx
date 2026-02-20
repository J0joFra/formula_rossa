import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Clock, Zap, Radio, Map as MapIcon, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveTiming() {
  const [activeSession, setActiveSession] = useState('Race');
  const [sessionKey, setSessionKey] = useState(null);
  const [standings, setStandings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [telemetry, setTelemetry] = useState({});
  const [weather, setWeather] = useState({});
  const [radioMessages, setRadioMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLap, setCurrentLap] = useState(0);
  const [totalLaps, setTotalLaps] = useState(70); // Default

  // Get current/latest session
  useEffect(() => {
    const fetchLatestSession = async () => {
      try {
        const response = await fetch('https://api.openf1.org/v1/sessions?session_name=' + activeSession + '&meeting_key=latest');
        const sessions = await response.json();
        if (sessions.length > 0) {
          setSessionKey(sessions[0].session_key);
          setTotalLaps(sessions[0].total_laps || 70);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    
    fetchLatestSession();
  }, [activeSession]);

  // Fetch drivers for current session
  useEffect(() => {
    if (!sessionKey) return;
    
    const fetchDrivers = async () => {
      try {
        const response = await fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`);
        const data = await response.json();
        setDrivers(data);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };
    
    fetchDrivers();
  }, [sessionKey]);

  // Fetch live intervals 
  const fetchIntervals = useCallback(async () => {
    if (!sessionKey) return;
    
    try {
      const response = await fetch(`https://api.openf1.org/v1/intervals?session_key=${sessionKey}`);
      const intervals = await response.json();
      
      // Get latest interval for each driver
      const latestIntervals = intervals.reduce((acc, curr) => {
        if (!acc[curr.driver_number] || new Date(curr.date) > new Date(acc[curr.driver_number].date)) {
          acc[curr.driver_number] = curr;
        }
        return acc;
      }, {});
      
      // Combine with driver info and fetch lap times
      const driverStandings = await Promise.all(
        Object.values(latestIntervals).map(async (interval) => {
          const driver = drivers.find(d => d.driver_number === interval.driver_number) || {};
          
          // Get latest lap for this driver
          const lapResponse = await fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}&driver_number=${interval.driver_number}`);
          const laps = await lapResponse.json();
          const latestLap = laps.length > 0 ? laps[laps.length - 1] : null;
          
          return {
            pos: interval.position || 'N/A',
            car: interval.driver_number,
            driver: driver.full_name || `Driver ${interval.driver_number}`,
            gap: interval.gap_to_leader === null ? 'LEADER' : `+${interval.gap_to_leader.toFixed(3)}s`,
            interval: interval.interval === null ? '-' : `+${interval.interval.toFixed(3)}s`,
            lastLap: latestLap ? formatLapTime(latestLap.lap_duration) : '--:--.---',
            sector1: latestLap ? formatSectorTime(latestLap.sectors?.[0]) : '--.--',
            sector2: latestLap ? formatSectorTime(latestLap.sectors?.[1]) : '--.--',
            sector3: latestLap ? formatSectorTime(latestLap.sectors?.[2]) : '--.--',
            tyres: latestLap?.compound?.[0] || '?',
            tyreAge: latestLap?.tyre_age || 0,
            team_colour: driver.team_colour || '666666'
          };
        })
      );
      
      // Sort by position
      driverStandings.sort((a, b) => (a.pos > b.pos ? 1 : -1));
      setStandings(driverStandings);
      
      // Update current lap from leader's lap count
      if (driverStandings.length > 0) {
        const leaderLap = await fetchLeaderLap();
        if (leaderLap) setCurrentLap(leaderLap);
      }
    } catch (error) {
      console.error('Error fetching intervals:', error);
    }
  }, [sessionKey, drivers]);

  // Fetch leader's lap count
  const fetchLeaderLap = async () => {
    try {
      const response = await fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}&driver_number=${standings[0]?.car}`);
      const laps = await response.json();
      return laps.length;
    } catch {
      return 0;
    }
  };

  // Fetch car telemetry for focus driver (e.g., Leclerc #16)
  const fetchTelemetry = useCallback(async () => {
    if (!sessionKey) return;

    const focusDriver = 16; 
    
    try {
      const response = await fetch(`https://api.openf1.org/v1/car_data?session_key=${sessionKey}&driver_number=${focusDriver}`);
      const data = await response.json();
      
      if (data.length > 0) {
        const latest = data[data.length - 1];
        setTelemetry({
          speed: `${latest.speed || 0} km/h`,
          rpm: `${latest.rpm?.toLocaleString() || 0}`,
          throttle: `${latest.throttle || 0}%`,
          brake: `${latest.brake || 0}%`,
          gear: latest.n_gear || 0,
          drs: latest.drs || 0
        });
      }
    } catch (error) {
      console.error('Error fetching telemetry:', error);
    }
  }, [sessionKey]);

  // Fetch team radio messages
  const fetchRadio = useCallback(async () => {
    if (!sessionKey) return;
    
    try {
      const response = await fetch(`https://api.openf1.org/v1/team_radio?session_key=${sessionKey}`);
      const messages = await response.json();
      
      // Get last 3 messages
      const recentMessages = messages.slice(-3).reverse();
      setRadioMessages(recentMessages.map(msg => ({
        time: new Date(msg.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        driver: drivers.find(d => d.driver_number === msg.driver_number)?.name_acronym || msg.driver_number,
        message: msg.recording_url ? '🎙️ Team radio' : msg.message || 'Radio communication',
        isYellow: false 
      })));
    } catch (error) {
      console.error('Error fetching radio:', error);
    }
  }, [sessionKey, drivers]);

  // Fetch weather data
  const fetchWeather = useCallback(async () => {
    if (!sessionKey) return;
    
    try {
      const response = await fetch(`https://api.openf1.org/v1/weather?session_key=${sessionKey}`);
      const data = await response.json();
      
      if (data.length > 0) {
        const latest = data[data.length - 1];
        setWeather({
          airTemp: latest.air_temperature || '--',
          trackTemp: latest.track_temperature || '--',
          humidity: latest.humidity || '--',
          rainfall: latest.rainfall || 0
        });
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  }, [sessionKey]);

  // Set up polling for real-time data
  useEffect(() => {
    if (!sessionKey) return;
    
    setLoading(false);
    
    // Initial fetch
    fetchIntervals();
    fetchTelemetry();
    fetchRadio();
    fetchWeather();
    
    // Polling intervals (adjust based on rate limits)
    const intervalsPoll = setInterval(fetchIntervals, 4000); // ~4s update for intervals
    const telemetryPoll = setInterval(fetchTelemetry, 300); // ~3.7Hz max
    const radioPoll = setInterval(fetchRadio, 5000);
    const weatherPoll = setInterval(fetchWeather, 10000);
    
    return () => {
      clearInterval(intervalsPoll);
      clearInterval(telemetryPoll);
      clearInterval(radioPoll);
      clearInterval(weatherPoll);
    };
  }, [sessionKey, fetchIntervals, fetchTelemetry, fetchRadio, fetchWeather]);

  // Helper formatting functions
  const formatLapTime = (seconds) => {
    if (!seconds) return '--:--.---';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
  };

  const formatSectorTime = (seconds) => {
    if (!seconds) return '--.--';
    return seconds.toFixed(2);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Connecting to OpenF1...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8">
      {/* Header remains similar but with live connection indicator */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-500 font-bold uppercase tracking-widest text-xs">
                Live • OpenF1 Connected
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase italic">Grand Prix Centre</h1>
            <p className="text-gray-400 text-sm">Real-time data from OpenF1 API</p>
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

      {/* Main Grid - Updated with real data */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Standings Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/80">
              <h2 className="font-bold uppercase text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" /> Live Timing
              </h2>
              <span className="text-[10px] text-gray-500 font-mono">
                LAP {currentLap}/{totalLaps}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800 text-[10px] uppercase">
                    <th className="p-4">Pos</th>
                    <th className="p-4">Driver</th>
                    <th className="p-4">Gap</th>
                    <th className="p-4">Interval</th>
                    <th className="p-4">Last Lap</th>
                    <th className="p-4 text-center">Tyre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {standings.map((driver, i) => (
                    <tr key={i} className="hover:bg-red-900/10 transition-colors">
                      <td className="p-4 font-bold">{driver.pos}</td>
                      <td className="p-4 font-bold flex items-center gap-2">
                        <div 
                          className="w-1 h-4" 
                          style={{ backgroundColor: `#${driver.team_colour}` }}
                        />
                        {driver.driver}
                      </td>
                      <td className="p-4 text-gray-400">{driver.gap}</td>
                      <td className="p-4 text-gray-300">{driver.interval}</td>
                      <td className="p-4 text-yellow-400">{driver.lastLap}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                          driver.tyres === 'S' ? 'border-red-600 text-red-600' : 
                          driver.tyres === 'M' ? 'border-yellow-600 text-yellow-600' : 
                          'border-white text-white'
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

        {/* Right Column: Telemetry & Track Info */}
        <div className="space-y-6">
          {/* Track Map with Weather */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] relative">
            <MapIcon className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-gray-500 uppercase font-bold text-xs">Track Map Visualization</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            <div className="mt-4 grid grid-cols-2 gap-4 w-full text-[10px] uppercase font-bold">
              <div className="bg-gray-800 p-2 rounded">Air: {weather.airTemp}°C</div>
              <div className="bg-gray-800 p-2 rounded">Track: {weather.trackTemp}°C</div>
              <div className="bg-gray-800 p-2 rounded">Humidity: {weather.humidity}%</div>
              <div className="bg-gray-800 p-2 rounded">Rain: {weather.rainfall ? 'Yes' : 'No'}</div>
            </div>
          </div>

          {/* Live Telemetry Focus */}
          <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-6">
            <h3 className="text-red-600 font-black uppercase text-xs mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Leclerc Telemetry
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                  <span>Speed</span>
                  <span className="text-gray-300">{telemetry.speed}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${parseInt(telemetry.speed) / 4}%` }}
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
                    animate={{ width: `${(parseInt(telemetry.rpm.replace(',', '')) / 12000) * 100}%` }}
                    className="h-full bg-red-600"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                  <span>Throttle</span>
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
                  <span>Brake</span>
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
              <div className="text-[10px] flex justify-between pt-2 border-t border-gray-700">
                <span>Gear: <span className="text-white font-bold">{telemetry.gear}</span></span>
                <span>DRS: <span className="text-white font-bold">{telemetry.drs === 12 ? 'ON' : 'OFF'}</span></span>
              </div>
            </div>
          </div>

          {/* Radio Messages */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 font-bold uppercase text-[10px] mb-3 flex items-center gap-2">
              <Radio className="w-3 h-3" /> Team Radio Log
            </h3>
            <div className="space-y-2 text-[10px] font-mono">
              {radioMessages.map((msg, i) => (
                <p key={i} className={msg.isYellow ? 'text-yellow-400' : 'text-blue-400'}>
                  {msg.time} - {msg.driver}: "{msg.message}"
                </p>
              ))}
              {radioMessages.length === 0 && (
                <p className="text-gray-600">No radio messages yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}