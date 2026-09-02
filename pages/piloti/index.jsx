// pages/piloti/index.jsx
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import PageShell from '../../components/ui/PageShell';
import { getFlagCode } from '../../lib/flags';

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
 
/* Un colore per epoca. Erano sei tinte fisse pensate per il fondo scuro — sul
   tema chiaro "Anni '80" arrivava a 1,9:1 su bianco. Ora la tinta è un token
   che cambia con il tema (vedi styles/tokens.css) e il fondo della pastiglia
   si ricava da quella con `color-mix`, invece di essere un secondo colore
   scritto a mano che poteva non corrispondere. */
const ERA_META = {
  'Pionieri':    { color: 'var(--fr-accent-violet)' },
  'Anni \'60':   { color: 'var(--fr-accent-orange)' },
  'Anni \'70':   { color: 'var(--fr-accent-amber)' },
  'Anni \'80':   { color: 'var(--fr-accent-green)' },
  'Anni \'90':   { color: 'var(--fr-accent-blue)' },
  'Era Moderna': { color: 'var(--fr-accent-red)' },
  'Unknown':     { color: 'var(--fr-accent-neutral)' },
};

/** Sfondo tenue della stessa tinta, per pastiglie e filtri attivi. */
const alone = (colore, pct = 14) => `color-mix(in srgb, ${colore} ${pct}%, transparent)`;
 
