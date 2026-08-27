import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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

// Calcolato lato client perché non esiste colonna "region" su Supabase
function getRegion(countryId = '') {
  const europe   = ['united-kingdom','italy','monaco','spain','france','germany','belgium','austria','hungary','netherlands','portugal','san-marino','switzerland','sweden','russia','turkey'];
  const asia     = ['japan','china','singapore','bahrain','saudi-arabia','qatar','united-arab-emirates','azerbaijan','india','south-korea','malaysia','vietnam'];
  const americas = ['united-states','mexico','brazil','canada','argentina', 'united states of america', 'united-states-of-america'];
  const oceania  = ['australia'];
  const k = countryId.toLowerCase();
  if (europe.includes(k))   return 'Europe';
  if (asia.includes(k))     return 'Asia & Middle East';
  if (americas.includes(k)) return 'Americas';
  if (oceania.includes(k))  return 'Oceania';
  return 'Other';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CircuitiIndex() {
  const [circuits, setCircuits] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    async function fetchCircuits() {
      setLoading(true);
      const { data, error } = await supabase
        .from('circuit')           
        .select('id, name, full_name, place_name, country_id, length, turns, direction, total_races_held')
        .order('name');
      if (error) {
        setError(error.message);
      } else {
        setCircuits((data || []).map(c => ({ ...c, region: getRegion(c.country_id || '') })));
      }
      setLoading(false);
    }
    fetchCircuits();
  }, []);

  const regions = useMemo(() => {
    const s = new Set(circuits.map(c => c.region).filter(Boolean));
    return ['all', ...Array.from(s).sort()];
  }, [circuits]);

  const filtered = useMemo(() => {
    let list = circuits;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.country_id?.toLowerCase().includes(q) ||
        c.place_name?.toLowerCase().includes(q)   
      );
    }
    if (region !== 'all') list = list.filter(c => c.region === region);
    if (sortBy === 'name')    list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'length')  list = [...list].sort((a, b) => (b.length || 0) - (a.length || 0));
    if (sortBy === 'country') list = [...list].sort((a, b) => (a.country_id || '').localeCompare(b.country_id || ''));
    return list;
  }, [circuits, search, region, sortBy]);

  return (
    <>
      <Head>
        <title>Circuiti F1 — Telemetry Explorer</title>
        <meta name="description" content="Tutti i circuiti di Formula 1: lunghezza, curve, DRS zone, record sul giro e storia." />
      </Head>
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 pt-24 pb-20">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-[10px] text-red-600 font-mono tracking-[0.2em] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
              CIRCUITI · F1 WORLD CALENDAR
            </div>
            <h1 className="text-5xl font-black tracking-tighter">
              I CIRCUITI <span className="text-red-600">DEL MONDO</span>
            </h1>
            <p className="text-white/40 font-mono text-sm mt-2 tracking-widest uppercase">
              {loading ? 'Caricamento…' : `${circuits.length} piste · Dati tecnici, record e storia`}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-sm">
              Errore nel caricamento: {error}
            </div>
          )}

          {/* Controls */}
          {!loading && (
            <div className="flex flex-wrap gap-3 mb-8 items-center">
              <div className="relative flex-1 min-w-48">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cerca circuito o paese…"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-white/25 focus:outline-none focus:border-red-600/50 transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-lg leading-none">
                    ×
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {regions.map(r => (
                  <button key={r} onClick={() => setRegion(r)}
                    className={`px-3 py-2 rounded-lg text-[11px] font-mono transition-colors ${
                      region === r
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-900 border border-white/8 text-white/50 hover:text-white hover:border-white/20'
                    }`}>
                    {r === 'all' ? `Tutti · ${circuits.length}` : r}
                  </button>
                ))}
              </div>

              <select
                value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] font-mono text-white/70 focus:outline-none focus:border-red-600/50">
                <option value="name">Ordina: Nome</option>
                <option value="country">Ordina: Paese</option>
                <option value="length">Ordina: Lunghezza</option>
              </select>
            </div>
          )}

          {/* Skeleton loader */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/8 h-44 animate-pulse"
                     style={{ background: 'rgba(255,255,255,0.03)' }} />
              ))}
            </div>
          )}

          {/* Grid */}
          {!loading && filtered.length === 0 && !error && (
            <div className="text-center py-20 text-white/25 font-mono tracking-widest uppercase text-sm">
              Nessun circuito trovato
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(c => <CircuitCard key={c.id} circuit={c} />)}
            </div>
          )}

        </main>
        <Footer />
      </div>
    </>
  );
}

// ── Circuit Card ──────────────────────────────────────────────────────────────

function CircuitCard({ circuit }) {
  const flag = getFlagCode(circuit.country_id || '');
  const regionColors = {
    'Europe':             'rgba(99,102,241,0.15)',
    'Asia & Middle East': 'rgba(245,158,11,0.15)',
    'Americas':           'rgba(34,197,94,0.15)',
    'Oceania':            'rgba(6,182,212,0.15)',
    'Other':              'rgba(255,255,255,0.05)',
  };
  const bg = regionColors[circuit.region] || regionColors['Other'];

  return (
    <Link href={`/circuiti/${circuit.id}`}>
      <div className="group relative rounded-2xl border border-white/8 overflow-hidden cursor-pointer transition-all duration-200 hover:border-red-600/40 hover:scale-[1.01]"
           style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="h-0.5 w-full"
             style={{ background: 'linear-gradient(90deg,transparent,rgba(220,0,0,0.6),transparent)' }} />
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {flag && (
                <img src={`https://flagcdn.com/w20/${flag}.png`} alt={circuit.country_id}
                     className="w-5 h-3 object-cover rounded-sm opacity-80" />
              )}
              <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">
                {circuit.country_id?.replace(/-/g, ' ')}
              </span>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: bg, color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {circuit.region}
            </span>
          </div>
          <h2 className="text-base font-black tracking-tight leading-tight text-white group-hover:text-red-400 transition-colors mb-1">
            {circuit.name}
          </h2>
          {circuit.place_name && (                          
            <p className="text-xs text-white/35 font-mono mb-4">{circuit.place_name}</p>
          )}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/6">
            <StatMini label="Lunghezza" value={circuit.length ? `${circuit.length} km` : '—'} />  
            <StatMini label="Curve"     value={circuit.turns ?? '—'} />                             
            <StatMini label="Gare"      value={circuit.total_races_held ?? '—'} />         
          </div>
        </div>
        <div className="absolute bottom-4 right-4 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-mono">→</div>
      </div>
    </Link>
  );
}

function StatMini({ label, value }) {
  return (
    <div>
      <div className="text-[9px] text-white/25 font-mono tracking-widest uppercase mb-0.5">{label}</div>
      <div className="text-xs font-bold font-mono text-white/70">{value}</div>
    </div>
  );
}
