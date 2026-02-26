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
  CircleDot,
  Calendar,
  ChevronDown,
  Filter,
  Search,
  RefreshCw
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
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';

// Anni disponibili (FastF1 ha dati dal 2018)
const AVAILABLE_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018];

// Mappa circuiti → paesi per bandiere
const circuitToCountry = {
  'monza': 'it', 'autodromo-nazionale-di-monza': 'it', 'imola': 'it', 'mugello': 'it',
  'silverstone': 'gb', 'silverstone-circuit': 'gb', 'brands-hatch': 'gb',
  'spa': 'be', 'spa-francorchamps': 'be',
  'catalunya': 'es', 'barcelona': 'es', 'jerez': 'es', 'valencia': 'es',
  'hungaroring': 'hu', 'budapest': 'hu',
  'red-bull-ring': 'at', 'spielberg': 'at', 'zeltweg': 'at',
  'monaco': 'mc', 'monte-carlo': 'mc', 'circuit-de-monaco': 'mc',
  'americas': 'us', 'cota': 'us', 'austin': 'us', 'miami': 'us', 'las-vegas': 'us',
  'villeneuve': 'ca', 'montreal': 'ca', 'circuit-gilles-villeneuve': 'ca',
  'interlagos': 'br', 'sao-paulo': 'br', 'josé-carlos-pace': 'br',
  'rodriguez': 'mx', 'hermanos-rodriguez': 'mx', 'mexico-city': 'mx',
  'suzuka': 'jp', 'suzuka-circuit': 'jp', 'fuji': 'jp', 'fuji-speedway': 'jp',
  'shanghai': 'cn', 'shanghai-international-circuit': 'cn',
  'marina-bay': 'sg', 'singapore': 'sg',
  'bahrain': 'bh', 'sakhir': 'bh', 'bahrain-international-circuit': 'bh',
  'jeddah': 'sa', 'jeddah-corniche-circuit': 'sa',
  'yas-marina': 'ae', 'abu-dhabi': 'ae', 'yas-marina-circuit': 'ae',
  'albert-park': 'au', 'melbourne': 'au', 'adelaide': 'au',
  'zandvoort': 'nl', 'circuit-zandvoort': 'nl',
  'losail': 'qa', 'lusail': 'qa', 'lusail-international-circuit': 'qa',
  'imola': 'it', 'enzo-e-dino-ferrari': 'it',
  'portimao': 'pt', 'algarve': 'pt',
  'istanbul': 'tr', 'istanbul-park': 'tr',
  'nurburgring': 'de', 'nurburg': 'de', 'hockenheimring': 'de', 'hockenheim': 'de',
  'magny-cours': 'fr', 'paul-ricard': 'fr', 'le-castellet': 'fr',
  'kyalami': 'za', 'midrand': 'za'
};

