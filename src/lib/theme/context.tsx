'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeChoice = 'light' | 'dark' | 'system';

interface ThemeValue {
  theme: ThemeChoice;
  resolved: 'light' | 'dark';
  setTheme: (t: ThemeChoice) => void;
}

const Ctx = createContext<ThemeValue | null>(null);
const STORAGE = 'tm.theme';

const systemPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

  const apply = useCallback((t: ThemeChoice) => {
    const dark = t === 'dark' || (t === 'system' && systemPrefersDark());
    document.documentElement.classList.toggle('dark', dark);
    setResolved(dark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE) as ThemeChoice | null) ?? 'system';
    setThemeState(saved);
    apply(saved);
    // follow the OS while the user is on "system"
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if ((localStorage.getItem(STORAGE) as ThemeChoice | null) === 'dark' || localStorage.getItem(STORAGE) === 'light') return;
      apply('system');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [apply]);

  const setTheme = useCallback(
    (t: ThemeChoice) => {
      setThemeState(t);
      try {
        localStorage.setItem(STORAGE, t);
      } catch {
        /* private mode */
      }
      apply(t);
    },
    [apply],
  );

  const value = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme must be used inside <ThemeProvider>');
  return v;
}
