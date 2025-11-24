// hooks/useAccentColor.tsx
import { useEffect } from 'react';

const accentColors = {
  blue: {
    value: '#6366f1',
    light: '#818cf8',
    dark: '#4f46e5',
  },
  purple: {
    value: '#8b5cf6',
    light: '#a78bfa',
    dark: '#7c3aed',
  },
  green: {
    value: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  orange: {
    value: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  red: {
    value: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
};

const lightenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return (
    '#' +
    (
      0x1000000 +
      (R > 0 ? R : 0) * 0x10000 +
      (G > 0 ? G : 0) * 0x100 +
      (B > 0 ? B : 0)
    )
      .toString(16)
      .slice(1)
  );
};

export const useAccentColor = () => {
  useEffect(() => {
    // Załaduj zapisany kolor przy montowaniu
    const savedColorId =
      (localStorage.getItem('accentColor') as
        | keyof typeof accentColors
        | 'custom') || 'blue';

    if (savedColorId === 'custom') {
      const customColor =
        localStorage.getItem('customAccentColor') || '#6366f1';
      applyCustomColor(customColor);
    } else {
      applyAccentColor(savedColorId);
    }
  }, []);

  const applyCustomColor = (hexColor: string) => {
    const root = document.documentElement;
    const light = lightenColor(hexColor, 15);
    const dark = darkenColor(hexColor, 15);

    root.style.setProperty('--color-primary', hexColor);
    root.style.setProperty('--primary', hexColor);
    root.style.setProperty('--color-primary-light', light);
    root.style.setProperty('--primary-light', light);
    root.style.setProperty('--color-primary-dark', dark);
    root.style.setProperty('--primary-dark', dark);
  };

  const applyAccentColor = (colorId: keyof typeof accentColors) => {
    const color = accentColors[colorId];
    if (color) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', color.value);
      root.style.setProperty('--primary', color.value);
      root.style.setProperty('--color-primary-light', color.light);
      root.style.setProperty('--primary-light', color.light);
      root.style.setProperty('--color-primary-dark', color.dark);
      root.style.setProperty('--primary-dark', color.dark);
    }
  };

  return { applyAccentColor, applyCustomColor };
};
