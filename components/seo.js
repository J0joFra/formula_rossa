/**
 * components/SEO.js
 *
 * Componente SEO riutilizzabile — importa in ogni pagina e passa le props.
 *
 * Uso minimo:
 *   <SEO title="Statistiche Ferrari" path="/stats" />
 *
 * Uso completo:
 *   <SEO
 *     title="Predici il GP | Formula Rossa"
 *     description="Usa la nostra AI per anticipare i risultati del prossimo Gran Premio."
 *     path="/predictions"
 *     ogImage="/og-predictions.jpg"
 *     ogType="website"
 *     noIndex={false}
 *     jsonLd={myStructuredData}
 *   />
 */

import Head from 'next/head';

const BASE_URL   = 'https://formula-rossa.it';
const SITE_NAME  = 'Formula Rossa';
const DEFAULT_OG = `${BASE_URL}/og-image.jpg`;
const DEFAULT_DESC = 'Formula Rossa è la piattaforma definitiva per i tifosi della Scuderia Ferrari. Esplora statistiche F1, dati storici e grafici interattivi della Rossa.';

export default function SEO({
  title,
  description = DEFAULT_DESC,
  path = '/',
  ogImage = DEFAULT_OG,
  ogType = 'website',
  noIndex = false,
  jsonLd = null,
}) {
  const canonical  = `${BASE_URL}${path}`;
  const fullTitle  = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | Statistiche e Analisi Dati Ferrari F1`;

  return (
    <Head>
      {/* ── Titolo & Descrizione ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* ── Canonical ── */}
      <link rel="canonical" href={canonical} />

      {/* ── Robots ── */}
      {noIndex
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      }

      {/* ── Open Graph ── */}
      <meta property="og:type"        content={ogType} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale"      content="it_IT" />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content="@formularossa" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`} />

      {/* ── JSON-LD Structured Data ── */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
}