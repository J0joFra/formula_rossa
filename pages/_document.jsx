import { Html, Head, Main, NextScript } from 'next/document'

export default function Document(props) {
  const locale = props.__NEXT_DATA__.locale || 'it';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Formula Rossa",
    "alternateName": ["Formula Rossa F1 Stats", "Formula Rossa Dati Ferrari"],
    "url": "https://formula-rossa.it",
    "description": "Piattaforma data-driven dedicata alla storia e alle statistiche della Scuderia Ferrari in Formula 1.",
    "genre": "Sports Analytics",
    "keywords": "Ferrari F1, Statistiche Ferrari, Scuderia Ferrari Dati, Formula 1 Stats",
    "about": {
      "@type": "SportsOrganization",
      "name": "Scuderia Ferrari"
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