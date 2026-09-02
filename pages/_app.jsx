import { SessionProvider } from "next-auth/react";
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import Script from 'next/script';
import CookieConsent from '../components/CookieConsent';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <SessionProvider session={session}>
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

        {/* Font del design system — Barlow Condensed (titoli), DM Sans (testo),
            JetBrains Mono (numeri). Preconnect prima del CSS per velocizzare. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
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

      {/* Google AdSense */}
      <Script
        id="adsense-id"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8762257220044998"
        crossOrigin="anonymous"
        strategy="afterInteractive"
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
    </SessionProvider>
    </ThemeProvider>
  );
}

export default MyApp;