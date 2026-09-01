'use client';
/**
 * components/ui/LanguageSwitcher.jsx
 * Selettore della lingua, stesso comportamento di quello dell'app GridUp:
 * un mappamondo con la bandiera corrente e un elenco che si apre sotto.
 */

import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { LANGS, useI18n } from '../../lib/i18n';

export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const fuori = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', fuori);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', fuori);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const corrente = LANGS.find((l) => l.code === lang) || LANGS[0];

  return (
    <span ref={ref} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('nav_language')}
        title={t('nav_language')}
        className="h-9 px-2.5 rounded-full inline-flex items-center gap-1.5 bg-[var(--fr-surface-2)] text-[var(--fr-text-muted)] hover:text-[var(--fr-text)] transition-colors"
      >
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm leading-none" aria-hidden="true">{corrente.flag}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('nav_language')}
          className="absolute right-0 top-full mt-2 z-50 w-44 overflow-hidden rounded-[var(--radius-md)] border border-[var(--fr-border)] bg-[var(--fr-surface)] shadow-[var(--fr-shadow)]"
        >
          {LANGS.map((l) => {
            const attiva = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={attiva}
                  onClick={() => { setLang(l.code); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left transition-colors ${
                    attiva
                      ? 'font-bold text-[var(--fr-red)] bg-[var(--fr-red-soft)]'
                      : 'text-[var(--fr-text-muted)] hover:bg-[var(--fr-surface-2)]'
                  }`}
                >
                  <span className="text-base" aria-hidden="true">{l.flag}</span>
                  {l.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </span>
  );
}
