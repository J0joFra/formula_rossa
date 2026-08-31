/**
 * pages/news/[slug].js
 * Un singolo articolo generato dal bot.
 *
 * Come l'elenco, questa pagina si era costruita una tipografia tutta sua dentro
 * un <style> nella <head>, con i colori scritti a mano: in tema chiaro il testo
 * restava chiaro su fondo chiaro. Le regole del corpo articolo vivono ora in
 * styles/globals.css sotto `.article-body`, sui token, ed è lì che devono stare
 * perché l'HTML arriva da Firestore e non può portarsi dietro delle classi.
 */

import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PageShell, { PageHeader, Panel } from '../../components/ui/PageShell';

const RETENTION_DAYS = 30;

export async function getServerSideProps({ params }) {
  try {
    const q = query(collection(db, 'news'), where('slug', '==', params.slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return { notFound: true };

    const data = snapshot.docs[0].data();
    return {
      props: {
        article: {
          title: data.title || '',
          slug: data.slug || params.slug,
          html_content: data.html_content || '',
          excerpt: data.excerpt || '',
          tags: data.tags || [],
          author: data.author || 'Redazione Formula Rossa',
          word_count: data.word_count || 0,
          published_at: data.published_at?.toDate?.().toISOString() || null,
        },
      },
    };
  } catch (err) {
    console.error('News — lettura articolo:', err);
    return { notFound: true };
  }
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

/**
 * Minuti di lettura. Il bot salva word_count; per gli articoli pubblicati prima
 * che esistesse quel campo si contano le parole dell'HTML.
 */
function readTime(article) {
  const parole = article.word_count
    || (article.html_content || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return parole > 0 ? Math.max(1, Math.round(parole / 200)) : null;
}

export default function ArticlePage({ article }) {
  const minuti = readTime(article);
  const giorniFa = article.published_at
    ? Math.floor((Date.now() - new Date(article.published_at)) / 86400000)
    : 0;
  const inScadenza = giorniFa >= RETENTION_DAYS - 5;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || undefined,
    datePublished: article.published_at || undefined,
    inLanguage: 'it',
    author: { '@type': 'Organization', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: 'Formula Rossa',
      url: 'https://formula-rossa.it',
    },
  };

  const seo = {
    title: article.title,
    description: article.excerpt,
    path: `/news/${article.slug}`,
    jsonLd,
  };

  return (
    <PageShell seo={seo}>
      <PageHeader
        eyebrow={formatDate(article.published_at)}
        title={article.title}
        subtitle={article.excerpt || undefined}
        breadcrumb={[
          { label: 'Stagione' },
          { label: 'News', href: '/news' },
          { label: article.title.slice(0, 32) + (article.title.length > 32 ? '…' : '') },
        ]}
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-6 mb-8 border-b border-[var(--fr-border)] text-xs text-[var(--fr-text-faint)]">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
        </span>
        {minuti && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            {minuti} min di lettura
          </span>
        )}
        <span>{article.author}</span>

        {article.tags.length > 0 && (
          <span className="flex flex-wrap gap-1.5 ml-auto">
            {article.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-[7px] bg-[var(--fr-surface-2)]"
              >
                {t}
              </span>
            ))}
          </span>
        )}
      </div>

      {inScadenza && (
        <p className="flex items-start gap-2 mb-8 p-4 rounded-[var(--radius-md)] border border-[var(--fr-border)] bg-[var(--fr-surface)] text-sm text-[var(--fr-text-muted)]">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--fr-gold)]" aria-hidden="true" />
          <span>
            Questo articolo ha {giorniFa} giorni e verrà rimosso dall&apos;archivio,
            che conserva le notizie per {RETENTION_DAYS} giorni.
          </span>
        </p>
      )}

      <article
        className="article-body"
        dangerouslySetInnerHTML={{ __html: article.html_content }}
      />

      <div className="mt-14 pt-6 border-t border-[var(--fr-border)]">
        <Link href="/news" className="btn btn-outline">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Tutte le news
        </Link>
      </div>

      <Panel className="mt-10">
        <p className="p-5 text-xs text-[var(--fr-text-faint)]">
          Sintesi redatta automaticamente a partire dai feed delle testate citate qui
          sopra. Per la notizia completa, e per le dichiarazioni nella loro forma
          originale, conviene aprire la fonte.
        </p>
      </Panel>
    </PageShell>
  );
}
