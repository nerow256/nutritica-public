'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSessionUserId, dbGetSettings, dbUpdateSettings } from '@/lib/db';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ darkMode: false, toggleDarkMode: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Quick load from localStorage for instant theme (no flash)
    try {
      const cached = localStorage.getItem('dhc_dark_mode');
      if (cached === 'true') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    } catch {}

    // Then sync from DB if logged in
    const userId = getSessionUserId();
    if (userId) {
      dbGetSettings(userId).then(settings => {
        if (settings.darkMode) {
          setDarkMode(true);
          document.documentElement.classList.add('dark');
          localStorage.setItem('dhc_dark_mode', 'true');
        }
      }).catch(() => {});
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Cache locally for instant load
    localStorage.setItem('dhc_dark_mode', String(newMode));
    // Persist to DB
    const userId = getSessionUserId();
    if (userId) {
      dbUpdateSettings(userId, { darkMode: newMode }).catch(() => {});
    }
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
