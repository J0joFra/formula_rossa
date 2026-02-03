import React from 'react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import PredictorSection from '../components/ferrari/PredictorSection';
import { motion } from 'framer-motion';

export default function PredictionsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-red-600 font-black text-xs uppercase tracking-[0.4em] mb-4">Interactive Experience</h1>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
              The Ferrari <span className="text-zinc-700">Oracle</span>
            </h2>
          </motion.div>

          {/* Qui inserisci il tuo componente PredictorSection completo */}
          <div className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
            <PredictorSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}