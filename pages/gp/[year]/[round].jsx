'use client';
/**
 * pages/gp/[year]/[round].jsx
 * Analisi di un singolo Gran Premio.
 *
 * Sostituisce il Live Timing: stessi grafici (components/livetiming/Charts),
 * ma su dati di sessione già conclusa — gratuiti, stabili e indicizzabili.
 * URL leggibile e stabile: /gp/2024/16.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Trophy, TrendingUp, Smartphone, ArrowUpRight } from 'lucide-react';
import PageShell, { PageHeader, PageLoading, PageError, Panel, StatTile } from '../../../components/ui/PageShell';
import { GridToRaceChart } from '../../../components/livetiming/Charts';
import {
  getRace, getRaceResults, getQualifying, getSprint, getNames, ferrariSummary,
} from '../../../lib/f1/gp';
import { getFlagCode } from '../../../lib/flags';

const GRIDUP_URL = 'https://gridup-f1.web.app';

const SESSION_LABEL = {
  gara:       "Ordine d'arrivo",
  qualifiche: 'Qualifiche',
  sprint:     'Sprint',
};

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Posizioni guadagnate o perse dalla griglia all'arrivo. */
function Delta({ grid, pos }) {
  if (!grid || !pos) return <span className="text-[var(--fr-text-dim)]">—</span>;
  const d = grid - pos;
  if (d === 0) return <span className="text-[var(--fr-text-faint)]">=</span>;
  const up = d > 0;
  return (
    <span className={up ? 'text-[var(--fr-success)]' : 'text-[var(--fr-danger)]'}>
      {up ? '▲' : '▼'} {Math.abs(d)}
    </span>
  );
}

/* La Ferrari va evidenziata in ogni tabella: è il motivo per cui si è qui. */
const isFerrari = (constructorId) => constructorId === 'ferrari';
const rowCls    = (c) => (isFerrari(c) ? 'bg-[var(--fr-red-soft)]' : undefined);
const driverCls = (c) => (isFerrari(c) ? 'text-[var(--fr-text)] font-semibold' : undefined);

/** Celle pilota + scuderia, identiche nelle tre sessioni. */
function Chi({ row, names }) {
  return (
    <>
      <td className={driverCls(row.constructorId)}>
        {names.drivers[row.driverId] || row.driverId}
      </td>
      <td>{names.constructors[row.constructorId] || row.constructorId}</td>
    </>
  );
}

