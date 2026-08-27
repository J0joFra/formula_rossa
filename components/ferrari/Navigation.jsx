// components/ferrari/Navigation.jsx
// Navigazione a 3 pilastri: Dati · Live · Gioca (+ app GridUp).
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  BarChart3, Zap, Gamepad2, Info, LogOut, Smartphone,
  ChevronDown, Menu, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export const GRIDUP_URL = 'https://gridup-f1.web.app';

/* I tre pilastri del sito. Tutto ciò che è raggiungibile vive qui dentro:
   niente più pagine orfane non linkate dal menu. */
const PILLARS = [
  {
    id: 'dati',
    label: 'Dati',
    icon: BarChart3,
    items: [
      { href: '/statistics', label: 'Statistiche',  desc: 'Archivio storico e record' },
      { href: '/standings',  label: 'Classifiche',  desc: 'Piloti e costruttori' },
      { href: '/piloti',     label: 'Piloti',       desc: 'Schede e carriere' },
      { href: '/circuiti',   label: 'Circuiti',     desc: 'Tracciati e statistiche' },
      { href: '/races',      label: 'Gare',         desc: 'Calendario e risultati' },
    ],
  },
  {
    id: 'live',
    label: 'Live',
    icon: Zap,
    items: [
      { href: '/live-timing', label: 'Live Timing', desc: 'Tempi in tempo reale' },
      { href: '/news',        label: 'News',        desc: 'Ultime dal mondo F1' },
    ],
  },
  {
    id: 'gioca',
    label: 'Gioca',
    icon: Gamepad2,
    items: [
      { href: '/fanzone',            label: 'Fan Zone',    desc: 'Tutti i mini-giochi' },
      { href: '/games/trivia',       label: 'F1 Trivia',   desc: 'Quiz sulla Rossa' },
      { href: '/games/pitstop',      label: 'Pit Stop',    desc: 'Sfida di riflessi' },
      { href: '/games/circuit-rush', label: 'Circuit Rush', desc: 'Corsa a ostacoli' },
    ],
  },
];

