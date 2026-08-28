'use client';
/**
 * pages/about.jsx
 * Chi siamo: cos'è Formula Rossa, come si divide il lavoro con l'app GridUp,
 * da dove vengono i dati e chi c'è dietro.
 *
 * Riscritta da 1.019 righe. La versione precedente conteneva una timeline con
 * tappe non più vere (AI Predictor, dati real-time: entrambi rimossi dal sito)
 * e tre video YouTube con conteggi di visualizzazioni scritti a mano.
 */

import Link from 'next/link';
import {
  BarChart3, Trophy, Gamepad2, Database, Github, Linkedin,
  Youtube, Instagram, Mail, Smartphone, ArrowUpRight, Shield,
} from 'lucide-react';
import PageShell, { PageHeader, Panel } from '../components/ui/PageShell';

const GRIDUP_URL = 'https://gridup-f1.web.app';

/* Un solo posto per gli anni di storia: scritto a mano in due punti diversi,
   prima o poi uno dei due resta indietro. */
const ANNI_DI_STORIA = new Date().getFullYear() - 1950;

const COSA_TROVI = [
  {
    icon: BarChart3,
    title: 'Archivio',
    text: `Statistiche storiche, schede piloti e circuiti: ${ANNI_DI_STORIA} anni di Ferrari in Formula 1, consultabili senza fretta.`,
    href: '/statistics',
    cta: 'Vai alle statistiche',
  },
  {
    icon: Trophy,
    title: 'Stagione',
    text: 'Il campionato in corso: classifiche aggiornate, analisi di ogni Gran Premio e notizie dal mondo Ferrari.',
    href: '/gp',
    cta: 'Vedi le analisi GP',
  },
  {
    icon: Gamepad2,
    title: 'Gioca',
    text: 'Mini-giochi a tema Ferrari per metterti alla prova tra un Gran Premio e l’altro.',
    href: '/fanzone',
    cta: 'Entra nella Fan Zone',
  },
];

const FONTI = [
  {
    nome: 'F1DB',
    url: 'https://github.com/f1db/f1db',
    text: 'Archivio storico open source della Formula 1: gare, risultati, piloti, costruttori e circuiti dal 1950.',
  },
  {
    nome: 'OpenF1',
    url: 'https://openf1.org',
    text: 'Dati di sessione (tempi, settori, posizioni) usati per le analisi dopo ogni Gran Premio.',
  },
];

const SOCIAL = [
  { icon: Github,    href: 'https://github.com/J0joFra',                      label: 'GitHub' },
  { icon: Linkedin,  href: 'https://www.linkedin.com/company/formula-rossa/', label: 'LinkedIn' },
  { icon: Youtube,   href: 'https://www.youtube.com/@jofrancalanci',          label: 'YouTube' },
  { icon: Instagram, href: 'https://www.instagram.com/formularossa.it',       label: 'Instagram' },
];

