// hooks/useTheme.tsx
import { useState, useEffect } from 'react';

export type Theme = 'light';

interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isDark, setIsDark] = useState(false);

  // Function to apply theme to document (always light)
  const applyTheme = (currentTheme: Theme) => {
    setIsDark(false); // Always false for light theme
    
    // Always remove dark class to ensure light theme
    document.documentElement.classList.remove('dark');
    
    // Force light theme class if needed
    document.documentElement.classList.add('light');
  };

  // Set theme (always light, but keeping interface for compatibility)
  const setTheme = (newTheme: Theme) => {
    setThemeState('light');
    localStorage.setItem('partypass_theme', 'light');
    applyTheme('light');
  };

  // Toggle theme (no-op since we only have light theme)
  const toggleTheme = () => {
    // No-op since we only support light theme
    setTheme('light');
  };

  // Apply theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme
  };
};
