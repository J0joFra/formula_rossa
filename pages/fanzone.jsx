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
import { useSession } from "next-auth/react";

export default function FanZonePage() {
  const { data: session } = useSession();
  const [tokens, setTokens] = useState(0);

  // Caricamento Token
  useEffect(() => {
    const saved = localStorage.getItem(`tokens_${session?.user?.email}`) || '1250';
    setTokens(parseInt(saved));
  }, [session]);

  const rewards = [
    { id: 1, name: 'Sconto 15% Store', price: 500, icon: Shirt, category: 'Merchandise' },
    { id: 2, name: 'Wallpaper SF-25 4K', price: 150, icon: Zap, category: 'Digital' },
    { id: 3, name: 'Accesso Paddock Virtuale', price: 1000, icon: Star, category: 'Experience' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation activeSection="fanzone" />
      
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        
        {/* TOP BAR: BACK TO HOME & WELCOME */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <Link href="/" className="group inline-flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-all">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Torna alla Home</span>
          </Link>

          {session && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <span className="text-[10px] font-black uppercase text-zinc-400">Status: <span className="text-green-500">Online</span></span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </motion.div>
          )}
        </div>

        {/* HEADER & BALANCE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 items-center">
          <div className="lg:col-span-2">
            {session ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-6 mb-4">
                <img src={session.user.image} className="w-16 h-16 rounded-2xl border-2 border-red-600 shadow-xl" alt="profile" />
                <div>
                  <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                    Ciao, <span className="text-red-600">{session.user.name.split(' ')[0]}</span>
                  </h1>
                  <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Maranello Gaming Division</p>
                </div>
              </motion.div>
            ) : (
              <div>
                <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-4">
                  Fan <span className="text-zinc-800 font-outline-2">Gaming</span>
                </h1>
                <p className="text-red-500 font-black uppercase text-[10px] tracking-widest bg-red-600/10 inline-block px-3 py-1 rounded">
                  Effettua il login per salvare i progressi
                </p>
              </div>
            )}
          </div>

          {/* TOKEN BALANCE CARD */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-zinc-900 to-black border border-yellow-500/30 p-8 rounded-[32px] shadow-2xl flex items-center gap-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                <Coins className="w-24 h-24 text-yellow-500" />
            </div>
            <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20 relative z-10">
              <Coins className="text-black w-8 h-8" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Bilancio Attuale</p>
              <p className="text-4xl font-black text-white tabular-nums">
                {tokens.toLocaleString()} <span className="text-xs text-yellow-500 uppercase font-mono">SFT</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* SEZIONE GIOCHI: EARN TOKENS */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-10">
            <Gamepad2 className="text-red-600 w-8 h-8" />
            <h3 className="text-3xl font-black uppercase italic tracking-tight text-white">Play & Earn</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GameCard 
                title="Pit Stop Challenge" 
                reward="50" 
                icon={Timer} 
                color="bg-red-600" 
                desc="Testa i tuoi riflessi al semaforo. Sii veloce come i meccanici al box." 
                link="/games/pitstop"
            />
            <GameCard 
                title="The Oracle" 
                reward="200" 
                icon={Trophy} 
                color="bg-zinc-800" 
                desc="Predici il podio del prossimo GP e scala la classifica mondiale dei tifosi." 
                link="/predictions"
            />
            <GameCard 
                title="F1 Trivia" 
                reward="30" 
                icon={Gift} 
                color="bg-yellow-600" 
                desc="Dimostra di conoscere ogni bullone della storia della Scuderia Ferrari." 
                link="/games/trivia"
            />
          </div>
        </section>

        {/* SEZIONE REWARDS: SPEND TOKENS */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <ShoppingBagSVG className="text-yellow-500 w-8 h-8" />
            <h3 className="text-3xl font-black uppercase italic tracking-tight text-white">Marketplace Premi</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rewards.map(reward => (
              <div key={reward.id} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[40px] hover:border-yellow-500/30 transition-all group shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:bg-yellow-500 transition-colors">
                  <reward.icon className="w-6 h-6 text-yellow-500 group-hover:text-black transition-colors" />
                </div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{reward.category}</p>
                <h4 className="text-2xl font-black uppercase italic mb-6">{reward.name}</h4>
                <button className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-lg">
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

// COMPONENTE HELPER PER LE CARD DEI GIOCHI
function GameCard({ title, reward, icon: Icon, color, desc, link }) {
  return (
    <Link href={link}>
        <div className="bg-zinc-900/20 border border-white/5 p-10 rounded-[40px] flex flex-col items-center group hover:bg-zinc-900/40 transition-all h-full cursor-pointer relative overflow-hidden">
            <div className={`w-20 h-20 ${color} rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform relative z-10`}>
                <Icon className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-2xl font-black uppercase italic mb-2 relative z-10">{title}</h4>
            <p className="text-zinc-500 text-sm mb-8 italic text-center relative z-10">{desc}</p>
            <div className="mt-auto px-6 py-2 bg-white/5 rounded-full border border-white/10 text-yellow-500 font-black text-[10px] uppercase tracking-widest relative z-10 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                Reward: {reward} SFT
            </div>
        </div>
    </Link>
  );
}

// Icona Shopping Bag manuale per evitare errori di import
function ShoppingBagSVG({ className }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    )
}
