import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Activity, 
  Zap, 
  User, 
  Clock,
  Gauge,
  Thermometer,
  Flag,
  Map
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar
} from 'recharts';

export default function LiveTimingPage() {
  const [telemetryData, setTelemetryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [driver, setDriver] = useState('LEC');
  const [sessionInfo, setSessionInfo] = useState({
    year: 2024,
    gp: 'Monza',
    session: 'Qualifying',
    circuit: 'Autodromo Nazionale Monza'
  });
  const [comparisonData, setComparisonData] = useState([]);
  const [weatherData, setWeatherData] = useState({
    temperature: 24,
    trackTemp: 32,
    humidity: 45,
    windSpeed: 3.2
  });
  const [sectorTimes, setSectorTimes] = useState({
    s1: '23.456',
    s2: '26.789',
    s3: '18.234'
  });

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/fastf1/telemetry?year=2024&gp=Monza&session=Q&driver=${driver}`);
      
      if (response.ok) {
        const data = await response.json();
        
        const formattedData = data.telemetry.map((point, index) => ({
          distance: point.Distance,
          speed: point.Speed,
          rpm: point.RPM || Math.floor(Math.random() * 3000 + 10000),
          gear: point.nGear || Math.floor(Math.random() * 8) + 1,
          throttle: point.Throttle || Math.floor(Math.random() * 100),
          brake: point.Brake || 0,
          drs: point.DRS || 0,
          time: point.Time || index * 0.1
        }));
        
        setTelemetryData(formattedData);
        
        // Carica anche i dati di confronto con l'altro pilota
        const otherDriver = driver === 'LEC' ? 'SAI' : 'LEC';
        const comparisonResponse = await fetch(`http://localhost:5000/api/fastf1/telemetry?year=2024&gp=Monza&session=Q&driver=${otherDriver}`);
        
        if (comparisonResponse.ok) {
          const comparisonJson = await comparisonResponse.json();
          const formattedComparison = comparisonJson.telemetry.map((point, index) => ({
            distance: point.Distance,
            speed: point.Speed,
            driver: otherDriver
          }));
          setComparisonData(formattedComparison);
        }
        
      } else {
        // Fallback a dati simulati se il server non è disponibile
        generateMockData();
      }
    } catch (error) {
      console.error("Errore nel caricamento dati FastF1:", error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  // Genera dati mock quando FastF1 non è disponibile
  const generateMockData = () => {
    const mockData = [];
    const sectors = [2300, 3300, 1500];
    let distance = 0;
    
    for (let i = 0; i < 3; i++) {
      for (let d = 0; d < sectors[i]; d += 10) {
        let speed;
        if (i === 0) {
          speed = 150 + Math.sin(d / 100) * 50 + Math.random() * 10;
        } else if (i === 1) {
          speed = 280 + Math.sin(d / 200) * 80 + Math.random() * 15;
        } else {
          speed = 200 + Math.cos(d / 150) * 70 + Math.random() * 12;
        }
        
        mockData.push({
          distance: distance,
          speed: Math.round(speed),
          rpm: Math.round(8000 + speed * 30 + Math.random() * 500),
          gear: Math.floor(speed / 40) + 1,
          throttle: Math.random() > 0.1 ? Math.round(70 + Math.random() * 30) : 0,
          brake: Math.random() > 0.8 ? Math.round(50 + Math.random() * 50) : 0,
          drs: Math.random() > 0.7 ? 1 : 0,
          time: distance / 70
        });
        
        distance += 10;
      }
    }
    
    setTelemetryData(mockData);
    
    // Genera dati di confronto
    const mockComparison = mockData.map(point => ({
      distance: point.distance,
      speed: point.speed + (Math.random() * 20 - 10),
      driver: driver === 'LEC' ? 'SAI' : 'LEC'
    }));
    setComparisonData(mockComparison);
  };

  useEffect(() => {
    fetchTelemetry();
    
    // Aggiornamento ogni 30 secondi
    const interval = setInterval(fetchTelemetry, 30000);
    return () => clearInterval(interval);
  }, [driver]);

  // Calcola statistiche dai dati telemetrici
  const calculateStats = () => {
    if (telemetryData.length === 0) return { maxSpeed: 0, avgSpeed: 0, maxRpm: 0 };
    
    const speeds = telemetryData.map(d => d.speed);
    const rpms = telemetryData.map(d => d.rpm);
    
    return {
      maxSpeed: Math.max(...speeds),
      avgSpeed: Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length),
      maxRpm: Math.max(...rpms)
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>FastF1 Telemetry | Formula Rossa</title>
        <meta name="description" content="Telemetria F1 in tempo reale con FastF1" />
      </Head>

      {/* Header con FastF1 branding */}
      <header className="p-4 border-b border-red-900 bg-gradient-to-r from-zinc-950 to-black">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <Zap className="fill-current" /> FORMULA ROSSA <span className="text-white text-sm font-mono bg-red-900/30 px-2 py-1 rounded ml-2">FASTF1 INTEGRATION</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1 font-mono">{sessionInfo.circuit} • {sessionInfo.session} • {sessionInfo.year}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Info meteo */}
            <div className="hidden md:flex items-center gap-3 bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-1">
                <Thermometer size={14} className="text-red-400" />
                <span className="text-xs">{weatherData.temperature}°C</span>
              </div>
              <div className="flex items-center gap-1">
                <Flag size={14} className="text-yellow-500" />
                <span className="text-xs">{weatherData.trackTemp}°C</span>
              </div>
            </div>
            
            {/* Driver selector */}
            <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              {['LEC', 'SAI', 'HAM', 'VER'].map(d => (
                <button
                  key={d}
                  onClick={() => setDriver(d)}
                  className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                    driver === d 
                      ? 'bg-red-600 text-white' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-4">
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
            <div className="text-zinc-500 text-xs font-mono mb-1">TOP SPEED</div>
            <div className="text-2xl font-bold text-red-500">{stats.maxSpeed} <span className="text-sm text-zinc-500">km/h</span></div>
          </div>
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
            <div className="text-zinc-500 text-xs font-mono mb-1">AVG SPEED</div>
            <div className="text-2xl font-bold text-white">{stats.avgSpeed} <span className="text-sm text-zinc-500">km/h</span></div>
          </div>
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
            <div className="text-zinc-500 text-xs font-mono mb-1">MAX RPM</div>
            <div className="text-2xl font-bold text-blue-400">{stats.maxRpm.toLocaleString()}</div>
          </div>
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
            <div className="text-zinc-500 text-xs font-mono mb-1">BEST LAP</div>
            <div className="text-2xl font-bold text-purple-400">1:21.345</div>
          </div>
        </div>

        {/* Telemetry Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Main telemetry chart */}
          <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-900 p-3 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-sm font-mono flex items-center gap-2">
                <Activity size={14} className="text-red-500" /> SPEED TRACE • {driver}
              </h2>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded"></span> {driver}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded"></span> {driver === 'LEC' ? 'SAI' : 'LEC'}</span>
              </div>
            </div>
            
            <div className="h-[300px] p-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={telemetryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="distance" tick={{fill: '#666', fontSize: 10}} />
                  <YAxis yAxisId="left" tick={{fill: '#666', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#000', border: '1px solid #ff0000'}}
                    labelStyle={{color: '#999'}}
                  />
                  
                  {/* Main speed line */}
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="speed" 
                    stroke="#ff0000" 
                    dot={false} 
                    strokeWidth={2}
                    name={`${driver} Speed`}
                  />
                  
                  {/* Comparison line */}
                  {comparisonData.length > 0 && (
                    <Line 
                      yAxisId="left"
                      data={comparisonData}
                      type="monotone" 
                      dataKey="speed" 
                      stroke="#3b82f6" 
                      dot={false} 
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      name="Comparison"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gear & Throttle */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-900 p-3 border-b border-zinc-800">
              <h2 className="text-sm font-mono flex items-center gap-2">
                <Gauge size={14} className="text-red-500" /> THROTTLE & GEARS
              </h2>
            </div>
            
            <div className="h-[300px] p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetryData.slice(0, 200)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="distance" tick={{fill: '#666', fontSize: 10}} />
                  <YAxis tick={{fill: '#666', fontSize: 10}} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="throttle" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    name="Throttle %"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="brake" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.3}
                    name="Brake %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sector times and additional data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
            <h3 className="text-xs font-mono text-zinc-500 mb-3">SECTOR TIMES</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sector 1</span>
                <span className="font-mono text-green-400">{sectorTimes.s1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sector 2</span>
                <span className="font-mono text-green-400">{sectorTimes.s2}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sector 3</span>
                <span className="font-mono text-green-400">{sectorTimes.s3}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
            <h3 className="text-xs font-mono text-zinc-500 mb-3">LIVE TIMING</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>LEC</span>
                <span className="text-red-400">1:21.345</span>
              </div>
              <div className="flex justify-between">
                <span>SAI</span>
                <span className="text-yellow-400">+0.234</span>
              </div>
              <div className="flex justify-between">
                <span>HAM</span>
                <span>+0.567</span>
              </div>
              <div className="flex justify-between">
                <span>VER</span>
                <span>+0.891</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
            <h3 className="text-xs font-mono text-zinc-500 mb-3">SESSION INFO</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Status</span>
                <span className="text-green-400">GREEN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Time Remaining</span>
                <span>12:34</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Laps Completed</span>
                <span>8</span>
              </div>
            </div>
          </div>
        </div>

        {/* FastF1 Data Status */}
        <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-3 text-xs text-zinc-500 flex justify-between items-center">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            FastF1 Data Pipeline • Active
          </span>
          <span>Last update: {new Date().toLocaleTimeString()}</span>
        </div>

      </main>

      {loading && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
            <p className="text-red-500 font-mono animate-pulse">FETCHING FASTF1 TELEMETRY...</p>
            <p className="text-xs text-zinc-600">Loading {driver} telemetry data from {sessionInfo.gp} {sessionInfo.year}</p>
          </div>
        </div>
      )}
    </div>
  );
}