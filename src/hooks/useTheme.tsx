// hooks/useTheme.tsx
import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Funkcja pomocnicza do wykrywania preferencji systemowych
const getSystemPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Funkcja pomocnicza do określania czy tryb ciemny jest aktywny
const resolveIsDark = (currentTheme: Theme): boolean => {
  if (currentTheme === 'dark') return true;
  if (currentTheme === 'light') return false;
  return getSystemPreference();
};

export const useTheme = (): UseThemeReturn => {
  // Inicjalizacja z localStorage lub preferencjami systemowymi
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    const saved = localStorage.getItem('partypass_theme') as Theme | null;
    return saved || 'system';
  });

  const [isDark, setIsDark] = useState(() => resolveIsDark(theme));

  // Funkcja aplikująca motyw do dokumentu
  const applyTheme = useCallback((currentTheme: Theme) => {
    const root = document.documentElement;
    const body = document.body;
    const shouldBeDark = resolveIsDark(currentTheme);
    
    // Dodaj klasę animacji podczas zmiany motywu
    body.classList.add('theme-transitioning');
    
    // Krótkie opóźnienie dla płynniejszej animacji
    requestAnimationFrame(() => {
      setIsDark(shouldBeDark);

      // Dodaj lub usuń klasę 'dark' z elementu html
      root.classList.toggle('dark', shouldBeDark);
      root.classList.toggle('light', !shouldBeDark);
      
      // Usuń klasę animacji po zakończeniu przejścia
      setTimeout(() => {
        body.classList.remove('theme-transitioning');
      }, 300); // Dopasuj do czasu transition
    });
  }, []);

  // Ustaw motyw (light/dark/system)
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('partypass_theme', newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // Przełącz między light a dark (system pomija)
  const toggleTheme = useCallback(() => {
    const currentIsDark = resolveIsDark(theme);
    const newTheme: Theme = currentIsDark ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Aplikuj motyw przy montowaniu
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Nasłuchuj zmian preferencji systemowych dla 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      applyTheme('system');
    };

    // Obsługa dla starszych przeglądarek
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback dla starszych przeglądarek
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme, applyTheme]);

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  };
};
