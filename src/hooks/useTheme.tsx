// hooks/useTheme.tsx
import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get theme from localStorage or default to 'auto'
    const savedTheme = localStorage.getItem('partypass_theme') as Theme;
    return savedTheme || 'auto';
  });

  const [isDark, setIsDark] = useState(false);

  // Function to determine if dark mode should be active
  const getIsDark = (currentTheme: Theme): boolean => {
    if (currentTheme === 'dark') return true;
    if (currentTheme === 'light') return false;
    // For 'auto', check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Function to apply theme to document
  const applyTheme = (currentTheme: Theme) => {
    const shouldBeDark = getIsDark(currentTheme);
    setIsDark(shouldBeDark);
    
    // Add/remove dark class to document
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Set theme and save to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('partypass_theme', newTheme);
    applyTheme(newTheme);
  };

  // Toggle between light and dark (skip auto)
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'auto') {
        applyTheme('auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  // Apply theme on mount and theme change
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme
  };
};
