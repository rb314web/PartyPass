// hooks/useTheme.tsx
import { useState, useEffect, useCallback, useRef } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export const THEME_TRANSITION_MS = 350;

interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

interface ApplyThemeOptions {
  animate?: boolean;
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (updateCallback: () => void) => {
    finished: Promise<void>;
  };
};

const getSystemPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const resolveIsDark = (currentTheme: Theme): boolean => {
  if (currentTheme === 'dark') return true;
  if (currentTheme === 'light') return false;
  return getSystemPreference();
};

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    const saved = localStorage.getItem('partypass_theme') as Theme | null;
    return saved || 'system';
  });

  const [isDark, setIsDark] = useState(() => resolveIsDark(theme));
  const hasAppliedInitialTheme = useRef(false);

  const applyTheme = useCallback((currentTheme: Theme, options: ApplyThemeOptions = {}) => {
    const { animate = true } = options;
    const root = document.documentElement;
    const body = document.body;
    const shouldBeDark = resolveIsDark(currentTheme);

    const commitTheme = () => {
      setIsDark(shouldBeDark);
      root.classList.toggle('dark', shouldBeDark);
      root.classList.toggle('light', !shouldBeDark);
    };

    const shouldAnimate =
      animate && hasAppliedInitialTheme.current && !prefersReducedMotion();

    const clearTransitionClasses = () => {
      body.classList.remove('theme-transitioning', 'theme-view-transitioning');
    };

    if (!shouldAnimate) {
      clearTransitionClasses();
      commitTheme();
      hasAppliedInitialTheme.current = true;
      return;
    }

    const startViewTransition = (document as DocumentWithViewTransition)
      .startViewTransition;

    if (typeof startViewTransition === 'function') {
      body.classList.add('theme-view-transitioning');
      const transition = startViewTransition.call(document, commitTheme);
      transition.finished.then(clearTransitionClasses).catch(clearTransitionClasses);
      hasAppliedInitialTheme.current = true;
      return;
    }

    body.classList.add('theme-transitioning');
    commitTheme();
    window.setTimeout(clearTransitionClasses, THEME_TRANSITION_MS);
    hasAppliedInitialTheme.current = true;
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('partypass_theme', newTheme);
    applyTheme(newTheme, { animate: true });
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const currentIsDark = resolveIsDark(theme);
    const newTheme: Theme = currentIsDark ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  useEffect(() => {
    applyTheme(theme, { animate: false });
    // Tylko przy starcie — toggle animuje przez setTheme()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyTheme]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      applyTheme('system', { animate: true });
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
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
