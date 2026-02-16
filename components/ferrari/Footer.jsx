import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Youtube, Linkedin, Heart, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & Mission */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-ferrari-red rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
                <span className="text-xl font-black text-white">FR</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Formula Rossa</h3>
                <p className="text-xs text-ferrari-red font-bold uppercase tracking-widest">Data & Passion</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              La piattaforma digitale dedicata all'analisi dei dati e alla storia della Scuderia Ferrari. 
              Built by fans, powered by data.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Linkedin, href: 'https://www.linkedin.com/company/formula-rossa/', label: 'LinkedIn' },
                { icon: Youtube, href: 'https://www.youtube.com/@jofrancalanci', label: 'YouTube' },
                { icon: Instagram, href: 'https://www.instagram.com/@jofrancalanci', label: 'Instagram' }, 
                { icon: MessageCircle, href: 'https://whatsapp.com/channel/0029Vb7EagL6WaKvnD5Slm30', label: 'WhatsApp'},
                { icon: Twitter, href: 'https://www.x.com/@jofrancalanci', label: 'Twitter' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-900 hover:bg-ferrari-red rounded-lg flex items-center justify-center transition-all duration-300 group"
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Esplora Dati */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Analisi & Dati</h4>
            <ul className="space-y-3">
              {[
                { name: 'Grand Slams', href: '/stats/grand-slams' },
                { name: 'Archivio Stagioni', href: '/stats/seasons' },
                { name: 'Confronto Piloti', href: '/stats/drivers' },
                { name: 'Performance Trends', href: '/stats/trends' },
              ].map((link, j) => (
                <li key={j}>
                  <Link href={link.href} className="text-gray-400 hover:text-ferrari-red text-sm transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Community</h4>
            <ul className="space-y-3">
              {[
                { name: 'Mini-Games', href: '/fanzone' },
                { name: 'Leaderboard', href: '/standings' },
                { name: 'Sfide Interattive', href: '/fanzone' },
                { name: 'Contatti', href: '/contact' },
              ].map((link, j) => (
                <li key={j}>
                  <Link href={link.href} className="text-gray-400 hover:text-ferrari-red text-sm transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legale & Info */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Info & Legale</h4>
            <ul className="space-y-3">
              {[
                { name: 'Chi Siamo', href: '/about' },
                { name: 'Privacy Policy', href: '/legal/privacy' },
                { name: 'Cookie Policy', href: '/legal/cookies' },
                { name: 'Termini di Servizio', href: '/legal/terms' },
              ].map((link, j) => (
                <li key={j}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <a href="mailto:info@formula-rossa.it" className="text-ferrari-red text-sm flex items-center gap-2 hover:underline">
                  <Mail className="w-4 h-4" /> info@formula-rossa.it
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer - Fondamentale per AdSense */}
        <div className="py-6 border-t border-gray-900">
          <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-tighter text-center max-w-4xl mx-auto">
            DISCLAIMER: Formula Rossa è un progetto indipendente creato da appassionati e non è affiliato, sponsorizzato o approvato da Ferrari S.p.A. o Scuderia Ferrari. 
            Tutti i marchi, nomi di piloti e loghi citati appartengono ai rispettivi proprietari e sono utilizzati esclusivamente a scopo informativo e divulgativo.
          </p>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-900 text-center">
          <p className="text-gray-500 text-xs flex items-center justify-center gap-2">
            Made with <Heart className="w-3 h-3 text-ferrari-red fill-ferrari-red" /> by Joaquim Francalanci
            <span className="mx-2 text-gray-800">•</span>
            © {currentYear} Formula Rossa. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
}