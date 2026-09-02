// pages/piloti/[slug].jsx
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import PageShell, { PageLoading, PageError } from '../../components/ui/PageShell';
import { getFlagCode } from '../../lib/flags';
import { driverPhoto, inquadratura } from '../../lib/driverPhoto';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('it-IT', { day:'numeric', month:'long', year:'numeric' });
}
function calcAge(dob, dod) {
  if (!dob) return null;
  const end = dod ? new Date(dod) : new Date();
  let age = end.getFullYear() - new Date(dob).getFullYear();
  const m = end.getMonth() - new Date(dob).getMonth();
  if (m<0||(m===0&&end.getDate()<new Date(dob).getDate())) age--;
  return age;
}
 
// Barra progresso lettura
function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(()=>{
    const h=()=>{
      const el=document.documentElement;
      const top=el.scrollTop||document.body.scrollTop;
      const h=el.scrollHeight-el.clientHeight;
      setP(h>0?(top/h)*100:0);
    };
    window.addEventListener('scroll',h,{passive:true});
    return ()=>window.removeEventListener('scroll',h);
  },[]);
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:9999, height:'2px', background:'rgba(0,0,0,.5)' }}>
      <div style={{ height:'100%', width:`${p}%`, background:'linear-gradient(90deg,var(--fr-red),var(--fr-red-ink))', transition:'width .1s linear' }}/>
    </div>
  );
}
 
// Grande avatar con iniziali
function HeroAvatar({ driver }) {
  const initials = `${driver.first_name?.[0]||''}${driver.last_name?.[0]||''}`.toUpperCase();
  const isChamp  = driver.total_championship_wins > 0;
  const size = 140;
  const foto = driverPhoto(driver.id, `${driver.first_name || ''} ${driver.last_name || ''}`);
  const [rotta, setRotta] = useState(false);
  return (
    <div style={{ position:'relative', flexShrink:0 }}>
      <div style={{
        width:size, height:size, borderRadius:'50%',
        background: isChamp
          ? 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 40%, var(--fr-red) 100%)'
          : 'linear-gradient(135deg, var(--fr-surface-2) 0%, var(--fr-surface-3) 100%)',
        border: isChamp ? '3px solid rgba(220,38,38,.6)' : '2px solid var(--fr-border)',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow: isChamp ? '0 0 40px rgba(220,38,38,.3), 0 0 80px rgba(220,38,38,.1)' : 'var(--fr-shadow-sm)',
        position:'relative', zIndex:1,
      }}>
        {/* Le iniziali stanno sotto: restano se la foto non c'è o non carica. */}
        <span style={{
          position:'absolute', inset:0, borderRadius:'50%', overflow:'hidden',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <span style={{
            fontSize:'52px', fontWeight:'900', fontFamily:'monospace',
            color: isChamp ? 'var(--fr-text)' : 'var(--fr-text-faint)',
            letterSpacing:'-2px',
          }}>{initials}</span>
          {foto && !rotta && (
            <img src={foto} alt="" onError={() => setRotta(true)} style={inquadratura(foto)} />
          )}
        </span>
      </div>
      {/* Numero permanente */}
      {driver.permanent_number && (
        <div style={{
          position:'absolute', bottom:'-6px', right:'-6px',
          background:'var(--fr-red)', color:'var(--fr-text)',
          fontSize:'18px', fontWeight:'900', fontFamily:'monospace',
          padding:'4px 10px', borderRadius:'4px',
          border:'2px solid var(--fr-bg)',
          lineHeight:1.3, zIndex:2,
        }}>{driver.permanent_number}</div>
      )}
      {/* Anello glow per campioni */}
      {isChamp && (
        <div style={{
          position:'absolute', inset:'-8px', borderRadius:'50%',
          border:'1px solid rgba(220,38,38,.2)',
          animation:'ringpulse 3s ease infinite',
        }}/>
      )}
    </div>
  );
}
 
// Stat card grande per hero
function BigStat({ label, value, accent, sub }) {
  return (
    <div style={{
      padding:'16px 20px', borderRadius:'4px',
      border: accent ? '1px solid rgba(220,38,38,.25)' : '1px solid var(--fr-border)',
      background: accent ? 'rgba(220,38,38,.08)' : 'var(--fr-surface-3)',
      textAlign:'center',
    }}>
      <div style={{
        fontSize:'36px', fontWeight:'900', fontFamily:'monospace',
        color: accent ? 'var(--fr-red)' : 'var(--fr-text)', lineHeight:1,
      }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize:'9px', color:'var(--fr-text-faint)', fontFamily:'monospace', marginTop:'2px' }}>{sub}</div>}
      <div style={{
        fontSize:'8px', color:'var(--fr-text-faint)',
        fontFamily:'monospace', letterSpacing:'1.5px',
        textTransform:'uppercase', marginTop:'6px',
      }}>{label}</div>
    </div>
  );
}
 
