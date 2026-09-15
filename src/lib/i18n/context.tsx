'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Bi, Lang } from '@/lib/types';
import { DICT, type DictKey } from './dictionary';

interface LangValue {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  isRtl: boolean;
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** dictionary lookup */
  t: (key: DictKey) => string;
  /** bilingual value lookup */
  tb: (v: Bi | undefined) => string;
}

const Ctx = createContext<LangValue | null>(null);

const STORAGE = 'tm.lang';

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  // The saved language is only known on the client. Rendering the tree before
  // it is read would either flash the wrong language or trip hydration, so the
  // first paint is a short branded hold instead.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE) as Lang | null) ?? 'en';
    setLangState(saved);
    setReady(true);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE, l);
    } catch {
      /* private mode */
    }
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const value = useMemo<LangValue>(
    () => ({
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      isRtl: lang === 'ar',
      setLang,
      toggle: () => setLang(lang === 'ar' ? 'en' : 'ar'),
      t: (key) => DICT[key]?.[lang] ?? key,
      tb: (v) => (v ? v[lang] : ''),
    }),
    [lang, setLang],
  );

  return (
    <Ctx.Provider value={value}>
      {ready ? children : <BootHold />}
    </Ctx.Provider>
  );
}

function BootHold() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg">
      <svg viewBox="0 0 48 48" width={34} height={34} className="animate-fade-in opacity-70" aria-label="Taameem">
        <defs>
          <linearGradient id="tm-boot" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2FCFA3" />
            <stop offset="100%" stopColor="#0B6F62" />
          </linearGradient>
        </defs>
        <path d="M30 4H14a10 10 0 0 0-10 10v10a4 4 0 0 0 4 4h6v-8a6 6 0 0 1 6-6h14V8a4 4 0 0 0-4-4Z" fill="url(#tm-boot)" />
        <path d="M40 20H26a6 6 0 0 0-6 6v18h14a10 10 0 0 0 10-10V24a4 4 0 0 0-4-4Z" fill="url(#tm-boot)" opacity="0.72" />
      </svg>
    </div>
  );
}

export function useLang() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLang must be used inside <LangProvider>');
  return v;
}
