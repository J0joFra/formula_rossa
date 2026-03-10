// pages/news/index.js
// Lista articoli news — usa il Firebase client SDK (lib/firebase.js)

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import Head from "next/head";

export async function getServerSideProps() {
  try {
    const q = query(
      collection(db, "news"),
      orderBy("published_at", "desc"),
      limit(20)
    );

    const snapshot = await getDocs(q);
    const articles = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id:           doc.id,
        title:        data.title || "",
        slug:         data.slug || doc.id,
        excerpt:      data.excerpt || "",
        tags:         data.tags || [],
        author:       data.author || "Redazione Formula Rossa",
        published_at: data.published_at?.toDate?.().toISOString() || null,
      };
    });

    return { props: { articles } };
  } catch (err) {
    console.error("Errore Firestore:", err);
    return { props: { articles: [] } };
  }
}

function NewsCard({ article }) {
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("it-IT", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "";

  return (
    <Link href={`/news/${article.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "16px",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
      >
        <div style={{ marginBottom: "8px" }}>
          {article.tags.map(tag => (
            <span key={tag} style={{
              background: "#c0392b",
              color: "white",
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "4px",
              marginRight: "6px",
              textTransform: "uppercase",
              fontWeight: "bold",
            }}>{tag}</span>
          ))}
        </div>
        <h2 style={{ margin: "8px 0", fontSize: "18px", lineHeight: "1.4" }}>
          {article.title}
        </h2>
        <p style={{ color: "#666", fontSize: "14px", margin: "8px 0" }}>
          {article.excerpt}
        </p>
        <div style={{ fontSize: "12px", color: "#999", marginTop: "12px" }}>
          {article.author} · {date}
        </div>
      </div>
    </Link>
  );
}

export default function NewsPage({ articles }) {
  return (
    <>
      <Head>
        <title>News F1 | Formula Rossa</title>
        <meta name="description" content="Le ultime notizie di Formula 1 e Ferrari, ogni giorno su Formula Rossa." />
      </Head>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>News F1</h1>
        <p style={{ color: "#666", marginBottom: "32px" }}>
          Aggiornamenti quotidiani dal mondo Ferrari e Formula 1
        </p>

        {articles.length === 0 ? (
          <p style={{ color: "#999" }}>Nessuna notizia disponibile al momento.</p>
        ) : (
          articles.map(art => <NewsCard key={art.id} article={art} />)
        )}
      </main>
    </>
  );
}