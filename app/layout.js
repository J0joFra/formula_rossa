// app/layout.js
import { Inter } from 'next/font/google';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
      </head>
      <body className={inter.className}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
