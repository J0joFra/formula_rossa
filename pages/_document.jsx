import { Html, Head, Main, NextScript } from 'next/document'

export default function Document(props) {
    const locale = props.__NEXT_DATA__.locale || 'it';

    return (
        <Html lang={locale}>
            <Head>
                <meta name="google-adsense-account" content="ca-pub-8762257220044998"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <meta property="og:title" content="Formula Rossa | Ferrari F1 Data Platform" />
                <meta property="og:description" content="Esplora la storia e le statistiche della Scuderia Ferrari attraverso i dati." />
                <meta property="og:image" content="https://formula-rossa.it/data/images/formula-rossa-logo.png" />
                <meta property="og:url" content="https://formula-rossa.it" />             
                <meta property="og:type" content="website" />
                <meta property="og:logo" content="public\favicon.ico" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}