export default function AboutPage() {
  const seo = {
    title: 'Chi siamo',
    description: 'Formula Rossa è un progetto indipendente dedicato alle statistiche della Scuderia Ferrari in Formula 1. Come nasce, da dove vengono i dati e chi c’è dietro.',
    path: '/about',
  };

  return (
    <PageShell seo={seo}>
      <PageHeader
        eyebrow="Il progetto"
        title="Chi"
        accent="siamo"
        subtitle="Formula Rossa è un progetto indipendente, fatto da un tifoso per i tifosi: mettere in ordine i numeri della Scuderia Ferrari e renderli leggibili a chiunque."
        breadcrumb={[{ label: 'Chi siamo' }]}
      />

      <div className="grid gap-6">

        {/* ── Cos'è ── */}
        <section className="grid md:grid-cols-[1.2fr_.8fr] gap-6 items-center">
          <div>
            <h2 className="uppercase mb-4">Perché esiste</h2>
            <p className="mb-3">
              I dati della Formula 1 esistono già, ma sono sparsi: tabelle enormi, archivi tecnici,
              siti in inglese pensati per addetti ai lavori. Trovare una risposta semplice —
              quante gare ha vinto la Ferrari a Monza, chi ha guadagnato più posizioni domenica —
              richiede più lavoro di quanto dovrebbe.
            </p>
            <p>
              Formula Rossa nasce per questo: prendere {ANNI_DI_STORIA} anni di storia, tenerli in ordine e
              raccontarli con grafici che si capiscono al primo sguardo. Niente di più.
            </p>
          </div>
          <img
            src="/data/images/sf26.jpg"
            alt="Una monoposto della Scuderia Ferrari in pista"
            className="rounded-[var(--radius)] border border-[var(--fr-border)] w-full object-cover aspect-[4/3]"
            loading="lazy"
          />
        </section>

        {/* ── Cosa trovi ── */}
        <section>
          <h2 className="uppercase mb-5">Cosa trovi qui</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {COSA_TROVI.map((c) => (
              <article
                key={c.title}
                className="flex flex-col p-6 rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)]"
              >
                <span className="w-11 h-11 rounded-xl grid place-items-center bg-[var(--fr-red-soft)] text-[var(--fr-red)] mb-4" aria-hidden="true">
                  <c.icon className="w-5 h-5" />
                </span>
                <h3 className="uppercase mb-2">{c.title}</h3>
                <p className="text-sm mb-5">{c.text}</p>
                <Link href={c.href} className="mt-auto text-xs font-bold uppercase tracking-wider text-[var(--fr-red)] hover:underline">
                  {c.cta} →
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* ── Sito e app ── */}
        <Panel title="Il sito e l’app" icon={Smartphone}>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-head text-xl font-black uppercase text-[var(--fr-text)] mb-2">
                Formula Rossa — il sito
              </p>
              <p className="text-sm">
                È l’archivio: schermo grande, tempo per approfondire, grafici da esplorare.
                Qui trovi la storia e il contesto di ogni numero.
              </p>
            </div>
            <div>
              <p className="font-head text-xl font-black uppercase text-[var(--fr-text)] mb-2">
                GridUp — l’app
              </p>
              <p className="text-sm mb-4">
                È il weekend di gara in tasca: calcola i punti che servono per vincere il Mondiale
                e mostra gli scenari aggiornati dopo ogni Gran Premio.
              </p>
              <a
                href={GRIDUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <Smartphone className="w-4 h-4" aria-hidden="true" />
                Apri GridUp
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </Panel>

        {/* ── Dati ── */}
        <Panel title="Da dove vengono i dati" icon={Database}>
          <div className="p-6 grid sm:grid-cols-2 gap-4">
            {FONTI.map((f) => (
              <div key={f.nome} className="rounded-[var(--radius-md)] border border-[var(--fr-border)] p-4">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[var(--fr-text)] hover:text-[var(--fr-red)] transition-colors inline-flex items-center gap-1.5"
                >
                  {f.nome}
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
                <p className="text-sm mt-1.5">{f.text}</p>
              </div>
            ))}
            <p className="sm:col-span-2 text-sm">
              I dati vengono elaborati e presentati così come sono: se un numero non torna,
              scrivici e lo verifichiamo. Nessuna statistica è stimata o inventata.
            </p>
          </div>
        </Panel>

        {/* ── Chi c'è dietro ── */}
        <Panel title="Chi c’è dietro">
          <div className="p-6 flex flex-wrap items-center justify-between gap-5">
            <div className="min-w-0">
              <p className="font-head text-2xl font-black uppercase text-[var(--fr-text)]">
                Joaquim Francalanci
              </p>
              <p className="text-sm text-[var(--fr-text-muted)] mt-1 max-w-[52ch]">
                Sviluppo e curo il progetto da solo, nel tempo libero. Formula Rossa e GridUp
                sono nati dalla stessa passione: capire la Formula 1 attraverso i numeri.
              </p>
              <a href="mailto:info@formula-rossa.it" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--fr-red)] hover:underline mt-3">
                <Mail className="w-4 h-4" aria-hidden="true" />
                info@formula-rossa.it
              </a>
            </div>
            <div className="flex gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="w-11 h-11 rounded-xl border border-[var(--fr-border)] bg-[var(--fr-surface-2)] grid place-items-center text-[var(--fr-text-muted)] hover:text-white hover:bg-[var(--fr-red)] hover:border-[var(--fr-red)] transition-all"
                >
                  <s.icon className="w-5 h-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </Panel>

        {/* ── Disclaimer ── */}
        <aside className="rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface-3)] p-6">
          <p className="flex items-center gap-2 font-head text-lg font-black uppercase text-[var(--fr-text)] mb-2">
            <Shield className="w-4 h-4 text-[var(--fr-red)]" aria-hidden="true" />
            Progetto indipendente
          </p>
          <p className="text-sm">
            Formula Rossa non è affiliato, associato, sponsorizzato né approvato da Ferrari S.p.A.,
            Scuderia Ferrari, Formula One Group o FIA. Tutti i marchi, i nomi di scuderie e piloti
            e i loghi citati appartengono ai rispettivi proprietari e sono usati a scopo
            informativo e di analisi statistica.
          </p>
        </aside>
      </div>
    </PageShell>
  );
}
