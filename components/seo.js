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
/* Il logo è quadrato 500×500: come og:image veniva ritagliato male da ogni
   social e i meta dichiaravano 1200×630, che è la misura che i social si
   aspettano ma non quella del file. Ora c'è una vera card 1200×630. */
const DEFAULT_OG = `${BASE_URL}/og-formula-rossa.jpg`;
const LOGO = `${BASE_URL}/data/images/formula-rossa-logo.png`;

/* Gli account veri, quelli linkati nel footer. Prima qui c'erano
   facebook.com/formularossa, instagram.com/formularossa e
   twitter.com/formularossa: profili che non sono di questo sito. `sameAs`
   serve a dire a Google e agli LLM "questa entità è anche quella lì" — se i
   profili sono sbagliati il collegamento si fa comunque, con qualcun altro.
   Meglio nessun sameAs che un sameAs falso. */
const PROFILI = [
  'https://www.linkedin.com/company/formula-rossa/',
  'https://www.instagram.com/formularossa.it',
  'https://www.youtube.com/@jofrancalanci',
  'https://www.x.com/jofrancalanci',
  'https://whatsapp.com/channel/0029Vb7EagL6WaKvnD5Slm30',
];

const HANDLE_X = '@jofrancalanci';
const DEFAULT_DESC = 'Formula Rossa è la piattaforma definitiva per i tifosi della Scuderia Ferrari. Esplora statistiche F1, dati storici e grafici interattivi della Rossa.';

/* L'identità del sito, ripetuta su ogni pagina.
   Non è un LocalBusiness — quello descrive un'attività con un indirizzo e
   degli orari di apertura, e dichiararlo per un sito che non ha né l'uno né
   gli altri è un dato falso dato a Google. Quello che questo sito è davvero:
   un'organizzazione (l'editore) che pubblica un'applicazione web gratuita. */
const ORGANIZZAZIONE = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: SITE_NAME,
  url: BASE_URL,
  description: DEFAULT_DESC,
  logo: { '@type': 'ImageObject', url: LOGO, width: 500, height: 500 },
  image: DEFAULT_OG,
  email: 'info@formula-rossa.it',
  foundingDate: '2025',
  knowsAbout: [
    'Scuderia Ferrari', 'Formula 1', 'statistiche Formula 1',
    'storia della Ferrari in Formula 1', 'Gran Premi', 'piloti Ferrari',
  ],
  founder: { '@type': 'Person', name: 'Joaquim Francalanci' },
  sameAs: PROFILI,
};

const APPLICAZIONE = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': `${BASE_URL}/#webapp`,
  name: SITE_NAME,
  url: BASE_URL,
  description: DEFAULT_DESC,
  applicationCategory: 'SportsApplication',
  browserRequirements: 'Richiede JavaScript',
  operatingSystem: 'All',
  inLanguage: 'it-IT',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  publisher: { '@id': `${BASE_URL}/#organization` },
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
  jsonLd = null,         // schema della pagina: un oggetto, o un elenco
  facebookAppId = null,  // opzionale: ID app Facebook per og:app_id
}) {
  const canonical = `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | Statistiche e Analisi Dati Ferrari F1`;
  const ogImageFull = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;

  // Combina schema globale + eventuale schema specifico della pagina
  /* Una pagina può dichiarare più di un'entità — la scheda di un pilota è
     una Person *e* una briciola di pane — quindi `jsonLd` accetta anche un
     elenco. I `null` si scartano: chi chiama può costruire lo schema solo
     quando ha i dati, senza scrivere condizioni. */
  const dellaPagina = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean);
  const schemas = [ORGANIZZAZIONE, APPLICAZIONE, ...dellaPagina];

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
      {/* Le misure si dichiarano solo per l'immagine di default, che è
          davvero 1200×630. Per un'immagine passata dalla pagina non le
          conosciamo, e dichiararle a caso fa ritagliare male l'anteprima. */}
      {ogImageFull === DEFAULT_OG && <meta property="og:image:width"  content="1200" />}
      {ogImageFull === DEFAULT_OG && <meta property="og:image:height" content="630" />}
      <meta property="og:image:alt"   content={fullTitle} />
      <meta property="og:locale"      content="it_IT" />
      {facebookAppId && <meta property="fb:app_id" content={facebookAppId} />}

      {/* ── Twitter Card ── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content={HANDLE_X} />
      <meta name="twitter:creator"     content={HANDLE_X} />
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