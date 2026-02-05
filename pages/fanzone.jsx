import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Coins, 
  Trophy, 
  Star, 
  Shirt, 
  Watch, 
  Gift, 
  ArrowRight, 
  Zap, 
  ChevronLeft, 
  Timer 
} from 'lucide-react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

export default function FanZonePage() {
  const [tokens, setTokens] = useState(0);

  useEffect(() => {
    // Simulazione recupero token da localStorage
    const saved = localStorage.getItem('sf_tokens') || '1500';
    setTokens(parseInt(saved));
  }, []);

  const rewards = [
    { id: 1, name: 'Sconto 15% Store', price: 500, icon: Shirt, category: 'Merchandise' },
    { id: 2, name: 'Wallpaper SF-25 4K', price: 150, icon: Zap, category: 'Digital' },
    { id: 3, name: 'Accesso Paddock Virtuale', price: 1000, icon: Star, category: 'Experience' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation activeSection="fanzone" />
      
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <Link href="/" className="group inline-flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-all mb-12">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Torna alla Home</span>
        </Link>

        {/* Header & Token Balance */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-8">
          <div>
            <h1 className="text-red-600 font-black text-xs uppercase tracking-[0.6em] mb-4">Maranello Experience</h1>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
              Fan <span className="text-zinc-800 font-outline-2">Gaming</span>
            </h2>
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-yellow-500/30 p-6 rounded-3xl shadow-2xl flex items-center gap-6 min-w-[280px]"
          >
            <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Coins className="text-black w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Il tuo Bilancio</p>
              <p className="text-4xl font-black text-white">{tokens.toLocaleString()} <span className="text-xs text-yellow-500 uppercase font-mono">SFT</span></p>
            </div>
          </motion.div>
        </div>

        {/* Sezione Giochi */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-10">
            <Gamepad2 className="text-red-600 w-8 h-8" />
            <h3 className="text-3xl font-black uppercase italic tracking-tight text-white">Play & Earn</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <GameCard title="Pit Stop Challenge" reward="50" icon={Timer} color="bg-red-600" desc="Testa i tuoi riflessi al cambio gomme." />
            <GameCard title="The Oracle" reward="200" icon={Trophy} color="bg-zinc-800" desc="Indovina il podio del prossimo GP." />
            <GameCard title="F1 Trivia" reward="30" icon={Gift} color="bg-yellow-600" desc="Quanto conosci la storia del Cavallino?" />
          </div>
        </section>

        {/* Sezione Rewards */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <Trophy className="text-yellow-500 w-8 h-8" />
            <h3 className="text-3xl font-black uppercase italic tracking-tight text-white">Marketplace Premi</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rewards.map(reward => (
              <div key={reward.id} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[40px] hover:border-yellow-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:bg-yellow-500 transition-colors">
                  <reward.icon className="w-6 h-6 text-yellow-500 group-hover:text-black transition-colors" />
                </div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{reward.category}</p>
                <h4 className="text-2xl font-black uppercase italic mb-6">{reward.name}</h4>
                <button className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                  Riscatta per {reward.price} SFT
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function GameCard({ title, reward, icon: Icon, color, desc }) {
  return (
    <div className="bg-zinc-900/20 border border-white/5 p-10 rounded-[40px] flex flex-col items-center group hover:bg-zinc-900/40 transition-all">
      <div className={`w-20 h-20 ${color} rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform`}>
        <Icon className="w-10 h-10 text-white" />
      </div>
      <h4 className="text-2xl font-black uppercase italic mb-2">{title}</h4>
      <p className="text-zinc-500 text-sm mb-8 italic">{desc}</p>
      <div className="mt-auto px-6 py-2 bg-white/5 rounded-full border border-white/10 text-yellow-500 font-bold text-xs">
        PREMIO: {reward} SFT
      </div>
    </div>
  );
}