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
 *     title="Predici il GP"
 *     description="Usa la nostra AI per anticipare i risultati del prossimo Gran Premio."
 *     path="/predictions"
 *     ogImage="/og-predictions.jpg"
 *     ogType="website"
 *     noIndex={false}
 *     jsonLd={myStructuredData}
 *   />
 */

import Head from 'next/head';

const BASE_URL    = 'https://formula-rossa.it';
const SITE_NAME   = 'Formula Rossa';
const DEFAULT_OG  = `${BASE_URL}/og-image.jpg`;
const DEFAULT_DESC = 'Formula Rossa è la piattaforma definitiva per i tifosi della Scuderia Ferrari. Esplora statistiche F1, dati storici e grafici interattivi della Rossa.';

// ── Local Business Schema (sempre incluso, migliora il ranking locale) ──
const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: BASE_URL,
  description: DEFAULT_DESC,
  applicationCategory: 'SportsApplication',
  operatingSystem: 'All',
  inLanguage: 'it',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  author: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [
      'https://www.facebook.com/formularossa',
      'https://www.instagram.com/formularossa',
      'https://twitter.com/formularossa',
    ],
  },
};

// ── BreadcrumbList helper ──
export function buildBreadcrumbs(items) {
  // items: [{ name: 'Home', path: '/' }, { name: 'Stats', path: '/stats' }]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    })),
  };
}

export default function SEO({
  title,
  description = DEFAULT_DESC,
  path = '/',
  ogImage = DEFAULT_OG,
  ogType = 'website',
  noIndex = false,
  jsonLd = null,         // schema aggiuntivo specifico della pagina
  facebookAppId = null,  // opzionale: ID app Facebook per og:app_id
}) {
  const canonical = `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | Statistiche e Analisi Dati Ferrari F1`;
  const ogImageFull = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;

  // Combina schema globale + eventuale schema specifico della pagina
  const schemas = [LOCAL_BUSINESS_SCHEMA, ...(jsonLd ? [jsonLd] : [])];

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
      <meta property="og:image"       content={ogImageFull} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt"   content={fullTitle} />
      <meta property="og:locale"      content="it_IT" />
      {facebookAppId && <meta property="fb:app_id" content={facebookAppId} />}

      {/* ── Twitter Card ── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content="@formularossa" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImageFull} />
      <meta name="twitter:image:alt"   content={fullTitle} />

      {/* ── JSON-LD: schema globale + pagina ── */}
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Head>
  );
}