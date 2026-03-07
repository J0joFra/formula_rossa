import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';
import path from 'path';
import fs from 'fs';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getFlagCode(countryId = '') {
  const map = {
    'australia': 'au', 'austria': 'at', 'azerbaijan': 'az', 'bahrain': 'bh',
    'belgium': 'be', 'brazil': 'br', 'canada': 'ca', 'china': 'cn',
    'france': 'fr', 'germany': 'de', 'hungary': 'hu', 'italy': 'it',
    'japan': 'jp', 'mexico': 'mx', 'monaco': 'mc', 'netherlands': 'nl',
    'portugal': 'pt', 'qatar': 'qa', 'saudi-arabia': 'sa', 'singapore': 'sg',
    'spain': 'es', 'united-arab-emirates': 'ae', 'united-kingdom': 'gb',
    'united-states': 'us', 'miami': 'us', 'las-vegas': 'us',
  };
  const k = countryId.toLowerCase().replace(/\s+/g, '-');
  return map[k] || null;
}

function getRegion(countryId = '') {
  const europe = ['united-kingdom','italy','monaco','spain','france','germany','belgium','austria','hungary','netherlands','portugal'];
  const asia   = ['japan','china','singapore','bahrain','saudi-arabia','qatar','united-arab-emirates','azerbaijan'];
  const americas = ['united-states','mexico','brazil','canada'];
  const oceania  = ['australia'];
  const k = countryId.toLowerCase();
  if (europe.includes(k))   return 'Europe';
  if (asia.includes(k))     return 'Asia & Middle East';
  if (americas.includes(k)) return 'Americas';
  if (oceania.includes(k))  return 'Oceania';
  return 'Other';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CircuitiIndex({ circuits }) {
  const [search,    setSearch]    = useState('');
  const [region,    setRegion]    = useState('all');
  const [sortBy,    setSortBy]    = useState('name');

  const regions = useMemo(() => {
    const s = new Set(circuits.map(c => c.region));
    return ['all', ...Array.from(s).sort()];
  }, [circuits]);

  const filtered = useMemo(() => {
    let list = circuits;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.countryId?.toLowerCase().includes(q) ||
        c.cityName?.toLowerCase().includes(q)
      );
    }
    if (region !== 'all') list = list.filter(c => c.region === region);
    if (sortBy === 'name')    list = [...list].sort((a,b) => a.name.localeCompare(b.name));
    if (sortBy === 'length')  list = [...list].sort((a,b) => (b.lapLengthKm||0) - (a.lapLengthKm||0));
    if (sortBy === 'country') list = [...list].sort((a,b) => a.countryId?.localeCompare(b.countryId||''));
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
              {circuits.length} piste · Dati tecnici, record e storia
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 mb-8 items-center">
            {/* Search */}
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

            {/* Region filter */}
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

            {/* Sort */}
            <select
              value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] font-mono text-white/70 focus:outline-none focus:border-red-600/50">
              <option value="name">Ordina: Nome</option>
              <option value="country">Ordina: Paese</option>
              <option value="length">Ordina: Lunghezza</option>
            </select>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-white/25 font-mono tracking-widest uppercase text-sm">
              Nessun circuito trovato
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(c => (
                <CircuitCard key={c.id} circuit={c} />
              ))}
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
  const flag = getFlagCode(circuit.countryId || '');
  const regionColors = {
    'Europe':           'rgba(99,102,241,0.15)',
    'Asia & Middle East':'rgba(245,158,11,0.15)',
    'Americas':         'rgba(34,197,94,0.15)',
    'Oceania':          'rgba(6,182,212,0.15)',
    'Other':            'rgba(255,255,255,0.05)',
  };
  const bg = regionColors[circuit.region] || regionColors['Other'];

  return (
    <Link href={`/circuiti/${circuit.id}`}>
      <div className="group relative rounded-2xl border border-white/8 overflow-hidden cursor-pointer transition-all duration-200 hover:border-red-600/40 hover:scale-[1.01]"
           style={{background:'rgba(255,255,255,0.02)'}}>

        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{background:'linear-gradient(90deg,transparent,rgba(220,0,0,0.6),transparent)'}}/>

        <div className="p-5">
          {/* Country + flag */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {flag && (
                <img src={`https://flagcdn.com/w20/${flag}.png`} alt={circuit.countryId}
                     className="w-5 h-3 object-cover rounded-sm opacity-80"/>
              )}
              <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">
                {circuit.countryId?.replace(/-/g,' ')}
              </span>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                  style={{background:bg, color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.08)'}}>
              {circuit.region}
            </span>
          </div>

          {/* Name */}
          <h2 className="text-base font-black tracking-tight leading-tight text-white group-hover:text-red-400 transition-colors mb-1">
            {circuit.name}
          </h2>
          {circuit.cityName && (
            <p className="text-xs text-white/35 font-mono mb-4">{circuit.cityName}</p>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/6">
            <StatMini label="Lunghezza" value={circuit.lapLengthKm ? `${circuit.lapLengthKm} km` : '—'} />
            <StatMini label="Curve" value={circuit.numberOfCorners ?? '—'} />
            <StatMini label="DRS" value={circuit.numberOfDrszones != null ? `${circuit.numberOfDrszones} zone` : '—'} />
          </div>
        </div>

        {/* Hover arrow */}
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

// ── Data fetching ─────────────────────────────────────────────────────────────

export async function getStaticProps() {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');

    const raw = fs.readFileSync(path.join(dataDir, 'f1db-circuits.json'), 'utf-8');
    const data = JSON.parse(raw);
    const circuitsRaw = Array.isArray(data) ? data : data.circuits || [];

    // Load layouts — pick the "effective" layout per circuit for current specs
    let layoutsMap = {};
    try {
      const layoutsRaw = fs.readFileSync(path.join(dataDir, 'f1db-circuits-layouts.json'), 'utf-8');
      const layouts = JSON.parse(layoutsRaw);
      // Prefer effective:true, fallback to last entry per circuit
      layouts.forEach(l => {
        if (!layoutsMap[l.circuitId] || l.effective) {
          layoutsMap[l.circuitId] = l;
        }
      });
    } catch (e) {
      console.warn('Layouts file not found:', e.message);
    }

    const circuits = circuitsRaw.map(c => {
      const layout = layoutsMap[c.id] || {};
      return {
        id:               c.id,
        name:             c.name || c.fullName || '',
        cityName:         c.cityName || c.city || null,
        countryId:        c.countryId || c.country || null,
        lapLengthKm:      layout.length ?? null,
        numberOfCorners:  layout.turns ?? null,
        numberOfDrszones: c.numberOfDrszones ?? null,
        direction:        c.direction || null,
        seasonDebut:      c.seasonDebut || null,
        region:           getRegion(c.countryId || c.country || ''),
      };
    });

    return { props: { circuits } };
  } catch (e) {
    console.error('Error loading circuits:', e);
    return { props: { circuits: [] } };
  }
}