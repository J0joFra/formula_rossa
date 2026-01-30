// components/ferrari/Navigation.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo a sinistra */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FR</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                FORMULA ROSSA
              </span>
            </Link>
          </div>

          {/* Menu desktop a destra */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition flex items-center"
            >
              <span className="mr-2">🏠</span>
              Home
            </Link>
            
            <Link 
              href="/standings" 
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:opacity-90 transition flex items-center"
            >
              <span className="mr-2">📊</span>
              F1 Standings
            </Link>
            
            {/* Se hai altre pagine, aggiungile qui */}
            {/* <Link href="/predictions" className="px-4 py-2 ...">🎯 Predictions</Link> */}
            {/* <Link href="/stats" className="px-4 py-2 ...">📈 Statistics</Link> */}
          </div>

          {/* Menu mobile (burger) */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile aperto */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 Home
              </Link>
              <Link
                href="/standings"
                className="block px-3 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                📊 F1 Standings
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
