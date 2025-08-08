// components/dashboard/Header/Header.tsx
import React from 'react';
import { Bell, Search, Plus } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import './Header.scss';

const Header: React.FC = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dzień dobry';
    if (hour < 18) return 'Dzień dobry';
    return 'Dobry wieczór';
  };

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__greeting">
          {getGreeting()}, {user?.firstName}! 👋
        </h1>
        <p className="header__subtitle">
          Sprawdź swoje nadchodzące wydarzenia i zaplanuj kolejne
        </p>
      </div>

      <div className="header__right">
        <div className="header__search">
          <Search size={20} className="header__search-icon" />
          <input 
            type="text" 
            placeholder="Szukaj wydarzeń..."
            className="header__search-input"
          />
        </div>

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