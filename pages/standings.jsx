// pages/standings.jsx
import { useState, useEffect } from 'react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';

const nationalityToCountryCode = {
  // EUROPA
  'Monegasque': 'mc',
  'British': 'gb',
  'Italian': 'it',
  'French': 'fr',
  'German': 'de',
  'Spanish': 'es',
  'Dutch': 'nl',
  'Belgian': 'be',
  'Austrian': 'at',
  'Swiss': 'ch',
  'Swedish': 'se',
  'Norwegian': 'no',
  'Danish': 'dk',
  'Finnish': 'fi',
  'Portuguese': 'pt',
  'Irish': 'ie',
  'Polish': 'pl',
  'Czech': 'cz',
  'Slovak': 'sk',
  'Hungarian': 'hu',
  'Romanian': 'ro',
  'Bulgarian': 'bg',
  'Greek': 'gr',
  'Croatian': 'hr',
  'Slovenian': 'si',
  'Serbian': 'rs',
  'Ukrainian': 'ua',
  'Russian': 'ru',
  'Estonian': 'ee',
  'Latvian': 'lv',
  'Lithuanian': 'lt',

  // AMERICHE
  'American': 'us',
  'Canadian': 'ca',
  'Mexican': 'mx',
  'Brazilian': 'br',
  'Argentine': 'ar',
  'Chilean': 'cl',
  'Colombian': 'co',
  'Venezuelan': 've',
  'Peruvian': 'pe',
  'Uruguayan': 'uy',

  // ASIA
  'Japanese': 'jp',
  'Chinese': 'cn',
  'South Korean': 'kr',
  'Indian': 'in',
  'Thai': 'th',
  'Malaysian': 'my',
  'Indonesian': 'id',
  'Singaporean': 'sg',
  'Filipino': 'ph',
  'Vietnamese': 'vn',
  'Saudi Arabian': 'sa',
  'Emirati': 'ae',
  'Qatari': 'qa',
  'Israeli': 'il',
  'Turkish': 'tr',

  // OCEANIA
  'Australian': 'au',
  'New Zealander': 'nz'
};

// Mock dati calendar
const raceCalendar = [
  { id: 1, code: 'AUS', date: 'Mar 16', country: 'au' },
  { id: 2, code: 'CHN', date: 'Mar 23', country: 'cn' },
  { id: 3, code: 'JPN', date: 'Apr 6', country: 'jp' },
  { id: 4, code: 'BHR', date: 'Apr 13', country: 'bh' },
  { id: 5, code: 'SAU', date: 'Apr 20', country: 'sa' },
  { id: 6, code: 'MIA', date: 'May 4', country: 'us' },
  { id: 7, code: 'EMI', date: 'May 18', country: 'it' },
  { id: 8, code: 'MCO', date: 'May 25', country: 'mc' },
  { id: 9, code: 'ESP', date: 'Jun 1', country: 'es' },
  { id: 10, code: 'CAN', date: 'Jun 15', country: 'ca' },
  { id: 11, code: 'AUT', date: 'Jun 29', country: 'at' },
  { id: 12, code: 'GBR', date: 'Jul 6', country: 'gb' },
  { id: 13, code: 'BEL', date: 'Jul 27', country: 'be' },
  { id: 14, code: 'HUN', date: 'Aug 3', country: 'hu' },
  { id: 15, code: 'NLD', date: 'Aug 31', country: 'nl' },
  { id: 16, code: 'ITA', date: 'Sep 7', country: 'it' },
];

