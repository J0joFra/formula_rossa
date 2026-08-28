import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageShell, { PageLoading, PageError } from '../components/ui/PageShell';
import Link from 'next/link';

import { createClient } from '@supabase/supabase-js';

const supabase = typeof window !== 'undefined'
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null;


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
  'monte-carlo': 'mc', 'circuit-de-monaco': 'mc', 'baku': 'az', 'azerbaijan': 'az',
  'americas': 'us', 'cota': 'us', 'austin': 'us', 'miami': 'us', 'vegas': 'us', 'las-vegas': 'us',
  'caesars-palace': 'us', 'indianapolis': 'us', 'watkins-glen': 'us', 'long-beach': 'us', 'phoenix': 'us',
  'detroit': 'us', 'dallas': 'us', 'sebring': 'us', 'riverside': 'us',
  'villeneuve': 'ca', 'montreal': 'ca', 'circuit-gilles-villeneuve': 'ca', 'mosport': 'ca',
  'interlagos': 'br', 'sao-paulo': 'br', 'jose-carlos-pace': 'br', 'jacarepagua': 'br',
  'rodriguez': 'mx', 'hermanos-rodriguez': 'mx', 'mexico-city': 'mx',
  'galvez': 'ar', 'buenos-aires': 'ar', 'oscar-galvez': 'ar',
  'suzuka': 'jp', 'fuji': 'jp', 'okayama': 'jp', 'ti-circuit': 'jp',
  'shanghai': 'cn', 'marina-bay': 'sg', 'singapore': 'sg', 'sepang': 'my',
  'yeongam': 'kr', 'buddh': 'in', 'bahrain': 'bh', 'sakhir': 'bh',
  'losail': 'qa', 'lusail': 'qa', 'jeddah': 'sa', 'yas-marina': 'ae', 'abu-dhabi': 'ae',
  'istanbul': 'tr', 'sochi': 'ru', 'kyalami': 'za', 'albert-park': 'au', 'melbourne': 'au',
  'adelaide': 'au', 'ain-diab': 'ma',
};

const getFlagCodeFromCircuit = (circuitId) => {
  if (!circuitId) return '';
  return circuitToCountry[circuitId.toLowerCase()] || '';
};

const getPositionBackground = (position) => {
  const pos = parseInt(position);
  switch(pos) {
    case 1: return 'bg-gradient-to-r from-yellow-500/30 to-transparent border-l-4 border-yellow-500';
    case 2: return 'bg-gradient-to-r from-gray-300/20 to-transparent border-l-4 border-gray-300';
    case 3: return 'bg-gradient-to-r from-amber-700/20 to-transparent border-l-4 border-amber-700';
    default: return 'border-l-4 border-zinc-800 hover:bg-white/5';
  }
};

const getPositionTextColor = (position) => {
  const pos = parseInt(position);
  if (pos === 1) return 'text-yellow-500';
  if (pos === 2) return 'text-gray-300';
  if (pos === 3) return 'text-amber-700';
  return 'text-zinc-500';
};

const calculateBoundingBox = (lat, lon, radiusKm = 2) => {
  const latPerKm = 1 / 111.32;
  const lonPerKm = 1 / (111.32 * Math.cos(lat * Math.PI / 180));
  return {
    minLon: lon - radiusKm * lonPerKm, minLat: lat - radiusKm * latPerKm,
    maxLon: lon + radiusKm * lonPerKm, maxLat: lat + radiusKm * latPerKm
  };
};

