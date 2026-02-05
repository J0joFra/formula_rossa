import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Star, Shirt, Watch, Gift, 
  Coins, Zap, Gamepad2, Trophy, ArrowRight,
  Download, Ticket, User, ChevronRight
} from 'lucide-react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

const shopCategories = [
  {
    id: 1,
    name: 'Abbigliamento Team',
    description: 'Polo, t-shirt e giacche ufficiali',
    icon: Shirt,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop',
    tokenPrice: '500 Tokens',
    discount: '15% Sconto'
  },
  {
    id: 2,
    name: 'Accessori',
    description: 'Cappellini, occhiali e orologi',
    icon: Watch,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop',
    tokenPrice: '300 Tokens',
    discount: '10% Sconto'
  },
  {
    id: 3,
    name: 'Collezione Piloti',
    description: 'Merchandise Leclerc & Hamilton',
    icon: Star,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop',
    tokenPrice: '1000 Tokens',
    discount: 'Special Box'
  }
];

export default function FanZonePage() {
  const [tokens, setTokens] = useState(0);

  useEffect(() => {
    const savedTokens = localStorage.getItem('sf_tokens') || '1250';
    setTokens(parseInt(savedTokens));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        
        {/* HEADER & TOKEN BALANCE */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-red-600 font-black text-xs uppercase tracking-[0.5em] mb-4">Maranello Social Club</h1>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
              Fan <span className="text-zinc-800">Zone</span>
            </h2>
          </motion.div>

          {/* TOKEN CARD */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-zinc-900 to-black border border-yellow-500/30 p-6 rounded-[32px] shadow-2xl flex items-center gap-6 min-w-[300px] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform">
                <Coins className="w-20 h-20 text-yellow-500" />
            </div>
            <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Coins className="text-black w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Your Balance</p>
              <p className="text-4xl font-black text-white tabular-nums tracking-tighter">
                {tokens.toLocaleString()} <span className="text-xs text-yellow-500 uppercase">SFT</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* SECTION 1: EARN TOKENS (GIOCHI) */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-10">
            <Gamepad2 className="text-red-600 w-8 h-8" />
            <h3 className="text-3xl font-black uppercase italic tracking-tight">Earn Tokens</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GameCard 
              title="Pit Stop Challenge"
              desc="Testa i tuoi riflessi al semaforo. Sii veloce come i meccanici al box."
              reward="+50 SFT"
              icon={Zap}
              link="/games/pitstop"
            />
            <GameCard 
              title="The Oracle"
              desc="Predici il podio del prossimo GP e scala la classifica mondiale."
              reward="+250 SFT"
              icon={Trophy}
              link="/predictions"
            />
            <GameCard 
              title="Daily Trivia"
              desc="Una domanda al giorno sulla storia Ferrari. Non sbagliare!"
              reward="+20 SFT"
              icon={Gift}
              link="/games/trivia"
            />
          </div>
        </section>

        {/* SECTION 2: SPEND TOKENS (THE SHOP) */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <ShoppingBag className="text-yellow-500 w-8 h-8" />
            <h3 className="text-3xl font-black uppercase italic tracking-tight">Rewards Marketplace</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shopCategories.map((cat) => (
              <motion.div 
                key={cat.id}
                whileHover={{ y: -10 }}
                className="bg-zinc-900/40 border border-white/5 rounded-[40px] overflow-hidden group shadow-2xl flex flex-col"
              >
                <div className="h-48 relative overflow-hidden">
                    <img src={cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                    <div className="absolute top-4 left-4 bg-yellow-500 text-black font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-widest">
                        {cat.discount}
                    </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                    <cat.icon className="w-8 h-8 text-red-600 mb-4" />
                    <h4 className="text-xl font-black uppercase italic mb-2">{cat.name}</h4>
                    <p className="text-zinc-500 text-sm mb-6 flex-1">{cat.description}</p>
                    
                    <button className="w-full bg-zinc-800 hover:bg-red-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest border border-white/5">
                        Riscatta per {cat.tokenPrice} <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* DIGITAL REWARDS BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-20 bg-gradient-to-r from-red-700 to-red-900 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl"
        >
            <div className="text-center md:text-left">
                <h3 className="text-3xl font-black uppercase italic mb-2">Contenuti Digitali</h3>
                <p className="text-red-100 opacity-80 max-w-md italic">Sblocca wallpaper esclusivi 4K della SF-25 e il Badge "Legendary Tifoso" per il tuo profilo.</p>
            </div>
            <div className="flex gap-4">
                <div className="flex flex-col items-center p-4 bg-black/20 rounded-2xl border border-white/10">
                    <Download className="w-6 h-6 text-white mb-2" />
                    <span className="text-[9px] font-black uppercase">Wallpapers</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-black/20 rounded-2xl border border-white/10">
                    <Ticket className="w-6 h-6 text-white mb-2" />
                    <span className="text-[9px] font-black uppercase">Digital Card</span>
                </div>
            </div>
        </motion.div>

      </main>

      <Footer />
    </div>
  );
}

// COMPONENTE HELPER PER LE CARD DEI GIOCHI
function GameCard({ title, desc, reward, icon: Icon, link }) {
  return (
    <Link href={link}>
      <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-[40px] h-full flex flex-col justify-between hover:border-red-600/40 transition-all group cursor-pointer shadow-xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon className="w-32 h-32 text-white" />
        </div>
        <div>
          <div className="w-12 h-12 rounded-xl bg-red-600/10 flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
            <Icon className="text-red-600 w-6 h-6 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-2xl font-black uppercase italic text-white mb-3 tracking-tighter">{title}</h3>
          <p className="text-zinc-500 text-sm leading-relaxed mb-6 italic">{desc}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            {reward}
          </span>
          <div className="flex items-center gap-1 text-red-600 font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Play Now <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}