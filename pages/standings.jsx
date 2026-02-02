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
  'monza': 'it', 'autodromo-nazionale-di-monza': 'it', 'milan': 'it', 'imola': 'it', 'enzo-e-dino-ferrari': 'it',
  'mugello': 'it', 'bologna': 'it', 'pescara': 'it', 'silverstone': 'gb', 'silverstone-circuit': 'gb',
  'northamptonshire': 'gb', 'brands-hatch': 'gb', 'kent': 'gb', 'donington': 'gb', 'aintree': 'gb',
  'liverpool': 'gb', 'spa': 'be', 'spa-francorchamps': 'be', 'stavelot': 'be', 'zolder': 'be',
  'heusden-zolder': 'be', 'nivelles': 'be', 'brussels': 'be', 'zandvoort': 'nl', 'circuit-zandvoort': 'nl',
  'catalunya': 'es', 'barcelona': 'es', 'montmelo': 'es', 'jerez': 'es', 'valencia': 'es',
  'valencia-street-circuit': 'es', 'pedralbes': 'es', 'montjuic': 'es', 'madrid': 'es', 'jarama': 'es',
  'hungaroring': 'hu', 'budapest': 'hu', 'mogyorod': 'hu', 'red-bull-ring': 'at', 'spielberg': 'at',
  'zeltweg': 'at', 'oesterreichring': 'at', 'styria': 'at', 'magny-cours': 'fr', 'nevers': 'fr',
  'paul-ricard': 'fr', 'le-castellet': 'fr', 'ricard': 'fr', 'reims': 'fr', 'dijon': 'fr',
  'dijon-prenois': 'fr', 'rouen': 'fr', 'essarts': 'fr', 'charade': 'fr', 'clermont-ferrand': 'fr',
  'lemans': 'fr', 'nurburgring': 'de', 'nurburg': 'de', 'hockenheimring': 'de', 'hockenheim': 'de',
  'avus': 'de', 'berlin': 'de', 'estoril': 'pt', 'cascais': 'pt', 'portimao': 'pt',
  'algarve': 'pt', 'boavista': 'pt', 'oporto': 'pt', 'monsanto': 'pt', 'lisbon': 'pt',
  'bremgarten': 'ch', 'bern': 'ch', 'anderstorp': 'se', 'scandinavian-raceway': 'se', 'monaco': 'mc',
  'monte-carlo': 'mc', 'circuit-de-monaco': 'mc', 'bakú': 'az', 'baku': 'az', 'azerbaijan': 'az',
  'americas': 'us', 'cota': 'us', 'austin': 'us', 'circuit-of-the-americas': 'us', 'miami': 'us',
  'miami-international-autodrome': 'us', 'vegas': 'us', 'las-vegas': 'us', 'las-vegas-strip': 'us', 'caesars-palace': 'us',
  'indianapolis': 'us', 'indianapolis-motor-speedway': 'us', 'watkins-glen': 'us', 'long-beach': 'us', 'phoenix': 'us',
  'detroit': 'us', 'dallas': 'us', 'sebring': 'us', 'riverside': 'us', 'villeneuve': 'ca',
  'montreal': 'ca', 'circuit-gilles-villeneuve': 'ca', 'mosport': 'ca', 'bowmanville': 'ca', 'tremblant': 'ca',
  'st-jovite': 'ca', 'interlagos': 'br', 'sao-paulo': 'br', 'são-paulo': 'br', 'jose-carlos-pace': 'br',
  'jacarepagua': 'br', 'rio-de-janeiro': 'br', 'rodriguez': 'mx', 'hermanos-rodriguez': 'mx', 'mexico-city': 'mx',
  'galvez': 'ar', 'buenos-aires': 'ar', 'oscar-galvez': 'ar',
  'juan-y-oscar-galvez': 'ar', 'juan-y-ignacio-cobos': 'ar', 'carlos-pace': 'br', 'juan-y-ignacio-cobos': 'ar',
  'suzuka': 'jp', 'suzuka-circuit': 'jp', 'mie': 'jp', 'fuji': 'jp', 'fuji-speedway': 'jp',
  'oyama': 'jp', 'okayama': 'jp', 'ti-circuit': 'jp', 'shanghai': 'cn', 'shanghai-international-circuit': 'cn',
  'marina-bay': 'sg', 'singapore': 'sg', 'sepang': 'my', 'kuala-lumpur': 'my', 'yeongam': 'kr',
  'korea-international-circuit': 'kr', 'buddh': 'in', 'greater-noida': 'in', 'bahrain': 'bh', 'sakhir': 'bh',
  'manama': 'bh', 'bahrain-international-circuit': 'bh', 'losail': 'qa', 'lusail': 'qa', 'lusail-international-circuit': 'qa',
  'jeddah': 'sa', 'jeddah-corniche-circuit': 'sa', 'yas-marina': 'ae', 'abu-dhabi': 'ae', 'yas-marina-circuit': 'ae',
  'istanbul': 'tr', 'istanbul-park': 'tr', 'sochi': 'ru', 'sochi-autodrom': 'ru', 'kyalami': 'za',
  'midrand': 'za', 'george': 'za', 'prince-george': 'za', 'adelaide': 'au', 'albert-park': 'au',
  'melbourne': 'au', 'ain-diab': 'ma', 'casablanca': 'ma',

  'albert_park': 'au', 'marina_bay': 'sg', 'yas_marina': 'ae', 'paul_ricard': 'fr', 'watkins_glen': 'us',
  'long_beach': 'us', 'las_vegas': 'us', 'jose_carlos_pace': 'br', 'hermanos_rodriguez': 'mx', 'mexico_city': 'mx',
  'red_bull_ring': 'at', 'silverstone_circuit': 'gb', 'spa_francorchamps': 'be', 'circuit_de_monaco': 'mc', 'fuji_speedway': 'jp'
};

