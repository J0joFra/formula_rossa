'use client';
/**
 * components/CookieConsent.jsx
 * Banner di consenso cookie (GDPR) con Google Consent Mode v2.
 * Gli script di Google Analytics e AdSense partono con consenso "denied"
 * (impostato in pages/_app.jsx) e vengono abilitati solo dopo la scelta
 * esplicita dell'utente. La preferenza è salvata in localStorage.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'cookieConsent'; // 'accepted' | 'rejected'

function applyConsent(granted) {
  if (typeof window === 'undefined') return;
  const value = granted ? 'granted' : 'denied';
  // Google Consent Mode v2
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      ad_storage: value,
      analytics_storage: value,
      ad_user_data: value,
      ad_personalization: value,
    });
  } else {
    // Fallback: spingi direttamente nel dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(['consent', 'update', {
      ad_storage: value,
      analytics_storage: value,
      ad_user_data: value,
      ad_personalization: value,
    }]);
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    if (!stored) setVisible(true);

    // Permette di riaprire il banner da qualsiasi punto del sito
    const open = () => setVisible(true);
    window.addEventListener('open-cookie-settings', open);
    window.openCookieSettings = open;
    return () => {
      window.removeEventListener('open-cookie-settings', open);
      if (window.openCookieSettings === open) delete window.openCookieSettings;
    };
  }, []);

  const decide = (granted) => {
    try { localStorage.setItem(STORAGE_KEY, granted ? 'accepted' : 'rejected'); } catch (e) { /* ignore */ }
    applyConsent(granted);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Preferenze cookie"
      className="fixed inset-x-0 bottom-0 z-[200] px-3 pb-3 sm:px-4 sm:pb-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-md shadow-2xl shadow-black/50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-10 h-10 rounded-xl bg-red-600/15 flex items-center justify-center">
            <Cookie className="w-5 h-5 text-red-500" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Rispettiamo la tua privacy
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-400">
              Usiamo cookie tecnici necessari e, con il tuo consenso, cookie analitici
              (Google Analytics) e pubblicitari (Google AdSense) per capire come viene usato il
              sito e sostenere il progetto. Puoi accettare, rifiutare o cambiare idea in qualsiasi
              momento. Dettagli nella{' '}
              <Link href="/legal/cookies" className="text-red-500 hover:underline">Cookie Policy</Link>.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => decide(true)}
                className="order-1 sm:order-2 inline-flex items-center justify-center bg-red-600 text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
              >
                Accetta tutti
              </button>
              <button
                type="button"
                onClick={() => decide(false)}
                className="order-2 sm:order-1 inline-flex items-center justify-center bg-transparent text-gray-300 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border border-white/15 hover:border-white/40 hover:text-white transition-colors"
              >
                Rifiuta non essenziali
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => decide(false)}
            aria-label="Chiudi e rifiuta i cookie non essenziali"
            className="shrink-0 p-1.5 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
