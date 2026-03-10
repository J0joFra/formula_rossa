// pages/news/index.js  (oppure app/news/page.js se usi App Router)
// ─────────────────────────────────────────────────────────────────────────────
// Pagina News per formula-rossa.it
// Legge gli articoli dalla collection "news" di Firestore
// e li mostra in griglia con anteprima.
//
// Incolla questo file nel tuo progetto Next.js e adattalo al tuo stile.
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "@/lib/firebase";          // il tuo file di init Firebase
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import Head from "next/head";

// ── Fetch lato server (SSR / ISR) ───────────────────────────────────────────
export async function getStaticProps() {
  const q = query(
    collection(db, "news"),
    orderBy("published_at", "desc"),
    limit(20)
  );

  const snapshot = await getDocs(q);
  const articles = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id:          doc.id,
      title:       data.title,
      slug:        data.slug,
      excerpt:     data.excerpt,
      tags:        data.tags || [],
      cover_image: data.cover_image || null,
      author:      data.author,
      published_at: data.published_at?.toDate().toISOString() || null,
    };
  });

  return {
    props: { articles },
    revalidate: 60 * 15,   // rigenera la pagina ogni 15 minuti (ISR)
  };
}

// ── Componente Card ──────────────────────────────────────────────────────────
function NewsCard({ article }) {
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("it-IT", {
        day: "numeric", month: "long", year: "numeric"
      })
    : "";

  return (
    <Link href={`/news/${article.slug}`} className="news-card">
      {article.cover_image && (
        <img src={article.cover_image} alt={article.title} className="news-card__image" />
      )}
      <div className="news-card__body">
        <div className="news-card__tags">
          {article.tags.map((tag) => (
            <span key={tag} className="news-card__tag">{tag}</span>
          ))}
        </div>
        <h2 className="news-card__title">{article.title}</h2>
        <p className="news-card__excerpt">{article.excerpt}</p>
        <div className="news-card__meta">
          <span>{article.author}</span>
          <span>{date}</span>
        </div>
      </div>
    </Link>
  );
}

// ── Pagina principale ────────────────────────────────────────────────────────
export default function NewsPage({ articles }) {
  return (
    <>
      <Head>
        <title>News F1 | Formula Rossa</title>
        <meta name="description" content="Le ultime notizie di Formula 1 e Ferrari, ogni giorno su Formula Rossa." />
      </Head>

      <main className="news-page">
        <h1 className="news-page__title">🏎️ News F1</h1>
        <p className="news-page__subtitle">
          Aggiornamenti quotidiani dal mondo Ferrari e Formula 1
        </p>

        {articles.length === 0 ? (
          <p>Nessuna notizia disponibile al momento.</p>
        ) : (
          <div className="news-grid">
            {articles.map((art) => (
              <NewsCard key={art.id} article={art} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}