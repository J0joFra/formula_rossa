'use client';
/**
 * components/ferrari/SocialSection.jsx
 * I profili Instagram e TikTok di Formula Rossa, con i contenuti incorporati.
 *
 * Gli embed di TikTok e Instagram caricano script e cookie dei rispettivi
 * server: per questo partono solo se il visitatore ha accettato i cookie nel
 * banner, oppure se lo chiede qui con un clic. Prima di allora al loro posto
 * c'è un riquadro che spiega cosa succede cliccando.
 *
 * Profili, post e video da mostrare stanno in lib/social.js.
 */

import { useEffect, useState } from 'react';
import { Instagram, ArrowUpRight, Play } from 'lucide-react';
import TikTokIcon from '../ui/TikTokIcon';
import {
  SOCIAL_FANZONE, TIKTOK, INSTAGRAM_POSTS, TIKTOK_VIDEOS,
} from '../../lib/social';

const ICONE = { instagram: Instagram, tiktok: TikTokIcon };

/** Consenso dato nel banner dei cookie (components/CookieConsent.jsx). */
function useConsenso() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const leggi = () => {
      try { setOk(localStorage.getItem('cookieConsent') === 'accepted'); } catch { /* storage bloccato */ }
    };
    leggi();
    window.addEventListener('cookie-consent-change', leggi);
    return () => window.removeEventListener('cookie-consent-change', leggi);
  }, []);
  return ok;
}

/**
 * Carica (o ricarica) lo script di un embed. TikTok legge i blockquote solo
 * quando lo script parte, quindi va rimesso in pagina ogni volta; Instagram
 * invece espone una funzione per rielaborare i nuovi post.
 */
function caricaScript(id, src) {
  document.getElementById(id)?.remove();
  const s = document.createElement('script');
  s.id = id;
  s.src = src;
  s.async = true;
  document.body.appendChild(s);
}

const videoId = (url) => url.match(/video\/(\d+)/)?.[1];

function Embed() {
  useEffect(() => {
    caricaScript('tiktok-embed-js', 'https://www.tiktok.com/embed.js');
    if (INSTAGRAM_POSTS.length) {
      if (window.instgrm) window.instgrm.Embeds.process();
      else caricaScript('instagram-embed-js', 'https://www.instagram.com/embed.js');
    }
  }, []);

  return (
    <div className="grid gap-5">
      {/* Il profilo TikTok con gli ultimi video: l'embed "creator" ufficiale. */}
      <div className="rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] p-3 overflow-hidden">
        <blockquote
          className="tiktok-embed"
          cite={TIKTOK.url}
          data-unique-id={TIKTOK.user}
          data-embed-type="creator"
          style={{ maxWidth: '780px', minWidth: '288px', margin: '0 auto' }}
        >
          <section>
            <a target="_blank" rel="noopener noreferrer" href={`${TIKTOK.url}?refer=creator_embed`}>
              {TIKTOK.handle}
            </a>
          </section>
        </blockquote>
      </div>

      {(TIKTOK_VIDEOS.length > 0 || INSTAGRAM_POSTS.length > 0) && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {TIKTOK_VIDEOS.map((url) => (
            <blockquote
              key={url}
              className="tiktok-embed"
              cite={url}
              data-video-id={videoId(url)}
              style={{ maxWidth: '605px', minWidth: '288px', margin: 0 }}
            >
              <section />
            </blockquote>
          ))}
          {INSTAGRAM_POSTS.map((url) => (
            <blockquote
              key={url}
              className="instagram-media"
              data-instgrm-permalink={url}
              data-instgrm-version="14"
              style={{ maxWidth: '540px', minWidth: '288px', width: '100%', margin: 0 }}
            >
              <a href={url} target="_blank" rel="noopener noreferrer">Vedi questo post su Instagram</a>
            </blockquote>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SocialSection() {
  const consenso = useConsenso();
  const [chiesto, setChiesto] = useState(false);
  const mostra = consenso || chiesto;

  return (
    <div className="grid gap-5">
      <div className="grid md:grid-cols-2 gap-5">
        {SOCIAL_FANZONE.map((s) => {
          const Icona = ICONE[s.id];
          return (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-6 rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] hover:border-[var(--fr-red)]/40 hover:-translate-y-0.5 transition-all"
            >
              <span className="w-12 h-12 shrink-0 rounded-[14px] grid place-items-center bg-[var(--fr-red-soft)] text-[var(--fr-red)]">
                <Icona className="w-6 h-6" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-head text-lg font-black uppercase text-[var(--fr-text)]">
                  {s.name} <span className="text-[var(--fr-text-faint)] normal-case font-semibold text-sm">{s.handle}</span>
                </span>
                <span className="block text-sm text-[var(--fr-text-muted)] mt-0.5">{s.desc}</span>
              </span>
              {/* Il wrapper nasconde il bottone su mobile: `.btn` imposta già il
                  suo display e vincerebbe su `hidden`. Lì è la scheda intera
                  a fare da link. */}
              <span className="hidden sm:block shrink-0">
                <span className="btn btn-outline">
                  Segui <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </span>
              <ArrowUpRight className="w-5 h-5 shrink-0 sm:hidden text-[var(--fr-text-faint)]" aria-hidden="true" />
            </a>
          );
        })}
      </div>

      {mostra ? (
        <Embed />
      ) : (
        <div className="rounded-[var(--radius)] border border-dashed border-[var(--fr-border-strong)] bg-[var(--fr-surface)] px-6 py-10 text-center">
          <TikTokIcon className="w-8 h-8 mx-auto text-[var(--fr-text-dim)]" aria-hidden="true" />
          <p className="text-sm text-[var(--fr-text-muted)] mt-3 max-w-[52ch] mx-auto">
            Gli ultimi video arrivano direttamente da TikTok, che usa i suoi cookie.
            Si caricano solo se lo chiedi tu.
          </p>
          <button type="button" onClick={() => setChiesto(true)} className="btn btn-primary mt-5">
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            Mostra i video
          </button>
        </div>
      )}
    </div>
  );
}
