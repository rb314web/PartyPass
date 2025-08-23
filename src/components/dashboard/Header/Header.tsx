// components/dashboard/Header/Header.tsx
import React, { useState, useEffect } from 'react';
import { Bell, Search, Plus, Menu } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import NavigationButtons from '../../common/NavigationButtons/NavigationButtons';
import { ThemeToggle } from '../../common/ThemeToggle/ThemeToggle';
import './Header.scss';

interface HeaderProps {
  onMobileToggle?: () => void;
  isMobileOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMobileToggle, isMobileOpen = false }) => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check on mount
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dzień dobry';
    if (hour < 18) return 'Dzień dobry';
    return 'Dobry wieczór';
  };

  return (
    <header className="header">
      {isMobile && (
        <button 
          className="header__mobile-toggle"
          onClick={onMobileToggle}
          aria-label={isMobileOpen ? "Zamknij menu nawigacyjne" : "Otwórz menu nawigacyjne"}
          aria-expanded={isMobileOpen}
          aria-controls="sidebar"
        >
          <Menu size={24} />
        </button>
      )}
      
      <div className="header__left">
        <h1 className="header__greeting">
          {getGreeting()}, {user?.firstName}! 👋
        </h1>
        <p className="header__subtitle">
          Sprawdź swoje nadchodzące wydarzenia i zaplanuj kolejne
        </p>
      </div>

      <div className="header__right">
        <NavigationButtons className="header__nav-buttons" />
        
        <div className="header__search">
          <Search size={20} className="header__search-icon" />
          <input 
            type="text" 
            placeholder="Szukaj wydarzeń..."
            className="header__search-input"
          />
        </div>

        <ThemeToggle />

        <button className="header__notifications">
          <Bell size={20} />
          <span className="header__notifications-badge">3</span>
        </button>

        <button className="header__cta">
          <Plus size={20} />
          <span>Nowe wydarzenie</span>
        </button>
      </div>
    </header>
  );
};

export default Header;