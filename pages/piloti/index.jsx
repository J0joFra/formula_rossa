// pages/piloti/index.jsx
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

const FLAG_MAP = {
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
function getFlagCode(id='') { return FLAG_MAP[id?.toLowerCase().replace(/\s+/g,'-')] || null; }

function calcAge(dob, dod) {
  if (!dob) return null;
  const end = dod ? new Date(dod) : new Date();
  const birth = new Date(dob);
  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
  return age;
}
 
function getEra(dob) {
  if (!dob) return 'Unknown';
  const y = new Date(dob).getFullYear();
  if (y < 1960) return 'Pionieri';
  if (y < 1970) return 'Anni \'60';
  if (y < 1980) return 'Anni \'70';
  if (y < 1990) return 'Anni \'80';
  if (y < 2000) return 'Anni \'90';
  return 'Era Moderna';
}
 
const ERA_META = {
  'Pionieri':    { color:'#a78bfa', glow:'rgba(167,139,250,0.12)' },
  'Anni \'60':   { color:'#fb923c', glow:'rgba(251,146,60,0.12)'  },
  'Anni \'70':   { color:'#facc15', glow:'rgba(250,204,21,0.12)'  },
  'Anni \'80':   { color:'#34d399', glow:'rgba(52,211,153,0.12)'  },
  'Anni \'90':   { color:'#60a5fa', glow:'rgba(96,165,250,0.12)'  },
  'Era Moderna': { color:'#f87171', glow:'rgba(248,113,113,0.12)' },
  'Unknown':     { color:'#9ca3af', glow:'rgba(156,163,175,0.05)' },
};
 
// Iniziali stilizzate come avatar
function DriverAvatar({ firstName, lastName, number, size = 64, championships = 0 }) {
  const initials = `${firstName?.[0]||''}${lastName?.[0]||''}`.toUpperCase();
  const isChamp  = championships > 0;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: isChamp
        ? 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #b91c1c 100%)'
        : 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      border: isChamp ? '2px solid rgba(220,38,38,0.6)' : '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      boxShadow: isChamp ? '0 0 16px rgba(220,38,38,0.25)' : 'none',
    }}>
      <span style={{
        fontSize: size * 0.3, fontWeight: '900', fontFamily: 'monospace',
        color: isChamp ? '#fff' : 'rgba(255,255,255,0.5)',
        letterSpacing: '-1px',
      }}>{initials || '?'}</span>
      {number && (
        <span style={{
          position: 'absolute', bottom: '-4px', right: '-4px',
          background: '#dc2626', color: '#fff',
          fontSize: size * 0.18, fontWeight: '800', fontFamily: 'monospace',
          padding: '1px 4px', borderRadius: '3px',
          border: '1px solid rgba(0,0,0,0.4)',
          lineHeight: 1.4,
        }}>{number}</span>
      )}
    </div>
  );
}
 
