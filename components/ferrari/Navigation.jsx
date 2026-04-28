// components/ferrari/Navigation.jsx
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react";
import { BarChart3, Gamepad2, LogOut, Trophy, Zap, Info, Newspaper, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Navigazione principale"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: 'rgba(6, 6, 6, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* ── Logo ── */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
            className="nav-logo-link"
          >
            <div style={{
              width: '36px', height: '36px',
              background: '#FFD700',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '4px', overflow: 'hidden', flexShrink: 0,
              boxShadow: '0 0 12px rgba(220,0,0,0.35)',
              transition: 'transform 0.2s ease',
            }}>
              <img
                src="/data/images/formula-rossa-logo.png"
                alt="Formula Rossa"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <span style={{
              fontSize: '17px', fontWeight: '900',
              letterSpacing: '-0.5px', textTransform: 'uppercase',
              fontStyle: 'italic', color: '#fff',
              fontFamily: 'inherit',
              lineHeight: 1,
            }}>
              Formula <span style={{ color: '#dc2626' }}>Rossa</span>
            </span>
          </Link>

          {/* ── Menu Desktop ── */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <NavLink href="/standings"   icon={Trophy}    label="Standings"   active={pathname === '/standings'} />
            <NavLink href="/statistics"  icon={BarChart3} label="Stats"       active={pathname === '/statistics'} />
            <NavLink href="/fanzone"     icon={Gamepad2}  label="Fan Zone"    active={pathname === '/fanzone'} />
            <NavLink href="/fantaf1"     icon={Flag}      label="FantaF1"     active={pathname === '/fantaf1'} />
            <NavLink href="/live-timing" icon={Zap}       label="Live Timing" active={pathname === '/live-timing'} />
            <NavLink href="/news"        icon={Newspaper} label="News"        active={pathname?.startsWith('/news')} />
            <NavLink href="/about"       icon={Info}      label="Chi Siamo"   active={pathname === '/about'} />

            <div style={{ marginLeft: '8px' }}>
              <ThemeToggle />
            </div>

            {/* Divisore + Utente */}
            <div style={{
              marginLeft: '16px', paddingLeft: '16px',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center',
            }}>
              {session ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: '10px', fontWeight: '800',
                      textTransform: 'uppercase', color: '#dc2626',
                      margin: 0, letterSpacing: '0.5px', lineHeight: 1,
                    }}>{session.user.name}</p>
                    <button
                      onClick={() => signOut()}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '9px', color: 'rgba(255,255,255,0.3)',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        marginTop: '3px', padding: 0,
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                    >
                      Logout <LogOut size={9} />
                    </button>
                  </div>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    border: '2px solid #dc2626', padding: '2px', overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <img src={session.user.image} alt={`Avatar di ${session.user.name}`}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => signIn('google')}
                  style={{
                    background: '#dc2626', color: '#fff',
                    border: 'none', cursor: 'pointer',
                    padding: '8px 18px', borderRadius: '4px',
                    fontSize: '10px', fontWeight: '800',
                    textTransform: 'uppercase', letterSpacing: '1.5px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.background = '#dc2626'}
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* ── Burger (Mobile) ── */}
          <div className="nav-mobile" style={{ display: 'none', alignItems: 'center', gap: '12px' }}>
            {session && (
              <img src={session.user.image}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #dc2626' }}
                alt={`Avatar di ${session.user.name}`} />
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Chiudi menu' : 'Apri menu'}
              aria-expanded={isMenuOpen}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px', padding: '8px', cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Menu Mobile ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: '#080808',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <MobileLink href="/standings"   label="Standings"   active={pathname === '/standings'}       onClick={() => setIsMenuOpen(false)} />
              <MobileLink href="/statistics"  label="Stats"       active={pathname === '/statistics'}      onClick={() => setIsMenuOpen(false)} />
              <MobileLink href="/fanzone"     label="Fan Zone"    active={pathname === '/fanzone'}         onClick={() => setIsMenuOpen(false)} />
              <MobileLink href="/fantaf1"     label="FantaF1"     active={pathname === '/fantaf1'}         onClick={() => setIsMenuOpen(false)} />
              <MobileLink href="/live-timing" label="Live Timing" active={pathname === '/live-timing'}     onClick={() => setIsMenuOpen(false)} />
              <MobileLink href="/news"        label="News"        active={pathname?.startsWith('/news')}   onClick={() => setIsMenuOpen(false)} />
              <MobileLink href="/about"       label="Chi Siamo"   active={pathname === '/about'}           onClick={() => setIsMenuOpen(false)} />

              <div style={{ paddingTop: '4px' }}>
                <ThemeToggle />
              </div>

              <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '8px' }}>
                {session ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={session.user.image}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #dc2626' }}
                        alt={`Avatar di ${session.user.name}`} />
                      <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#fff' }}>
                        {session.user.name}
                      </span>
                    </div>
                    <button onClick={() => signOut()}
                      style={{
                        background: 'rgba(220,38,38,0.1)', border: 'none', cursor: 'pointer',
                        padding: '8px', borderRadius: '6px', color: '#dc2626',
                        display: 'flex', alignItems: 'center',
                      }}>
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => signIn('google')}
                    style={{
                      width: '100%', background: '#dc2626', color: '#fff',
                      border: 'none', cursor: 'pointer',
                      padding: '14px', borderRadius: '4px',
                      fontSize: '11px', fontWeight: '800',
                      textTransform: 'uppercase', letterSpacing: '2px',
                    }}
                  >
                    Login with Google
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

function NavLink({ href, label, icon: Icon, active }) {
  const [hovered, setHovered] = useState(false);
  const isOn = active || hovered;
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 12px', borderRadius: '4px',
        fontSize: '10px', fontWeight: '800',
        textTransform: 'uppercase', letterSpacing: '0.8px',
        textDecoration: 'none',
        color: active ? '#fff' : hovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
        background: active ? 'rgba(255,255,255,0.06)' : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'all 0.18s ease',
        fontFamily: 'monospace',
      }}
    >
      <Icon size={13} style={{ color: active ? '#dc2626' : hovered ? 'rgba(220,38,38,0.7)' : 'rgba(255,255,255,0.25)', transition: 'color 0.18s' }} aria-hidden="true" />
      {label}
      {active && (
        <motion.div
          layoutId="nav-indicator"
          style={{
            position: 'absolute', bottom: '-1px',
            left: '50%', transform: 'translateX(-50%)',
            width: '16px', height: '2px',
            background: '#dc2626', borderRadius: '1px',
          }}
        />
      )}
    </Link>
  );
}

function MobileLink({ href, label, onClick, active }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 14px', borderRadius: '4px',
        fontSize: '11px', fontWeight: '800',
        textTransform: 'uppercase', letterSpacing: '1.5px',
        textDecoration: 'none',
        color: active ? '#fff' : 'rgba(255,255,255,0.45)',
        background: active ? 'rgba(220,38,38,0.1)' : 'transparent',
        border: active ? '1px solid rgba(220,38,38,0.2)' : '1px solid transparent',
        transition: 'all 0.18s ease',
        fontFamily: 'monospace',
      }}
    >
      {label}
      {active && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#dc2626' }} />}
    </Link>
  );
}
