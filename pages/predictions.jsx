import React, { useState, useEffect } from 'react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import PredictorSection from '../components/ferrari/PredictorSection';
import { motion, AnimatePresence } from 'framer-motion'; 

// Lista delle immagini dei piloti
const driverImages = [
  '/data/ferrari-drivers/2025alpinepiegas01right.avif',
  '/data/ferrari-drivers/2025alpinefracol01right.avif',
  '/data/ferrari-drivers/2026astonmartinferalo01right.avif',
  '/data/ferrari-drivers/2026astonmartinlanstr02right.avif',
  '/data/ferrari-drivers/2026audigabbor01right.avif',
  '/data/ferrari-drivers/2026audinichul01right.avif',
  '/data/ferrari-drivers/2026cadillacserper01right.avif',
  '/data/ferrari-drivers/2026cadillacvalbot01right.avif',
  '/data/ferrari-drivers/2026ferrarichalec01right.avif',
  '/data/ferrari-drivers/2026ferrarilewham01right.avif',
  '/data/ferrari-drivers/2026haasf1teamestoco01right.avif',
  '/data/ferrari-drivers/2026haasf1teamolibea01right.avif',
  '/data/ferrari-drivers/2026mclarenlannor01right.avif',
  '/data/ferrari-drivers/2026mclarenoscpia01right.avif',
  '/data/ferrari-drivers/2026mercedesandant01right.avif',
  '/data/ferrari-drivers/2026mercedesgeorus01right.avif',
  '/data/ferrari-drivers/2026williamscarsai01right.avif',
  '/data/ferrari-drivers/2026williamsalealb01right.avif',
  '/data/ferrari-drivers/2026redbullracingmaxver01right.avif',
  '/data/ferrari-drivers/2026redbullracingisahad01right.avif',
  '/data/ferrari-drivers/2026racingbullslialaw01right.avif',
  '/data/ferrari-drivers/2026racingbullsarvlin01right.avif'
];

export default function PredictionsPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Cambia immagine ogni 5 secondi
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === driverImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5000ms = 5 secondi

    // Cleanup dell'intervallo quando il componente viene smontato
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* componente PredictorSection*/}
          <div className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden relative">
            
            {/* Immagini dei piloti in overlay */}
            <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0"
                >
                  <img
                    src={driverImages[currentImageIndex]}
                    alt="Ferrari Driver"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              {/* Overlay scuro per migliorare leggibilità testo */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black" />
            </div>

            {/* Contenuto (sopra le immagini) */}
            <div className="relative z-10 p-12 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                className="mb-8"
              >
                <p className="text-red-600 text-sm font-black uppercase tracking-[0.5em] mb-4">
                  Scuderia Ferrari · Predizione 2026
                </p>
                <h2 className="text-white font-black text-5xl md:text-6xl uppercase tracking-tight mb-6">
                  Race <span className="text-red-600">Predictor</span>
                </h2>
                <div className="flex flex-col items-center gap-4 max-w-3xl mx-auto">
                  <p className="text-gray-400 text-base leading-relaxed text-justify">
                    Sistema avanzato di predizione basato sull'analisi statistica dei dati storici F1DB dal 1950 al 2026. 
                    L'algoritmo utilizza una media ponderata che privilegia gli anni più recenti, combina lo storico 
                    specifico di ogni circuito con la forma attuale dei piloti, e considera fattori come trend di rendimento, 
                    percentuali di podio e vittorie, consistenza nei risultati e proiezioni per il campionato in corso.
                  </p>
                  <p className="text-gray-500 text-sm text-justify">
                    I dati vengono aggiornati automaticamente e includono confronti testa a testa tra piloti, 
                    analisi per circuito, proiezioni punti e intervalli di confidenza statistica.
                  </p>
                </div>
              </motion.div>
            </div>
            <PredictorSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}