import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';

const nationalityToCountryCode = {
  'Monegasque': 'mc', 'British': 'gb', 'Italian': 'it', 'French': 'fr',
  'German': 'de', 'Spanish': 'es', 'Dutch': 'nl', 'Belgian': 'be',
  'Austrian': 'at', 'Swiss': 'ch', 'Swedish': 'se', 'Norwegian': 'no',
  'Danish': 'dk', 'Finnish': 'fi', 'Portuguese': 'pt', 'Irish': 'ie',
  'Polish': 'pl', 'Czech': 'cz', 'Slovak': 'sk', 'Hungarian': 'hu',
  'Romanian': 'ro', 'Bulgarian': 'bg', 'Greek': 'gr', 'Croatian': 'hr',
  'Slovenian': 'si', 'Serbian': 'rs', 'Ukrainian': 'ua', 'Russian': 'ru',
  'Estonian': 'ee', 'Latvian': 'lv', 'Lithuanian': 'lt', 'American': 'us',
  'Canadian': 'ca', 'Mexican': 'mx', 'Brazilian': 'br', 'Argentine': 'ar',
  'Chilean': 'cl', 'Colombian': 'co', 'Venezuelan': 've', 'Peruvian': 'pe',
  'Uruguayan': 'uy', 'Japanese': 'jp', 'Chinese': 'cn', 'South Korean': 'kr',
  'Indian': 'in', 'Thai': 'th', 'Malaysian': 'my', 'Indonesian': 'id',
  'Singaporean': 'sg', 'Filipino': 'ph', 'Vietnamese': 'vn', 'Saudi Arabian': 'sa',
  'Emirati': 'ae', 'Qatari': 'qa', 'Israeli': 'il', 'Turkish': 'tr',
  'Australian': 'au', 'New Zealander': 'nz'
};

const circuitToCountry = {
  // === Moderni / principali ===
  'albert_park': 'au', 'albert-park': 'au',
  'shanghai': 'cn',
  'suzuka': 'jp',
  'bahrain': 'bh',
  'jeddah': 'sa',
  'miami': 'us',
  'imola': 'it',
  'monaco': 'mc',
  'catalunya': 'es',
  'villeneuve': 'ca',
  'red_bull_ring': 'at', 'red-bull-ring': 'at',
  'silverstone': 'gb',
  'spa': 'be',
  'hungaroring': 'hu',
  'zandvoort': 'nl',
  'monza': 'it',
  'baku': 'az',
  'marina_bay': 'sg', 'marina-bay': 'sg',
  'americas': 'us',
  'rodriguez': 'mx',
  'interlagos': 'br',
  'vegas': 'us',
  'losail': 'qa',
  'yas_marina': 'ae', 'yas-marina': 'ae',

  // === USA storici ===
  'indianapolis': 'us',
  'sebring': 'us',
  'riverside': 'us',
  'watkins_glen': 'us', 'watkins-glen': 'us',
  'long_beach': 'us', 'long-beach': 'us',
  'phoenix': 'us',
  'detroit': 'us',
  'dallas': 'us',
  'caesars_palace': 'us', 'caesars-palace': 'us',

  // === Europa storici ===
  'bremgarten': 'ch',
  'reims': 'fr',
  'nurburgring': 'de',
  'pedralbes': 'es',
  'essarts': 'fr',
  'aintree': 'gb',
  'pescara': 'it',
  'boavista': 'pt',
  'avus': 'de',
  'monsanto': 'pt',
  'brands_hatch': 'gb', 'brands-hatch': 'gb',
  'charade': 'fr',
  'zeltweg': 'at',
  'lemans': 'fr', 'le-mans': 'fr',
  'jarama': 'es',
  'montjuic': 'es',
  'hockenheimring': 'de',
  'ricard': 'fr',
  'nivelles': 'be',
  'zolder': 'be',
  'anderstorp': 'se',
  'dijon': 'fr',
  'donington': 'gb',
  'estoril': 'pt',
  'magny_cours': 'fr', 'magny-cours': 'fr',
  'valencia': 'es',

  // === Africa ===
  'ain_diab': 'ma', 'ain-diab': 'ma',
  'george': 'za',
  'kyalami': 'za',

  // === Sud America ===
  'galvez': 'ar',
  'jacarepagua': 'br',

  // === Asia / Medio Oriente ===
  'fuji': 'jp',
  'okayama': 'jp',
  'sepang': 'my',
  'buddh': 'in',
  'yeongam': 'kr',
  'istanbul': 'tr',
  'sochi': 'ru',

  // === One-off recenti ===
  'mugello': 'it'
};

