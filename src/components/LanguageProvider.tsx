'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type Locale, type Translations, getTranslations, isRtl } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  t: getTranslations('en'),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  useEffect(() => {
    try {
      const cached = localStorage.getItem('dhc_language') as Locale | null;
      if (cached) {
        setLocaleState(cached);
        applyDirection(cached);
      }
    } catch {}
  }, []);

  const applyDirection = (loc: Locale) => {
    const rtl = isRtl(loc);
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = loc;
  };

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    applyDirection(newLocale);
    try {
      localStorage.setItem('dhc_language', newLocale);
    } catch {}
  };

  const t = getTranslations(locale);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
