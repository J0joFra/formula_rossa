import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Trophy, Flag, Star } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black pt-20">
      {/* Sfondo animato */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ferrari-red/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ferrari-yellow/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Logo Ferrari */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <div className="inline-flex items-center justify-center w-40 h-40 bg-gradient-to-br from-ferrari-yellow to-yellow-600 rounded-3xl shadow-2xl shadow-yellow-500/30 mb-8">
            <span className="text-7xl font-black text-black">SF</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-6">
            <span className="bg-gradient-to-r from-white via-ferrari-red to-ferrari-yellow bg-clip-text text-transparent">
              SCUDERIA<br />FERRARI
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
            La leggenda che ha scritto la storia della Formula 1
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Trophy, value: '16', label: 'Titoli Costruttori', color: 'from-ferrari-red to-red-700' },
            { icon: Flag, value: '15', label: 'Titoli Piloti', color: 'from-ferrari-yellow to-yellow-600' },
            { icon: Star, value: '245+', label: 'Vittorie GP', color: 'from-ferrari-red to-red-700' },
            { icon: ChevronDown, value: '75+', label: 'Anni di Storia', color: 'from-ferrari-yellow to-yellow-600' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:bg-gray-900 transition-all"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-16"
        >
          <div className="text-gray-400 text-sm mb-2">Scopri di più</div>
          <ChevronDown className="w-6 h-6 text-ferrari-red mx-auto" />
        </motion.div>
      </div>
    </section>
  );
}