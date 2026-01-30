import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-red-600">
              FORMULA ROSSA
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Link alla Home */}
            <Link 
              href="/" 
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition"
            >
              Home
            </Link>
            
            {/* NUOVO: Link alla pagina Standings */}
            <Link 
              href="/standings" 
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:opacity-90 transition flex items-center"
            >
              <span className="mr-2">📊</span>
              F1 Standings
            </Link>
            
            {/* Altri link se esistono */}
            {/* <Link href="/predictions" className="px-4 py-2 ...">Predictions</Link> */}
          </div>
        </div>
      </div>
    </nav>
  );
}
