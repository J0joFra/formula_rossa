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

const RACE_BADGE_COLORS = {
  "GARA":       { bg: "#dc2626", text: "#fff" },
  "QUALIFICHE": { bg: "#b45309", text: "#fff" },
  "ANALISI":    { bg: "#1d4ed8", text: "#fff" },
  "FERRARI":    { bg: "#991b1b", text: "#fff" },
  "F1":         { bg: "#1a1a1a", text: "rgba(255,255,255,0.85)" },
};

function Tag({ label }) {
  const style = RACE_BADGE_COLORS[label.toUpperCase()] || {
    bg: "rgba(255,255,255,0.07)",
    text: "rgba(255,255,255,0.5)",
  };
  return (
    <span style={{
      background: style.bg,
      color: style.text,
      fontSize: "9px",
      fontWeight: "800",
      padding: "2px 7px",
      borderRadius: "3px",
      textTransform: "uppercase",
      letterSpacing: "0.8px",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function CoverPlaceholder({ title, height = 200 }) {
  const letters = (title || "F1").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div style={{
      width: "100%",
      height,
      background: "linear-gradient(160deg, #0d0d0d 0%, #1a0505 50%, #2d0a0a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(220,38,38,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.06) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 30% 50%, rgba(180,30,30,0.15) 0%, transparent 70%)",
      }} />
      <span style={{
        fontSize: height > 300 ? "96px" : "52px",
        fontWeight: "900",
        color: "rgba(255,255,255,0.04)",
        fontFamily: "'Bebas Neue', Georgia, serif",
        letterSpacing: "4px",
        userSelect: "none",
        position: "relative",
        zIndex: 1,
      }}>{letters}</span>
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
          borderRadius: "16px",
          overflow: "hidden",
          border: `1px solid ${hovered ? "rgba(220,38,38,0.5)" : "rgba(255,255,255,0.08)"}`,
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
          boxShadow: hovered ? "0 0 0 1px rgba(220,38,38,0.15), 0 24px 48px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.4)",
          cursor: "pointer",
          background: "#0d0d0d",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          minHeight: "360px",
        }}
      >
        {/* Immagine */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          {article.cover_image
            ? <img src={article.cover_image} alt={article.title}
                style={{
                  width: "100%", height: "100%", objectFit: "cover", display: "block",
                  transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
                  transform: hovered ? "scale(1.05)" : "scale(1)",
                }} />
            : <CoverPlaceholder title={article.title} height={360} />
          }
          {/* Overlay sfumato */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent 60%, #0d0d0d 100%)",
          }} />
          {/* Badge ULTIMA ORA */}
          <div style={{
            position: "absolute", top: "18px", left: "18px",
            background: "#dc2626",
            color: "white",
            fontSize: "9px",
            fontWeight: "800",
            padding: "4px 12px",
            borderRadius: "3px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            fontFamily: "'JetBrains Mono', monospace",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <span style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: "rgba(255,255,255,0.9)",
              animation: "pulse 1.5s infinite",
            }} />
            ULTIMA ORA
          </div>
        </div>

        {/* Testo */}
        <div style={{
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "20px",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Tags */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {article.tags.slice(0, 3).map(tag => <Tag key={tag} label={tag} />)}
            </div>

            {/* Titolo */}
            <h2 style={{
              margin: 0,
              fontSize: "clamp(18px, 2.2vw, 26px)",
              fontWeight: "700",
              lineHeight: "1.3",
              color: "#fff",
              fontFamily: "'Source Serif 4', Georgia, serif",
              letterSpacing: "-0.3px",
            }}>{article.title}</h2>

            {/* Excerpt */}
            <p style={{
              margin: 0,
              fontSize: "14px",
              color: "rgba(255,255,255,0.45)",
              lineHeight: "1.7",
              borderLeft: "2px solid #dc2626",
              paddingLeft: "14px",
            }}>{article.excerpt}</p>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingTop: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: "600" }}>
                {article.author}
              </span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
                {timeAgo(article.published_at)}
              </span>
            </div>
            <span style={{
              fontSize: "12px",
              color: "#dc2626",
              fontWeight: "800",
              fontFamily: "monospace",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "gap 0.2s",
            }}>LEGGI →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── SMALL CARD ─────────────────────────────────────────────────────────────────
function NewsCard({ article }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/news/${article.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? "rgba(220,38,38,0.05)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${hovered ? "rgba(220,38,38,0.35)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: "12px",
          overflow: "hidden",
          transition: "all 0.22s ease",
          transform: hovered ? "translateY(-4px)" : "none",
          boxShadow: hovered ? "0 16px 32px rgba(0,0,0,0.4)" : "none",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Immagine */}
        <div style={{ overflow: "hidden", flexShrink: 0 }}>
          {article.cover_image
            ? <img src={article.cover_image} alt={article.title}
                style={{
                  width: "100%", height: "170px", objectFit: "cover", display: "block",
                  transition: "transform 0.45s ease",
                  transform: hovered ? "scale(1.06)" : "scale(1)",
                }} />
            : <CoverPlaceholder title={article.title} height={170} />
          }
        </div>

        {/* Corpo */}
        <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Tags */}
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {article.tags.slice(0, 3).map(tag => <Tag key={tag} label={tag} />)}
          </div>

          {/* Titolo */}
          <h2 style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: "700",
            lineHeight: "1.45",
            color: hovered ? "#fff" : "rgba(255,255,255,0.88)",
            fontFamily: "'Source Serif 4', Georgia, serif",
            flex: 1,
            transition: "color 0.2s",
          }}>{article.title}</h2>

          {/* Excerpt */}
          <p style={{
            margin: 0,
            fontSize: "12px",
            color: "rgba(255,255,255,0.38)",
            lineHeight: "1.6",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>{article.excerpt}</p>

          {/* Meta */}
          <div style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.25)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "10px",
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "monospace",
          }}>
            <span>{article.author}</span>
            <span>{timeAgo(article.published_at)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── SIDEBAR CARD (lista verticale) ─────────────────────────────────────────────
function SidebarCard({ article, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/news/${article.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          gap: "14px",
          padding: "14px 0",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          cursor: "pointer",
          transition: "opacity 0.2s",
          opacity: hovered ? 1 : 0.75,
        }}
      >
        {/* Numero */}
        <div style={{
          fontSize: "20px",
          fontWeight: "900",
          color: "rgba(220,38,38,0.3)",
          fontFamily: "'Bebas Neue', Georgia, serif",
          minWidth: "28px",
          lineHeight: "1",
          paddingTop: "2px",
        }}>0{index}</div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {article.tags.slice(0, 2).map(tag => <Tag key={tag} label={tag} />)}
          </div>
          <p style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: "700",
            lineHeight: "1.4",
            color: hovered ? "#fff" : "rgba(255,255,255,0.8)",
            fontFamily: "'Source Serif 4', Georgia, serif",
            transition: "color 0.2s",
          }}>{article.title}</p>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
            {timeAgo(article.published_at)}
          </span>
        </div>

        {article.cover_image && (
          <div style={{
            width: "64px", height: "64px", flexShrink: 0,
            borderRadius: "8px", overflow: "hidden",
          }}>
            <img src={article.cover_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
      </article>
    </Link>
  );
}

// ── SECTION DIVIDER ────────────────────────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "8px 0" }}>
      <div style={{ width: "3px", height: "18px", background: "#dc2626", borderRadius: "2px", flexShrink: 0 }} />
      <span style={{
        fontSize: "11px",
        color: "rgba(255,255,255,0.3)",
        textTransform: "uppercase",
        letterSpacing: "2.5px",
        fontFamily: "monospace",
        fontWeight: "700",
      }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

// ── PAGE ───────────────────────────────────────────────────────────────────────
export default function NewsPage({ articles }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const hero      = articles[0] || null;
  const featured  = articles.slice(1, 4);   // 3 card griglia
  const sidebar   = articles.slice(4, 8);   // 4 lista laterale
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
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          * { box-sizing: border-box; }
        `}</style>
      </Head>

      <Navigation />

      <main style={{
        maxWidth: "1160px",
        margin: "0 auto",
        padding: "40px 20px 80px",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}>

        {/* ── HEADER ── */}
        <header style={{
          marginBottom: "40px",
          paddingBottom: "24px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{
                width: "5px", height: "5px", borderRadius: "50%",
                background: "#dc2626",
                animation: "pulse 2s infinite",
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: "10px",
                color: "#dc2626",
                fontFamily: "monospace",
                fontWeight: "800",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}>Live Feed</span>
            </div>
            <h1 style={{
              margin: 0,
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: "400",
              color: "#fff",
              fontFamily: "'Bebas Neue', Georgia, serif",
              letterSpacing: "3px",
              lineHeight: "1",
            }}>News F1</h1>
            <p style={{
              margin: "8px 0 0",
              color: "rgba(255,255,255,0.3)",
              fontSize: "13px",
              fontFamily: "monospace",
            }}>
              Aggiornamenti quotidiani · Ferrari & Formula 1
            </p>
          </div>

          {/* Ticker date */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "4px",
          }}>
            <span style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.2)",
              fontFamily: "monospace",
            }}>{new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}</span>
            <span style={{
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.2)",
              color: "#dc2626",
              fontSize: "10px",
              fontFamily: "monospace",
              fontWeight: "700",
              padding: "3px 10px",
              borderRadius: "4px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}>{articles.length} articoli</span>
          </div>
        </header>

        {articles.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "100px 0",
            color: "rgba(255,255,255,0.25)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="23" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              <path d="M16 24 L32 24 M24 16 L24 32" stroke="rgba(220,38,38,0.3)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p style={{ margin: 0, fontSize: "14px" }}>Nessuna notizia disponibile al momento.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

            {/* ── HERO ── */}
            {hero && (
              <>
                <SectionDivider label="In primo piano" />
                <HeroCard article={hero} />
              </>
            )}

            {/* ── FEATURED 3-COLUMN + SIDEBAR ── */}
            {(featured.length > 0 || sidebar.length > 0) && (
              <>
                <SectionDivider label="Ultime notizie" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "28px", alignItems: "start" }}>

                  {/* Grid 3 colonne */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "16px",
                  }}>
                    {featured.map(art => <NewsCard key={art.id} article={art} />)}
                  </div>

                  {/* Sidebar lista */}
                  {sidebar.length > 0 && (
                    <aside style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "12px",
                      padding: "20px 20px 8px",
                    }}>
                      <div style={{
                        fontSize: "10px",
                        fontWeight: "800",
                        color: "rgba(255,255,255,0.3)",
                        fontFamily: "monospace",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                      }}>ANCHE OGGI</div>
                      {sidebar.map((art, i) => <SidebarCard key={art.id} article={art} index={i + 1} />)}
                    </aside>
                  )}
                </div>
              </>
            )}

            {/* ── REMAINING ── */}
            {remaining.length > 0 && (
              <>
                <SectionDivider label="Archivio recente" />
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "16px",
                }}>
                  {remaining.map(art => <NewsCard key={art.id} article={art} />)}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
