import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';
import { motion } from 'framer-motion';
import { User, Trophy, Timer, Zap, Star, Award, Gauge, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = typeof window !== 'undefined'
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null;

/* ─── Config — ora solo metadati, niente query ──────────────────────────── */
const CONFIG = {
  'wins': {
    title: 'Vittorie GP',
    subtitle: 'Race Wins',
    description: 'Ogni volta che un pilota ha tagliato il traguardo in prima posizione con una Ferrari.',
    field: 'wins',
    color: '#DC0000',
    colorMuted: 'rgba(220,0,0,0.15)',
    icon: Trophy,
  },
  'podiums': {
    title: 'Podi Totali',
    subtitle: 'Podium Finishes',
    description: 'Piazzamenti tra i primi tre classificati: simbolo di costanza al vertice.',
    field: 'podiums',
    color: '#EAB308',
    colorMuted: 'rgba(234,179,8,0.15)',
    icon: Star,
  },
  'poles': {
    title: 'Pole Positions',
    subtitle: 'Starting Grid P1',
    description: 'Il miglior tempo assoluto in qualifica: la perfezione espressa in un singolo giro.',
    field: 'poles',
    color: '#DC0000',
    colorMuted: 'rgba(220,0,0,0.15)',
    icon: Timer,
  },
  'fastest-laps': {
    title: 'Giri Veloci',
    subtitle: 'Fastest Laps',
    description: 'Il giro più rapido in gara: velocità pura della vettura e talento assoluto.',
    field: 'fastest_laps',
    color: '#EAB308',
    colorMuted: 'rgba(234,179,8,0.15)',
    icon: Zap,
  },
  'points': {
    title: 'Punti Storici',
    subtitle: 'All-Time Points',
    description: 'La somma totale dei punti conquistati, calcolata su tutti i sistemi di punteggio F1 dal 1950.',
    field: 'points',
    isSum: true,
    color: '#DC0000',
    colorMuted: 'rgba(220,0,0,0.15)',
    icon: Gauge,
  },
  'grand-slams': {
    title: 'Grand Slams',
    subtitle: 'Perfect Weekends',
    description: "L'impresa suprema: Pole, Vittoria, Giro Veloce e in testa dal primo all'ultimo giro.",
    field: 'grand_slams',
    color: '#EAB308',
    colorMuted: 'rgba(234,179,8,0.15)',
    icon: Award,
  },
};

/* ─── Medal colors ──────────────────────────────────────────────────────── */
const MEDAL = [
  { ring: '#DC0000', glow: 'rgba(220,0,0,0.4)',     label: '1ST' },
  { ring: '#C0C0C0', glow: 'rgba(192,192,192,0.3)', label: '2ND' },
  { ring: '#CD7F32', glow: 'rgba(205,127,50,0.3)',  label: '3RD' },
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
      className="group relative flex items-center gap-4 md:gap-6 px-5 md:px-8 py-5 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors duration-200"
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
            style={{ color: 'rgba(255,255,255,0.1)' }}>
            {index + 1}
          </span>
        )}
      </div>

      {/* Photo */}
      <div
        className="relative shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105"
        style={{
          border: `2px solid ${medal ? medal.ring : 'rgba(255,255,255,0.08)'}`,
          boxShadow: medal ? `0 0 16px ${medal.glow}` : 'none',
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
          className="absolute inset-0 items-center justify-center bg-zinc-800"
          style={{ display: 'none' }}
          aria-hidden="true"
        >
          <User className="w-5 h-5 text-zinc-600" />
        </div>
      </div>

      {/* Name + progress + years */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 mb-2 flex-wrap">
          <span
            className="text-base md:text-lg font-black uppercase tracking-tight group-hover:text-red-400 transition-colors truncate"
            style={{ color: medal ? medal.ring : 'white' }}
          >
            {driver.name}
          </span>
          <span className="text-[10px] text-zinc-600 font-mono shrink-0">
            {driver.first_year}
            {driver.last_year && driver.last_year !== driver.first_year ? ` – ${driver.last_year}` : ''}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
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
          style={{ color: medal ? medal.ring : 'white' }}
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400 text-lg font-black uppercase tracking-widest">Categoria non trovata</p>
        <Link href="/statistics" className="text-red-500 underline text-sm">← Torna alle statistiche</Link>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading || !cfg) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="flex gap-1.5" aria-label="Caricamento">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-red-600"
              animate={{ height: ['12px', '32px', '12px'] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>
        <p className="text-zinc-600 text-[11px] tracking-[0.4em] uppercase font-black">
          Loading Ferrari History
        </p>
      </div>
    );
  }

  const Icon = cfg.icon;
  const max = data[0]?.count ?? 1;

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right,#DC0000 1px,transparent 1px),linear-gradient(to bottom,#DC0000 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] opacity-10"
          style={{ background: cfg.color }}
        />
      </div>

      <Navigation />

      <main className="relative z-10 max-w-5xl mx-auto pt-28 md:pt-36 px-4 pb-24">

        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-10"
        >
          <Link
            href="/statistics"
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-600 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Hall of Fame
          </Link>
        </motion.div>

        {/* Error banner */}
        {loadError && (
          <div className="mb-8 px-5 py-4 rounded-xl border border-red-500/30 bg-red-500/10">
            <p className="text-red-400 text-xs font-black uppercase tracking-widest">
              Errore caricamento dati — {loadError}
            </p>
            <p className="text-zinc-500 text-xs mt-1">
              Assicurati di aver creato la view <code className="text-red-400">driver_ferrari_stats</code> su Supabase.
            </p>
          </div>
        )}

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: cfg.colorMuted, border: `1px solid ${cfg.color}40` }}
            >
              <Icon className="w-4 h-4" style={{ color: cfg.color }} aria-hidden="true" />
            </div>
            <span className="text-[10px] tracking-[0.4em] uppercase font-black" style={{ color: cfg.color }}>
              Scuderia Ferrari — {cfg.subtitle}
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
            {cfg.title}
          </h1>

          <div
            className="max-w-2xl pl-5 py-3 rounded-r-xl"
            style={{ borderLeft: `3px solid ${cfg.color}`, background: cfg.colorMuted }}
          >
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed italic">
              {cfg.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 mt-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">Piloti in classifica</p>
              <p className="text-2xl font-black tabular-nums">{data.length}</p>
            </div>
            <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.06)' }} aria-hidden="true" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">Record assoluto</p>
              <p className="text-2xl font-black tabular-nums" style={{ color: cfg.color }}>
                {cfg.isSum ? Math.floor(max).toLocaleString('it-IT') : max}
              </p>
            </div>
            <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.06)' }} aria-hidden="true" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">Record di</p>
              <p className="text-sm font-black uppercase tracking-tight">{data[0]?.name ?? '—'}</p>
            </div>
          </div>
        </motion.header>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(10,10,10,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}
        >
          <div
            className="flex items-center gap-4 md:gap-6 px-5 md:px-8 py-4 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
          >
            <div className="w-10 md:w-14" />
            <div className="w-12 md:w-14 shrink-0" />
            <div className="flex-1 text-[10px] uppercase tracking-widest font-black text-zinc-600">Pilota</div>
            <div className="hidden md:block text-[10px] uppercase tracking-widest font-black text-zinc-600">Progressione</div>
            <div className="text-[10px] uppercase tracking-widest font-black text-zinc-600 text-right shrink-0 w-20 md:w-24">Totale</div>
          </div>

          {data.map((driver, i) => (
            <DriverRow key={driver.id} driver={driver} index={i} max={max} cfg={cfg} />
          ))}
        </motion.div>

        <p className="text-center text-zinc-700 text-[11px] mt-8 tracking-wider">
          Dati aggiornati · Scuderia Ferrari F1 1950 – {new Date().getFullYear()}
        </p>
      </main>

      <Footer />
    </div>
  );
}