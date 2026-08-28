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
import { getRace, getRaceResults, getNames, ferrariSummary } from '../../../lib/f1/gp';
import { getFlagCode } from '../../../lib/flags';

const GRIDUP_URL = 'https://gridup-f1.web.app';

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

export default function GpDetail() {
  const router = useRouter();
  const { year, round } = router.query;

  const [race, setRace] = useState(null);
  const [results, setResults] = useState([]);
  const [names, setNames] = useState({ drivers: {}, constructors: {} });
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
          const res = await getRaceResults(r.id);
          if (!alive) return;
          setResults(res);
          setNames(await getNames(res));
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

          {/* Ordine d'arrivo */}
          <Panel title="Ordine d'arrivo">
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
                  {results.map(r => {
                    const isFerrari = r.constructorId === 'ferrari';
                    return (
                      <tr key={r.driverId} className={isFerrari ? 'bg-[var(--fr-red-soft)]' : undefined}>
                        <td className="tabular font-bold">{r.positionText ?? '—'}</td>
                        <td className={isFerrari ? 'text-[var(--fr-text)] font-semibold' : undefined}>
                          {names.drivers[r.driverId] || r.driverId}
                        </td>
                        <td>{names.constructors[r.constructorId] || r.constructorId}</td>
                        <td className="tabular">{r.gridPositionNumber ?? '—'}</td>
                        <td className="tabular"><Delta grid={r.gridPositionNumber} pos={r.positionNumber} /></td>
                        <td className="tabular">{r.points || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
