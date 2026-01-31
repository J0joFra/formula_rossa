// pages/standings.jsx
import { useState, useEffect, useRef } from 'react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';

export default function StandingsPage() {
  const [driverStandings, setDriverStandings] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState({});
  const [constructors, setConstructors] = useState({});
  const [selectedSeason, setSelectedSeason] = useState(2025);
  const [availableSeasons, setAvailableSeasons] = useState([]);
  
  // Stato per la navigazione (manteniamo coerenza con index)
  const [activeSection, setActiveSection] = useState('stats');

  useEffect(() => {
    loadStandings();
  }, [selectedSeason]);

  async function loadJSON(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async function loadStandings() {
    try {
      setLoading(true);
      setError(null);

      const [
        driversData,
        constructorsData,
        driverStandingsData,
        constructorStandingsData
      ] = await Promise.all([
        loadJSON('/data/drivers.json'),
        loadJSON('/data/constructors.json'),
        loadJSON('/data/driver_standings.json'),
        loadJSON('/data/constructor_standings.json')
      ]);

      if (!driversData || !constructorsData || !driverStandingsData || !constructorStandingsData) {
        throw new Error('Impossibile caricare i dati delle classifiche');
      }

      const driversMap = {};
      driversData.forEach(d => { driversMap[d.driver_id] = d; });

      const constructorsMap = {};
      constructorsData.forEach(c => { constructorsMap[c.constructor_id] = c; });

      setDrivers(driversMap);
      setConstructors(constructorsMap);

      const seasons = [...new Set(driverStandingsData.map(s => s.season))].sort((a, b) => b - a);
      setAvailableSeasons(seasons);

      const driversForSeason = driverStandingsData.filter(s => s.season === selectedSeason);
      const constructorsForSeason = constructorStandingsData.filter(s => s.season === selectedSeason);

      // MODIFICA 2: Filtro piloti senza posizione (null o undefined)
      if (driversForSeason.length > 0) {
        const maxRound = Math.max(...driversForSeason.map(s => s.round));
        const finalDrivers = driversForSeason
          .filter(s => s.round === maxRound && s.position !== null && s.position !== undefined)
          .sort((a, b) => a.position - b.position);
        setDriverStandings(finalDrivers);
      } else {
        setDriverStandings([]);
      }

      if (constructorsForSeason.length > 0) {
        const maxRound = Math.max(...constructorsForSeason.map(s => s.round));
        const finalConstructors = constructorsForSeason
          .filter(s => s.round === maxRound && s.position !== null)
          .sort((a, b) => a.position - b.position);
        setConstructorStandings(finalConstructors);
      } else {
        setConstructorStandings([]);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Gestione navigazione (rimanda alla home se necessario o gestisce lo scroll)
  const handleNavigate = (sectionId) => {
    if (sectionId === 'home') {
        window.location.href = '/';
    }
    setActiveSection(sectionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-800 border-t-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* SFONDO CON PUNTI FERRARI (Copiato da index.jsx) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-red-600 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/5 w-5 h-5 bg-yellow-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #DC0000 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* MODIFICA 1: Inserimento Navigation identica a index.jsx */}
      <div className="relative z-20">
        <Navigation activeSection={activeSection} onNavigate={handleNavigate} />
      </div>

      <main className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header integrato nello stile della pagina */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-red-600/30 pb-8">
            <div>
              <h1 className="text-6xl font-black italic tracking-tighter">
                STANDINGS <span className="text-red-600">{selectedSeason}</span>
              </h1>
              <p className="text-gray-400 mt-2 uppercase tracking-widest">World Championship Classification</p>
            </div>

            {/* Season Selector stilizzato */}
            {availableSeasons.length > 0 && (
              <div className="mt-6 md:mt-0 flex items-center space-x-3">
                <span className="text-sm font-bold text-gray-500 uppercase">Select Season</span>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="bg-zinc-900 text-white font-bold px-4 py-2 rounded-none border-l-4 border-red-600 focus:outline-none hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {availableSeasons.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Driver Standings */}
          <section className="mb-20">
            <div className="flex items-center mb-8">
              <h2 className="text-2xl font-bold uppercase tracking-tighter flex items-center">
                <span className="w-8 h-1 bg-red-600 mr-3"></span>
                Drivers Championship
              </h2>
            </div>
            
            <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/80">
                      <th className="p-5 text-xs font-black uppercase text-gray-500">Pos</th>
                      <th className="p-5 text-xs font-black uppercase text-gray-500">Driver</th>
                      <th className="p-5 text-xs font-black uppercase text-gray-500">Nationality</th>
                      <th className="p-5 text-xs font-black uppercase text-gray-500 text-right">Wins</th>
                      <th className="p-5 text-xs font-black uppercase text-red-600 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverStandings.map((standing, index) => {
                      const driver = drivers[standing.driver_id] || {};
                      return (
                        <tr key={standing.driver_id} className="border-b border-zinc-800/50 hover:bg-red-600/5 transition-colors group">
                          <td className="p-5">
                            <span className={`text-2xl font-black italic ${index < 3 ? 'text-red-600' : 'text-zinc-700'}`}>
                              {standing.position}
                            </span>
                          </td>
                          <td className="p-5">
                            <div className="font-bold text-lg group-hover:translate-x-1 transition-transform">
                              <span className="text-gray-400 font-medium">{driver.givenName}</span> {driver.familyName?.toUpperCase()}
                            </div>
                          </td>
                          <td className="p-5 text-zinc-500 font-medium uppercase text-sm">
                            {driver.nationality}
                          </td>
                          <td className="p-5 text-right font-bold text-zinc-400">
                            {standing.wins}
                          </td>
                          <td className="p-5 text-right">
                            <span className="text-2xl font-black text-white">{standing.points}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Constructor Standings */}
          <section>
            <div className="flex items-center mb-8">
              <h2 className="text-2xl font-bold uppercase tracking-tighter flex items-center">
                <span className="w-8 h-1 bg-red-600 mr-3"></span>
                Constructors Championship
              </h2>
            </div>
            
            <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/80">
                      <th className="p-5 text-xs font-black uppercase text-gray-500">Pos</th>
                      <th className="p-5 text-xs font-black uppercase text-gray-500">Team</th>
                      <th className="p-5 text-xs font-black uppercase text-gray-500">Nationality</th>
                      <th className="p-5 text-xs font-black uppercase text-gray-500 text-right">Wins</th>
                      <th className="p-5 text-xs font-black uppercase text-red-600 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {constructorStandings.map((standing, index) => {
                      const constructor = constructors[standing.constructor_id] || {};
                      const isFerrari = standing.constructor_id === 'ferrari';
                      return (
                        <tr 
                          key={standing.constructor_id} 
                          className={`border-b border-zinc-800/50 hover:bg-red-600/5 transition-colors ${isFerrari ? 'bg-red-600/10' : ''}`}
                        >
                          <td className="p-5">
                            <span className={`text-2xl font-black italic ${index < 3 ? 'text-red-600' : 'text-zinc-700'}`}>
                              {standing.position}
                            </span>
                          </td>
                          <td className="p-5">
                            <div className={`font-bold text-lg ${isFerrari ? 'text-red-500' : ''}`}>
                              {constructor.name?.toUpperCase() || standing.constructor_id.toUpperCase()}
                              {isFerrari && <span className="ml-2">🐎</span>}
                            </div>
                          </td>
                          <td className="p-5 text-zinc-500 font-medium uppercase text-sm">
                            {constructor.nationality}
                          </td>
                          <td className="p-5 text-right font-bold text-zinc-400">
                            {standing.wins}
                          </td>
                          <td className="p-5 text-right">
                            <span className="text-2xl font-black text-white">{standing.points}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
