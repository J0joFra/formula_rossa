import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Trophy, Flag, Star } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black">
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold text-white mb-6"
        >
          Scuderia Ferrari
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-xl text-zinc-300 mb-8"
        >
          Formula 1 Fan Experience
        </motion.p>

        <ChevronDown className="mx-auto text-red-600 animate-bounce" size={32} />
      </div>
    </section>
  );
}
