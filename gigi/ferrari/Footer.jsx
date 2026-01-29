import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Youtube, Facebook, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-800 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                <span className="text-xl font-black text-black">SF</span>
              </div>
            </div>
            <p className="text-zinc-400 text-sm mb-6">
              La leggenda che ha scritto la storia della Formula 1. 
              Passione, innovazione ed eccellenza dal 1947.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: 'https://instagram.com/scuderiaferrari' },
                { icon: Twitter, href: 'https://twitter.com/scuderiaferrari' },
                { icon: Youtube, href: 'https://youtube.com/scuderiaferrari' },
                { icon: Facebook, href: 'https://facebook.com/scuderiaferrari' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
