import React, { useState, useEffect } from 'react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import PredictorSection from '../components/ferrari/PredictorSection';
import { motion, AnimatePresence } from 'framer-motion'; 

// Lista delle immagini dei piloti
const driverImages = [
  '/data/ferrari-drivers/2025alpinepiegas01right.avif',
  '/data/ferrari-drivers/2026alpinefracol01right.avif',
  '/data/ferrari-drivers/2025astonmartinferalo01right.avif',
  '/data/ferrari-drivers/2026astonmartinlanstr01right.avif',
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
    // Cambia immagine ogni 4 secondi
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === driverImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* componente PredictorSection*/}
          <div className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
            
            {/* Contenuto con immagine a fianco */}
            <div className="p-8 md:p-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                className="mb-8"
              >
                <p className="text-red-600 text-sm font-black uppercase tracking-[0.5em] mb-4 text-center">
                  Scuderia Ferrari · Predizione 2026
                </p>
                
                {/* Layout a due colonne: testo a sinistra, immagine a destra */}
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                  
                  {/* Colonna testo - sinistra */}
                  <div className="flex-1 text-center lg:text-left">
                    <h2 className="text-white font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight mb-6">
                      Race <span className="text-red-600">Predictor</span>
                    </h2>
                    
                    <div className="flex flex-col gap-4 max-w-2xl">
                      <p className="text-gray-300 text-sm md:text-base leading-relaxed text-justify lg:text-left">
                        Sistema avanzato di predizione basato sull'analisi statistica dei dati storici F1DB dal 1950 al 2026. 
                        L'algoritmo utilizza una media ponderata che privilegia gli anni più recenti, combina lo storico 
                        specifico di ogni circuito con la forma attuale dei piloti, e considera fattori come trend di rendimento, 
                        percentuali di podio e vittorie, consistenza nei risultati e proiezioni per il campionato in corso.
                      </p>
                      <p className="text-gray-400 text-xs md:text-sm text-justify lg:text-left">
                        I dati vengono aggiornati automaticamente e includono confronti testa a testa tra piloti, 
                        analisi per circuito, proiezioni punti e intervalli di confidenza statistica.
                      </p>
                    </div>
                  </div>
                  
                  {/* Colonna immagine - destra */}
                  <div className="flex-1 flex justify-center lg:justify-end">
                    <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentImageIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.8 }}
                          className="absolute inset-0"
                        >
                          <img
                            src={driverImages[currentImageIndex]}
                            alt="Ferrari Driver"
                            className="w-full h-full object-contain drop-shadow-2xl"
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
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