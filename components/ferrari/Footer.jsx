'use client';
/**
 * components/ferrari/Footer.jsx
 * Piede di pagina.
 *
 * Prima erano quattro colonne dentro altrettanti riquadri, ognuna con la riga
 * link riscritta da capo (icona propria + chevron che compariva al passaggio del
 * mouse), su uno sfondo con tre aloni sfocati, una griglia telemetrica e cinque
 * barrette che pulsavano. Molta grafica per quello che un piede di pagina deve
 * fare: dire dove si va.
 *
 * Le sezioni ora ricalcano il menu, così il footer è una seconda via per gli
 * stessi posti invece di un elenco parallelo con criteri suoi — dove infatti
 * "Fan Zone" e "Contatti" stavano sotto "Stagione", e le Analisi GP mancavano
 * del tutto.
 */

import React from 'react';
import Link from 'next/link';
import {
  Instagram, Twitter, Youtube, Linkedin, Mail, Heart,
} from 'lucide-react';
import { GRIDUP_URL } from '../../lib/gridup';

const SEZIONI = [
  {
    titolo: 'Archivio',
    voci: [
      { label: 'Statistiche',    href: '/statistics' },
      { label: 'Piloti',  href: '/piloti' },
      { label: 'Circuiti', href: '/circuiti' },
    ],
  },
  {
    titolo: 'Stagione',
    voci: [
      { label: 'Classifiche', href: '/standings' },
      { label: 'Analisi GP',        href: '/gp' },
      { label: 'News',      href: '/news' },
    ],
  },
  {
    titolo: 'Progetto',
    voci: [
      { label: 'Fanta GP', href: '/fanta' },
      { label: 'Fan Zone', href: '/fanzone' },
      { label: 'Chi siamo',   href: '/about' },
      /* "Contatti" non era una pagina: era un `mailto:` con l'etichetta di una
         pagina, quindi cliccandolo si apriva il client di posta invece di
         aprirsi una pagina — e su un telefono senza client configurato non
         succedeva niente. La stessa email ora sta fra le icone qui sotto, con
         l'icona della posta, che dice cosa fa prima di cliccarci. */
      { label: 'App GridUp',    href: GRIDUP_URL },
    ],
  },
];

const LEGALI = [
  { label: 'Privacy', href: '/legal/privacy' },
  { label: 'Cookie', href: '/legal/cookies' },
  { label: 'Termini',   href: '/legal/terms' },
];

const SOCIAL = [
  { icon: Linkedin,      href: 'https://www.linkedin.com/company/formula-rossa/',       label: 'Formula Rossa su LinkedIn' },
  { icon: Youtube,       href: 'https://www.youtube.com/@jofrancalanci',                label: 'Formula Rossa su YouTube' },
  { icon: Instagram,     href: 'https://www.instagram.com/formularossa.it',             label: 'Formula Rossa su Instagram' },
  { icon: Twitter,       href: 'https://www.x.com/jofrancalanci',                       label: 'Formula Rossa su X' },
  /* L'email in fondo, dopo i social: non è un profilo da seguire, è il modo
     di scrivere a qualcuno, e va cercata lì dove si cerca un contatto. */
  { icon: Mail,          href: 'mailto:info@formula-rossa.it',                          label: 'Scrivi a info@formula-rossa.it' },
];

const CLS_LINK =
  'text-sm text-[var(--fr-text-muted)] hover:text-[var(--fr-red)] transition-colors';