export default function StandingsPage() {
  const [driverStandings, setDriverStandings] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState({});
  const [constructors, setConstructors] = useState({});
  const [selectedSeason, setSelectedSeason] = useState(2025);
  const [availableSeasons, setAvailableSeasons] = useState([]);
  
  const [showFullDrivers, setShowFullDrivers] = useState(false);
  const [showFullConstructors, setShowFullConstructors] = useState(false);
  const [activeSection, setActiveSection] = useState('stats');

  useEffect(() => { loadStandings(); }, [selectedSeason]);

  async function loadJSON(path) {
    try {
      const response = await fetch(path);
      return response.ok ? await response.json() : null;
    } catch { return null; }
  }

  async function loadStandings() {
    try {
      setLoading(true);
      const [drData, coData, drStData, coStData] = await Promise.all([
        loadJSON('/data/drivers.json'),
        loadJSON('/data/constructors.json'),
        loadJSON('/data/driver_standings.json'),
        loadJSON('/data/constructor_standings.json')
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
    } finally { setLoading(false); }
  }

  const getFlagUrl = (nat) => {
    const code = nationalityToCountryCode[nat];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
  };

  const visibleDrivers = showFullDrivers ? driverStandings : driverStandings.slice(0, 5);
  const visibleConstructors = showFullConstructors ? constructorStandings : constructorStandings.slice(0, 5);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-20 w-20 border-4 border-t-red-600"></div></div>;

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navigation activeSection={activeSection} onNavigate={(id) => id === 'home' ? window.location.href='/' : setActiveSection(id)} />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20 relative z-10">
        
        {/* Header Stagione */}
        <div className="flex justify-between items-end mb-12 border-b border-red-600/30 pb-6">
          <h1 className="text-5xl font-black italic italic uppercase tracking-tighter">Standings <span className="text-red-600">{selectedSeason}</span></h1>
          <select value={selectedSeason} onChange={(e) => setSelectedSeason(Number(e.target.value))} className="bg-zinc-900 border-l-4 border-red-600 px-4 py-2 font-bold outline-none">
            {availableSeasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* CLASSIFICHE AFFIANCATE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          
          {/* Driver Standings */}
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

          {/* Constructor Standings */}
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
                      <td className={`p-4 font-bold ${isFerrari ? 'text-red-500' : ''}`}>{c.name?.toUpperCase()}</td>
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

        {/* SEASON OVERVIEW (Stile Screenshot) */}
        <section className="bg-white rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-[#1a2332] p-4 text-center">
            <h2 className="text-white text-2xl font-bold">Season Overview</h2>
          </div>
          
          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Stats Summary */}
            <div className="space-y-4">
              <h3 className="text-zinc-800 text-xl font-bold mb-6">Stats Summary</h3>
              <div className="space-y-3">
                {[
                  { label: 'World Champion', val: 'Lando Norris', color: 'border-yellow-400 bg-yellow-50', icon: '🏆' },
                  { label: 'Constructor Champion', val: 'McLaren', color: 'border-purple-400 bg-purple-50', icon: '🎗️' },
                  { label: 'Most Wins', val: 'Max Verstappen (x8)', color: 'border-zinc-200 bg-white', icon: '🏆' },
                  { label: 'Most Poles', val: 'Max Verstappen (x8)', color: 'border-zinc-200 bg-white', icon: '🎯' },
                  { label: 'Most Podiums', val: 'Lando Norris (x18)', color: 'border-zinc-200 bg-white', icon: '🥉' },
                ].map((stat, idx) => (
                  <div key={idx} className={`flex justify-between items-center p-4 border rounded-lg ${stat.color}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{stat.icon}</span>
                      <span className="text-zinc-600 font-semibold">{stat.label}</span>
                    </div>
                    <span className="text-zinc-900 font-bold">{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Race Calendar */}
            <div className="lg:col-span-2">
              <h3 className="text-zinc-800 text-xl font-bold mb-6">Race Calendar</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {raceCalendar.map((race) => (
                  <div key={race.id} className="relative flex flex-col items-center">
                    {/* Numero round */}
                    <div className="absolute -top-2 -left-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center z-10 border-2 border-white">
                      {race.id}
                    </div>
                    {/* Card bandiera */}
                    <div className="bg-white border border-zinc-200 rounded-lg p-1 w-full hover:shadow-md transition-shadow">
                      <img src={`https://flagcdn.com/w160/${race.country}.png`} className="w-full h-10 object-cover rounded-md mb-2 shadow-inner" alt={race.code} />
                      <div className="bg-green-500 text-white text-[10px] font-black text-center py-1 rounded">
                        {race.code}
                      </div>
                      <div className="text-zinc-400 text-[9px] text-center mt-1 font-bold">
                        {race.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
