// components/common/ThemeToggle/ThemeToggle.tsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import './ThemeToggle.scss';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'default' | 'large';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className, 
  showLabel = false,
  size = 'default' 
}) => {
  const { isDark, toggleTheme } = useTheme();

  const sizeClass = size === 'large' ? 'theme-toggle--large' : '';

  return (
    <div className={`theme-toggle ${sizeClass} ${className || ''}`}>
      <button
        className="theme-toggle__switch"
        onClick={toggleTheme}
        aria-label={isDark ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
        type="button"
        role="switch"
        aria-checked={isDark}
      >
        {showLabel && (
          <span className="theme-toggle__label">
            <span className={`theme-toggle__label-text ${isDark ? 'theme-toggle__label-text--dark' : 'theme-toggle__label-text--light'}`}>
              {isDark ? 'Ciemny' : 'Jasny'}
            </span>
          </span>
        )}
        <div className="theme-toggle__track">
          <div className={`theme-toggle__thumb ${isDark ? 'theme-toggle__thumb--dark' : ''}`}>
            {isDark ? (
              <Moon size={size === 'large' ? 18 : 14} className="theme-toggle__icon" />
            ) : (
              <Sun size={size === 'large' ? 18 : 14} className="theme-toggle__icon" />
            )}
          </div>
        </div>
      </button>
    </div>
  );
};
