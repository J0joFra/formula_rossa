import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import LoadingSpinner from '../components/ferrari/LoadingSpinner';

import { createClient } from '@supabase/supabase-js';

const supabase = typeof window !== 'undefined'
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )
  : null;

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
  'valencia-street-circuit': 'es', 'pedralbes': 'es', 'montjuic': 'es', 'madrid': 'es', 'madring': 'es', 'jarama': 'es',
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
  'galvez': 'ar', 'buenos-aires': 'ar', 'oscar-galvez': 'ar', 'juan-y-oscar-galvez': 'ar',
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
  const [selectedSeason, setSelectedSeason] = useState(2026);
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [showFullDrivers, setShowFullDrivers] = useState(false);
  const [showFullConstructors, setShowFullConstructors] = useState(false);

  async function loadStandings() {
    try {
      setLoading(true);

      // ── 1. Stagioni disponibili — usa races per avere una riga per anno ────────
      const { data: seasonsData, error: seasonsErr } = await supabase
        .from('races')
        .select('year')
        .order('year', { ascending: false })
        .limit(1000);
      if (seasonsErr) console.error('❌ stagioni:', seasonsErr.message);
      const seasons = [...new Set(seasonsData?.map(s => s.year))];
      setAvailableSeasons(seasons);

      // ── 2. Piloti e costruttori (mappe id → oggetto) ─────────────────────────
      const [{ data: drData }, { data: coData }] = await Promise.all([
        supabase.from('drivers').select('id, first_name, last_name, nationality_country_id'),
        supabase.from('constructors').select('id, name'),
      ]);
      const drMap = {};
      drData?.forEach(d => { drMap[d.id] = d; });
      const coMap = {};
      coData?.forEach(c => { coMap[c.id] = c; });
      setDrivers(drMap);
      setConstructors(coMap);

      // ── 3. Driver standings dell'ultimo round della stagione selezionata ──────
      const { data: drStData, error: drStErr } = await supabase
        .from('driver_standings')
        .select('*')
        .eq('year', selectedSeason)
        .order('round', { ascending: false })
        .order('position_number', { ascending: true });

      if (drStErr) console.error('❌ driver_standings year:', drStErr.message);
      else console.log('✅ driver standings:', drStData?.length, 'righe per anno', selectedSeason);
      if (drStData && drStData.length > 0) {
        const maxRound = drStData[0].round;
        setDriverStandings(
          drStData
            .filter(s => s.round === maxRound && s.position_number)
            .sort((a, b) => a.position_number - b.position_number)
        );
      }

      // ── 4. Constructor standings dell'ultimo round ───────────────────────────
      const { data: coStData, error: coStErr } = await supabase
        .from('constructor_standings')
        .select('*')
        .eq('year', selectedSeason)
        .order('round', { ascending: false })
        .order('position_number', { ascending: true });

      if (coStErr) console.error('❌ constructor_standings:', coStErr.message);
      else console.log('✅ constructor standings:', coStData?.length);
      if (coStData && coStData.length > 0) {
        const maxRound = coStData[0].round;
        setConstructorStandings(
          coStData
            .filter(s => s.round === maxRound && s.position_number)
            .sort((a, b) => a.position_number - b.position_number)
        );
      }

      // ── 5. Calendario della stagione selezionata ─────────────────────────────
      const { data: racesData, error: racesErr } = await supabase
        .from('races')
        .select('id, round, date, circuit_id, official_name')
        .eq('year', selectedSeason)
        .order('round', { ascending: true });
      if (racesErr) console.error('❌ races:', racesErr.message);
      else console.log('✅ calendario:', racesData?.length, 'gare');
      setCalendar(racesData || []);

    } catch (e) {
      console.error("Errore caricamento:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStandings(); }, [selectedSeason]);

  const visibleDrivers = showFullDrivers ? driverStandings : driverStandings.slice(0, 5);
  const visibleConstructors = showFullConstructors ? constructorStandings : constructorStandings.slice(0, 5);

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <LoadingSpinner size="lg" message="Caricamento standings..." />
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navigation activeSection="stats" />
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <div className="flex justify-between items-end mb-12 border-b border-red-600/30 pb-6">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter">
            Standings <span className="text-[var(--ferrari-red)]">{selectedSeason}</span>
          </h2>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="bg-[var(--bg-tertiary)] border-l-4 border-red-600 px-4 py-2 font-bold outline-none text-[var(--text-primary)] cursor-pointer"
          >
            {availableSeasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Driver Table */}
          <div className="bg-[var(--bg-tertiary)]/40 border border-[var(--border-light)]">
            <h3 className="p-4 font-black uppercase text-sm border-b border-[var(--border-light)] text-[var(--ferrari-red)]">Drivers</h3>
            <table className="w-full text-left text-sm">
              <tbody>
                {visibleDrivers.map((s) => {
                  const driver = drivers[s.driver_id];
                  return (
                    <tr key={s.driver_id} className="border-b border-[var(--border-light)]/30 hover:bg-[var(--bg-card)] transition-colors">
                      <td className="p-4 w-12 font-black italic text-[var(--text-tertiary)]">{s.position_number}</td>
                      <td className="p-4 font-bold text-[var(--text-primary)]">{driver?.last_name?.toUpperCase()}</td>
                      <td className="p-4 text-[var(--text-tertiary)] text-[10px] uppercase font-bold">
                        {constructors[s.constructor_id]?.name || s.constructor_id}
                      </td>
                      <td className="p-4 text-right font-black text-[var(--text-primary)]">{s.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button
              onClick={() => setShowFullDrivers(!showFullDrivers)}
              className="w-full p-3 text-[10px] font-black uppercase text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {showFullDrivers ? '↑ Close' : '↓ View All'}
            </button>
          </div>

          {/* Constructor Table */}
          <div className="bg-[var(--bg-tertiary)]/40 border border-[var(--border-light)]">
            <h3 className="p-4 font-black uppercase text-sm border-b border-[var(--border-light)] text-[var(--ferrari-red)]">Constructors</h3>
            <table className="w-full text-left text-sm">
              <tbody>
                {visibleConstructors.map((s) => (
                  <tr key={s.constructor_id} className="border-b border-[var(--border-light)]/30 hover:bg-[var(--bg-card)] transition-colors">
                    <td className="p-4 w-12 font-black italic text-[var(--text-tertiary)]">{s.position_number}</td>
                    <td className="p-4 font-bold text-[var(--text-primary)]">{constructors[s.constructor_id]?.name?.toUpperCase()}</td>
                    <td className="p-4 text-right font-black text-[var(--text-primary)]">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setShowFullConstructors(!showFullConstructors)}
              className="w-full p-3 text-[10px] font-black uppercase text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {showFullConstructors ? '↑ Close' : '↓ View All'}
            </button>
          </div>
        </div>

        {/* Calendar Section */}
        <h3 className="mb-8 font-black uppercase tracking-widest text-sm text-[var(--ferrari-red)]">Race Calendar</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {calendar.map((race) => {
            const countryCode = circuitToCountry[race.circuit_id];
            return (
              <Link
                key={race.id}
                href={`/races?id=${race.id}`}
                className="relative group bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-sm overflow-hidden hover:border-red-600 transition-all"
              >
                <div className="absolute top-2 left-2 z-20 w-6 h-6 bg-[var(--ferrari-red)] rounded-full flex items-center justify-center border border-black/20 shadow-md">
                  <span className="text-[var(--text-primary)] text-[10px] font-black">{race.round}</span>
                </div>
                <div className="relative h-28 w-full overflow-hidden bg-[var(--bg-tertiary)]">
                  {countryCode ? (
                    <img
                      src={`https://flagcdn.com/w320/${countryCode}.png`}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                      alt="Bandiera nazione"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-[var(--text-muted)] uppercase font-black">No Flag</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent"></div>
                </div>
                <div className="p-3 bg-[var(--bg-tertiary)]">
                  <div className="font-black text-[10px] uppercase truncate text-[var(--text-primary)] mb-1 tracking-tighter">
                    {race.official_name?.replace('Grand Prix', 'GP')}
                  </div>
                  <div className="text-[9px] font-bold text-[var(--text-tertiary)] group-hover:text-red-500 transition-colors">
                    {race.date}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}