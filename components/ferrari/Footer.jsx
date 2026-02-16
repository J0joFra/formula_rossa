import React from 'react';
import { motion } from 'framer-motion';
import { 
  Instagram, Twitter, Youtube, Linkedin, Heart, Mail, MessageCircle, 
  ExternalLink, Trophy, Gauge, Users, ChevronRight, Award, Clock,
  Sparkles, Zap, Shield, Terminal, Code, Database, Activity
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-black via-zinc-900 to-black border-t border-red-600/20 overflow-hidden">
      {/* Sfondo dinamico */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
        
        {/* Griglia telemetrica */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(to right, #DC0000 1px, transparent 1px), linear-gradient(to bottom, #DC0000 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Badge in alto */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-3 bg-red-600/10 backdrop-blur-sm border border-red-600/20 rounded-full px-6 py-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-ping absolute"></div>
              <div className="w-2 h-2 rounded-full bg-red-600 relative"></div>
            </div>
            <span className="text-xs font-mono text-red-600/80">
              &lt;SYSTEM_STATUS: ONLINE /&gt;
            </span>
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-red-600/40 rounded-full"></div>
              <div className="w-1 h-6 bg-red-600 rounded-full"></div>
              <div className="w-1 h-4 bg-red-600/40 rounded-full"></div>
            </div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          
          {/* Brand Section - Colonna larga */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Logo con effetto 3D */}
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="relative w-16 h-16" style={{ perspective: 1000 }}>
                <motion.div
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-2xl border border-dashed border-red-600/30"
                />
                <div className="absolute inset-1 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl shadow-2xl shadow-yellow-500/30 overflow-hidden transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <div className="absolute inset-0 bg-black/10" />
                  <img 
                    src="/data/images/formula-rossa-logo.png" 
                    alt="Formula Rossa" 
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="text-2xl font-black text-black">FR</span>';
                    }}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tighter">
                  FORMULA<span className="text-red-600">ROSSA</span>
                </h3>
                <p className="text-[10px] font-mono text-red-600/60 tracking-[0.3em]">
                  DATA INTELLIGENCE UNIT
                </p>
              </div>
            </div>

            {/* Terminal-like description */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <Terminal className="w-4 h-4 text-red-600" />
                <span className="text-gray-400">$</span>
                <span className="text-green-400">./initialize --passion=f1</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pl-6 border-l border-red-600/20">
                Piattaforma indipendente di data intelligence dedicata all'analisi 
                statistica e alla storia della Scuderia Ferrari in Formula 1.
                <span className="block mt-2 text-red-600/60 text-xs">
                  ⚡ {new Date().getFullYear() - 1950} anni di dati • 100+ piloti • ∞ passione
                </span>
              </p>
            </div>

            {/* Live stats mini */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-green-400" />
                <span className="text-gray-500 font-mono">API STATUS:</span>
                <span className="text-green-400 font-mono">ONLINE</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-3 h-3 text-blue-400" />
                <span className="text-gray-500 font-mono">DB:</span>
                <span className="text-blue-400 font-mono">SYNC</span>
              </div>
            </div>

            {/* Social links con effetto */}
            <div className="flex gap-3 pt-4">
              {[
                { icon: Linkedin, href: 'https://www.linkedin.com/company/formula-rossa/', label: 'LinkedIn', color: 'hover:bg-blue-600' },
                { icon: Youtube, href: 'https://www.youtube.com/@jofrancalanci', label: 'YouTube', color: 'hover:bg-red-600' },
                { icon: Instagram, href: 'https://www.instagram.com/@jofrancalanci', label: 'Instagram', color: 'hover:bg-pink-600' },
                { icon: MessageCircle, href: 'https://whatsapp.com/channel/0029Vb7EagL6WaKvnD5Slm30', label: 'WhatsApp', color: 'hover:bg-green-600' },
                { icon: Twitter, href: 'https://www.x.com/@jofrancalanci', label: 'Twitter', color: 'hover:bg-sky-600' },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-10 h-10 bg-zinc-900/80 backdrop-blur-sm border border-white/5 
                    rounded-xl flex items-center justify-center transition-all duration-300 
                    group hover:border-red-600/50 ${social.color}`}
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links - Colonna media */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/5 rounded-xl p-6 h-full">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-red-600 mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>ANALYTICS HUB</span>
              </h4>
              <ul className="space-y-3">
                {[
                  { name: 'GRAND SLAMS DATABASE', href: '/stats/grand-slams', icon: Award, data: '24 records' },
                  { name: 'SEASON ARCHIVE', href: '/stats/seasons', icon: Clock, data: '75 seasons' },
                  { name: 'DRIVER COMPARISON', href: '/stats/drivers', icon: Users, data: '100+ pilots' },
                  { name: 'PERFORMANCE TRENDS', href: '/stats/trends', icon: Gauge, data: 'live' },
                ].map((link, j) => (
                  <motion.li 
                    key={j}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link href={link.href} 
                      className="group flex items-center justify-between text-sm text-gray-400 
                        hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-600/5"
                    >
                      <div className="flex items-center gap-3">
                        <link.icon className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                        <span className="font-mono text-xs">{link.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-gray-600">{link.data}</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Community & Legal - Colonna media */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/5 rounded-xl p-6 h-full">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-red-600 mb-6 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>COMMUNITY</span>
              </h4>
              <ul className="space-y-3 mb-8">
                {[
                  { name: 'FAN ZONE', href: '/fanzone', icon: Trophy, badge: 'NEW' },
                  { name: 'LEADERBOARD', href: '/standings', icon: Award, badge: 'LIVE' },
                  { name: 'PREDICTOR', href: '/predictions', icon: Sparkles, badge: 'BETA' },
                  { name: 'CONTACT', href: '/contact', icon: Mail },
                ].map((link, j) => (
                  <motion.li key={j} whileHover={{ x: 5 }}>
                    <Link href={link.href} 
                      className="group flex items-center justify-between text-sm text-gray-400 
                        hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-600/5"
                    >
                      <div className="flex items-center gap-3">
                        <link.icon className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                        <span className="font-mono text-xs">{link.name}</span>
                      </div>
                      {link.badge && (
                        <span className="text-[8px] font-black text-red-600 bg-red-600/10 px-2 py-1 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-gray-600 mb-6 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>LEGAL</span>
              </h4>
              <ul className="space-y-2">
                {[
                  { name: 'PRIVACY', href: '/legal/privacy' },
                  { name: 'COOKIES', href: '/legal/cookies' },
                  { name: 'TERMS', href: '/legal/terms' },
                ].map((link, j) => (
                  <li key={j}>
                    <Link href={link.hhref} 
                      className="text-[10px] font-mono text-gray-600 hover:text-red-600 
                        transition-colors tracking-wider"
                    >
                      &gt; {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Contact Mini - Colonna piccola */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-red-600/10 to-transparent border border-red-600/20 rounded-xl p-6 h-full">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-red-600 mb-4">
                CONTACT
              </h4>
              <a href="mailto:info@formula-rossa.it" 
                className="block group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center 
                    group-hover:bg-red-600 transition-colors duration-300">
                    <Mail className="w-5 h-5 text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-mono">/send/message</p>
                    <p className="text-sm font-mono text-white group-hover:text-red-600 transition-colors">
                      info@formula-rossa.it
                    </p>
                  </div>
                </div>
              </a>
              <div className="text-[8px] font-mono text-gray-700 text-center">
                [ response_time: &lt; 24h ]
              </div>
            </div>
          </motion.div>
        </div>

        {/* Disclaimer con effetto terminal */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600/5 to-transparent" />
          <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Terminal className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-[9px] md:text-[10px] font-mono text-gray-500 leading-relaxed">
                  <span className="text-red-600">/* DISCLAIMER */</span> {' '}
                  FORMULA ROSSA È UN PROGETTO INDIPENDENTE CREATO DA APPASSIONATI E NON È AFFILIATO, 
                  SPONSORIZZATO O APPROVATO DA FERRARI S.P.A. O SCUDERIA FERRARI. TUTTI I MARCHI, 
                  NOMI DI PILOTI E LOGHI CITATI APPARTENGONO AI RISPETTIVI PROPRIETARI E SONO UTILIZZATI 
                  ESCLUSIVAMENTE A SCOPO INFORMATIVO E DIVULGATIVO.
                </p>
                <p className="text-[8px] font-mono text-gray-800 mt-2">
                  &gt;&gt; This is a fan-made project. All trademarks are property of their respective owners.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Copyright con effetto dinamico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 
            border-t border-white/5"
        >
          <div className="flex items-center gap-2 text-xs font-mono">
            <Code className="w-3 h-3 text-gray-600" />
            <span className="text-gray-500">Built with</span>
            <Heart className="w-3 h-3 text-red-600 fill-red-600" />
            <span className="text-gray-500">by</span>
            <span className="text-white hover:text-red-600 transition-colors cursor-pointer">
              Joaquim Francalanci
            </span>
            <span className="text-gray-700">//</span>
            <span className="text-gray-600">v2.0.1</span>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="text-gray-600">&copy; {currentYear}</span>
            <span className="text-gray-700">|</span>
            <span className="text-red-600/60">FORMULA ROSSA</span>
            <span className="text-gray-700">|</span>
            <span className="text-gray-600">ALL RIGHTS RESERVED</span>
          </div>

          {/* Mini telemetry */}
          <div className="flex gap-1">
            {[1,2,3,4,5].map((i) => (
              <motion.div
                key={i}
                animate={{ height: [4, 8, 12, 8, 4] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                className="w-1 bg-red-600/30 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}