import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import PageShell, { PageHeader, PageLoading, PageError, Panel, StatTile } from '../../components/ui/PageShell';
import { motion } from 'framer-motion';
import { User, Trophy, Timer, Zap, Star, Award, Gauge } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

/* ─── Config — ora solo metadati, niente query ──────────────────────────── */
const CONFIG = {
  'wins': {
    title: 'Vittorie GP',
    subtitle: 'Race Wins',
    description: 'Ogni volta che un pilota ha tagliato il traguardo in prima posizione con una Ferrari.',
    field: 'wins',
    color: 'var(--fr-red)',
    colorMuted: 'var(--fr-red-soft)',
    icon: Trophy,
  },
  'podiums': {
    title: 'Podi Totali',
    subtitle: 'Podium Finishes',
    description: 'Piazzamenti tra i primi tre classificati: simbolo di costanza al vertice.',
    field: 'podiums',
    color: 'var(--fr-accent-amber)',
    colorMuted: 'color-mix(in srgb, var(--fr-accent-amber) 14%, transparent)',
    icon: Star,
  },
  'poles': {
    title: 'Pole Positions',
    subtitle: 'Starting Grid P1',
    description: 'Il miglior tempo assoluto in qualifica: la perfezione espressa in un singolo giro.',
    field: 'poles',
    color: 'var(--fr-red)',
    colorMuted: 'var(--fr-red-soft)',
    icon: Timer,
  },
  'fastest-laps': {
    title: 'Giri Veloci',
    subtitle: 'Fastest Laps',
    description: 'Il giro più rapido in gara: velocità pura della vettura e talento assoluto.',
    field: 'fastest_laps',
    color: 'var(--fr-accent-amber)',
    colorMuted: 'color-mix(in srgb, var(--fr-accent-amber) 14%, transparent)',
    icon: Zap,
  },
  'points': {
    title: 'Punti Storici',
    subtitle: 'All-Time Points',
    description: 'La somma totale dei punti conquistati, calcolata su tutti i sistemi di punteggio F1 dal 1950.',
    field: 'points',
    isSum: true,
    color: 'var(--fr-red)',
    colorMuted: 'var(--fr-red-soft)',
    icon: Gauge,
  },
  'grand-slams': {
    title: 'Grand Slams',
    subtitle: 'Perfect Weekends',
    description: "L'impresa suprema: Pole, Vittoria, Giro Veloce e in testa dal primo all'ultimo giro.",
    field: 'grand_slams',
    color: 'var(--fr-accent-amber)',
    colorMuted: 'color-mix(in srgb, var(--fr-accent-amber) 14%, transparent)',
    icon: Award,
  },
};

/* ─── Colori del podio ──────────────────────────────────────────────────────
   Erano tre hex fissi: `#DC0000` come testo sul fondo scuro scendeva a 3,2:1,
   e argento e bronzo, chiari, sparivano sul tema chiaro. Ora oro/argento/bronzo
   passano dai token, che cambiano con il tema. */
const MEDAL = [
  { ring: 'var(--fr-red)',            label: '1°' },
  { ring: 'var(--fr-text-muted)',     label: '2°' },
  { ring: 'var(--fr-accent-orange)',  label: '3°' },
];

