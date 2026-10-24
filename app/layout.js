import Providers from './providers';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import CookieConsent from '../components/CookieConsent';
/* Lo stesso foglio di stile del Pages Router. Qui c'era solo app/globals.css,
   che importa i token ma non il design system: le pagine dell'App Router — le
   legali — restavano senza le classi condivise (.btn, .table-wrapper,
   .fr-eyebrow) e senza il layer di compatibilità, che è quello che tiene
   leggibile il bianco sul rosso dei bottoni. Barra e piè di pagina sono gli
   stessi componenti, quindi si vedeva la differenza. */
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

export const metadata = {
  metadataBase: new URL('https://formula-rossa.it'),
  /* Le pagine figlie danno il proprio titolo: prima tutte e tre le pagine
     legali avevano questo, uguale. */
  title: {
    default: 'Formula Rossa - Data Intelligence Scuderia Ferrari F1',
    template: '%s | Formula Rossa',
  },
  description: 'Piattaforma indipendente di data intelligence sulla Scuderia Ferrari in Formula 1. Statistiche, analisi e storia della Rossa.',
  keywords: 'Ferrari, Formula 1, F1, Scuderia Ferrari, dati F1, statistiche F1, storia Ferrari',
  authors: [{ name: 'Formula Rossa' }],
  openGraph: {
    title: 'Formula Rossa - Data Intelligence Ferrari F1',
    description: 'Statistiche, analisi e storia della Scuderia Ferrari in Formula 1',
    url: 'https://formula-rossa.it',
    siteName: 'Formula Rossa',
    images: [
      {
        url: 'https://formula-rossa.it/og-formula-rossa.jpg',
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
    images: ['https://formula-rossa.it/og-formula-rossa.jpg'],
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
    <html lang="it" suppressHydrationWarning>
      <head>
        {/* Meta tag aggiuntivi per SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="Ferrari, Formula 1, F1, Scuderia Ferrari, dati F1, statistiche F1" />
        <meta name="author" content="Formula Rossa" />

      </head>
      {/* `suppressHydrationWarning`: next-themes scrive la classe del tema su
          <html> prima dell'idratazione, quindi server e client differiscono
          per quell'attributo — è l'uso previsto della libreria. */}
      <body>
        <Providers>
          <Navigation />
          {children}
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
