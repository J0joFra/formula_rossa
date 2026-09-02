import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Trophy, Activity, ChevronRight, Globe2, Landmark,
} from 'lucide-react';
import PageShell, { PageHeader, PageLoading, StatTile } from '../components/ui/PageShell';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { countryConfig } from '../lib/f1/circuitFlags';
import {
  DarkTooltip, AccordionSection, TrophySVG, WinnerRow,
} from '../components/statistics/StatsUI';

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
const RED  = 'var(--fr-red)';
const GOLD = 'var(--fr-accent-amber)';

const POINTS_PERIODS = [
  { 
    name: '1950-1959', 
    color: 'var(--fr-red)', // Rosso Ferrari
    description: '8-6-4-3-2 · solo miglior risultato',
    start: 1950, 
    end: 1959,
    icon: '🏁'
  },
  { 
    name: '1960-1990', 
    color: 'var(--fr-accent-amber)', // Oro
    description: '9-6-4-3-2-1 · dal 1976 entrambi i piloti',
    start: 1960, 
    end: 1990,
    icon: '⭐'
  },
  { 
    name: '1991-2009', 
    color: 'var(--fr-accent-blue)', // Blu
    description: '10-6-4-3-2-1 · tutti i risultati',
    start: 1991, 
    end: 2009,
    icon: '🏆'
  },
  { 
    name: '2010-oggi', 
    color: 'var(--fr-accent-green)', // Verde
    description: '25-18-15-12-10-8-6-4-2-1 · sprint + giro veloce',
    start: 2010, 
    end: new Date().getFullYear(),
    icon: '⚡'
  }
];

/* Le sezioni qui sotto mostrano solo le prime righe di ogni classifica: il
   resto vive in /stats/[tipo], che finora non era raggiungibile da nessuna
   parte del sito. Questo è il ponte. */
