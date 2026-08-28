'use client';
/**
 * pages/gp/index.jsx
 * Indice delle analisi per Gran Premio: scegli la stagione, poi la gara.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Flag, ChevronRight } from 'lucide-react';
import PageShell, { PageHeader, PageLoading, PageError } from '../../components/ui/PageShell';
import { getSeasons, getSeasonRaces } from '../../lib/f1/gp';
import { getFlagCode } from '../../lib/flags';

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
}

function RaceCard({ race }) {
  const flag = getFlagCode(race.circuit?.country_id || '');
  const date = formatDate(race.date);
  const isPast = race.date && new Date(race.date) <= new Date();

  return (
    <Link
      href={`/gp/${race.year}/${race.round}`}
      className="group flex items-center gap-4 p-4 rounded-[var(--radius-md)] border border-[var(--fr-border)] bg-[var(--fr-surface)] hover:border-[var(--fr-red)]/40 hover:-translate-y-0.5 transition-all"
    >
      <span className="tabular w-10 shrink-0 text-center text-sm font-bold text-[var(--fr-text-faint)]">
        {String(race.round).padStart(2, '0')}
      </span>

      {flag ? (
        <img
          src={`https://flagcdn.com/w40/${flag}.png`}
          alt=""
          width={28}
          height={21}
          loading="lazy"
          className="w-7 rounded-sm shrink-0"
        />
      ) : (
        <span className="w-7 h-5 rounded-sm bg-[var(--fr-surface-2)] shrink-0" aria-hidden="true" />
      )}

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[var(--fr-text)] truncate">
          {race.official_name || race.circuit?.name || `Round ${race.round}`}
        </span>
        <span className="block text-xs text-[var(--fr-text-faint)] truncate">
          {[race.circuit?.name, date].filter(Boolean).join(' · ')}
        </span>
      </span>

      {!isPast && (
        <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-[var(--fr-surface-2)] text-[var(--fr-text-faint)] shrink-0">
          In programma
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-[var(--fr-text-faint)] group-hover:text-[var(--fr-red)] transition-colors shrink-0" aria-hidden="true" />
    </Link>
  );
}

export default function GpIndex() {
  const [seasons, setSeasons] = useState([]);
  const [season, setSeason] = useState(null);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ys = await getSeasons();
        if (!alive) return;
        setSeasons(ys);
        setSeason(ys[0] ?? null);
      } catch (e) {
        console.error('Analisi GP — stagioni:', e);
        if (alive) setError('Non riusciamo a raggiungere l\u2019archivio dati. Riprova fra poco.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (season == null) return;
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const rs = await getSeasonRaces(season);
        if (alive) { setRaces(rs); setError(null); }
      } catch (e) {
        console.error('Analisi GP — calendario:', e);
        if (alive) setError('Non riusciamo a caricare il calendario. Riprova fra poco.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [season]);

  const seo = {
    title: season ? `Analisi Gran Premi ${season}` : 'Analisi Gran Premi',
    description: 'Analisi gara per gara della Formula 1: risultati, griglia di partenza, posizioni guadagnate e il weekend della Ferrari.',
    path: '/gp',
  };

  const picker = seasons.length > 0 && (
    <label className="flex items-center gap-2">
      <span className="sr-only">Stagione</span>
      <select value={season ?? ''} onChange={(e) => setSeason(Number(e.target.value))} className="select">
        {seasons.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </label>
  );

  return (
    <PageShell seo={seo}>
      <PageHeader
        eyebrow="Stagione · Gara per gara"
        title="Analisi"
        accent="GP"
        subtitle="Ogni Gran Premio nel dettaglio: chi ha guadagnato posizioni dalla griglia all'arrivo, i punti raccolti e com'è andata la Ferrari."
        breadcrumb={[{ label: 'Stagione' }, { label: 'Analisi GP' }]}
        actions={picker}
      />

      {error && <PageError message={error} />}
      {loading && !error && <PageLoading label="Caricamento calendario…" />}

      {!loading && !error && races.length === 0 && (
        <div className="empty-state">
          <Calendar className="empty-state-icon" aria-hidden="true" />
          <p className="empty-state-title">Nessuna gara</p>
          <p className="empty-state-description">Per questa stagione non risultano gare in archivio.</p>
        </div>
      )}

      {!loading && !error && races.length > 0 && (
        <div className="grid gap-2.5">
          {races.map(r => <RaceCard key={r.id} race={r} />)}
        </div>
      )}

      <p className="mt-10 flex items-center gap-2 text-xs text-[var(--fr-text-faint)]">
        <Flag className="w-3.5 h-3.5" aria-hidden="true" />
        Dati dall&apos;archivio storico F1DB.
      </p>
    </PageShell>
  );
}