/** Un link solo, interno o esterno: prima questa riga era riscritta quattro volte. */
function FooterLink({ href, label, className = CLS_LINK }) {
  const esterno = href.startsWith('http') || href.startsWith('mailto:');
  if (!esterno) return <Link href={href} className={className}>{label}</Link>;
  return (
    <a
      href={href}
      className={className}
      {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
    </a>
  );
}

export default function Footer() {
  const anno = new Date().getFullYear();
  // 1950 è la prima stagione, quindi va contata: dal 1950 al 2026 sono 77 stagioni.
  const stagioni = anno - 1950 + 1;

  /* `relative z-10` sul footer: in _app.jsx c'è uno sfondo ambientale
     `fixed inset-0` con tre aloni sfocati. Senza sollevare il footer, quegli
     aloni gli passano sopra e lo colorano di rosa. */
  return (
    <footer className="relative z-10 border-t border-[var(--fr-border)] bg-[var(--fr-surface)]">
      <div className="max-w-wrap mx-auto px-4 sm:px-6 lg:px-8 py-14">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">

          {/* ── Marchio ── */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <img
                src="/data/images/formula-rossa-logo.png"
                alt=""
                width={44}
                height={44}
                className="w-11 h-11 rounded-[13px] object-contain bg-[var(--fr-surface-2)] p-1"
              />
              <span>
                <span className="block font-head text-xl font-black tracking-tight text-[var(--fr-text)]">
                  FORMULA<span className="text-[var(--fr-red)]">ROSSA</span>
                </span>
                <span className="block text-[10px] uppercase tracking-[0.18em] text-[var(--fr-text-faint)]">
                  Data Intelligence
                </span>
              </span>
            </Link>

            <p className="text-sm text-[var(--fr-text-muted)] mt-5 max-w-[42ch]">
              Piattaforma indipendente dedicata alle statistiche e alla storia della Scuderia Ferrari in Formula 1.
            </p>

            {/* Due numeri verificabili, non slogan: le stagioni si calcolano, le gare
                sono quelle in archivio (1.171 a oggi, arrotondate per difetto così
                la cifra resta vera anche quando il calendario cresce). */}
            <p className="text-xs text-[var(--fr-text-faint)] mt-3">
              {stagioni} stagioni · oltre 1.100 gran premi in archivio
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              {SOCIAL.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  /* `target="_blank"` solo per i link web. Su un `mailto:`
                     aprirebbe una scheda vuota che resta lì dopo che il client
                     di posta è partito. */
                  {...(s.href.startsWith('http')
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  aria-label={s.label}
                  title={s.label}
                  className="w-11 h-11 rounded-[13px] grid place-items-center bg-[var(--fr-surface-2)] text-[var(--fr-text-muted)] hover:bg-[var(--fr-red)] hover:text-white transition-colors"
                >
                  <s.icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Le tre sezioni, nello stesso ordine del menu ── */}
          {SEZIONI.map((sezione) => (
            <nav key={sezione.titolo} aria-label={sezione.titolo}>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--fr-text-faint)] mb-4">
                {sezione.titolo}
              </h2>
              <ul className="space-y-2.5">
                {sezione.voci.map((v) => (
                  <li key={v.href}>
                    <FooterLink href={v.href} label={v.label} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Il disclaimer di non affiliazione sta in /about e in /legal/privacy,
           dove chi lo cerca lo trova: qui occupava otto righe sotto ogni pagina
           del sito per dire una cosa che nessuno legge due volte. */}

        {/* Testo per i motori di ricerca: non aggiunge rumore alla pagina. */}
        <p className="sr-only">
          Formula Rossa è la piattaforma italiana dedicata alle statistiche e all&apos;analisi
          dati della Scuderia Ferrari in Formula 1: {stagioni} stagioni di storia, schede
          piloti e circuiti, classifiche aggiornate e analisi di ogni Gran Premio.
        </p>

        {/* ── Riga di chiusura: una riga sola, con le voci legali separate da
               punti invece che da spazi vuoti, così su mobile si capisce dove
               finisce un link e comincia il successivo. ── */}
        <div className="mt-10 pt-6 border-t border-[var(--fr-border)] flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[var(--fr-text-faint)]">
            <span>© {anno} Formula Rossa · sviluppato da</span>
            <a
              href="https://github.com/J0joFra"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--fr-text-muted)] hover:text-[var(--fr-red)] transition-colors"
            >
              Joaquim Francalanci
            </a>
          </p>

          <nav
            aria-label="Note legali"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--fr-text-faint)]"
          >
            {LEGALI.map((l, i) => (
              <React.Fragment key={l.href}>
                {i > 0 && <span aria-hidden="true" className="text-[var(--fr-text-faint)]">·</span>}
                <FooterLink
                  href={l.href}
                  label={l.label}
                  className="hover:text-[var(--fr-red)] transition-colors"
                />
              </React.Fragment>
            ))}
            <span aria-hidden="true" className="text-[var(--fr-text-faint)]">·</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))}
              className="hover:text-[var(--fr-red)] transition-colors"
            >
              Preferenze cookie
            </button>
          </nav>
        </div>

      </div>
    </footer>
  );
}
