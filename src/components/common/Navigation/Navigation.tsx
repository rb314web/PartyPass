// components/common/Navigation/Navigation.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  Home,
  Calendar,
  Users,
  BarChart3,
  CreditCard,
  Bell,
  Search,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Mail,
  Phone,
  MessageCircle,
  Zap
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import './Navigation.scss';

interface NavigationProps {
  variant?: 'landing' | 'dashboard' | 'auth';
}

const Navigation: React.FC<NavigationProps> = ({ variant = 'landing' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items based on variant
  const getNavigationItems = () => {
    switch (variant) {
      case 'landing':
        return [
          { label: 'Home', href: '#hero', icon: <Home size={18} /> },
          { label: 'Funkcje', href: '#features', icon: <Zap size={18} /> },
          { label: 'Cennik', href: '#pricing', icon: <CreditCard size={18} /> },
          { label: 'Kontakt', href: '#contact', icon: <MessageCircle size={18} /> }
        ];
      case 'dashboard':
        return [
          { label: 'Dashboard', href: '/dashboard', icon: <Home size={18} /> },
          { label: 'Wydarzenia', href: '/dashboard/events', icon: <Calendar size={18} /> },
          { label: 'Goście', href: '/dashboard/guests', icon: <Users size={18} /> },
          { label: 'Analityka', href: '/dashboard/analytics', icon: <BarChart3 size={18} /> },
          { label: 'Ustawienia', href: '/dashboard/settings', icon: <Settings size={18} /> }
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  // Mock notifications
  const notifications = [
    { id: 1, title: 'Nowe wydarzenie', message: 'Impreza urodzinowa jutro', read: false, time: '2 min temu' },
    { id: 2, title: 'RSVP otrzymane', message: '5 nowych odpowiedzi', read: false, time: '1 godz. temu' },
    { id: 3, title: 'Przypomnienie', message: 'Sprawdź listę gości', read: true, time: '3 godz. temu' }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.navigation')) {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle navigation
  const handleNavigation = useCallback((href: string) => {
    if (href.startsWith('#')) {
      // Scroll to section
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
    setIsMenuOpen(false);
  }, [navigate]);

  // Handle authentication
  const handleAuth = useCallback((action: 'login' | 'register' | 'logout') => {
    switch (action) {
      case 'login':
        navigate('/login');
        break;
      case 'register':
        navigate('/register');
        break;
      case 'logout':
        logout();
        navigate('/');
        break;
    }
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [navigate, logout]);

  return (
    <nav className={`navigation navigation--${variant}`} role="navigation">
      <div className="navigation__container">
        
        {/* Logo */}
        <Link to="/" className="navigation__logo">
          <div className="navigation__logo-icon">
            <span className="navigation__logo-emoji">🎉</span>
          </div>
          <span className="navigation__logo-text">
            <span className="navigation__logo-main">Party</span>
            <span className="navigation__logo-accent">Pass</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navigation__menu">
          {navigationItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.href)}
              className={`navigation__link ${location.pathname === item.href ? 'navigation__link--active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="navigation__actions">
          
          {/* Search (Dashboard only) */}
          {variant === 'dashboard' && (
            <div className="navigation__search">
              <div className="navigation__search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Szukaj..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Notifications (Dashboard only) */}
          {variant === 'dashboard' && user && (
            <div className="navigation__notifications">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="navigation__notifications-trigger"
                aria-label={`${unreadCount} nieprzeczytanych powiadomień`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="navigation__notifications-badge">{unreadCount}</span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className="navigation__notifications-dropdown">
                  <div className="navigation__notifications-header">
                    <h3>Powiadomienia</h3>
                    <span className="navigation__notifications-count">{unreadCount} nowych</span>
                  </div>
                  
                  <div className="navigation__notifications-list">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`navigation__notification ${!notification.read ? 'navigation__notification--unread' : ''}`}
                      >
                        <div className="navigation__notification-content">
                          <div className="navigation__notification-title">{notification.title}</div>
                          <div className="navigation__notification-message">{notification.message}</div>
                          <div className="navigation__notification-time">{notification.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="navigation__notifications-footer">
                    <button className="navigation__notifications-view-all">
                      Zobacz wszystkie
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu or Auth Buttons */}
          {user ? (
            <div className="navigation__user">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="navigation__user-trigger"
              >
                <div className="navigation__avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                  ) : (
                    <span>{user.firstName[0]}{user.lastName[0]}</span>
                  )}
                </div>
                <div className="navigation__user-info">
                  <span className="navigation__user-name">{user.firstName}</span>
                  <span className="navigation__user-plan">{user.planType || 'Free'}</span>
                </div>
                <ChevronDown size={16} className={`navigation__user-chevron ${isUserMenuOpen ? 'navigation__user-chevron--open' : ''}`} />
              </button>
              
              {isUserMenuOpen && (
                <div className="navigation__user-dropdown">
                  <div className="navigation__user-dropdown-header">
                    <div className="navigation__user-dropdown-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                      ) : (
                        <span>{user.firstName[0]}{user.lastName[0]}</span>
                      )}
                    </div>
                    <div className="navigation__user-dropdown-info">
                      <div className="navigation__user-dropdown-name">{user.firstName} {user.lastName}</div>
                      <div className="navigation__user-dropdown-email">{user.email}</div>
                    </div>
                  </div>
                  
                  <div className="navigation__user-dropdown-menu">
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="navigation__user-dropdown-item"
                    >
                      <Home size={16} />
                      <span>Dashboard</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/dashboard/settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="navigation__user-dropdown-item"
                    >
                      <Settings size={16} />
                      <span>Ustawienia</span>
                    </button>
                    
                    <div className="navigation__user-dropdown-divider"></div>
                    
                    <button
                      onClick={() => handleAuth('logout')}
                      className="navigation__user-dropdown-item navigation__user-dropdown-item--danger"
                    >
                      <LogOut size={16} />
                      <span>Wyloguj</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="navigation__auth">
              <button
                onClick={() => handleAuth('login')}
                className="navigation__auth-login"
              >
                <User size={16} />
                <span>Zaloguj</span>
              </button>
              <button
                onClick={() => handleAuth('register')}
                className="navigation__auth-register"
              >
                <Sparkles size={16} />
                <span>Rozpocznij</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="navigation__mobile-toggle"
            aria-label={isMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="navigation__mobile-overlay">
          <div className="navigation__mobile-menu">
            
            {/* Mobile Header */}
            <div className="navigation__mobile-header">
              <div className="navigation__mobile-logo">
                <span className="navigation__logo-emoji">🎉</span>
                <span>PartyPass</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="navigation__mobile-close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile Search */}
            {variant === 'dashboard' && (
              <div className="navigation__mobile-search">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Szukaj..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {/* Mobile Navigation */}
            <div className="navigation__mobile-nav">
              {navigationItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.href)}
                  className={`navigation__mobile-link ${location.pathname === item.href ? 'navigation__mobile-link--active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>

            {/* Mobile User Section */}
            {user ? (
              <div className="navigation__mobile-user">
                <div className="navigation__mobile-user-info">
                  <div className="navigation__mobile-user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                    ) : (
                      <span>{user.firstName[0]}{user.lastName[0]}</span>
                    )}
                  </div>
                  <div className="navigation__mobile-user-details">
                    <div className="navigation__mobile-user-name">{user.firstName} {user.lastName}</div>
                    <div className="navigation__mobile-user-email">{user.email}</div>
                    <div className="navigation__mobile-user-plan">Plan: {user.planType || 'Free'}</div>
                  </div>
                </div>
                
                <div className="navigation__mobile-user-actions">
                  <button
                    onClick={() => {
                      navigate('/dashboard/settings');
                      setIsMenuOpen(false);
                    }}
                    className="navigation__mobile-btn navigation__mobile-btn--secondary"
                  >
                    <Settings size={20} />
                    Ustawienia
                  </button>
                  <button
                    onClick={() => handleAuth('logout')}
                    className="navigation__mobile-btn navigation__mobile-btn--danger"
                  >
                    <LogOut size={20} />
                    Wyloguj
                  </button>
                </div>
              </div>
            ) : (
              <div className="navigation__mobile-auth">
                <button
                  onClick={() => handleAuth('login')}
                  className="navigation__mobile-btn navigation__mobile-btn--secondary"
                >
                  <User size={20} />
                  Zaloguj się
                </button>
                <button
                  onClick={() => handleAuth('register')}
                  className="navigation__mobile-btn navigation__mobile-btn--primary"
                >
                  <Sparkles size={20} />
                  Rozpocznij za darmo
                  <ArrowRight size={20} />
                </button>
              </div>
            )}

            {/* Mobile Footer */}
            <div className="navigation__mobile-footer">
              <div className="navigation__mobile-contact">
                <a href="mailto:hello@partypass.app" className="navigation__mobile-contact-item">
                  <Mail size={16} />
                  <span>hello@partypass.app</span>
                </a>
                <a href="tel:+48123456789" className="navigation__mobile-contact-item">
                  <Phone size={16} />
                  <span>+48 123 456 789</span>
                </a>
              </div>
              <div className="navigation__mobile-version">
                PartyPass v2.1.0
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
