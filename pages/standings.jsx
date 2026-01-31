// ... (nationalityToCountryCode rimane invariato)

// Estensione della mappatura circuiti per coprire i dati storici del nuovo JSON
const circuitToCountry = {
    // Moderni
    'albert_park': 'au', 'shanghai': 'cn', 'suzuka': 'jp', 'bahrain': 'bh',
    'jeddah': 'sa', 'miami': 'us', 'imola': 'it', 'monaco': 'mc',
    'catalunya': 'es', 'villeneuve': 'ca', 'red_bull_ring': 'at', 'silverstone': 'gb',
    'spa': 'be', 'hungaroring': 'hu', 'zandvoort': 'nl', 'monza': 'it',
    'baku': 'az', 'marina_bay': 'sg', 'americas': 'us', 'rodriguez': 'mx',
    'interlagos': 'br', 'vegas': 'us', 'losail': 'qa', 'yas_marina': 'ae',
    // Storici (aggiunti dal tuo JSON)
    'silverstone': 'gb', 'monaco': 'mc', 'indianapolis': 'us', 'bremgarten': 'ch',
    'spa': 'be', 'reims': 'fr', 'monza': 'it', 'nurburgring': 'de', 'pedralbes': 'es',
    'essarts': 'fr', 'zandvoort': 'nl', 'galvez': 'ar', 'aintree': 'gb', 'pescara': 'it',
    'boavista': 'pt', 'ain-diab': 'ma', 'avus': 'de', 'monsanto': 'pt', 'sebring': 'us',
    'riverside': 'us', 'watkins_glen': 'us', 'george': 'za', 'zeltweg': 'at', 'brands_hatch': 'gb',
    'charade': 'fr', 'kyalami': 'za', 'lemans': 'fr', 'mosport': 'ca', 'jarama': 'es',
    'montjuic': 'es', 'tremblant': 'ca', 'hockenheimring': 'de', 'ricard': 'fr', 'nivelles': 'be',
    'zolder': 'be', 'anderstorp': 'se', 'dijon': 'fr', 'fuji': 'jp', 'jacarepagua': 'br',
    'donington': 'gb', 'okayama': 'jp', 'estoril': 'pt', 'magny_cours': 'fr', 'sepang': 'my',
    'buddh': 'in', 'yeongam': 'kr', 'istanbul': 'tr', 'sochi': 'ru', 'valencia': 'es'
};

export default function StandingsPage() {
  // ... (stati esistenti)

  async function loadStandings() {
    try {
      setLoading(true);
      // Carichiamo races.json (il file che hai fornito) invece di results.json per il calendario
      const [drData, coData, drStData, coStData, racesData] = await Promise.all([
        loadJSON('/data/drivers.json'),
        loadJSON('/data/constructors.json'),
        loadJSON('/data/driver_standings.json'),
        loadJSON('/data/constructor_standings.json'),
        loadJSON('/data/races.json') // Il tuo nuovo file
      ]);

      const drMap = {}; drData?.forEach(d => drMap[d.driver_id] = d);
      const coMap = {}; coData?.forEach(c => coMap[c.constructor_id] = c);
      setDrivers(drMap); setConstructors(coMap);

      // Gestione Stagioni (usiamo drStData come riferimento per gli anni con statistiche)
      const seasons = [...new Set(drStData?.map(s => s.season))].sort((a, b) => b - a);
      if (seasons.length === 0 && racesData) {
          // Se non ci sono classifiche, prendi le stagioni dal calendario
          const calendarSeasons = [...new Set(racesData.map(r => r.season))].sort((a, b) => b - a);
          setAvailableSeasons(calendarSeasons);
      } else {
          setAvailableSeasons(seasons);
      }

      // Classifica Piloti
      const drS = drStData?.filter(s => s.season === selectedSeason) || [];
      if (drS.length > 0) {
        const maxR = Math.max(...drS.map(s => s.round));
        setDriverStandings(drS.filter(s => s.round === maxR && s.position).sort((a, b) => a.position - b.position));
      } else {
        setDriverStandings([]);
      }
      
      // Classifica Costruttori
      const coS = coStData?.filter(s => s.season === selectedSeason) || [];
      if (coS.length > 0) {
        const maxR = Math.max(...coS.map(s => s.round));
        setConstructorStandings(coS.filter(s => s.round === maxR && s.position).sort((a, b) => a.position - b.position));
      } else {
        setConstructorStandings([]);
      }

      // FILTRO CALENDARIO DAL TUO NUOVO JSON
      const seasonRaces = racesData?.filter(r => r.season === selectedSeason)
                                  .sort((a, b) => a.round - b.round) || [];
      setCalendar(seasonRaces);

    } finally { setLoading(false); }
  }

  // ... (getFlagUrl e formatDate rimangono uguali)

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* ... Navigation */}

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20 relative z-10">
        
        {/* Header con selettore stagione */}
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

        {/* ... Sezioni Driver e Constructor Standings (rimangono uguali) */}

        {/* RACE CALENDAR - Utilizza i dati dal tuo JSON */}
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
                  <div key={race.race_id} className="relative group">
                    {/* Numero Round */}
                    <div className="absolute -top-2 -left-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center z-20 shadow-lg border border-black">
                      {race.round}
                    </div>
                    
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 hover:border-red-600 transition-all group-hover:-translate-y-1">
                      {/* Bandiera */}
                      <div className="h-12 w-full mb-3 overflow-hidden rounded-md bg-zinc-700">
                        {countryCode ? (
                          <img 
                            src={`https://flagcdn.com/w160/${countryCode}.png`} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                            alt={race.race_name} 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 uppercase">No Flag</div>
                        )}
                      </div>
                      
                      {/* Info Gara */}
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
