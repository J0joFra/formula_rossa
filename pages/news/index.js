/**
 * pages/news/index.js
 * Elenco delle news generate dal bot (F1bot/f1_aggregator.py).
 *
 * La pagina precedente era costruita a parte dal resto del sito: font propri
 * (Bebas Neue e Source Serif, oltre ai tre del design system), colori scritti a
 * mano e leggibili solo in tema scuro, una regola ::-webkit-scrollbar globale
 * che usciva da questa pagina, e tutto il contenuto renderizzato con
 * `opacity: 0` finché non partiva il JavaScript — su una pagina servita dal
 * server, il che significa contenuto invisibile a chi il JavaScript non lo
 * esegue.
 */

import Link from 'next/link';
import { Newspaper, Clock } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import PageShell, { PageHeader, Panel } from '../../components/ui/PageShell';

/* Gli articoli vengono cancellati da Firestore dopo 30 giorni. La pulizia gira
   una volta al giorno, quindi qui si filtra comunque: nella finestra fra la
   scadenza e la cancellazione un pezzo scaduto resterebbe altrimenti in pagina. */
const RETENTION_DAYS = 30;

export async function getServerSideProps() {
  try {
    const q = query(collection(db, 'news'), orderBy('published_at', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    const limite = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

    const articles = snapshot.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          slug: data.slug || d.id,
          excerpt: data.excerpt || '',
          tags: data.tags || [],
          word_count: data.word_count || 0,
          published_at: data.published_at?.toDate?.().toISOString() || null,
        };
      })
      .filter((a) => a.published_at && new Date(a.published_at).getTime() >= limite);

    return { props: { articles, errore: false } };
  } catch (e) {
    console.error('News — lettura archivio:', e);
    return { props: { articles: [], errore: true } };
  }
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function timeAgo(iso) {
  if (!iso) return '';
  const min = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (min < 60) return `${Math.max(min, 1)} min fa`;
  const ore = Math.floor(min / 60);
  if (ore < 24) return `${ore} ${ore === 1 ? 'ora' : 'ore'} fa`;
  const giorni = Math.floor(ore / 24);
  return `${giorni} ${giorni === 1 ? 'giorno' : 'giorni'} fa`;
}

/** Minuti di lettura dal numero di parole salvato dal bot. */
function readTime(words) {
  return words > 0 ? Math.max(1, Math.round(words / 200)) : null;
}

function Tag({ label }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-[7px] bg-[var(--fr-surface-2)] text-[var(--fr-text-faint)]">
      {label}
    </span>
  );
}

function Meta({ article }) {
  const minuti = readTime(article.word_count);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--fr-text-faint)]">
      <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
      <span aria-hidden="true">·</span>
      <span>{timeAgo(article.published_at)}</span>
      {minuti && (
        <>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {minuti} min di lettura
          </span>
        </>
      )}
    </div>
  );
}

/** Articolo in evidenza: il più recente, con più respiro degli altri. */
function HeroCard({ article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group block p-7 md:p-9 rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] hover:border-[var(--fr-red)]/40 transition-colors"
    >
      <span className="fr-eyebrow block mb-4">In evidenza</span>

      <h2 className="uppercase text-2xl md:text-[2rem] leading-tight text-[var(--fr-text)] group-hover:text-[var(--fr-red)] transition-colors">
        {article.title}
      </h2>

      {article.excerpt && (
        <p className="text-[var(--fr-text-muted)] mt-4 max-w-[70ch]">{article.excerpt}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
        <Meta article={article} />
        <div className="flex flex-wrap gap-1.5">
          {article.tags.slice(0, 3).map((t) => <Tag key={t} label={t} />)}
        </div>
      </div>
    </Link>
  );
}

function NewsCard({ article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col h-full p-6 rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] hover:border-[var(--fr-red)]/40 hover:-translate-y-0.5 transition-all"
    >
      <div className="flex flex-wrap gap-1.5 mb-3">
        {article.tags.slice(0, 2).map((t) => <Tag key={t} label={t} />)}
      </div>

      <h3 className="uppercase text-lg leading-snug text-[var(--fr-text)] group-hover:text-[var(--fr-red)] transition-colors">
        {article.title}
      </h3>

      {article.excerpt && (
        <p className="text-sm text-[var(--fr-text-muted)] mt-2.5 line-clamp-3">{article.excerpt}</p>
      )}

      <div className="mt-auto pt-5">
        <Meta article={article} />
      </div>
    </Link>
  );
}

export default function NewsPage({ articles, errore }) {
  const [hero, ...resto] = articles;

  const seo = {
    title: 'News Formula 1 e Ferrari',
    description: 'Le notizie di Formula 1 e Scuderia Ferrari raccolte dalle principali testate italiane e internazionali, riassunte ogni giorno.',
    path: '/news',
  };

  return (
    <PageShell seo={seo}>
      <PageHeader
        eyebrow="Stagione"
        title="News"
        subtitle="Una sintesi quotidiana di quello che scrivono le principali testate di Formula 1, con lo sguardo puntato sulla Ferrari."
        breadcrumb={[{ label: 'Stagione' }, { label: 'News' }]}
      />

      {errore && (
        <Panel>
          <div className="empty-state">
            <Newspaper className="empty-state-icon" aria-hidden="true" />
            <p className="empty-state-title">Archivio non raggiungibile</p>
            <p className="empty-state-description">
              Non riusciamo a leggere le notizie in questo momento. Riprova fra poco.
            </p>
          </div>
        </Panel>
      )}

      {!errore && articles.length === 0 && (
        <Panel>
          <div className="empty-state">
            <Newspaper className="empty-state-icon" aria-hidden="true" />
            <p className="empty-state-title">Nessuna notizia</p>
            <p className="empty-state-description">
              Non ci sono articoli pubblicati negli ultimi {RETENTION_DAYS} giorni.
            </p>
          </div>
        </Panel>
      )}

      {!errore && articles.length > 0 && (
        <div className="grid gap-6">
          <HeroCard article={hero} />

          {resto.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resto.map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
          )}
        </div>
      )}

      <p className="mt-10 text-xs text-[var(--fr-text-faint)] max-w-[70ch]">
        Le sintesi sono generate automaticamente a partire dai feed delle testate citate
        in fondo a ogni articolo, e restano online {RETENTION_DAYS} giorni. Per la notizia
        completa conviene sempre aprire la fonte originale.
      </p>
    </PageShell>
  );
}
