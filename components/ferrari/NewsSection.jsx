'use client';
/**
 * components/ferrari/NewsSection.jsx
 * Flash news dal feed di Motorsport.com, in fondo alla home.
 *
 * Era rimasta allo stile precedente: fondo scuro scritto a mano
 * (`from-[#111] via-[#1a1a1a]`), titoli in corsivo, `rounded-2xl`, alias
 * legacy (`--bg-tertiary`, `--ferrari-red`) e una categoria in `text-zinc-300`
 * che sul tema chiaro spariva. Ora usa i token `--fr-*` e le stesse misure
 * delle altre sezioni della home: intestazione con occhiello, griglia di
 * schede su `--fr-surface`, bordi `--fr-border`.
 *
 * Cambia anche il comportamento: la scheda intera è il link, non solo la
 * scritta "Leggi" in fondo; e se il feed non risponde la sezione lo dice e
 * offre di riprovare, invece di lasciare tre riquadri vuoti in pagina.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, RefreshCw, Newspaper } from 'lucide-react';
import { useI18n } from '../../lib/i18n';

const RSS_URL = 'https://it.motorsport.com/rss/f1/news/';

/* Le categorie sono tre bucket ricavati dal titolo, non un campo del feed.
   Ognuna ha il suo colore preso dai token, così resta leggibile su entrambi
   i temi: prima "F1" era `text-zinc-300`, invisibile sul bianco. */
const CATEGORIE = {
  team:    { key: 'nw_catTeam',    fg: 'var(--fr-red)',  bg: 'var(--fr-red-soft)' },
  drivers: { key: 'nw_catDrivers', fg: 'var(--fr-gold)',  bg: 'color-mix(in srgb, var(--fr-gold) 16%, transparent)' },
  f1:      { key: 'nw_catF1',      fg: 'var(--fr-teal)',  bg: 'color-mix(in srgb, var(--fr-teal) 14%, transparent)' },
};

function categoria(titolo = '') {
  const t = titolo.toLowerCase();
  if (t.includes('leclerc') || t.includes('hamilton')) return 'drivers';
  if (t.includes('ferrari')) return 'team';
  return 'f1';
}

/* L'immagine sta in tre posti diversi a seconda di come il feed è stato
   generato: enclosure, un <img> dentro il contenuto, o il campo thumbnail. */
function anteprima(item) {
  if (item.enclosure?.link) return item.enclosure.link;
  const nelContenuto = item.content?.match(/<img[^>]+src="([^">]+)"/);
  if (nelContenuto) return nelContenuto[1];
  return item.thumbnail || null;
}

function Scheda({ item, index, t }) {
  const cat = CATEGORIE[item.category];
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: .45, delay: index * .08 }}
      className="group flex flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] shadow-[var(--fr-shadow-sm)] transition-all hover:-translate-y-1 hover:border-[var(--fr-border-strong)]"
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-red)] rounded-[var(--radius)]"
      >
        <div className="relative w-full aspect-[16/9] shrink-0 overflow-hidden bg-[var(--fr-surface-2)]">
          {/* Se l'immagine non carica resta il fondo del riquadro, che è già
              del colore giusto: nascondere l'img basta. */}
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <span className="w-full h-full grid place-items-center">
              <Newspaper className="w-9 h-9 text-[var(--fr-text-dim)]" aria-hidden="true" />
            </span>
          )}
          <span
            className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full backdrop-blur-sm"
            style={{ background: cat.bg, color: cat.fg }}
          >
            {t(cat.key)}
          </span>
        </div>

        <div className="flex flex-col flex-grow p-5">
          <h3 className="text-sm font-bold leading-snug text-[var(--fr-text)] group-hover:text-[var(--fr-red)] transition-colors line-clamp-2">
            {item.title}
          </h3>
          <p className="text-xs leading-relaxed text-[var(--fr-text-muted)] mt-2 line-clamp-3 flex-grow">
            {item.description}
          </p>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--fr-border)]">
            {/* `dateTime` vuole la data ISO: prima ci finiva "02 set", che non
                è un formato valido e non diceva nulla agli assistenti vocali. */}
            <time
              className="text-[11px] font-semibold uppercase tracking-wider text-[var(--fr-text-faint)]"
              dateTime={item.iso}
            >
              {item.date}
            </time>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[var(--fr-text-muted)] group-hover:text-[var(--fr-red)] transition-colors">
              {t('nw_read')}
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </a>
    </motion.article>
  );
}

export default function NewsSection() {
  const { t, lang } = useI18n();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const carica = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`,
        { signal: controller.signal },
      );
      const data = await res.json();
      if (data.status !== 'ok' || !data.items?.length) throw new Error('feed vuoto');

      setNews(data.items.slice(0, 3).map((item, i) => {
        const d = new Date(item.pubDate);
        const valida = !Number.isNaN(d.getTime());
        return {
          id: item.guid || item.link || i,
          title: item.title,
          description: `${(item.description || '').replace(/<[^>]*>?/gm, '').slice(0, 130)}…`,
          category: categoria(item.title),
          date: valida ? d.toLocaleDateString(lang, { day: '2-digit', month: 'short' }) : '',
          iso: valida ? d.toISOString() : undefined,
          url: item.link,
          thumbnail: anteprima(item),
        };
      }));
      setFailed(false);
    } catch (err) {
      // Il feed è di terze parti e cade spesso: è un caso previsto, non un bug.
      console.error('Flash news non disponibili:', err);
      setFailed(true);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    carica();
    // Mezz'ora: il feed non cambia più spesso di così.
    const timer = setInterval(carica, 30 * 60 * 1000);
    return () => clearInterval(timer);
  }, [carica]);

  return (
    <section
      className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-t border-[var(--fr-border)]"
      aria-label={t('nw_title')}
    >
      <div className="max-w-wrap mx-auto">

        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-9">
          <div>
            <span className="fr-eyebrow inline-flex items-center gap-2">
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              {t('nw_eyebrow')}
            </span>
            <h2 className="uppercase mt-3">{t('nw_title')}</h2>
            <p className="text-[var(--fr-text-muted)] mt-2.5 max-w-[56ch]">
              {t('nw_lead')}
            </p>
          </div>

          <p className="text-xs text-[var(--fr-text-faint)] shrink-0">
            {t('nw_source')}
          </p>
        </header>

        {loading && !news.length && (
          <div className="grid md:grid-cols-3 gap-5" role="status" aria-label={t('nw_loading')}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="h-72 rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] skeleton"
                aria-hidden="true"
              />
            ))}
          </div>
        )}

        {!loading && failed && !news.length && (
          <div className="rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] px-6 py-12 text-center">
            <Newspaper className="w-8 h-8 mx-auto text-[var(--fr-text-dim)]" aria-hidden="true" />
            <p className="text-sm text-[var(--fr-text-muted)] mt-3">{t('nw_empty')}</p>
            <button type="button" onClick={carica} className="btn btn-outline mt-5">
              {t('nw_retry')}
            </button>
          </div>
        )}

        {news.length > 0 && (
          <div className="grid md:grid-cols-3 gap-5">
            {news.map((item, i) => (
              <Scheda key={item.id} item={item} index={i} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
