'use client';
/**
 * app/providers.jsx
 * Tema per le pagine dell'App Router.
 *
 * Il Pages Router avvolge tutto in _app.jsx; l'App Router è un albero separato
 * e non aveva niente. Senza ThemeProvider la classe `light` non veniva mai
 * applicata, quindi le pagine legali — le uniche che vivono qui — restavano
 * scure anche con il sito in tema chiaro.
 */

import { ThemeProvider } from 'next-themes';

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