/* ─── Driver row ────────────────────────────────────────────────────────── */
function DriverRow({ driver, index, max, cfg }) {
  const pct = max > 0 ? (driver.count / max) * 100 : 0;
  const medal = MEDAL[index] ?? null;
  const displayValue = cfg.isSum
    ? Math.floor(driver.count).toLocaleString('it-IT')
    : driver.count.toLocaleString('it-IT');

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: 'easeOut' }}
      className="group relative flex items-center gap-4 md:gap-6 px-5 md:px-8 py-5 border-b border-[var(--fr-border)] last:border-0 hover:bg-[var(--fr-surface-2)] transition-colors duration-200"
    >
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: cfg.color }}
      />

      {/* Rank */}
      <div className="shrink-0 w-10 md:w-14 text-right select-none">
        {index < 3 ? (
          <span className="text-xs font-black tracking-widest" style={{ color: medal.ring }}>
            {medal.label}
          </span>
        ) : (
          <span className="text-2xl md:text-3xl font-black tabular-nums"
            style={{ color: 'var(--fr-text-dim)' }}>
            {index + 1}
          </span>
        )}
      </div>

      {/* Photo */}
      <div
        className="relative shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105"
        style={{
          border: `2px solid ${medal ? medal.ring : 'var(--fr-border)'}`,
          boxShadow: medal ? `0 0 16px color-mix(in srgb, ${medal.ring} 35%, transparent)` : 'none',
        }}
      >
        <img
          src={`/data/ferrari-drivers/${driver.id}.jpg`}
          alt={`Foto di ${driver.name}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
        <div
          className="absolute inset-0 items-center justify-center bg-[var(--fr-surface-2)]"
          style={{ display: 'none' }}
          aria-hidden="true"
        >
          <User className="w-5 h-5 text-[var(--fr-text-faint)]" />
        </div>
      </div>

      {/* Name + progress + years */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 mb-2 flex-wrap">
          <span
            className="text-base md:text-lg font-black uppercase tracking-tight group-hover:text-[var(--fr-red)] transition-colors truncate"
            style={{ color: medal ? medal.ring : 'var(--fr-text)' }}
          >
            {driver.name}
          </span>
          <span className="text-[10px] text-[var(--fr-text-faint)] font-mono shrink-0">
            {driver.first_year}
            {driver.last_year && driver.last_year !== driver.first_year ? ` – ${driver.last_year}` : ''}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-[var(--fr-surface-2)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: index * 0.04 + 0.2, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(to right, ${cfg.color}, ${cfg.color}99)` }}
          />
        </div>
      </div>

      {/* Value */}
      <div className="shrink-0 text-right">
        <span
          className="text-3xl md:text-4xl font-black tabular-nums"
          style={{ color: medal ? medal.ring : 'var(--fr-text)' }}
        >
          {displayValue}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function StatDetail() {
  const router = useRouter();
  const { type } = router.query;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const cfg = type ? CONFIG[type] : null;

  useEffect(() => {
    if (!type || !cfg || !supabase) return;

    async function loadStats() {
      setLoading(true);
      try {
        // Seleziona driver_id + il campo richiesto + join driver per il nome
        const { data: rows, error } = await supabase
          .from('driver_ferrari_stats')
          .select(`driver_id, first_year, last_year, ${cfg.field}, driver:driver_id(first_name, last_name)`)
          .order(cfg.field, { ascending: false })
          .gt(cfg.field, 0)
          .limit(50);

        if (error) throw error;

        const formatted = (rows ?? []).map(row => ({
          id:         row.driver_id,
          name:       row.driver
                        ? `${row.driver.first_name} ${row.driver.last_name}`
                        : row.driver_id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          count:      Number(row[cfg.field]) || 0,
          first_year: row.first_year,
          last_year:  row.last_year,
        }));

        setData(formatted);
        setLoadError(null);
      } catch (err) {
        console.error('Errore caricamento stats:', err);
        setLoadError(err.message);
        setData([]);
      }
      setLoading(false);
    }

    loadStats();
  }, [type]);

  /* ── 404 per tipo non riconosciuto ── */
  if (!loading && !cfg) {
    return (
      <PageShell>
        <PageHeader
          eyebrow="Archivio"
          title="Classifica"
          breadcrumb={[{ label: 'Archivio' }, { label: 'Statistiche', href: '/statistics' }]}
        />
        <PageError
          title="Classifica non trovata"
          message={`Le classifiche disponibili sono: ${Object.keys(CONFIG).join(', ')}.`}
        />
        <p className="text-center">
          <Link href="/statistics" className="btn btn-outline">Torna alle statistiche</Link>
        </p>
      </PageShell>
    );
  }

  /* ── Loading ── */
  if (loading || !cfg) {
    return <PageShell><PageLoading label="Caricamento classifica…" /></PageShell>;
  }

  const Icon = cfg.icon;
  const max = data[0]?.count ?? 1;

  const seo = {
    title: `${cfg.title} Ferrari — classifica per pilota`,
    description: cfg.description,
    path: `/stats/${type}`,
  };

  return (
    <PageShell seo={seo}>
      <PageHeader
        eyebrow="Archivio · Statistiche"
        title={cfg.title}
        subtitle={cfg.description}
        breadcrumb={[
          { label: 'Archivio' },
          { label: 'Statistiche', href: '/statistics' },
          { label: cfg.title },
        ]}
        actions={
          <span
            className="w-11 h-11 rounded-[13px] grid place-items-center"
            style={{ background: cfg.colorMuted, color: cfg.color }}
            aria-hidden="true"
          >
            <Icon className="w-5 h-5" />
          </span>
        }
      />

      {/* Il messaggio di prima diceva a chi legge di creare una vista su
          Supabase: un'istruzione per chi sviluppa, mostrata a chi visita. */}
      {loadError && (
        <PageError message="Non riusciamo a raggiungere l’archivio dati. Riprova fra poco." />
      )}

      {!loadError && data.length === 0 && (
        <div className="empty-state">
          <Trophy className="empty-state-icon" aria-hidden="true" />
          <p className="empty-state-title">Nessun dato</p>
          <p className="empty-state-description">
            Per questa classifica non risultano piloti in archivio.
          </p>
        </div>
      )}

      {!loadError && data.length > 0 && (
        <div className="grid gap-6">
          <div className="grid grid-cols-3 rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] divide-x divide-[var(--fr-border)]">
            <StatTile value={data.length} label="Piloti in classifica" />
            <StatTile
              accent
              value={cfg.isSum ? Math.floor(max).toLocaleString('it-IT') : max}
              label="Record assoluto"
            />
            <StatTile value={data[0]?.name ?? '—'} label="Detenuto da" />
          </div>

          <Panel title={`Classifica ${cfg.title.toLowerCase()}`}>
            <div className="flex items-center gap-4 md:gap-6 px-5 md:px-8 py-4 border-b border-[var(--fr-border)] text-[10px] uppercase tracking-widest font-bold text-[var(--fr-text-faint)]">
              <div className="w-10 md:w-14" />
              <div className="w-12 md:w-14 shrink-0" />
              <div className="flex-1">Pilota</div>
              <div className="hidden md:block">Progressione</div>
              <div className="text-right shrink-0 w-20 md:w-24">Totale</div>
            </div>

            {data.map((driver, i) => (
              <DriverRow key={driver.id} driver={driver} index={i} max={max} cfg={cfg} />
            ))}
          </Panel>

          <p className="text-xs text-[var(--fr-text-faint)]">
            Archivio storico F1DB, dal 1950 al {new Date().getFullYear()}. Sono elencati i
            primi 50 piloti con almeno un risultato in questa classifica.
          </p>
        </div>
      )}
    </PageShell>
  );
}