export default function Navigation() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const navRef = useRef(null);

  // Chiude i menu quando cambia pagina
  useEffect(() => { setOpenMenu(null); setMobileOpen(false); }, [pathname]);

  // Chiude con Esc o cliccando fuori
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setOpenMenu(null); setMobileOpen(false); } };
    const onClick = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const isPillarActive = (p) => p.items.some(i => pathname === i.href || pathname?.startsWith(i.href + '/'));

  return (
    <nav
      ref={navRef}
      className="fixed top-0 w-full z-[100] bg-[var(--fr-bg)]/85 backdrop-blur-xl border-b border-[var(--fr-border)]"
      role="navigation"
      aria-label="Navigazione principale"
    >
      <div className="max-w-wrap mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px] gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <span className="w-10 h-10 rounded-xl bg-[var(--fr-red)] flex items-center justify-center overflow-hidden shadow-[var(--fr-glow-red)] p-1 transition-transform group-hover:scale-105">
              <img
                src="/data/images/formula-rossa-logo.png"
                alt="Formula Rossa — torna alla home"
                className="w-full h-full object-contain"
              />
            </span>
            <span className="font-head text-2xl font-black uppercase tracking-wide whitespace-nowrap text-[var(--fr-text)]">
              Formula <span className="text-[var(--fr-red)]">Rossa</span>
            </span>
          </Link>

          {/* Menu desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {PILLARS.map((p) => {
              const open = openMenu === p.id;
              const active = isPillarActive(p);
              return (
                <div
                  key={p.id}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(p.id)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    type="button"
                    onClick={() => setOpenMenu(open ? null : p.id)}
                    aria-expanded={open}
                    aria-haspopup="true"
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap transition-colors
                      ${active || open
                        ? 'text-[var(--fr-text)] bg-[var(--fr-surface-2)]'
                        : 'text-[var(--fr-text-muted)] hover:text-[var(--fr-text)] hover:bg-[var(--fr-surface-2)]'}`}
                  >
                    <p.icon className={`w-4 h-4 ${active ? 'text-[var(--fr-red)]' : ''}`} aria-hidden="true" />
                    {p.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>

                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full pt-2 w-64"
                      >
                        <div className="rounded-[var(--radius-md)] border border-[var(--fr-border)] bg-[var(--fr-surface)] shadow-[var(--fr-shadow)] p-2">
                          {p.items.map((item) => {
                            const cur = pathname === item.href || pathname?.startsWith(item.href + '/');
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                aria-current={cur ? 'page' : undefined}
                                className={`block px-3 py-2.5 rounded-[var(--radius-sm)] transition-colors
                                  ${cur ? 'bg-[var(--fr-red-soft)]' : 'hover:bg-[var(--fr-surface-2)]'}`}
                              >
                                <span className={`block text-[13px] font-bold ${cur ? 'text-[var(--fr-red)]' : 'text-[var(--fr-text)]'}`}>
                                  {item.label}
                                </span>
                                <span className="block text-[11px] text-[var(--fr-text-faint)] leading-tight mt-0.5">
                                  {item.desc}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            <Link
              href="/about"
              aria-current={pathname === '/about' ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap transition-colors
                ${pathname === '/about'
                  ? 'text-[var(--fr-text)] bg-[var(--fr-surface-2)]'
                  : 'text-[var(--fr-text-muted)] hover:text-[var(--fr-text)] hover:bg-[var(--fr-surface-2)]'}`}
            >
              <Info className="w-4 h-4" aria-hidden="true" />
              Chi siamo
            </Link>
          </div>

          {/* Azioni destra */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={GRIDUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="GridUp — l'app per il Mondiale F1"
              className="hidden sm:inline-flex items-center gap-2 bg-[var(--fr-red)] text-white px-4 py-2.5 rounded-xl text-[12px] font-bold whitespace-nowrap shadow-[var(--fr-glow-red)] hover:bg-[var(--fr-red-ink)] hover:-translate-y-0.5 transition-all"
            >
              <Smartphone className="w-4 h-4" aria-hidden="true" />
              App GridUp
            </a>

            <div className="hidden sm:block"><ThemeToggle /></div>

            <div className="hidden lg:flex items-center pl-2 ml-1 border-l border-[var(--fr-border)]">
              {session ? (
                <div className="flex items-center gap-2.5">
                  <img
                    src={session.user.image}
                    alt={`Avatar di ${session.user.name}`}
                    className="w-9 h-9 rounded-full border-2 border-[var(--fr-red)] object-cover"
                  />
                  <button
                    onClick={() => signOut()}
                    className="text-[11px] font-bold text-[var(--fr-text-muted)] hover:text-[var(--fr-text)] flex items-center gap-1 transition-colors"
                  >
                    Esci <LogOut className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn('google')}
                  className="px-4 py-2.5 rounded-xl text-[12px] font-bold border-2 border-[var(--fr-border-strong)] text-[var(--fr-text)] hover:border-[var(--fr-red)] transition-colors"
                >
                  Accedi
                </button>
              )}
            </div>

            {/* Burger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Chiudi menu' : 'Apri menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden p-2.5 rounded-xl border border-[var(--fr-border)] bg-[var(--fr-surface-2)] text-[var(--fr-text)]"
            >
              {mobileOpen
                ? <X className="w-5 h-5" aria-hidden="true" />
                : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-[var(--fr-surface)] border-t border-[var(--fr-border)]"
          >
            <div className="px-4 py-5 space-y-5 max-h-[calc(100vh-70px)] overflow-y-auto">
              {PILLARS.map((p) => (
                <div key={p.id}>
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--fr-red)] mb-2">
                    <p.icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {p.label}
                  </p>
                  <div className="grid gap-1">
                    {p.items.map((item) => {
                      const cur = pathname === item.href || pathname?.startsWith(item.href + '/');
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          aria-current={cur ? 'page' : undefined}
                          className={`px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-bold transition-colors
                            ${cur
                              ? 'bg-[var(--fr-red-soft)] text-[var(--fr-red)]'
                              : 'text-[var(--fr-text-muted)] hover:bg-[var(--fr-surface-2)] hover:text-[var(--fr-text)]'}`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-bold text-[var(--fr-text-muted)] hover:bg-[var(--fr-surface-2)] hover:text-[var(--fr-text)]"
              >
                Chi siamo
              </Link>

              <a
                href={GRIDUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 bg-[var(--fr-red)] text-white px-4 py-3.5 rounded-xl text-sm font-bold"
              >
                <Smartphone className="w-4 h-4" aria-hidden="true" />
                Apri l&apos;app GridUp
              </a>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--fr-border)]">
                <ThemeToggle />
                {session ? (
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 text-sm font-bold text-[var(--fr-text-muted)]"
                  >
                    Esci <LogOut className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    onClick={() => signIn('google')}
                    className="px-5 py-2.5 rounded-xl text-[12px] font-bold border-2 border-[var(--fr-border-strong)] text-[var(--fr-text)]"
                  >
                    Accedi
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
