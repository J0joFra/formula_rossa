import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  Trophy, TrendingUp, Users, Calendar, 
  Award, Target, Zap, Clock, 
  BarChart as BarChartIcon, PieChart as PieChartIcon,
  Activity, GitCompare, Heart, Star
} from 'lucide-react';
import { getFerrariData } from '@/lib/openf1/client';  
import useFerrariData from '@/hooks/useFerrariData';

// Componente per le statistiche real-time
const LiveStatsComponent = ({ sessionKey }) => {
  const { data: ferrariData, loading, error } = useFerrariData(sessionKey, 10000);
  
  if (loading || !ferrariData) {
    return (
      <div className="animate-pulse bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Calcola statistiche dai dati real-time
  const calculateLiveStats = () => {
    const stats = {
      avgSpeed: 0,
      maxSpeed: 0,
      throttleAvg: 0,
      reliability: 100,
      lapsCompleted: 0,
      pitStops: 0
    };

    // Processa dati telemetria se disponibili
    if (ferrariData.carData) {
      const speeds = ferrariData.carData
        .filter(d => d.speed > 0)
        .map(d => d.speed);
      
      if (speeds.length > 0) {
        stats.avgSpeed = Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length);
        stats.maxSpeed = Math.max(...speeds);
      }
    }

    return stats;
  };

  const liveStats = calculateLiveStats();

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-red-900/10 rounded-xl p-6 border border-red-500/20">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-red-500 animate-pulse" />
        <h3 className="text-xl font-bold text-white">Statistiche Live</h3>
        <span className="ml-auto text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full animate-pulse">
          LIVE
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/30 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-400">Velocità Media</span>
          </div>
          <div className="text-2xl font-bold text-white">{liveStats.avgSpeed} km/h</div>
        </div>
        
        <div className="bg-gray-800/30 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-400">Velocità Max</span>
          </div>
          <div className="text-2xl font-bold text-white">{liveStats.maxSpeed} km/h</div>
        </div>
      </div>
      
      {ferrariData.weather && ferrariData.weather.length > 0 && (
        <div className="mt-4 p-3 bg-gray-800/20 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Condizioni Attuali</div>
          <div className="flex items-center gap-4 text-sm">
            <span>🌡️ {ferrariData.weather[0].air_temperature?.toFixed(1)}°C</span>
            <span>💧 {ferrariData.weather[0].humidity?.toFixed(0)}%</span>
            {ferrariData.weather[0].rainfall ? (
              <span className="text-blue-400">🌧️ Pioggia</span>
            ) : (
              <span className="text-yellow-400">☀️ Asciutto</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente per i dati del campionato
const ChampionshipStats = ({ sessionKey }) => {
  const [championshipData, setChampionshipData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChampionshipData = async () => {
      try {
        const client = new OpenF1Client();
        const [driversData, teamsData] = await Promise.all([
          client.getDriversChampionship(sessionKey, [16, 55]),
          client.getTeamsChampionship(sessionKey, 'Ferrari')
        ]);
        
        setChampionshipData({
          drivers: driversData || [],
          team: teamsData?.[0] || null
        });
      } catch (error) {
        console.error('Error fetching championship data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChampionshipData();
  }, [sessionKey]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!championshipData) return null;

  const leclerc = championshipData.drivers?.find(d => d.driver_number === 16);
  const sainz = championshipData.drivers?.find(d => d.driver_number === 55);

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-yellow-900/10 rounded-xl p-6 border border-yellow-500/20">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-bold text-white">Campionato 2024</h3>
      </div>
      
      {championshipData.team && (
        <div className="mb-6 p-4 bg-yellow-500/10 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Scuderia Ferrari</span>
            <span className="text-2xl font-bold text-yellow-500">
              P{championshipData.team.position_current}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Punti</span>
            <span className="font-bold text-white">
              {championshipData.team.points_current || 0}
            </span>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {leclerc && (
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="font-bold text-red-400">16</span>
              </div>
              <div>
                <div className="font-medium text-white">C. Leclerc</div>
                <div className="text-xs text-gray-400">P{leclerc.position_current || '-'}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">{leclerc.points_current || 0}</div>
              <div className="text-xs text-gray-400">punti</div>
            </div>
          </div>
        )}
        
        {sainz && (
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <span className="font-bold text-yellow-400">55</span>
              </div>
              <div>
                <div className="font-medium text-white">C. Sainz</div>
                <div className="text-xs text-gray-400">P{sainz.position_current || '-'}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">{sainz.points_current || 0}</div>
              <div className="text-xs text-gray-400">punti</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente per le statistiche storiche con dati reali
const HistoricalStatsWithRealData = ({ sessionKey }) => {
  const [lapData, setLapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLapData = async () => {
      try {
        const client = new OpenF1Client();
        const [leclercLaps, sainzLaps] = await Promise.all([
          client.getLaps(16, sessionKey),
          client.getLaps(55, sessionKey)
        ]);

        // Processa i dati per grafico
        const processedData = [];
        const maxLaps = Math.max(
          leclercLaps?.length || 0,
          sainzLaps?.length || 0
        );

        for (let i = 0; i < Math.min(maxLaps, 20); i++) {
          const leclercLap = leclercLaps?.[i];
          const sainzLap = sainzLaps?.[i];
          
          if (leclercLap || sainzLap) {
            processedData.push({
              lap: i + 1,
              leclerc: leclercLap?.lap_duration || null,
              sainz: sainzLap?.lap_duration || null,
              leclercS1: leclercLap?.sector1_session_time || null,
              leclercS2: leclercLap?.sector2_session_time || null,
              leclercS3: leclercLap?.sector3_session_time || null,
            });
          }
        }

        setLapData(processedData);
      } catch (error) {
        console.error('Error fetching lap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLapData();
  }, [sessionKey]);

  // Dati storici Ferrari (recenti)
  const historicalData = [
    { year: 2019, wins: 3, podiums: 19, points: 504, position: 2, driver1: 'Vettel', driver2: 'Leclerc' },
    { year: 2020, wins: 0, podiums: 3, points: 131, position: 6, driver1: 'Vettel', driver2: 'Leclerc' },
    { year: 2021, wins: 0, podiums: 5, points: 323, position: 3, driver1: 'Sainz', driver2: 'Leclerc' },
    { year: 2022, wins: 4, podiums: 20, points: 554, position: 2, driver1: 'Sainz', driver2: 'Leclerc' },
    { year: 2023, wins: 1, podiums: 12, points: 406, position: 3, driver1: 'Sainz', driver2: 'Leclerc' },
    { year: 2024, wins: 7, podiums: 27, points: 663, position: 2, driver1: 'Leclerc', driver2: 'Sainz/Hamilton' },
  ];

  // Leggende Ferrari (attualizzate)
  const legendsData = [
    { name: 'M. Schumacher', wins: 72, titles: 5, years: '1996-2006', currentTeam: false },
    { name: 'C. Leclerc', wins: 11, titles: 0, years: '2019-presente', currentTeam: true },
    { name: 'S. Vettel', wins: 14, titles: 0, years: '2015-2020', currentTeam: false },
    { name: 'C. Sainz', wins: 3, titles: 0, years: '2021-2024', currentTeam: false },
    { name: 'K. Räikkönen', wins: 10, titles: 1, years: '2007-2009, 2014-2018', currentTeam: false },
    { name: 'L. Hamilton', wins: 0, titles: 0, years: '2025-presente', currentTeam: true },
  ];

  const COLORS = ['#DC0000', '#FF2800', '#FF5A36', '#FF8C6B', '#FFBDA1', '#FFEFD6'];

  return (
    <div className="space-y-8">
      {/* Grafico tempi per giro */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-bold text-white">Analisi Tempi per Giro</h3>
        </div>
        
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : lapData && lapData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lapData}>
                <XAxis dataKey="lap" stroke="#666" />
                <YAxis stroke="#666" domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                  formatter={(value) => value ? `${value.toFixed(3)}s` : 'N/A'}
                />
                <Line 
                  type="monotone" 
                  dataKey="leclerc" 
                  stroke="#DC0000" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Leclerc"
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="sainz" 
                  stroke="#FFD700" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Sainz"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Dati tempi giro non disponibili
          </div>
        )}
      </div>

      {/* Grafico storici */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-bold text-white">Performance 2019-2024</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <XAxis dataKey="year" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#DC0000" 
                  fill="#DC0000" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="wins" 
                  stroke="#FFD700" 
                  fill="#FFD700" 
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-bold text-white">Leggende Ferrari</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={legendsData}>
                <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                />
                <Bar dataKey="wins" fill="#DC0000" name="Vittorie" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StatsSection() {
  const [activeTab, setActiveTab] = useState('live');
  const [selectedSession, setSelectedSession] = useState(9601); // Monza session key
  const [circuitStats, setCircuitStats] = useState(null);

  const sessions = [
    { key: 9601, name: 'Monza', circuit: 'Italian GP', date: '2025-09-07' },
    { key: 9602, name: 'Monaco', circuit: 'Monaco GP', date: '2025-05-25' },
    { key: 9603, name: 'Silverstone', circuit: 'British GP', date: '2025-07-06' },
    { key: 9604, name: 'Spa', circuit: 'Belgian GP', date: '2025-08-31' },
    { key: 9605, name: 'Suzuka', circuit: 'Japanese GP', date: '2025-10-05' },
  ];

  useEffect(() => {
    const fetchCircuitStats = async () => {
      try {
        const client = new OpenF1Client();
        // Potresti aggiungere chiamate per statistiche specifiche del circuito
        setCircuitStats({
          monza: { laps: 53, length: 5.793, record: '1:21.046' },
          monaco: { laps: 78, length: 3.337, record: '1:10.166' },
          silverstone: { laps: 52, length: 5.891, record: '1:27.097' },
          spa: { laps: 44, length: 7.004, record: '1:41.252' },
          suzuka: { laps: 53, length: 5.807, record: '1:30.983' },
        });
      } catch (error) {
        console.error('Error fetching circuit stats:', error);
      }
    };

    fetchCircuitStats();
  }, []);

  // Statistiche aggregate
  const aggregateStats = [
    { 
      value: '7', 
      label: 'Vittorie 2024', 
      icon: Trophy, 
      color: 'bg-red-500/20',
      description: 'Stagione record dal 2019',
      trend: '+250% vs 2023'
    },
    { 
      value: '27', 
      label: 'Podi 2024', 
      icon: Award, 
      color: 'bg-yellow-500/20',
      description: 'Miglior risultato dal 2018',
      trend: '+125% vs 2023'
    },
    { 
      value: '663', 
      label: 'Punti 2024', 
      icon: BarChartIcon, 
      color: 'bg-red-500/20',
      description: 'Record punti in stagione',
      trend: '+63% vs 2023'
    },
    { 
      value: '2°', 
      label: 'Posizione Costruttori', 
      icon: Target, 
      color: 'bg-yellow-500/20',
      description: 'Miglior piazzamento dal 2022',
      trend: 'Salita di 1 posizione'
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Activity className="w-8 h-8 text-red-500" />
            <h2 className="text-4xl font-bold text-white">Statistiche Ferrari</h2>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto mb-6">
            Dati live, storici e analisi avanzate della Scuderia Ferrari
          </p>
          
          {/* Session Selector */}
          <div className="inline-flex items-center gap-2 bg-gray-900/50 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-700">
            <span className="text-gray-400 text-sm">Sessione:</span>
            <select 
              value={selectedSession}
              onChange={(e) => setSelectedSession(parseInt(e.target.value))}
              className="bg-transparent text-white border-none outline-none text-sm"
            >
              {sessions.map(session => (
                <option key={session.key} value={session.key}>
                  {session.circuit} ({session.date})
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {aggregateStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
            >
              <div className={`inline-flex p-3 rounded-xl ${stat.color} mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-300 font-medium mb-2">{stat.label}</div>
              <div className="text-sm text-gray-400 mb-1">{stat.description}</div>
              <div className="text-xs text-green-400">{stat.trend}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 mb-8">
          <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4 mb-6">
            {[
              { id: 'live', label: 'Live Data', icon: Activity },
              { id: 'championship', label: 'Campionato', icon: Trophy },
              { id: 'historical', label: 'Storici', icon: TrendingUp },
              { id: 'comparison', label: 'Confronto', icon: GitCompare },
              { id: 'circuits', label: 'Circuiti', icon: Target },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'live' && (
              <div className="grid md:grid-cols-2 gap-8">
                <LiveStatsComponent sessionKey={selectedSession} />
                <ChampionshipStats sessionKey={selectedSession} />
                
                {/* Additional Live Data */}
                <div className="md:col-span-2 bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-6">Telemetria Dettagliata</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-800/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-gray-300">Performance Engine</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Power Unit</span>
                          <span className="text-white font-medium">066/7</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Stato</span>
                          <span className="text-green-400 font-medium">Ottimale</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-gray-300">Affidabilità</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Componenti Usati</span>
                          <span className="text-white font-medium">2/4</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Problemi</span>
                          <span className="text-green-400 font-medium">Nessuno</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-300">Sviluppo</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Aggiornamenti</span>
                          <span className="text-white font-medium">+3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Performance</span>
                          <span className="text-green-400 font-medium">+0.4s/giro</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'championship' && (
              <ChampionshipStats sessionKey={selectedSession} />
            )}

            {activeTab === 'historical' && (
              <HistoricalStatsWithRealData sessionKey={selectedSession} />
            )}

            {activeTab === 'comparison' && (
              <div className="space-y-8">
                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-6">Confronto Piloti 2024</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="font-bold text-white">Charles Leclerc</span>
                      </div>
                      <div className="space-y-3">
                        <StatRow label="Vittorie" value="5" color="text-green-400" />
                        <StatRow label="Pole Position" value="4" color="text-yellow-400" />
                        <StatRow label="Giri Veloci" value="8" color="text-blue-400" />
                        <StatRow label="Punti" value="325" color="text-red-400" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="font-bold text-white">Carlos Sainz</span>
                      </div>
                      <div className="space-y-3">
                        <StatRow label="Vittorie" value="2" color="text-green-400" />
                        <StatRow label="Pole Position" value="1" color="text-yellow-400" />
                        <StatRow label="Giri Veloci" value="5" color="text-blue-400" />
                        <StatRow label="Punti" value="305" color="text-red-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'circuits' && circuitStats && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(circuitStats).map(([circuit, stats]) => (
                  <div key={circuit} className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                    <h4 className="font-bold text-white mb-4 capitalize">{circuit}</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lunghezza</span>
                        <span className="text-white">{stats.length} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Giri</span>
                        <span className="text-white">{stats.laps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Record Giro</span>
                        <span className="text-yellow-400">{stats.record}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            📊 Dati aggiornati in tempo reale da 
            <a href="https://openf1.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-1">
              OpenF1.org
            </a>
            . Le statistiche live sono disponibili durante le sessioni F1.
          </p>
        </div>
      </div>
    </section>
  );
}

// Componente helper per righe di statistica
function StatRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded-lg">
      <span className="text-gray-400">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}
