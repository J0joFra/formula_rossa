'use client';
/**
 * app/providers.jsx
 * Tema e lingua per le pagine dell'App Router.
 *
 * Il Pages Router avvolge tutto in _app.jsx con ThemeProvider e I18nProvider,
 * ma l'App Router è un albero separato e non li aveva. Le conseguenze si
 * vedevano sulle pagine legali, che sono le uniche che vivono lì:
 * - senza I18nProvider, `useI18n()` cadeva sul contesto di default, la cui `t`
 *   restituisce la chiave: il piè di pagina stampava "nav_archive",
 *   "ft_tagline", "ft_description" al posto delle parole;
 * - senza ThemeProvider non veniva mai applicata la classe `light`, quindi le
 *   pagine legali restavano scure anche con il sito in tema chiaro.
 */

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { I18nProvider } from '../lib/i18n';

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <I18nProvider>
        {/* Serve alla barra, che mostra "Accedi" o "Esci" secondo la sessione. */}
        <SessionProvider>{children}</SessionProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
