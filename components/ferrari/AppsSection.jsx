'use client';
/**
 * components/ferrari/AppsSection.jsx
 * Le app di Formula Rossa: GridUp e Driver Clash. Entrambe si giocano anche
 * dal sito, in /gioca/<id>, e si scaricano da Google Play; testi e link
 * vengono da lib/apps.js.
 *
 * Usata in home e nella Fan Zone. `compact` toglie l'intestazione grande, per
 * quando la sezione sta dentro una pagina che ha già il suo titolo.
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, Smartphone, Swords, Calculator, TrendingUp, Trophy, FlaskConical,
  Play, Layers, Users, Package,
} from 'lucide-react';
import { APPS, playPath } from '../../lib/apps';

/* Le icone e i punti forti restano qui: sono presentazione, non dati. */
const EXTRA = {
  gridup: {
    Icon: Smartphone,
    punti: [
      { icon: Calculator, label: 'Punti per il titolo' },
      { icon: TrendingUp, label: 'Scenari live' },
      { icon: Trophy,     label: 'Classifiche' },
    ],
  },
  'driver-clash': {
    Icon: Swords,
    punti: [
      { icon: Layers,  label: '1.501 carte' },
      { icon: Users,   label: 'Sfida un amico' },
      { icon: Package, label: 'Pacchetti' },
    ],
  },
};

function Badge({ app }) {
  const live = app.status === 'live';
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
      style={live
        ? { background: 'color-mix(in srgb, var(--fr-teal) 16%, transparent)', color: 'var(--fr-teal)' }
        : { background: 'color-mix(in srgb, var(--fr-gold) 20%, transparent)', color: 'var(--fr-gold)' }}
    >
      {live ? null : <FlaskConical className="w-3 h-3" aria-hidden="true" />}
      {app.statusLabel}
    </span>
  );
}

function AppCard({ app, index }) {
  const { Icon, punti } = EXTRA[app.id];
  /* L'icona di GridUp è servita dalla web app: se non risponde, al suo posto
     resta l'icona disegnata invece di un'immagine rotta. */
  const [iconaRotta, setIconaRotta] = useState(false);
  const imgRef = useRef(null);
  /* Se l'errore arriva prima dell'idratazione, onError non scatta mai: si
     controlla l'immagine appena il componente è montato. */
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setIconaRotta(true);
  }, []);
  const esterno = app.url.startsWith('http');
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: .45, delay: index * .08 }}
      className="relative flex flex-col p-7 rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] shadow-[var(--fr-shadow-sm)] overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <span className="w-14 h-14 rounded-[16px] grid place-items-center overflow-hidden bg-[var(--fr-red-soft)] text-[var(--fr-red)]">
          {app.icon && !iconaRotta ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={app.icon}
              alt={`Icona dell’app ${app.name}`}
              width={56}
              height={56}
              className="w-full h-full object-contain"
              loading="lazy"
              onError={() => setIconaRotta(true)}
            />
          ) : (
            <Icon className="w-7 h-7" aria-hidden="true" />
          )}
        </span>
        <Badge app={app} />
      </div>

      <h3 className="uppercase text-2xl leading-none">{app.name}</h3>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--fr-red)] mt-2">{app.tagline}</p>
      <p className="text-sm text-[var(--fr-text-muted)] mt-3 mb-5">{app.desc}</p>

      {punti.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 mb-6">
          {punti.map((p) => (
            <li
              key={p.label}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[9px] bg-[var(--fr-surface-2)] text-[var(--fr-text-muted)]"
            >
              <p.icon className="w-3.5 h-3.5 text-[var(--fr-red)]" aria-hidden="true" />
              {p.label}
            </li>
          ))}
        </ul>
      )}

      {/* Prima strada: giocare subito dal sito. Seconda: l'app Android. */}
      <div className="mt-auto flex flex-wrap gap-2">
        <Link href={playPath(app)} className="btn btn-primary">
          <Play className="w-4 h-4 fill-current" aria-hidden="true" />
          {app.id === 'gridup' ? 'Apri GridUp' : 'Gioca ora'}
        </Link>
        <a
          href={app.url}
          {...(esterno ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="btn btn-outline"
        >
          {app.cta}
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </motion.article>
  );
}

export default function AppsSection({ compact = false }) {
  const griglia = (
    <div className="grid md:grid-cols-2 gap-5">
      {APPS.map((app, i) => <AppCard key={app.id} app={app} index={i} />)}
    </div>
  );

  if (compact) return griglia;

  return (
    <section
      aria-labelledby="apps-heading"
      className="snap-section py-12 md:py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-wrap mx-auto">
        <header className="mb-9">
          <span className="fr-eyebrow">Le app</span>
          <h2 id="apps-heading" className="uppercase mt-3">Formula Rossa in tasca</h2>
          <p className="text-[var(--fr-text-muted)] mt-2.5 max-w-[56ch]">
            Due app nate dallo stesso progetto: GridUp per seguire il Mondiale, Driver Clash per sfidarsi a colpi di carte. Si usano direttamente qui sul sito, o si scaricano su Android.
          </p>
        </header>
        {griglia}
      </div>
    </section>
  );
}
