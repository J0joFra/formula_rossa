import Link from 'next/link';
import { useState, useMemo } from 'react';
import { leggi } from '../../lib/supabaseServer';
import PageShell, { PageHeader } from '../../components/ui/PageShell';
import { getFlagCode } from '../../lib/flags';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

export async function getStaticProps() {
  /* Come per /piloti: l'elenco arriva dal server, così i 78 link alle schede
     sono nell'HTML e non solo nella memoria del browser. */
  const righe = await leggi(c => c
    .from('circuit')
    .select('id, name, full_name, place_name, country_id, length, turns, direction, total_races_held')
    .order('name'));

  return {
    props: { circuits: (righe || []).map(c => ({ ...c, region: getRegion(c.country_id || '') })) },
    revalidate: 86400,
  };
}

export default function CircuitiIndex({ circuits = [] }) {

  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [sortBy, setSortBy] = useState('name');

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

  const seo = {
    title: 'Circuiti di Formula 1',
    description: 'Tutti i circuiti di Formula 1: lunghezza, numero di curve, senso di marcia e gare disputate.',
    path: '/circuiti',
  };

  return (
    <PageShell seo={seo} wide>
      <PageHeader
        eyebrow="Circuiti · Calendario mondiale"
        title="Circuiti"
        accent="di Formula 1"
        subtitle={`${circuits.length} piste con dati tecnici, record e storia.`}
        breadcrumb={[{ label: 'Dati' }, { label: 'Circuiti' }]}
      />

      {/* Controls */}
          {(
            <div className="flex flex-wrap gap-3 mb-8 items-center">
              <div className="relative flex-1 min-w-48">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cerca circuito o paese…"
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-[var(--fr-surface)] border border-[var(--fr-border)] text-[var(--fr-text)] placeholder:text-[var(--fr-text-faint)] focus:outline-none focus:border-[var(--fr-red)] transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    aria-label="Cancella la ricerca"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fr-text-faint)] hover:text-[var(--fr-text)] text-lg leading-none">
                    ×
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {regions.map(r => (
                  <button key={r} onClick={() => setRegion(r)}
                    aria-pressed={region === r}
                    className={`px-3 py-2 rounded-lg text-[11px] font-semibold border transition-colors ${
                      region === r
                        ? 'bg-[var(--fr-red)] border-[var(--fr-red)] text-white'
                        : 'bg-[var(--fr-surface)] border-[var(--fr-border)] text-[var(--fr-text-muted)] hover:text-[var(--fr-text)] hover:border-[var(--fr-border-strong)]'
                    }`}>
                    {r === 'all' ? `Tutti · ${circuits.length}` : r}
                  </button>
                ))}
              </div>

              <select
                value={sortBy} onChange={e => setSortBy(e.target.value)}
                aria-label="Ordina i circuiti"
                className="rounded-xl px-3 py-2.5 text-[11px] font-semibold bg-[var(--fr-surface)] border border-[var(--fr-border)] text-[var(--fr-text-muted)] focus:outline-none focus:border-[var(--fr-red)]">
                <option value="name">Ordina: Nome</option>
                <option value="country">Ordina: Paese</option>
                <option value="length">Ordina: Lunghezza</option>
              </select>
            </div>
          )}


          {/* Grid */}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-sm text-[var(--fr-text-muted)]">
              Nessun circuito trovato.
            </div>
          )}
          {filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(c => <CircuitCard key={c.id} circuit={c} />)}
            </div>
          )}

    </PageShell>
  );
}

// ── Circuit Card ──────────────────────────────────────────────────────────────

/* La regione dà il colore alla pastiglia. Erano quattro `rgba(...)` fissi con
   testo `rgba(255,255,255,.5)`: sul tema chiaro la scritta spariva. Ora usa le
   stesse tinte d'accento delle epoche in /piloti (styles/tokens.css), scelte
   per passare il contrasto minimo in entrambi i temi; il fondo si ricava dalla
   tinta con `color-mix`, invece di essere un secondo colore scritto a mano. */
const TINTA_REGIONE = {
  'Europe':             'var(--fr-accent-blue)',
  'Asia & Middle East': 'var(--fr-accent-orange)',
  'Americas':           'var(--fr-accent-green)',
  'Oceania':            'var(--fr-accent-violet)',
  'Other':              'var(--fr-accent-neutral)',
};

function CircuitCard({ circuit }) {
  const flag = getFlagCode(circuit.country_id || '');
  const tinta = TINTA_REGIONE[circuit.region] || TINTA_REGIONE.Other;

  return (
    <Link
      href={`/circuiti/${circuit.id}`}
      className="group relative block rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] shadow-[var(--fr-shadow-sm)] overflow-hidden transition-all hover:-translate-y-1 hover:border-[var(--fr-border-strong)]"
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="flex items-center gap-2 min-w-0">
            {flag && (
              <img
                src={`https://flagcdn.com/w20/${flag}.png`}
                alt=""
                width={20}
                height={12}
                className="w-5 h-3 object-cover rounded-sm shrink-0"
              />
            )}
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--fr-text-muted)] truncate">
              {circuit.country_id?.replace(/-/g, ' ')}
            </span>
          </span>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{
              color: tinta,
              background: `color-mix(in srgb, ${tinta} 14%, transparent)`,
            }}
          >
            {circuit.region}
          </span>
        </div>

        <h2 className="text-base font-black tracking-tight leading-tight text-[var(--fr-text)] group-hover:text-[var(--fr-red)] transition-colors mb-1">
          {circuit.name}
        </h2>
        {circuit.place_name && (
          <p className="text-xs text-[var(--fr-text-muted)] mb-4">{circuit.place_name}</p>
        )}

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--fr-border)]">
          <StatMini label="Lunghezza" value={circuit.length ? `${circuit.length} km` : '—'} />
          <StatMini label="Curve"     value={circuit.turns ?? '—'} />
          <StatMini label="Gare"      value={circuit.total_races_held ?? '—'} />
        </div>
      </div>
    </Link>
  );
}

function StatMini({ label, value }) {
  return (
    <div>
      <div className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[var(--fr-text-faint)] mb-0.5">
        {label}
      </div>
      <div className="tabular text-xs font-bold text-[var(--fr-text)]">{value}</div>
    </div>
  );
}