// Lista completa piloti 2024
const DRIVERS_2024 = [
  { code: 'VER', name: 'Max Verstappen', team: 'Red Bull', number: 1, color: 'blue' },
  { code: 'PER', name: 'Sergio Pérez', team: 'Red Bull', number: 11, color: 'blue' },
  { code: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes', number: 44, color: 'cyan' },
  { code: 'RUS', name: 'George Russell', team: 'Mercedes', number: 63, color: 'cyan' },
  { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', number: 16, color: 'red' },
  { code: 'SAI', name: 'Carlos Sainz', team: 'Ferrari', number: 55, color: 'red' },
  { code: 'NOR', name: 'Lando Norris', team: 'McLaren', number: 4, color: 'orange' },
  { code: 'PIA', name: 'Oscar Piastri', team: 'McLaren', number: 81, color: 'orange' },
  { code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', number: 14, color: 'green' },
  { code: 'STR', name: 'Lance Stroll', team: 'Aston Martin', number: 18, color: 'green' },
  { code: 'GAS', name: 'Pierre Gasly', team: 'Alpine', number: 10, color: 'pink' },
  { code: 'OCO', name: 'Esteban Ocon', team: 'Alpine', number: 31, color: 'pink' },
  { code: 'ALB', name: 'Alexander Albon', team: 'Williams', number: 23, color: 'blue' },
  { code: 'SAR', name: 'Logan Sargeant', team: 'Williams', number: 2, color: 'blue' },
  { code: 'BOT', name: 'Valtteri Bottas', team: 'Sauber', number: 77, color: 'green' },
  { code: 'ZHO', name: 'Guanyu Zhou', team: 'Sauber', number: 24, color: 'green' },
  { code: 'TSU', name: 'Yuki Tsunoda', team: 'RB', number: 22, color: 'blue' },
  { code: 'RIC', name: 'Daniel Ricciardo', team: 'RB', number: 3, color: 'blue' },
  { code: 'MAG', name: 'Kevin Magnussen', team: 'Haas', number: 20, color: 'red' },
  { code: 'HUL', name: 'Nico Hülkenberg', team: 'Haas', number: 27, color: 'red' }
];

// Lista gare 2024
const RACES_2024 = [
  { id: 1, name: 'Bahrain Grand Prix', circuit: 'Bahrain International Circuit', country: 'Bahrain', flag: 'bh', date: '2024-03-02' },
  { id: 2, name: 'Saudi Arabian Grand Prix', circuit: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', flag: 'sa', date: '2024-03-09' },
  { id: 3, name: 'Australian Grand Prix', circuit: 'Albert Park Circuit', country: 'Australia', flag: 'au', date: '2024-03-24' },
  { id: 4, name: 'Japanese Grand Prix', circuit: 'Suzuka International Racing Course', country: 'Japan', flag: 'jp', date: '2024-04-07' },
  { id: 5, name: 'Chinese Grand Prix', circuit: 'Shanghai International Circuit', country: 'China', flag: 'cn', date: '2024-04-21' },
  { id: 6, name: 'Miami Grand Prix', circuit: 'Miami International Autodrome', country: 'USA', flag: 'us', date: '2024-05-05' },
  { id: 7, name: 'Emilia Romagna Grand Prix', circuit: 'Imola Circuit', country: 'Italy', flag: 'it', date: '2024-05-19' },
  { id: 8, name: 'Monaco Grand Prix', circuit: 'Circuit de Monaco', country: 'Monaco', flag: 'mc', date: '2024-05-26' },
  { id: 9, name: 'Canadian Grand Prix', circuit: 'Circuit Gilles Villeneuve', country: 'Canada', flag: 'ca', date: '2024-06-09' },
  { id: 10, name: 'Spanish Grand Prix', circuit: 'Circuit de Barcelona-Catalunya', country: 'Spain', flag: 'es', date: '2024-06-23' },
  { id: 11, name: 'Austrian Grand Prix', circuit: 'Red Bull Ring', country: 'Austria', flag: 'at', date: '2024-06-30' },
  { id: 12, name: 'British Grand Prix', circuit: 'Silverstone Circuit', country: 'UK', flag: 'gb', date: '2024-07-07' },
  { id: 13, name: 'Hungarian Grand Prix', circuit: 'Hungaroring', country: 'Hungary', flag: 'hu', date: '2024-07-21' },
  { id: 14, name: 'Belgian Grand Prix', circuit: 'Circuit de Spa-Francorchamps', country: 'Belgium', flag: 'be', date: '2024-07-28' },
  { id: 15, name: 'Dutch Grand Prix', circuit: 'Circuit Zandvoort', country: 'Netherlands', flag: 'nl', date: '2024-08-25' },
  { id: 16, name: 'Italian Grand Prix', circuit: 'Monza Circuit', country: 'Italy', flag: 'it', date: '2024-09-01' },
  { id: 17, name: 'Azerbaijan Grand Prix', circuit: 'Baku City Circuit', country: 'Azerbaijan', flag: 'az', date: '2024-09-15' },
  { id: 18, name: 'Singapore Grand Prix', circuit: 'Marina Bay Street Circuit', country: 'Singapore', flag: 'sg', date: '2024-09-22' },
  { id: 19, name: 'United States Grand Prix', circuit: 'Circuit of the Americas', country: 'USA', flag: 'us', date: '2024-10-20' },
  { id: 20, name: 'Mexico City Grand Prix', circuit: 'Autódromo Hermanos Rodríguez', country: 'Mexico', flag: 'mx', date: '2024-10-27' },
  { id: 21, name: 'São Paulo Grand Prix', circuit: 'Interlagos Circuit', country: 'Brazil', flag: 'br', date: '2024-11-03' },
  { id: 22, name: 'Las Vegas Grand Prix', circuit: 'Las Vegas Strip Circuit', country: 'USA', flag: 'us', date: '2024-11-23' },
  { id: 23, name: 'Qatar Grand Prix', circuit: 'Losail International Circuit', country: 'Qatar', flag: 'qa', date: '2024-12-01' },
  { id: 24, name: 'Abu Dhabi Grand Prix', circuit: 'Yas Marina Circuit', country: 'UAE', flag: 'ae', date: '2024-12-08' }
];

// Sessioni disponibili
const SESSIONS = [
  { id: 'FP1', name: 'Practice 1' },
  { id: 'FP2', name: 'Practice 2' },
  { id: 'FP3', name: 'Practice 3' },
  { id: 'Q', name: 'Qualifying' },
  { id: 'R', name: 'Race' },
  { id: 'S', name: 'Sprint' },
  { id: 'SQ', name: 'Sprint Qualifying' }
];

const getFlagCodeFromCircuit = (circuitName) => {
  if (!circuitName) return '';
  const normalized = circuitName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  
  if (circuitToCountry[normalized]) return circuitToCountry[normalized];

  const lowerName = circuitName.toLowerCase();
  if (lowerName.includes('monza') || lowerName.includes('imola') || lowerName.includes('mugello') || lowerName.includes('italian') || lowerName.includes('italy')) return 'it';
  if (lowerName.includes('silverstone') || lowerName.includes('british') || lowerName.includes('uk')) return 'gb';
  if (lowerName.includes('spa') || lowerName.includes('belgian')) return 'be';
  if (lowerName.includes('catalunya') || lowerName.includes('barcelona') || lowerName.includes('spanish')) return 'es';
  if (lowerName.includes('hungaroring') || lowerName.includes('hungarian')) return 'hu';
  if (lowerName.includes('red bull ring') || lowerName.includes('austrian')) return 'at';
  if (lowerName.includes('monaco') || lowerName.includes('monte carlo')) return 'mc';
  if (lowerName.includes('americas') || lowerName.includes('usa') || lowerName.includes('miami') || lowerName.includes('las vegas')) return 'us';
  if (lowerName.includes('villeneuve') || lowerName.includes('montreal') || lowerName.includes('canadian')) return 'ca';
  if (lowerName.includes('interlagos') || lowerName.includes('brazilian')) return 'br';
  if (lowerName.includes('rodriguez') || lowerName.includes('mexico')) return 'mx';
  if (lowerName.includes('suzuka') || lowerName.includes('japanese')) return 'jp';
  if (lowerName.includes('shanghai') || lowerName.includes('chinese')) return 'cn';
  if (lowerName.includes('marina bay') || lowerName.includes('singapore')) return 'sg';
  if (lowerName.includes('bahrain') || lowerName.includes('sakhir')) return 'bh';
  if (lowerName.includes('jeddah') || lowerName.includes('saudi')) return 'sa';
  if (lowerName.includes('yas marina') || lowerName.includes('abu dhabi')) return 'ae';
  if (lowerName.includes('albert park') || lowerName.includes('melbourne') || lowerName.includes('australian')) return 'au';
  if (lowerName.includes('zandvoort') || lowerName.includes('dutch')) return 'nl';
  if (lowerName.includes('losail') || lowerName.includes('lusail') || lowerName.includes('qatar')) return 'qa';
  return '';
};

export default function LiveTimingPage() {
  const [telemetryData, setTelemetryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedDriver, setSelectedDriver] = useState('LEC');
  const [selectedRace, setSelectedRace] = useState(RACES_2024[15]); // Monza di default
  const [selectedSession, setSelectedSession] = useState('Q');
  const [comparisonData, setComparisonData] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonDriver, setComparisonDriver] = useState('SAI');
  const [activeTab, setActiveTab] = useState('speed');
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [showRaceDropdown, setShowRaceDropdown] = useState(false);
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const [lastFetchParams, setLastFetchParams] = useState(null);

  // Recupera l'ultima gara disponibile da FastF1 all'avvio
  useEffect(() => {
    fetchLatestRace();
  }, []);

  const fetchLatestRace = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/fastf1/latest-race');
      if (response.ok) {
        const data = await response.json();
        // Cerca la gara corrispondente nella lista RACES_2024
        const latestRace = RACES_2024.find(r => 
          r.circuit.toLowerCase().includes(data.circuit.toLowerCase()) ||
          data.circuit.toLowerCase().includes(r.circuit.toLowerCase())
        );
        if (latestRace) {
          setSelectedRace(latestRace);
          setSelectedYear(data.year);
        }
      }
    } catch (error) {
      console.error("Errore nel recuperare l'ultima gara:", error);
    }
  };

  const fetchTelemetry = async () => {
    setLoading(true);
    setError(null);
    
    const params = {
      year: selectedYear,
      gp: selectedRace.circuit,
      session: selectedSession,
      driver: selectedDriver
    };
    
    setLastFetchParams(params);
    
    try {
      // Fetch telemetria principale
      const response = await fetch(`http://localhost:5000/api/fastf1/telemetry?year=${selectedYear}&gp=${encodeURIComponent(selectedRace.circuit)}&session=${selectedSession}&driver=${selectedDriver}`);
      
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.telemetry || data.telemetry.length === 0) {
        throw new Error('Nessun dato telemetrico disponibile');
      }
      
      const formattedData = data.telemetry.map((point) => ({
        distance: point.Distance,
        speed: point.Speed,
        rpm: point.RPM || 0,
        gear: point.nGear || 0,
        throttle: point.Throttle || 0,
        brake: point.Brake || 0,
        drs: point.DRS || 0,
        time: point.Time || 0
      }));
      
      setTelemetryData(formattedData);
      
      // Fetch comparazione se attiva
      if (showComparison && comparisonDriver !== selectedDriver) {
        await fetchComparisonData();
      } else {
        setComparisonData([]);
      }
      
    } catch (error) {
      console.error("Errore nel caricamento dati FastF1:", error);
      setError(error.message);
      setTelemetryData([]);
      setComparisonData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/fastf1/telemetry?year=${selectedYear}&gp=${encodeURIComponent(selectedRace.circuit)}&session=${selectedSession}&driver=${comparisonDriver}`);
      
      if (response.ok) {
        const data = await response.json();
        const formattedComparison = data.telemetry.map((point) => ({
          distance: point.Distance,
          speed: point.Speed,
          driver: comparisonDriver
        }));
        setComparisonData(formattedComparison);
      }
    } catch (error) {
      console.error("Errore nel caricamento dati comparazione:", error);
    }
  };

  const handleSearch = () => {
    fetchTelemetry();
    if (showComparison) {
      fetchComparisonData();
    }
  };

  const calculateStats = () => {
    if (telemetryData.length === 0) return { maxSpeed: 0, avgSpeed: 0, maxRpm: 0 };
    
    const speeds = telemetryData.map(d => d.speed).filter(s => s > 0);
    const rpms = telemetryData.map(d => d.rpm).filter(r => r > 0);
    
    return {
      maxSpeed: speeds.length > 0 ? Math.max(...speeds) : 0,
      avgSpeed: speeds.length > 0 ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0,
      maxRpm: rpms.length > 0 ? Math.max(...rpms) : 0
    };
  };

  const stats = calculateStats();
  const selectedDriverInfo = DRIVERS_2024.find(d => d.code === selectedDriver);
  const flagCode = getFlagCodeFromCircuit(selectedRace.circuit);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white">
      <Head>
        <title>FastF1 Telemetry | Formula Rossa</title>
        <meta name="description" content="Telemetria F1 in tempo reale con FastF1" />
      </Head>

      <Navigation activeSection="timing" />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        
        {/* Header con selezione */}
        <div className="mb-8">
          <div className="text-red-600 font-black uppercase text-xs mb-2 tracking-[0.2em]">
            FASTF1 TELEMETRY • CUSTOM QUERY
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {/* Selezione Anno */}
            <div className="relative">
              <button
                onClick={() => setShowYearDropdown(!showYearDropdown)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-left hover:border-red-900/50 transition-all group"
              >
                <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 tracking-widest">Year</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                      <Calendar size={16} className="text-red-500" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{selectedYear}</p>
                    </div>
                  </div>
                  <ChevronDown size={18} className="text-zinc-500 group-hover:text-red-500 transition-colors" />
                </div>
              </button>
              
              {showYearDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg z-50 shadow-2xl">
                  {AVAILABLE_YEARS.map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setShowYearDropdown(false);
                      }}
                      className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors ${
                        selectedYear === year ? 'bg-red-600/20 border-l-4 border-red-600' : ''
                      }`}
                    >
                      <p className="text-sm font-bold">{year}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selezione Gara */}
            <div className="relative md:col-span-2">
              <button
                onClick={() => setShowRaceDropdown(!showRaceDropdown)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-left hover:border-red-900/50 transition-all group"
              >
                <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 tracking-widest">Grand Prix</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {flagCode && (
                      <img src={`https://flagcdn.com/w40/${flagCode}.png`} className="h-6 w-auto rounded" alt="flag" />
                    )}
                    <div className="truncate">
                      <p className="font-bold uppercase truncate">{selectedRace.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{selectedRace.circuit}</p>
                    </div>
                  </div>
                  <ChevronDown size={18} className="text-zinc-500 group-hover:text-red-500 transition-colors flex-shrink-0" />
                </div>
              </button>
              
              {showRaceDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg max-h-96 overflow-y-auto z-50 shadow-2xl">
                  {RACES_2024.map(race => (
                    <button
                      key={race.id}
                      onClick={() => {
                        setSelectedRace(race);
                        setShowRaceDropdown(false);
                      }}
                      className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 ${
                        selectedRace.id === race.id ? 'bg-red-600/20 border-l-4 border-red-600' : ''
                      }`}
                    >
                      <img src={`https://flagcdn.com/w20/${race.flag}.png`} className="h-4 w-auto rounded flex-shrink-0" alt="" />
                      <div className="truncate">
                        <p className="text-sm font-bold truncate">{race.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{race.circuit}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selezione Pilota */}
            <div className="relative">
              <button
                onClick={() => setShowDriverDropdown(!showDriverDropdown)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-left hover:border-red-900/50 transition-all group"
              >
                <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 tracking-widest">Driver</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-${selectedDriverInfo?.color || 'red'}-600/20 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-${selectedDriverInfo?.color || 'red'}-400 font-black text-sm`}>#{selectedDriverInfo?.number || '00'}</span>
                    </div>
                    <div className="truncate">
                      <p className="font-bold uppercase">{selectedDriver}</p>
                      <p className="text-xs text-zinc-500 truncate">{selectedDriverInfo?.name || ''}</p>
                    </div>
                  </div>
                  <ChevronDown size={18} className="text-zinc-500 group-hover:text-red-500 transition-colors flex-shrink-0" />
                </div>
              </button>
              
              {showDriverDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg max-h-96 overflow-y-auto z-50 shadow-2xl">
                  {DRIVERS_2024.map(driver => (
                    <button
                      key={driver.code}
                      onClick={() => {
                        setSelectedDriver(driver.code);
                        setShowDriverDropdown(false);
                      }}
                      className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 ${
                        selectedDriver === driver.code ? 'bg-red-600/20 border-l-4 border-red-600' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 bg-${driver.color}-600/20 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-${driver.color}-400 font-black text-sm`}>#{driver.number}</span>
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold">{driver.code} • {driver.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{driver.team}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selezione Sessione */}
            <div className="relative">
              <button
                onClick={() => setShowSessionDropdown(!showSessionDropdown)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-left hover:border-red-900/50 transition-all group"
              >
                <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 tracking-widest">Session</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock size={16} className="text-red-500" />
                    </div>
                    <div>
                      <p className="font-bold uppercase">{selectedSession}</p>
                      <p className="text-xs text-zinc-500">{SESSIONS.find(s => s.id === selectedSession)?.name}</p>
                    </div>
                  </div>
                  <ChevronDown size={18} className="text-zinc-500 group-hover:text-red-500 transition-colors flex-shrink-0" />
                </div>
              </button>
              
              {showSessionDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg z-50 shadow-2xl">
                  {SESSIONS.map(session => (
                    <button
                      key={session.id}
                      onClick={() => {
                        setSelectedSession(session.id);
                        setShowSessionDropdown(false);
                      }}
                      className={`w-full p-3 text-left hover:bg-zinc-800 transition-colors ${
                        selectedSession === session.id ? 'bg-red-600/20 border-l-4 border-red-600' : ''
                      }`}
                    >
                      <p className="text-sm font-bold">{session.id}</p>
                      <p className="text-xs text-zinc-500">{session.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Barra di controllo comparazione e ricerca */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-zinc-900/50 rounded-lg p-2">
                <span className="text-xs text-zinc-400">Compare:</span>
                <select
                  value={comparisonDriver}
                  onChange={(e) => setComparisonDriver(e.target.value)}
                  className="bg-zinc-800 text-white rounded-lg px-3 py-1.5 text-sm font-mono"
                  disabled={!showComparison}
                >
                  {DRIVERS_2024.filter(d => d.code !== selectedDriver).map(d => (
                    <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    showComparison 
                      ? 'bg-red-600 text-white' 
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {showComparison ? 'ON' : 'OFF'}
                </button>
              </div>
              
              {lastFetchParams && (
                <div className="text-xs text-zinc-600">
                  Last query: {lastFetchParams.year} • {lastFetchParams.gp} • {lastFetchParams.driver} • {lastFetchParams.session}
                </div>
              )}
            </div>
            
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-mono text-sm flex items-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  LOADING...
                </>
              ) : (
                <>
                  <Search size={16} />
                  FETCH TELEMETRY
                </>
              )}
            </button>
          </div>
        </div>

        {/* Messaggio di errore */}
        {error && (
          <div className="mb-4 bg-red-900/20 border border-red-900/50 rounded-lg p-4">
            <p className="text-red-400 text-sm font-mono">Error: {error}</p>
            <p className="text-xs text-zinc-500 mt-1">Try different parameters or check if FastF1 server is running</p>
          </div>
        )}

        {/* Stats cards - mostrate solo se ci sono dati */}
        {telemetryData.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-zinc-500 text-xs font-mono mb-1">TOP SPEED</div>
                    <div className="text-3xl font-bold text-red-500">
                      {stats.maxSpeed}
                      <span className="text-sm text-zinc-500 ml-1">km/h</span>
                    </div>
                  </div>
                  <Gauge className="w-5 h-5 text-red-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-zinc-500 text-xs font-mono mb-1">AVG SPEED</div>
                    <div className="text-3xl font-bold text-blue-400">
                      {stats.avgSpeed}
                      <span className="text-sm text-zinc-500 ml-1">km/h</span>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-zinc-500 text-xs font-mono mb-1">MAX RPM</div>
                    <div className="text-3xl font-bold text-purple-400">
                      {stats.maxRpm.toLocaleString()}
                    </div>
                  </div>
                  <Cpu className="w-5 h-5 text-purple-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-zinc-500 text-xs font-mono mb-1">DATA POINTS</div>
                    <div className="text-3xl font-bold text-green-400">
                      {telemetryData.length}
                    </div>
                  </div>
                  <Disc className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>

            {/* Main telemetry section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              
              {/* Telemetry chart */}
              <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-900 p-4 border-b border-zinc-800">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-mono flex items-center gap-2">
                      <Activity size={16} className="text-red-500" /> TELEMETRY • {selectedDriver} • {selectedRace.circuit} • {selectedSession} • {selectedYear}
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
                      <Tooltip 
                        contentStyle={{backgroundColor: '#000', border: '1px solid #ff0000'}}
                      />
                      
                      {activeTab === 'speed' && (
                        <>
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="speed" 
                            stroke="#ff0000" 
                            dot={false} 
                            strokeWidth={2.5}
                            name={`${selectedDriver} Speed`}
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
                              name={`${comparisonDriver} Speed`}
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
              </div>

              {/* Throttle & Brake */}
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
                
                <div className="grid grid-cols-2 gap-2 p-4 border-t border-zinc-800">
                  <div className="bg-zinc-900 rounded-lg p-3">
                    <div className="text-xs text-zinc-500">DRS</div>
                    <div className="text-lg font-bold text-green-400">
                      {telemetryData.some(d => d.drs > 0) ? 'ACTIVE' : 'INACTIVE'}
                    </div>
                  </div>
                  <div className="bg-zinc-900 rounded-lg p-3">
                    <div className="text-xs text-zinc-500">AVG GEAR</div>
                    <div className="text-lg font-bold text-yellow-400">
                      {(telemetryData.reduce((acc, d) => acc + (d.gear || 0), 0) / telemetryData.length).toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Nessun dato disponibile */}
        {!loading && !error && telemetryData.length === 0 && (
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-12 text-center">
            <Activity size={48} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-mono text-lg mb-2">NO TELEMETRY DATA</p>
            <p className="text-sm text-zinc-600">Select parameters and click "FETCH TELEMETRY" to load data</p>
          </div>
        )}

        {/* FastF1 Status */}
        <div className="flex justify-between items-center bg-zinc-900/30 rounded-lg border border-zinc-800 p-3 mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-zinc-400">FastF1 Pipeline</span>
              <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">v2.4.6</span>
            </div>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="text-xs text-zinc-500">
              {selectedRace.name} • {selectedDriver} • {selectedSession} • {selectedYear}
            </div>
          </div>
          <div className="text-xs text-zinc-600 font-mono">
            {telemetryData.length > 0 ? `${telemetryData.length} data points` : 'No data loaded'}
          </div>
        </div>
      </main>

      <Footer />

      {loading && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-red-900/50 rounded-2xl p-8 max-w-md">
            <div className="flex flex-col items-center gap-6">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
              <div className="text-center">
                <p className="text-red-500 font-mono text-lg mb-2">FETCHING FASTF1 TELEMETRY</p>
                <p className="text-sm text-zinc-500">
                  {selectedRace.name} • {selectedDriver} • {selectedSession} • {selectedYear}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
