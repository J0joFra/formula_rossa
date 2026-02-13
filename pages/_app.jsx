import { SessionProvider } from "next-auth/react";
import Head from 'next/head';
import Script from 'next/script'; // Aggiungi questa importazione
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Formula Rossa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Font Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="description" content="Formula Rossa è la piattaforma definitiva per i tifosi della Scuderia Ferrari. Esplora statistiche F1, dati storici e grafici interattivi della Rossa.">
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

      {/* Configurazione colori Ferrari */}
      <Script
        id="tailwind-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'ferrari-red': '#DC0000',
                    'ferrari-yellow': '#FFD700',
                    'ferrari-dark': '#0A0A0A'
                  },
                  animation: {
                    'pulse-slow': 'pulse 3s ease-in-out infinite',
                    'float': 'float 6s ease-in-out infinite',
                  },
                  keyframes: {
                    float: {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-20px)' },
                    }
                  }
                }
              }
            }
          `
        }}
      />

      {/* Stili globali */}
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background-color: #000000;
          color: #ffffff;
          overflow-x: hidden;
        }
        
        /* Scrollbar Ferrari */
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #DC0000;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #FF0000;
        }
        
        /* Effetti Ferrari */
        .ferrari-glow {
          box-shadow: 0 0 30px rgba(220, 0, 0, 0.3);
        }
        
        .bg-ferrari-gradient {
          background: linear-gradient(135deg, #DC0000 0%, #000000 50%, #FFD700 100%);
        }
        
        /* Punti animati Ferrari */
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
      `}</style>
      
      {/* SFONDO CON PUNTI FERRARI */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-ferrari-red rounded-full opacity-10 animate-ferrari-pulse blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-ferrari-yellow rounded-full opacity-5 animate-ferrari-pulse blur-3xl" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-ferrari-red rounded-full opacity-7 animate-ferrari-pulse blur-3xl" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default MyApp
