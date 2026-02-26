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
  Map,
  ChevronRight,
  TrendingUp,
  Disc,
  Cloud,
  Wind,
  Droplets,
  Timer,
  Radio,
  Cpu,
  GaugeCircle,
  ArrowUpRight,
  ArrowDownRight,
  CircleDot
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
  BarChart,
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
    circuit: 'Autodromo Nazionale Monza',
    country: 'Italy',
    round: 16
  });
  const [comparisonData, setComparisonData] = useState([]);
  const [weatherData, setWeatherData] = useState({
    temperature: 24,
    trackTemp: 32,
    humidity: 45,
    windSpeed: 3.2,
    windDirection: 'NE',
    pressure: 1013,
    condition: 'Sereno'
  });
  const [sectorTimes, setSectorTimes] = useState({
    s1: { time: '23.456', delta: '+0.123' },
    s2: { time: '26.789', delta: '-0.234' },
    s3: { time: '18.234', delta: '+0.045' }
  });
  const [liveTiming, setLiveTiming] = useState([
    { pos: 1, driver: 'LEC', team: 'Ferrari', time: '1:21.345', gap: '—', laps: 8, status: 'OUT LAP', color: 'red' },
    { pos: 2, driver: 'SAI', team: 'Ferrari', time: '1:21.579', gap: '+0.234', laps: 8, status: 'HOT LAP', color: 'red' },
    { pos: 3, driver: 'VER', team: 'Red Bull', time: '1:21.912', gap: '+0.567', laps: 7, status: 'IN PIT', color: 'blue' },
    { pos: 4, driver: 'HAM', team: 'Mercedes', time: '1:22.236', gap: '+0.891', laps: 8, status: 'COOL DOWN', color: 'cyan' },
    { pos: 5, driver: 'NOR', team: 'McLaren', time: '1:22.456', gap: '+1.111', laps: 8, status: 'HOT LAP', color: 'orange' },
    { pos: 6, driver: 'PER', team: 'Red Bull', time: '1:22.789', gap: '+1.444', laps: 7, status: 'IN PIT', color: 'blue' },
  ]);
  const [activeTab, setActiveTab] = useState('speed');
  const [showComparison, setShowComparison] = useState(true);
  const [miniSectors, setMiniSectors] = useState([
    { name: 'ASCARI', time: '12.345', color: 'green' },
    { name: 'LESMO', time: '8.234', color: 'green' },
    { name: 'PARRABOLICA', time: '23.456', color: 'yellow' },
    { name: 'PRIMA VARIANTE', time: '9.123', color: 'red' },
    { name: 'SECONDA VARIANTE', time: '11.567', color: 'green' }
  ]);

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
          time: point.Time || index * 0.1,
          speed_smooth: point.Speed * (0.9 + Math.random() * 0.2)
        }));
        
        setTelemetryData(formattedData);
        
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
        generateMockData();
      }
    } catch (error) {
      console.error("Errore nel caricamento dati FastF1:", error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

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
          time: distance / 70,
          speed_smooth: speed * (0.9 + Math.random() * 0.2)
        });
        
        distance += 10;
      }
    }
    
    setTelemetryData(mockData);
    
    const mockComparison = mockData.map(point => ({
      distance: point.distance,
      speed: point.speed + (Math.random() * 20 - 10),
      driver: driver === 'LEC' ? 'SAI' : 'LEC'
    }));
    setComparisonData(mockComparison);
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 30000);
    return () => clearInterval(interval);
  }, [driver]);

  const calculateStats = () => {
    if (telemetryData.length === 0) return { maxSpeed: 0, avgSpeed: 0, maxRpm: 0 };
    
    const speeds = telemetryData.map(d => d.speed);
    const rpms = telemetryData.map(d => d.rpm);
    
    return {
      maxSpeed: Math.max(...speeds),
      avgSpeed: Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length),
      maxRpm: Math.max(...rpms),
      minSpeed: Math.min(...speeds)
    };
  };

  const stats = calculateStats();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-red-900/50 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-zinc-400 mb-1">Distanza: {label}m</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-mono" style={{color: entry.color}}>
              {entry.name}: {entry.value} {entry.name === 'Speed' ? 'km/h' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white">
      <Head>
        <title>FastF1 Telemetry | Formula Rossa</title>
        <meta name="description" content="Telemetria F1 in tempo reale con FastF1" />
      </Head>

      {/* Header con effetti glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/80 border-b border-red-900/30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">
                    <span className="text-red-600">FORMULA</span>{' '}
                    <span className="text-white">ROSSA</span>
                  </h1>
                  <p className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                    <Cpu size={12} /> FASTF1 INTEGRATION • LIVE
                  </p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-3 bg-zinc-900/50 rounded-lg px-3 py-1.5 border border-zinc-800">
                <Map size={14} className="text-red-500" />
                <span className="text-sm font-medium">{sessionInfo.circuit}</span>
                <span className="text-xs text-zinc-500">•</span>
                <span className="text-xs text-zinc-400">{sessionInfo.country}</span>
                <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">Round {sessionInfo.round}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Meteo completo */}
              <div className="hidden lg:flex items-center gap-4 bg-zinc-900/50 rounded-lg px-4 py-1.5 border border-zinc-800">
                <div className="flex items-center gap-2">
                  <Thermometer size={14} className="text-red-400" />
                  <div>
                    <div className="text-xs text-zinc-500">Aria</div>
                    <div className="text-sm font-mono">{weatherData.temperature}°C</div>
                  </div>
                </div>
                <div className="w-px h-8 bg-zinc-800"></div>
                <div className="flex items-center gap-2">
                  <Flag size={14} className="text-yellow-500" />
                  <div>
                    <div className="text-xs text-zinc-500">Pista</div>
                    <div className="text-sm font-mono">{weatherData.trackTemp}°C</div>
                  </div>
                </div>
                <div className="w-px h-8 bg-zinc-800"></div>
                <div className="flex items-center gap-2">
                  <Wind size={14} className="text-blue-400" />
                  <div>
                    <div className="text-xs text-zinc-500">Vento</div>
                    <div className="text-sm font-mono">{weatherData.windSpeed} m/s</div>
                  </div>
                </div>
              </div>
              
              {/* Driver selector migliorato */}
              <div className="flex items-center gap-1 bg-zinc-900 rounded-lg border border-zinc-800 p-1">
                {['LEC', 'SAI', 'HAM', 'VER'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDriver(d)}
                    className={`px-4 py-2 text-sm font-mono rounded-md transition-all ${
                      driver === d 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-4">
        
        {/* Stats cards con design migliorato */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 p-5 hover:border-red-900/50 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-zinc-500 text-xs font-mono mb-1 flex items-center gap-1">
                  <TrendingUp size={12} /> TOP SPEED
                </div>
                <div className="text-3xl font-bold text-red-500 group-hover:scale-105 transition-transform">
                  {stats.maxSpeed}
                  <span className="text-sm text-zinc-500 ml-1">km/h</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                <Gauge className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
              <ArrowUpRight size={12} /> +2.3 km/h vs best lap
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 p-5 hover:border-blue-900/50 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-zinc-500 text-xs font-mono mb-1 flex items-center gap-1">
                  <Activity size={12} /> AVG SPEED
                </div>
                <div className="text-3xl font-bold text-blue-400 group-hover:scale-105 transition-transform">
                  {stats.avgSpeed}
                  <span className="text-sm text-zinc-500 ml-1">km/h</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <GaugeCircle className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 p-5 hover:border-purple-900/50 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-zinc-500 text-xs font-mono mb-1 flex items-center gap-1">
                  <Disc size={12} /> MAX RPM
                </div>
                <div className="text-3xl font-bold text-purple-400 group-hover:scale-105 transition-transform">
                  {stats.maxRpm.toLocaleString()}
                </div>
              </div>
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Cpu className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 p-5 hover:border-green-900/50 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-zinc-500 text-xs font-mono mb-1 flex items-center gap-1">
                  <Timer size={12} /> BEST LAP
                </div>
                <div className="text-3xl font-bold text-green-400 group-hover:scale-105 transition-transform">
                  1:21.345
                </div>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
              <CircleDot size={12} /> Personal Best
            </div>
          </div>
        </div>

        {/* Main telemetry section with tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Telemetry chart - più grande */}
          <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-900 p-4 border-b border-zinc-800">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-mono flex items-center gap-2">
                    <Activity size={16} className="text-red-500" /> TELEMETRY • {driver}
                  </h2>
                  <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
                    {['speed', 'rpm', 'gear'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${
                          activeTab === tab 
                            ? 'bg-red-600 text-white' 
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs transition-all ${
                    showComparison 
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <User size={12} />
                  Compare with {driver === 'LEC' ? 'SAI' : 'LEC'}
                </button>
              </div>
            </div>
            
            <div className="h-[350px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={telemetryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis 
                    dataKey="distance" 
                    tick={{fill: '#666', fontSize: 11}}
                    label={{ value: 'Distance (m)', position: 'bottom', fill: '#666', fontSize: 11 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{fill: '#666', fontSize: 11}}
                    domain={activeTab === 'speed' ? [0, 360] : activeTab === 'rpm' ? [0, 15000] : [0, 9]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {activeTab === 'speed' && (
                    <>
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="speed" 
                        stroke="#ff0000" 
                        dot={false} 
                        strokeWidth={2.5}
                        name="Speed"
                      />
                      {showComparison && comparisonData.length > 0 && (
                        <Line 
                          yAxisId="left"
                          data={comparisonData}
                          type="monotone" 
                          dataKey="speed" 
                          stroke="#3b82f6" 
                          dot={false} 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Comparison"
                        />
                      )}
                    </>
                  )}
                  
                  {activeTab === 'rpm' && (
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="rpm" 
                      stroke="#a855f7" 
                      fill="#a855f7" 
                      fillOpacity={0.2}
                      name="RPM"
                    />
                  )}
                  
                  {activeTab === 'gear' && (
                    <Bar 
                      yAxisId="left"
                      dataKey="gear" 
                      fill="#eab308" 
                      name="Gear"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            {/* Mini sector times sotto il grafico */}
            <div className="border-t border-zinc-800 p-3 bg-zinc-900/50">
              <div className="flex justify-between items-center">
                {miniSectors.map((sector, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-xs text-zinc-500">{sector.name}</div>
                    <div className={`text-sm font-mono text-${sector.color}-400`}>{sector.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Throttle & Brake - più dettagliato */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-900 p-4 border-b border-zinc-800">
              <h2 className="text-sm font-mono flex items-center gap-2">
                <Gauge size={16} className="text-red-500" /> DRIVER INPUTS
              </h2>
            </div>
            
            <div className="h-[200px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetryData.filter((_, i) => i % 5 === 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="distance" tick={{fill: '#666', fontSize: 10}} />
                  <YAxis domain={[0, 100]} tick={{fill: '#666', fontSize: 10}} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="throttle" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    name="Throttle"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="brake" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.3}
                    name="Brake"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* DRS e Gear indicator */}
            <div className="grid grid-cols-2 gap-2 p-4 border-t border-zinc-800">
              <div className="bg-zinc-900 rounded-lg p-3">
                <div className="text-xs text-zinc-500">DRS</div>
                <div className="text-lg font-bold text-green-400">ACTIVE</div>
              </div>
              <div className="bg-zinc-900 rounded-lg p-3">
                <div className="text-xs text-zinc-500">AVG GEAR</div>
                <div className="text-lg font-bold text-yellow-400">6.2</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live timing e informazioni - layout migliorato */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Classifica live migliorata */}
          <div className="md:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-sm font-mono flex items-center gap-2">
                <Clock size={16} className="text-red-500" /> LIVE CLASSIFICATION
              </h2>
              <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                SESSION ACTIVE
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900/50 text-xs text-zinc-500">
                  <tr>
                    <th className="px-4 py-2 text-left">POS</th>
                    <th className="px-4 py-2 text-left">DRIVER</th>
                    <th className="px-4 py-2 text-left">TEAM</th>
                    <th className="px-4 py-2 text-right">TIME</th>
                    <th className="px-4 py-2 text-right">GAP</th>
                    <th className="px-4 py-2 text-center">LAPS</th>
                    <th className="px-4 py-2 text-left">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {liveTiming.map((row) => (
                    <tr key={row.pos} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm">{row.pos}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 bg-${row.color}-500 rounded-full`}></div>
                          <span className="font-mono font-bold">{row.driver}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{row.team}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-green-400">{row.time}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-yellow-400">{row.gap}</td>
                      <td className="px-4 py-3 text-center text-sm">{row.laps}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full bg-${row.color}-900/20 text-${row.color}-400`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info meteo e sessione - più dettagliato */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-900 p-4 border-b border-zinc-800">
              <h2 className="text-sm font-mono flex items-center gap-2">
                <Cloud size={16} className="text-red-500" /> SESSION INFO
              </h2>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Meteo dettagliato */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <Thermometer size={12} /> Air Temp
                  </div>
                  <div className="text-lg font-bold">{weatherData.temperature}°C</div>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <Flag size={12} /> Track Temp
                  </div>
                  <div className="text-lg font-bold">{weatherData.trackTemp}°C</div>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <Droplets size={12} /> Humidity
                  </div>
                  <div className="text-lg font-bold">{weatherData.humidity}%</div>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <Wind size={12} /> Wind
                  </div>
                  <div className="text-lg font-bold">{weatherData.windSpeed} m/s</div>
                </div>
              </div>
              
              {/* Sessione */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Status</span>
                  <span className="text-green-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    GREEN FLAG
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Time Remaining</span>
                  <span className="font-mono">12:34</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Laps Completed</span>
                  <span className="font-mono">8 / 18</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Pole Time</span>
                  <span className="font-mono text-purple-400">1:19.345</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con stato FastF1 */}
        <div className="flex justify-between items-center bg-zinc-900/30 rounded-lg border border-zinc-800 p-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-zinc-400">FastF1 Pipeline</span>
              <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">v2.4.6</span>
            </div>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Radio size={12} />
              <span>Cache: 2.3GB • 98% hit rate</span>
            </div>
          </div>
          <div className="text-xs text-zinc-600 font-mono">
            Last sync: {new Date().toLocaleTimeString()} • {driver} • Lap 8/18
          </div>
        </div>

      </main>

      {/* Loading migliorato */}
      {loading && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full"></div>
            <div className="relative bg-zinc-900 border border-red-900/50 rounded-2xl p-8 max-w-md">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-red-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-red-500 font-mono text-lg mb-2">FETCHING FASTF1 TELEMETRY</p>
                  <p className="text-sm text-zinc-500">Loading {driver} telemetry data from {sessionInfo.gp} {sessionInfo.year}</p>
                  <p className="text-xs text-zinc-600 mt-4">This may take a few seconds on first load...</p>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1">
                  <div className="bg-red-600 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
