// pages/standings.jsx
import { useState, useEffect } from 'react';
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
  const [selectedSeason, setSelectedSeason] = useState(2025);
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
      const [drData, coData, drStData, coStData, racesData] = await Promise.all([
        loadJSON('/data/drivers.json'),
        loadJSON('/data/constructors.json'),
        loadJSON('/data/driver_standings.json'),
        loadJSON('/data/constructor_standings.json'),
        loadJSON('/data/races.json')
      ]);

      if (drData) {
        const drMap = {}; drData.forEach(d => drMap[d.driver_id] = d);
        setDrivers(drMap);
      }
      if (coData) {
        const coMap = {}; coData.forEach(c => coMap[c.constructor_id] = c);
        setConstructors(coMap);
      }

      const seasons = [...new Set(drStData?.map(s => s.season))].sort((a, b) => b - a);
      if (seasons.length === 0 && racesData) {
          const calendarSeasons = [...new Set(racesData.map(r => r.season))].sort((a, b) => b - a);
          setAvailableSeasons(calendarSeasons);
      } else {
          setAvailableSeasons(seasons);
      }

      const drS = drStData?.filter(s => s.season === selectedSeason) || [];
      if (drS.length > 0) {
        const maxR = Math.max(...drS.map(s => s.round));
        setDriverStandings(drS.filter(s => s.round === maxR && s.position).sort((a, b) => a.position - b.position));
      } else {
        setDriverStandings([]);
      }
      
      const coS = coStData?.filter(s => s.season === selectedSeason) || [];
      if (coS.length > 0) {
        const maxR = Math.max(...coS.map(s => s.round));
        setConstructorStandings(coS.filter(s => s.round === maxR && s.position).sort((a, b) => a.position - b.position));
      } else {
        setConstructorStandings([]);
      }

      const seasonRaces = racesData?.filter(r => r.season === selectedSeason).sort((a, b) => a.round - b.round) || [];
      setCalendar(seasonRaces);

    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => { 
    loadStandings(); 
  }, [selectedSeason]);

  const getFlagUrl = (natOrCircuit, isCircuit = false) => {
    const code = isCircuit ? circuitToCountry[natOrCircuit] : nationalityToCountryCode[natOrCircuit];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const visibleDrivers = showFullDrivers ? driverStandings : driverStandings.slice(0, 5);
  const visibleConstructors = showFullConstructors ? constructorStandings : constructorStandings.slice(0, 5);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-red-600 border-zinc-800"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navigation 
        activeSection={activeSection} 
        onNavigate={(id) => {
          if (id === 'home') {
            if (typeof window !== 'undefined') window.location.href = '/';
          } else {
            setActiveSection(id);
          }
        }} 
      />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="flex justify-between items-end mb-12 border-b border-red-600/30 pb-6">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">
            Standings <span className="text-red-600">{selectedSeason}</span>
          </h1>
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(Number(e.target.value))} 
            className="bg-zinc-900 border-l-4 border-red-600 px-4 py-2 font-bold outline-none text-white"
          >
            {availableSeasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <section className="bg-zinc-900/40 border border-zinc-800 rounded-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center gap-3">
               <div className="w-1 h-6 bg-red-600"></div>
               <h2 className="font-black uppercase tracking-widest text-sm">Drivers</h2>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-zinc-500 uppercase text-[10px] border-b border-zinc-800">
                  <th className="p-4 w-12">Pos</th>
                  <th className="p-4">Driver</th>
                  <th className="p-4">Team</th>
                  <th className="p-4 w-12 text-center">Nat</th>
                  <th className="p-4 text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {visibleDrivers.map((s, i) => {
                  const d = drivers[s.driver_id] || {};
                  const isFerrari = s.constructor_id === 'ferrari';
                  const flag = getFlagUrl(d.nationality);
                  return (
                    <tr key={s.driver_id} className={`border-b border-zinc-800/30 ${isFerrari ? 'bg-red-600/10' : ''}`}>
                      <td className={`p-4 font-black italic ${i < 3 ? 'text-red-600' : 'text-zinc-600'}`}>{s.position}</td>
                      <td className={`p-4 font-bold ${isFerrari ? 'text-red-500' : ''}`}>{d.familyName?.toUpperCase()}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                             <img src={`/images/teams/${s.constructor_id}.png`} 
                                  onError={(e) => e.target.style.display='none'} 
                                  className="w-6 h-6 object-contain" alt="" />
                             <span className={`text-[11px] font-bold uppercase ${isFerrari ? 'text-red-500' : 'text-zinc-300'}`}>
                                {constructors[s.constructor_id]?.name || s.constructor_id}
                             </span>
                          </div>
                        </td>
                      <td className="p-4 text-center">{flag && <img src={flag} className="w-5 mx-auto opacity-80" alt="" />}</td>
                      <td className="p-4 text-right font-black">{s.points}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <button onClick={() => setShowFullDrivers(!showFullDrivers)} className="w-full p-3 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors">
              {showFullDrivers ? '↑ Close' : '↓ View All'}
            </button>
          </section>

          <section className="bg-zinc-900/40 border border-zinc-800 rounded-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center gap-3">
               <div className="w-1 h-6 bg-red-600"></div>
               <h2 className="font-black uppercase tracking-widest text-sm">Constructors</h2>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-zinc-500 uppercase text-[10px] border-b border-zinc-800">
                  <th className="p-4 w-12">Pos</th>
                  <th className="p-4">Team</th>
                  <th className="p-4 w-12 text-center">Nat</th>
                  <th className="p-4 text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {visibleConstructors.map((s, i) => {
                  const c = constructors[s.constructor_id] || {};
                  const isFerrari = s.constructor_id === 'ferrari';
                  const flag = getFlagUrl(c.nationality);
                  return (
                    <tr key={s.constructor_id} className={`border-b border-zinc-800/30 ${isFerrari ? 'bg-red-600/10' : ''}`}>
                      <td className={`p-4 font-black italic ${i < 3 ? 'text-red-600' : 'text-zinc-600'}`}>{s.position}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-bold">
                          <img src={`/images/teams/${s.constructor_id}.png`} onError={(e) => e.target.style.display='none'} className="w-6 h-6 object-contain" alt="" />
                          <span className={isFerrari ? 'text-red-500' : ''}>{c.name?.toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">{flag && <img src={flag} className="w-5 mx-auto opacity-80" alt="" />}</td>
                      <td className="p-4 text-right font-black">{s.points}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <button onClick={() => setShowFullConstructors(!showFullConstructors)} className="w-full p-3 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors">
              {showFullConstructors ? '↑ Close' : '↓ View All'}
            </button>
          </section>
        </div>

        <section className="bg-zinc-900/40 border border-zinc-800 rounded-sm overflow-hidden mt-12">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center gap-3">
             <div className="w-1 h-6 bg-red-600"></div>
             <h2 className="font-black uppercase tracking-widest text-sm">Race Calendar {selectedSeason}</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {calendar.length > 0 ? calendar.map((race) => {
                const countryCode = circuitToCountry[race.circuit_id];
                return (
                    <Link 
                      key={race.race_id} 
                      href={`/races?id=${race.race_id}`} // Link alla nuova pagina
                      className="relative group block"
                    >
                      <div className="absolute -top-2 -left-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center z-20 shadow-lg border border-black group-hover:scale-110 transition-transform">
                        {race.round}
                      </div>
                      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 hover:border-red-600 hover:bg-zinc-800 transition-all group-hover:-translate-y-1">
                      <div className="h-12 w-full mb-3 overflow-hidden rounded-md bg-zinc-700">
                        {countryCode ? (
                          <img src={`https://flagcdn.com/w160/${countryCode}.png`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={race.race_name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 uppercase">No Flag</div>
                        )}
                      </div>
                      <div className="text-[11px] font-black text-red-500 uppercase mb-1 truncate">
                        {race.race_name.replace('Grand Prix', 'GP')}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-bold">
                        {formatDate(race.date)}
                      </div>
                      <div className="text-[9px] text-zinc-500 uppercase mt-2 truncate">
                        {race.circuit_id.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-10 text-center text-zinc-500 italic">
                  No calendar data available for this season.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
