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
  RefreshCw,
  X
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
  Bar,
  ScatterChart,
  Scatter,
  ZAxis
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

// Lista completa piloti
const DRIVERS = [
  { code: 'VER', name: 'Max Verstappen', team: 'Red Bull', number: 1, color: '#1e3c72' },
  { code: 'PER', name: 'Sergio Pérez', team: 'Red Bull', number: 11, color: '#2b4f8c' },
  { code: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes', number: 44, color: '#6f7c8a' },
  { code: 'RUS', name: 'George Russell', team: 'Mercedes', number: 63, color: '#8f9b9c' },
  { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', number: 16, color: '#dc2626' },
  { code: 'SAI', name: 'Carlos Sainz', team: 'Ferrari', number: 55, color: '#b91c1c' },
  { code: 'NOR', name: 'Lando Norris', team: 'McLaren', number: 4, color: '#f97316' },
  { code: 'PIA', name: 'Oscar Piastri', team: 'McLaren', number: 81, color: '#ea580c' },
  { code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', number: 14, color: '#15803d' },
  { code: 'STR', name: 'Lance Stroll', team: 'Aston Martin', number: 18, color: '#166534' },
  { code: 'GAS', name: 'Pierre Gasly', team: 'Alpine', number: 10, color: '#f43f5e' },
  { code: 'OCO', name: 'Esteban Ocon', team: 'Alpine', number: 31, color: '#e11d48' },
  { code: 'ALB', name: 'Alexander Albon', team: 'Williams', number: 23, color: '#2563eb' },
  { code: 'SAR', name: 'Logan Sargeant', team: 'Williams', number: 2, color: '#1d4ed8' },
  { code: 'BOT', name: 'Valtteri Bottas', team: 'Sauber', number: 77, color: '#16a34a' },
  { code: 'ZHO', name: 'Guanyu Zhou', team: 'Sauber', number: 24, color: '#15803d' },
  { code: 'TSU', name: 'Yuki Tsunoda', team: 'RB', number: 22, color: '#3b82f6' },
  { code: 'RIC', name: 'Daniel Ricciardo', team: 'RB', number: 3, color: '#2563eb' },
  { code: 'MAG', name: 'Kevin Magnussen', team: 'Haas', number: 20, color: '#b91c1c' },
  { code: 'HUL', name: 'Nico Hülkenberg', team: 'Haas', number: 27, color: '#991b1b' }
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
  // Stati principali
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedRace, setSelectedRace] = useState(RACES_2024[15]);
  const [selectedSession, setSelectedSession] = useState('Q');
  const [selectedDrivers, setSelectedDrivers] = useState(['LEC', 'SAI']); // Multi-select
  
  // Stati per i dati
  const [lapChartData, setLapChartData] = useState([]);
  const [selectedLaps, setSelectedLaps] = useState([]); // Array di { driver, lapNumber, telemetry, color }
  
  // Stati UI
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showRaceDropdown, setShowRaceDropdown] = useState(false);
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const [showDriversDropdown, setShowDriversDropdown] = useState(false);

  // Recupera l'ultima gara disponibile da FastF1 all'avvio
  useEffect(() => {
    fetchLatestRace();
  }, []);

  // Carica i dati del lap chart quando cambiano anno/gara/sessione
  useEffect(() => {
    if (selectedRace && selectedSession) {
      fetchLapChartData();
    }
  }, [selectedYear, selectedRace, selectedSession]);

  const fetchLatestRace = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/fastf1/latest-race');
      if (response.ok) {
        const data = await response.json();
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

  const fetchLapChartData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/fastf1/lap-chart?year=${selectedYear}&gp=${encodeURIComponent(selectedRace.circuit)}&session=${selectedSession}`);
      
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Trasforma i dati per il grafico
      const formattedData = [];
      Object.keys(data).forEach(driverCode => {
        const driverLaps = data[driverCode].map(lap => ({
          driver: driverCode,
          lapNumber: lap.lapNumber,
          lapTime: lap.lapTime,
          color: DRIVERS.find(d => d.code === driverCode)?.color || '#666'
        }));
        formattedData.push(...driverLaps);
      });
      
      setLapChartData(formattedData);
      
    } catch (error) {
      console.error("Errore nel caricamento lap chart:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLapTelemetry = async (driver, lapNumber) => {
    try {
      const response = await fetch(`http://localhost:5000/api/fastf1/lap-telemetry?year=${selectedYear}&gp=${encodeURIComponent(selectedRace.circuit)}&session=${selectedSession}&driver=${driver}&lap=${lapNumber}`);
      
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      const formattedTelemetry = data.telemetry.map(point => ({
        distance: point.Distance,
        speed: point.Speed,
        rpm: point.RPM || 0,
        gear: point.nGear || 0,
        throttle: point.Throttle || 0,
        brake: point.Brake || 0,
        drs: point.DRS || 0,
        time: point.Time || 0
      }));
      
      return formattedTelemetry;
      
    } catch (error) {
      console.error("Errore nel caricamento telemetria giro:", error);
      return [];
    }
  };

  const handleLapClick = async (lapData) => {
    // Verifica se il giro è già selezionato
    const alreadySelected = selectedLaps.some(
      lap => lap.driver === lapData.driver && lap.lapNumber === lapData.lapNumber
    );
    
    if (alreadySelected) {
      // Rimuovi il giro
      setSelectedLaps(selectedLaps.filter(
        lap => !(lap.driver === lapData.driver && lap.lapNumber === lapData.lapNumber)
      ));
    } else {
      // Aggiungi il giro
      setLoading(true);
      const telemetry = await fetchLapTelemetry(lapData.driver, lapData.lapNumber);
      
      const newLap = {
        driver: lapData.driver,
        lapNumber: lapData.lapNumber,
        lapTime: lapData.lapTime,
        telemetry: telemetry,
        color: lapData.color
      };
      
      setSelectedLaps([...selectedLaps, newLap]);
      setLoading(false);
    }
  };

  const removeSelectedLap = (lapToRemove) => {
    setSelectedLaps(selectedLaps.filter(
      lap => !(lap.driver === lapToRemove.driver && lap.lapNumber === lapToRemove.lapNumber)
    ));
  };

  const toggleDriverSelection = (driverCode) => {
    if (selectedDrivers.includes(driverCode)) {
      setSelectedDrivers(selectedDrivers.filter(d => d !== driverCode));
    } else {
      setSelectedDrivers([...selectedDrivers, driverCode]);
    }
  };

  const flagCode = getFlagCodeFromCircuit(selectedRace.circuit);

  // Tooltip personalizzato per il lap chart
  const LapChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-bold" style={{color: data.color}}>{data.driver}</p>
          <p className="text-xs text-zinc-400">Lap {data.lapNumber}</p>
          <p className="text-xs font-mono text-green-400">{data.lapTime}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>F1 Tempo Style Telemetry | Formula Rossa</title>
        <meta name="description" content="Analisi telemetrica F1 stile F1 Tempo" />
      </Head>

      <Navigation activeSection="timing" />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        
        {/* Header con selezione - stile f1-tempo.com */}
        <div className="mb-8">
          <div className="text-red-600 font-black uppercase text-xs mb-4 tracking-[0.2em]">
            F1 TEMPO STYLE • LAP & TELEMETRY ANALYSIS
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Selezione Anno */}
            <div className="relative">
              <button
                onClick={() => setShowYearDropdown(!showYearDropdown)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-left hover:border-red-900/50 transition-all"
              >
                <p className="text-[10px] text-zinc-500 mb-1">YEAR</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">{selectedYear}</span>
                  <ChevronDown size={16} className="text-zinc-500" />
                </div>
              </button>
              
              {showYearDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg z-50">
                  {AVAILABLE_YEARS.map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setShowYearDropdown(false);
                      }}
                      className={`w-full p-2 text-left hover:bg-zinc-800 transition-colors ${
                        selectedYear === year ? 'bg-red-600/20 text-red-400' : ''
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selezione Gara */}
            <div className="relative md:col-span-1">
              <button
                onClick={() => setShowRaceDropdown(!showRaceDropdown)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-left hover:border-red-900/50 transition-all"
              >
                <p className="text-[10px] text-zinc-500 mb-1">GRAND PRIX</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    {flagCode && (
                      <img src={`https://flagcdn.com/w20/${flagCode}.png`} className="h-4 w-auto rounded" alt="" />
                    )}
                    <span className="font-bold truncate">{selectedRace.name}</span>
                  </div>
                  <ChevronDown size={16} className="text-zinc-500 flex-shrink-0" />
                </div>
              </button>
              
              {showRaceDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg max-h-60 overflow-y-auto z-50">
                  {RACES_2024.map(race => (
                    <button
                      key={race.id}
                      onClick={() => {
                        setSelectedRace(race);
                        setShowRaceDropdown(false);
                      }}
                      className={`w-full p-2 text-left hover:bg-zinc-800 transition-colors flex items-center gap-2 ${
                        selectedRace.id === race.id ? 'bg-red-600/20' : ''
                      }`}
                    >
                      <img src={`https://flagcdn.com/w20/${race.flag}.png`} className="h-3 w-auto rounded" alt="" />
                      <span className="text-sm truncate">{race.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selezione Sessione */}
            <div className="relative">
              <button
                onClick={() => setShowSessionDropdown(!showSessionDropdown)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-left hover:border-red-900/50 transition-all"
              >
                <p className="text-[10px] text-zinc-500 mb-1">SESSION</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">{selectedSession}</span>
                  <ChevronDown size={16} className="text-zinc-500" />
                </div>
              </button>
              
              {showSessionDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg z-50">
                  {SESSIONS.map(session => (
                    <button
                      key={session.id}
                      onClick={() => {
                        setSelectedSession(session.id);
                        setShowSessionDropdown(false);
                      }}
                      className={`w-full p-2 text-left hover:bg-zinc-800 transition-colors ${
                        selectedSession === session.id ? 'bg-red-600/20 text-red-400' : ''
                      }`}
                    >
                      <div className="text-sm font-bold">{session.id}</div>
                      <div className="text-xs text-zinc-500">{session.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selezione Piloti (multi-select) */}
            <div className="relative">
              <button
                onClick={() => setShowDriversDropdown(!showDriversDropdown)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-left hover:border-red-900/50 transition-all"
              >
                <p className="text-[10px] text-zinc-500 mb-1">DRIVERS</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">{selectedDrivers.length} selected</span>
                  <ChevronDown size={16} className="text-zinc-500" />
                </div>
              </button>
              
              {showDriversDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg max-h-60 overflow-y-auto z-50">
                  {DRIVERS.map(driver => (
                    <button
                      key={driver.code}
                      onClick={() => toggleDriverSelection(driver.code)}
                      className={`w-full p-2 text-left hover:bg-zinc-800 transition-colors flex items-center gap-2 ${
                        selectedDrivers.includes(driver.code) ? 'bg-red-600/20' : ''
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: driver.color}}></div>
                      <span className="text-sm font-bold">{driver.code}</span>
                      <span className="text-xs text-zinc-500">{driver.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Layout a due colonne come f1-tempo.com */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLONNA SINISTRA: LAP CHART */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-mono flex items-center gap-2">
                <Activity size={14} className="text-red-500" /> LAP CHART
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {selectedRace.name} {selectedYear} • {selectedSession}
              </p>
            </div>
            
            <div className="p-4 h-[500px]">
              {loading && lapChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <RefreshCw size={32} className="text-zinc-700 animate-spin" />
                </div>
              ) : lapChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      type="number" 
                      dataKey="lapNumber" 
                      name="Lap" 
                      tick={{ fill: '#666', fontSize: 11 }}
                      label={{ value: 'Lap Number', position: 'bottom', fill: '#666', fontSize: 11 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="lapTime" 
                      name="Time" 
                      tick={{ fill: '#666', fontSize: 11 }}
                      label={{ value: 'Lap Time (s)', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 11 }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<LapChartTooltip />} />
                    
                    {/* Crea uno scatter per ogni pilota selezionato */}
                    {selectedDrivers.map(driverCode => {
                      const driverData = lapChartData.filter(d => d.driver === driverCode);
                      const driverColor = DRIVERS.find(d => d.code === driverCode)?.color || '#666';
                      
                      return (
                        <Scatter
                          key={driverCode}
                          name={driverCode}
                          data={driverData}
                          fill={driverColor}
                          shape="circle"
                          onClick={handleLapClick}
                          cursor="pointer"
                        />
                      );
                    })}
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                  <Disc size={48} className="mb-4 opacity-30" />
                  <p className="text-sm">Waiting for your selections...</p>
                </div>
              )}
            </div>
            
            <div className="border-t border-zinc-800 p-3 text-xs text-zinc-500 bg-zinc-900/20">
              Click on a dot to add lap to telemetry comparison
            </div>
          </div>

          {/* COLONNA DESTRA: TELEMETRY COMPARISON */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-mono flex items-center gap-2">
                <Gauge size={14} className="text-red-500" /> TELEMETRY
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {selectedLaps.length} {selectedLaps.length === 1 ? 'lap' : 'laps'} selected
              </p>
            </div>
            
            <div className="p-4 h-[400px]">
              {selectedLaps.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      type="number" 
                      dataKey="distance" 
                      tick={{ fill: '#666', fontSize: 11 }}
                      label={{ value: 'Distance (m)', position: 'bottom', fill: '#666', fontSize: 11 }}
                    />
                    <YAxis 
                      tick={{ fill: '#666', fontSize: 11 }}
                      label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 11 }}
                      domain={[0, 360]}
                    />
                    <Tooltip />
                    
                    {selectedLaps.map((lap, index) => (
                      <Line
                        key={`${lap.driver}-${lap.lapNumber}`}
                        type="monotone"
                        data={lap.telemetry}
                        dataKey="speed"
                        stroke={lap.color}
                        dot={false}
                        strokeWidth={2}
                        name={`${lap.driver} L${lap.lapNumber}`}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                  <Activity size={48} className="mb-4 opacity-30" />
                  <p className="text-sm">No valid laps have been selected</p>
                  <p className="text-xs mt-2 text-center">Click on a dot on the lap chart to add it</p>
                </div>
              )}
            </div>

            {/* Lista giri selezionati */}
            {selectedLaps.length > 0 && (
              <div className="border-t border-zinc-800 p-3 bg-zinc-900/20">
                <p className="text-xs text-zinc-500 mb-2">Selected laps:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedLaps.map(lap => (
                    <div 
                      key={`${lap.driver}-${lap.lapNumber}`}
                      className="bg-zinc-800 rounded-full pl-2 pr-1 py-1 text-xs flex items-center gap-1"
                    >
                      <span className="w-2 h-2 rounded-full" style={{backgroundColor: lap.color}}></span>
                      <span className="font-mono">{lap.driver} L{lap.lapNumber}</span>
                      <span className="text-green-400 ml-1">{lap.lapTime}</span>
                      <button 
                        onClick={() => removeSelectedLap(lap)}
                        className="ml-1 p-1 hover:bg-zinc-700 rounded-full"
                      >
                        <X size={12} className="text-zinc-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messaggio di errore */}
        {error && (
          <div className="mt-6 bg-red-900/20 border border-red-900/50 rounded-lg p-4">
            <p className="text-red-400 text-sm font-mono">Error: {error}</p>
          </div>
        )}

        {/* Footer con ringraziamenti (stile f1-tempo.com) */}
        <div className="mt-12 text-center">
          <p className="text-xs text-zinc-600">
            🏁 Thank you for your ongoing support this season
          </p>
          <p className="text-xs text-zinc-700 mt-1">
            Data provided by FastF1 • Formula Rossa Telemetry
          </p>
        </div>
      </main>

      <Footer />

      {loading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-red-900/50 rounded-lg p-6">
            <RefreshCw size={32} className="text-red-600 animate-spin mx-auto mb-4" />
            <p className="text-sm text-zinc-400">Loading telemetry data...</p>
          </div>
        </div>
      )}
    </div>
  );
}