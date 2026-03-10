// pages/news/[slug].js
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";

export async function getServerSideProps({ params }) {
  try {
    const q = query(collection(db, "news"), where("slug", "==", params.slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return { notFound: true };

    const data = snapshot.docs[0].data();
    const article = {
      title:        data.title || "",
      slug:         data.slug || params.slug,
      html_content: data.html_content || "",
      excerpt:      data.excerpt || "",
      tags:         data.tags || [],
      author:       data.author || "Redazione Formula Rossa",
      published_at: data.published_at?.toDate?.().toISOString() || null,
      cover_image:  data.cover_image || null,
    };
    return { props: { article } };
  } catch (err) {
    console.error("Errore Firestore:", err);
    return { notFound: true };
  }
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric", month: "long", year: "numeric"
  });
}

export default function ArticlePage({ article }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <Head>
        <title>{article.title} | Formula Rossa</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Serif+4:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
        <style>{`
          .article-content {
            color: rgba(255,255,255,0.82);
            font-family: 'Source Serif 4', Georgia, serif;
            font-size: 17px;
            line-height: 1.85;
          }
          .article-content h2 {
            color: #ffffff;
            font-size: 22px;
            font-weight: 700;
            margin: 40px 0 16px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(192,57,43,0.3);
            font-family: 'Bebas Neue', Georgia, serif;
            letter-spacing: 1px;
          }
          .article-content p {
            margin: 0 0 20px;
          }
          .article-content strong {
            color: #ffffff;
            font-weight: 700;
          }
          .article-content a {
            color: #e74c3c;
            text-decoration: none;
            border-bottom: 1px solid rgba(231,76,60,0.3);
            transition: border-color 0.2s;
          }
          .article-content a:hover {
            border-color: #e74c3c;
          }
          .article-content hr {
            border: none;
            border-top: 1px solid rgba(255,255,255,0.08);
            margin: 32px 0 16px;
          }
        `}</style>
      </Head>

      <main style={{
        maxWidth: "740px",
        margin: "0 auto",
        padding: "48px 20px 80px",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/news" style={{
            color: "rgba(255,255,255,0.35)",
            textDecoration: "none",
            fontSize: "13px",
            fontFamily: "monospace",
            transition: "color 0.2s",
          }}
            onMouseEnter={e => e.target.style.color = "#e74c3c"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.35)"}
          >
            ← News F1
          </Link>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          {article.tags.map(tag => (
            <span key={tag} style={{
              background: "rgba(192,57,43,0.2)",
              border: "1px solid rgba(192,57,43,0.4)",
              color: "#e74c3c",
              fontSize: "10px",
              padding: "3px 10px",
              borderRadius: "4px",
              textTransform: "uppercase",
              fontWeight: "700",
              letterSpacing: "0.5px",
              fontFamily: "monospace",
            }}>{tag}</span>
          ))}
        </div>

        {/* Titolo */}
        <h1 style={{
          margin: "0 0 20px",
          fontSize: "clamp(26px, 4vw, 38px)",
          fontWeight: "800",
          lineHeight: "1.2",
          color: "#ffffff",
          fontFamily: "'Source Serif 4', Georgia, serif",
        }}>{article.title}</h1>

        {/* Excerpt */}
        <p style={{
          margin: "0 0 24px",
          fontSize: "18px",
          color: "rgba(255,255,255,0.5)",
          lineHeight: "1.6",
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontStyle: "italic",
          borderLeft: "3px solid #c0392b",
          paddingLeft: "16px",
        }}>{article.excerpt}</p>

        {/* Meta */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "16px 0",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          marginBottom: "40px",
        }}>
          {/* Avatar iniziali */}
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #8b0000, #c0392b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: "800",
            color: "white",
            fontFamily: "monospace",
            flexShrink: 0,
          }}>RF</div>
          <div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: "600" }}>
              {article.author}
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
              {formatDate(article.published_at)}
            </div>
          </div>
        </div>

        {/* Immagine copertina */}
        {article.cover_image && (
          <div style={{ marginBottom: "40px", borderRadius: "12px", overflow: "hidden" }}>
            <img
              src={article.cover_image}
              alt={article.title}
              style={{ width: "100%", display: "block", maxHeight: "400px", objectFit: "cover" }}
            />
          </div>
        )}

        {/* Contenuto articolo */}
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.html_content }}
        />

        {/* Footer navigazione */}
        <div style={{
          marginTop: "64px",
          paddingTop: "24px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <Link href="/news" style={{
            color: "#e74c3c",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "monospace",
          }}>
            ← Tutte le news
          </Link>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>
            formula-rossa.it
          </span>
        </div>

      </main>
    </>
  );
}