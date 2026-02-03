import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Clock, ExternalLink, Twitter } from 'lucide-react';

const CAROUSEL_SPEED = 8000; // 8 sec
const REFRESH_DATA_INTERVAL = 30 * 60 * 1000; // 30 min

export default function NewsSection() {
  const [tweetIds, setTweetIds] = useState([
    "1886008691515220265", // Ferrari Tweet 1
    "1886000000000000000", // F1 Tweet 1
    "1885950000000000000", // Ferrari Tweet 2
    "1885900000000000000", // F1 Tweet 2
    "1885850000000000000", // Ferrari Tweet 3
    "1885800000000000000", // F1 Tweet 3
  ]);

  const [skyNews, setSkyNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingSky, setIsLoadingSky] = useState(true);

  // 1. Caricamento Script Twitter
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
        const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
        if (existingScript) document.body.removeChild(existingScript);
    };
  }, []);

  // 2. Forza il ricaricamento del widget quando cambia l'indice
  useEffect(() => {
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    }
  }, [currentIndex]);

  // 3. Fetch Sky News
  const fetchSkyNews = async () => {
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://sport.sky.it/rss/formula1.xml`);
      const data = await res.json();
      if (data.status === 'ok') setSkyNews(data.items.slice(0, 3));
    } catch (e) { console.error(e); }
    setIsLoadingSky(false);
  };

  // Check aggiornamenti ogni 30 minuti (simulazione fetch nuovi ID)
  useEffect(() => {
    fetchSkyNews();
    const interval = setInterval(() => {
      fetchSkyNews();
      // Qui aggiungeresti la logica per recuperare i nuovi Tweet ID dall'API di X
      console.log("Check aggiornamenti ogni 30 min...");
    }, REFRESH_DATA_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Timer Carosello
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tweetIds.length);
    }, CAROUSEL_SPEED);
    return () => clearInterval(timer);
  }, [tweetIds]);

  return (
    <section className="py-24 px-4 bg-black relative">
      <div className="max-w-6xl mx-auto">
        
        {/* CAROSELLO TWEET DINAMICO */}
        <div className="mb-24 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-8">
            <Twitter className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">Live from X.com</h2>
          </div>

          <div className="w-full max-w-[550px] min-h-[500px] flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                {/* Il blockquote originale che si aggiorna con l'ID */}
                <blockquote 
                  className="twitter-tweet" 
                  data-theme="dark" 
                  data-align="center"
                  data-conversation="none"
                >
                  <a href={`https://twitter.com/x/status/${tweetIds[currentIndex]}`}></a>
                </blockquote>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicatori carosello */}
          <div className="flex gap-2 mt-4">
            {tweetIds.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-red-600' : 'w-2 bg-zinc-800'}`} 
              />
            ))}
          </div>
        </div>

        {/* SKY NEWS SECTION (FISSA SOTTO) */}
        <div>
          <div className="flex items-center gap-3 mb-10">
            <Newspaper className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              Sky Sport <span className="text-zinc-600 font-bold">Latest</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {isLoadingSky ? (
              [1, 2, 3].map(i => <div key={i} className="h-64 bg-zinc-900 animate-pulse rounded-2xl" />)
            ) : (
              skyNews.map((article, index) => (
                <motion.a
                  key={index}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-zinc-900/40 border border-white/5 p-6 rounded-2xl hover:bg-zinc-800 transition-all flex flex-col justify-between"
                  whileHover={{ y: -5 }}
                >
                  <div>
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4 block">F1 News</span>
                    <h3 className="text-lg font-bold text-white leading-tight group-hover:text-red-500 transition-colors">
                      {article.title}
                    </h3>
                  </div>
                  <div className="mt-8 flex items-center justify-between text-zinc-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">Sky Sport</span>
                    </div>
                    <ExternalLink className="w-4 h-4 group-hover:text-white transition-colors" />
                  </div>
                </motion.a>
              ))
            )}
          </div>
        </div>

      </div>
    </section>
  );
}