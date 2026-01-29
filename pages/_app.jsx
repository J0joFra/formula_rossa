import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Tailwind CSS da CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Configurazione colori Ferrari - VERSIONE CORRETTA */}
        <script dangerouslySetInnerHTML={{
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
        }} />
        
        {/* Font Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        
        {/* Stili globali */}
        <style>{`
          /* Slider personalizzato */
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #DC0000;
            cursor: pointer;
            border: 2px solid white;
          }
          
          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #DC0000;
            cursor: pointer;
            border: 2px solid white;
          }
          
          /* Line clamp per testo */
          .line-clamp-1 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }
          
          .line-clamp-2 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
          
          .line-clamp-3 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
          }
        `}</style>
      </Head>
      
      {/* SFONDO CON PUNTI FERRARI */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-ferrari-red rounded-full opacity-10 animate-ferrari-pulse blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-ferrari-yellow rounded-full opacity-5 animate-ferrari-pulse blur-3xl" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-ferrari-red rounded-full opacity-7 animate-ferrari-pulse blur-3xl" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