export default function StandingsPage() {
  const [driverStandings, setDriverStandings] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState({});
  const [constructors, setConstructors] = useState({});
  const [selectedSeason, setSelectedSeason] = useState(2024);
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [showFullDrivers, setShowFullDrivers] = useState(false);
  const [showFullConstructors, setShowFullConstructors] = useState(false);
  const [activeSection, setActiveSection] = useState('stats');

  async function loadJSON(path) {
    try {
      const response = await fetch(path);
      return response.ok ? await response.json() : null;
    } catch { return null; }
  }

  async function loadStandings() {
    try {
      setLoading(true);
      // Caricamento file F1DB
      const [drData, coData, drStData, coStData, racesData] = await Promise.all([
        loadJSON('/data/f1db-drivers.json'),
        loadJSON('/data/f1db-constructors.json'),
        loadJSON('/data/f1db-races-driver-standings.json'),
        loadJSON('/data/f1db-races-constructor-standings.json'),
        loadJSON('/data/f1db-races.json')
      ]);

      const drMap = {}; drData?.forEach(d => { if(d.id) drMap[d.id] = d });
      const coMap = {}; coData?.forEach(c => { if(c.id) coMap[c.id] = c });
      setDrivers(drMap); setConstructors(coMap);

      const seasons = [...new Set(drStData?.map(s => s.year))].sort((a, b) => b - a);
      setAvailableSeasons(seasons);

      const drS = drStData?.filter(s => s.year === selectedSeason) || [];
      if (drS.length > 0) {
        const maxR = Math.max(...drS.map(s => s.round));
        setDriverStandings(drS.filter(s => s.round === maxR && s.positionNumber).sort((a, b) => a.positionNumber - b.positionNumber));
      }

      const coS = coStData?.filter(s => s.year === selectedSeason) || [];
      if (coS.length > 0) {
        const maxR = Math.max(...coS.map(s => s.round));
        setConstructorStandings(coS.filter(s => s.round === maxR && s.positionNumber).sort((a, b) => a.positionNumber - b.positionNumber));
      }

      setCalendar(racesData?.filter(r => r.year === selectedSeason).sort((a, b) => a.round - b.round) || []);
    } catch (e) {
      console.error("Errore caricamento:", e);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadStandings(); }, [selectedSeason]);

  const visibleDrivers = showFullDrivers ? driverStandings : driverStandings.slice(0, 5);
  const visibleConstructors = showFullConstructors ? constructorStandings : constructorStandings.slice(0, 5);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-20 w-20 border-4 border-t-red-600"></div></div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation activeSection="stats" />
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <div className="flex justify-between items-end mb-12 border-b border-red-600/30 pb-6">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">Standings <span className="text-red-600">{selectedSeason}</span></h1>
          <select value={selectedSeason} onChange={(e) => setSelectedSeason(Number(e.target.value))} className="bg-zinc-900 border-l-4 border-red-600 px-4 py-2 font-bold outline-none text-white">
            {availableSeasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Driver Table */}
          <div className="bg-zinc-900/40 border border-zinc-800">
            <h2 className="p-4 font-black uppercase text-sm border-b border-zinc-800 text-red-600">Drivers</h2>
            <table className="w-full text-left text-sm">
              <tbody>
                {visibleDrivers.map((s) => (
                  <tr key={s.driverId} className="border-b border-zinc-800/30 hover:bg-white/5 transition-colors">
                    <td className="p-4 w-12 font-black italic text-zinc-500">{s.positionNumber}</td>
                    <td className="p-4 font-bold">{drivers[s.driverId]?.lastName?.toUpperCase()}</td>
                    <td className="p-4 text-zinc-500 text-[10px] uppercase font-bold">{constructors[s.constructorId]?.name || s.constructorId}</td>
                    <td className="p-4 text-right font-black">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setShowFullDrivers(!showFullDrivers)} className="w-full p-3 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors">
              {showFullDrivers ? '↑ Close' : '↓ View All'}
            </button>
          </div>

          {/* Constructor Table */}
          <div className="bg-zinc-900/40 border border-zinc-800">
            <h2 className="p-4 font-black uppercase text-sm border-b border-zinc-800 text-red-600">Constructors</h2>
            <table className="w-full text-left text-sm">
              <tbody>
                {visibleConstructors.map((s) => (
                  <tr key={s.constructorId} className="border-b border-zinc-800/30 hover:bg-white/5 transition-colors">
                    <td className="p-4 w-12 font-black italic text-zinc-500">{s.positionNumber}</td>
                    <td className="p-4 font-bold">{constructors[s.constructorId]?.name?.toUpperCase()}</td>
                    <td className="p-4 text-right font-black">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setShowFullConstructors(!showFullConstructors)} className="w-full p-3 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors">
              {showFullConstructors ? '↑ Close' : '↓ View All'}
            </button>
          </div>
        </div>

{/* Calendar Section */}
<h2 className="mb-8 font-black uppercase tracking-[0.2em] text-sm text-red-600 border-b border-red-600/20 pb-2">
  Race Calendar {selectedSeason}
</h2>

<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
  {calendar.map((race) => {
    const countryCode = circuitToCountry[race.circuitId];
    
    return (
      <Link 
        key={race.id} 
        href={`/races?id=${race.id}`} 
        className="relative group bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden hover:border-red-600 transition-all duration-300"
      >
        {/* Cerchietto Rosso con Numero */}
        <div className="absolute top-2 left-2 z-20 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shadow-lg border border-black/20">
          <span className="text-white text-[10px] font-black">{race.round}</span>
        </div>

        {/* Contenitore Bandiera (Grande) */}
        <div className="relative h-24 w-full overflow-hidden bg-zinc-800">
          {countryCode ? (
            <img 
              src={`https://flagcdn.com/w320/${countryCode}.png`} 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" 
              alt={race.name} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-600 uppercase font-black">
              Flag missing
            </div>
          )}
          {/* Overlay gradiente per leggere meglio il testo se necessario */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60"></div>
        </div>

        {/* Info Gara Sotto */}
        <div className="p-3 bg-zinc-900">
          <div className="font-black text-[10px] uppercase truncate text-white mb-1 tracking-tighter">
            {race.name.replace('Grand Prix', 'GP')}
          </div>
          <div className="text-[9px] font-bold text-zinc-500 group-hover:text-red-500 transition-colors">
            {race.date}
          </div>
        </div>
      </Link>
    );
  })}
</div>
