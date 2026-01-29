import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Tailwind CSS da CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Configurazione colori Ferrari */}
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  'ferrari-red': '#DC0000',
                  'ferrari-yellow': '#FFD700',
                }
              }
            }
          }
        </script>
        
        {/* Font Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        
        {/* Stili globali */}
        <style>{`
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
          
          .animate-pulse-slow {
            animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </Head>
      
      <Component {...pageProps} />
    </>
  )
}

export default MyApp