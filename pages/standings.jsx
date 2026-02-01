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
  'albert_park': 'au', 'shanghai': 'cn', 'suzuka': 'jp', 'bahrain': 'bh',
  'jeddah': 'sa', 'miami': 'us', 'imola': 'it', 'monaco': 'mc',
  'catalunya': 'es', 'villeneuve': 'ca', 'red_bull_ring': 'at', 'silverstone': 'gb',
  'spa': 'be', 'hungaroring': 'hu', 'zandvoort': 'nl', 'monza': 'it',
  'baku': 'az', 'marina_bay': 'sg', 'americas': 'us', 'rodriguez': 'mx',
  'interlagos': 'br', 'vegas': 'us', 'losail': 'qa', 'yas_marina': 'ae',
  'indianapolis': 'us', 'bremgarten': 'ch', 'reims': 'fr', 'nurburgring': 'de', 
  'pedralbes': 'es', 'essarts': 'fr', 'galvez': 'ar', 'aintree': 'gb', 'pescara': 'it',
  'boavista': 'pt', 'ain-diab': 'ma', 'avus': 'de', 'monsanto': 'pt', 'sebring': 'us',
  'riverside': 'us', 'watkins_glen': 'us', 'george': 'za', 'zeltweg': 'at', 'brands_hatch': 'gb',
  'charade': 'fr', 'kyalami': 'za', 'lemans': 'fr', 'mosport': 'ca', 'jarama': 'es',
  'montjuic': 'es', 'tremblant': 'ca', 'hockenheimring': 'de', 'ricard': 'fr', 'nivelles': 'be',
  'zolder': 'be', 'anderstorp': 'se', 'dijon': 'fr', 'fuji': 'jp', 'jacarepagua': 'br',
  'donington': 'gb', 'okayama': 'jp', 'estoril': 'pt', 'magny_cours': 'fr', 'sepang': 'my',
  'buddh': 'in', 'yeongam': 'kr', 'istanbul': 'tr', 'sochi': 'ru', 'valencia': 'es'
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

  async function loadJSON(path) {
    try {
      const response = await fetch(path);
      return response.ok ? await response.json() : null;
    } catch { return null; }
  }

  async function loadStandings() {
    try {
      setLoading(true);
      const [drData, coData, drStData, coStData, racesData] = await Promise.all([
        loadJSON('/data/drivers.json'),
        loadJSON('/data/constructors.json'),
        loadJSON('/data/driver_standings.json'),
        loadJSON('/data/constructor_standings.json'),
        loadJSON('/data/races.json')
      ]);

      const drMap = {}; drData?.forEach(d => drMap[d.driver_id] = d);
      const coMap = {}; coData?.forEach(c => coMap[c.constructor_id] = c);
      setDrivers(drMap); setConstructors(coMap);

      const seasons = [...new Set(drStData?.map(s => s.season))].sort((a, b) => b - a);
      setAvailableSeasons(seasons);

      const drS = drStData?.filter(s => s.season === selectedSeason) || [];
      if (drS.length > 0) {
        const maxR = Math.max(...drS.map(s => s.round));
        setDriverStandings(drS.filter(s => s.round === maxR && s.position).sort((a, b) => a.position - b.position));
      }

      const coS = coStData?.filter(s => s.season === selectedSeason) || [];
      if (coS.length > 0) {
        const maxR = Math.max(...coS.map(s => s.round));
        setConstructorStandings(coS.filter(s => s.round === maxR && s.position).sort((a, b) => a.position - b.position));
      }

      setCalendar(racesData?.filter(r => r.season === selectedSeason).sort((a, b) => a.round - b.round) || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadStandings(); }, [selectedSeason]);

  const visibleDrivers = showFullDrivers ? driverStandings : driverStandings.slice(0, 5);
  const visibleConstructors = showFullConstructors ? constructorStandings : constructorStandings.slice(0, 5);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-20 w-20 border-4 border-t-red-600"></div></div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation activeSection="stats" onNavigate={(id) => id === 'home' && (window.location.href='/')} />
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <div className="flex justify-between items-end mb-12 border-b border-red-600/30 pb-6">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">Standings <span className="text-red-600">{selectedSeason}</span></h1>
          <select value={selectedSeason} onChange={(e) => setSelectedSeason(Number(e.target.value))} className="bg-zinc-900 border-l-4 border-red-600 px-4 py-2 font-bold outline-none text-white">
            {availableSeasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Driver Table */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-1">
            <h2 className="p-4 font-black uppercase text-sm border-b border-zinc-800">Drivers</h2>
            <table className="w-full text-left text-sm">
              <tbody>
                {visibleDrivers.map((s) => (
                  <tr key={s.driver_id} className="border-b border-zinc-800/30">
                    <td className="p-4 w-12 font-black italic text-red-600">{s.position}</td>
                    <td className="p-4 font-bold">{drivers[s.driver_id]?.familyName?.toUpperCase()}</td>
                    <td className="p-4 text-zinc-500">{constructors[s.constructor_id]?.name || s.constructor_id}</td>
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
          <div className="bg-zinc-900/40 border border-zinc-800 p-1">
            <h2 className="p-4 font-black uppercase text-sm border-b border-zinc-800">Constructors</h2>
            <table className="w-full text-left text-sm">
              <tbody>
                {visibleConstructors.map((s) => (
                  <tr key={s.constructor_id} className="border-b border-zinc-800/30">
                    <td className="p-4 w-12 font-black italic text-red-600">{s.position}</td>
                    <td className="p-4 font-bold">{constructors[s.constructor_id]?.name?.toUpperCase()}</td>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {calendar.map((race) => (
            <Link key={race.race_id} href={`/races?id=${race.race_id}`} className="bg-zinc-800/50 p-4 rounded border border-zinc-700 hover:border-red-600 transition-all group">
               <div className="text-red-600 font-black text-xs mb-1">R{race.round}</div>
               <div className="font-bold text-[11px] uppercase truncate">{race.race_name}</div>
               <div className="text-[10px] text-zinc-500">{race.date}</div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
