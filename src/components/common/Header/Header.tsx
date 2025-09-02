// components/common/Header/Header.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Search,
  Bell,
  Command,
  Sparkles,
  ArrowRight,
  Globe,
  Zap,
  Shield,
  ChevronDown,
  UserPlus,
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import './Header.scss';

// TypeScript declaration for Google Analytics
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, any>) => void;
  }
}

interface HeaderProps {
  variant?: 'landing' | 'auth' | 'app';
}

const Header: React.FC<HeaderProps> = ({ variant = 'landing' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState([
    { id: 1, title: 'Nowe wydarzenie', message: 'Impreza urodzinowa jutro', read: false },
    { id: 2, title: 'RSVP otrzymane', message: '5 nowych odpowiedzi', read: false },
    { id: 3, title: 'Przypomnienie', message: 'Sprawdź listę gości', read: true }
  ]);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced navigation items with icons and descriptions
  const navigationItems = useMemo(() => [
    { 
      label: 'Funkcje', 
      href: '#features',
      icon: <Zap size={16} />,
      description: 'Poznaj możliwości PartyPass'
    },
    { 
      label: 'Cennik', 
      href: '#pricing',
      icon: <Sparkles size={16} />,
      description: 'Wybierz plan dla siebie'
    },
    { 
      label: 'Bezpieczeństwo', 
      href: '#security',
      icon: <Shield size={16} />,
      description: 'Twoje dane są chronione'
    },
    { 
      label: 'Kontakt', 
      href: '/contact',
      icon: <MessageCircle size={16} />,
      description: 'Skontaktuj się z nami'
    }
  ], []);

  // Quick actions for authenticated users
  const quickActions = useMemo(() => [
    { label: 'Nowe wydarzenie', href: '/dashboard/events/create', icon: <Sparkles size={16} /> },
    { label: 'Dodaj kontakt', href: '/dashboard/contacts/add', icon: <UserPlus size={16} /> },
    { label: 'Analityka', href: '/dashboard/analytics', icon: <Globe size={16} /> }
  ], []);

  // Scroll effect disabled for landing page
  useEffect(() => {
    // No scroll effects for landing page
    if (variant === 'landing') {
      return;
    }

    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setIsScrolled(scrollY > 20);
          
          // Progressive blur effect only for non-landing variants
          const header = document.querySelector('.header') as HTMLElement;
          if (header && scrollY > 0) {
            const blurAmount = Math.min(scrollY / 100, 1);
            header.style.setProperty('--scroll-blur', `${blurAmount * 20}px`);
            header.style.setProperty('--scroll-opacity', `${0.85 + blurAmount * 0.15}`);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [variant]);

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (!target.closest('.header')) {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    if (isMenuOpen || isSearchOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isSearchOpen, isUserMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      
      // Escape to close all menus
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Enhanced navigation with search support
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
        'navigation_href': item.href,
        'navigation_source': 'header'
      });
    }
  }, [handleAnchorClick, navigate]);

  // Enhanced search functionality
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    // Navigate to search results or dashboard with query
    if (user) {
      navigate(`/dashboard/search?q=${encodeURIComponent(query)}`);
    } else {
      // For non-authenticated users, search in landing page
      const sections = ['features', 'pricing', 'contact'];
      const match = sections.find(section => 
        section.toLowerCase().includes(query.toLowerCase())
      );
      
      if (match) {
        handleAnchorClick(`#${match}`);
      }
    }
    
    setIsSearchOpen(false);
    setSearchQuery('');
    
    // Analytics
    if (window.gtag) {
      window.gtag('event', 'search', {
        'search_term': query,
        'search_location': 'header'
      });
    }
  }, [user, navigate, handleAnchorClick]);

  // Command palette functionality
  const handleCommandPalette = useCallback(() => {
    setIsSearchOpen(true);
    
    // Focus search input after animation
    setTimeout(() => {
      const searchInput = document.querySelector('.header__search-input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  }, []);

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header 
      className={`header header--${variant} ${(variant !== 'landing' && isScrolled) ? 'header--scrolled' : ''} ${location.pathname === '/login' || location.pathname === '/register' ? 'header--fullwidth' : ''}`}
      role="banner"
      style={{
        '--scroll-blur': '0px',
        '--scroll-opacity': '1',
        position: 'sticky',
        top: '0',
        zIndex: 99999
      } as React.CSSProperties}
    >
      <div className="header__container">
        {/* Enhanced Logo with animation */}
        <Link 
          to="/" 
          className="header__logo"
          aria-label="Przejdź do strony głównej PartyPass"
        >
          <div className="header__logo-icon" aria-hidden="true">
            <span className="header__logo-emoji">🎉</span>
            <div className="header__logo-shine"></div>
          </div>
          <span className="header__logo-text">
            <span className="header__logo-text-main">Party</span>
            <span className="header__logo-text-accent">Pass</span>
          </span>
        </Link>

        {/* Enhanced Desktop Navigation */}
        <nav 
          className="header__nav" 
          role="navigation" 
          aria-label="Główne menu nawigacyjne"
        >
          {navigationItems.map((item) => (
            <div key={item.label} className="header__nav-item">
              <button
                onClick={() => handleNavClick(item)}
                className="header__nav-link"
                aria-label={item.description}
                title={item.description}
              >
                <span className="header__nav-icon">{item.icon}</span>
                <span className="header__nav-label">{item.label}</span>
              </button>
            </div>
          ))}
        </nav>

        {/* Enhanced Actions Section */}
        <div className="header__actions" role="group" aria-label="Akcje użytkownika">
          
          {/* Command Palette / Search */}
          <div className="header__search-container">
            <button
              onClick={handleCommandPalette}
              className="header__search-trigger"
              aria-label="Otwórz wyszukiwanie (Ctrl+K)"
              title="Wyszukaj (Ctrl+K)"
            >
              <Command size={18} />
              <span className="header__search-hint">Szukaj...</span>
              <kbd className="header__search-kbd">⌘K</kbd>
            </button>
            
            {/* Expanded Search */}
            {isSearchOpen && (
              <div className="header__search-expanded">
                <div className="header__search-box">
                  <Search size={20} className="header__search-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchQuery);
                      }
                    }}
                    placeholder="Szukaj wydarzeń, kontaktów, funkcji..."
                    className="header__search-input"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearch(searchQuery)}
                      className="header__search-submit"
                      aria-label="Wyszukaj"
                    >
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
                
                {/* Quick actions for authenticated users */}
                {user && (
                  <div className="header__quick-actions">
                    <div className="header__quick-actions-label">Szybkie akcje</div>
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => {
                          navigate(action.href);
                          setIsSearchOpen(false);
                        }}
                        className="header__quick-action"
                      >
                        {action.icon}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications for authenticated users */}
          {user && (
            <div className="header__notifications">
              <button
                className="header__notifications-trigger"
                aria-label={`Powiadomienia (${unreadCount} nieprzeczytanych)`}
                title="Powiadomienia"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="header__notifications-badge">{unreadCount}</span>
                )}
              </button>
            </div>
          )}

          {/* User Authentication */}
          {user ? (
            <div className="header__user">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="header__user-trigger"
                aria-label={`Menu użytkownika ${user.firstName}`}
                aria-expanded={isUserMenuOpen}
              >
                <div className="header__avatar" aria-hidden="true">
                  {user.avatar ? (
                    <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                  ) : (
                    <span>{user.firstName[0]}{user.lastName[0]}</span>
                  )}
                </div>
                <div className="header__user-info">
                  <span className="header__user-name">{user.firstName}</span>
                  <span className="header__user-plan">{user.planType || 'Free'}</span>
                </div>
                <ChevronDown size={16} className={`header__user-chevron ${isUserMenuOpen ? 'header__user-chevron--open' : ''}`} />
              </button>
              
              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="header__user-menu">
                  <div className="header__user-menu-header">
                    <div className="header__user-menu-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                      ) : (
                        <span>{user.firstName[0]}{user.lastName[0]}</span>
                      )}
                    </div>
                    <div className="header__user-menu-info">
                      <div className="header__user-menu-name">{user.firstName} {user.lastName}</div>
                      <div className="header__user-menu-email">{user.email}</div>
                    </div>
                  </div>
                  
                  <div className="header__user-menu-section">
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="header__user-menu-item"
                    >
                      <User size={16} />
                      <span>Dashboard</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/dashboard/settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="header__user-menu-item"
                    >
                      <User size={16} />
                      <span>Ustawienia</span>
                    </button>
                  </div>
                  
                  <div className="header__user-menu-section">
                    <button
                      onClick={() => {
                        handleAuth('logout');
                        setIsUserMenuOpen(false);
                      }}
                      className="header__user-menu-item header__user-menu-item--danger"
                    >
                      <LogOut size={16} />
                      <span>Wyloguj</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="header__auth">
              <button
                onClick={() => handleAuth('login')}
                className="header__login-btn"
                aria-label="Zaloguj się do konta"
              >
                <User size={16} />
                <span>Zaloguj</span>
              </button>
              <button
                onClick={() => handleAuth('register')}
                className="header__signup-btn"
                aria-label="Zarejestruj nowe konto"
              >
                <Sparkles size={16} />
                <span>Rozpocznij za darmo</span>
                <ArrowRight size={16} />
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
            <span className={`header__toggle-line ${isMenuOpen ? 'header__toggle-line--active' : ''}`}></span>
            <span className={`header__toggle-line ${isMenuOpen ? 'header__toggle-line--active' : ''}`}></span>
            <span className={`header__toggle-line ${isMenuOpen ? 'header__toggle-line--active' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMenuOpen && (
        <div className="header__mobile-overlay">
          <div 
            className="header__mobile"
            id="mobile-menu"
            role="navigation"
            aria-label="Menu mobilne"
          >
            {/* Mobile Header */}
            <div className="header__mobile-header">
              <div className="header__mobile-logo">
                <span className="header__logo-emoji">🎉</span>
                <span>PartyPass</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="header__mobile-close"
                aria-label="Zamknij menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="header__mobile-search">
              <div className="header__mobile-search-box">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Szukaj..."
                  className="header__mobile-search-input"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="header__mobile-nav">
              <div className="header__mobile-nav-section">
                <div className="header__mobile-nav-title">Nawigacja</div>
                {navigationItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item)}
                    className="header__mobile-nav-link"
                    aria-label={item.description}
                  >
                    <span className="header__mobile-nav-icon">{item.icon}</span>
                    <div className="header__mobile-nav-content">
                      <span className="header__mobile-nav-label">{item.label}</span>
                      <span className="header__mobile-nav-desc">{item.description}</span>
                    </div>
                    <ArrowRight size={16} className="header__mobile-nav-arrow" />
                  </button>
                ))}
              </div>

              {/* Quick actions for authenticated users */}
              {user && (
                <div className="header__mobile-nav-section">
                  <div className="header__mobile-nav-title">Szybkie akcje</div>
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => {
                        navigate(action.href);
                        setIsMenuOpen(false);
                      }}
                      className="header__mobile-nav-link"
                    >
                      <span className="header__mobile-nav-icon">{action.icon}</span>
                      <div className="header__mobile-nav-content">
                        <span className="header__mobile-nav-label">{action.label}</span>
                      </div>
                      <ArrowRight size={16} className="header__mobile-nav-arrow" />
                    </button>
                  ))}
                </div>
              )}
            </nav>

            {/* Mobile Actions */}
            <div className="header__mobile-actions">
              {user ? (
                <div className="header__mobile-user">
                  <div className="header__mobile-user-info">
                    <div className="header__mobile-user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                      ) : (
                        <span>{user.firstName[0]}{user.lastName[0]}</span>
                      )}
                    </div>
                    <div className="header__mobile-user-details">
                      <div className="header__mobile-user-name">{user.firstName} {user.lastName}</div>
                      <div className="header__mobile-user-email">{user.email}</div>
                      <div className="header__mobile-user-plan">Plan: {user.planType || 'Free'}</div>
                    </div>
                  </div>
                  
                  <div className="header__mobile-user-actions">
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMenuOpen(false);
                      }}
                      className="header__mobile-btn header__mobile-btn--primary"
                      aria-label={`Przejdź do dashboardu użytkownika ${user.firstName}`}
                    >
                      <User size={20} aria-hidden="true" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        handleAuth('logout');
                        setIsMenuOpen(false);
                      }}
                      className="header__mobile-btn header__mobile-btn--danger"
                      aria-label="Wyloguj się z konta"
                    >
                      <LogOut size={20} aria-hidden="true" />
                      Wyloguj
                    </button>
                  </div>
                </div>
              ) : (
                <div className="header__mobile-auth">
                  <button
                    onClick={() => handleAuth('login')}
                    className="header__mobile-btn header__mobile-btn--secondary"
                    aria-label="Zaloguj się do konta"
                  >
                    <User size={20} />
                    Zaloguj się
                  </button>
                  <button
                    onClick={() => handleAuth('register')}
                    className="header__mobile-btn header__mobile-btn--primary"
                    aria-label="Zarejestruj nowe konto"
                  >
                    <Sparkles size={20} />
                    Rozpocznij za darmo
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Footer */}
            <div className="header__mobile-footer">
              <div className="header__mobile-contact">
                <a href="mailto:hello@partypass.app" className="header__mobile-contact-item">
                  <Mail size={16} />
                  <span>hello@partypass.app</span>
                </a>
                <a href="tel:+48123456789" className="header__mobile-contact-item">
                  <Phone size={16} />
                  <span>+48 123 456 789</span>
                </a>
              </div>
              <div className="header__mobile-version">
                PartyPass v2.1.0
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="header__search-overlay" onClick={() => setIsSearchOpen(false)} />
      )}
    </header>
  );
};

export default Header;