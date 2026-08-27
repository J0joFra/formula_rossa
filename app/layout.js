import Footer from '../components/ferrari/Footer';
import CookieConsent from '../components/CookieConsent';
import './globals.css';

export const metadata = {
  title: 'Formula Rossa - Data Intelligence Scuderia Ferrari F1',
  description: 'Piattaforma indipendente di data intelligence sulla Scuderia Ferrari in Formula 1. Statistiche, analisi e storia della Rossa.',
  keywords: 'Ferrari, Formula 1, F1, Scuderia Ferrari, dati F1, statistiche F1, storia Ferrari',
  authors: [{ name: 'Formula Rossa' }],
  openGraph: {
    title: 'Formula Rossa - Data Intelligence Ferrari F1',
    description: 'Statistiche, analisi e storia della Scuderia Ferrari in Formula 1',
    url: 'https://formularossa.it',
    siteName: 'Formula Rossa',
    images: [
      {
        url: 'https://formularossa.it/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Formula Rossa - Data Intelligence Ferrari F1',
    description: 'Statistiche, analisi e storia della Scuderia Ferrari in Formula 1',
    images: ['https://formularossa.it/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        {/* Meta tag aggiuntivi per SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="Ferrari, Formula 1, F1, Scuderia Ferrari, dati F1, statistiche F1" />
        <meta name="author" content="Formula Rossa" />

        {/* Font del design system — stessi del Pages Router */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
