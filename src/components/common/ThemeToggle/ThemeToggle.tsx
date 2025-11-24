// components/common/ThemeToggle/ThemeToggle.tsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import './ThemeToggle.scss';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`theme-toggle ${className || ''}`}>
      <button
        className="theme-toggle__switch"
        onClick={toggleTheme}
        aria-label={isDark ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
        type="button"
        role="switch"
        aria-checked={isDark}
      >
        <div className="theme-toggle__track">
          <div className={`theme-toggle__thumb ${isDark ? 'theme-toggle__thumb--dark' : ''}`}>
            {isDark ? (
              <Moon size={14} className="theme-toggle__icon" />
            ) : (
              <Sun size={14} className="theme-toggle__icon" />
            )}
          </div>
        </div>
      </button>
    </div>
  );
};
