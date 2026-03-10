// pages/news/[slug].js  (oppure app/news/[slug]/page.js)
// ─────────────────────────────────────────────────────────────────────────────
// Pagina singolo articolo — legge da Firestore tramite slug
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Head from "next/head";
import Link from "next/link";

export async function getStaticPaths() {
  // Pre-genera i path per gli ultimi 20 articoli
  const snapshot = await getDocs(collection(db, "news"));
  const paths = snapshot.docs.map((doc) => ({
    params: { slug: doc.id },
  }));
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const q = query(
    collection(db, "news"),
    where("slug", "==", params.slug)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return { notFound: true };
  }

  const data = snapshot.docs[0].data();
  const article = {
    title:        data.title,
    slug:         data.slug,
    html_content: data.html_content,
    excerpt:      data.excerpt,
    tags:         data.tags || [],
    author:       data.author,
    published_at: data.published_at?.toDate().toISOString() || null,
  };

  return {
    props: { article },
    revalidate: 60 * 60,  // aggiorna al massimo ogni ora
  };
}

export default function ArticlePage({ article }) {
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("it-IT", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "";

  return (
    <>
      <Head>
        <title>{article.title} | Formula Rossa</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
      </Head>

      <main className="article-page">
        <div className="article-page__tags">
          {article.tags.map((tag) => (
            <span key={tag} className="article-page__tag">{tag}</span>
          ))}
        </div>

        <h1 className="article-page__title">{article.title}</h1>

        <div className="article-page__meta">
          <span>✍️ {article.author}</span>
          <span>📅 {date}</span>
        </div>

        {/* Contenuto HTML generato dal bot */}
        <div
          className="article-page__content"
          dangerouslySetInnerHTML={{ __html: article.html_content }}
        />

        <div className="article-page__footer">
          <Link href="/news">← Torna alle News</Link>
        </div>
      </main>
    </>
  );
}