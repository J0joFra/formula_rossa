import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Clock, Loader2, RefreshCw } from 'lucide-react';

export default function NewsSection() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRealNews = async () => {
    setIsLoading(true);
    try {
      const rssUrl = "https://it.motorsport.com/rss/f1/news/";
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
      const data = await response.json();

      if (data.status === 'ok') {
        // Formattiamo i dati per adattarli al tuo componente
        const formattedNews = data.items.slice(0, 6).map((item, index) => {
          // Proviamo a estrarre una categoria o mettiamo "F1"
          let category = "F1 NEWS";
          if (item.title.toLowerCase().includes("ferrari")) category = "SCUDERIA";
          if (item.title.toLowerCase().includes("tecnica")) category = "TECNICA";
          if (item.title.toLowerCase().includes("mercat")) category = "MERCATO";

          return {
            id: index,
            title: item.title,
            description: item.description.replace(/<[^>]*>?/gm, '').slice(0, 120) + "...", // Rimuove tag HTML e taglia
            category: category,
            date: new Date(item.pubDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }),
            readTime: "3 min", // Stimato
            url: item.link
          };
        });
        setNews(formattedNews);
      }
    } catch (error) {
      console.error("Errore nel recupero delle notizie:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealNews();

    // Check automatico ogni 30 minuti
    const interval = setInterval(fetchRealNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-600 rounded-lg">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Global <span className="text-red-600">News</span> Feed</h2>
          </div>
          <p className="text-zinc-400 max-w-2xl mx-auto font-medium">
            Notizie reali in tempo reale dai circuiti di tutto il mondo. Aggiornamento automatico ogni 30 minuti.
          </p>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Sincronizzazione muretto box...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {news.map((item, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-zinc-900/50 rounded-2xl p-6 border border-white/5 hover:border-red-600/30 transition-all shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 rounded bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-widest">
                      {item.category}
                    </span>
                    <span className="text-zinc-600 text-[10px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.readTime}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-3 leading-tight group-hover:text-red-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-zinc-500 text-sm mb-4 line-clamp-3">
                    {item.description}
                  </p>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-zinc-600 text-xs font-mono">{item.date}</span>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-white hover:text-red-600 transition-colors"
                  >
                    Full Story <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={fetchRealNews}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-red-600 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
        </div>
      </div>
    </section>
  );
}
