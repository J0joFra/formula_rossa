'use client'; 

import React from 'react';
import { 
  Instagram, Twitter, Youtube, Linkedin, Heart, Mail, MessageCircle, 
  Trophy, Gauge, Users, ChevronRight, Award, ExternalLink,
  Sparkles, Zap, Shield, Terminal, Code, Database, Activity, Info
} from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-[var(--bg-primary)] via-zinc-900 to-black border-t border-[var(--ferrari-red)]/20 overflow-hidden">
      
      {/* Sfondo dinamico — inline styles rimossi, ora classi Tailwind */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--ferrari-red)]/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--ferrari-yellow)]/5 rounded-full blur-3xl" />
        {/* Griglia telemetrica — unico inline style rimasto: pattern SVG non esprimibile in Tailwind */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(to right,#DC0000 1px,transparent 1px),linear-gradient(to bottom,#DC0000 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 mb-12 lg:mb-16">

          {/* ── Brand Section ── */}
          <div className="lg:col-span-4 space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 lg:w-16 lg:h-16 flex-shrink-0">
                <div className="absolute inset-0 rounded-2xl border border-dashed border-[var(--ferrari-red)]/30" aria-hidden="true" />
                <div className="absolute inset-1 bg-gradient-to-br from-[var(--ferrari-yellow)] to-orange-500 rounded-xl shadow-2xl shadow-[var(--ferrari-yellow)]/30 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[var(--bg-primary)]/10" aria-hidden="true" />
                  {/* FIX: era <imgage> (typo) → ora <img> corretto con alt */}
                  <img
                    src="/data/images/formula-rossa-logo.png"
                    alt="Formula Rossa logo"
                    className="relative z-10 w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.insertAdjacentHTML(
                        'beforeend',
                        '<span class="relative z-10 text-2xl font-black text-black">FR</span>'
                      );
                    }}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-xl lg:text-2xl font-black text-[var(--text-primary)] tracking-tighter truncate">
                  FORMULA<span className="text-[var(--ferrari-red)]">ROSSA</span>
                </h3>
                <p className="text-[10px] lg:text-xs text-[var(--ferrari-red)]/60 tracking-wider">DATA INTELLIGENCE</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[var(--bg-tertiary)]/50 backdrop-blur-sm border border-[var(--border-light)] rounded-xl p-5 lg:p-6">
              <p className="text-[var(--text-secondary)] text-xs lg:text-sm leading-relaxed">
                Piattaforma indipendente di data intelligence dedicata all'analisi 
                statistica e alla storia della Scuderia Ferrari in Formula 1.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] lg:text-xs">
                <span className="text-[var(--text-tertiary)]">{currentYear - 1950} anni di dati</span>
                <span className="w-1 h-1 rounded-full bg-gray-700" aria-hidden="true" />
                <span className="text-[var(--text-tertiary)]">100+ piloti</span>
                <span className="w-1 h-1 rounded-full bg-gray-700" aria-hidden="true" />
                <span className="text-[var(--text-tertiary)]">1000+ gare</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex flex-wrap gap-2 lg:gap-3 pt-2">
              {[
                { icon: Linkedin,       href: 'https://www.linkedin.com/company/formula-rossa/', label: 'Formula Rossa su LinkedIn' },
                { icon: Youtube,        href: 'https://www.youtube.com/@jofrancalanci',           label: 'Formula Rossa su YouTube' },
                { icon: Instagram,      href: 'https://www.instagram.com/formularossa.it',        label: 'Formula Rossa su Instagram' },
                { icon: MessageCircle,  href: 'https://whatsapp.com/channel/0029Vb7EagL6WaKvnD5Slm30', label: 'Formula Rossa su WhatsApp' },
                { icon: Twitter,        href: 'https://www.x.com/jofrancalanci',                  label: 'Formula Rossa su X (Twitter)' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="w-9 h-9 lg:w-10 lg:h-10 bg-[var(--bg-tertiary)]/80 border border-[var(--border-light)] rounded-xl 
                    flex items-center justify-center hover:bg-[var(--ferrari-red)] hover:border-[var(--ferrari-red)] 
                    transition-all duration-300 group"
                >
                  <social.icon className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Analytics ── */}
          <div className="lg:col-span-3">
            <div className="bg-[var(--bg-tertiary)]/30 border border-[var(--border-light)] rounded-xl p-5 lg:p-6 h-full">
              <h4 className="text-xs lg:text-sm font-black uppercase tracking-wider text-[var(--ferrari-red)] mb-4 lg:mb-6 flex items-center gap-2">
                <Zap className="w-3 h-3 lg:w-4 lg:h-4" aria-hidden="true" />
                ANALYTICS
              </h4>
              <ul className="space-y-2 lg:space-y-3">
                {[
                  { name: 'Vittorie',          href: '/stats/wins',   icon: Award  },
                  { name: 'Archivio Stagioni', href: '/statistics',   icon: Trophy },
                  { name: 'Confronto Piloti',  href: '/standings',    icon: Gauge  },
                  { name: 'Community',         href: '/fanzone',      icon: Users  },
                ].map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between text-xs lg:text-sm text-[var(--text-secondary)] 
                        hover:text-[var(--ferrari-red)] transition-colors p-1.5 lg:p-2 rounded-lg hover:bg-[var(--ferrari-red)]/5"
                    >
                      <div className="flex items-center gap-2 lg:gap-3">
                        <link.icon className="w-3 h-3 lg:w-4 lg:h-4 text-[var(--text-tertiary)] group-hover:text-[var(--ferrari-red)] flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">{link.name}</span>
                      </div>
                      <ChevronRight className="w-2.5 h-2.5 lg:w-3 lg:h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Info ── */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--bg-tertiary)]/30 border border-[var(--border-light)] rounded-xl p-5 lg:p-6 h-full">
              <h4 className="text-xs lg:text-sm font-black uppercase tracking-wider text-[var(--ferrari-yellow)] mb-4 lg:mb-6 flex items-center gap-2">
                <Info className="w-3 h-3 lg:w-4 lg:h-4" aria-hidden="true" />
                INFO
              </h4>
              <ul className="space-y-2 lg:space-y-3">
                {[
                  { name: 'Chi Siamo', href: '/about',   icon: Users    },
                  { name: 'Contatti',  href: '/contact', icon: Mail     },
                  { name: 'FAQ',       href: '/faq',     icon: Activity },
                ].map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between text-xs lg:text-sm text-[var(--text-secondary)] 
                        hover:text-[var(--ferrari-red)] transition-colors p-1.5 lg:p-2 rounded-lg hover:bg-[var(--ferrari-red)]/5"
                    >
                      <div className="flex items-center gap-2 lg:gap-3">
                        <link.icon className="w-3 h-3 lg:w-4 lg:h-4 text-[var(--text-tertiary)] group-hover:text-[var(--ferrari-red)] flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">{link.name}</span>
                      </div>
                      <ChevronRight className="w-2.5 h-2.5 lg:w-3 lg:h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Legal ── */}
          <div className="lg:col-span-3">
            <div className="bg-[var(--bg-tertiary)]/30 border border-[var(--border-light)] rounded-xl p-5 lg:p-6 h-full">
              <h4 className="text-xs lg:text-sm font-black uppercase tracking-wider text-[var(--text-tertiary)] mb-4 lg:mb-6 flex items-center gap-2">
                <Shield className="w-3 h-3 lg:w-4 lg:h-4" aria-hidden="true" />
                LEGAL
              </h4>
              <ul className="space-y-2 lg:space-y-3">
                {[
                  { name: 'Privacy Policy',       href: '/legal/privacy', icon: Shield },
                  { name: 'Cookie Policy',         href: '/legal/cookies', icon: Shield },
                  { name: 'Termini e Condizioni',  href: '/legal/terms',   icon: Shield },
                ].map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between text-xs lg:text-sm text-[var(--text-secondary)] 
                        hover:text-[var(--ferrari-red)] transition-colors p-1.5 lg:p-2 rounded-lg hover:bg-[var(--ferrari-red)]/5"
                    >
                      <div className="flex items-center gap-2 lg:gap-3">
                        <link.icon className="w-3 h-3 lg:w-4 lg:h-4 text-[var(--text-tertiary)] group-hover:text-[var(--ferrari-red)] flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">{link.name}</span>
                      </div>
                      <ChevronRight className="w-2.5 h-2.5 lg:w-3 lg:h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-[var(--bg-tertiary)]/50 border border-[var(--border-light)] rounded-xl p-4 lg:p-6">
            <p className="text-[10px] md:text-[11px] text-[var(--text-tertiary)] leading-relaxed text-center">
              <span className="text-[var(--ferrari-red)] font-bold">DISCLAIMER:</span> Formula Rossa è un progetto indipendente 
              creato da appassionati e non è affiliato, sponsorizzato o approvato da Ferrari S.p.A. o Scuderia Ferrari. 
              Tutti i marchi, nomi di piloti e loghi citati appartengono ai rispettivi proprietari.
            </p>
          </div>
        </div>

        {/* SEO text — visibile ai crawler, non invasivo visivamente */}
        <p className="sr-only">
          Formula Rossa è la piattaforma italiana dedicata alle statistiche e all'analisi dati della Scuderia Ferrari 
          in Formula 1. Esplora oltre {new Date().getFullYear() - 1950} anni di storia Ferrari, confronta i piloti, 
          consulta l'archivio stagioni e scopri i dati tecnici delle monoposto dal 1950 ad oggi.
        </p>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 lg:pt-8 border-t border-[var(--border-light)]">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[10px] lg:text-xs text-[var(--text-tertiary)]">
            <span>Made with</span>
            <Heart className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-[var(--ferrari-red)] fill-red-600" aria-hidden="true" />
            <span>by</span>
            <a
              href="https://github.com/J0joFra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-primary)] hover:text-[var(--ferrari-red)] transition-colors"
            >
              Joaquim Francalanci
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-4 text-[10px] lg:text-xs text-[var(--text-tertiary)]">
            <span>© {currentYear}</span>
            <span className="text-[var(--text-muted)] hidden sm:inline" aria-hidden="true">|</span>
            <span className="text-[var(--ferrari-red)]/60">FORMULA ROSSA</span>
            <span className="text-[var(--text-muted)] hidden sm:inline" aria-hidden="true">|</span>
            <span>All rights reserved</span>
          </div>

          {/* Mini grafico decorativo */}
          <div className="flex gap-1" aria-hidden="true">
            {[1,2,3,4,5].map((i) => (
              <div
                key={i}
                className="w-0.5 h-3 lg:w-1 lg:h-4 bg-[var(--ferrari-red)]/30 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}