function ClassificaCompleta({ href, children }) {
  return (
    <div className="mt-6 pt-4 border-t border-[var(--fr-border)]">
      <Link
        href={href}
        className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--fr-red)] hover:gap-3 transition-all"
      >
        {children}
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function StatisticsPage() {
  const [loading,        setLoading]        = useState(true);
  const [pilotWins,      setPilotWins]      = useState([]);
  const [history,        setHistory]        = useState([]);
  const [nationalities,  setNationalities]  = useState([]);
  const [circuits,       setCircuits]       = useState([]);
  const [poleStats,      setPoleStats]      = useState([]);   // NEW: pole positions per driver
  const [fastestLaps,    setFastestLaps]    = useState([]);   // NEW: fastest laps per driver
  const [champSeasons,   setChampSeasons]   = useState([]);   // NEW: championship winning seasons
  const [podiumDrivers,  setPodiumDrivers]  = useState([]);   // NEW: podiums per driver
  const [grandPrix,      setGrandPrix]      = useState([]);   // NEW: vittorie per GP
  const [seasonSummary,  setSeasonSummary]  = useState([]);   // NEW: riepilogo per stagione
  const [openSection,    setOpenSection]    = useState('winners');

  useEffect(() => {
    if (!supabase) return;
    async function loadData() {
      try {
        // Tutte le query ora usano le VIEW — una sola riga per query, zero join pesanti
        const [
          { data: wins },
          { data: pts },
          { data: nats },
          { data: gps },
          { data: poles },
          { data: fl },
          { data: champs },
          { data: pods },
          { data: seasons },
        ] = await Promise.all([
          supabase.from('ferrari_driver_wins').select('*'),
          supabase.from('ferrari_points_by_year').select('*'),
          supabase.from('ferrari_driver_nationalities').select('*'),
          supabase.from('ferrari_wins_by_grand_prix').select('*').limit(15),
          supabase.from('ferrari_driver_poles').select('*').limit(8),
          supabase.from('ferrari_driver_fastest_laps').select('*').limit(8),
          supabase.from('ferrari_championship_seasons').select('*'),
          supabase.from('ferrari_driver_podiums').select('*').limit(8),
          supabase.from('ferrari_season_summary').select('*').limit(20),
        ]);

        if (wins) setPilotWins(wins.slice(0, 10).map(d => ({ id: d.driver_id, name: d.full_name, count: d.wins })));

        if (pts) setHistory(pts.map(r => ({ year: r.year.toString(), points: r.points ?? 0 })));

        if (nats) {
          setNationalities(
            nats.map(r => {
              const cfg = countryConfig[r.country_id] || countryConfig['unknown'];
              return { id: r.country_id, name: cfg.name, value: r.driver_count, color: cfg.color, flag: cfg.code };
            })
          );
        }

        if (gps) {
          setGrandPrix(gps.map(g => ({
            name: g.grand_prix_name,
            wins: g.ferrari_wins,
            total: g.total_races_held,
            winRate: g.win_rate_pct,
            flag: countryConfig[g.country_id]?.code || '',
            color: countryConfig[g.country_id]?.color || RED,
          })));
        }

        if (poles) setPoleStats(poles.map(d => ({ id: d.driver_id, name: d.full_name, count: d.poles })));

        if (fl) setFastestLaps(fl.map(d => ({ id: d.driver_id, name: d.full_name, count: d.fastest_laps })));

        if (champs) setChampSeasons(champs);

        if (pods) setPodiumDrivers(pods.map(d => ({
          id: d.driver_id, name: d.full_name,
          wins: d.wins, p2: d.p2, p3: d.p3, total: d.total_podiums,
        })));

        if (seasons) setSeasonSummary(seasons);

      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggle = (id) => setOpenSection(openSection === id ? null : id);

  if (loading) return (
    <PageShell><PageLoading label="Caricamento archivio Ferrari…" /></PageShell>
  );

  const maxWins = pilotWins[0]?.count ?? 1;
  // Il 1950 è la prima stagione e va contato, come nel footer.
  const stagioni = new Date().getFullYear() - 1950 + 1;

  const seo = {
    title: 'Statistiche Ferrari in Formula 1',
    description: "Archivio storico della Scuderia Ferrari: vittorie, pole position, podi e record dal 1950 a oggi.",
    path: '/statistics',
  };

  return (
    <PageShell seo={seo}>

      <PageHeader
        eyebrow="Archivio"
        title="Statistiche"
        subtitle={`Le classifiche storiche della Scuderia dal 1950: chi ha vinto di più, dove, e come sono cambiati i numeri stagione dopo stagione. ${stagioni} stagioni di risultati di gara.`}
        breadcrumb={[{ label: 'Archivio' }, { label: 'Statistiche' }]}
      />

      {/* Quattro numeri di sintesi. Le vittorie e le pole sono somme di quello
          che le classifiche qui sotto mostrano riga per riga, quindi restano
          coerenti con la pagina invece di essere scritte a mano. */}
      <div className="grid grid-cols-2 md:grid-cols-4 rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] divide-x divide-y md:divide-y-0 divide-[var(--fr-border)] mb-8">
        <StatTile accent value={pilotWins.reduce((a, d) => a + d.count, 0).toLocaleString('it-IT')} label="Vittorie" />
        <StatTile value={pilotWins.length} label="Piloti vincitori" />
        <StatTile value={champSeasons.length} label="Titoli costruttori" />
        <StatTile value={poleStats.reduce((a, d) => a + d.count, 0).toLocaleString('it-IT')} label="Pole position" />
      </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col gap-3"
        >

          {/* WINNERS CIRCLE */}
          <AccordionSection id="winners" title="Vittorie per pilota" subtitle="Chi ha vinto di più con la Ferrari" icon={Trophy} isOpen={openSection==='winners'} onToggle={()=>toggle('winners')} accent="gold">
            <div className="flex items-center gap-4 md:gap-5 px-1 pt-4 pb-2">
              <div className="w-9 shrink-0" />
              <div className="w-10 md:w-12 shrink-0" />
              <div className="flex-1 text-[10px] font-black uppercase tracking-widest text-[var(--fr-text-faint)]">Pilota</div>
              <div className="w-14 text-[10px] font-black uppercase tracking-widest text-[var(--fr-text-faint)] text-right shrink-0">Totale</div>
            </div>
            <div>
              {pilotWins.map((driver, i) => (
                <WinnerRow key={driver.id} driver={driver} index={i} max={maxWins} />
              ))}
            </div>
            <ClassificaCompleta href="/stats/wins">Tutte le vittorie, pilota per pilota</ClassificaCompleta>
          </AccordionSection>

          {/* PERFORMANCE TIMELINE */}
          <AccordionSection id="timeline" title="Punti stagione per stagione" subtitle="Come cambiano i numeri al cambiare del punteggio" icon={Activity} isOpen={openSection==='timeline'} onToggle={()=>toggle('timeline')} accent="red">
            <div className="mt-6">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {POINTS_PERIODS.map((period) => (
                  <div 
                    key={period.name}
                    className="flex items-start gap-2 p-3 rounded-lg"
                    style={{ 
                      background: `${period.color}10`, 
                      border: `1px solid ${period.color}30`,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span className="text-lg" style={{ color: period.color }}>{period.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black uppercase" style={{ color: period.color }}>
                          {period.name}
                        </span>
                      </div>
                      <p className="text-[9px] text-[var(--fr-text-muted)] font-mono mt-1 leading-tight">
                        {period.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={history} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                    <defs>
                      {POINTS_PERIODS.map((period) => (
                        <linearGradient key={period.name} id={`gradient-${period.name}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={period.color} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={period.color} stopOpacity={0.4} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--fr-border)" vertical={false} />
                    <XAxis 
                      dataKey="year" 
                      stroke="var(--fr-border)" 
                      tick={{ fill: 'var(--fr-text-faint)', fontSize: 11, fontWeight: 900 }} 
                      axisLine={false} 
                      tickLine={false} 
                      tickMargin={12}
                    />
                    <YAxis 
                      stroke="var(--fr-border)" 
                      tick={{ fill: 'var(--fr-text-faint)', fontSize: 11, fontWeight: 900 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        const year = data.year;
                        const period = POINTS_PERIODS.find(p => year >= p.start && year <= p.end);
                        
                        const isCovidYear = year === 2020;
                  
                        return (
                          <DarkTooltip 
                            active={active} 
                            payload={payload} 
                            label={label} 
                            // Se è il 2020 usa l'arancione, altrimenti il colore del periodo
                            accentColor={isCovidYear ? '#F97316' : (period?.color || RED)}
                            extra={
                              <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-[var(--fr-border)]">
                                {isCovidYear && (
                                  <div className="mb-2 px-2 py-1.5 rounded bg-orange-500/10 border border-orange-500/30">
                                    <p className="text-[9px] font-black text-orange-500 uppercase leading-tight mb-0.5">
                                      ⚠️ Emergenza Sanitaria
                                    </p>
                                    <p className="text-[8px] text-[var(--fr-text-muted)] leading-tight">
                                      Campionato interrotto e ridotto per la pandemia di COVID-19.
                                    </p>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black" style={{ color: period?.color || RED }}>
                                    {period?.name || 'Anni'}
                                  </span>
                                  <span className="text-[8px] text-[var(--fr-text-muted)] font-mono">
                                    {period?.description || ''}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[var(--fr-text-muted)]">
                                  {data.points} punti totali
                                </p>
                              </div>
                            }
                          />
                        );
                      }}
                    />
                    <Bar 
                      dataKey="points" 
                      name="Punti" 
                      radius={[4, 4, 0, 0]}
                      barSize={24}
                      animationDuration={800}
                    >
                      {history.map((entry, index) => {
                        const period = POINTS_PERIODS.find(p => entry.year >= p.start && entry.year <= p.end);
                        const is2020 = entry.year === 2020;
                        
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            // Applica l'arancione se l'anno è il 2020
                            fill={is2020 ? '#F97316' : `url(#gradient-${period?.name || '2010-oggi'})`}
                            style={{ 
                              filter: `drop-shadow(0 0 ${is2020 ? '10px' : '4px'} ${is2020 ? '#F97316' : (period?.color || RED)}40)`,
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[12px] text-[var(--fr-text-faint)] text-center mt-4 italic border-t border-[var(--fr-border)] pt-3">
                ⚡ I punti riflettono i diversi sistemi di punteggio: 1950-59 (8 pt vittoria), 1960-90 (9 pt), 
                1991-2009 (10 pt), 2010-oggi (25 pt + sprint)
              </p>
            </div>
          </AccordionSection>

          {/* GLOBAL DNA */}
          <AccordionSection id="dna" title="Da dove vengono i piloti" subtitle="Nazionalità di chi ha corso per la Rossa" icon={Globe2} isOpen={openSection==='dna'} onToggle={()=>toggle('dna')} accent="red">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6 items-center">

              <div className="relative h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={nationalities} innerRadius={88} outerRadius={130} paddingAngle={2} dataKey="value" stroke="none">
                      {nationalities.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const p = payload[0].payload;
                        return (
                          <DarkTooltip
                            active={active}
                            payload={payload}
                            accentColor={p.color}
                            extra={
                              p.flag
                                ? <div className="flex items-center gap-2">
                                    <img src={`https://flagcdn.com/w40/${p.flag}.png`} className="w-5 h-3.5 object-cover rounded-sm" alt={p.name} />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--fr-text-muted)]">{p.name}</span>
                                  </div>
                                : null
                            }
                          />
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black">{nationalities.reduce((a,n) => a+n.value, 0)}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: RED }}>piloti totali</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {nationalities.map((n, i) => (
                  <motion.div key={n.id}
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl group hover:bg-[var(--fr-surface-2)] transition-colors"
                    style={{ border: '1px solid var(--fr-border)' }}
                  >
                    <div className="w-7 h-5 rounded-sm overflow-hidden shrink-0 border border-[var(--fr-border)]">
                      <img src={`https://flagcdn.com/w80/${n.flag}.png`} alt={n.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-tight text-[var(--fr-text-muted)] group-hover:text-[var(--fr-text)] transition-colors truncate">{n.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-px rounded-full overflow-hidden" style={{ background: 'var(--fr-surface-2)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(n.value / nationalities[0]?.value || 1) * 100}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05 + 0.2 }}
                            className="h-full rounded-full"
                            style={{ background: n.color }}
                          />
                        </div>
                        <span className="text-xs font-black tabular-nums" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{n.value}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </AccordionSection>

          {/* FORTRESS MARANELLO — Grand Prix wins */}
          <AccordionSection id="circuits" title="I Gran Premi della Ferrari" subtitle="Dove la Rossa ha vinto più spesso" icon={Landmark} isOpen={openSection==='circuits'} onToggle={()=>toggle('circuits')} accent="gold">
            <div className="mt-6 space-y-6">

              {/* GP chips */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {grandPrix.length > 0 ? grandPrix.map(g => (
                  <div key={g.name}
                    className="flex items-center gap-3 bg-[var(--fr-surface-2)] border border-[var(--fr-border)] p-3 rounded-2xl group hover:border-yellow-500/30 transition-all"
                  >
                    <div className="relative w-8 h-6 overflow-hidden rounded-sm shadow-sm shrink-0 border border-[var(--fr-border)]">
                      {g.flag && (
                        <img src={`https://flagcdn.com/w80/${g.flag}.png`} alt={g.name}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase text-[var(--fr-text)] truncate group-hover:text-yellow-400 transition-colors">
                        {(g.name || '—').replace(' Grand Prix', '').replace(' GP', '')}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1 w-12 rounded-full bg-[var(--fr-surface-2)] overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${(g.wins / (grandPrix[0]?.wins || 1)) * 100}%`, background: g.color || GOLD }} />
                        </div>
                        <span className="text-[10px] font-black" style={{ color: GOLD }}>{g.wins}</span>
                        <span className="text-[9px] text-[var(--fr-text-faint)] font-bold">/{g.total}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-5 text-center py-8 text-[var(--fr-text-faint)] text-xs">Nessun dato</div>
                )}
              </div>

              {/* Bar chart orizzontale con win rate */}
              <div className="h-[460px] w-full">
                {grandPrix.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={grandPrix} layout="vertical" margin={{ left: 8, right: 64, top: 4, bottom: 4 }}>
                      <XAxis type="number" stroke="var(--fr-border)"
                        tick={{ fill: 'var(--fr-text-faint)', fontSize: 11, fontWeight: 900 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={140}
                        stroke="var(--fr-border)"
                        tick={{ fill: 'var(--fr-text-muted)', fontSize: 10, fontWeight: 900 }}
                        tickFormatter={v => (v || '').replace(' Grand Prix', '').replace(' GP', '').toUpperCase()}
                        axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'var(--fr-overlay)' }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const g = payload[0].payload;
                          return (
                            <DarkTooltip active={active}
                              payload={[{ value: g.wins, name: 'vittorie', color: g.color || GOLD }]}
                              accentColor={g.color || GOLD}
                              extra={
                                <div className="flex items-center gap-3 mb-1">
                                  {g.flag && <img src={`https://flagcdn.com/w40/${g.flag}.png`} className="w-5 h-3.5 object-cover rounded-sm border border-[var(--fr-border)]" alt="" />}
                                  <div>
                                    <p className="text-[10px] font-black uppercase text-[var(--fr-text-muted)]">{g.name}</p>
                                    <p className="text-[9px] text-[var(--fr-text-faint)]">{g.winRate}% win rate · {g.total} gare totali</p>
                                  </div>
                                </div>
                              }
                            />
                          );
                        }}
                      />
                      <Bar dataKey="wins" radius={[0, 6, 6, 0]} barSize={18}>
                        {grandPrix.map((g, i) => (
                          <Cell key={i} fill={g.color || GOLD}
                            style={{ filter: `drop-shadow(0 0 4px ${(g.color || GOLD)}44)` }} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </AccordionSection>

          {/* SEASON BY SEASON — riepilogo stagioni recenti */}
          <AccordionSection id="seasons" title="Le ultime venti stagioni" subtitle="Punti, vittorie e piazzamenti anno per anno" icon={Activity} isOpen={openSection==='seasons'} onToggle={()=>toggle('seasons')} accent="red">
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-[var(--fr-text-faint)] border-b border-[var(--fr-border)]">
                    <th className="py-2 pr-4">Anno</th>
                    <th className="py-2 pr-4 text-right">Pos.</th>
                    <th className="py-2 pr-4 text-right">Vittorie</th>
                    <th className="py-2 pr-4 text-right">Podi</th>
                    <th className="py-2 pr-4 text-right">Pole</th>
                    <th className="py-2 pr-4 text-right">Giro V.</th>
                    <th className="py-2 text-right">Punti</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonSummary.map((s, i) => {
                    const isChamp = champSeasons.some(c => c.year === s.year);
                    return (
                      <tr key={s.year}
                        className="border-b border-[var(--fr-border)] hover:bg-[var(--fr-surface-2)] transition-colors group"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm" style={{ color: isChamp ? GOLD : 'white' }}>{s.year}</span>
                            {isChamp && <span className="text-[8px] font-black px-1.5 py-0.5 rounded" style={{ background: GOLD+'20', color: GOLD }}>🏆 CHAMP</span>}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span className={`font-black text-sm ${s.championship_position === 1 ? 'text-yellow-400' : s.championship_position <= 3 ? 'text-orange-400' : 'text-[var(--fr-text-faint)]'}`}>
                            {s.championship_position ?? '—'}°
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right font-black" style={{ color: s.wins > 0 ? RED : 'var(--fr-text-faint)' }}>{s.wins ?? 0}</td>
                        <td className="py-3 pr-4 text-right font-bold text-[var(--fr-text-muted)]">{s.podiums ?? 0}</td>
                        <td className="py-3 pr-4 text-right font-bold text-[var(--fr-text-faint)]">{s.poles ?? 0}</td>
                        <td className="py-3 pr-4 text-right font-bold text-[var(--fr-text-faint)]">{s.fastest_laps ?? 0}</td>
                        <td className="py-3 text-right font-black text-[var(--fr-text-muted)]">{s.points?.toLocaleString('it-IT') ?? 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </AccordionSection>

          {/* CHAMPIONSHIP SEASONS */}
          <AccordionSection id="championships" title="Titoli costruttori" subtitle="Le stagioni chiuse da campione" icon={Trophy} isOpen={openSection==='championships'} onToggle={()=>toggle('championships')} accent="gold">
            <div className="mt-6">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {champSeasons.map((s) => (
                  <div key={s.year}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors"
                  >
                    <span className="text-2xl font-black" style={{ color: GOLD }}>{s.year}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--fr-text-faint)] mt-1">{s.points} pts</span>
                  </div>
                ))}
              </div>
              {champSeasons.length === 0 && <p className="text-[var(--fr-text-faint)] text-xs text-center py-8">Nessun dato disponibile</p>}
            </div>
          </AccordionSection>

          {/* POLE POSITIONS */}
          <AccordionSection id="poles" title="Pole position per pilota" subtitle="Il miglior tempo in qualifica" icon={Activity} isOpen={openSection==='poles'} onToggle={()=>toggle('poles')} accent="red">
            <div className="mt-6 space-y-3">
              {poleStats.map((d, i) => {
                const pct = poleStats[0]?.count ? (d.count / poleStats[0].count) * 100 : 0;
                return (
                  <div key={d.id} className="flex items-center gap-4 group">
                    <span className="text-[10px] font-black w-5 text-right shrink-0"
                      style={{ color: i === 0 ? RED : 'var(--fr-text-faint)' }}>{i+1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black uppercase tracking-tight group-hover:text-red-400 transition-colors"
                          style={{ color: i === 0 ? RED : 'var(--fr-text)' }}>{d.name}</span>
                        <span className="text-sm font-black tabular-nums" style={{ color: i === 0 ? RED : 'var(--fr-text-muted)' }}>{d.count}</span>
                      </div>
                      <div className="h-1 rounded-full bg-[var(--fr-surface-2)] overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          style={{ background: i === 0 ? RED : 'rgba(220,0,0,0.4)' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <ClassificaCompleta href="/stats/poles">Tutte le pole position</ClassificaCompleta>
          </AccordionSection>

          {/* FASTEST LAPS */}
          <AccordionSection id="fastestlaps" title="Giri veloci per pilota" subtitle="Il giro più rapido in gara" icon={Activity} isOpen={openSection==='fastestlaps'} onToggle={()=>toggle('fastestlaps')} accent="red">
            <div className="mt-6 space-y-3">
              {fastestLaps.map((d, i) => {
                const pct = fastestLaps[0]?.count ? (d.count / fastestLaps[0].count) * 100 : 0;
                return (
                  <div key={d.id} className="flex items-center gap-4 group">
                    <span className="text-[10px] font-black w-5 text-right shrink-0"
                      style={{ color: i === 0 ? GOLD : 'var(--fr-text-faint)' }}>{i+1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black uppercase tracking-tight group-hover:text-yellow-400 transition-colors"
                          style={{ color: i === 0 ? GOLD : 'white' }}>{d.name}</span>
                        <span className="text-sm font-black tabular-nums" style={{ color: i === 0 ? GOLD : 'var(--fr-text-muted)' }}>{d.count}</span>
                      </div>
                      <div className="h-1 rounded-full bg-[var(--fr-surface-2)] overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          style={{ background: i === 0 ? GOLD : 'rgba(234,179,8,0.4)' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <ClassificaCompleta href="/stats/fastest-laps">Tutti i giri veloci</ClassificaCompleta>
          </AccordionSection>

          {/* PODIUM BREAKDOWN */}
          <AccordionSection id="podiums" title="Podi per pilota" subtitle="Come si distribuiscono primo, secondo e terzo posto" icon={Trophy} isOpen={openSection==='podiums'} onToggle={()=>toggle('podiums')} accent="gold">
            <div className="mt-6 space-y-4">
              {podiumDrivers.map((d, i) => (
                <div key={d.id} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-tight group-hover:text-red-400 transition-colors">{d.name}</span>
                    <span className="text-sm font-black tabular-nums text-[var(--fr-text-muted)]">{d.total} podi</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden gap-px">
                    {d.wins > 0 && (
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${(d.wins/d.total)*100}%` }}
                        transition={{ duration: 0.7, delay: i*0.05 }}
                        className="h-full rounded-l-full" style={{ background: RED, minWidth: 4 }} />
                    )}
                    {d.p2 > 0 && (
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${(d.p2/d.total)*100}%` }}
                        transition={{ duration: 0.7, delay: i*0.05+0.1 }}
                        className="h-full" style={{ background: 'var(--fr-text-muted)', minWidth: 4 }} />
                    )}
                    {d.p3 > 0 && (
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${(d.p3/d.total)*100}%` }}
                        transition={{ duration: 0.7, delay: i*0.05+0.2 }}
                        className="h-full rounded-r-full" style={{ background: 'var(--fr-accent-orange)', minWidth: 4 }} />
                    )}
                  </div>
                  <div className="flex gap-4 mt-1.5">
                    <span className="text-[9px] font-black" style={{ color: RED }}>🥇 {d.wins}</span>
                    <span className="text-[9px] font-black" style={{ color: 'var(--fr-text-muted)' }}>🥈 {d.p2}</span>
                    <span className="text-[9px] font-black" style={{ color: 'var(--fr-accent-orange)' }}>🥉 {d.p3}</span>
                  </div>
                </div>
              ))}
            </div>
            <ClassificaCompleta href="/stats/podiums">Tutti i podi, pilota per pilota</ClassificaCompleta>
          </AccordionSection>

        </motion.div>

        <p className="text-center text-[var(--fr-text-faint)] text-[11px] mt-8 tracking-wider">
          Scuderia Ferrari F1 · 1950–{new Date().getFullYear()} · Dati aggiornati
        </p>
    </PageShell>
  );
}