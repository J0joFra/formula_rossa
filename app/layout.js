// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Formula Rossa - Data Intelligence Ferrari F1',
  description: 'Piattaforma indipendente di data intelligence sulla Scuderia Ferrari in Formula 1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
