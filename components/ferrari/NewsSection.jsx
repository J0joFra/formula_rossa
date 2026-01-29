import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Clock, Loader2, RefreshCw, TrendingUp } from 'lucide-react';

const mockNews = [
  {
    id: 1,
    title: "Hamilton e Leclerc: La nuova coppia Ferrari pronta a dominare",
    description: "Lewis Hamilton e Charles Leclerc iniziano il loro primo test insieme a Maranello. L'integrazione del sette volte campione del mondo procede meglio del previsto.",
    category: "team",
    date: "15 GEN 2025",
    readTime: "3 min",
    image: "https://images.unsplash.com/photo-1629740004997-14e4027b92d4?w=400&h=250&fit=crop"
  },
  {
    id: 2,
    title: "SF-25: Rivoluzione aerodinamica per battere Red Bull",
    description: "Il nuovo concept della Ferrari presenta un'ala anteriore completamente ridisegnata e soluzioni innovative per la gestione dei flussi d'aria.",
    category: "tecnica",
    date: "12 GEN 2025",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=250&fit=crop"
  },
  {
    id: 3,
    title: "Leclerc: 'Con Lewis possiamo vincere tutto'",
    description: "Il monegasco si mostra entusiasta della nuova partnership: 'È un sogno che diventa realtà lavorare con un campione come Lewis'.",
    category: "piloti",
    date: "10 GEN 2025",
    readTime: "2 min",
    image: "https://images.unsplash.com/photo-1514315384763-ba401779410f?w-400&h=250&fit=crop"
  },
  {
    id: 4,
    title: "Ferrari svela la livrea 2025: Rosso più scuro e dettagli oro",
    description: "La nuova colorazione presenta un rosso corsa più intenso con dettagli in oro 24k per celebrare la partnership Hamilton.",
    category: "team",
    date: "08 GEN 2025",
    readTime: "3 min",
    image: "https://images.unsplash.com/photo-1551830820-330a71b99659?w=400&h=250&fit=crop"
  },
  {
    id: 5,
    title: "Rumor: Ferrari sviluppa sistema DRS innovativo",
    description: "Fonti interne parlano di un sistema Drag Reduction System che potrebbe dare 0.3 secondi per giro di vantaggio.",
    category: "rumors",
    date: "05 GEN 2025",
    readTime: "3 min",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=250&fit=crop"
  },
  {
    id: 6,
    title: "Confronto simulatori: Ferrari vs Red Bull",
    description: "I primi dati dei simulatori mostrano una Ferrari competitiva su tutti i tipi di tracciato, con particolare forza nei circuiti veloci.",
    category: "tecnica",
    date: "03 GEN 2025",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=250&fit=crop"
  },
];

export default function NewsSection() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setNews(mockNews);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setNews([...mockNews].sort(() => Math.random() - 0.5));
      setIsLoading(false);
    }, 800);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Newspaper className="w-8 h-8 text-ferrari-red" />
            <h2 className="text-4xl font-bold text-white">Ultime News Ferrari</h2>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Tutte le notizie, aggiornamenti e approfondimenti sulla Scuderia Ferrari
          </p>
        </motion.div>

        {/* Loading/Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-ferrari-red animate-spin mb-4" />
            <p className="text-gray-400">Caricamento news...</p>
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
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all hover:transform hover:-translate-y-1"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.category === 'tecnica' ? 'bg-blue-500/20 text-blue-400' :
                        item.category === 'piloti' ? 'bg-green-500/20 text-green-400' :
                        item.category === 'team' ? 'bg-ferrari-red/20 text-ferrari-red' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {item.category.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.readTime}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-400 mb-4 line-clamp-3">{item.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">{item.date}</span>
                      <button className="text-ferrari-red hover:text-red-400 text-sm font-medium flex items-center gap-1 group">
                        Leggi 
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Refresh Button */}
            <div className="text-center">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 hover:bg-gray-800/50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Aggiorna News
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
