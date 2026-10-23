/**
 * pages/gioca/[app].jsx
 * GridUp e Driver Clash giocabili dentro il sito.
 *
 * La versione web di ogni app (lib/apps.js → webUrl) è incorporata in un
 * iframe sotto la barra del sito, a tutta altezza: niente footer, perché un
 * gioco vuole lo schermo intero. Sopra l'iframe una barra sottile con il nome
 * dell'app, il link per aprirla da sola e quello per l'app Android.
 *
 * I parametri dell'indirizzo passano all'app: il link di una sfida di Driver
 * Clash (…/gioca/driver-clash?sfida=CODICE) apre direttamente quella sfida.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, Smartphone, Maximize2 } from 'lucide-react';
import Navigation from '../../components/ferrari/Navigation';
import SEO from '../../components/seo';
import { APPS, appById } from '../../lib/apps';

const SEO_APP = {
  gridup: {
    title: 'GridUp — calcolatore del Mondiale F1',
    description: 'Usa GridUp direttamente su Formula Rossa: i punti che servono per il titolo, gli scenari in tempo reale e le classifiche di piloti e costruttori.',
  },
  'driver-clash': {
    title: 'Driver Clash — il gioco di carte della F1',
    description: 'Gioca a Driver Clash su Formula Rossa: un Top Trumps della Formula 1 con 794 piloti e 1.501 carte dalle statistiche reali. Sfida la CPU o un amico.',
  },
};

export async function getStaticPaths() {
  return { paths: APPS.map((a) => ({ params: { app: a.id } })), fallback: false };
}

export async function getStaticProps({ params }) {
  return { props: { id: params.app } };
}

export default function GiocaApp({ id }) {
  const app = appById(id);
  const router = useRouter();
  const [src, setSrc] = useState(app.webUrl);

  /* La query si conosce solo dopo l'idratazione (la pagina è statica). */
  useEffect(() => {
    if (!router.isReady) return;
    const qs = new URLSearchParams(router.query);
    qs.delete('app');
    const extra = qs.toString();
    setSrc(extra ? `${app.webUrl}?${extra}` : app.webUrl);
  }, [router.isReady, router.query, app.webUrl]);

  const esterno = app.url.startsWith('http');
  const seo = SEO_APP[id];

  return (
    <div className="h-[100dvh] flex flex-col bg-[var(--fr-bg)] text-[var(--fr-text)]">
      <SEO title={seo.title} description={seo.description} path={`/gioca/${id}`} />
      <Navigation />

      {/* 70px: l'altezza della barra fissa */}
      <main className="flex-1 min-h-0 flex flex-col pt-[70px]">
        <div className="shrink-0 flex items-center justify-between gap-3 px-3 sm:px-6 h-12 border-b border-[var(--fr-border)] bg-[var(--fr-surface)]">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/fanzone#app"
              aria-label="Torna alla Fan Zone"
              className="p-1.5 -ml-1 rounded-lg text-[var(--fr-text-faint)] hover:text-[var(--fr-red)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </Link>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={app.icon} alt="" width={24} height={24} className="w-6 h-6 rounded-md object-cover" />
            <h1 className="text-sm font-black uppercase tracking-wide truncate">{app.name}</h1>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={app.url}
              {...(esterno ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[var(--fr-text-muted)] hover:text-[var(--fr-text)] hover:bg-[var(--fr-surface-2)] transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{app.cta}</span>
            </a>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              title="Apri a schermo intero"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[var(--fr-text-muted)] hover:text-[var(--fr-text)] hover:bg-[var(--fr-surface-2)] transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5 sm:hidden" aria-hidden="true" />
              <ExternalLink className="w-3.5 h-3.5 hidden sm:inline" aria-hidden="true" />
              <span className="hidden sm:inline">Schermo intero</span>
            </a>
          </div>
        </div>

        <iframe
          key={src}
          src={src}
          title={app.name}
          className="flex-1 w-full border-0 bg-black"
          allow="autoplay; fullscreen; clipboard-write; web-share"
          allowFullScreen
        />
      </main>
    </div>
  );
}
