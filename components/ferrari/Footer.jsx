import React from 'react';
import { 
  Instagram, Twitter, Youtube, Linkedin, Heart, Mail, MessageCircle, 
  Trophy, Gauge, Users, ChevronRight, Award, ExternalLink,
  Sparkles, Zap, Shield, Terminal, Code, Database, Activity, Info
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
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          
          {/* Brand Section - 4 colonne */}
          <div className="lg:col-span-4 space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-2xl border border-dashed border-red-600/30" />
                <div className="absolute inset-1 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl shadow-2xl shadow-yellow-500/30 overflow-hidden">
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
                <p className="text-xs text-red-600/60 tracking-wider">
                  DATA INTELLIGENCE
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-6">
              <p className="text-gray-400 text-sm leading-relaxed">
                Piattaforma indipendente di data intelligence dedicata all'analisi 
                statistica e alla storia della Scuderia Ferrari in Formula 1.
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs">
                <span className="text-gray-600">{new Date().getFullYear() - 1950} anni di dati</span>
                <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                <span className="text-gray-600">100+ piloti</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3 pt-2">
              {[
                { icon: Linkedin, href: 'https://www.linkedin.com/company/formula-rossa/', label: 'LinkedIn' },
                { icon: Youtube, href: 'https://www.youtube.com/@jofrancalanci', label: 'YouTube' },
                { icon: Instagram, href: 'https://www.instagram.com/@jofrancalanci', label: 'Instagram' },
                { icon: MessageCircle, href: 'https://whatsapp.com/channel/0029Vb7EagL6WaKvnD5Slm30', label: 'WhatsApp' },
                { icon: Twitter, href: 'https://www.x.com/@jofrancalanci', label: 'Twitter' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 bg-zinc-900/80 border border-white/5 rounded-xl 
                    flex items-center justify-center hover:bg-red-600 hover:border-red-600 
                    transition-all duration-300 group"
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* ANALYTICS - 3 colonne */}
          <div className="lg:col-span-3">
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 h-full">
              <h4 className="text-sm font-black uppercase tracking-wider text-red-600 mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>ANALYTICS</span>
              </h4>
              <ul className="space-y-3">
                {[
                  { name: 'Grand Slams', href: '/stats/grand-slams', icon: Award },
                  { name: 'Archivio Stagioni', href: '/stats/seasons', icon: Trophy },
                  { name: 'Confronto Piloti', href: '/stats/drivers', icon: Users },
                  { name: 'Performance Trends', href: '/stats/trends', icon: Gauge },
                ].map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} 
                      className="group flex items-center justify-between text-sm text-gray-400 
                        hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-600/5"
                    >
                      <div className="flex items-center gap-3">
                        <link.icon className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                        <span>{link.name}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* COMMUNITY - 3 colonne (solo INFO) */}
          <div className="lg:col-span-3">
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 h-full">
              <h4 className="text-sm font-black uppercase tracking-wider text-red-600 mb-6 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>COMMUNITY</span>
              </h4>
              <ul className="space-y-3 mb-8">
                {[
                  { name: 'Fan Zone', href: '/fanzone', icon: Trophy, badge: 'NEW' },
                  { name: 'Leaderboard', href: '/standings', icon: Award, badge: 'LIVE' },
                  { name: 'Predictor', href: '/predictions', icon: Sparkles, badge: 'BETA' },
                  { name: 'Mini-Games', href: '/games', icon: Zap },
                ].map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} 
                      className="group flex items-center justify-between text-sm text-gray-400 
                        hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-600/5"
                    >
                      <div className="flex items-center gap-3">
                        <link.icon className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                        <span>{link.name}</span>
                      </div>
                      {link.badge && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-600/10 px-2 py-1 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Sezione INFO con lo stesso design delle voci sopra */}
              <h4 className="text-sm font-black uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2 border-t border-white/5 pt-6">
                <Info className="w-4 h-4" />
                <span>INFO</span>
              </h4>
              <ul className="space-y-3">
                {[
                  { name: 'Privacy', href: '/legal/privacy', icon: Shield },
                  { name: 'Cookies', href: '/legal/cookies', icon: Shield },
                  { name: 'Terms', href: '/legal/terms', icon: Shield },
                ].map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} 
                      className="group flex items-center justify-between text-sm text-gray-400 
                        hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-600/5"
                    >
                      <div className="flex items-center gap-3">
                        <link.icon className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                        <span>{link.name}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CONTACT - 2 colonne (ora più largo e non schiacciato) */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-red-600/10 to-transparent border border-red-600/20 rounded-xl p-6 h-full flex flex-col">
              <h4 className="text-sm font-black uppercase tracking-wider text-red-600 mb-6 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>CONTACT</span>
              </h4>
              
              {/* Email - più spaziosa */}
              <div className="flex-1 flex flex-col">
                <a href="mailto:info@formula-rossa.it" 
                  className="group block bg-black/30 rounded-xl p-5 border border-red-600/10 
                    hover:border-red-600/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center 
                      group-hover:bg-red-600 transition-colors duration-300">
                      <Mail className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Invia un messaggio</p>
                      <p className="text-base text-white group-hover:text-red-600 transition-colors font-mono break-all">
                        info@formula-rossa.it
                      </p>
                    </div>
                  </div>
                </a>

                {/* Tempo di risposta - più integrato */}
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-2 text-xs text-gray-600 bg-black/20 px-4 py-2 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Risposta garantita entro 24h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="relative mb-8">
          <div className="relative bg-zinc-900/50 border border-white/5 rounded-xl p-6">
            <p className="text-[10px] md:text-[11px] text-gray-500 leading-relaxed text-center">
              <span className="text-red-600 font-bold">DISCLAIMER:</span> Formula Rossa è un progetto indipendente 
              creato da appassionati e non è affiliato, sponsorizzato o approvato da Ferrari S.p.A. o Scuderia Ferrari. 
              Tutti i marchi, nomi di piloti e loghi citati appartengono ai rispettivi proprietari.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-red-600 fill-red-600" />
            <span>by</span>
            <span className="text-white hover:text-red-600 transition-colors cursor-pointer">
              Joaquim Francalanci
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>© {currentYear}</span>
            <span className="text-gray-700">|</span>
            <span className="text-red-600/60">FORMULA ROSSA</span>
            <span className="text-gray-700">|</span>
            <span>All rights reserved</span>
          </div>

          {/* Mini grafico */}
          <div className="flex gap-1">
            {[1,2,3,4,5].map((i) => (
              <div
                key={i}
                className="w-1 h-4 bg-red-600/30 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}