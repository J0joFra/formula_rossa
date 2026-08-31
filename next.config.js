/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /* ── Internazionalizzazione ── */
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
  },

  /* ── Ottimizzazione immagini ── */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'it.motorsport.com' },
      { protocol: 'https', hostname: 'cdn.motorsport.com' },
      { protocol: 'https', hostname: 'api.rss2json.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 86400,
  },

  /* ── Compressione ── */
  compress: true,

  /* ── Ottimizzazione bundle ── */
  poweredByHeader: false,

  /* ── HTTP Headers ── */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Sicurezza base
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'X-XSS-Protection',         value: '1; mode=block' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
          // HTTP/2 Server Push — preload risorse critiche
          {
            key: 'Link',
            value: [
              '</data/images/formula-rossa-logo.png>; rel=preload; as=image',
              '</data/images/sf26.jpg>; rel=preload; as=image',
            ].join(', '),
          },
        ],
      },
      {
        source: '/data/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/data/:path*.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
          { key: 'Vary',          value: 'Accept' },
        ],
      },
    ];
  },

  /* ── Redirect canonici ── */
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.formula-rossa.it' }],
        destination: 'https://formula-rossa.it/:path*',
        permanent: true,
      },
      /* Fanta e pronostici ora vivono nell'app GridUp: le vecchie URL non
         restano orfane. Redirect temporaneo (307) e non permanente, così la
         scelta resta reversibile senza cache aggressiva nei browser. */
      { source: '/fantaf1',    destination: 'https://gridup-f1.web.app', permanent: false },
      { source: '/predictions', destination: 'https://gridup-f1.web.app', permanent: false },
      /* Il live timing in tempo reale richiederebbe il tier a pagamento di
         OpenF1, ed è una commodity già coperta meglio dall'app ufficiale F1.
         La pagina resta nel repo: i suoi grafici (components/livetiming/)
         lavorano su dati di sessione, gratuiti dopo la gara, e saranno la base
         delle pagine "Analisi GP". Redirect temporaneo, non permanente. */
      { source: '/live-timing', destination: '/standings', permanent: false },
      /* /races?id=123 mostrava lo stesso Gran Premio di /gp/[anno]/[round], con
         una URL che non dice quale gara sia. Ora l'analisi vive in un posto
         solo: le vecchie URL, non essendoci modo di risalire ad anno e round
         senza interrogare il database, atterrano sull'elenco dei GP. */
      { source: '/races', destination: '/gp', permanent: false },
    ];
  },

  /* ── Webpack: ottimizzazioni bundle ── */
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals = [...(config.externals || []), 'recharts', 'd3'];
    }
    return config;
  },
};

module.exports = nextConfig;