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
            <div className="p-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                className="mb-14"
              >
                <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.5em] mb-3">
                  Scuderia Ferrari · Predizione 2026
                </p>
                <h2 className="text-white font-black text-3xl uppercase tracking-tight mb-4">
                  Race <span className="text-red-600">Predictor</span>
                </h2>
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
                    Predizioni statistiche basate su dati F1DB (1950→2026). Media ponderata per anno, storico circuito, forma recente.
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