function RaceTable({ results, names }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">Pos</th>
            <th scope="col">Pilota</th>
            <th scope="col">Scuderia</th>
            <th scope="col">Griglia</th>
            <th scope="col">Δ</th>
            <th scope="col">Punti</th>
          </tr>
        </thead>
        <tbody>
          {results.map(r => (
            <tr key={r.driverId} className={rowCls(r.constructorId)}>
              <td className="tabular font-bold">{r.positionText ?? '—'}</td>
              <Chi row={r} names={names} />
              <td className="tabular">{r.gridPositionNumber ?? '—'}</td>
              <td className="tabular"><Delta grid={r.gridPositionNumber} pos={r.positionNumber} /></td>
              <td className="tabular">{r.points || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Le colonne Q1/Q2/Q3 esistono solo dal 2006 in poi: prima c'era un tempo
 * unico. Mostrarle sempre significherebbe stampare due colonne vuote su
 * buona parte dell'archivio, quindi la tabella cambia forma con l'epoca.
 */
function QualiTable({ quali, names }) {
  const { rows, hasSegments } = quali;
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">Pos</th>
            <th scope="col">Pilota</th>
            <th scope="col">Scuderia</th>
            {hasSegments ? (
              <>
                <th scope="col">Q1</th>
                <th scope="col">Q2</th>
                <th scope="col">Q3</th>
              </>
            ) : (
              <th scope="col">Tempo</th>
            )}
            <th scope="col">Distacco</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.driverId} className={rowCls(r.constructorId)}>
              <td className="tabular font-bold">{r.positionText ?? '—'}</td>
              <Chi row={r} names={names} />
              {hasSegments ? (
                <>
                  <td className="tabular">{r.q1 || '—'}</td>
                  <td className="tabular">{r.q2 || '—'}</td>
                  <td className="tabular">{r.q3 || '—'}</td>
                </>
              ) : (
                <td className="tabular">{r.best || '—'}</td>
              )}
              <td className="tabular text-[var(--fr-text-faint)]">{r.gap || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SprintTable({ sprint, names }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">Pos</th>
            <th scope="col">Pilota</th>
            <th scope="col">Scuderia</th>
            <th scope="col">Griglia</th>
            <th scope="col">Δ</th>
            <th scope="col">Distacco</th>
            <th scope="col">Punti</th>
          </tr>
        </thead>
        <tbody>
          {sprint.map(r => (
            <tr key={r.driverId} className={rowCls(r.constructorId)}>
              <td className="tabular font-bold">{r.positionText ?? '—'}</td>
              <Chi row={r} names={names} />
              <td className="tabular">{r.gridPositionNumber ?? '—'}</td>
              <td className="tabular"><Delta grid={r.gridPositionNumber} pos={r.positionNumber} /></td>
              <td className="tabular text-[var(--fr-text-faint)]">{r.gap || '—'}</td>
              <td className="tabular">{r.points || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Selettore di sessione. Compare solo se c'è più di una sessione da mostrare. */
function SessionTabs({ tabs, active, onChange }) {
  return (
    <div role="tablist" aria-label="Sessioni del weekend" className="flex gap-1">
      {tabs.map(t => {
        const on = t.key === active;
        return (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={on}
            onClick={() => onChange(t.key)}
            className={`px-3 py-1.5 rounded-[9px] text-xs font-bold uppercase tracking-wider transition-colors ${
              on
                ? 'bg-[var(--fr-red)] text-white'
                : 'bg-[var(--fr-surface-2)] text-[var(--fr-text-muted)] hover:text-[var(--fr-text)]'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export default function GpDetail() {
  const router = useRouter();
  const { year, round } = router.query;

  const [race, setRace] = useState(null);
  const [results, setResults] = useState([]);
  const [quali, setQuali] = useState(null);
  const [sprint, setSprint] = useState([]);
  const [names, setNames] = useState({ drivers: {}, constructors: {} });
  const [tab, setTab] = useState('gara');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Senza isReady i parametri sono vuoti al primo render e la pagina
    // resterebbe in caricamento per sempre.
    if (!router.isReady) return;
    if (!year || !round) { setLoading(false); return; }

    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const r = await getRace(Number(year), Number(round));
        if (!alive) return;
        setRace(r);
        if (r) {
          // Le tre sessioni si leggono in parallelo: sono indipendenti fra loro.
          const [res, q, sp] = await Promise.all([
            getRaceResults(r.id),
            getQualifying(r.id),
            getSprint(r.id),
          ]);
          if (!alive) return;
          setResults(res);
          setQuali(q);
          setSprint(sp);
          setTab('gara');
          // Un nome solo per tutte le sessioni: in qualifica può comparire chi
          // non si è qualificato e quindi manca dall'ordine d'arrivo.
          setNames(await getNames([...res, ...(q?.rows || []), ...sp]));
        }
        setError(null);
      } catch (e) {
        // Il messaggio tecnico serve a chi sviluppa, non a chi legge.
        console.error('Analisi GP:', e);
        if (alive) setError('Non riusciamo a raggiungere l\u2019archivio dati. Riprova fra poco.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [router.isReady, year, round]);

  if (loading) return <PageShell><PageLoading label="Caricamento Gran Premio…" /></PageShell>;

  if (error) return (
    <PageShell>
      <PageHeader eyebrow="Stagione" title="Analisi GP" breadcrumb={[{ label: 'Stagione' }, { label: 'Analisi GP', href: '/gp' }]} />
      <PageError message={error} onRetry={() => router.reload()} />
      <p className="text-center"><Link href="/gp" className="btn btn-outline">Tutti i Gran Premi</Link></p>
    </PageShell>
  );

  if (!race) return (
    <PageShell>
      <PageHeader eyebrow="Stagione" title="Analisi GP" breadcrumb={[{ label: 'Stagione' }, { label: 'Analisi GP', href: '/gp' }]} />
      <PageError
        title="Gran Premio non trovato"
        message="Questa gara non è presente in archivio. Controlla anno e round."
      />
      <p className="text-center"><Link href="/gp" className="btn btn-outline">Tutti i Gran Premi</Link></p>
    </PageShell>
  );

  const title = race.official_name || race.circuit?.name || `Round ${race.round}`;
  const date = formatDate(race.date);
  const flag = getFlagCode(race.circuit?.country_id || '');
  const ferrari = ferrariSummary(results);
  const podium = results.filter(r => r.positionNumber && r.positionNumber <= 3);
  const hasResults = results.length > 0;

  const tabs = [
    { key: 'gara',       label: 'Gara' },
    quali?.rows?.length && { key: 'qualifiche', label: 'Qualifiche' },
    sprint.length       && { key: 'sprint',     label: 'Sprint' },
  ].filter(Boolean);

  // Passando da un GP con sprint a uno senza, la scheda selezionata resterebbe
  // puntata su una sessione che qui non esiste: si ripiega sulla gara.
  const activeTab = tabs.some(t => t.key === tab) ? tab : 'gara';

  const seo = {
    title: `${title} ${race.year} — risultati e analisi`,
    description: `Risultati, griglia di partenza e posizioni guadagnate nel ${title} ${race.year}${race.circuit?.name ? ` a ${race.circuit.name}` : ''}.`,
    path: `/gp/${race.year}/${race.round}`,
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${title} ${race.year}`,
    startDate: race.date || undefined,
    sport: 'Formula 1',
    location: race.circuit?.name
      ? { '@type': 'Place', name: race.circuit.name, address: race.circuit.place_name || undefined }
      : undefined,
  };

  return (
    <PageShell seo={{ ...seo, jsonLd }} wide>
      <PageHeader
        eyebrow={`Round ${race.round} · Stagione ${race.year}`}
        title={title}
        subtitle={[race.circuit?.name, race.circuit?.place_name, date].filter(Boolean).join(' · ')}
        breadcrumb={[
          { label: 'Stagione' },
          { label: 'Analisi GP', href: '/gp' },
          { label: `${race.year} · R${race.round}` },
        ]}
        actions={flag ? (
          <img src={`https://flagcdn.com/w80/${flag}.png`} alt="" width={48} height={36} className="w-12 rounded-sm" />
        ) : null}
      />

      {!hasResults && (
        <div className="empty-state">
          <Trophy className="empty-state-icon" aria-hidden="true" />
          <p className="empty-state-title">Risultati non disponibili</p>
          <p className="empty-state-description">
            Questa gara non si è ancora disputata, oppure i risultati non sono in archivio.
          </p>
        </div>
      )}

      {hasResults && (
        <div className="grid gap-6">

          {/* Podio */}
          {podium.length > 0 && (
            <Panel title="Podio" icon={Trophy}>
              <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--fr-border)]">
                {podium.map(r => (
                  <div key={r.driverId} className="px-5 py-6 text-center">
                    <div className="tabular text-[34px] font-bold leading-none text-[var(--fr-red)]">
                      {r.positionNumber}
                    </div>
                    <div className="text-sm font-bold text-[var(--fr-text)] mt-2">
                      {names.drivers[r.driverId] || r.driverId}
                    </div>
                    <div className="text-xs text-[var(--fr-text-faint)] mt-0.5">
                      {names.constructors[r.constructorId] || r.constructorId}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Ferrari — è un sito sulla Rossa: viene prima del resto */}
          {ferrari && (
            <Panel title="Il weekend della Ferrari" icon={TrendingUp}>
              <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-[var(--fr-border)]">
                <StatTile
                  value={ferrari.best?.positionText ?? '—'}
                  label="Miglior piazzamento"
                  accent
                />
                <StatTile value={ferrari.points} label="Punti conquistati" />
                <StatTile
                  value={ferrari.gained > 0 ? `+${ferrari.gained}` : ferrari.gained}
                  label="Posizioni guadagnate"
                />
              </div>
            </Panel>
          )}

          {/* Dalla griglia all'arrivo — grafico riusato dal vecchio Live Timing */}
          <Panel title="Dalla griglia all'arrivo">
            <div className="p-4">
              <GridToRaceChart raceResults={results} year={race.year} grandPrix={title} />
            </div>
          </Panel>

          {/* Le sessioni del weekend. Qualifiche e sprint compaiono solo dove
              esistono: per 640 gare su 1.171 l'archivio non ha qualifiche, e la
              sprint riguarda 29 gare in tutto. */}
          <Panel
            title={SESSION_LABEL[activeTab]}
            actions={tabs.length > 1 ? (
              <SessionTabs tabs={tabs} active={activeTab} onChange={setTab} />
            ) : null}
          >
            {activeTab === 'gara'       && <RaceTable results={results} names={names} />}
            {activeTab === 'qualifiche' && <QualiTable quali={quali} names={names} />}
            {activeTab === 'sprint'     && <SprintTable sprint={sprint} names={names} />}

            {activeTab === 'qualifiche' && quali.label && (
              <p className="px-4 pb-4 text-xs text-[var(--fr-text-faint)]">
                In archivio per questa gara c&apos;è solo la {quali.label.toLowerCase()} di qualifica.
              </p>
            )}
          </Panel>

          {/* Rimando all'app nel momento giusto: qui l'utente sta guardando
              punti e classifica, ed è lì che GridUp risponde alla domanda dopo. */}
          <aside className="rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-head text-xl font-black uppercase text-[var(--fr-text)]">
                E ora chi può vincere il Mondiale?
              </p>
              <p className="text-sm text-[var(--fr-text-muted)] mt-1 max-w-[52ch]">
                GridUp calcola i punti che servono per il titolo e mostra gli scenari aggiornati
                dopo ogni Gran Premio.
              </p>
            </div>
            <a
              href={GRIDUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary shrink-0"
            >
              <Smartphone className="w-4 h-4" aria-hidden="true" />
              Apri GridUp
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </aside>
        </div>
      )}
    </PageShell>
  );
}
