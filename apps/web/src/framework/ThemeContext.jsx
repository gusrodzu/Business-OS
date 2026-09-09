import {createContext, useContext, useEffect, useMemo, useState} from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'buzzbee-theme';
const VALID_THEMES = new Set(['light', 'dark', 'system']);

function getInitialTheme() {
  try {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.has(storedTheme) ? storedTheme : 'system';
  } catch {
    return 'system';
  }
}

function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({children}) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return undefined;
    const handleChange = (event) => setSystemTheme(event.matches ? 'dark' : 'light');
    media.addEventListener?.('change', handleChange);
    return () => media.removeEventListener?.('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themePreference = theme;
    document.documentElement.style.colorScheme = resolvedTheme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // La app continúa aunque el almacenamiento esté bloqueado.
    }
  }, [theme, resolvedTheme]);

  const value = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme: (nextTheme) => {
      if (VALID_THEMES.has(nextTheme)) setTheme(nextTheme);
    },
    toggleTheme: () => setTheme((currentTheme) => {
      const currentResolved = currentTheme === 'system' ? getSystemTheme() : currentTheme;
      return currentResolved === 'dark' ? 'light' : 'dark';
    }),
  }), [theme, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return context;
}
