// components/ferrari/Navigation.jsx
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react";
import { Home as HomeIcon, BarChart3, Gamepad2, LogOut, Trophy, Zap, Info, Newspaper, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-light)] mx-auto fixed w-full top-0 z-[100]" role="navigation" aria-label="Navigazione principale">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-[#FFD700] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(220,0,0,0.4)] group-hover:scale-110 transition-transform overflow-hidden p-1">
              <img
                src="/data/images/formula-rossa-logo.png"
                alt="Formula Rossa — torna alla home"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic group-hover:text-red-500 transition-colors">
              Formula <span className="text-[var(--ferrari-red)]">Rossa</span>
            </span>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/standings"   icon={Trophy}     label="Standings"   active={pathname === '/standings'} />
            <NavLink href="/statistics"  icon={BarChart3}  label="Stats"       active={pathname === '/statistics'} />
            <NavLink href="/fanzone"     icon={Gamepad2}   label="Fan Zone"    active={pathname === '/fanzone'} />
            <NavLink href="/live-timing" icon={Zap}        label="Live Timing" active={pathname === '/live-timing'} soon />
            <NavLink href="/news"        icon={Newspaper}  label="News"        active={pathname?.startsWith('/news')} />
            <NavLink href="/about"       icon={Info}       label="Chi Siamo"   active={pathname === '/about'} />
            <div className="px-4 py-2">
              <ThemeToggle />
            </div>

            <div className="ml-6 pl-6 border-l border-[var(--border-strong)] flex items-center">
              {session ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-[var(--ferrari-red)] leading-none">{session.user.name}</p>
                    <button
                      onClick={() => signOut()}
                      className="text-[9px] text-[var(--text-tertiary)] uppercase hover:text-[var(--text-primary)] flex items-center gap-1 ml-auto transition-colors"
                    >
                      Logout <LogOut className="w-2.5 h-2.5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="relative w-10 h-10 rounded-full border-2 border-[var(--ferrari-red)] p-0.5 overflow-hidden shadow-lg shadow-[var(--ferrari-red)]/20">
                    <img src={session.user.image} alt={`Avatar di ${session.user.name}`} className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => signIn('google')}
                  className="bg-[var(--ferrari-red)] text-[var(--text-primary)] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg shadow-[var(--ferrari-red)]/20"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Burger Button (Mobile) */}
          <div className="md:hidden flex items-center gap-4">
            {session && (
              <img src={session.user.image} className="w-8 h-8 rounded-full border border-[var(--ferrari-red)]" alt={`Avatar di ${session.user.name}`} />
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Chiudi menu di navigazione' : 'Apri menu di navigazione'}
              aria-expanded={isMenuOpen}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-light)]"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {isMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--bg-secondary)] border-t border-[var(--border-light)]"
          >
            <div className="px-4 py-6 space-y-2">
              <MobileLink href="/standings"   label="Standings"   active={pathname === '/standings'}          onClick={() => setIsMenuOpen(false)} />
              <MobileLink href="/statistics"  label="Statistics"  active={pathname === '/statistics'}         onClick={() => setIsMenuOpen(false)} />
              <MobileLink href="/fanzone"     label="Fan Zone"    active={pathname === '/fanzone'}            onClick={() => setIsMenuOpen(false)} />
              <MobileLink href="/live-timing" label="Live Timing" active={pathname === '/live-timing'}        onClick={() => setIsMenuOpen(false)} soon />
              <MobileLink href="/news"        label="News"        active={pathname?.startsWith('/news')}      onClick={() => setIsMenuOpen(false)} />
              <MobileLink href="/about"       label="Chi Siamo"   active={pathname === '/about'}              onClick={() => setIsMenuOpen(false)} />
              <div className="px-4 py-2">
                <ThemeToggle />
              </div>
  
              <div className="pt-6 border-t border-[var(--border-light)]">
                {session ? (
                  <div className="flex items-center justify-between bg-[var(--bg-card)] p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <img src={session.user.image} className="w-10 h-10 rounded-full border border-[var(--ferrari-red)]" alt={`Avatar di ${session.user.name}`} />
                      <span className="font-bold text-sm uppercase">{session.user.name}</span>
                    </div>
                    <button onClick={() => signOut()} aria-label="Logout" className="p-2 bg-[var(--ferrari-red)]/10 text-red-500 rounded-lg">
                      <LogOut className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => signIn('google')}
                    className="w-full bg-[var(--ferrari-red)] text-[var(--text-primary)] py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em]"
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

function NavLink({ href, label, icon: Icon, active, soon }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`relative px-4 py-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl
        ${active ? 'text-[var(--text-primary)] bg-[var(--bg-card)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'}`}
    >
      <Icon className={`w-3.5 h-3.5 ${active ? 'text-red-500' : ''}`} aria-hidden="true" />
      {label}
      {/* PATCH 4: badge "Soon" per sezioni WIP */}
      {soon && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[var(--ferrari-red)]/20 text-[var(--ferrari-red)] border border-[var(--ferrari-red)]/30 leading-none">
          Soon
        </span>
      )}
      {active && (
        <motion.div
          layoutId="nav-active-indicator"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-red-500 rounded-full"
        />
      )}
    </Link>
  );
}

function MobileLink({ href, label, onClick, active, soon }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all
        ${active ? 'text-[var(--text-primary)] bg-[var(--ferrari-red)]/15 border border-[var(--ferrari-red)]/30' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--ferrari-red)]/10'}`}
      onClick={onClick}
    >
      <span className="flex items-center gap-2">
        {label}
        {/* PATCH 4: badge "Soon" per sezioni WIP */}
        {soon && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[var(--ferrari-red)]/20 text-[var(--ferrari-red)] border border-[var(--ferrari-red)]/30 leading-none">
            Soon
          </span>
        )}
      </span>
      {active && <div className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />}
    </Link>
  );
}
