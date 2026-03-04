import React from 'react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import PredictorSection from '../components/ferrari/PredictorSection';
import { motion, AnimatePresence } from 'framer-motion'; 

export default function PredictionsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* componente PredictorSection*/}
          <div className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-12 text-center">
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
                  <p className="text-gray-400 text-base leading-relaxed">
                    Sistema avanzato di predizione basato sull'analisi statistica dei dati storici F1DB dal 1950 al 2026. 
                    L'algoritmo utilizza una media ponderata che privilegia gli anni più recenti, combina lo storico 
                    specifico di ogni circuito con la forma attuale dei piloti, e considera fattori come trend di rendimento, 
                    percentuali di podio e vittorie, consistenza nei risultati e proiezioni per il campionato in corso.
                  </p>
                  <p className="text-gray-500 text-sm">
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