// Iniziali stilizzate come avatar
function DriverAvatar({ firstName, lastName, number, size = 64, championships = 0 }) {
  const initials = `${firstName?.[0]||''}${lastName?.[0]||''}`.toUpperCase();
  const isChamp  = championships > 0;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: isChamp
        ? 'linear-gradient(135deg, #7f1d1d 0%, var(--fr-red) 50%, #b91c1c 100%)'
        : 'linear-gradient(135deg, var(--fr-surface-2) 0%, var(--fr-surface-3) 100%)',
      border: isChamp ? '2px solid rgba(220,38,38,0.6)' : '1px solid var(--fr-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      boxShadow: isChamp ? '0 0 16px rgba(220,38,38,0.25)' : 'none',
    }}>
      <span style={{
        fontSize: size * 0.3, fontWeight: '900', fontFamily: 'monospace',
        color: isChamp ? 'var(--fr-text)' : 'var(--fr-text-faint)',
        letterSpacing: '-1px',
      }}>{initials || '?'}</span>
      {number && (
        <span style={{
          position: 'absolute', bottom: '-4px', right: '-4px',
          /* Sul rosso ci va il bianco: con `var(--fr-text)` in tema chiaro
             questo numero era quasi nero sul rosso, 3,5:1. */
          background: 'var(--fr-red-fill)', color: '#fff',
          fontSize: size * 0.18, fontWeight: '800', fontFamily: 'monospace',
          padding: '1px 4px', borderRadius: '3px',
          border: '1px solid var(--fr-border)',
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
  const stats = useMemo(() => {
    // Math.max(...[]) restituisce -Infinity: con la lista vuota (dati non ancora
    // caricati o query a vuoto) finiva a schermo come "-Infinity".
    const maxWinner = drivers.reduce(
      (acc, d) => (d.total_race_wins || 0) > (acc?.total_race_wins || 0) ? d : acc,
      null,
    );
    return {
      total:   drivers.length,
      champs:  drivers.filter(d => d.total_championship_wins > 0).length,
      maxWins: maxWinner?.total_race_wins ?? 0,
      maxWinner,
    };
  }, [drivers]);
 
  const seo = {
    title: 'Piloti di Formula 1',
    description: 'Tutti i piloti di Formula 1: vittorie, pole position, campionati e statistiche complete.',
    path: '/piloti',
  };

  return (
    <PageShell seo={seo} wide>
        <div style={{ opacity: mounted ? 1 : 0, transition: 'opacity .5s ease' }}>
 
          {/* ── HERO HEADER ── */}
          <header style={{ marginBottom:'48px', animation:'fadeUp .6s ease both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--fr-red)', animation:'pulse 2s infinite' }}/>
              <span style={{ fontSize:'10px', color:'var(--fr-red)', fontFamily:'monospace', fontWeight:'800', letterSpacing:'2.5px' }}>
                F1 DRIVERS DATABASE · {loading ? '…' : drivers.length} PILOTI
              </span>
            </div>
            <h1 style={{
              margin:0, fontFamily:'var(--font-head)',
              fontSize:'clamp(52px,8vw,96px)', fontWeight:'400',
              letterSpacing:'4px', lineHeight:1,
            }}>
              I PILOTI <span style={{ color:'var(--fr-red)' }}>DELLA STORIA</span>
            </h1>
            <p style={{ margin:'14px 0 0', fontSize:'12px', fontFamily:'monospace', color:'var(--fr-text-faint)', letterSpacing:'1px' }}>
              Vittorie, pole position, campionati e ogni record del Mondiale F1
            </p>
 
            {/* Stats globali */}
            {!loading && (
              <div style={{
                display:'flex', gap:'32px', flexWrap:'wrap',
                marginTop:'28px', paddingTop:'24px',
                borderTop:'1px solid var(--fr-border)',
              }}>
                {[
                  { label:'Campioni del mondo', value: stats.champs },
                  { label:'Piloti totali',       value: stats.total },
                  { label:'Record vittorie',     value: `${stats.maxWins}`, sub: stats.maxWinner?.last_name },
                ].map(s=>(
                  <div key={s.label}>
                    <div style={{ display:'flex', alignItems:'baseline', gap:'6px' }}>
                      <span style={{ fontSize:'26px', fontWeight:'900', fontFamily:'monospace', color:'var(--fr-text)' }}>{s.value}</span>
                      {s.sub && <span style={{ fontSize:'11px', color:'var(--fr-text-faint)', fontFamily:'monospace' }}>{s.sub}</span>}
                    </div>
                    <div style={{ fontSize:'9px', color:'var(--fr-text-faint)', fontFamily:'monospace', letterSpacing:'1px', textTransform:'uppercase', marginTop:'2px' }}>{s.label}</div>
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
                <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'13px', color:'var(--fr-text-faint)', pointerEvents:'none' }}>🔍</span>
                <input
                  value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Cerca pilota, nazionalità, numero…"
                  style={{
                    width:'100%', background:'var(--fr-overlay)',
                    border:'1px solid var(--fr-border)', borderRadius:'4px',
                    padding:'10px 36px', fontSize:'12px', fontFamily:'monospace',
                    color:'var(--fr-text)', outline:'none', transition:'border-color .2s',
                  }}
                  onFocus={e=>e.target.style.borderColor='rgba(220,38,38,.5)'}
                  onBlur={e=>e.target.style.borderColor='var(--fr-border)'}
                />
                {search && (
                  <button onClick={()=>setSearch('')} style={{
                    position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', color:'var(--fr-text-faint)', cursor:'pointer', fontSize:'16px',
                  }}>×</button>
                )}
              </div>
 
              {/* Champion filter toggle */}
              <button onClick={()=>setChampOnly(v=>!v)} style={{
                padding:'9px 16px', borderRadius:'4px', cursor:'pointer',
                fontSize:'9px', fontFamily:'monospace', fontWeight:'800',
                letterSpacing:'1.5px', textTransform:'uppercase',
                border: champOnly ? '1px solid #fbbf24' : '1px solid var(--fr-border)',
                background: champOnly ? 'rgba(251,191,36,.12)' : 'var(--fr-overlay)',
                color: champOnly ? 'var(--fr-accent-amber)' : 'var(--fr-text-faint)',
                transition:'all .2s',
                display:'flex', alignItems:'center', gap:'6px',
              }}>
                🏆 {champOnly ? 'Solo campioni' : 'Tutti i piloti'}
              </button>
 
              {/* Era pills */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {eras.map(e => {
                  const meta = e==='all' ? {color:'var(--fr-red)'} : ERA_META[e];
                  const active = eraFilter===e;
                  return (
                    <button key={e} onClick={()=>setEraFilter(e)} style={{
                      padding:'7px 12px', borderRadius:'3px', cursor:'pointer',
                      fontSize:'9px', fontFamily:'monospace', fontWeight:'800',
                      letterSpacing:'1px', textTransform:'uppercase',
                      border: `1px solid ${active ? meta?.color : 'var(--fr-text-faint)'}`,
                      background: active ? alone(meta?.color) : 'var(--fr-overlay)',
                      color: active ? meta?.color : 'var(--fr-text-muted)',
                      transition:'all .2s',
                    }}>{e==='all' ? `Tutti` : e}</button>
                  );
                })}
              </div>
 
              {/* Sort */}
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{
                background:'var(--fr-overlay)', border:'1px solid var(--fr-border)',
                borderRadius:'4px', padding:'9px 14px', fontSize:'11px',
                fontFamily:'monospace', color:'var(--fr-text-faint)', outline:'none', cursor:'pointer',
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
            <div style={{ padding:'16px 20px', borderRadius:'4px', border:'1px solid rgba(220,38,38,.3)', background:'rgba(220,38,38,.06)', color:'var(--fr-red-ink)', fontFamily:'monospace', fontSize:'13px', marginBottom:'24px' }}>
              ⚠ Errore: {error}
            </div>
          )}
 
          {/* ── SKELETON ── */}
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {Array.from({length:12}).map((_,i)=>(
                <div key={i} style={{
                  height:'72px', borderRadius:'4px',
                  border:'1px solid var(--fr-overlay)',
                  background:'var(--fr-surface-3)',
                  overflow:'hidden', position:'relative',
                }}>
                  <div style={{
                    position:'absolute', inset:0,
                    background:'linear-gradient(90deg,transparent,var(--fr-overlay),transparent)',
                    animation:'shimmer 1.5s infinite',
                  }}/>
                </div>
              ))}
            </div>
          )}
 
          {/* ── EMPTY ── */}
          {!loading && filtered.length===0 && !error && (
            <div style={{ textAlign:'center', padding:'80px 0', color:'var(--fr-text-faint)', fontFamily:'monospace' }}>
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
                fontSize:'8px', color:'var(--fr-text-faint)',
                fontFamily:'monospace', letterSpacing:'1.5px', textTransform:'uppercase',
                borderBottom:'1px solid var(--fr-border)',
                background:'var(--fr-surface-2)',
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
              fontSize:'10px', color:'var(--fr-text-faint)',
              fontFamily:'monospace', letterSpacing:'2px',
            }}>
              {filtered.length} / {drivers.length} PILOTI
            </p>
          )}
 
        </div>
    </PageShell>
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
            ? `1px solid ${isChamp ? 'rgba(220,38,38,.35)' : 'var(--fr-border)'}`
            : '1px solid var(--fr-overlay)',
          background: hovered
            ? (isChamp ? 'var(--fr-red-soft)' : 'var(--fr-surface-2)')
            : 'var(--fr-surface)',
          cursor:'pointer', transition:'all .18s ease',
          position:'relative',
        }}
      >
        {/* Rank */}
        <div style={{
          fontSize:'11px', fontFamily:'monospace', fontWeight:'800',
          color: rank <= 3 ? 'var(--fr-red)' : 'var(--fr-text-faint)',
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
                fontSize:'14px', fontWeight:'800', color: hovered ? 'var(--fr-text)' : 'var(--fr-text-muted)',
                fontFamily:"'Source Serif 4',Georgia,serif",
                transition:'color .18s',
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              }}>{d.full_name}</span>
              {isChamp && (
                <span style={{
                  fontSize:'8px', fontFamily:'monospace', fontWeight:'800',
                  padding:'2px 6px', borderRadius:'2px',
                  background:'rgba(220,38,38,.15)', color:'var(--fr-red)',
                  border:'1px solid rgba(220,38,38,.3)', letterSpacing:'1px',
                  whiteSpace:'nowrap',
                }}>
                  {d.total_championship_wins}× 🏆
                </span>
              )}
              {isDead && (
                <span style={{ fontSize:'8px', color:'var(--fr-text-faint)', fontFamily:'monospace' }}>†</span>
              )}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'2px' }}>
              {flag && (
                <img src={`https://flagcdn.com/w20/${flag}.png`} alt={d.nationality_country_id}
                  style={{ width:'16px', height:'10px', objectFit:'cover', borderRadius:'1px', opacity:.7 }}/>
              )}
              <span style={{ fontSize:'10px', color:'var(--fr-text-faint)', fontFamily:'monospace' }}>
                {d.nationality_country_id?.replace(/-/g,' ')}
                {age && <span style={{ marginLeft:'8px' }}>{isDead ? `† età ${age}` : `${age} anni`}</span>}
              </span>
              <span style={{
                fontSize:'8px', padding:'1px 6px', borderRadius:'2px',
                background: alone(era.color), color: era.color,
                border: `1px solid ${alone(era.color, 35)}`,
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
                ? (val > 0 ? 'var(--fr-red)' : 'var(--fr-text-dim)')
                : (val > 0 ? 'var(--fr-text-muted)' : 'var(--fr-border-strong)'),
              transition:'color .18s',
            }}>
              {val ?? '—'}
            </span>
          </div>
        ))}
 
        {/* Hover right arrow */}
        <div style={{
          position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)',
          fontSize:'12px', color:'var(--fr-red)',
          opacity: hovered ? 1 : 0, transition:'opacity .18s',
          pointerEvents:'none',
        }}>→</div>
      </article>
    </Link>
  );
}
