import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, RefreshCw } from 'lucide-react';

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

          return {
            id: index,
            title: item.title,
            description: item.description.replace(/<[^>]*>?/gm, '').slice(0, 120) + "…",
            category,
            date: new Date(item.pubDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
            url: item.link,
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
    <section
      className="py-24 px-4 bg-gradient-to-b from-[#1a1a1a] via-[#333333] to-[#1a1a1a] border-y border-white/5"
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
              direttamente dal paddock. Risultati, aggiornamenti tecnici e dichiarazioni dei piloti.
            </p>
          </div>
          <p className="text-zinc-500 text-sm max-w-xs border-l border-zinc-800 pl-4 font-medium italic hidden md:block">
            Ultime 3 notizie in tempo reale dal paddock di Motorsport.com
          </p>
        </motion.div>

        {isLoading && news.length === 0 ? (
          <div className="grid md:grid-cols-3 gap-6" aria-label="Caricamento notizie in corso">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-48 bg-zinc-900/50 animate-pulse rounded-2xl border border-white/5"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {news.map((item, index) => (
                <motion.article
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-red-600/50 transition-all flex flex-col justify-between h-full shadow-2xl"
                >
                  <div>
                    <span className="text-red-600 text-[9px] font-black uppercase tracking-[0.2em] mb-3 block">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight group-hover:text-red-500 transition-colors mb-3">
                      {item.title}
                    </h3>
                    {/* Descrizione — aumenta page text content */}
                    <p className="text-zinc-500 text-xs leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <time
                      className="text-zinc-600 text-[10px] font-bold uppercase"
                      dateTime={item.date}
                    >
                      {item.date}
                    </time>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Leggi l'articolo: ${item.title}`}
                      className="p-2 rounded-full bg-zinc-800 text-white group-hover:bg-red-600 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Testo SEO extra — aumenta page text content */}
            <p className="text-center text-zinc-600 text-xs max-w-2xl mx-auto">
              Aggiornamenti F1 in tempo reale: segui le ultime notizie sulla Scuderia Ferrari, 
              i risultati dei Gran Premi, le dichiarazioni di Charles Leclerc e Lewis Hamilton 
              e tutti gli sviluppi tecnici dalla stagione di Formula 1.
            </p>
          </>
        )}
      </div>
    </section>
  );
}