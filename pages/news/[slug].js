// pages/news/[slug].js
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

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

function formatDateShort(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit", month: "short", year: "numeric"
  }).toUpperCase();
}

const TAG_COLORS = {
  "GARA":       { bg: "#dc2626", border: "#ef4444", text: "#fff" },
  "QUALIFICHE": { bg: "#92400e", border: "#d97706", text: "#fde68a" },
  "ANALISI":    { bg: "#1e3a5f", border: "#3b82f6", text: "#93c5fd" },
  "FERRARI":    { bg: "#7f1d1d", border: "#dc2626", text: "#fca5a5" },
  "PREVIEW":    { bg: "#1a2e1a", border: "#16a34a", text: "#86efac" },
  "F1":         { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)", text: "rgba(255,255,255,0.55)" },
};

function Tag({ label }) {
  const style = TAG_COLORS[label.toUpperCase()] || {
    bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)", text: "rgba(255,255,255,0.45)",
  };
  return (
    <span style={{
      background: style.bg, border: `1px solid ${style.border}`, color: style.text,
      fontSize: "9px", fontWeight: "700", padding: "3px 10px",
      borderRadius: "2px", textTransform: "uppercase", letterSpacing: "1.2px",
      fontFamily: "monospace", whiteSpace: "nowrap", display: "inline-block",
    }}>{label}</span>
  );
}

// Barra di progresso lettura
function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handler = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
      height: "2px", background: "rgba(0,0,0,0.5)",
    }}>
      <div style={{
        height: "100%", width: `${progress}%`,
        background: "linear-gradient(90deg, #dc2626, #ef4444)",
        transition: "width 0.1s linear",
      }} />
    </div>
  );
}

