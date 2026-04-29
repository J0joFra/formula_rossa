import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFlagCode(countryId = '') {
  const map = {
    'australia': 'au', 'austria': 'at', 'azerbaijan': 'az', 'bahrain': 'bh',
    'belgium': 'be', 'brazil': 'br', 'canada': 'ca', 'china': 'cn',
    'france': 'fr', 'germany': 'de', 'hungary': 'hu', 'italy': 'it',
    'japan': 'jp', 'mexico': 'mx', 'monaco': 'mc', 'netherlands': 'nl',
    'portugal': 'pt', 'qatar': 'qa', 'saudi-arabia': 'sa', 'singapore': 'sg',
    'spain': 'es', 'united-arab-emirates': 'ae', 'united-kingdom': 'gb',
    'united-states': 'us', 'miami': 'us', 'las-vegas': 'us',
    'albania': 'al', 'andorra': 'ad', 'armenia': 'am', 'belarus': 'by', 'bosnia-and-herzegovina': 'ba',
    'bulgaria': 'bg', 'croatia': 'hr', 'cyprus': 'cy', 'czech-republic': 'cz', 'denmark': 'dk',
    'estonia': 'ee', 'finland': 'fi', 'georgia': 'ge', 'greece': 'gr', 'iceland': 'is',
    'ireland': 'ie', 'latvia': 'lv', 'liechtenstein': 'li', 'lithuania': 'lt', 'luxembourg': 'lu',
    'malta': 'mt', 'moldova': 'md', 'montenegro': 'me', 'north-macedonia': 'mk', 'norway': 'no',
    'poland': 'pl', 'romania': 'ro', 'russia': 'ru', 'san-marino': 'sm', 'serbia': 'rs',
    'slovakia': 'sk', 'slovenia': 'si', 'sweden': 'se', 'switzerland': 'ch', 'turkey': 'tr',
    'ukraine': 'ua', 'vatican-city': 'va',
    'afghanistan': 'af', 'bangladesh': 'bd', 'bhutan': 'bt', 'brunei': 'bn', 'cambodia': 'kh',
    'india': 'in', 'indonesia': 'id', 'iran': 'ir', 'iraq': 'iq', 'israel': 'il',
    'jordan': 'jo', 'kazakhstan': 'kz', 'kuwait': 'kw', 'kyrgyzstan': 'kg', 'laos': 'la',
    'lebanon': 'lb', 'malaysia': 'my', 'maldives': 'mv', 'mongolia': 'mn', 'myanmar': 'mm',
    'nepal': 'np', 'north-korea': 'kp', 'oman': 'om', 'pakistan': 'pk', 'palestine': 'ps',
    'philippines': 'ph', 'south-korea': 'kr', 'sri-lanka': 'lk', 'syria': 'sy', 'taiwan': 'tw',
    'tajikistan': 'tj', 'thailand': 'th', 'timor-leste': 'tl', 'turkmenistan': 'tm', 'uzbekistan': 'uz',
    'vietnam': 'vn', 'yemen': 'ye',
    'antigua-and-barbuda': 'ag', 'argentina': 'ar', 'bahamas': 'bs', 'barbados': 'bb', 'belize': 'bz',
    'bolivia': 'bo', 'chile': 'cl', 'colombia': 'co', 'costa-rica': 'cr', 'cuba': 'cu',
    'dominica': 'dm', 'dominican-republic': 'do', 'ecuador': 'ec', 'el-salvador': 'sv', 'grenada': 'gd',
    'guatemala': 'gt', 'guyana': 'gy', 'haiti': 'ht', 'honduras': 'hn', 'jamaica': 'jm',
    'nicaragua': 'ni', 'panama': 'pa', 'paraguay': 'py', 'peru': 'pe', 'saint-kitts-and-nevis': 'kn',
    'saint-lucia': 'lc', 'saint-vincent-and-the-grenadines': 'vc', 'suriname': 'sr', 'trinidad-and-tobago': 'tt', 'uruguay': 'uy',
    'venezuela': 've',
    'algeria': 'dz', 'angola': 'ao', 'benin': 'bj', 'botswana': 'bw', 'burkina-faso': 'bf',
    'burundi': 'bi', 'cabo-verde': 'cv', 'cameroon': 'cm', 'central-african-republic': 'cf', 'chad': 'td',
    'comoros': 'km', 'congo-brazzaville': 'cg', 'congo-kinshasa': 'cd', 'cote-divoire': 'ci', 'djibouti': 'dj',
    'egypt': 'eg', 'equatorial-guinea': 'gq', 'eritrea': 'er', 'eswatini': 'sz', 'ethiopia': 'et',
    'gabon': 'ga', 'gambia': 'gm', 'ghana': 'gh', 'guinea': 'gn', 'guinea-bissau': 'gw',
    'kenya': 'ke', 'lesotho': 'ls', 'liberia': 'lr', 'libya': 'ly', 'madagascar': 'mg',
    'malawi': 'mw', 'mali': 'ml', 'mauritania': 'mr', 'mauritius': 'mu', 'morocco': 'ma',
    'mozambique': 'mz', 'namibia': 'na', 'niger': 'ne', 'nigeria': 'ng', 'rwanda': 'rw',
    'sao-tome-and-principe': 'st', 'senegal': 'sn', 'seychelles': 'sc', 'sierra-leone': 'sl', 'somalia': 'so',
    'south-africa': 'za', 'south-sudan': 'ss', 'sudan': 'sd', 'tanzania': 'tz', 'togo': 'tg',
    'tunisia': 'tn', 'uganda': 'ug', 'zambia': 'zm', 'zimbabwe': 'zw',
    'fiji': 'fj', 'kiribati': 'ki', 'marshall-islands': 'mh', 'micronesia': 'fm', 'nauru': 'nr',
    'new-zealand': 'nz', 'palau': 'pw', 'papua-new-guinea': 'pg', 'samoa': 'ws', 'solomon-islands': 'sb',
    'tonga': 'to', 'tuvalu': 'tv', 'vanuatu': 'vu',
    'united states of america': 'us',
    'morocco': 'ma', 'sweden': 'se', 'argentina': 'ar', 'india': 'in', 'mexico': 'mx', 'turkey': 'tr', 'hungary': 'hu', 'china': 'cn', 
    'malaysia': 'my', 'singapore': 'sg', 'qatar': 'qa', 'russia': 'ru', 'switzerland': 'ch', 'azerbaijan': 'az', 'south africa': 'za',
    'united-states-of-america': 'us', 'south-korea': 'kr', 'saudi-arabia': 'sa', 'united-arab-emirates': 'ae',
    'united states of america': 'us', 'south korea': 'kr', 'saudi arabia': 'sa', 'united arab emirates': 'ae'
  };
  return map[countryId.toLowerCase().replace(/\s+/g, '-')] || null;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CircuitDetail() {
  const router = useRouter();
  const { slug } = router.query;

  const [circuit, setCircuit] = useState(null);
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState('info');

  useEffect(() => {
    if (!slug) return;
    async function fetchCircuit() {
      setLoading(true);
      setError(null);

      // Tabella: "circuit" (singolare) — colonne reali del DB
      const { data, error } = await supabase
        .from('circuit')                 // ← era 'circuits'
        .select('id, name, full_name, previous_names, place_name, country_id, length, turns, direction, type, latitude, longitude, total_races_held')
        .eq('id', slug)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setCircuit(data);

      // Carica i layout del circuito dalla tabella "circuit_layout"
      const { data: layoutData } = await supabase
        .from('circuit_layout')          // tabella layout reale
        .select('*')
        .eq('circuit_id', slug)
        .order('year', { ascending: false });

      setLayouts(layoutData || []);
      setLoading(false);
    }
    fetchCircuit();
  }, [slug]);

  const flag = circuit ? getFlagCode(circuit.country_id || '') : null;

  const TABS = [
    { id: 'info',    label: 'Dati Tecnici' },
    { id: 'history', label: 'Gare' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-xl bg-white/5" />
          <div className="h-64 rounded-2xl bg-white/5" />
          <div className="h-48 rounded-2xl bg-white/5" />
        </div>
      </main>
      <Footer />
    </div>
  );

  if (error || !circuit) return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-20 text-center">
        <p className="text-red-400 font-mono">{error || 'Circuito non trovato.'}</p>
        <Link href="/circuiti" className="mt-6 inline-block text-sm font-mono text-white/35 hover:text-red-400 transition-colors">
          ← Tutti i circuiti
        </Link>
      </main>
      <Footer />
    </div>
  );

  return (
    <>
      <Head>
        <title>{circuit.name} — Circuiti F1 · Telemetry Explorer</title>
        <meta name="description"
          content={`${circuit.name}: lunghezza ${circuit.length ?? '?'} km, ${circuit.turns ?? '?'} curve. Tutte le gare disputate.`}
        />
      </Head>
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navigation />
        <main className="max-w-5xl mx-auto px-4 pt-24 pb-20">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-white/30 mb-6">
            <Link href="/circuiti" className="hover:text-red-400 transition-colors">Circuiti</Link>
            <span>/</span>
            <span className="text-white/60">{circuit.name}</span>
          </div>

          {/* Hero */}
          <div className="relative overflow-hidden rounded-2xl border border-white/8 mb-8"
               style={{ background: 'linear-gradient(135deg,#0e0e0e 0%,#111 100%)' }}>
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle,rgba(220,0,0,0.12) 0%,transparent 65%)' }} />
            <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
                 style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,#fff 1px,transparent 0)', backgroundSize: '32px 32px' }} />

            <div className="relative z-10 p-8 md:p-12">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {flag && (
                      <img src={`https://flagcdn.com/w28/${flag}.png`} alt={circuit.country_id}
                           className="w-7 h-4 object-cover rounded-sm" />
                    )}
                    <span className="text-[11px] text-white/40 font-mono tracking-[0.25em] uppercase">
                      {circuit.country_id?.replace(/-/g, ' ')}{circuit.place_name ? ` · ${circuit.place_name}` : ''}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-1">
                    {circuit.name}
                  </h1>
                  {circuit.full_name && circuit.full_name !== circuit.name && (
                    <p className="text-white/35 text-sm font-mono mt-1">{circuit.full_name}</p>
                  )}
                  {circuit.previous_names && (
                    <p className="text-white/20 text-[11px] font-mono mt-1 italic">
                      Precedentemente: {circuit.previous_names}
                    </p>
                  )}
                </div>

                {circuit.direction && (
                  <div className="px-4 py-2 rounded-xl border border-white/10 text-center flex-shrink-0"
                       style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-[9px] text-white/30 font-mono tracking-widest uppercase mb-1">Direzione</div>
                    <div className="text-sm font-black font-mono text-white/70 capitalize">{circuit.direction}</div>
                  </div>
                )}
              </div>

              {/* Big stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                <HeroStat label="Lunghezza"    value={circuit.length ? `${circuit.length} km` : '—'} accent />  {/* ← era lap_length_km */}
                <HeroStat label="Curve"        value={circuit.turns ?? '—'} />                                   {/* ← era number_of_corners */}
                <HeroStat label="Tipo"         value={circuit.type ?? '—'} />                                    {/* colonna reale */}
                <HeroStat label="Gare totali"  value={circuit.total_races_held ?? '—'} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-white/8">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-3 text-sm font-mono font-bold transition-all border-b-2 -mb-px ${
                  tab === t.id
                    ? 'border-red-600 text-white'
                    : 'border-transparent text-white/35 hover:text-white/70'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: Dati tecnici */}
          {tab === 'info' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/8 p-6"
                   style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h2 className="text-xs text-white/30 font-mono tracking-[0.25em] uppercase mb-4">
                  Caratteristiche tecniche
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Lunghezza giro',  value: circuit.length    ? `${circuit.length} km` : '—' },
                    { label: 'Numero di curve', value: circuit.turns     ?? '—' },
                    { label: 'Tipo circuito',   value: circuit.type      ?? '—' },
                    { label: 'Direzione pista', value: circuit.direction ?? '—' },
                    { label: 'Gare disputate',  value: circuit.total_races_held ?? '—' },
                    { label: 'Città / Luogo',   value: circuit.place_name ?? '—' },  
                    { label: 'Nazione',         value: circuit.country_id?.replace(/-/g, ' ') ?? '—' },
                    { label: 'Latitudine',      value: circuit.latitude  ?? '—' },
                    { label: 'Longitudine',     value: circuit.longitude ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                      <span className="text-xs text-white/35 font-mono">{label}</span>
                      <span className="text-sm font-bold text-white capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layout variants */}
              {layouts.length > 0 && (
                <div className="rounded-2xl border border-white/8 p-6"
                     style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h2 className="text-xs text-white/30 font-mono tracking-[0.25em] uppercase mb-4">
                    Varianti del tracciato ({layouts.length})
                  </h2>
                  <div className="space-y-2">
                    {layouts.map(l => (
                      <div key={l.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-white/50">{l.id}</span>
                        </div>
                        <div className="flex gap-6 text-xs font-mono">
                          <span className="text-white/60">{l.length ? `${l.length} km` : '—'}</span>
                          <span className="text-white/35">{l.turns ? `${l.turns} curve` : '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <CircuitNotes circuitId={circuit.id} />
            </div>
          )}

          {/* Tab: Storia gare */}
          {tab === 'history' && (
            <div className="rounded-2xl border border-white/8 p-8 text-center"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-white/25 font-mono text-sm tracking-widest uppercase">
                Storico gare non ancora disponibile
              </p>
              <p className="text-white/15 font-mono text-xs mt-2">
                Migrare la tabella race su Supabase per abilitare questa sezione
              </p>
            </div>
          )}

          {/* Back link */}
          <div className="mt-10">
            <Link href="/circuiti"
              className="inline-flex items-center gap-2 text-sm font-mono text-white/35 hover:text-red-400 transition-colors">
              ← Tutti i circuiti
            </Link>
          </div>

        </main>
        <Footer />
      </div>
    </>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function HeroStat({ label, value, accent }) {
  return (
    <div className="rounded-xl px-4 py-3 border border-white/8"
         style={{ background: accent ? 'rgba(220,0,0,0.08)' : 'rgba(255,255,255,0.03)' }}>
      <div className="text-[9px] text-white/30 font-mono tracking-widest uppercase mb-1">{label}</div>
      <div className={`text-2xl font-black font-mono ${accent ? 'text-red-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}

const CIRCUIT_NOTES = {
  'monza':             { title: 'Il Tempio della Velocità',        body: `Monza è il circuito più veloce del calendario F1. I suoi lunghi rettilinei — tra cui il Rettifilo Tribune lungo oltre un chilometro — spingono le monoposto oltre i 350 km/h. Le scuderie montano setup ad altissima efficienza aerodinamica con pochissimo carico, sacrificando la tenuta in curva per la velocità massima. Le storiche paraboliche e la Prima Variante sono tra i punti di frenata più impegnativi dell'intera stagione. Ospita il Gran Premio d'Italia dal 1950, primo anno del Mondiale.` },
  'monaco':            { title: 'La Corsa più Prestigiosa',        body: `Monaco è l'opposto di Monza: il circuito più lento, più stretto e più iconico del mondo. Le barriere sono a pochi centimetri dalle ruote, non esiste margine di errore. La pole position è determinante perché sorpassare è quasi impossibile — spesso il vincitore è chi parte davanti. Il tunnel, il Casino, il Portier e la chicane della piscina sono luoghi leggendari. Vincere a Monaco vale doppio nell'immaginario della Formula 1.` },
  'silverstone':       { title: 'La Casa del Motorsport',          body: `Silverstone ha ospitato il primo Gran Premio del Mondiale di Formula 1 nel 1950. Le sue curve rapide — Copse, Maggots, Becketts — sono tra le più spettacolari del calendario e richiedono altissimo carico aerodinamico e una grande fiducia nella macchina. Abbey, in piena velocità, è uno dei passaggi più emozionanti del Mondiale.` },
  'spa-francorchamps': { title: 'Il Circuito più Amato dai Piloti', body: `Spa-Francorchamps è spesso citato come il circuito preferito dai piloti. L'Eau Rouge-Raidillon — la combinazione di curve in salita a tutta velocità — è il punto più iconico dell'intero calendario F1. Il meteo è imprevedibile: è normale avere sole da un lato e pioggia battente dall'altro. Il Kemmel Straight è uno dei principali punti di sorpasso del campionato.` },
  'suzuka':            { title: 'Il Circuito dei Tecnici',         body: `Suzuka è il circuito più tecnico del calendario, con una sequenza di curve in S nella prima parte del tracciato che mette alla prova l'equilibrio aerodinamico della vettura in modo unico. Il disegno a otto incrociato è unico nel motorsport. Spoon Curve, Degner e 130R sono punti dove i piloti dimostrano il massimo coraggio.` },
};

function CircuitNotes({ circuitId }) {
  const note = CIRCUIT_NOTES[circuitId] || null;
  return (
    <div className="rounded-2xl border border-white/8 p-6"
         style={{ background: 'rgba(255,255,255,0.02)' }}>
      <h2 className="text-xs text-white/30 font-mono tracking-[0.25em] uppercase mb-4">
        {note ? 'Note editoriali' : 'Descrizione'}
      </h2>
      {note ? (
        <>
          <h3 className="text-lg font-black text-white mb-3">{note.title}</h3>
          <p className="text-sm text-white/60 leading-relaxed">{note.body}</p>
        </>
      ) : (
        <p className="text-sm text-white/30 font-mono italic">
          Informazioni editoriali non ancora disponibili per questo circuito.
        </p>
      )}
    </div>
  );
}
