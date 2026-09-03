import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Trophy, CalendarDays, Flag } from 'lucide-react';
import PageShell, { PageHeader, PageLoading, Panel } from '../components/ui/PageShell';

import { supabase } from '../lib/supabaseClient';

/** Le date arrivano in ISO e finivano a schermo così com'erano: "2026-01-14". */
function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

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
  const [showSprintRaces, setShowSprintRaces] = useState(false); // Nuovo stato per filtrare le sprint race

  async function loadStandings() {
    try {
      setLoading(true);

      // ── 1. Stagioni disponibili ──────────────────────────────────
      const { data: seasonsData, error: seasonsErr } = await supabase
        .from('season')
        .select('year')
        .order('year', { ascending: false });
      if (seasonsErr) console.error('❌ stagioni:', seasonsErr.message);
      const seasons = seasonsData?.map(s => s.year) ?? [];
      setAvailableSeasons(seasons);

      // ── 2. Piloti e costruttori ─────────────────────────────────
      const [{ data: drData }, { data: coData }] = await Promise.all([
        supabase.from('driver').select('id, first_name, last_name, nationality_country_id'),
        supabase.from('constructor').select('id, name'),
      ]);
      const drMap = {};
      drData?.forEach(d => { drMap[d.id] = d; });
      const coMap = {};
      coData?.forEach(c => { coMap[c.id] = c; });
      setDrivers(drMap);
      setConstructors(coMap);

      // ── 3. Driver standings — usa season_driver_standing (ha year direttamente) ──
      const { data: drStData, error: drStErr } = await supabase
        .from('season_driver_standing')
        .select('*')
        .eq('year', selectedSeason)
        .order('position_number', { ascending: true });

      if (drStErr) console.error('❌ driver_standings year:', drStErr.message);
      else console.log('✅ driver standings:', drStData?.length, 'righe per anno', selectedSeason);
      if (drStData && drStData.length > 0) {
        setDriverStandings(
          drStData
            .filter(s => s.position_number)
            .sort((a, b) => a.position_number - b.position_number)
        );
      }

      // ── 4. Constructor standings — usa season_constructor_standing ─────────────
      const { data: coStData, error: coStErr } = await supabase
        .from('season_constructor_standing')
        .select('*')
        .eq('year', selectedSeason)
        .order('position_number', { ascending: true });

      if (coStErr) console.error('❌ constructor_standings:', coStErr.message);
      else console.log('✅ constructor standings:', coStData?.length);
      if (coStData && coStData.length > 0) {
        setConstructorStandings(
          coStData
            .filter(s => s.position_number)
            .sort((a, b) => a.position_number - b.position_number)
        );
      }

      // ── 5. Calendario ─────────────────────────────────────────
      const { data: racesData, error: racesErr } = await supabase
        .from('race')
        .select('id, round, date, circuit_id, official_name, sprint_race_date, qualifying_date, grand_prix_id')
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
  
  // Gare sospese/cancellate (Bahrain e Arabia Saudita per conflitto Medio Oriente)
  const SUSPENDED_GP = ['saudi-arabia', 'bahrain'];

  // Filtra le gare che hanno una sprint race
  const sprintRaces = calendar.filter(race => race.sprint_race_date);
  // Filtra le gare in base al toggle
  const displayedCalendar = showSprintRaces ? sprintRaces : calendar;

  const seo = {
    title: `Classifiche F1 ${selectedSeason}`,
    description: `Classifica piloti e costruttori della stagione ${selectedSeason} di Formula 1, con il dettaglio dei punti Ferrari.`,
    path: '/standings',
  };

  const seasonPicker = (
    <label className="flex items-center gap-2">
      <span className="sr-only">Stagione</span>
      <select
        value={selectedSeason}
        onChange={(e) => setSelectedSeason(Number(e.target.value))}
        className="select"
      >
        {availableSeasons.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </label>
  );

  if (loading) return (
    <PageShell seo={seo} wide>
      <PageHeader eyebrow="Dati · Stagione" title="Classifiche" breadcrumb={[{ label: 'Dati' }, { label: 'Classifiche' }]} />
      <PageLoading label="Caricamento classifiche…" />
    </PageShell>
  );

  return (
    <PageShell seo={seo} wide>
      <PageHeader
        eyebrow="Dati · Stagione"
        title="Classifiche F1"
        accent={String(selectedSeason)}
        subtitle="Piloti e costruttori, aggiornati all'ultimo Gran Premio disputato."
        breadcrumb={[{ label: 'Dati' }, { label: 'Classifiche' }]}
        actions={seasonPicker}
      />

        {/* Le due classifiche.
            Erano due riquadri con fondo semitrasparente (`bg-[var(--bg-tertiary)]/40`),
            attraverso cui si vedevano gli aloni ambientali della pagina, e con
            le intestazioni in inglese su un sito in italiano. Ora sono Panel
            come nel resto del sito, con lo stile di tabella condiviso. */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">

          <Panel
            title="Piloti"
            icon={Users}
            actions={driverStandings.length > 5 ? (
              <button
                type="button"
                onClick={() => setShowFullDrivers(!showFullDrivers)}
                className="text-xs font-bold uppercase tracking-wider text-[var(--fr-text-muted)] hover:text-[var(--fr-red)] transition-colors"
              >
                {showFullDrivers ? 'Primi 5' : `Tutti · ${driverStandings.length}`}
              </button>
            ) : null}
          >
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Pos</th>
                    <th scope="col">Pilota</th>
                    <th scope="col">Scuderia</th>
                    <th scope="col">Punti</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDrivers.map((s) => {
                    const driver = drivers[s.driver_id];
                    const ferrari = s.constructor_id === 'ferrari';
                    return (
                      <tr key={s.driver_id} className={ferrari ? 'bg-[var(--fr-red-soft)]' : undefined}>
                        <td className="tabular font-bold">{s.position_number}</td>
                        <td className={ferrari ? 'font-semibold text-[var(--fr-text)]' : undefined}>
                          {driver ? `${driver.first_name} ${driver.last_name}` : s.driver_id}
                        </td>
                        <td>{constructors[s.constructor_id]?.name || s.constructor_id}</td>
                        <td className="tabular font-bold">{s.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            title="Costruttori"
            icon={Trophy}
            actions={constructorStandings.length > 5 ? (
              <button
                type="button"
                onClick={() => setShowFullConstructors(!showFullConstructors)}
                className="text-xs font-bold uppercase tracking-wider text-[var(--fr-text-muted)] hover:text-[var(--fr-red)] transition-colors"
              >
                {showFullConstructors ? 'Primi 5' : `Tutti · ${constructorStandings.length}`}
              </button>
            ) : null}
          >
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Pos</th>
                    <th scope="col">Scuderia</th>
                    <th scope="col">Punti</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleConstructors.map((s) => {
                    const ferrari = s.constructor_id === 'ferrari';
                    return (
                      <tr key={s.constructor_id} className={ferrari ? 'bg-[var(--fr-red-soft)]' : undefined}>
                        <td className="tabular font-bold">{s.position_number}</td>
                        <td className={ferrari ? 'font-semibold text-[var(--fr-text)]' : undefined}>
                          {constructors[s.constructor_id]?.name || s.constructor_id}
                        </td>
                        <td className="tabular font-bold">{s.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <Panel
          title={showSprintRaces ? 'Calendario sprint' : 'Calendario della stagione'}
          icon={CalendarDays}
          actions={sprintRaces.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowSprintRaces(!showSprintRaces)}
              aria-pressed={showSprintRaces}
              className={`px-3 py-1.5 rounded-[9px] text-xs font-bold uppercase tracking-wider border transition-colors ${
                showSprintRaces
                  ? 'bg-[var(--fr-red)] border-[var(--fr-red)] text-white'
                  : 'bg-[var(--fr-surface-2)] border-[var(--fr-border)] text-[var(--fr-text-muted)] hover:text-[var(--fr-text)]'
              }`}
            >
              {showSprintRaces ? 'Tutte le gare' : `Solo sprint · ${sprintRaces.length}`}
            </button>
          ) : null}
        >
          {displayedCalendar.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-[var(--fr-text-muted)]">
              {showSprintRaces
                ? 'Nessuna gara sprint in questa stagione.'
                : 'Nessuna gara in calendario per questa stagione.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
              {displayedCalendar.map((race) => {
                const countryCode = circuitToCountry[race.circuit_id];
                const hasSprint = Boolean(race.sprint_race_date);
                const isSuspended = SUSPENDED_GP.includes(race.grand_prix_id);
                const nome = race.official_name?.replace('Grand Prix', 'GP') || `Round ${race.round}`;

                /* Le schede erano riquadri scuri con la bandiera al 60% sotto
                   una sfumatura `from-zinc-900/80`: sul tema chiaro restava una
                   lastra grigia sopra ogni gara. Ora la bandiera si vede intera
                   e la scheda segue i token come le altre griglie del sito. */
                const contenuto = (
                  <>
                    <span className="relative block h-24 w-full overflow-hidden bg-[var(--fr-surface-2)]">
                      {countryCode ? (
                        <img
                          src={`https://flagcdn.com/w320/${countryCode}.png`}
                          alt=""
                          className={`w-full h-full object-cover transition-transform duration-500 ${
                            isSuspended ? 'grayscale opacity-50' : 'group-hover:scale-110'
                          }`}
                        />
                      ) : (
                        <span className="w-full h-full grid place-items-center">
                          <Flag className="w-5 h-5 text-[var(--fr-text-dim)]" aria-hidden="true" />
                        </span>
                      )}
                      <span className="absolute top-2 left-2 w-6 h-6 rounded-full grid place-items-center bg-[var(--fr-red-fill)] text-fixed-white text-[10px] font-black shadow-md">
                        {race.round}
                      </span>
                      {hasSprint && !isSuspended && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-[5px] bg-[var(--fr-red-fill)] text-fixed-white text-[8px] font-black uppercase tracking-wider">
                          Sprint
                        </span>
                      )}
                    </span>

                    <span className="block p-3">
                      <span className="block text-[11px] font-bold leading-tight text-[var(--fr-text)] line-clamp-2">
                        {nome}
                      </span>
                      <span className="block text-[10px] text-[var(--fr-text-muted)] mt-1">
                        {isSuspended ? 'Data da definire' : formatDate(race.date)}
                      </span>
                      {hasSprint && !isSuspended && (
                        <span className="block text-[10px] font-semibold text-[var(--fr-red-ink)] mt-0.5">
                          Sprint {formatDate(race.sprint_race_date)}
                        </span>
                      )}
                    </span>
                  </>
                );

                const cls = 'group block overflow-hidden rounded-[var(--radius-md)] border border-[var(--fr-border)] bg-[var(--fr-surface)] transition-all';

                /* Una gara sospesa non porta da nessuna parte: prima restava un
                   <Link> reso inerte con `pointer-events-none`, cioè un link che
                   la tastiera raggiunge e lo screen reader annuncia a vuoto. */
                return isSuspended ? (
                  <div key={race.id} className={`${cls} opacity-70`}>
                    {contenuto}
                    <span className="sr-only">Gara sospesa</span>
                  </div>
                ) : (
                  <Link
                    key={race.id}
                    href={`/gp/${selectedSeason}/${race.round}`}
                    className={`${cls} hover:-translate-y-1 hover:border-[var(--fr-border-strong)]`}
                  >
                    {contenuto}
                  </Link>
                );
              })}
            </div>
          )}
        </Panel>

    </PageShell>
  );
}
