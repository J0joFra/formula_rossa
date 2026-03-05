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
    domains: [
      'images.unsplash.com',
      'flagcdn.com',              // bandiere circuiti in PredictorSection
      'it.motorsport.com',        // thumbnail RSS news
      'cdn.motorsport.com',       // CDN alternativo motorsport
      'api.rss2json.com',         // eventuali immagini via proxy RSS
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], 
    imageSizes: [16, 32, 48, 64, 96, 128, 256],      
    minimumCacheTTL: 86400,                           
  },

  /* ── Compressione ── */
  compress: true,

  /* ── Ottimizzazione bundle ── */
  swcMinify: true,        
  poweredByHeader: false,  

  /* ── HTTP Headers ── */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Sicurezza base
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'DENY' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
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
          // JSON dati F1: cache 1h
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
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