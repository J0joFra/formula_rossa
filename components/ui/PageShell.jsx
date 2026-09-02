'use client';
/**
 * components/ui/PageShell.jsx
 * Guscio condiviso delle pagine interne.
 *
 * Prima ogni pagina ripeteva a mano lo stesso scheletro (Navigation, <main>,
 * Footer) con valori diversi: sfondo `bg-black` o `bg-zinc-950` o token, e
 * spaziatura superiore `pt-32` o `pt-24`. Con la navbar a 70px il risultato
 * era un allineamento diverso da pagina a pagina.
 */

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import Navigation from '../ferrari/Navigation';
import Footer from '../ferrari/Footer';
import SEO from '../seo';
import { useI18n } from '../../lib/i18n';

/** Intestazione di pagina: occhiello, titolo, sottotitolo e briciole di pane. */
export function PageHeader({ eyebrow, title, accent, subtitle, breadcrumb, actions }) {
  return (
    <header className="mb-8 md:mb-10">
      {breadcrumb?.length > 0 && (
        <nav aria-label="Percorso" className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--fr-text-faint)] mb-5">
          <Link href="/" className="hover:text-[var(--fr-red)] transition-colors">Home</Link>
          {breadcrumb.map((b) => (
            <React.Fragment key={b.label}>
              <ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" />
              {b.href
                ? <Link href={b.href} className="hover:text-[var(--fr-red)] transition-colors">{b.label}</Link>
                : <span className="text-[var(--fr-red)] truncate">{b.label}</span>}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <span className="fr-eyebrow block mb-3">{eyebrow}</span>}
          <h1 className="uppercase">
            {title}{accent && <> <span className="text-[var(--fr-red)]">{accent}</span></>}
          </h1>
          {subtitle && (
            <p className="text-[var(--fr-text-muted)] mt-3 max-w-[60ch]">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}

/** Stato di caricamento coerente su tutte le pagine. */
/* Le tre stringhe di stato erano scritte in italiano come valori di default
   dei parametri, quindi restavano in italiano su tutto il sito anche cambiando
   lingua. Il default ora è la chiave tradotta; chi passa un `label` proprio
   continua a vincere. */
export function PageLoading({ label }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-4" role="status" aria-live="polite">
      <Loader2 className="w-7 h-7 text-[var(--fr-red)] animate-spin" aria-hidden="true" />
      <p className="text-sm text-[var(--fr-text-muted)]">{label || t('loading')}</p>
    </div>
  );
}

/** Stato di errore: dice cosa è andato storto e come riprovare. */
export function PageError({ title, message, onRetry }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center" role="alert">
      <span className="w-12 h-12 rounded-2xl grid place-items-center bg-[var(--fr-red-soft)]">
        <AlertCircle className="w-6 h-6 text-[var(--fr-red)]" aria-hidden="true" />
      </span>
      <div>
        <p className="font-head text-2xl font-black uppercase">{title || t('err_title')}</p>
        {message && <p className="text-sm text-[var(--fr-text-muted)] mt-1.5 max-w-[46ch]">{message}</p>}
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-outline mt-1">
          {t('retry')}
        </button>
      )}
    </div>
  );
}

/** Riquadro standard per raggruppare contenuti. */
export function Panel({ title, icon: Icon, actions, children, className = '' }) {
  return (
    <section className={`rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--fr-border)]">
          <h2 className="flex items-center gap-2 text-base font-black uppercase tracking-wide">
            {Icon && <Icon className="w-4 h-4 text-[var(--fr-red)]" aria-hidden="true" />}
            {title}
          </h2>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/** Cella statistica: numero grande in mono, etichetta sotto. */
export function StatTile({ value, label, accent = false, loading = false }) {
  return (
    <div className="px-5 py-6 text-center">
      <div className={`tabular text-[30px] md:text-[34px] font-bold leading-none tracking-tight ${accent ? 'text-[var(--fr-red)]' : 'text-[var(--fr-text)]'}`}>
        {loading
          ? <span className="skeleton block w-20 h-8 mx-auto rounded-lg" aria-label="Caricamento" role="status" />
          : value}
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--fr-text-faint)] mt-2">
        {label}
      </div>
    </div>
  );
}

/**
 * Guscio della pagina. `wide` allarga il contenitore per tabelle e griglie.
 */
export default function PageShell({
  children,
  seo,
  wide = false,
  className = '',
}) {
  /* Nessun fondo opaco qui: lo dipinge `body`. Un `bg-[var(--fr-bg)]` a tutta
     pagina coprirebbe gli aloni ambientali di _app.jsx, che dopo il passaggio a
     `-z-10` stanno dietro il contenuto e non più davanti. */
  return (
    <div className={`min-h-screen text-[var(--fr-text)] ${className}`}>
      {seo && <SEO {...seo} />}
      <Navigation />
      {/* pt-[70px] compensa la navbar fissa; il resto è respiro verticale */}
      <main className={`${wide ? 'max-w-[1400px]' : 'max-w-wrap'} mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(70px+2.5rem)] pb-20`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
