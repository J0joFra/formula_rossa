// pages/news/[slug].js
// Singolo articolo — usa getServerSideProps per evitare problemi di build su Vercel

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Head from "next/head";
import Link from "next/link";

export async function getServerSideProps({ params }) {
  try {
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
      title:        data.title || "",
      slug:         data.slug || params.slug,
      html_content: data.html_content || "",
      excerpt:      data.excerpt || "",
      tags:         data.tags || [],
      author:       data.author || "Redazione Formula Rossa",
      published_at: data.published_at?.toDate?.().toISOString() || null,
    };

    return { props: { article } };
  } catch (err) {
    console.error("Errore Firestore:", err);
    return { notFound: true };
  }
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

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px" }}>

        {/* Tags */}
        <div style={{ marginBottom: "16px" }}>
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

        {/* Titolo */}
        <h1 style={{ fontSize: "28px", lineHeight: "1.3", marginBottom: "12px" }}>
          {article.title}
        </h1>

        {/* Meta */}
        <div style={{ fontSize: "13px", color: "#999", marginBottom: "32px" }}>
          {article.author} · {date}
        </div>

        {/* Contenuto HTML generato dal bot */}
        <div
          style={{ lineHeight: "1.8", fontSize: "16px" }}
          dangerouslySetInnerHTML={{ __html: article.html_content }}
        />

        {/* Footer */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #eee" }}>
          <Link href="/news" style={{ color: "#c0392b", textDecoration: "none", fontWeight: "bold" }}>
            ← Torna alle News
          </Link>
        </div>

      </main>
    </>
  );
}