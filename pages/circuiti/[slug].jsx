import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';
import path from 'path';
import fs from 'fs';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFlagCode(countryId = '') {
  const map = {
    'australia':'au','austria':'at','azerbaijan':'az','bahrain':'bh',
    'belgium':'be','brazil':'br','canada':'ca','china':'cn',
    'france':'fr','germany':'de','hungary':'hu','italy':'it',
    'japan':'jp','mexico':'mx','monaco':'mc','netherlands':'nl',
    'portugal':'pt','qatar':'qa','saudi-arabia':'sa','singapore':'sg',
    'spain':'es','united-arab-emirates':'ae','united-kingdom':'gb',
    'united-states':'us',
  };
  return map[countryId.toLowerCase().replace(/\s+/g,'-')] || null;
}

function fmtLapTime(millis) {
  if (!millis) return '—';
  const m = Math.floor(millis / 60000);
  const s = ((millis % 60000) / 1000).toFixed(3).padStart(6, '0');
  return `${m}:${s}`;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CircuitDetail({ circuit, races, lapRecord }) {
  const [tab, setTab] = useState('info'); // 'info' | 'history'
  const flag = getFlagCode(circuit.countryId || '');

  const TABS = [
    { id: 'info',    label: 'Dati Tecnici' },
    { id: 'history', label: `Gare (${races.length})` },
  ];

  return (
    <>
      <Head>
        <title>{circuit.name} — Circuiti F1 · Telemetry Explorer</title>
        <meta name="description"
          content={`${circuit.name}: lunghezza ${circuit.lapLengthKm ?? '?'} km, ${circuit.numberOfCorners ?? '?'} curve, ${circuit.numberOfDrszones ?? '?'} zone DRS. Tutte le gare disputate.`}
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
               style={{background:'linear-gradient(135deg,#0e0e0e 0%,#111 100%)'}}>
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
                 style={{background:'radial-gradient(circle,rgba(220,0,0,0.12) 0%,transparent 65%)'}}/>
            <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
                 style={{backgroundImage:'radial-gradient(circle at 1px 1px,#fff 1px,transparent 0)',backgroundSize:'32px 32px'}}/>

            <div className="relative z-10 p-8 md:p-12">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  {/* Country */}
                  <div className="flex items-center gap-2 mb-3">
                    {flag && (
                      <img src={`https://flagcdn.com/w28/${flag}.png`} alt={circuit.countryId}
                           className="w-7 h-4 object-cover rounded-sm"/>
                    )}
                    <span className="text-[11px] text-white/40 font-mono tracking-[0.25em] uppercase">
                      {circuit.countryId?.replace(/-/g,' ')} {circuit.cityName ? `· ${circuit.cityName}` : ''}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-1">
                    {circuit.name}
                  </h1>
                  {circuit.fullName && circuit.fullName !== circuit.name && (
                    <p className="text-white/35 text-sm font-mono mt-1">{circuit.fullName}</p>
                  )}
                  {circuit.seasonDebut && (
                    <p className="text-white/30 text-[11px] font-mono mt-2 tracking-widest uppercase">
                      In calendario dal {circuit.seasonDebut}
                    </p>
                  )}
                </div>

                {/* Direction badge */}
                {circuit.direction && (
                  <div className="px-4 py-2 rounded-xl border border-white/10 text-center flex-shrink-0"
                       style={{background:'rgba(255,255,255,0.03)'}}>
                    <div className="text-[9px] text-white/30 font-mono tracking-widest uppercase mb-1">Direzione</div>
                    <div className="text-sm font-black font-mono text-white/70 capitalize">{circuit.direction}</div>
                  </div>
                )}
              </div>

              {/* Big stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                <HeroStat label="Lunghezza" value={circuit.lapLengthKm ? `${circuit.lapLengthKm} km` : '—'} accent />
                <HeroStat label="Curve" value={circuit.numberOfCorners ?? '—'} />
                <HeroStat label="Zone DRS" value={circuit.numberOfDrszones ?? '—'} />
                <HeroStat label="Gare disputate" value={races.length || '—'} />
              </div>

              {/* Lap record */}
              {lapRecord && (
                <div className="mt-6 flex items-center gap-4 p-4 rounded-xl border border-yellow-500/20"
                     style={{background:'rgba(234,179,8,0.06)'}}>
                  <div className="text-yellow-400 text-xl">⏱</div>
                  <div>
                    <div className="text-[9px] text-yellow-500/60 font-mono tracking-widest uppercase mb-0.5">Record sul giro</div>
                    <div className="text-lg font-black font-mono text-yellow-300">{fmtLapTime(lapRecord.timeMillis)}</div>
                    <div className="text-xs text-white/40 font-mono mt-0.5">
                      {lapRecord.driver} · {lapRecord.team} · {lapRecord.year}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-white/8 pb-0">
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
              {/* Technical description */}
              <div className="rounded-2xl border border-white/8 p-6"
                   style={{background:'rgba(255,255,255,0.02)'}}>
                <h2 className="text-xs text-white/30 font-mono tracking-[0.25em] uppercase mb-4">Caratteristiche tecniche</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Lunghezza giro',    value: circuit.lapLengthKm ? `${circuit.lapLengthKm} km` : '—' },
                    { label: 'Numero di curve',    value: circuit.numberOfCorners ?? '—' },
                    { label: 'Zone DRS',           value: circuit.numberOfDrszones ?? '—' },
                    { label: 'Direzione pista',    value: circuit.direction ?? '—' },
                    { label: 'Prima gara F1',      value: circuit.seasonDebut ?? '—' },
                    { label: 'Città',              value: circuit.cityName ?? '—' },
                    { label: 'Nazione',            value: circuit.countryId?.replace(/-/g,' ') ?? '—' },
                    { label: 'Altitudine',         value: circuit.altitude ? `${circuit.altitude} m slm` : '—' },
                    { label: 'Fuso orario',        value: circuit.timezone || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                      <span className="text-xs text-white/35 font-mono">{label}</span>
                      <span className="text-sm font-bold text-white capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What makes this circuit special — static editorial notes */}
              <CircuitNotes circuitId={circuit.id} />
            </div>
          )}

          {/* Tab: Storia gare */}
          {tab === 'history' && (
            <div className="rounded-2xl border border-white/8 overflow-hidden"
                 style={{background:'rgba(255,255,255,0.02)'}}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Anno','Gran Premio','Vincitore','Scuderia','Giri'].map(h => (
                      <th key={h} className="py-3 px-4 text-left text-[10px] font-mono text-white/25 tracking-widest uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {races.map((r, i) => (
                    <tr key={`${r.year}-${i}`}
                        className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-black font-mono text-red-400">{r.year}</span>
                      </td>
                      <td className="py-3 px-4 text-white/80 font-medium">{r.name || '—'}</td>
                      <td className="py-3 px-4 text-white font-bold font-mono">{r.winner || '—'}</td>
                      <td className="py-3 px-4 text-white/50 text-xs font-mono">{r.team || '—'}</td>
                      <td className="py-3 px-4 text-white/40 font-mono text-xs">{r.laps ?? '—'}</td>
                    </tr>
                  ))}
                  {races.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-white/25 font-mono text-sm">
                        Nessuna gara disponibile
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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

// ── Hero Stat ─────────────────────────────────────────────────────────────────

function HeroStat({ label, value, accent }) {
  return (
    <div className="rounded-xl px-4 py-3 border border-white/8"
         style={{background: accent ? 'rgba(220,0,0,0.08)' : 'rgba(255,255,255,0.03)'}}>
      <div className="text-[9px] text-white/30 font-mono tracking-widest uppercase mb-1">{label}</div>
      <div className={`text-2xl font-black font-mono ${accent ? 'text-red-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}

// ── Circuit Notes — editorial blurbs per circuito ─────────────────────────────

const CIRCUIT_NOTES = {
  'monza': {
    title: 'Il Tempio della Velocità',
    body: `Monza è il circuito più veloce del calendario F1. I suoi lunghi rettilinei — tra cui il Rettifilo Tribune lungo oltre un chilometro — spingono le monoposto oltre i 350 km/h. Le scuderie montano setup ad altissima efficienza aerodinamica con pochissimo carico, sacrificando la tenuta in curva per la velocità massima. Le storiche paraboliche e la Prima Variante sono tra i punti di frenata più impegnativi dell'intera stagione. Ospita il Gran Premio d'Italia dal 1950, primo anno del Mondiale.`,
  },
  'monaco': {
    title: 'La Corsa più Prestigiosa',
    body: `Monaco è l'opposto di Monza: il circuito più lento, più stretto e più iconico del mondo. Le barriere sono a pochi centimetri dalle ruote, non esiste margine di errore. La pole position è determinante perché sorpassare è quasi impossibile — spesso il vincitore è chi parte davanti. Il tunnel, il Casino, il Portier e la chicane della piscina sono luoghi leggendari. Vincere a Monaco vale doppio nell'immaginario della Formula 1.`,
  },
  'silverstone': {
    title: 'La Casa del Motorsport',
    body: `Silverstone ha ospitato il primo Gran Premio del Mondiale di Formula 1 nel 1950. Le sue curve rapide — Copse, Maggots, Becketts — sono tra le più spettacolari del calendario e richiedono altissimo carico aerodinafico e una grande fiducia nella macchina. Abbey, in piena velocità, è uno dei passaggi più emozionanti del Mondiale. Il circuito è costruito su una ex base aerea RAF e ospita il Gran Premio di Gran Bretagna.`,
  },
  'spa-francorchamps': {
    title: 'Il Circuito più Amato dai Piloti',
    body: `Spa-Francorchamps è spesso citato come il circuito preferito dai piloti. L'Eau Rouge-Raidillon — la combinazione di curve in salita a tutta velocità — è il punto più iconico dell'intero calendario F1. Il meteo è imprevedibile: è normale avere sole da un lato e pioggia battente dall'altro, il che rende la strategia gomme cruciale. Il Kemmel Straight è uno dei principali punti di sorpasso del campionato.`,
  },
  'suzuka': {
    title: 'Il Circuito dei Tecnici',
    body: `Suzuka è il circuito più tecnico del calendario, con una sequenza di curve in S nella prima parte del tracciato che mette alla prova l'equilibrio aerodinamico della vettura in modo unico. Il disegno a otto incrociato è unico nel motorsport. Spoon Curve, Degner e 130R sono punti dove i piloti dimostrano il massimo coraggio. Il pubblico giapponese è tra i più appassionati del mondo.`,
  },
};

function CircuitNotes({ circuitId }) {
  const note = CIRCUIT_NOTES[circuitId] || null;
  return (
    <div className="rounded-2xl border border-white/8 p-6"
         style={{background:'rgba(255,255,255,0.02)'}}>
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

// ── Data fetching ─────────────────────────────────────────────────────────────

export async function getStaticPaths() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'f1db-circuits.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    const circuits = Array.isArray(data) ? data : data.circuits || [];
    const paths = circuits.map(c => ({ params: { slug: c.id } }));
    return { paths, fallback: false };
  } catch {
    return { paths: [], fallback: false };
  }
}

export async function getStaticProps({ params }) {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');

    // Load circuits
    const raw = fs.readFileSync(path.join(dataDir, 'f1db-circuits.json'), 'utf-8');
    const data = JSON.parse(raw);
    const circuits = Array.isArray(data) ? data : data.circuits || [];
    const c = circuits.find(x => x.id === params.slug);
    if (!c) return { notFound: true };

    const circuit = {
      id:               c.id,
      name:             c.name || c.fullName || '',
      fullName:         c.fullName || null,
      cityName:         c.cityName || c.city || null,
      countryId:        c.countryId || c.country || null,
      lapLengthKm:      c.lapLengthKm ?? c.circuitLength ?? null,
      numberOfCorners:  c.numberOfCorners ?? c.corners ?? null,
      numberOfDrszones: c.numberOfDrszones ?? c.drsZones ?? null,
      direction:        c.direction || null,
      seasonDebut:      c.seasonDebut || null,
      altitude:         c.altitude || null,
      timezone:         c.timezone || null,
    };

    // Load race history for this circuit
    let races = [];
    let lapRecord = null;
    try {
      const racesRaw = fs.readFileSync(path.join(dataDir, 'f1db-races.json'), 'utf-8');
      const allRaces = JSON.parse(racesRaw);
      const circuitRaces = allRaces
        .filter(r => r.circuitId === params.slug || r.circuit === params.slug)
        .sort((a, b) => b.year - a.year);

      // Try to load race results for winner info
      let results = [];
      try {
        const resRaw = fs.readFileSync(path.join(dataDir, 'f1db-races-race-results.json'), 'utf-8');
        results = JSON.parse(resRaw);
      } catch {}

      races = circuitRaces.map(r => {
        const winner = results.find(res =>
          res.raceId === r.id && (res.positionNumber === 1 || res.position === 1)
        );
        return {
          year:   r.year,
          name:   r.name || r.officialName || `Gran Premio ${r.year}`,
          winner: winner ? (winner.driverName || winner.driverId?.replace(/-/g,' ') || '—') : '—',
          team:   winner ? (winner.constructorName || winner.constructorId || '—') : '—',
          laps:   r.laps ?? null,
        };
      });

      // Best lap record: fastest lap across all races at this circuit
      const circuitRaceIds = new Set(circuitRaces.map(r => r.id));
      const circuitResults = results.filter(r => circuitRaceIds.has(r.raceId));
      const withTime = circuitResults.filter(r => r.fastestLapMillis || r.fastestLapTime);
      if (withTime.length) {
        const best = withTime.reduce((a, b) =>
          (a.fastestLapMillis || 99999999) < (b.fastestLapMillis || 99999999) ? a : b
        );
        const bestRace = circuitRaces.find(r => r.id === best.raceId);
        lapRecord = {
          timeMillis: best.fastestLapMillis || null,
          driver:     best.driverName || best.driverId?.replace(/-/g,' ') || '—',
          team:       best.constructorName || best.constructorId || '—',
          year:       bestRace?.year || '—',
        };
      }
    } catch (e) {
      console.warn('Race history load error:', e.message);
    }

    return { props: { circuit, races, lapRecord } };
  } catch (e) {
    console.error('Circuit detail error:', e);
    return { notFound: true };
  }
}