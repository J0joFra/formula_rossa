'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita hydration mismatch 
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Attiva tema chiaro' : 'Attiva tema scuro'}
      className="p-2 rounded-lg border border-[var(--border-light)] hover:border-[var(--ferrari-red)]/40 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] transition-all duration-200"
    >
      {isDark
        ? <Sun  className="w-4 h-4 text-[var(--ferrari-yellow)]" />
        : <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
      }
    </button>
  );
}