export default function ArticlePage({ article }) {
  const [mounted, setMounted] = useState(false);
  const [readTime, setReadTime] = useState(0);
  useEffect(() => {
    setMounted(true);
    // Stima tempo lettura (~200 parole/min)
    const words = (article.html_content || "").replace(/<[^>]+>/g, " ").split(/\s+/).length;
    setReadTime(Math.max(1, Math.ceil(words / 200)));
  }, [article.html_content]);

  return (
    <>
      <Head>
        <title>{article.title} | Formula Rossa</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        {article.cover_image && <meta property="og:image" content={article.cover_image} />}
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          /* ── Tipografia articolo ── */
          .article-body {
            color: rgba(255,255,255,0.78);
            font-family: 'Source Serif 4', Georgia, serif;
            font-size: 18px;
            line-height: 1.9;
          }
          .article-body h2 {
            color: #ffffff;
            font-size: 20px;
            font-weight: 700;
            margin: 48px 0 18px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(220,38,38,0.25);
            font-family: 'Bebas Neue', Georgia, serif;
            letter-spacing: 2px;
            font-size: 24px;
          }
          .article-body h3 {
            color: rgba(255,255,255,0.9);
            font-size: 17px;
            font-weight: 700;
            margin: 36px 0 14px;
            font-family: 'Source Serif 4', Georgia, serif;
          }
          .article-body p {
            margin: 0 0 24px;
          }
          .article-body p:first-child::first-letter {
            float: left;
            font-family: 'Bebas Neue', Georgia, serif;
            font-size: 64px;
            line-height: 0.85;
            margin: 6px 10px 0 0;
            color: #dc2626;
          }
          .article-body strong {
            color: #ffffff;
            font-weight: 700;
          }
          .article-body em {
            color: rgba(255,255,255,0.65);
            font-style: italic;
          }
          .article-body a {
            color: #ef4444;
            text-decoration: none;
            border-bottom: 1px solid rgba(239,68,68,0.25);
            transition: border-color 0.2s, color 0.2s;
          }
          .article-body a:hover {
            color: #fff;
            border-color: rgba(239,68,68,0.6);
          }
          .article-body blockquote {
            margin: 32px 0;
            padding: 20px 24px;
            border-left: 3px solid #dc2626;
            background: rgba(220,38,38,0.04);
            border-radius: 0 4px 4px 0;
            font-style: italic;
            color: rgba(255,255,255,0.55);
            font-size: 17px;
          }
          .article-body hr {
            border: none;
            border-top: 1px solid rgba(255,255,255,0.06);
            margin: 40px 0;
          }
          .article-body ul, .article-body ol {
            padding-left: 20px;
            margin: 0 0 24px;
          }
          .article-body li {
            margin-bottom: 8px;
          }
          .article-body img {
            width: 100%;
            border-radius: 4px;
            margin: 8px 0 24px;
          }

          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: #0a0a0a; }
          ::-webkit-scrollbar-thumb { background: #dc2626; border-radius: 2px; }
        `}</style>
      </Head>

      <ReadingProgress />

      <main style={{
        maxWidth: "760px",
        margin: "0 auto",
        padding: "56px 24px 96px",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.45s ease",
      }}>

        {/* ── Breadcrumb ── */}
        <nav style={{
          marginBottom: "36px",
          display: "flex", alignItems: "center", gap: "10px",
          animation: "fadeUp 0.5s ease both",
        }}>
          <Link href="/news" style={{
            color: "rgba(255,255,255,0.28)",
            textDecoration: "none", fontSize: "11px",
            fontFamily: "monospace", letterSpacing: "0.5px",
            display: "flex", alignItems: "center", gap: "6px",
            transition: "color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.28)"}
          >
            <span style={{ fontSize: "14px" }}>←</span> NEWS F1
          </Link>
          <span style={{ color: "rgba(255,255,255,0.1)", fontSize: "11px" }}>/</span>
          <span style={{
            fontSize: "11px", color: "rgba(255,255,255,0.18)",
            fontFamily: "monospace", letterSpacing: "0.3px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            maxWidth: "300px",
          }}>{article.title}</span>
        </nav>

        {/* ── Tags ── */}
        <div style={{
          display: "flex", gap: "7px", flexWrap: "wrap", marginBottom: "22px",
          animation: "fadeUp 0.5s 0.07s ease both", opacity: 0,
        }}>
          {article.tags.map(tag => <Tag key={tag} label={tag} />)}
        </div>

        {/* ── Titolo ── */}
        <h1 style={{
          margin: "0 0 24px",
          fontSize: "clamp(28px, 4.5vw, 42px)",
          fontWeight: "700",
          lineHeight: "1.18",
          color: "#ffffff",
          fontFamily: "'Source Serif 4', Georgia, serif",
          letterSpacing: "-0.5px",
          animation: "fadeUp 0.5s 0.1s ease both",
          opacity: 0,
        }}>{article.title}</h1>

        {/* ── Excerpt ── */}
        <p style={{
          margin: "0 0 28px",
          fontSize: "18px",
          color: "rgba(255,255,255,0.45)",
          lineHeight: "1.65",
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontStyle: "italic",
          borderLeft: "3px solid #dc2626",
          paddingLeft: "18px",
          animation: "fadeUp 0.5s 0.13s ease both",
          opacity: 0,
        }}>{article.excerpt}</p>

        {/* ── Meta barra ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "16px",
          padding: "16px 0",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: "40px",
          animation: "fadeUp 0.5s 0.16s ease both",
          opacity: 0,
        }}>
          {/* Avatar */}
          <div style={{
            width: "38px", height: "38px", borderRadius: "50%",
            background: "linear-gradient(135deg, #6b0000, #dc2626)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: "800", color: "white",
            fontFamily: "monospace", flexShrink: 0,
            border: "1px solid rgba(220,38,38,0.3)",
          }}>RF</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", fontWeight: "600", fontFamily: "monospace" }}>
              {article.author}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginTop: "2px" }}>
              {formatDate(article.published_at)}
            </div>
          </div>
          {/* Lettura stimata */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px",
          }}>
            <span style={{
              fontSize: "9px", color: "rgba(255,255,255,0.2)",
              fontFamily: "monospace", letterSpacing: "1px", textTransform: "uppercase",
            }}>lettura</span>
            <span style={{
              fontSize: "11px", color: "rgba(255,255,255,0.4)",
              fontFamily: "monospace", fontWeight: "700",
            }}>{readTime} min</span>
          </div>
        </div>

        {/* ── Copertina ── */}
        {article.cover_image && (
          <div style={{
            marginBottom: "48px", borderRadius: "4px", overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
            animation: "fadeIn 0.7s 0.2s ease both", opacity: 0,
            position: "relative",
          }}>
            <img
              src={article.cover_image}
              alt={article.title}
              style={{ width: "100%", display: "block", maxHeight: "440px", objectFit: "cover" }}
            />
            {/* Overlay basso */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: "60px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.4))",
            }} />
            {/* Data angolo */}
            <div style={{
              position: "absolute", bottom: "12px", right: "14px",
              fontSize: "9px", color: "rgba(255,255,255,0.35)",
              fontFamily: "monospace", letterSpacing: "1px",
            }}>{formatDateShort(article.published_at)}</div>
          </div>
        )}

        {/* ── Linea decorativa pre-contenuto ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px", marginBottom: "36px",
          animation: "fadeUp 0.5s 0.25s ease both", opacity: 0,
        }}>
          <div style={{ width: "24px", height: "2px", background: "#dc2626", borderRadius: "1px" }} />
          <span style={{
            fontSize: "9px", color: "rgba(255,255,255,0.2)",
            fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase",
          }}>Articolo</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.04)" }} />
        </div>

        {/* ── Contenuto ── */}
        <div
          className="article-body"
          style={{ animation: "fadeUp 0.6s 0.28s ease both", opacity: 0 }}
          dangerouslySetInnerHTML={{ __html: article.html_content }}
        />

        {/* ── Footer articolo ── */}
        <div style={{
          marginTop: "72px",
          padding: "28px 0 0",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          {/* Tags footer */}
          {article.tags.length > 0 && (
            <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", marginBottom: "28px" }}>
              {article.tags.map(tag => <Tag key={tag} label={tag} />)}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/news" style={{
              color: "#dc2626",
              textDecoration: "none", fontSize: "12px",
              fontWeight: "800", fontFamily: "monospace",
              letterSpacing: "1px", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: "8px",
              transition: "gap 0.2s, color 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.gap = "12px"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={e => { e.currentTarget.style.gap = "8px"; e.currentTarget.style.color = "#dc2626"; }}
            >
              ← Tutte le news
            </Link>
            <span style={{
              fontSize: "10px", color: "rgba(255,255,255,0.14)",
              fontFamily: "monospace", letterSpacing: "1px",
            }}>
              formula-rossa.it
            </span>
          </div>
        </div>

      </main>
    </>
  );
}
