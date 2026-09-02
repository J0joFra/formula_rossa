// components/ferrari/Navigation.jsx
// Menu: Archivio ▾ · Stagione ▾ · News · Gioca + app GridUp.
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  BarChart3, Trophy, Newspaper, Gamepad2, LogOut, Smartphone,
  ChevronDown, Menu, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { useI18n } from '../../lib/i18n';
import { GRIDUP_URL } from '../../lib/gridup';

export { GRIDUP_URL } from '../../lib/gridup';

/* Il menu contiene solo pagine che esistono davvero: una voce che porta a una
   pagina inesistente o a un vicolo cieco è peggio di una voce assente. */
const ARCHIVIO = {
  key: 'nav_archive',
  icon: BarChart3,
  items: [
    { href: '/statistics', key: 'nav_stats',    desc: 'Record e dati storici Ferrari' },
    { href: '/piloti',     key: 'nav_drivers',  desc: 'Schede e carriere' },
    { href: '/circuiti',   key: 'nav_circuits', desc: 'Tracciati e statistiche' },
  ],
};

const STAGIONE = {
  key: 'nav_season',
  icon: Trophy,
  items: [
    { href: '/standings', key: 'nav_standings', desc: 'Piloti e costruttori' },
    { href: '/gp',        key: 'nav_gp',        desc: 'Ogni gara nel dettaglio' },
  ],
};

const MENU = [ARCHIVIO, STAGIONE];

/* Voci singole: una pagina, un link. Niente tendine da una voce sola. */
const LINKS = [
  { href: '/news',    key: 'nav_news', icon: Newspaper },
  { href: '/fanzone', key: 'nav_play', icon: Gamepad2 },
];

export default function Navigation() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t } = useI18n();
  const navRef = useRef(null);

  useEffect(() => { setOpenMenu(null); setMobileOpen(false); }, [pathname]);

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

  const isActive = (href) => pathname === href || pathname?.startsWith(href + '/');
  const groupActive = (g) => g.items.some(i => isActive(i.href));

  const itemCls = (active) =>
    `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap transition-colors ${
      active
        ? 'text-[var(--fr-text)] bg-[var(--fr-surface-2)]'
        : 'text-[var(--fr-text-muted)] hover:text-[var(--fr-text)] hover:bg-[var(--fr-surface-2)]'
    }`;

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
            {MENU.map((group) => {
              const open = openMenu === group.key;
              const active = groupActive(group);
              return (
                <div
                  key={group.key}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(group.key)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    type="button"
                    onClick={() => setOpenMenu(open ? null : group.key)}
                    aria-expanded={open}
                    aria-haspopup="true"
                    className={itemCls(active || open)}
                  >
                    <group.icon className={`w-4 h-4 ${active ? 'text-[var(--fr-red)]' : ''}`} aria-hidden="true" />
                    {t(group.key)}
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
                          {group.items.map((item) => {
                            const cur = isActive(item.href);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                aria-current={cur ? 'page' : undefined}
                                className={`block px-3 py-2.5 rounded-[var(--radius-sm)] transition-colors ${
                                  cur ? 'bg-[var(--fr-red-soft)]' : 'hover:bg-[var(--fr-surface-2)]'
                                }`}
                              >
                                <span className={`block text-[13px] font-bold ${cur ? 'text-[var(--fr-red)]' : 'text-[var(--fr-text)]'}`}>
                                  {t(item.key)}
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

            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className={itemCls(isActive(l.href))}
              >
                <l.icon className={`w-4 h-4 ${isActive(l.href) ? 'text-[var(--fr-red)]' : ''}`} aria-hidden="true" />
                {t(l.key)}
              </Link>
            ))}
          </div>

          {/* Azioni a destra */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={GRIDUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="GridUp — l'app per il Mondiale F1"
              className="hidden sm:inline-flex items-center gap-2 bg-[var(--fr-red)] text-white px-4 py-2.5 rounded-xl text-[12px] font-bold whitespace-nowrap shadow-[var(--fr-glow-red)] hover:bg-[var(--fr-red-ink)] hover:-translate-y-0.5 transition-all"
            >
              <Smartphone className="w-4 h-4" aria-hidden="true" />
              {t('nav_app')}
            </a>

            <div className="hidden sm:block"><ThemeToggle /></div>
            <div className="hidden sm:block"><LanguageSwitcher /></div>

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
                    {t('nav_signout')} <LogOut className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn('google')}
                  className="px-4 py-2.5 rounded-xl text-[12px] font-bold border-2 border-[var(--fr-border-strong)] text-[var(--fr-text)] hover:border-[var(--fr-red)] transition-colors"
                >
                  {t('nav_signin')}
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label={t('nav_menu')}
              aria-expanded={mobileOpen}
              className="lg:hidden p-2.5 rounded-xl border border-[var(--fr-border)] bg-[var(--fr-surface-2)] text-[var(--fr-text)]"
            >
              {mobileOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
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
              {MENU.map((group) => (
                <div key={group.key}>
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--fr-red)] mb-2">
                    <group.icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {t(group.key)}
                  </p>
                  <div className="grid gap-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                        className={`px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-bold transition-colors ${
                          isActive(item.href)
                            ? 'bg-[var(--fr-red-soft)] text-[var(--fr-red)]'
                            : 'text-[var(--fr-text-muted)] hover:bg-[var(--fr-surface-2)] hover:text-[var(--fr-text)]'
                        }`}
                      >
                        {t(item.key)}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <div className="grid gap-1">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive(l.href) ? 'page' : undefined}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-bold transition-colors ${
                      isActive(l.href)
                        ? 'bg-[var(--fr-red-soft)] text-[var(--fr-red)]'
                        : 'text-[var(--fr-text-muted)] hover:bg-[var(--fr-surface-2)] hover:text-[var(--fr-text)]'
                    }`}
                  >
                    <l.icon className="w-4 h-4" aria-hidden="true" />
                    {t(l.key)}
                  </Link>
                ))}
              </div>

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
                <LanguageSwitcher />
                {session ? (
                  <button onClick={() => signOut()} className="flex items-center gap-2 text-sm font-bold text-[var(--fr-text-muted)]">
                    {t('nav_signout')} <LogOut className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    onClick={() => signIn('google')}
                    className="px-5 py-2.5 rounded-xl text-[12px] font-bold border-2 border-[var(--fr-border-strong)] text-[var(--fr-text)]"
                  >
                    {t('nav_signin')}
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
