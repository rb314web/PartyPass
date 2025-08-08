// components/common/Header/Header.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import './Header.scss';

// TypeScript declaration for Google Analytics
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, any>) => void;
  }
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Memoized navigation items
  const navigationItems = useMemo(() => [
    { label: 'Funkcje', href: '#features' },
    { label: 'Cennik', href: '#pricing' },
    { label: 'Kontakt', href: '/contact' }
  ], []);

  // Handle scroll effect with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.header')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Secure anchor click handler with validation
  const handleAnchorClick = useCallback((href: string) => {
    if (href.startsWith('#')) {
      const id = href.slice(1);
      // Validate ID to prevent XSS
      if (/^[a-zA-Z0-9-_]+$/.test(id)) {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
          
          // Analytics tracking
          if (window.gtag) {
            window.gtag('event', 'navigation_click', {
              'navigation_item': id,
              'navigation_type': 'anchor'
            });
          }
        }
      }
    } else {
      // External navigation
      if (window.gtag) {
        window.gtag('event', 'navigation_click', {
          'navigation_item': href,
          'navigation_type': 'external'
        });
      }
    }
    setIsMenuOpen(false);
  }, []);

  // Memoized auth handler
  const handleAuth = useCallback((action: 'login' | 'register' | 'logout' | 'dashboard') => {
    // Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'auth_action', {
        'action_type': action,
        'user_status': user ? 'logged_in' : 'logged_out'
      });
    }

    switch (action) {
      case 'login':
        navigate('/login');
        break;
      case 'register':
        navigate('/register');
        break;
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'logout':
        logout();
        navigate('/');
        break;
    }
    setIsMenuOpen(false);
  }, [navigate, logout, user]);

  // Memoized toggle handler
  const handleToggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    
    // Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'menu_toggle', {
        'menu_state': !isMenuOpen ? 'opened' : 'closed'
      });
    }
  }, [isMenuOpen]);

  // Memoized navigation click handler
  const handleNavClick = useCallback((item: typeof navigationItems[0]) => {
    if (item.href.startsWith('#')) {
      handleAnchorClick(item.href);
    } else {
      navigate(item.href);
    }
    
    // Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'navigation_click', {
        'navigation_item': item.label,
        'navigation_href': item.href
      });
    }
  }, [handleAnchorClick, navigate]);

  return (
    <header 
      className={`header ${isScrolled ? 'header--scrolled' : ''} ${location.pathname === '/login' || location.pathname === '/register' ? 'header--fullwidth' : ''}`}
      role="banner"
    >
      <div className="header__container">
        {/* Logo */}
        <Link 
          to="/" 
          className="header__logo"
          aria-label="Przejdź do strony głównej PartyPass"
        >
          <span className="header__logo-icon" aria-hidden="true">🎉</span>
          <span className="header__logo-text">PartyPass</span>
        </Link>

        {/* Desktop Navigation */}
        <nav 
          className="header__nav" 
          role="navigation" 
          aria-label="Główne menu nawigacyjne"
        >
          {navigationItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className="header__nav-link"
              aria-label={`Przejdź do sekcji ${item.label}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="header__actions" role="group" aria-label="Akcje użytkownika">
          {user ? (
            <div className="header__user">
              <button
                onClick={() => handleAuth('dashboard')}
                className="header__user-btn"
                aria-label={`Przejdź do dashboardu użytkownika ${user.firstName}`}
              >
                <div className="header__avatar" aria-hidden="true">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <span className="header__user-name">{user.firstName}</span>
              </button>
              <button
                onClick={() => handleAuth('logout')}
                className="header__logout-btn"
                aria-label="Wyloguj się z konta"
                title="Wyloguj"
              >
                <LogOut size={18} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="header__auth">
              <button
                onClick={() => handleAuth('login')}
                className="header__login-btn"
                aria-label="Zaloguj się do konta"
              >
                Zaloguj
              </button>
              <button
                onClick={() => handleAuth('register')}
                className="header__signup-btn"
                aria-label="Zarejestruj nowe konto"
              >
                Rozpocznij
              </button>
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            className="header__toggle"
            onClick={handleToggleMenu}
            aria-label={isMenuOpen ? "Zamknij menu nawigacyjne" : "Otwórz menu nawigacyjne"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-haspopup="true"
          >
            {isMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          className="header__mobile"
          id="mobile-menu"
          role="navigation"
          aria-label="Menu mobilne"
        >
          <nav className="header__mobile-nav">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className="header__mobile-link"
                aria-label={`Przejdź do sekcji ${item.label}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="header__mobile-actions">
            {user ? (
              <>
                <button
                  onClick={() => handleAuth('dashboard')}
                  className="header__mobile-btn header__mobile-btn--primary"
                  aria-label={`Przejdź do dashboardu użytkownika ${user.firstName}`}
                >
                  <User size={20} aria-hidden="true" />
                  Dashboard
                </button>
                <button
                  onClick={() => handleAuth('logout')}
                  className="header__mobile-btn"
                  aria-label="Wyloguj się z konta"
                >
                  <LogOut size={20} aria-hidden="true" />
                  Wyloguj
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleAuth('login')}
                  className="header__mobile-btn"
                  aria-label="Zaloguj się do konta"
                >
                  Zaloguj się
                </button>
                <button
                  onClick={() => handleAuth('register')}
                  className="header__mobile-btn header__mobile-btn--primary"
                  aria-label="Zarejestruj nowe konto"
                >
                  Rozpocznij za darmo
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;