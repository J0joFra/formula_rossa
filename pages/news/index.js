// pages/news/index.js
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import Head from "next/head";
import { useState, useEffect, useRef } from "react";
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
        type:         data.type || "news",
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

function timeAgo(iso) {
  if (!iso) return "";
  const now = new Date();
  const pub = new Date(iso);
  const diff = Math.floor((now - pub) / 1000 / 60);
  if (diff < 60) return `${diff} min fa`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h fa`;
  return formatDate(iso);
}

const TAG_COLORS = {
  "GARA":       { bg: "#dc2626", border: "#ef4444", text: "#fff" },
  "QUALIFICHE": { bg: "#92400e", border: "#d97706", text: "#fde68a" },
  "ANALISI":    { bg: "#1e3a5f", border: "#3b82f6", text: "#93c5fd" },
  "FERRARI":    { bg: "#7f1d1d", border: "#dc2626", text: "#fca5a5" },
  "PREVIEW":    { bg: "#1a2e1a", border: "#16a34a", text: "#86efac" },
  "F1":         { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)", text: "rgba(255,255,255,0.6)" },
};

function Tag({ label, large = false }) {
  const style = TAG_COLORS[label.toUpperCase()] || {
    bg: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.1)",
    text: "rgba(255,255,255,0.45)",
  };
  return (
    <span style={{
      background: style.bg,
      border: `1px solid ${style.border}`,
      color: style.text,
      fontSize: large ? "10px" : "9px",
      fontWeight: "700",
      padding: large ? "3px 10px" : "2px 7px",
      borderRadius: "2px",
      textTransform: "uppercase",
      letterSpacing: "1px",
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      whiteSpace: "nowrap",
      display: "inline-block",
    }}>{label}</span>
  );
}

function CoverPlaceholder({ title, height = 200 }) {
  const letters = (title || "F1").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div style={{
      width: "100%", height,
      background: "linear-gradient(135deg, #0a0a0a 0%, #130303 40%, #1f0505 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Racing stripes */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `repeating-linear-gradient(
          -55deg,
          transparent,
          transparent 18px,
          rgba(180,20,20,0.04) 18px,
          rgba(180,20,20,0.04) 36px
        )`,
      }} />
      {/* Glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 20% 60%, rgba(180,30,30,0.18) 0%, transparent 65%)",
      }} />
      <span style={{
        fontSize: height > 300 ? "110px" : "58px",
        fontWeight: "900",
        color: "rgba(255,255,255,0.03)",
        fontFamily: "'Bebas Neue', Georgia, serif",
        letterSpacing: "6px",
        userSelect: "none",
        position: "relative", zIndex: 1,
      }}>{letters}</span>
      {/* Bottom accent line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "2px",
        background: "linear-gradient(90deg, #dc2626 0%, transparent 70%)",
      }} />
    </div>
  );
}

// ── HERO CARD ──────────────────────────────────────────────────────────────────
function HeroCard({ article }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/news/${article.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          borderRadius: "4px",
          overflow: "hidden",
          border: `1px solid ${hovered ? "rgba(220,38,38,0.45)" : "rgba(255,255,255,0.07)"}`,
          transition: "border-color 0.35s ease, box-shadow 0.35s ease",
          boxShadow: hovered
            ? "0 0 0 1px rgba(220,38,38,0.1), 0 32px 64px rgba(0,0,0,0.7)"
            : "0 8px 32px rgba(0,0,0,0.5)",
          cursor: "pointer",
          background: "#080808",
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          minHeight: "400px",
        }}
      >
        {/* Immagine */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          {article.cover_image
            ? <img src={article.cover_image} alt={article.title} style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
                transform: hovered ? "scale(1.06)" : "scale(1.01)",
              }} />
            : <CoverPlaceholder title={article.title} height={400} />
          }
          {/* Overlay – gradiente verso destra */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, rgba(8,8,8,0) 40%, rgba(8,8,8,0.98) 100%)",
          }} />
          {/* Overlay – gradiente basso */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, transparent 50%, rgba(8,8,8,0.6) 100%)",
          }} />
          {/* Badge ULTIMA ORA */}
          <div style={{
            position: "absolute", top: "20px", left: "20px",
            background: "#dc2626",
            color: "white",
            fontSize: "9px", fontWeight: "800",
            padding: "5px 12px",
            borderRadius: "2px",
            textTransform: "uppercase", letterSpacing: "2px",
            fontFamily: "'JetBrains Mono', monospace",
            display: "flex", alignItems: "center", gap: "7px",
          }}>
            <span style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: "rgba(255,255,255,0.9)",
              animation: "pulse 1.4s infinite",
            }} />
            ULTIMA ORA
          </div>
          {/* Numero edizione */}
          <div style={{
            position: "absolute", bottom: "20px", left: "20px",
            fontSize: "9px", color: "rgba(255,255,255,0.2)",
            fontFamily: "monospace", letterSpacing: "1.5px",
          }}>
            {new Date(article.published_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
          </div>
        </div>

        {/* Testo */}
        <div style={{
          padding: "40px 36px",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          gap: "24px",
          background: "linear-gradient(135deg, #0e0e0e 0%, #0a0505 100%)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Tags */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {article.tags.slice(0, 3).map(tag => <Tag key={tag} label={tag} large />)}
            </div>

            {/* Titolo */}
            <h2 style={{
              margin: 0,
              fontSize: "clamp(20px, 2.4vw, 30px)",
              fontWeight: "700",
              lineHeight: "1.25",
              color: hovered ? "#fff" : "rgba(255,255,255,0.95)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              letterSpacing: "-0.4px",
              transition: "color 0.2s",
            }}>{article.title}</h2>

            {/* Linea decorativa */}
            <div style={{
              width: hovered ? "60px" : "32px",
              height: "2px",
              background: "#dc2626",
              transition: "width 0.35s ease",
              borderRadius: "1px",
            }} />

            {/* Excerpt */}
            <p style={{
              margin: 0, fontSize: "13.5px",
              color: "rgba(255,255,255,0.4)",
              lineHeight: "1.75",
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>{article.excerpt}</p>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "18px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "linear-gradient(135deg, #6b0000, #dc2626)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: "800", color: "white",
                fontFamily: "monospace", flexShrink: 0, border: "1px solid rgba(220,38,38,0.3)",
              }}>RF</div>
              <div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", fontWeight: "600", fontFamily: "monospace" }}>
                  {article.author}
                </div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.22)", fontFamily: "monospace" }}>
                  {timeAgo(article.published_at)}
                </div>
              </div>
            </div>
            <span style={{
              fontSize: "11px", color: hovered ? "#ef4444" : "#dc2626",
              fontWeight: "800", fontFamily: "monospace",
              letterSpacing: "1px",
              display: "flex", alignItems: "center", gap: "5px",
              transition: "color 0.2s, gap 0.2s",
            }}>
              LEGGI <span style={{ transition: "transform 0.2s", transform: hovered ? "translateX(4px)" : "none", display: "inline-block" }}>→</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── NEWS CARD ──────────────────────────────────────────────────────────────────
function NewsCard({ article }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/news/${article.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? "#0f0505" : "#090909",
          border: `1px solid ${hovered ? "rgba(220,38,38,0.3)" : "rgba(255,255,255,0.05)"}`,
          borderRadius: "4px",
          overflow: "hidden",
          transition: "all 0.25s ease",
          transform: hovered ? "translateY(-5px)" : "none",
          boxShadow: hovered ? "0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(220,38,38,0.08)" : "none",
          cursor: "pointer",
          height: "100%",
          display: "flex", flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Accent top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "2px",
          background: hovered
            ? "linear-gradient(90deg, #dc2626 0%, rgba(220,38,38,0.2) 100%)"
            : "transparent",
          transition: "background 0.3s ease",
        }} />

        {/* Immagine */}
        <div style={{ overflow: "hidden", flexShrink: 0 }}>
          {article.cover_image
            ? <img src={article.cover_image} alt={article.title} style={{
                width: "100%", height: "178px", objectFit: "cover", display: "block",
                transition: "transform 0.5s ease",
                transform: hovered ? "scale(1.07)" : "scale(1.01)",
              }} />
            : <CoverPlaceholder title={article.title} height={178} />
          }
        </div>

        {/* Corpo */}
        <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {article.tags.slice(0, 3).map(tag => <Tag key={tag} label={tag} />)}
          </div>

          <h2 style={{
            margin: 0, fontSize: "14px", fontWeight: "700",
            lineHeight: "1.5", flex: 1,
            color: hovered ? "#fff" : "rgba(255,255,255,0.85)",
            fontFamily: "'Source Serif 4', Georgia, serif",
            transition: "color 0.2s",
          }}>{article.title}</h2>

          <p style={{
            margin: 0, fontSize: "12px",
            color: "rgba(255,255,255,0.32)",
            lineHeight: "1.65",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>{article.excerpt}</p>

          <div style={{
            fontSize: "10px", color: "rgba(255,255,255,0.22)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "10px",
            display: "flex", justifyContent: "space-between",
            fontFamily: "monospace", letterSpacing: "0.3px",
          }}>
            <span>{article.author}</span>
            <span>{timeAgo(article.published_at)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── SIDEBAR CARD ───────────────────────────────────────────────────────────────
function SidebarCard({ article, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/news/${article.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", gap: "14px",
          padding: "14px 0",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          opacity: hovered ? 1 : 0.72,
          transform: hovered ? "translateX(4px)" : "none",
        }}
      >
        {/* Numero */}
        <div style={{
          fontSize: "22px", fontWeight: "900",
          color: hovered ? "rgba(220,38,38,0.5)" : "rgba(220,38,38,0.22)",
          fontFamily: "'Bebas Neue', Georgia, serif",
          minWidth: "30px", lineHeight: "1", paddingTop: "2px",
          transition: "color 0.2s",
        }}>0{index}</div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {article.tags.slice(0, 2).map(tag => <Tag key={tag} label={tag} />)}
          </div>
          <p style={{
            margin: 0, fontSize: "12.5px", fontWeight: "700",
            lineHeight: "1.45",
            color: hovered ? "#fff" : "rgba(255,255,255,0.78)",
            fontFamily: "'Source Serif 4', Georgia, serif",
            transition: "color 0.2s",
          }}>{article.title}</p>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.22)", fontFamily: "monospace" }}>
            {timeAgo(article.published_at)}
          </span>
        </div>

        {article.cover_image && (
          <div style={{
            width: "60px", height: "60px", flexShrink: 0,
            borderRadius: "3px", overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
            transition: "border-color 0.2s",
          }}>
            <img src={article.cover_image} alt="" style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.1)" : "scale(1)",
            }} />
          </div>
        )}
      </article>
    </Link>
  );
}

// ── TICKER (striscia notizie scorrevole) ───────────────────────────────────────
function NewsTicker({ articles }) {
  const items = articles.slice(0, 8).map(a => a.title).join("   ·   ");
  return (
    <div style={{
      background: "#dc2626",
      overflow: "hidden",
      padding: "8px 0",
      borderTop: "1px solid rgba(255,255,255,0.1)",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      position: "relative",
    }}>
      <div style={{
        display: "flex",
        gap: "0",
        animation: "ticker 35s linear infinite",
        whiteSpace: "nowrap",
      }}>
        {[items, items].map((text, i) => (
          <span key={i} style={{
            fontSize: "10px",
            fontWeight: "700",
            color: "rgba(255,255,255,0.95)",
            fontFamily: "monospace",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            paddingRight: "80px",
          }}>{text}</span>
        ))}
      </div>
      {/* Fade laterali */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, #dc2626 0%, transparent 8%, transparent 92%, #dc2626 100%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ── SECTION DIVIDER ────────────────────────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "4px 0" }}>
      <div style={{ width: "3px", height: "16px", background: "#dc2626", borderRadius: "1px", flexShrink: 0 }} />
      <span style={{
        fontSize: "10px", color: "rgba(255,255,255,0.28)",
        textTransform: "uppercase", letterSpacing: "3px",
        fontFamily: "monospace", fontWeight: "700",
      }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
    </div>
  );
}

// ── PAGE ───────────────────────────────────────────────────────────────────────
export default function NewsPage({ articles }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const hero      = articles[0] || null;
  const featured  = articles.slice(1, 4);
  const sidebar   = articles.slice(4, 8);
  const remaining = articles.slice(8);

  return (
    <>
      <Head>
        <title>News F1 | Formula Rossa</title>
        <meta name="description" content="Le ultime notizie di Formula 1 e Ferrari, ogni giorno su Formula Rossa." />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,700;1,8..60,400&display=swap"
          rel="stylesheet"
        />
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(0.85); }
          }
          @keyframes ticker {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: #0a0a0a; }
          ::-webkit-scrollbar-thumb { background: #dc2626; border-radius: 2px; }
        `}</style>
      </Head>

      <Navigation />

      {/* Ticker notizie */}
      {articles.length > 0 && <NewsTicker articles={articles} />}

      <main style={{
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "48px 24px 96px",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.55s ease",
      }}>

        {/* ── HEADER ── */}
        <header style={{
          marginBottom: "48px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "end",
          gap: "20px",
          paddingBottom: "28px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          animation: "fadeUp 0.6s ease both",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#dc2626", animation: "pulse 2s infinite", flexShrink: 0,
              }} />
              <span style={{
                fontSize: "10px", color: "#dc2626",
                fontFamily: "monospace", fontWeight: "800",
                letterSpacing: "2.5px", textTransform: "uppercase",
              }}>Live Feed · Formula 1</span>
            </div>
            <h1 style={{
              margin: 0,
              fontSize: "clamp(40px, 6vw, 68px)",
              fontWeight: "400",
              color: "#fff",
              fontFamily: "'Bebas Neue', Georgia, serif",
              letterSpacing: "4px", lineHeight: "1",
            }}>News F1</h1>
            <p style={{
              margin: "10px 0 0",
              color: "rgba(255,255,255,0.25)",
              fontSize: "12px", fontFamily: "monospace", letterSpacing: "0.5px",
            }}>
              Aggiornamenti quotidiani · Ferrari & Formula 1
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
            <span style={{
              fontSize: "11px", color: "rgba(255,255,255,0.18)",
              fontFamily: "monospace", letterSpacing: "0.5px",
            }}>
              {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
            </span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{
                background: "rgba(220,38,38,0.1)",
                border: "1px solid rgba(220,38,38,0.2)",
                color: "#dc2626",
                fontSize: "10px", fontFamily: "monospace", fontWeight: "700",
                padding: "4px 12px", borderRadius: "2px",
                textTransform: "uppercase", letterSpacing: "1px",
              }}>{articles.length} articoli</span>
            </div>
          </div>
        </header>

        {articles.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "120px 0",
            color: "rgba(255,255,255,0.2)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
          }}>
            <div style={{
              width: "60px", height: "60px", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: "24px", opacity: 0.3 }}>🏎</span>
            </div>
            <p style={{ margin: 0, fontSize: "13px", fontFamily: "monospace" }}>Nessuna notizia disponibile al momento.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>

            {/* ── HERO ── */}
            {hero && (
              <section style={{ animation: "fadeUp 0.6s 0.1s ease both", opacity: 0 }}>
                <SectionDivider label="In primo piano" />
                <div style={{ marginTop: "20px" }}>
                  <HeroCard article={hero} />
                </div>
              </section>
            )}

            {/* ── GRID + SIDEBAR ── */}
            {(featured.length > 0 || sidebar.length > 0) && (
              <section style={{ animation: "fadeUp 0.6s 0.2s ease both", opacity: 0 }}>
                <SectionDivider label="Ultime notizie" />
                <div style={{
                  marginTop: "20px",
                  display: "grid",
                  gridTemplateColumns: "1fr 320px",
                  gap: "32px",
                  alignItems: "start",
                }}>
                  {/* Grid card */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "16px",
                    alignItems: "start",
                  }}>
                    {featured.map(art => <NewsCard key={art.id} article={art} />)}
                  </div>

                  {/* Sidebar */}
                  {sidebar.length > 0 && (
                    <aside style={{
                      background: "#090909",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "4px",
                      padding: "20px 20px 4px",
                      position: "sticky",
                      top: "80px",
                    }}>
                      <div style={{
                        fontSize: "9px", fontWeight: "800",
                        color: "rgba(255,255,255,0.22)",
                        fontFamily: "monospace", letterSpacing: "2.5px",
                        textTransform: "uppercase", marginBottom: "4px",
                        paddingBottom: "12px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        display: "flex", alignItems: "center", gap: "10px",
                      }}>
                        <div style={{ width: "2px", height: "12px", background: "#dc2626", borderRadius: "1px", flexShrink: 0 }} />
                        ANCHE OGGI
                      </div>
                      {sidebar.map((art, i) => <SidebarCard key={art.id} article={art} index={i + 1} />)}
                    </aside>
                  )}
                </div>
              </section>
            )}

            {/* ── ARCHIVIO ── */}
            {remaining.length > 0 && (
              <section style={{ animation: "fadeUp 0.6s 0.3s ease both", opacity: 0 }}>
                <SectionDivider label="Archivio recente" />
                <div style={{
                  marginTop: "20px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "16px",
                }}>
                  {remaining.map(art => <NewsCard key={art.id} article={art} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