export default function PilotiIndex() {
  const [drivers,  setDrivers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [eraFilter,setEraFilter]= useState('all');
  const [sortBy,   setSortBy]   = useState('wins');
  const [champOnly,setChampOnly]= useState(false);
  const [mounted,  setMounted]  = useState(false);
 
  useEffect(() => { setMounted(true); }, []);
 
  useEffect(() => {
    async function fetchDrivers() {
      setLoading(true);
      const { data, error } = await supabase
        .from('driver')
        .select(`id, first_name, last_name, full_name, abbreviation, permanent_number,
                 date_of_birth, date_of_death, place_of_birth,
                 nationality_country_id, country_of_birth_country_id,
                 total_championship_wins, total_race_wins, total_podiums,
                 total_pole_positions, total_fastest_laps, total_points,
                 total_race_starts, best_championship_position, total_grand_slams`);
      if (error) { setError(error.message); }
      else {
        setDrivers((data||[]).map(d => ({ ...d, era: getEra(d.date_of_birth) })));
      }
      setLoading(false);
    }
    fetchDrivers();
  }, []);
 
  const eras = useMemo(() => {
    const s = new Set(drivers.map(d=>d.era).filter(Boolean));
    return ['all', ...['Pionieri',"Anni '60","Anni '70","Anni '80","Anni '90",'Era Moderna'].filter(e=>s.has(e))];
  }, [drivers]);
 
  const filtered = useMemo(() => {
    let list = drivers;
    if (champOnly) list = list.filter(d => d.total_championship_wins > 0);
    if (eraFilter !== 'all') list = list.filter(d => d.era === eraFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.full_name?.toLowerCase().includes(q) ||
        d.nationality_country_id?.toLowerCase().includes(q) ||
        d.abbreviation?.toLowerCase().includes(q) ||
        d.permanent_number?.includes(q)
      );
    }
    const sorts = {
      'wins':    (a,b) => (b.total_race_wins||0)  - (a.total_race_wins||0),
      'champs':  (a,b) => (b.total_championship_wins||0) - (a.total_championship_wins||0),
      'podiums': (a,b) => (b.total_podiums||0)    - (a.total_podiums||0),
      'poles':   (a,b) => (b.total_pole_positions||0) - (a.total_pole_positions||0),
      'points':  (a,b) => (b.total_points||0)     - (a.total_points||0),
      'name':    (a,b) => (a.last_name||'').localeCompare(b.last_name||''),
      'starts':  (a,b) => (b.total_race_starts||0)- (a.total_race_starts||0),
    };
    return [...list].sort(sorts[sortBy] || sorts['wins']);
  }, [drivers, search, eraFilter, sortBy, champOnly]);
 
  // Stats globali
  const stats = useMemo(() => ({
    total:   drivers.length,
    champs:  drivers.filter(d=>d.total_championship_wins>0).length,
    maxWins: Math.max(...drivers.map(d=>d.total_race_wins||0)),
    maxWinner: drivers.reduce((acc,d) => (d.total_race_wins||0)>(acc.total_race_wins||0) ? d : acc, {}),
  }), [drivers]);
 
  return (
    <>
      <Head>
        <title>Piloti F1 — Formula Rossa</title>
        <meta name="description" content="Tutti i piloti di Formula 1: vittorie, pole position, campionati e statistiche complete." />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Serif+4:wght@400;700&display=swap" rel="stylesheet"/>
        <style>{`
          @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
          @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.3} }
          @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
          * { box-sizing: border-box; }
          html, body { background: #080808 !important; color: #ffffff !important; }
          ::-webkit-scrollbar{width:4px}
          ::-webkit-scrollbar-track{background:#080808}
          ::-webkit-scrollbar-thumb{background:#dc2626;border-radius:2px}
        `}</style>
      </Head>
 
      <div style={{ minHeight:'100vh', background:'#080808', color:'#fff' }}>
        <Navigation />
 
        <main style={{
          maxWidth:'1200px', margin:'0 auto',
          padding:'88px 24px 96px',
          opacity: mounted ? 1 : 0,
          transition: 'opacity .5s ease',
        }}>
 
          {/* ── HERO HEADER ── */}
          <header style={{ marginBottom:'48px', animation:'fadeUp .6s ease both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#dc2626', animation:'pulse 2s infinite' }}/>
              <span style={{ fontSize:'10px', color:'#dc2626', fontFamily:'monospace', fontWeight:'800', letterSpacing:'2.5px' }}>
                F1 DRIVERS DATABASE · {loading ? '…' : drivers.length} PILOTI
              </span>
            </div>
            <h1 style={{
              margin:0, fontFamily:"'Bebas Neue',Georgia,serif",
              fontSize:'clamp(52px,8vw,96px)', fontWeight:'400',
              letterSpacing:'4px', lineHeight:1,
            }}>
              I PILOTI <span style={{ color:'#dc2626' }}>DELLA STORIA</span>
            </h1>
            <p style={{ margin:'14px 0 0', fontSize:'12px', fontFamily:'monospace', color:'rgba(255,255,255,.25)', letterSpacing:'1px' }}>
              Vittorie, pole position, campionati e ogni record del Mondiale F1
            </p>
 
            {/* Stats globali */}
            {!loading && (
              <div style={{
                display:'flex', gap:'32px', flexWrap:'wrap',
                marginTop:'28px', paddingTop:'24px',
                borderTop:'1px solid rgba(255,255,255,.06)',
              }}>
                {[
                  { label:'Campioni del mondo', value: stats.champs },
                  { label:'Piloti totali',       value: stats.total },
                  { label:'Record vittorie',     value: `${stats.maxWins}`, sub: stats.maxWinner?.last_name },
                ].map(s=>(
                  <div key={s.label}>
                    <div style={{ display:'flex', alignItems:'baseline', gap:'6px' }}>
                      <span style={{ fontSize:'26px', fontWeight:'900', fontFamily:'monospace', color:'#fff' }}>{s.value}</span>
                      {s.sub && <span style={{ fontSize:'11px', color:'rgba(255,255,255,.3)', fontFamily:'monospace' }}>{s.sub}</span>}
                    </div>
                    <div style={{ fontSize:'9px', color:'rgba(255,255,255,.3)', fontFamily:'monospace', letterSpacing:'1px', textTransform:'uppercase', marginTop:'2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </header>
 
          {/* ── CONTROLS ── */}
          {!loading && (
            <div style={{
              display:'flex', flexWrap:'wrap', gap:'10px',
              marginBottom:'32px', alignItems:'center',
              animation:'fadeUp .6s .1s ease both', opacity:0,
            }}>
              {/* Search */}
              <div style={{ position:'relative', flex:'1', minWidth:'220px' }}>
                <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'13px', color:'rgba(255,255,255,.25)', pointerEvents:'none' }}>🔍</span>
                <input
                  value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Cerca pilota, nazionalità, numero…"
                  style={{
                    width:'100%', background:'rgba(255,255,255,.04)',
                    border:'1px solid rgba(255,255,255,.08)', borderRadius:'4px',
                    padding:'10px 36px', fontSize:'12px', fontFamily:'monospace',
                    color:'#fff', outline:'none', transition:'border-color .2s',
                  }}
                  onFocus={e=>e.target.style.borderColor='rgba(220,38,38,.5)'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.08)'}
                />
                {search && (
                  <button onClick={()=>setSearch('')} style={{
                    position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', color:'rgba(255,255,255,.3)', cursor:'pointer', fontSize:'16px',
                  }}>×</button>
                )}
              </div>
 
              {/* Champion filter toggle */}
              <button onClick={()=>setChampOnly(v=>!v)} style={{
                padding:'9px 16px', borderRadius:'4px', cursor:'pointer',
                fontSize:'9px', fontFamily:'monospace', fontWeight:'800',
                letterSpacing:'1.5px', textTransform:'uppercase',
                border: champOnly ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,.08)',
                background: champOnly ? 'rgba(251,191,36,.12)' : 'rgba(255,255,255,.03)',
                color: champOnly ? '#fbbf24' : 'rgba(255,255,255,.4)',
                transition:'all .2s',
                display:'flex', alignItems:'center', gap:'6px',
              }}>
                🏆 {champOnly ? 'Solo campioni' : 'Tutti i piloti'}
              </button>
 
              {/* Era pills */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {eras.map(e => {
                  const meta = e==='all' ? {color:'#dc2626'} : ERA_META[e];
                  const active = eraFilter===e;
                  return (
                    <button key={e} onClick={()=>setEraFilter(e)} style={{
                      padding:'7px 12px', borderRadius:'3px', cursor:'pointer',
                      fontSize:'9px', fontFamily:'monospace', fontWeight:'800',
                      letterSpacing:'1px', textTransform:'uppercase',
                      border: active ? `1px solid ${meta?.color}` : '1px solid rgba(255,255,255,.08)',
                      background: active ? `${meta?.color}18` : 'rgba(255,255,255,.03)',
                      color: active ? meta?.color : 'rgba(255,255,255,.4)',
                      transition:'all .2s',
                    }}>{e==='all' ? `Tutti` : e}</button>
                  );
                })}
              </div>
 
              {/* Sort */}
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{
                background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)',
                borderRadius:'4px', padding:'9px 14px', fontSize:'11px',
                fontFamily:'monospace', color:'rgba(255,255,255,.6)', outline:'none', cursor:'pointer',
              }}>
                <option value="wins">Per vittorie</option>
                <option value="champs">Per campionati</option>
                <option value="podiums">Per podi</option>
                <option value="poles">Per pole position</option>
                <option value="points">Per punti totali</option>
                <option value="starts">Per gare disputate</option>
                <option value="name">Alfabetico</option>
              </select>
            </div>
          )}
 
          {/* ── ERROR ── */}
          {error && (
            <div style={{ padding:'16px 20px', borderRadius:'4px', border:'1px solid rgba(220,38,38,.3)', background:'rgba(220,38,38,.06)', color:'#f87171', fontFamily:'monospace', fontSize:'13px', marginBottom:'24px' }}>
              ⚠ Errore: {error}
            </div>
          )}
 
          {/* ── SKELETON ── */}
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {Array.from({length:12}).map((_,i)=>(
                <div key={i} style={{
                  height:'72px', borderRadius:'4px',
                  border:'1px solid rgba(255,255,255,.05)',
                  background:'#0d0d0d',
                  overflow:'hidden', position:'relative',
                }}>
                  <div style={{
                    position:'absolute', inset:0,
                    background:'linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent)',
                    animation:'shimmer 1.5s infinite',
                  }}/>
                </div>
              ))}
            </div>
          )}
 
          {/* ── EMPTY ── */}
          {!loading && filtered.length===0 && !error && (
            <div style={{ textAlign:'center', padding:'80px 0', color:'rgba(255,255,255,.2)', fontFamily:'monospace' }}>
              <div style={{ fontSize:'36px', marginBottom:'16px' }}>🏎</div>
              <p style={{ fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase' }}>Nessun pilota trovato</p>
            </div>
          )}
 
          {/* ── LIST ── */}
          {!loading && filtered.length>0 && (
            <div style={{
              display:'flex', flexDirection:'column', gap:'6px',
              animation:'fadeUp .6s .15s ease both', opacity:0,
            }}>
              {/* Header colonne */}
              <div style={{
                display:'grid',
                gridTemplateColumns:'32px 1fr 60px 60px 60px 60px 60px',
                gap:'12px', padding:'8px 16px',
                fontSize:'8px', color:'rgba(255,255,255,.55)',
                fontFamily:'monospace', letterSpacing:'1.5px', textTransform:'uppercase',
                borderBottom:'1px solid rgba(255,255,255,.08)',
                background:'#0f0f0f',
                borderRadius:'4px 4px 0 0',
              }}>
                <span>#</span>
                <span>Pilota</span>
                <span style={{textAlign:'right'}}>Vittorie</span>
                <span style={{textAlign:'right'}}>Titoli</span>
                <span style={{textAlign:'right'}}>Podi</span>
                <span style={{textAlign:'right'}}>Pole</span>
                <span style={{textAlign:'right'}}>Gare</span>
              </div>
 
              {filtered.map((d,i)=><DriverRow key={d.id} driver={d} rank={i+1} sortBy={sortBy}/>)}
            </div>
          )}
 
          {/* Count footer */}
          {!loading && filtered.length>0 && (
            <p style={{
              marginTop:'32px', textAlign:'center',
              fontSize:'10px', color:'rgba(255,255,255,.15)',
              fontFamily:'monospace', letterSpacing:'2px',
            }}>
              {filtered.length} / {drivers.length} PILOTI
            </p>
          )}
 
        </main>
        <Footer />
      </div>
    </>
  );
}
 
// ── Driver Row ────────────────────────────────────────────────────────────────
 
function DriverRow({ driver: d, rank, sortBy }) {
  const [hovered, setHovered] = useState(false);
  const flag = getFlagCode(d.nationality_country_id||'');
  const era  = ERA_META[d.era] || ERA_META['Unknown'];
  const isChamp = d.total_championship_wins > 0;
  const age  = calcAge(d.date_of_birth, d.date_of_death);
  const isDead = !!d.date_of_death;
 
  // Valore evidenziato in base al sort attivo
  const highlight = {
    wins:    d.total_race_wins,
    champs:  d.total_championship_wins,
    podiums: d.total_podiums,
    poles:   d.total_pole_positions,
    points:  d.total_points,
    starts:  d.total_race_starts,
  }[sortBy];
 
  return (
    <Link href={`/piloti/${d.id}`} style={{ textDecoration:'none', color:'inherit' }}>
      <article
        onMouseEnter={()=>setHovered(true)}
        onMouseLeave={()=>setHovered(false)}
        style={{
          display:'grid',
          gridTemplateColumns:'32px 1fr 60px 60px 60px 60px 60px',
          gap:'12px', alignItems:'center',
          padding:'12px 16px', borderRadius:'4px',
          border: hovered
            ? `1px solid ${isChamp ? 'rgba(220,38,38,.35)' : 'rgba(255,255,255,.1)'}`
            : '1px solid rgba(255,255,255,.04)',
          background: hovered
            ? (isChamp ? '#0f0303' : '#0f0f0f')
            : '#0a0a0a',
          cursor:'pointer', transition:'all .18s ease',
          position:'relative',
        }}
      >
        {/* Rank */}
        <div style={{
          fontSize:'11px', fontFamily:'monospace', fontWeight:'800',
          color: rank <= 3 ? '#dc2626' : 'rgba(255,255,255,.18)',
          textAlign:'center',
        }}>{rank <= 3 ? ['①','②','③'][rank-1] : rank}</div>
 
        {/* Pilota info */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', minWidth:0 }}>
          <DriverAvatar
            firstName={d.first_name} lastName={d.last_name}
            number={d.permanent_number}
            championships={d.total_championship_wins}
            size={40}
          />
          <div style={{ minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
              <span style={{
                fontSize:'14px', fontWeight:'800', color: hovered ? '#fff' : 'rgba(255,255,255,.9)',
                fontFamily:"'Source Serif 4',Georgia,serif",
                transition:'color .18s',
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              }}>{d.full_name}</span>
              {isChamp && (
                <span style={{
                  fontSize:'8px', fontFamily:'monospace', fontWeight:'800',
                  padding:'2px 6px', borderRadius:'2px',
                  background:'rgba(220,38,38,.15)', color:'#dc2626',
                  border:'1px solid rgba(220,38,38,.3)', letterSpacing:'1px',
                  whiteSpace:'nowrap',
                }}>
                  {d.total_championship_wins}× 🏆
                </span>
              )}
              {isDead && (
                <span style={{ fontSize:'8px', color:'rgba(255,255,255,.2)', fontFamily:'monospace' }}>†</span>
              )}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'2px' }}>
              {flag && (
                <img src={`https://flagcdn.com/w20/${flag}.png`} alt={d.nationality_country_id}
                  style={{ width:'16px', height:'10px', objectFit:'cover', borderRadius:'1px', opacity:.7 }}/>
              )}
              <span style={{ fontSize:'10px', color:'rgba(255,255,255,.28)', fontFamily:'monospace' }}>
                {d.nationality_country_id?.replace(/-/g,' ')}
                {age && <span style={{ marginLeft:'8px' }}>{isDead ? `† età ${age}` : `${age} anni`}</span>}
              </span>
              <span style={{
                fontSize:'8px', padding:'1px 6px', borderRadius:'2px',
                background: era.glow, color: era.color,
                border:`1px solid ${era.color}30`, fontFamily:'monospace',
                letterSpacing:'0.5px',
              }}>{d.era}</span>
            </div>
          </div>
        </div>
 
        {/* Stats columns */}
        {[
          { val: d.total_race_wins,      key:'wins'    },
          { val: d.total_championship_wins, key:'champs' },
          { val: d.total_podiums,         key:'podiums' },
          { val: d.total_pole_positions,  key:'poles'   },
          { val: d.total_race_starts,     key:'starts'  },
        ].map(({val, key}) => (
          <div key={key} style={{ textAlign:'right' }}>
            <span style={{
              fontSize:'14px', fontFamily:'monospace', fontWeight:'800',
              color: sortBy===key
                ? (val > 0 ? '#dc2626' : 'rgba(255,255,255,.2)')
                : (val > 0 ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.15)'),
              transition:'color .18s',
            }}>
              {val ?? '—'}
            </span>
          </div>
        ))}
 
        {/* Hover right arrow */}
        <div style={{
          position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)',
          fontSize:'12px', color:'#dc2626',
          opacity: hovered ? 1 : 0, transition:'opacity .18s',
          pointerEvents:'none',
        }}>→</div>
      </article>
    </Link>
  );
}
