// components/common/UnifiedHeader/UnifiedHeader.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, Sun, Moon, Zap, Sparkles, MessageCircle, Home, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import Logo from '../Logo/Logo';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import NavigationLinks, { NavigationItem } from './components/NavigationLinks';
import './UnifiedHeader.scss';

// Animated hamburger menu icon component
const AnimatedMenuIcon: React.FC<{ isOpen: boolean; size?: number }> = ({ isOpen, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="unified-header__menu-icon"
  >
    <line
      x1="3"
      y1="6"
      x2="21"
      y2="6"
      className={`unified-header__menu-line ${isOpen ? 'unified-header__menu-line--top' : ''}`}
    />
    <line
      x1="3"
      y1="12"
      x2="21"
      y2="12"
      className={`unified-header__menu-line ${isOpen ? 'unified-header__menu-line--middle' : ''}`}
    />
    <line
      x1="3"
      y1="18"
      x2="21"
      y2="18"
      className={`unified-header__menu-line ${isOpen ? 'unified-header__menu-line--bottom' : ''}`}
    />
  </svg>
);

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

export interface UnifiedHeaderProps {
  /**
   * Header variant determines layout and available features:
   * - 'landing': Public landing page with navigation, auth buttons
   * - 'auth': Minimal header for login/register pages
   * - 'dashboard': Full-featured dashboard header with notifications, search, user menu
   */
  variant: 'landing' | 'auth' | 'dashboard';

  /**
   * Dashboard-specific: callback to toggle mobile sidebar
   */
  onMobileToggle?: () => void;

  /**
   * Dashboard-specific: current mobile sidebar state
   */
  isMobileOpen?: boolean;

  /**
   * Show/hide search functionality
   * @default true
   */
  showSearch?: boolean;

  /**
   * Show/hide notifications (dashboard only)
   * @default true for dashboard, false otherwise
   */
  showNotifications?: boolean;

  /**
   * Show/hide quick actions menu
   * @default true
   */
  showQuickActions?: boolean;

  /**
   * Enable scroll effects (blur, opacity)
   * @default false for landing, true for auth/dashboard
   */
  enableScrollEffects?: boolean;

  /**
   * Enable Google Analytics tracking
   * @default true
   */
  trackingEnabled?: boolean;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  variant,
  onMobileToggle,
  isMobileOpen = false,
  showSearch = true,
  showNotifications = variant === 'dashboard',
  showQuickActions = true,
  enableScrollEffects = variant !== 'landing',
  trackingEnabled = true,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which features to show based on variant
  const showNavigation = variant === 'landing';
  const showAuthButtons = variant === 'landing' || variant === 'auth';
  const showDashboardFeatures = variant === 'dashboard';
  const showMobileToggle = variant === 'dashboard';
  const showGreeting = variant === 'dashboard';

  // Responsive check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll effect with progressive blur
  useEffect(() => {
    if (!enableScrollEffects) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setIsScrolled(scrollY > 20);

          // Progressive blur effect
          const header = document.querySelector(
            '.unified-header'
          ) as HTMLElement;
          if (header && scrollY > 0) {
            const blurAmount = Math.min(scrollY / 100, 1);
            header.style.setProperty('--scroll-blur', `${blurAmount * 20}px`);
            header.style.setProperty(
              '--scroll-opacity',
              `${0.85 + blurAmount * 0.15}`
            );
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableScrollEffects]);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMenuOpen && isMobile) {
      // Prevent scrolling on body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100vh';

      // Additional iOS Safari fixes
      document.body.style.touchAction = 'none';
      document.body.style.overscrollBehavior = 'none';

      // Prevent scroll on html element too
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.touchAction = 'none';
      document.documentElement.style.overscrollBehavior = 'none';

      // Store original scroll position
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
    } else {
      // Restore scrolling
      const scrollY = document.body.style.top;
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);

      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }

    return () => {
      // Cleanup all scroll prevention
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
      document.body.style.height = 'unset';
      document.body.style.top = '';
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';

      document.documentElement.style.overflow = 'unset';
      document.documentElement.style.touchAction = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, [isMenuOpen, isMobile]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // #region agent log
  useEffect(() => {
    const runId = 'pre-fix';

    const log = (hypothesisId: string, message: string, data: Record<string, any>) => {
      fetch('http://127.0.0.1:7242/ingest/d559749e-a7d3-4292-bc30-349315ffb9b1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId,
          hypothesisId,
          location: 'UnifiedHeader.tsx:layout',
          message,
          data,
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    };

    const measure = () => {
      const header = document.querySelector('.unified-header__container') as HTMLElement | null;
      const hero = document.querySelector('.hero__container') as HTMLElement | null;

      log('H1', 'layout-measure', {
        variant,
        isMobile,
        isScrolled,
        windowWidth: window.innerWidth,
        headerWidth: header?.getBoundingClientRect().width ?? null,
        heroWidth: hero?.getBoundingClientRect().width ?? null,
        headerPadding: header
          ? window.getComputedStyle(header).padding
          : null,
        heroPadding: hero ? window.getComputedStyle(hero).padding : null,
      });
    };

    requestAnimationFrame(measure);
    const onResize = () => requestAnimationFrame(measure);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [variant, isMobile, isScrolled]);
  // #endregion

  // Analytics tracking helper
  const trackEvent = (action: string, params: Record<string, any>) => {
    if (trackingEnabled && window.gtag) {
      window.gtag('event', action, params);
    }
  };

  // Handle navigation item click
  const handleNavItemClick = (item: NavigationItem) => {
    if (item.href.startsWith('#')) {
      // Anchor link - scroll to section
      const id = item.href.slice(1);
      if (/^[a-zA-Z0-9-_]+$/.test(id)) {
        const element = document.getElementById(id);
        if (element) {
          // Element exists on current page - scroll to it
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        } else {
          // Element doesn't exist - navigate to home page with hash
          navigate(`/${item.href}`);

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
      // Regular navigation
      navigate(item.href);
    }

    // Track event
    trackEvent('navigation_click', {
      navigation_item: item.label,
      navigation_href: item.href,
      variant,
    });

    setIsMenuOpen(false);
  };

  // Toggle mobile menu
  const handleToggleMenu = () => {
    if (isMenuOpen) {
      // Start closing animation
      setIsMenuClosing(true);
      // Close menu after animation completes
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsMenuClosing(false);
      }, 300); // Match animation duration
    } else {
      // Open menu immediately
      setIsMenuOpen(true);
      setIsMenuClosing(false);
    }

    const newState = !isMenuOpen;
    trackEvent('menu_toggle', {
      menu_state: newState ? 'opened' : 'closed',
      variant,
    });
  };

  // Mobile menu refs & keyboard handling for accessibility
  const menuToggleRef = React.useRef<HTMLButtonElement | null>(null);
  const firstMenuItemRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isMenuOpen) return;
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Trap focus inside mobile menu when open
  useEffect(() => {
    if (!isMenuOpen || !isMobile) return;

    const el = menuRef.current;
    if (!el) return;

    const focusable = Array.from(
      el.querySelectorAll<HTMLElement>('a[href], button, [tabindex]:not([tabindex="-1"])')
    ).filter(Boolean);

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isMenuOpen, isMobile]);

  useEffect(() => {
    if (isMenuOpen && isMobile) {
      // focus first actionable element in the mobile menu
      setTimeout(() => firstMenuItemRef.current?.focus(), 50);
    }
  }, [isMenuOpen, isMobile]);

  // Get logo href based on variant
  const getLogoHref = () => {
    if (variant === 'dashboard') return '/dashboard';
    return '/';
  };

  // Get logo size based on variant
  const getLogoSize = (): 'small' | 'medium' | 'large' => {
    if (variant === 'dashboard') return 'medium';
    return 'medium';
  };

  // Get time-based greeting with icon
  const getGreeting = () => {
    if (!user) return { text: '', icon: null };
    const hour = new Date().getHours();
    if (hour < 12) {
      return { 
        text: `Dzień dobry, ${user.firstName}`, 
        icon: <Sun size={18} className="unified-header__greeting-icon" />
      };
    }
    if (hour < 18) {
      return { 
        text: `Dzień dobry, ${user.firstName}`, 
        icon: <Sun size={18} className="unified-header__greeting-icon" />
      };
    }
    return { 
      text: `Dobry wieczór, ${user.firstName}`, 
      icon: <Moon size={18} className="unified-header__greeting-icon" />
    };
  };

  // Handle search click - navigate to search page
  const handleSearchClick = useCallback(() => {
    navigate('/dashboard/search');
    if (trackingEnabled && window.gtag) {
      window.gtag('event', 'header_search_click', { variant });
    }
  }, [navigate, variant, trackingEnabled]);

  return (
    <>
      {/* Mobile Toggle for Dashboard (outside main header) */}
      {showMobileToggle && isMobile && (
        <button
          className="unified-header__mobile-toggle"
          onClick={onMobileToggle}
          aria-label={
            isMobileOpen
              ? 'Zamknij menu nawigacyjne'
              : 'Otwórz menu nawigacyjne'
          }
          aria-expanded={isMobileOpen}
          aria-controls="sidebar"
        >
          <Menu size={24} />
        </button>
      )}

      <header
        className={`
          unified-header 
          unified-header--${variant} 
          ${enableScrollEffects && isScrolled ? 'unified-header--scrolled' : ''}
          ${isMenuOpen ? 'unified-header--menu-open' : ''}
        `}
        role="banner"
        style={
          {
            '--scroll-blur': '0px',
            '--scroll-opacity': '1',
          } as React.CSSProperties
        }
      >
        <div className="unified-header__container">
          {/* Left Section - Logo */}
          <div className="unified-header__left">
            <Logo
              size="medium"
              href={getLogoHref()}
              className="unified-header__logo"
            />
          </div>

          {/* Center Section - Navigation (Landing only) */}
          {showNavigation && !isMobile && (
            <NavigationLinks
              onItemClick={handleNavItemClick}
              showDescriptions={false}
              showIcons={false}
            />
          )}

          {/* Center Section - Greeting (Dashboard only - Desktop) */}
          {showGreeting && !isMobile && user && (
            <div className="unified-header__greeting-section">
              {(() => {
                const greeting = getGreeting();
                return (
                  <>
                    {greeting.icon}
                    <span className="unified-header__greeting">
                      {greeting.text}
                    </span>
                  </>
                );
              })()}
            </div>
          )}

          {/* Logo for Mobile (when bottom nav is visible - always show when in dashboard on mobile) */}
          {location.pathname.startsWith('/dashboard') && (
            <div className="unified-header__greeting-section unified-header__greeting-section--mobile-logo">
              <Logo className="unified-header__logo" />
            </div>
          )}

          {/* Right Section - Actions */}
          <div className="unified-header__right">
            {/* Theme Toggle */}
            <ThemeToggle className="unified-header__theme-toggle" />

            {/* Auth Buttons (only for landing page and when not logged in) */}
            {variant === 'landing' && !user && (
              <>
                <button
                  className="unified-header__auth-btn unified-header__auth-btn--secondary"
                  onClick={() => navigate('/login')}
                >
                  Zaloguj się
                </button>
                <button
                  className="unified-header__auth-btn unified-header__auth-btn--primary"
                  onClick={() => navigate('/register')}
                >
                  Dołącz do nas
                </button>
              </>
            )}
          </div>

            {showDashboardFeatures && (
              <>
                {/* Search Field - Clickable */}
                {showSearch && !isMobile && (
                  <button
                    onClick={handleSearchClick}
                    className="unified-header__search-field"
                    aria-label="Szukaj wydarzeń, gości..."
                  >
                    <Search size={18} className="unified-header__search-icon" />
                    <span className="unified-header__search-placeholder">
                      Szukaj wydarzeń, gości...
                    </span>
                  </button>
                )}
              </>
            )}

            {/* Mobile Menu Toggle (Landing/Auth only) */}
            {!showMobileToggle && isMobile && (
              <button
                className="unified-header__menu-toggle"
                onClick={handleToggleMenu}
                aria-label={isMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
                aria-expanded={isMenuOpen}
              >
                <AnimatedMenuIcon isOpen={isMenuOpen || isMenuClosing} size={24} />
              </button>
            )}
          </div>
      </header>

      {/* Mobile Menu Overlay (Landing/Auth only) */}
      {!showMobileToggle && (isMenuOpen || isMenuClosing) && isMobile && (
          <div
            className="unified-header__mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu nawigacji"
            onClick={handleToggleMenu}
          >
            <div
              className={`unified-header__mobile-menu-content ${isMenuClosing ? 'unified-header__mobile-menu-content--closing' : ''}`}
              ref={menuRef}
              onClick={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.preventDefault()}
              onWheel={(e) => e.preventDefault()}
            >
              {/* Mobile Menu Header */}
              <div className="unified-header__mobile-menu-header">
                <Logo
                  size="medium"
                  href="/"
                  className="unified-header__mobile-logo"
                />
                <button
                  className="unified-header__mobile-menu-close"
                  onClick={handleToggleMenu}
                  aria-label="Zamknij menu"
                  ref={menuToggleRef}
                >
                  <X size={24} />
                </button>
              </div>

              {/* User Section (if logged in) - moved up */}
              {user && (
                <div className="unified-header__mobile-user">
                  <div className="unified-header__mobile-user-info">
                    <div className="unified-header__mobile-user-avatar">
                      {(user.firstName?.charAt(0) + (user.lastName?.charAt(0) || '')).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="unified-header__mobile-user-details">
                      <div className="unified-header__mobile-user-name">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="unified-header__mobile-user-email">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="unified-header__mobile-user-menu">
                    <button
                      className="unified-header__mobile-user-menu-item"
                      onClick={() => navigate('/dashboard')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9,22 9,12 15,12 15,22"/>
                      </svg>
                      Dashboard
                    </button>
                    <button
                      className="unified-header__mobile-user-menu-item"
                      onClick={() => navigate('/dashboard/settings')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                      </svg>
                      Ustawienia
                    </button>

                    <button
                      className="unified-header__mobile-user-menu-item"
                      onClick={() => {
                        // Toggle theme - this will be handled by the ThemeToggle component
                        const themeToggle = document.querySelector('.theme-toggle__switch') as HTMLButtonElement;
                        if (themeToggle) {
                          themeToggle.click();
                        }
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="5"/>
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                      </svg>
                      Motyw
                    </button>

                    <button
                      className="unified-header__mobile-user-menu-item unified-header__mobile-user-menu-item--logout"
                      onClick={() => {
                        logout();
                        navigate('/');
                        handleToggleMenu();
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16,17 21,12 16,7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Wyloguj się
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="unified-header__mobile-nav">
                <NavigationLinks
                  onItemClick={handleNavItemClick}
                  showDescriptions={true}
                  showIcons={true}
                  vertical
                  firstItemRef={firstMenuItemRef}
                />
              </div>

              {/* Auth Buttons (only if not logged in) */}
              {!user && (
                <div className="unified-header__mobile-auth">
                  <button
                    className="unified-header__mobile-auth-btn unified-header__mobile-auth-btn--primary"
                    onClick={() => navigate('/login')}
                  >
                    Zaloguj się
                  </button>
                  <button
                    className="unified-header__mobile-auth-btn unified-header__mobile-auth-btn--secondary"
                    onClick={() => navigate('/register')}
                  >
                    Dołącz do nas
                  </button>
                </div>
              )}


              {/* Footer */}
              <div className="unified-header__mobile-footer">
                <p className="unified-header__mobile-footer-text">
                  © {new Date().getFullYear()} PartyPass. Wszelkie prawa zastrzeżone.
                </p>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default UnifiedHeader;