// Barra statistica con percentuale
function StatBar({ label, value, max, color='var(--fr-red)' }) {
  const pct = max > 0 ? Math.min(100, (value/max)*100) : 0;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:'11px', color:'var(--fr-text-faint)', fontFamily:'monospace' }}>{label}</span>
        <span style={{ fontSize:'13px', fontWeight:'800', fontFamily:'monospace', color:'var(--fr-text)' }}>{value ?? 0}</span>
      </div>
      <div style={{ height:'3px', background:'var(--fr-border)', borderRadius:'2px', overflow:'hidden' }}>
        <div style={{
          height:'100%', width:`${pct}%`,
          background: color,
          borderRadius:'2px',
          transition:'width 1s ease',
        }}/>
      </div>
    </div>
  );
}
 
export default function DriverDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [driver,  setDriver]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState('stats');
  const [mounted, setMounted] = useState(false);
 
  useEffect(()=>{ setMounted(true); },[]);
 
  useEffect(()=>{
    if (!slug) return;
    async function fetchDriver() {
      setLoading(true);
      const { data, error } = await supabase
        .from('driver')
        .select('*')
        .eq('id', slug)
        .single();
      if (error) setError(error.message);
      else setDriver(data);
      setLoading(false);
    }
    fetchDriver();
  }, [slug]);
 
  if (loading) return (
    <PageShell><PageLoading label="Caricamento pilota…" /></PageShell>
  );
 
  if (error||!driver) return (
    <PageShell>
      <PageError title="Pilota non trovato" message={error || 'Il pilota richiesto non è presente in archivio.'} />
      <p className="text-center"><Link href="/piloti" className="btn btn-outline">← Tutti i piloti</Link></p>
    </PageShell>
  );
 
  const flag    = getFlagCode(driver.nationality_country_id||'');
  const age     = calcAge(driver.date_of_birth, driver.date_of_death);
  const isDead  = !!driver.date_of_death;
  const isChamp = driver.total_championship_wins > 0;
  const TABS    = [
    { id:'stats',   label:'Statistiche' },
    { id:'info',    label:'Biografia'   },
  ];
 
  // Rate stats per le barre
  const winRate = driver.total_race_starts > 0
    ? ((driver.total_race_wins / driver.total_race_starts)*100).toFixed(1)
    : 0;
  const podiumRate = driver.total_race_starts > 0
    ? ((driver.total_podiums / driver.total_race_starts)*100).toFixed(1)
    : 0;
 
  const seo = {
    title: driver.full_name,
    description: `Statistiche e biografia di ${driver.full_name}: ${driver.total_race_wins} vittorie e ${driver.total_championship_wins} titoli mondiali.`,
    path: `/piloti/${slug}`,
  };

  return (
    <PageShell seo={seo}>
      <ReadingProgress/>
      <div style={{ opacity: mounted ? 1 : 0, transition:'opacity .45s ease' }}>
 
          {/* ── BREADCRUMB ── */}
          <nav style={{ marginBottom:'32px', display:'flex', alignItems:'center', gap:'10px', animation:'fadeUp .5s ease both' }}>
            <Link href="/piloti" style={{
              color:'var(--fr-text-faint)', textDecoration:'none',
              fontSize:'11px', fontFamily:'monospace', letterSpacing:'.5px',
              display:'flex', alignItems:'center', gap:'6px', transition:'color .2s',
            }}
              onMouseEnter={e=>e.currentTarget.style.color='var(--fr-red)'}
              onMouseLeave={e=>e.currentTarget.style.color='var(--fr-text-dim)'}
            >← PILOTI</Link>
            <span style={{ color:'var(--fr-text-faint)', fontSize:'11px' }}>/</span>
            <span style={{ fontSize:'11px', color:'var(--fr-text-faint)', fontFamily:'monospace' }}>{driver.abbreviation}</span>
          </nav>
 
          {/* ── HERO ── */}
          <header style={{ marginBottom:'40px', animation:'fadeUp .5s .05s ease both', opacity:0 }}>
            {/* Sfondo decorativo */}
            <div style={{
              position:'relative', borderRadius:'6px', overflow:'hidden',
              border:`1px solid ${isChamp ? 'rgba(220,38,38,.2)' : 'var(--fr-border)'}`,
              background: isChamp
                ? 'linear-gradient(135deg, var(--fr-surface) 0%, var(--fr-red-soft) 100%)'
                : 'var(--fr-surface-3)',
              padding:'32px',
            }}>
              {/* Pattern decorativo */}
              <div style={{
                position:'absolute', inset:0, pointerEvents:'none',
                backgroundImage:`repeating-linear-gradient(-55deg, transparent, transparent 20px, rgba(220,38,38,.02) 20px, rgba(220,38,38,.02) 40px)`,
              }}/>
              {/* Glow campione */}
              {isChamp && (
                <div style={{
                  position:'absolute', inset:0, pointerEvents:'none',
                  background:'radial-gradient(ellipse at 15% 50%, rgba(220,38,38,.12) 0%, transparent 60%)',
                }}/>
              )}
 
              <div style={{ position:'relative', zIndex:1, display:'flex', gap:'28px', alignItems:'flex-start', flexWrap:'wrap' }}>
                <HeroAvatar driver={driver}/>
 
                <div style={{ flex:1, minWidth:'200px' }}>
                  {/* Tags */}
                  <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'12px' }}>
                    {isChamp && (
                      <span style={{
                        fontSize:'9px', fontFamily:'monospace', fontWeight:'800',
                        padding:'3px 10px', borderRadius:'2px', letterSpacing:'1.5px',
                        background:'rgba(220,38,38,.15)', color:'var(--fr-red)',
                        border:'1px solid rgba(220,38,38,.35)',
                      }}>🏆 {driver.total_championship_wins}× CAMPIONE DEL MONDO</span>
                    )}
                    {driver.permanent_number && (
                      <span style={{
                        fontSize:'9px', fontFamily:'monospace', fontWeight:'800',
                        padding:'3px 10px', borderRadius:'2px', letterSpacing:'1px',
                        background:'var(--fr-overlay)', color:'var(--fr-text-faint)',
                        border:'1px solid var(--fr-border)',
                      }}>#{driver.permanent_number}</span>
                    )}
                    {isDead && (
                      <span style={{
                        fontSize:'9px', fontFamily:'monospace', fontWeight:'800',
                        padding:'3px 10px', borderRadius:'2px', letterSpacing:'1px',
                        background:'var(--fr-surface-2)', color:'var(--fr-text-faint)',
                        border:'1px solid var(--fr-border)',
                      }}>†</span>
                    )}
                  </div>
 
                  {/* Nome */}
                  <h1 style={{
                    margin:'0 0 6px',
                    fontFamily:'var(--font-head)',
                    fontSize:'clamp(36px,6vw,64px)',
                    fontWeight:'400', letterSpacing:'3px', lineHeight:1, color:'var(--fr-text)',
                  }}>{driver.full_name}</h1>
 
                  {/* Abbreviazione */}
                  <div style={{
                    fontSize:'13px', fontFamily:'monospace', fontWeight:'800',
                    color:'var(--fr-text-faint)', letterSpacing:'3px', marginBottom:'14px',
                  }}>{driver.abbreviation}</div>
 
                  {/* Nazione */}
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                    {flag && (
                      <img src={`https://flagcdn.com/w20/${flag}.png`} alt={driver.nationality_country_id}
                        style={{ width:'20px', height:'13px', objectFit:'cover', borderRadius:'2px', opacity:.8 }}/>
                    )}
                    <span style={{ fontSize:'12px', color:'var(--fr-text-faint)', fontFamily:'monospace', textTransform:'capitalize' }}>
                      {driver.nationality_country_id?.replace(/-/g,' ')}
                    </span>
                  </div>
 
                  {/* Nascita / Morte */}
                  <div style={{ fontSize:'11px', color:'var(--fr-text-faint)', fontFamily:'monospace' }}>
                    {formatDate(driver.date_of_birth)}
                    {driver.date_of_death && ` — † ${formatDate(driver.date_of_death)}`}
                    {age && <span style={{ marginLeft:'8px', color:'var(--fr-text-faint)' }}>({isDead ? `† ${age} anni` : `${age} anni`})</span>}
                  </div>
 
                  {driver.place_of_birth && (
                    <div style={{ fontSize:'11px', color:'var(--fr-text-faint)', fontFamily:'monospace', marginTop:'3px' }}>
                      📍 {driver.place_of_birth}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
 
          {/* ── BIG STATS ── */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',
            gap:'10px', marginBottom:'40px',
            animation:'fadeUp .5s .1s ease both', opacity:0,
          }}>
            <BigStat label="Vittorie"    value={driver.total_race_wins}        accent={driver.total_race_wins > 0}/>
            <BigStat label="Campionati"  value={driver.total_championship_wins} accent={isChamp}/>
            <BigStat label="Podi"        value={driver.total_podiums}/>
            <BigStat label="Pole"        value={driver.total_pole_positions}/>
            <BigStat label="Giri veloci" value={driver.total_fastest_laps}/>
            <BigStat label="Gare"        value={driver.total_race_starts}/>
          </div>
 
          {/* ── TABS ── */}
          <div style={{
            display:'flex', gap:'2px',
            borderBottom:'1px solid var(--fr-border)',
            marginBottom:'28px',
            animation:'fadeUp .5s .15s ease both', opacity:0,
          }}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                padding:'10px 20px', background:'none', border:'none', cursor:'pointer',
                fontSize:'11px', fontFamily:'monospace', fontWeight:'800',
                letterSpacing:'1px', textTransform:'uppercase',
                color: tab===t.id ? 'var(--fr-text)' : 'var(--fr-text-faint)',
                borderBottom: tab===t.id ? '2px solid var(--fr-red)' : '2px solid transparent',
                marginBottom:'-1px', transition:'all .18s',
              }}>{t.label}</button>
            ))}
          </div>
 
          {/* ── TAB: STATISTICHE ── */}
          {tab==='stats' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'16px', animation:'fadeUp .4s ease both' }}>
 
              {/* Barre performance */}
              <div style={{
                padding:'24px', borderRadius:'4px',
                border:'1px solid var(--fr-border)',
                background:'var(--fr-surface-3)',
              }}>
                <h2 style={{
                  margin:'0 0 20px', fontSize:'9px',
                  color:'var(--fr-text-faint)', fontFamily:'monospace',
                  letterSpacing:'2.5px', textTransform:'uppercase',
                }}>Performance in gara</h2>
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  <StatBar label="Vittorie"      value={driver.total_race_wins}       max={105}  color='var(--fr-red)'/>
                  <StatBar label="Podi"          value={driver.total_podiums}         max={200}  color='var(--fr-red)'/>
                  <StatBar label="Pole Position" value={driver.total_pole_positions}  max={105}  color='var(--fr-red-ink)'/>
                  <StatBar label="Giri veloci"   value={driver.total_fastest_laps}    max={80}   color='var(--fr-accent-orange)'/>
                  <StatBar label="Grand Slam"    value={driver.total_grand_slams}     max={10}   color='var(--fr-accent-amber)'/>
                </div>
              </div>
 
              {/* Percentuali */}
              <div style={{
                display:'grid', gridTemplateColumns:'1fr 1fr',
                gap:'10px',
              }}>
                {[
                  { label:'Win rate',    value:`${winRate}%`,    sub:`${driver.total_race_wins} vittorie su ${driver.total_race_starts} gare` },
                  { label:'Podium rate', value:`${podiumRate}%`, sub:`${driver.total_podiums} podi su ${driver.total_race_starts} gare` },
                ].map(s=>(
                  <div key={s.label} style={{
                    padding:'18px 20px', borderRadius:'4px',
                    border:'1px solid var(--fr-border)',
                    background:'var(--fr-surface-3)',
                  }}>
                    <div style={{ fontSize:'28px', fontWeight:'900', fontFamily:'monospace', color:'var(--fr-red)', lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'9px', color:'var(--fr-text-faint)', fontFamily:'monospace', letterSpacing:'1px', textTransform:'uppercase', marginTop:'6px' }}>{s.label}</div>
                    <div style={{ fontSize:'10px', color:'var(--fr-text-faint)', fontFamily:'monospace', marginTop:'4px' }}>{s.sub}</div>
                  </div>
                ))}
              </div>
 
              {/* Tabella completa stats */}
              <div style={{
                padding:'24px', borderRadius:'4px',
                border:'1px solid var(--fr-border)',
                background:'var(--fr-surface-3)',
              }}>
                <h2 style={{
                  margin:'0 0 16px', fontSize:'9px',
                  color:'var(--fr-text-faint)', fontFamily:'monospace',
                  letterSpacing:'2.5px', textTransform:'uppercase',
                }}>Statistiche complete</h2>
                {(() => {
                  const rows = [
                    { label:'Gare disputate',         value: driver.total_race_starts,              icon:'🏁' },
                    { label:'Gare iscritto',           value: driver.total_race_entries,             icon:'📋' },
                    { label:'Vittorie',                value: driver.total_race_wins,                icon:'🥇' },
                    { label:'Podi',                    value: driver.total_podiums,                  icon:'🏆' },
                    { label:'Pole position',           value: driver.total_pole_positions,           icon:'⚡' },
                    { label:'Giri veloci',             value: driver.total_fastest_laps,             icon:'⏱' },
                    { label:'Campionati vinti',        value: driver.total_championship_wins,        icon:'👑' },
                    { label:'Punti totali',            value: driver.total_points,                   icon:'📊' },
                    { label:'Punti in campionato',     value: driver.total_championship_points,      icon:'📈' },
                    { label:'Giri percorsi',           value: driver.total_race_laps?.toLocaleString('it-IT'), icon:'🔄' },
                    { label:'Miglior pos. campionato', value: driver.best_championship_position,     icon:'🎯' },
                    { label:'Miglior pos. in griglia', value: driver.best_starting_grid_position,    icon:'🚦' },
                    { label:'Miglior risultato gara',  value: driver.best_race_result,               icon:'🏎' },
                    { label:'Sprint race disputate',   value: driver.total_sprint_race_starts,       icon:'⚡' },
                    { label:'Sprint race vinte',       value: driver.total_sprint_race_wins,         icon:'🥇' },
                    { label:'Driver of the Day',       value: driver.total_driver_of_the_day,        icon:'⭐' },
                    { label:'Grand Slam',              value: driver.total_grand_slams,              icon:'💎' },
                    { label:'Miglior sprint result',   value: driver.best_sprint_race_result ?? '—', icon:'🏅' },
                  ];
 
                  return (
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom:'2px solid rgba(220,38,38,.3)' }}>
                          {['Statistica','Valore','Statistica','Valore'].map((h,i)=>(
                            <th key={i} style={{
                              padding:'8px 12px',
                              fontSize:'8px', fontFamily:'monospace', fontWeight:'800',
                              letterSpacing:'2px', textTransform:'uppercase',
                              color:'var(--fr-text-faint)',
                              textAlign: i%2===0 ? 'left' : 'right',
                              background:'var(--fr-surface)',
                              ...(i===2 ? {borderLeft:'1px solid var(--fr-border)', paddingLeft:'20px'} : {}),
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: Math.ceil(rows.length / 2) }).map((_, i) => {
                          const l = rows[i];
                          const r = rows[i + Math.ceil(rows.length / 2)];
                          const isEven = i % 2 === 0;
                          const rowBg = isEven ? 'var(--fr-surface-3)' : 'var(--fr-surface)';
                          return (
                            <tr key={i} style={{ background: rowBg }}>
                              {/* Label sinistra */}
                              <td style={{
                                padding:'11px 12px',
                                fontSize:'11px', fontFamily:'monospace',
                                color:'var(--fr-text-faint)',
                                borderBottom:'1px solid var(--fr-overlay)',
                              }}>
                                <span style={{ marginRight:'7px', fontSize:'12px' }}>{l?.icon}</span>
                                {l?.label}
                              </td>
                              {/* Valore sinistra */}
                              <td style={{
                                padding:'11px 12px',
                                fontSize:'14px', fontWeight:'900', fontFamily:'monospace',
                                color: l?.value > 0 ? 'var(--fr-text)' : 'var(--fr-text-faint)',
                                textAlign:'right',
                                borderBottom:'1px solid var(--fr-overlay)',
                              }}>{l?.value ?? '—'}</td>
 
                              {/* Label destra */}
                              <td style={{
                                padding:'11px 12px 11px 20px',
                                fontSize:'11px', fontFamily:'monospace',
                                color:'var(--fr-text-faint)',
                                borderBottom:'1px solid var(--fr-overlay)',
                                borderLeft:'1px solid var(--fr-border)',
                              }}>
                                {r && <><span style={{ marginRight:'7px', fontSize:'12px' }}>{r.icon}</span>{r.label}</>}
                              </td>
                              {/* Valore destra */}
                              <td style={{
                                padding:'11px 12px',
                                fontSize:'14px', fontWeight:'900', fontFamily:'monospace',
                                color: r?.value > 0 ? 'var(--fr-text)' : 'var(--fr-text-faint)',
                                textAlign:'right',
                                borderBottom:'1px solid var(--fr-overlay)',
                              }}>{r?.value ?? ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
          )}
 
          {/* ── TAB: BIOGRAFIA ── */}
          {tab==='info' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', animation:'fadeUp .4s ease both' }}>
              <div style={{
                padding:'24px', borderRadius:'4px',
                border:'1px solid var(--fr-border)',
                background:'var(--fr-surface-3)',
              }}>
                <h2 style={{
                  margin:'0 0 16px', fontSize:'9px',
                  color:'var(--fr-text-faint)', fontFamily:'monospace',
                  letterSpacing:'2.5px', textTransform:'uppercase',
                }}>Dati anagrafici</h2>
                <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
                  {[
                    { label:'Nome completo',    value: driver.full_name },
                    { label:'Abbreviazione',    value: driver.abbreviation },
                    { label:'Genere',           value: driver.gender },
                    { label:'Data di nascita',  value: formatDate(driver.date_of_birth) },
                    { label:'Luogo di nascita', value: driver.place_of_birth },
                    { label:'Nazionalità',      value: driver.nationality_country_id?.replace(/-/g,' ') },
                    { label:'Paese di nascita', value: driver.country_of_birth_country_id?.replace(/-/g,' ') },
                    ...(driver.second_nationality_country_id
                      ? [{ label:'Seconda nazionalità', value: driver.second_nationality_country_id?.replace(/-/g,' ') }]
                      : []
                    ),
                    ...(isDead
                      ? [{ label:'Data di morte', value: formatDate(driver.date_of_death) },
                         { label:'Età al decesso', value: age ? `${age} anni` : '—' }]
                      : [{ label:'Età attuale', value: age ? `${age} anni` : '—' }]
                    ),
                  ].map(({label, value})=>(
                    <div key={label} style={{
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                      padding:'11px 0',
                      borderBottom:'1px solid var(--fr-overlay)',
                    }}>
                      <span style={{ fontSize:'11px', color:'var(--fr-text-faint)', fontFamily:'monospace' }}>{label}</span>
                      <span style={{ fontSize:'13px', fontWeight:'700', color:'var(--fr-text-muted)', textTransform:'capitalize' }}>
                        {value ?? '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
 
          {/* ── BACK ── */}
          <div style={{ marginTop:'48px', paddingTop:'24px', borderTop:'1px solid var(--fr-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <Link href="/piloti" style={{
              color:'var(--fr-red)', textDecoration:'none',
              fontSize:'11px', fontWeight:'800', fontFamily:'monospace',
              letterSpacing:'1px', textTransform:'uppercase',
              display:'flex', alignItems:'center', gap:'8px', transition:'gap .2s, color .2s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.gap='12px';e.currentTarget.style.color='var(--fr-red)';}}
              onMouseLeave={e=>{e.currentTarget.style.gap='8px';e.currentTarget.style.color='var(--fr-red)';}}
            >← Tutti i piloti</Link>
            <span style={{ fontSize:'10px', color:'var(--fr-text-faint)', fontFamily:'monospace' }}>formula-rossa.it</span>
          </div>
 
      </div>
    </PageShell>
  );
}
