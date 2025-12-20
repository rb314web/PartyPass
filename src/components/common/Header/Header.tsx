// components/common/Header/Header.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  User,
  LogOut,
  Sparkles,
  ArrowRight,
  Globe,
  Zap,
  ChevronDown,
  UserPlus,
  Mail,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import Logo from '../Logo/Logo';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import './Header.scss';

// TypeScript declaration for Google Analytics
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params: Record<string, any>
    ) => void;
  }
}

interface HeaderProps {
  variant?: 'landing' | 'auth' | 'app';
}

const Header: React.FC<HeaderProps> = ({ variant = 'landing' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [isPortalReady, setIsPortalReady] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuId = 'header-user-menu';
  const mobileMenuId = 'mobile-menu';
  const mobileMenuHeadingId = 'mobile-menu-heading';

  // Enhanced navigation items with icons and descriptions
  const navigationItems = useMemo(
    () => [
      {
        label: 'Funkcje',
        href: '#features',
        icon: <Zap size={16} aria-hidden="true" focusable="false" />,
        description: 'Poznaj możliwości PartyPass',
      },
      {
        label: 'Cennik',
        href: '#pricing',
        icon: <Sparkles size={16} aria-hidden="true" focusable="false" />,
        description: 'Wybierz plan dla siebie',
      },
      {
        label: 'Kontakt',
        href: '#contact',
        icon: (
          <MessageCircle size={16} aria-hidden="true" focusable="false" />
        ),
        description: 'Skontaktuj się z nami',
      },
    ],
    []
  );

  // Quick actions for authenticated users
  const quickActions = useMemo(
    () => [
      {
        label: 'Nowe wydarzenie',
        href: '/dashboard/events/create',
        icon: <Sparkles size={16} aria-hidden="true" focusable="false" />,
      },
      {
        label: 'Dodaj kontakt',
        href: '/dashboard/contacts/add',
        icon: <UserPlus size={16} aria-hidden="true" focusable="false" />,
      },
      {
        label: 'Analityka',
        href: '/dashboard/analytics',
        icon: <Globe size={16} aria-hidden="true" focusable="false" />,
      },
    ],
    []
  );

  useEffect(() => {
    if (variant === 'landing') {
      setIsScrolled(false);
      if (headerRef.current) {
        headerRef.current.style.setProperty('--scroll-blur', '0px');
        headerRef.current.style.setProperty('--scroll-opacity', '1');
      }
      return;
    }

    const headerElement = headerRef.current;
    if (!headerElement) {
      return;
    }

    let ticking = false;

    const updateHeaderState = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      const blurAmount = Math.min(scrollY / 100, 1);
      headerElement.style.setProperty('--scroll-blur', `${blurAmount * 20}px`);
      headerElement.style.setProperty(
        '--scroll-opacity',
        `${0.85 + blurAmount * 0.15}`
      );
    };

    const handleScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      requestAnimationFrame(() => {
        updateHeaderState();
        ticking = false;
      });
    };

    updateHeaderState();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [variant]);

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (headerRef.current && !headerRef.current.contains(target)) {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    if (isMenuOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isUserMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setIsPortalReady(true);
  }, []);

  // Secure anchor click handler with validation
  const handleAnchorClick = useCallback(
    (href: string) => {
      if (href.startsWith('#')) {
        const id = href.slice(1);
        // Validate ID to prevent XSS
        if (/^[a-zA-Z0-9-_]+$/.test(id)) {
          const element = document.getElementById(id);
          if (element) {
            // Element exists on current page - scroll to it
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });

            // Analytics tracking
            if (window.gtag) {
              window.gtag('event', 'navigation_click', {
                navigation_item: id,
                navigation_type: 'anchor',
              });
            }
          } else {
            // Element doesn't exist - navigate to home page with hash
            navigate(`/${href}`);

            // After navigation, scroll to element
            setTimeout(() => {
              const targetElement = document.getElementById(id);
              if (targetElement) {
                targetElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }
            }, 100);
          }
        }
      } else {
        // External navigation
        if (window.gtag) {
          window.gtag('event', 'navigation_click', {
            navigation_item: href,
            navigation_type: 'external',
          });
        }
      }
      setIsMenuOpen(false);
    },
    [navigate]
  );

  // Memoized auth handler
  const handleAuth = useCallback(
    (action: 'login' | 'register' | 'logout' | 'dashboard') => {
      // Analytics tracking
      if (window.gtag) {
        window.gtag('event', 'auth_action', {
          action_type: action,
          user_status: user ? 'logged_in' : 'logged_out',
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
    },
    [navigate, logout, user]
  );

  // Memoized toggle handler
  const handleToggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);

    // Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'menu_toggle', {
        menu_state: !isMenuOpen ? 'opened' : 'closed',
      });
    }
  }, [isMenuOpen]);

  // Enhanced navigation with search support
  const handleNavClick = useCallback(
    (item: (typeof navigationItems)[0]) => {
      if (item.href.startsWith('#')) {
        handleAnchorClick(item.href);
      } else {
        navigate(item.href);
      }

      // Analytics tracking
      if (window.gtag) {
        window.gtag('event', 'navigation_click', {
          navigation_item: item.label,
          navigation_href: item.href,
          navigation_source: 'header',
        });
      }
    },
    [handleAnchorClick, navigate]
  );

  const isNavItemActive = useCallback(
    (href: string) => {
      if (href.startsWith('#')) {
        return location.hash === href;
      }
      return location.pathname === href;
    },
    [location.hash, location.pathname]
  );

  return (
    <header
      ref={headerRef}
      className={`header header--${variant} ${
        variant !== 'landing' && isScrolled ? 'header--scrolled' : ''
      } ${
        location.pathname === '/login' || location.pathname === '/register'
          ? 'header--fullwidth'
          : ''
      }`}
      role="banner"
    >
      <div className="header__container">
        {/* Logo Component */}
        <Logo size="medium" href="/" />

        {/* Enhanced Desktop Navigation */}
        <nav
          className="header__nav"
          role="navigation"
          aria-label="Główne menu nawigacyjne"
        >
          {navigationItems.map(item => {
            const isActive = isNavItemActive(item.href);
            return (
              <div key={item.label} className="header__nav-item">
                <a
                  href={item.href}
                  onClick={event => {
                    event.preventDefault();
                    handleNavClick(item);
                  }}
                  className={`header__nav-link ${
                    isActive ? 'header__nav-link--active' : ''
                  }`}
                  aria-label={item.description}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="header__nav-icon">{item.icon}</span>
                  <span className="header__nav-label">{item.label}</span>
                </a>
              </div>
            );
          })}
        </nav>

        {/* Enhanced Actions Section */}
        <div
          className="header__actions"
          role="group"
          aria-label="Akcje użytkownika"
        >
          {/* Theme Toggle */}
          <ThemeToggle className="header__theme-toggle" />

          {/* User Authentication */}
          {user ? (
            <div className="header__user">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="header__user-trigger"
                aria-label={`Menu użytkownika ${user.firstName}`}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                aria-controls={userMenuId}
              >
                <div className="header__avatar" aria-hidden="true">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                  ) : (
                    <span>
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="header__user-info">
                  <span className="header__user-name">{user.firstName}</span>
                  <span className="header__user-plan">
                    {user.planType || 'Free'}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  focusable="false"
                  className={`header__user-chevron ${isUserMenuOpen ? 'header__user-chevron--open' : ''}`}
                />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  className="header__user-menu"
                  id={userMenuId}
                  role="menu"
                  aria-label="Menu użytkownika"
                >
                  <div className="header__user-menu-header">
                    <div className="header__user-menu-avatar">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                      ) : (
                        <span>
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div className="header__user-menu-info">
                      <div className="header__user-menu-name">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="header__user-menu-email">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="header__user-menu-section">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="header__user-menu-item"
                      role="menuitem"
                    >
                      <User size={16} aria-hidden="true" focusable="false" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate('/dashboard/settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="header__user-menu-item"
                      role="menuitem"
                    >
                      <User size={16} aria-hidden="true" focusable="false" />
                      <span>Ustawienia</span>
                    </button>
                  </div>

                  <div className="header__user-menu-section">
                    <button
                      type="button"
                      onClick={() => {
                        handleAuth('logout');
                        setIsUserMenuOpen(false);
                      }}
                      className="header__user-menu-item header__user-menu-item--danger"
                      role="menuitem"
                    >
                      <LogOut size={16} aria-hidden="true" focusable="false" />
                      <span>Wyloguj</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="header__auth">
              <button
                type="button"
                onClick={() => handleAuth('login')}
                className="header__login-btn"
                aria-label="Zaloguj się do konta"
              >
                <User size={16} aria-hidden="true" focusable="false" />
                <span>Zaloguj</span>
              </button>
              <button
                type="button"
                onClick={() => handleAuth('register')}
                className="header__signup-btn"
                aria-label="Zarejestruj nowe konto"
              >
                <span>Rozpocznij</span>
              </button>
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            type="button"
            className="header__toggle"
            onClick={handleToggleMenu}
            aria-label={
              isMenuOpen
                ? 'Zamknij menu nawigacyjne'
                : 'Otwórz menu nawigacyjne'
            }
            aria-expanded={isMenuOpen}
            aria-controls={mobileMenuId}
            aria-haspopup="true"
          >
            <span
              className={`header__toggle-line ${isMenuOpen ? 'header__toggle-line--active' : ''}`}
            ></span>
            <span
              className={`header__toggle-line ${isMenuOpen ? 'header__toggle-line--active' : ''}`}
            ></span>
            <span
              className={`header__toggle-line ${isMenuOpen ? 'header__toggle-line--active' : ''}`}
            ></span>
          </button>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMenuOpen &&
        isPortalReady &&
        createPortal(
          <div className="header__mobile-overlay">
            <div
              className="header__mobile"
              id={mobileMenuId}
              role="dialog"
              aria-modal="true"
              aria-label="Menu mobilne"
              aria-labelledby={mobileMenuHeadingId}
            >
            {/* Mobile Header */}
            <div className="header__mobile-header">
              <div
                className="header__mobile-logo"
                id={mobileMenuHeadingId}
              >
                <span className="header__logo-emoji">🎉</span>
                <span>PartyPass</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="header__mobile-close"
                aria-label="Zamknij menu"
              >
                <X size={24} aria-hidden="true" focusable="false" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav
              className="header__mobile-nav"
              role="navigation"
              aria-label="Nawigacja mobilna"
            >
              <div className="header__mobile-nav-section">
                <div className="header__mobile-nav-title">Nawigacja</div>
                {navigationItems.map(item => {
                  const isActive = isNavItemActive(item.href);
                  return (
                    <button
                      type="button"
                      key={item.label}
                      onClick={() => handleNavClick(item)}
                      className="header__mobile-nav-link"
                      aria-label={item.description}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="header__mobile-nav-icon">
                        {item.icon}
                      </span>
                      <div className="header__mobile-nav-content">
                        <span className="header__mobile-nav-label">
                          {item.label}
                        </span>
                        <span className="header__mobile-nav-desc">
                          {item.description}
                        </span>
                      </div>
                      <ArrowRight
                        size={16}
                        aria-hidden="true"
                        focusable="false"
                        className="header__mobile-nav-arrow"
                      />
                    </button>
                  );
                })}
              </div>

              {/* Quick actions for authenticated users */}
              {user && (
                <div className="header__mobile-nav-section">
                  <div className="header__mobile-nav-title">Szybkie akcje</div>
                  {quickActions.map(action => (
                    <button
                      type="button"
                      key={action.label}
                      onClick={() => {
                        navigate(action.href);
                        setIsMenuOpen(false);
                      }}
                      className="header__mobile-nav-link"
                    >
                      <span className="header__mobile-nav-icon">
                        {action.icon}
                      </span>
                      <div className="header__mobile-nav-content">
                        <span className="header__mobile-nav-label">
                          {action.label}
                        </span>
                      </div>
                      <ArrowRight
                        size={16}
                        aria-hidden="true"
                        focusable="false"
                        className="header__mobile-nav-arrow"
                      />
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
                        <img
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                      ) : (
                        <span>
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div className="header__mobile-user-details">
                      <div className="header__mobile-user-name">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="header__mobile-user-email">
                        {user.email}
                      </div>
                      <div className="header__mobile-user-plan">
                        Plan: {user.planType || 'Free'}
                      </div>
                    </div>
                  </div>

                  <div className="header__mobile-user-actions">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMenuOpen(false);
                      }}
                      className="header__mobile-btn header__mobile-btn--primary"
                      aria-label={`Przejdź do dashboardu użytkownika ${user.firstName}`}
                    >
                      <User
                        size={20}
                        aria-hidden="true"
                        focusable="false"
                      />
                      Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleAuth('logout');
                        setIsMenuOpen(false);
                      }}
                      className="header__mobile-btn header__mobile-btn--danger"
                      aria-label="Wyloguj się z konta"
                    >
                      <LogOut
                        size={20}
                        aria-hidden="true"
                        focusable="false"
                      />
                      Wyloguj
                    </button>
                  </div>
                </div>
              ) : (
                <div className="header__mobile-auth">
                  <button
                    type="button"
                    onClick={() => handleAuth('login')}
                    className="header__mobile-btn header__mobile-btn--secondary"
                    aria-label="Zaloguj się do konta"
                  >
                    <User
                      size={20}
                      aria-hidden="true"
                      focusable="false"
                    />
                    Zaloguj się
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAuth('register')}
                    className="header__mobile-btn header__mobile-btn--primary"
                    aria-label="Zarejestruj nowe konto"
                  >
                    <Sparkles
                      size={20}
                      aria-hidden="true"
                      focusable="false"
                    />
                    Rozpocznij za darmo
                    <ArrowRight
                      size={20}
                      aria-hidden="true"
                      focusable="false"
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Footer */}
            <div className="header__mobile-footer">
              <div className="header__mobile-contact">
                <a
                  href="mailto:hello@partypass.app"
                  className="header__mobile-contact-item"
                >
                  <Mail size={16} aria-hidden="true" focusable="false" />
                  <span>hello@partypass.app</span>
                </a>
                <a
                  href="tel:+48123456789"
                  className="header__mobile-contact-item"
                >
                  <Phone size={16} aria-hidden="true" focusable="false" />
                  <span>+48 123 456 789</span>
                </a>
              </div>
              <div className="header__mobile-version">PartyPass v2.1.0</div>
            </div>
          </div>
          </div>,
          document.body
        )}
    </header>
  );
};

export default Header;
