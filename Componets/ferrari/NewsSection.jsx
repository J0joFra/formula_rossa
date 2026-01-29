import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Clock, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";

const mockNews = [
  {
    id: 1,
    title: "Hamilton e Leclerc: La nuova coppia Ferrari pronta a dominare",
    description: "Lewis Hamilton e Charles Leclerc iniziano il loro primo test insieme a Maranello. L'integrazione del sette volte campione del mondo procede meglio del previsto.",
    category: "team",
    date: "15 GEN 2025",
    readTime: "3 min",
  },
  {
    id: 2,
    title: "SF-25: Rivoluzione aerodinamica per battere Red Bull",
    description: "Il nuovo concept della Ferrari presenta un'ala anteriore completamente ridisegnata e soluzioni innovative per la gestione dei flussi d'aria.",
    category: "tecnica",
    date: "12 GEN 2025",
    readTime: "4 min",
  },
  {
    id: 3,
    title: "Leclerc: 'Con Lewis possiamo vincere tutto'",
    description: "Il monegasco si mostra entusiasta della nuova partnership: 'È un sogno che diventa realtà lavorare con un campione come Lewis'.",
    category: "piloti",
    date: "10 GEN 2025",
    readTime: "2 min",
  },
  {
    id: 4,
    title: "Ferrari svela la livrea 2025: Rosso più scuro e dettagli oro",
    description: "La nuova colorazione presenta un rosso corsa più intenso con dettagli in oro 24k per celebrare la partnership Hamilton.",
    category: "team",
    date: "08 GEN 2025",
    readTime: "3 min",
  },
  {
    id: 5,
    title: "Rumor: Ferrari sviluppa sistema DRS innovativo",
    description: "Fonti interne parlano di un sistema Drag Reduction System che potrebbe dare 0.3 secondi per giro di vantaggio.",
    category: "rumors",
    date: "05 GEN 2025",
    readTime: "3 min",
  },
  {
    id: 6,
    title: "Confronto simulatori: Ferrari vs Red Bull",
    description: "I primi dati dei simulatori mostrano una Ferrari competitiva su tutti i tipi di tracciato, con particolare forza nei circuiti veloci.",
    category: "tecnica",
    date: "03 GEN 2025",
    readTime: "4 min",
  },
];

export default function NewsSection() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simula caricamento dati
    setIsLoading(true);
    setTimeout(() => {
      setNews(mockNews);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Potresti mescolare o cambiare le notizie
      setNews([...mockNews].sort(() => Math.random() - 0.5));
      setIsLoading(false);
    }, 800);
  };

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
            <Newspaper className="w-8 h-8 text-red-500" />
            <h2 className="text-4xl font-bold">Ultime News Ferrari</h2>
          </div>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Tutte le notizie, aggiornamenti e approfondimenti sulla Scuderia Ferrari
          </p>
        </motion.div>

        {/* Loading/Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
            <p className="text-zinc-400">Caricamento news...</p>
          </div>
        ) : (
          <>
            {/* News Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {news.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-zinc-900 rounded-xl p-6 hover:bg-zinc-800 transition-all border border-zinc-800"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.category === 'tecnica' ? 'bg-blue-500/20 text-blue-400' :
                      item.category === 'piloti' ? 'bg-green-500/20 text-green-400' :
                      item.category === 'team' ? 'bg-red-500/20 text-red-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {item.category.toUpperCase()}
                    </span>
                    <span className="text-zinc-500 text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.readTime}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-zinc-400 mb-4">{item.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-sm">{item.date}</span>
                    <button className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1">
                      Leggi <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Refresh Button */}
            <div className="text-center">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Aggiorna News
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
