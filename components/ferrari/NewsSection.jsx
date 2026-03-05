import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, RefreshCw, Newspaper } from 'lucide-react';

const CATEGORY_STYLES = {
  SCUDERIA: { bg: 'bg-red-600/15', border: 'border-red-500/30', text: 'text-red-400' },
  PILOTI:   { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  'F1 NEWS':{ bg: 'bg-zinc-700/40', border: 'border-zinc-500/30', text: 'text-zinc-300' },
};

export default function NewsSection() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRealNews = async () => {
    if (typeof window === 'undefined') return;
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const rssUrl = "https://it.motorsport.com/rss/f1/news/";
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`,
        { signal: controller.signal }
      );
      const data = await response.json();
      clearTimeout(timeoutId);

      if (data.status === 'ok') {
        const formattedNews = data.items.slice(0, 3).map((item, index) => {
          let category = "F1 NEWS";
          const t = item.title.toLowerCase();
          if (t.includes("ferrari")) category = "SCUDERIA";
          if (t.includes("leclerc") || t.includes("hamilton")) category = "PILOTI";

          // Estrae la prima immagine dall'enclosure o dal content
          let thumbnail = item.enclosure?.link || null;
          if (!thumbnail && item.content) {
            const match = item.content.match(/<img[^>]+src="([^">]+)"/);
            if (match) thumbnail = match[1];
          }
          if (!thumbnail && item.thumbnail) thumbnail = item.thumbnail;

          return {
            id: index,
            title: item.title,
            description: item.description.replace(/<[^>]*>?/gm, '').slice(0, 130) + "…",
            category,
            date: new Date(item.pubDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
            url: item.link,
            thumbnail,
          };
        });
        setNews(formattedNews);
      }
    } catch (error) {
      console.error("Errore rapido o timeout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealNews();
    const interval = setInterval(fetchRealNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Separatore visivo tra sezioni */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-red-600/30 to-transparent" aria-hidden="true" />

      <section
        className="py-24 px-4 bg-gradient-to-b from-[#111] via-[#1a1a1a] to-[#111] border-y border-white/5"
        aria-label="Flash News Formula 1"
      >
        <div className="max-w-6xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
          >
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-widest mb-4">
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                Live Updates
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
                Flash <span className="text-red-600">News</span>
              </h2>
              <p className="mt-2 text-zinc-500 text-sm max-w-md">
                Le ultime notizie dalla Formula 1 e dalla Scuderia Ferrari, aggiornate in tempo reale
                direttamente dal paddock.
              </p>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs border-l border-zinc-800 pl-4 font-medium italic hidden md:block">
              Ultime 3 notizie in tempo reale dal paddock di Motorsport.com
            </p>
          </motion.div>

          {isLoading && news.length === 0 ? (
            <div className="grid md:grid-cols-3 gap-6" aria-label="Caricamento notizie in corso">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-zinc-900/50 animate-pulse rounded-2xl border border-white/5" aria-hidden="true" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {news.map((item, index) => {
                  const catStyle = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES['F1 NEWS'];
                  return (
                    <motion.article
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-white/8 hover:border-red-600/40 transition-all flex flex-col overflow-hidden shadow-xl"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full h-40 overflow-hidden bg-zinc-800 shrink-0">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={`Immagine articolo: ${item.title}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => { e.currentTarget.parentElement.classList.add('thumb-fallback'); e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                            <Newspaper className="w-10 h-10 text-zinc-600" aria-hidden="true" />
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" aria-hidden="true" />
                        {/* Categoria badge sovrapposta */}
                        <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border backdrop-blur-sm ${catStyle.bg} ${catStyle.border} ${catStyle.text}`}>
                          {item.category}
                        </span>
                      </div>

                      {/* Contenuto */}
                      <div className="flex flex-col flex-grow p-5">
                        <h3 className="text-sm font-bold text-white leading-snug group-hover:text-red-400 transition-colors mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-zinc-500 text-xs leading-relaxed line-clamp-3 flex-grow">
                          {item.description}
                        </p>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                          <time className="text-zinc-600 text-[10px] font-bold uppercase" dateTime={item.date}>
                            {item.date}
                          </time>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Leggi l'articolo: ${item.title}`}
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            Leggi
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          </a>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>

              <p className="text-center text-zinc-600 text-xs max-w-2xl mx-auto">
                Aggiornamenti F1 in tempo reale: segui le ultime notizie sulla Scuderia Ferrari,
                i risultati dei Gran Premi, le dichiarazioni di Charles Leclerc e Lewis Hamilton
                e tutti gli sviluppi tecnici dalla stagione di Formula 1.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
