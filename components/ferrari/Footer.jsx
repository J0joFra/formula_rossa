import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Youtube, Facebook, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-ferrari-yellow to-yellow-500 rounded-xl flex items-center justify-center">
                <span className="text-xl font-black text-black">SF</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Scuderia Ferrari</h3>
                <p className="text-sm text-gray-400">Formula 1 Team</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              La leggenda che ha scritto la storia della Formula 1. 
              Passione, innovazione ed eccellenza dal 1947.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: 'https://instagram.com/scuderiaferrari' },
                { icon: Twitter, href: 'https://twitter.com/scuderiaferrari' },
                { icon: Youtube, href: 'https://youtube.com/scuderiaferrari' },
                { icon: Linkedin, href: 'https://www.linkedin.com/joaquim-francalanci/' },
                { icon: Facebook, href: 'https://facebook.com/scuderiaferrari' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-900 hover:bg-ferrari-red rounded-lg flex items-center justify-center transition-colors"
                >
                  <social.icon className="w-5 h-5 text-gray-300 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Il Team', links: ['Piloti', 'Storia', 'Tecnologia', 'Trofei'] },
            { title: 'Fan Zone', links: ['Shop', 'Eventi', 'Community', 'Contatti'] },
            { title: 'Risorse', links: ['Media', 'Sponsor', 'Lavora con noi', 'Privacy'] },
          ].map((column, i) => (
            <div key={i}>
              <h4 className="text-lg font-bold text-white mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-gray-400 hover:text-ferrari-red transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-ferrari-red fill-ferrari-red" /> by Ferrari Fans
            <span className="mx-2">•</span>
            © 2024 Scuderia Ferrari. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}