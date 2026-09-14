import {createContext, useContext, useEffect, useMemo, useState} from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'buzzbee-theme';
const DENSITY_KEY = 'buzzbee-density';
const MOTION_KEY = 'buzzbee-reduced-motion';
const VALID_THEMES = new Set(['light', 'dark', 'system']);
const VALID_DENSITIES = new Set(['comfortable', 'compact']);

function getStoredValue(key, fallback) {
  try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function getInitialTheme() {
  const storedTheme = getStoredValue(THEME_KEY, 'system');
  return VALID_THEMES.has(storedTheme) ? storedTheme : 'system';
}

function getInitialDensity() {
  const value = getStoredValue(DENSITY_KEY, 'comfortable');
  return VALID_DENSITIES.has(value) ? value : 'comfortable';
}

function getInitialReducedMotion() {
  return getStoredValue(MOTION_KEY, 'false') === 'true';
}

function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({children}) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [density, setDensityState] = useState(getInitialDensity);
  const [reducedMotion, setReducedMotionState] = useState(getInitialReducedMotion);
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
    document.documentElement.dataset.density = density;
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
    document.documentElement.style.colorScheme = resolvedTheme;
    try {
      window.localStorage.setItem(THEME_KEY, theme);
      window.localStorage.setItem(DENSITY_KEY, density);
      window.localStorage.setItem(MOTION_KEY, String(reducedMotion));
    } catch {
      // La app continúa aunque el almacenamiento esté bloqueado.
    }
  }, [theme, resolvedTheme, density, reducedMotion]);

  useEffect(() => {
    const syncSessionPreferences = (event) => {
      const preferences = event?.detail?.user?.preferences;
      if (!preferences || typeof preferences !== 'object') return;
      if (VALID_THEMES.has(preferences.theme)) setThemeState(preferences.theme);
      if (VALID_DENSITIES.has(preferences.density)) setDensityState(preferences.density);
      if (typeof preferences.reducedMotion === 'boolean') setReducedMotionState(preferences.reducedMotion);
    };
    window.addEventListener('buzzbee-session-updated', syncSessionPreferences);
    return () => window.removeEventListener('buzzbee-session-updated', syncSessionPreferences);
  }, []);

  const value = useMemo(() => ({
    theme,
    resolvedTheme,
    density,
    reducedMotion,
    setTheme: (nextTheme) => {
      if (VALID_THEMES.has(nextTheme)) setThemeState(nextTheme);
    },
    setDensity: (nextDensity) => {
      if (VALID_DENSITIES.has(nextDensity)) setDensityState(nextDensity);
    },
    setReducedMotion: (value) => setReducedMotionState(Boolean(value)),
    toggleTheme: () => setThemeState((currentTheme) => {
      const currentResolved = currentTheme === 'system' ? getSystemTheme() : currentTheme;
      return currentResolved === 'dark' ? 'light' : 'dark';
    }),
  }), [theme, resolvedTheme, density, reducedMotion]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return context;
}
