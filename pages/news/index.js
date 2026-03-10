// pages/news/index.js
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import Head from "next/head";
import { useState, useEffect } from "react";
import Navigation from '@/components/ferrari/Navigation';
import Footer from '@/components/ferrari/Footer';

export async function getServerSideProps() {
  try {
    const q = query(collection(db, "news"), orderBy("published_at", "desc"), limit(20));
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
        cover_image:  data.cover_image || null,
      };
    });
    return { props: { articles } };
  } catch (err) {
    console.error("Errore Firestore:", err);
    return { props: { articles: [] } };
  }
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric", month: "long", year: "numeric"
  });
}

// Placeholder immagine con gradient rosso/nero
function CoverPlaceholder({ title, large }) {
  const letters = title?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "F1";
  return (
    <div style={{
      width: "100%",
      height: large ? "420px" : "180px",
      background: "linear-gradient(135deg, #1a0a0a 0%, #2d0000 40%, #8b0000 70%, #c0392b 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Pattern griglia */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(192,57,43,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(192,57,43,0.08) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />
      <span style={{
        fontSize: large ? "80px" : "40px",
        fontWeight: "900",
        color: "rgba(255,255,255,0.08)",
        fontFamily: "Georgia, serif",
        letterSpacing: "-2px",
        userSelect: "none",
      }}>{letters}</span>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "60px",
        background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
      }} />
    </div>
  );
}

// Card articolo piccolo (griglia)
function NewsCard({ article }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/news/${article.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? "rgba(192,57,43,0.06)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${hovered ? "rgba(192,57,43,0.4)" : "rgba(255,255,255,0.07)"}`,
          borderRadius: "12px",
          overflow: "hidden",
          transition: "all 0.25s ease",
          transform: hovered ? "translateY(-3px)" : "none",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Immagine */}
        <div style={{ overflow: "hidden" }}>
          {article.cover_image
            ? <img src={article.cover_image} alt={article.title} style={{ width: "100%", height: "180px", objectFit: "cover", display: "block", transition: "transform 0.4s ease", transform: hovered ? "scale(1.04)" : "scale(1)" }} />
            : <CoverPlaceholder title={article.title} large={false} />
          }
        </div>

        {/* Corpo */}
        <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Tags */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {article.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                background: "rgba(192,57,43,0.2)",
                border: "1px solid rgba(192,57,43,0.4)",
                color: "#e74c3c",
                fontSize: "10px",
                padding: "2px 8px",
                borderRadius: "4px",
                textTransform: "uppercase",
                fontWeight: "700",
                letterSpacing: "0.5px",
                fontFamily: "monospace",
              }}>{tag}</span>
            ))}
          </div>

          {/* Titolo */}
          <h2 style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: "700",
            lineHeight: "1.4",
            color: "#f0f0f0",
            fontFamily: "'Georgia', serif",
            flex: 1,
          }}>{article.title}</h2>

          {/* Excerpt */}
          <p style={{
            margin: 0,
            fontSize: "13px",
            color: "rgba(255,255,255,0.45)",
            lineHeight: "1.5",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>{article.excerpt}</p>

          {/* Meta */}
          <div style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.3)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span>{article.author}</span>
            <span>{formatDate(article.published_at)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// Card hero (primo articolo, grande)
function HeroCard({ article }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/news/${article.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? "rgba(192,57,43,0.08)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${hovered ? "rgba(192,57,43,0.5)" : "rgba(255,255,255,0.08)"}`,
          borderRadius: "16px",
          overflow: "hidden",
          transition: "all 0.3s ease",
          cursor: "pointer",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "320px",
        }}
      >
        {/* Immagine sinistra */}
        <div style={{ overflow: "hidden", position: "relative" }}>
          {article.cover_image
            ? <img src={article.cover_image} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease", transform: hovered ? "scale(1.04)" : "scale(1)" }} />
            : <CoverPlaceholder title={article.title} large={true} />
          }
          {/* Badge ULTIMA ORA */}
          <div style={{
            position: "absolute", top: "16px", left: "16px",
            background: "#c0392b",
            color: "white",
            fontSize: "10px",
            fontWeight: "800",
            padding: "4px 10px",
            borderRadius: "4px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontFamily: "monospace",
          }}>ULTIMA ORA</div>
        </div>

        {/* Testo destra */}
        <div style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {article.tags.slice(0, 3).map(tag => (
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

            <h2 style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: "800",
              lineHeight: "1.35",
              color: "#ffffff",
              fontFamily: "'Georgia', serif",
            }}>{article.title}</h2>

            <p style={{
              margin: 0,
              fontSize: "14px",
              color: "rgba(255,255,255,0.5)",
              lineHeight: "1.6",
            }}>{article.excerpt}</p>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "16px",
          }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
              {article.author} · {formatDate(article.published_at)}
            </span>
            <span style={{
              fontSize: "12px",
              color: "#e74c3c",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>Leggi →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function NewsPage({ articles }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const hero = articles[0] || null;
  const rest = articles.slice(1);

  return (
    <>
      <Head>
        <title>News F1 | Formula Rossa</title>
        <meta name="description" content="Le ultime notizie di Formula 1 e Ferrari, ogni giorno su Formula Rossa." />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Serif+4:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </Head>

      <Navigation />  {/* ← aggiunto */}

      <main style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "48px 20px",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}>
        {/* Header */}
        <div style={{ marginBottom: "40px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ width: "4px", height: "32px", background: "#c0392b", borderRadius: "2px" }} />
            <h1 style={{
              margin: 0,
              fontSize: "36px",
              fontWeight: "900",
              color: "#ffffff",
              fontFamily: "'Bebas Neue', 'Georgia', serif",
              letterSpacing: "2px",
            }}>NEWS F1</h1>
          </div>
          <p style={{ margin: "0 0 0 16px", color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
            Aggiornamenti quotidiani dal mondo Ferrari e Formula 1
          </p>
        </div>

        {articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏎</div>
            <p>Nessuna notizia disponibile al momento.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {hero && <HeroCard article={hero} />}
            {rest.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "2px", fontFamily: "monospace" }}>Altre notizie</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
              </div>
            )}
            {rest.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
              }}>
                {rest.map(art => <NewsCard key={art.id} article={art} />)}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />  {/* ← aggiunto */}
    </>
  );
}