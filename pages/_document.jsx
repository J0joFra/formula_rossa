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
                <meta name="google-adsense-account" content="ca-pub-8762257220044998"/>
                
                {/* Meta Description Unica */}
                <meta name="description" content="Esplora l'eredità della Scuderia Ferrari attraverso visualizzazioni dati interattive, statistiche storiche e analisi delle performance in F1." />
                
                {/* Open Graph */}
                <meta property="og:title" content="Formula Rossa | Ferrari F1 Data Platform" />
                <meta property="og:description" content="Dati, statistiche e storia della Scuderia Ferrari come non li hai mai visti." />
                <meta property="og:image" content="https://formula-rossa.it/data/images/formula-rossa-logo.png" />
                <meta property="og:url" content="https://formula-rossa.it" />             
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />

                {/* Favicon */}
                <link rel="icon" href="/favicon.ico" />

                {/* JSON-LD Schema.org */}
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
    )
}
