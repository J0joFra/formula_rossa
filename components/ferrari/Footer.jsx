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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 mb-12 lg:mb-16">
          
          {/* Brand Section - 4 colonne */}
          <div className="lg:col-span-4 space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 lg:w-16 lg:h-16 flex-shrink-0">
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
              <div className="min-w-0">
                <h3 className="text-xl lg:text-2xl font-black text-white tracking-tighter truncate">
                  FORMULA<span className="text-red-600">ROSSA</span>
                </h3>
                <p className="text-[10px] lg:text-xs text-red-600/60 tracking-wider">
                  DATA INTELLIGENCE
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-5 lg:p-6">
              <p className="text-gray-400 text-xs lg:text-sm leading-relaxed">
                Piattaforma indipendente di data intelligence dedicata all'analisi 
                statistica e alla storia della Scuderia Ferrari in Formula 1.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] lg:text-xs">
                <span className="text-gray-600">{currentYear - 1950} anni di dati</span>
                <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                <span className="text-gray-600">100+ piloti</span>
                <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                <span className="text-gray-600">1000+ gare</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex flex-wrap gap-2 lg:gap-3 pt-2">
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
                  className="w-9 h-9 lg:w-10 lg:h-10 bg-zinc-900/80 border border-white/5 rounded-xl 
                    flex items-center justify-center hover:bg-red-600 hover:border-red-600 
                    transition-all duration-300 group"
                >
                  <social.icon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* ANALYTICS - 3 colonne */}
          <div className="lg:col-span-3">
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-5 lg:p-6 h-full">
              <h4 className="text-xs lg:text-sm font-black uppercase tracking-wider text-red-600 mb-4 lg:mb-6 flex items-center gap-2">
                <Zap className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>ANALYTICS</span>
              </h4>
              <ul className="space-y-2 lg:space-y-3">
                {[
                  { name: 'Grand Slams', href: '/stats/grand-slams', icon: Award },
                  { name: 'Archivio Stagioni', href: '/statistics/', icon: Trophy },
                  { name: 'Confronto Piloti', href: '/stats/standings', icon: Gauge },
                  { name: 'Community', href: '/stats/fanzone', icon: Users },
                ].map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} 
                      className="group flex items-center justify-between text-xs lg:text-sm text-gray-400 
                        hover:text-red-600 transition-colors p-1.5 lg:p-2 rounded-lg hover:bg-red-600/5"
                    >
                      <div className="flex items-center gap-2 lg:gap-3">
                        <link.icon className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600 group-hover:text-red-600 flex-shrink-0" />
                        <span className="truncate">{link.name}</span>
                      </div>
                      <ChevronRight className="w-2.5 h-2.5 lg:w-3 lg:h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* INFO & LEGAL - 2 colonne */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-5 lg:p-6 h-full">
              <h4 className="text-xs lg:text-sm font-black uppercase tracking-wider text-gray-500 mb-4 lg:mb-6 flex items-center gap-2">
                <Info className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>INFO</span>
              </h4>
              <ul className="space-y-2 lg:space-y-3">
                {[
                  { name: 'Chi Siamo', href: '/about', icon: Users },
                  { name: 'Contatti', href: '/contact', icon: Mail },
                  { name: 'FAQ', href: '/faq', icon: Activity },
                ].map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} 
                      className="group flex items-center justify-between text-xs lg:text-sm text-gray-400 
                        hover:text-red-600 transition-colors p-1.5 lg:p-2 rounded-lg hover:bg-red-600/5"
                    >
                      <div className="flex items-center gap-2 lg:gap-3">
                        <link.icon className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600 group-hover:text-red-600 flex-shrink-0" />
                        <span className="truncate">{link.name}</span>
                      </div>
                      <ChevronRight className="w-2.5 h-2.5 lg:w-3 lg:h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* LEGAL - 3 colonne */}
          <div className="lg:col-span-3">
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-5 lg:p-6 h-full">
              <h4 className="text-xs lg:text-sm font-black uppercase tracking-wider text-gray-500 mb-4 lg:mb-6 flex items-center gap-2">
                <Shield className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>LEGAL</span>
              </h4>
              <ul className="space-y-2 lg:space-y-3">
                {[
                  { name: 'Privacy Policy', href: '/legal/privacy', icon: Shield },
                  { name: 'Cookie Policy', href: '/legal/cookies', icon: Shield },
                  { name: 'Termini e Condizioni', href: '/legal/terms', icon: Shield },
                ].map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} 
                      className="group flex items-center justify-between text-xs lg:text-sm text-gray-400 
                        hover:text-red-600 transition-colors p-1.5 lg:p-2 rounded-lg hover:bg-red-600/5"
                    >
                      <div className="flex items-center gap-2 lg:gap-3">
                        <link.icon className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600 group-hover:text-red-600 flex-shrink-0" />
                        <span className="truncate">{link.name}</span>
                      </div>
                      <ChevronRight className="w-2.5 h-2.5 lg:w-3 lg:h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="relative mb-6 lg:mb-8">
          <div className="relative bg-zinc-900/50 border border-white/5 rounded-xl p-4 lg:p-6">
            <p className="text-[10px] md:text-[11px] text-gray-500 leading-relaxed text-center">
              <span className="text-red-600 font-bold">DISCLAIMER:</span> Formula Rossa è un progetto indipendente 
              creato da appassionati e non è affiliato, sponsorizzato o approvato da Ferrari S.p.A. o Scuderia Ferrari. 
              Tutti i marchi, nomi di piloti e loghi citati appartengono ai rispettivi proprietari.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 lg:pt-8 border-t border-white/5">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[10px] lg:text-xs text-gray-500">
            <span>Made with</span>
            <Heart className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-red-600 fill-red-600" />
            <span>by</span>
            <a 
              href="https://github.com/J0joFra" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-red-600 transition-colors cursor-pointer"
            >
              Joaquim Francalanci
            </a>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-4 text-[10px] lg:text-xs text-gray-600">
            <span>© {currentYear}</span>
            <span className="text-gray-700 hidden sm:inline">|</span>
            <span className="text-red-600/60">FORMULA ROSSA</span>
            <span className="text-gray-700 hidden sm:inline">|</span>
            <span>All rights reserved</span>
          </div>

          {/* Mini grafico */}
          <div className="flex gap-1">
            {[1,2,3,4,5].map((i) => (
              <div
                key={i}
                className="w-0.5 h-3 lg:w-1 lg:h-4 bg-red-600/30 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}