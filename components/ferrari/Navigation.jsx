// components/ferrari/Navigation.jsx
import { useState } from 'react'; 
import Link from 'next/link';
import { useSession, signIn, signOut } from "next-auth/react";
import { Home as HomeIcon, BarChart3, Gamepad2, LogOut, Gauge, Trophy, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav
      className="bg-black/90 backdrop-blur-md border-b border-white/5 mx-auto fixed w-full top-0 z-[100]"
      aria-label="Navigazione principale"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group" aria-label="Formula Rossa - Home">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(220,0,0,0.4)] group-hover:scale-110 transition-transform overflow-hidden p-1">
                <img
                  src="/data/images/formula-rossa-logo.png"
                  alt="Formula Rossa"
                  className="w-full h-full object-contain"
                  width={36}
                  height={36}
                />
              </div>
              <span className="text-xl font-black tracking-tighter text-white uppercase italic group-hover:text-red-500 transition-colors">
                Formula <span className="text-red-600">Rossa</span>
              </span>
            </Link>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/"            icon={HomeIcon}  label="Home" />
            <NavLink href="/standings"   icon={Trophy}    label="Standings" />
            <NavLink href="/statistics"  icon={BarChart3} label="Stats" />
            <NavLink href="/fanzone"     icon={Gamepad2}  label="Fan Zone" />
            <NavLink href="/live-timing" icon={Zap}       label="Live Timing" />

            <div className="ml-6 pl-6 border-l border-white/10 flex items-center">
              {session ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-red-600 leading-none">
                      {session.user.name}
                    </p>
                    <button
                      onClick={() => signOut()}
                      className="text-[9px] text-zinc-500 uppercase hover:text-white flex items-center gap-1 ml-auto transition-colors"
                      aria-label="Logout"
                    >
                      Logout <LogOut className="w-2.5 h-2.5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="relative w-10 h-10 rounded-full border-2 border-red-600 p-0.5 overflow-hidden shadow-lg shadow-red-600/20">
                    <img
                      src={session.user.image}
                      alt={`Avatar di ${session.user.name}`}
                      className="w-full h-full rounded-full object-cover"
                      width={40}
                      height={40}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => signIn('google')}
                  className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg shadow-red-600/20"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Burger Button (Mobile) */}
          <div className="md:hidden flex items-center gap-4">
            {session && (
              <img
                src={session.user.image}
                className="w-8 h-8 rounded-full border border-red-600"
                alt={`Avatar di ${session.user.name}`}
                width={32}
                height={32}
              />
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg border border-white/5"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Chiudi menu' : 'Apri menu'}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-950 border-t border-white/5"
          >
            <div className="px-4 py-6 space-y-3">
              <MobileLink href="/"            label="Home"       onClick={() => setIsMenuOpen(false)} />
              <MobileLink href="/standings"   label="Standings"  onClick={() => setIsMenuOpen(false)} />
              <MobileLink href="/statistics"  label="Statistics" onClick={() => setIsMenuOpen(false)} />
              <MobileLink href="/fanzone"     label="Fan Zone"   onClick={() => setIsMenuOpen(false)} />
              <MobileLink href="/live-timing" label="Live Timing" onClick={() => setIsMenuOpen(false)} />

              <div className="pt-6 border-t border-white/5">
                {session ? (
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <img
                        src={session.user.image}
                        className="w-10 h-10 rounded-full border border-red-600"
                        alt={`Avatar di ${session.user.name}`}
                        width={40}
                        height={40}
                      />
                      <span className="font-bold text-sm uppercase">{session.user.name}</span>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="p-2 bg-red-600/10 text-red-500 rounded-lg"
                      aria-label="Logout"
                    >
                      <LogOut className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => signIn('google')}
                    className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em]"
                  >
                    Login with Google
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ href, label, icon: Icon }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-zinc-400 hover:text-white flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl hover:bg-white/5"
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {label}
    </Link>
  );
}

function MobileLink({ href, label, onClick }) {
  return (
    <Link
      href={href}
      className="block w-full px-4 py-3 text-zinc-400 hover:text-white hover:bg-red-600/10 rounded-xl font-black uppercase text-xs tracking-widest transition-all"
      onClick={onClick}
    >
      {label}
    </Link>
  );
}