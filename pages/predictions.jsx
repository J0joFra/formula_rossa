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
            <PredictorSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}