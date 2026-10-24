import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import Script from 'next/script';
import CookieConsent from '../components/CookieConsent';
/* Font del design system, serviti dal sito (@fontsource) invece che da Google
   Fonts: niente CSS esterno che blocca il primo disegno, niente connessione in
   più verso fonts.googleapis.com, e solo l'alfabeto latino. */
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/barlow-condensed/latin-800.css';
import '@fontsource/barlow-condensed/latin-900.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Head>
        {/* Charset & Viewport */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

        {/* AdSense verification */}
        <meta name="google-adsense-account" content="ca-pub-8762257220044998" />

        {/* Theme color (barra browser su Android/Chrome) — rosso del design system */}
        <meta name="theme-color" content="#E8002D" />
        <meta name="msapplication-TileColor" content="#E8002D" />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon — /favicon.svg e /apple-touch-icon.png non esistevano e
            producevano un 404 a ogni caricamento di pagina. */}
        <link rel="icon"             href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/data/images/formula-rossa-logo.png" />
      </Head>

      {/* Google Consent Mode v2 default "denied" impostato in pages/_document.jsx,
          così parte prima del caricamento di Analytics/AdSense. */}

      {/* Google Analytics (gtag.js) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-8ZCZQFLK4L"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-8ZCZQFLK4L');
        `}
      </Script>

      {/* Google AdSense — `lazyOnload`: parte quando la pagina ha finito di
          caricarsi. Sono decine di script di terze parti, e con
          `afterInteractive` si contendevano la rete con il contenuto. La
          verifica dell'account usa il meta tag qui sopra e ads.txt. */}
      <Script
        id="adsense-id"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8762257220044998"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />

      {/* Stili globali: design system in styles/globals.css + styles/tokens.css */}

      {/* SFONDO AMBIENTALE
         `-z-10` non era qui: un elemento `fixed` senza z-index si dipinge sopra
         tutto il contenuto che non è a sua volta posizionato, quindi i tre aloni
         passavano *davanti* alle pagine e le velavano di rosa — si vede nelle
         tabelle e nei grafici, dove il fondo bianco diventa rosato. Il footer
         aveva già una toppa locale (`relative z-10`); qui si toglie la causa.
         Il colore di fondo lo mette `body` in styles/globals.css, quindi gli
         aloni restano visibili dietro le pagine con sfondo trasparente. */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-ferrari-red rounded-full opacity-10 animate-ferrari-pulse blur-3xl"
        />
        <div
          className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-ferrari-yellow rounded-full opacity-5 animate-ferrari-pulse blur-3xl"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-48 h-48 bg-ferrari-red rounded-full opacity-[0.07] animate-ferrari-pulse blur-3xl"
          style={{ animationDelay: '0.5s' }}
        />
      </div>

      <Component {...pageProps} />
      <CookieConsent />
    </ThemeProvider>
  );
}

export default MyApp;