export default function RaceDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [raceInfo, setRaceInfo] = useState(null);
  const [circuitInfo, setCircuitInfo] = useState(null);
  const [raceResults, setRaceResults] = useState([]);
  const [qualifyingResults, setQualifyingResults] = useState([]);
  const [sprintRaceResults, setSprintRaceResults] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [drivers, setDrivers] = useState({});
  const [constructors, setConstructors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFullDrivers, setShowFullDrivers] = useState(false);
  const [activeTab, setActiveTab] = useState('race');

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      try {
        
        const raceId = parseInt(id);

        // Gara + circuito
        const { data: race } = await supabase.from('race').select('*').eq('id', raceId).single();
        if (!race) { setLoading(false); return; }
        setRaceInfo(race);

        const { data: circuit } = await supabase.from('circuit').select('*').eq('id', race.circuit_id).single();
        setCircuitInfo(circuit);

        // Piloti e costruttori (mappe)
        const [{ data: drData }, { data: coData }] = await Promise.all([
          supabase.from('driver').select('id, first_name, last_name'),
          supabase.from('constructor').select('id, name'),
        ]);
        const dMap = {}; drData?.forEach(d => dMap[d.id] = d);
        const cMap = {}; coData?.forEach(c => cMap[c.id] = c);
        setDrivers(dMap); setConstructors(cMap);

        // Race results
        const { data: results } = await supabase
          .from('race_data').select('*')
          .eq('type', 'RACE_RESULT')
          .eq('race_id', raceId)
          .order('position_display_order');
        setRaceResults(results || []);

        // Constructor standings per questa gara
        const { data: coSt } = await supabase
          .from('race_constructor_standing').select('*')
          .eq('race_id', raceId)
          .order('position_display_order');
        setConstructorStandings(coSt || []);

        // Qualifying — prova qualifying_results prima, poi fallback a qual1/qual2
        const { data: qualMain } = await supabase
          .from('race_data').select('*')
          .eq('type', 'QUALIFYING_RESULT')
          .eq('race_id', raceId).order('position_display_order');

        if (qualMain && qualMain.length > 0) {
          setQualifyingResults(qualMain);
        } else {
          const { data: qual2 } = await supabase.from('race_data').select('*').eq('race_id', raceId).eq('type', 'QUALIFYING_2_RESULT').order('position_display_order');
          const { data: qual1 } = await supabase.from('race_data').select('*').eq('race_id', raceId).eq('type', 'QUALIFYING_1_RESULT').order('position_display_order');
          setQualifyingResults((qual2?.length ? qual2 : qual1) || []);
        }

        // Sprint
        const [{ data: sqData }, { data: srData }] = await Promise.all([
          supabase.from('race_data').select('*').eq('race_id', raceId).eq('type', 'SPRINT_QUALIFYING_RESULT').order('position_display_order'),
          supabase.from('race_data').select('*').eq('race_id', raceId).eq('type', 'SPRINT_RACE_RESULT').order('position_display_order'),
        ]);
        setSprintRaceResults([
          ...(sqData || []).map(r => ({ ...r, _type: 'SPRINT_QUALI' })),
          ...(srData || []).map(r => ({ ...r, _type: 'SPRINT_RACE' })),
        ]);

      } catch (err) { console.error(err); }
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) return (
    <PageShell wide><PageLoading label="Caricamento gara…" /></PageShell>
  );
  if (!raceInfo) return (
    <PageShell wide>
      <PageError
        title="Gara non trovata"
        message="Il Gran Premio richiesto non esiste o non è ancora disponibile in archivio."
      />
    </PageShell>
  );

  const visibleResults = showFullDrivers ? raceResults : raceResults.slice(0, 10);
  const flagCode = getFlagCodeFromCircuit(circuitInfo?.id);

  let mapUrl = '';
  if (circuitInfo?.latitude && circuitInfo?.longitude) {
    const lat = parseFloat(String(circuitInfo.latitude).replace(',', '.'));
    const lon = parseFloat(String(circuitInfo.longitude).replace(',', '.'));
    if (!isNaN(lat) && !isNaN(lon)) {
      const bbox = calculateBoundingBox(lat, lon);
      mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLon}%2C${bbox.minLat}%2C${bbox.maxLon}%2C${bbox.maxLat}&layer=mapnik&marker=${lat}%2C${lon}`;
    }
  }

  const isFerrari = (constructorId) => constructors[constructorId]?.name?.toLowerCase().includes('ferrari') || false;

  const seo = {
    title: `${circuitInfo?.name || 'Gran Premio'} ${raceInfo.year}`,
    description: `Risultati, griglia e dati del Gran Premio ${raceInfo.year}, round ${raceInfo.round}.`,
    path: '/races',
  };

  return (
    <PageShell seo={seo} wide>
        <Link href="/standings" className="text-[var(--fr-text-faint)] font-bold uppercase text-[10px] mb-8 inline-block hover:text-[var(--fr-red)] transition-colors tracking-widest">
          ← Torna alle classifiche
        </Link>

        <header className="mb-12">
          <div className="text-red-600 font-black uppercase text-xs mb-2 tracking-[0.2em]">
            Round {raceInfo.round} • {raceInfo.year}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 bg-zinc-900/50 border-l-4 border-red-600 p-6 flex flex-col justify-center">
              <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 tracking-widest">Circuit</p>
              <p className="text-3xl font-black uppercase italic leading-none mb-2">{circuitInfo?.name}</p>
              <p className="text-sm text-zinc-400 font-bold uppercase">{circuitInfo?.place_name}, {circuitInfo?.country_id}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 flex items-center justify-center rounded-sm">
              {flagCode && <img src={`https://flagcdn.com/h80/${flagCode}.png`} className="h-14 w-auto shadow-2xl rounded-sm object-contain" alt="Bandiera nazione" />}
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 aspect-square overflow-hidden rounded-sm relative group">
              {mapUrl ? (
                <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={mapUrl} className="grayscale invert opacity-50 group-hover:opacity-100 transition-opacity duration-500"></iframe>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs font-bold uppercase tracking-widest">Map N/A</div>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <section className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-sm overflow-hidden shadow-2xl">
            {/* Tab selector */}
            <div className="flex border-b border-zinc-800 bg-zinc-900/80">
              {[
                { key: 'race', label: 'Race Results' },
                ...(qualifyingResults.length > 0  ? [{ key: 'quali',  label: 'Qualifying' }] : []),
                ...(sprintRaceResults.length  > 0 ? [{ key: 'sprint', label: 'Sprint'     }] : []),
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 font-black uppercase text-xs tracking-widest transition-all ${activeTab === tab.key ? 'text-white border-b-2 border-red-600' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* RACE RESULTS */}
            {activeTab === 'race' && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-zinc-950 text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800">
                        <th className="p-4 w-12 text-center">Pos</th>
                        <th className="p-4">Driver</th>
                        <th className="p-4">Team</th>
                        <th className="p-4 text-right">Time/Retired</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleResults.map((s, i) => {
                        const isFerrariItem = isFerrari(s.constructor_id);
                        const driver = drivers[s.driver_id];
                        return (
                          <tr key={i} className={`${getPositionBackground(s.position_text)} transition-all duration-300 border-b border-zinc-800/30 group`}>
                            <td className={`p-4 text-center font-black italic ${getPositionTextColor(s.position_text)}`}>{s.position_text}</td>
                            <td className="p-4">
                              <div className={`font-bold uppercase tracking-tight ${isFerrariItem ? 'text-[#ff2800]' : 'text-white'}`}>
                                <span className="opacity-40 font-medium mr-1 hidden sm:inline">{driver?.first_name}</span>
                                <span>{driver?.last_name}</span>
                              </div>
                            </td>
                            <td className={`p-4 text-xs font-bold uppercase ${isFerrariItem ? 'text-[#ff2800]' : 'text-zinc-400'}`}>
                              {constructors[s.constructor_id]?.name}
                            </td>
                            <td className="p-4 text-right font-mono text-xs text-zinc-300 whitespace-nowrap">
                              {s.position_text === "1"
                                ? (s.race_time || "Winner")
                                : (s.race_gap || s.race_reason_retired || "Finished")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {raceResults.length > 10 && (
                  <button onClick={() => setShowFullDrivers(!showFullDrivers)} className="w-full py-4 bg-zinc-800/30 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all text-zinc-500">
                    {showFullDrivers ? "↑ Show Top 10" : `↓ Show All ${raceResults.length} Results`}
                  </button>
                )}
              </>
            )}

            {/* QUALIFYING */}
            {activeTab === 'quali' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-zinc-950 text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800">
                      <th className="p-4 w-12 text-center">Pos</th>
                      <th className="p-4">Driver</th>
                      <th className="p-4">Team</th>
                      <th className="p-4 text-right">Q1</th>
                      <th className="p-4 text-right">Q2</th>
                      <th className="p-4 text-right">Q3 / Best</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualifyingResults.map((s, i) => {
                      const isFerrariItem = isFerrari(s.constructor_id);
                      const driver = drivers[s.driver_id];
                      const bestTime = s.qualifying_q3 || s.qualifying_q2 || s.qualifying_q1 || s.qualifying_time || '—';
                      return (
                        <tr key={i} className={`${getPositionBackground(s.position_text)} transition-all border-b border-zinc-800/30`}>
                          <td className={`p-4 text-center font-black italic ${getPositionTextColor(s.position_text)}`}>{s.position_text}</td>
                          <td className="p-4">
                            <div className={`font-bold uppercase tracking-tight ${isFerrariItem ? 'text-[#ff2800]' : 'text-white'}`}>
                              <span className="opacity-40 font-medium mr-1 hidden sm:inline">{driver?.first_name}</span>
                              <span>{driver?.last_name}</span>
                            </div>
                          </td>
                          <td className={`p-4 text-xs font-bold uppercase ${isFerrariItem ? 'text-[#ff2800]' : 'text-zinc-400'}`}>{constructors[s.constructor_id]?.name}</td>
                          <td className="p-4 text-right font-mono text-xs text-zinc-400">{s.qualifying_q1 || '—'}</td>
                          <td className="p-4 text-right font-mono text-xs text-zinc-400">{s.qualifying_q2 || '—'}</td>
                          <td className="p-4 text-right font-mono text-xs text-white font-black">{bestTime}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* SPRINT */}
            {activeTab === 'sprint' && (() => {
              const sqRows = sprintRaceResults.filter(r => r._type === 'SPRINT_QUALI');
              const srRows = sprintRaceResults.filter(r => r._type === 'SPRINT_RACE');
              const SprintAccordion = ({ title, color, rows, renderRow }) => {
                const [open, setOpen] = useState(false);
                return (
                  <div className="border-b border-zinc-800 last:border-0">
                    <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-black uppercase text-xs tracking-widest" style={{ color }}>{title}</span>
                        <span className="text-zinc-600 text-[10px] font-bold">{rows.length} entries</span>
                      </div>
                      <svg className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {open && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead><tr className="bg-zinc-950 text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800">{renderRow(null, true)}</tr></thead>
                          <tbody>{rows.map((s, i) => <tr key={i} className={`${getPositionBackground(s.position_text)} border-b border-zinc-800/30`}>{renderRow(s, false)}</tr>)}</tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              };
              return (
                <div>
                  {sqRows.length > 0 && (
                    <SprintAccordion title="Sprint Qualifying" color="#818cf8" rows={sqRows}
                      renderRow={(s, isHeader) => isHeader ? (
                        <><th className="p-4 w-12 text-center">Pos</th><th className="p-4">Driver</th><th className="p-4">Team</th><th className="p-4 text-right">SQ1</th><th className="p-4 text-right">SQ2</th><th className="p-4 text-right">SQ3</th></>
                      ) : (
                        <><td className={`p-4 text-center font-black italic ${getPositionTextColor(s.position_text)}`}>{s.position_text}</td>
                        <td className="p-4"><div className={`font-bold uppercase ${isFerrari(s.constructor_id) ? 'text-[#ff2800]' : 'text-white'}`}><span className="opacity-40 mr-1 hidden sm:inline">{drivers[s.driver_id]?.first_name}</span><span>{drivers[s.driver_id]?.last_name}</span></div></td>
                        <td className={`p-4 text-xs font-bold uppercase ${isFerrari(s.constructor_id) ? 'text-[#ff2800]' : 'text-zinc-400'}`}>{constructors[s.constructor_id]?.name}</td>
                        <td className="p-4 text-right font-mono text-xs text-zinc-400">{s.qualifying_q1 || '—'}</td>
                        <td className="p-4 text-right font-mono text-xs text-zinc-400">{s.qualifying_q2 || '—'}</td>
                        <td className="p-4 text-right font-mono text-xs text-white font-black">{s.qualifying_q3 || s.qualifying_q2 || s.qualifying_q1 || '—'}</td></>
                      )}
                    />
                  )}
                  {srRows.length > 0 && (
                    <SprintAccordion title="Sprint Race" color="#c084fc" rows={srRows}
                      renderRow={(s, isHeader) => isHeader ? (
                        <><th className="p-4 w-12 text-center">Pos</th><th className="p-4">Driver</th><th className="p-4">Team</th><th className="p-4 text-right">Time / Gap</th><th className="p-4 text-right">Pts</th></>
                      ) : (
                        <><td className={`p-4 text-center font-black italic ${getPositionTextColor(s.position_text)}`}>{s.position_text}</td>
                        <td className="p-4"><div className={`font-bold uppercase ${isFerrari(s.constructor_id) ? 'text-[#ff2800]' : 'text-white'}`}><span className="opacity-40 mr-1 hidden sm:inline">{drivers[s.driver_id]?.first_name}</span><span>{drivers[s.driver_id]?.last_name}</span></div></td>
                        <td className={`p-4 text-xs font-bold uppercase ${isFerrari(s.constructor_id) ? 'text-[#ff2800]' : 'text-zinc-400'}`}>{constructors[s.constructor_id]?.name}</td>
                        <td className="p-4 text-right font-mono text-xs text-zinc-300">{s.position_text === "1" ? (s.race_time || "Winner") : (s.race_gap || s.race_reason_retired || "—")}</td>
                        <td className="p-4 text-right font-black text-yellow-400">{s.race_points ?? '—'}</td></>
                      )}
                    />
                  )}
                </div>
              );
            })()}
          </section>

          <section className="bg-zinc-900/40 border border-zinc-800 rounded-sm h-fit shadow-xl">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80">
              <h2 className="font-black uppercase text-xs text-red-600 tracking-widest">Constructor Standings</h2>
            </div>
            <table className="w-full text-left text-sm border-collapse">
              <tbody>
                {constructorStandings.map((s, i) => (
                  <tr key={i} className={`${getPositionBackground(s.position_text)} hover:bg-white/5 transition-all duration-300 border-b border-zinc-800/20`}>
                    <td className={`p-4 w-12 text-center font-black italic ${getPositionTextColor(s.position_text)}`}>{s.position_text}</td>
                    <td className={`p-4 font-bold uppercase text-xs tracking-tight ${isFerrari(s.constructor_id) ? 'text-[#ff2800]' : 'text-white'}`}>{constructors[s.constructor_id]?.name}</td>
                    <td className="p-4 text-right font-black text-white px-6">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
    </PageShell>
  );
}