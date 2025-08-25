// components/common/ThemeToggle/ThemeToggle.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from '../../../hooks/useTheme';
import './ThemeToggle.scss';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleThemeSelect = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={20} />;
      case 'dark':
        return <Moon size={20} />;
      case 'auto':
        return <Monitor size={20} />;
      default:
        return <Sun size={20} />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Jasny';
      case 'dark':
        return 'Ciemny';
      case 'auto':
        return 'Auto';
      default:
        return 'Auto';
    }
  };

  return (
    <div className="theme-toggle" ref={dropdownRef}>
      <button
        className="theme-toggle__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Przełącz motyw"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getThemeIcon()}
        <span className="theme-toggle__label">{getThemeLabel()}</span>
        <svg
          className={`theme-toggle__arrow ${isOpen ? 'theme-toggle__arrow--open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="theme-toggle__dropdown">
          <button
            className={`theme-toggle__option ${theme === 'light' ? 'theme-toggle__option--active' : ''}`}
            onClick={() => handleThemeSelect('light')}
          >
            <Sun size={16} />
            <span>Jasny</span>
          </button>
          
          <button
            className={`theme-toggle__option ${theme === 'dark' ? 'theme-toggle__option--active' : ''}`}
            onClick={() => handleThemeSelect('dark')}
          >
            <Moon size={16} />
            <span>Ciemny</span>
          </button>
          
          <button
            className={`theme-toggle__option ${theme === 'auto' ? 'theme-toggle__option--active' : ''}`}
            onClick={() => handleThemeSelect('auto')}
          >
            <Monitor size={16} />
            <span>Auto</span>
          </button>
        </div>
      )}
    </div>
  );
};
