import { SessionProvider } from "next-auth/react";
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import Script from 'next/script'; 
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

        {/* Theme color (barra browser su Android/Chrome) */}
        <meta name="theme-color" content="#DC0000" />
        <meta name="msapplication-TileColor" content="#DC0000" />

        {/* PWA manifest (crea /public/manifest.json se vuoi installabilità) */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link rel="icon"             href="/favicon.ico" />
        <link rel="icon"             href="/favicon.svg"    type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Font Inter — preconnect prima del CSS per velocizzare */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>

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

      {/* Stili globali */}
      <style jsx global>{`
        /* ===== RESET & BASE ===== */
        *, *::before, *::after {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --ferrari-red: #DC0000;
          --ferrari-yellow: #FFD700;
          --ferrari-dark: #0A0A0A;

          /* Spacing scale */
          --space-xs: 0.25rem;
          --space-sm: 0.5rem;
          --space-md: 1rem;
          --space-lg: 1.5rem;
          --space-xl: 2rem;
          --space-2xl: 3rem;
          --space-3xl: 4rem;

          /* Typography scale */
          --text-xs: 0.75rem;
          --text-sm: 0.875rem;
          --text-base: 1rem;
          --text-lg: 1.125rem;
          --text-xl: 1.25rem;
          --text-2xl: 1.5rem;
          --text-3xl: 1.875rem;
          --text-4xl: 2.25rem;
          --text-5xl: 3rem;

          /* Touch targets */
          --touch-min: 44px;
        }

        html {
          font-size: 16px;
          scroll-behavior: smooth;
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Oxygen, Ubuntu, Cantarell, sans-serif;
          background-color: #000000;
          color: #ffffff;
          overflow-x: hidden;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* ===== SCROLLBAR FERRARI (desktop) ===== */
        @media (hover: hover) {
          ::-webkit-scrollbar {
            width: 10px;
          }

          ::-webkit-scrollbar-track {
            background: #1a1a1a;
          }

          ::-webkit-scrollbar-thumb {
            background: var(--ferrari-red);
            border-radius: 5px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #FF0000;
          }
        }

        /* ===== UTILITY CLASSI FERRARI ===== */
        .ferrari-glow {
          box-shadow: 0 0 30px rgba(220, 0, 0, 0.3);
        }

        .bg-ferrari-gradient {
          background: linear-gradient(135deg, #DC0000 0%, #000000 50%, #FFD700 100%);
        }

        /* ===== ANIMAZIONI ===== */
        @keyframes ferrari-pulse {
          0%, 100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.1);
          }
        }

        .animate-ferrari-pulse {
          animation: ferrari-pulse 2s ease-in-out infinite;
        }

        /* ===== LAYOUT GLOBALE ===== */

        /* Contenitore principale — limita la larghezza e centra */
        .container {
          width: 100%;
          margin-inline: auto;
          padding-inline: var(--space-md);
        }

        @media (min-width: 640px) {
          .container { max-width: 640px; padding-inline: var(--space-lg); }
        }
        @media (min-width: 768px) {
          .container { max-width: 768px; }
        }
        @media (min-width: 1024px) {
          .container { max-width: 1024px; padding-inline: var(--space-xl); }
        }
        @media (min-width: 1280px) {
          .container { max-width: 1280px; }
        }
        @media (min-width: 1536px) {
          .container { max-width: 1536px; }
        }

        /* ===== TIPOGRAFIA RESPONSIVA ===== */
        h1 {
          font-size: clamp(1.75rem, 5vw, 3.5rem);
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        h2 {
          font-size: clamp(1.25rem, 3.5vw, 2.25rem);
          line-height: 1.2;
          font-weight: 700;
        }

        h3 {
          font-size: clamp(1rem, 2.5vw, 1.5rem);
          line-height: 1.3;
          font-weight: 600;
        }

        p {
          font-size: clamp(var(--text-sm), 2vw, var(--text-base));
          line-height: 1.7;
        }

        /* ===== TOUCH-FRIENDLY INTERACTIVE ELEMENTS ===== */
        a, button, [role="button"], input, select, textarea, label {
          min-height: var(--touch-min);
        }

        button, [role="button"] {
          cursor: pointer;
          touch-action: manipulation;
        }

        input, select, textarea {
          font-size: var(--text-base); /* evita zoom automatico su iOS */
          border-radius: 0;           /* rimuove border-radius di default su iOS */
        }

        /* ===== IMMAGINI & MEDIA ===== */
        img, video, svg {
          max-width: 100%;
          height: auto;
          display: block;
        }

        /* ===== TABELLE RESPONSIVE ===== */
        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: var(--text-sm);
        }

        /* ===== CARD / PANEL ===== */
        .card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(220, 0, 0, 0.2);
          border-radius: 12px;
          padding: var(--space-lg);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        @media (hover: hover) {
          .card:hover {
            border-color: rgba(220, 0, 0, 0.5);
            box-shadow: 0 0 20px rgba(220, 0, 0, 0.15);
          }
        }

        @media (max-width: 639px) {
          .card {
            padding: var(--space-md);
            border-radius: 8px;
          }
        }

        /* ===== GRID RESPONSIVE ===== */
        .grid-auto {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
          gap: var(--space-lg);
        }

        @media (max-width: 639px) {
          .grid-auto { gap: var(--space-md); }
        }

        /* ===== NAVIGAZIONE MOBILE ===== */
        .nav-mobile {
          display: none;
        }

        @media (max-width: 767px) {
          .nav-desktop {
            display: none;
          }

          .nav-mobile {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-top: 1px solid rgba(220, 0, 0, 0.3);
            padding: var(--space-sm) var(--space-md);
            padding-bottom: max(var(--space-sm), env(safe-area-inset-bottom));
            justify-content: space-around;
            align-items: center;
          }

          .nav-mobile a {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            font-size: var(--text-xs);
            font-weight: 500;
            color: rgba(255, 255, 255, 0.6);
            text-decoration: none;
            padding: var(--space-xs) var(--space-sm);
            border-radius: 8px;
            min-height: unset;
            transition: color 0.15s ease;
          }

          .nav-mobile a.active,
          .nav-mobile a:hover {
            color: var(--ferrari-red);
          }

          /* Lascia spazio al bottom nav — solo main, non tutti gli ultimi figli */
          main {
            padding-bottom: calc(72px + env(safe-area-inset-bottom));
          }
        }

        /* ===== SAFE AREA (notch, home indicator) ===== */
        .safe-top    { padding-top:    env(safe-area-inset-top);    }
        .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
        .safe-left   { padding-left:   env(safe-area-inset-left);   }
        .safe-right  { padding-right:  env(safe-area-inset-right);  }

        /* ===== GRAFICI / CANVAS ===== */
        canvas {
          max-width: 100%;
          touch-action: pan-y pinch-zoom;
        }

        /* ===== HERO SECTION ===== */
        .hero {
          min-height: 100svh; /* svh tiene conto della barra del browser mobile */
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding-inline: var(--space-md);
        }

        /* ===== SEZIONI CON PADDING VERTICALE ===== */
        .section {
          padding-block: var(--space-3xl);
        }

        @media (max-width: 639px) {
          .section {
            padding-block: var(--space-2xl);
          }
        }

        /* ===== PULSANTI FERRARI ===== */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: 0.75rem 1.5rem;
          min-height: var(--touch-min);
          font-size: var(--text-sm);
          font-weight: 600;
          border-radius: 6px;
          border: none;
          text-decoration: none;
          transition: background-color 0.2s ease, transform 0.15s ease;
          white-space: nowrap;
        }

        .btn-primary {
          background: var(--ferrari-red);
          color: #fff;
        }

        @media (hover: hover) {
          .btn-primary:hover {
            background: #ff1a1a;
            transform: translateY(-1px);
          }
        }

        .btn-primary:active {
          transform: scale(0.97);
        }

        .btn-outline {
          background: transparent;
          color: var(--ferrari-red);
          border: 1.5px solid var(--ferrari-red);
        }

        @media (hover: hover) {
          .btn-outline:hover {
            background: rgba(220, 0, 0, 0.1);
          }
        }

        /* ===== FORM ELEMENTS ===== */
        .input {
          width: 100%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: #fff;
          font-size: var(--text-base);
          min-height: var(--touch-min);
          transition: border-color 0.2s ease;
        }

        .input:focus {
          outline: none;
          border-color: var(--ferrari-red);
          box-shadow: 0 0 0 3px rgba(220, 0, 0, 0.2);
        }

        /* ===== UTILITY RESPONSIVE ===== */
        @media (max-width: 639px) {
          .hide-mobile { display: none !important; }
        }

        @media (min-width: 640px) {
          .hide-desktop { display: none !important; }
        }

        /* ===== ACCESSIBILITÀ ===== */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        :focus-visible {
          outline: 2px solid var(--ferrari-red);
          outline-offset: 3px;
        }
      `}</style>
      
      {/* SFONDO CON PUNTI FERRARI */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
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
    </SessionProvider>
    </ThemeProvider>
  );
}

export default MyApp;