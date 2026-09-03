import { Html, Head, Main, NextScript } from 'next/document'

export default function Document(props) {
  const locale = props.__NEXT_DATA__.locale || 'it';

  /* Lo schema del sito come oggetto (il resto — organizzazione, applicazione,
     pagina — sta in components/seo.js). I nodi si collegano per `@id`: senza,
     Google riceve tre entità slegate e deve indovinare se parlino della stessa
     cosa. Con `@id` glielo diciamo noi.

     `about` dice di cosa parla il sito collegandolo a una fonte esterna: è il
     modo per dire "quella Ferrari lì" invece di lasciare la disambiguazione al
     caso, ed è quello che cercano i crawler degli LLM.
     Manca l'identificativo Wikidata, che sarebbe il collegamento più forte:
     va aggiunto a mano dopo averlo verificato su wikidata.org — un `sameAs`
     che punta all'entità sbagliata è peggio di un `sameAs` in meno. */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://formula-rossa.it/#website",
    "name": "Formula Rossa",
    "alternateName": ["Formula Rossa F1 Stats", "Formula Rossa Dati Ferrari"],
    "url": "https://formula-rossa.it",
    "description": "Piattaforma data-driven dedicata alla storia e alle statistiche della Scuderia Ferrari in Formula 1.",
    "inLanguage": "it-IT",
    "publisher": { "@id": "https://formula-rossa.it/#organization" },
    "about": {
      "@type": "SportsOrganization",
      "name": "Scuderia Ferrari",
      "alternateName": ["Ferrari", "Scuderia Ferrari HP"],
      "sameAs": [
        "https://it.wikipedia.org/wiki/Scuderia_Ferrari"
      ]
    }
  };

  return (
    <Html lang={locale}>
      <Head>
        {/* Google Consent Mode v2 — default "denied" finché l'utente non sceglie.
            Impostato il prima possibile, prima di Analytics/AdSense (caricati in _app). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              var __consentGranted = false;
              try { __consentGranted = localStorage.getItem('cookieConsent') === 'accepted'; } catch (e) {}
              gtag('consent', 'default', {
                ad_storage:         __consentGranted ? 'granted' : 'denied',
                analytics_storage:  __consentGranted ? 'granted' : 'denied',
                ad_user_data:       __consentGranted ? 'granted' : 'denied',
                ad_personalization: __consentGranted ? 'granted' : 'denied',
                wait_for_update: 500
              });
            `,
          }}
        />

        {/* Solo schema globale qui — tutti i meta SEO vanno in components/SEO.js */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}