export default function StandingsPage() {
  const [driverStandings, setDriverStandings] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState({});
  const [constructors, setConstructors] = useState({});
  const [selectedSeason, setSelectedSeason] = useState(2025);
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
          <select value={selectedSeason} onChange={(e) => setSelectedSeason(Number(e.target.value))} className="bg-zinc-900 border-l-4 border-red-600 px-4 py-2 font-bold outline-none text-white cursor-pointer">
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
                    <td className="p-4 font-bold text-white">{drivers[s.driverId]?.lastName?.toUpperCase()}</td>
                    <td className="p-4 text-zinc-500 text-[10px] uppercase font-bold">{constructors[s.constructorId]?.name || s.constructorId}</td>
                    <td className="p-4 text-right font-black text-white">{s.points}</td>
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
                    <td className="p-4 font-bold text-white">{constructors[s.constructorId]?.name?.toUpperCase()}</td>
                    <td className="p-4 text-right font-black text-white">{s.points}</td>
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
        <h2 className="mb-8 font-black uppercase tracking-widest text-sm text-red-600">Race Calendar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {calendar.map((race) => {
            const countryCode = circuitToCountry[race.circuitId];
            return (
              <Link key={race.id} href={`/races?id=${race.id}`} className="relative group bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden hover:border-red-600 transition-all">
                {/* Numero Round in Cerchietto Rosso */}
                <div className="absolute top-2 left-2 z-20 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border border-black/20 shadow-md">
                   <span className="text-white text-[10px] font-black">{race.round}</span>
                </div>

                {/* Bandiera dello stato (Ingrandita) */}
                <div className="relative h-28 w-full overflow-hidden bg-zinc-800">
                  {countryCode ? (
                    <img 
                      src={`https://flagcdn.com/w320/${countryCode}.png`} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" 
                      alt="" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-600 uppercase font-black">No Flag</div>
                  )}
                  {/* Gradiente per leggibilità */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent"></div>
                </div>

                {/* Info Gara */}
                <div className="p-3 bg-zinc-900">
                  <div className="font-black text-[10px] uppercase truncate text-white mb-1 tracking-tighter">
                    {race.name?.replace('Grand Prix', 'GP')}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 group-hover:text-red-500 transition-colors">
                    {race.date}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
