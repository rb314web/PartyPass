import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import NavigationLinks, { NavigationItem } from './components/NavigationLinks/NavigationLinks';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import './UnifiedHeader.scss';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: any) => void;
  }
}

const MOBILE_BREAKPOINT = 830;

const LogoText: React.FC = () => (
  <span className="logo__text">
    <span className="logo__text--primary">Party</span>
    <span className="logo__text--accent">Pass</span>
  </span>
);

export interface UnifiedHeaderProps {
  variant: 'landing' | 'auth' | 'dashboard';
  onMobileToggle?: () => void;
  isMobileOpen?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showQuickActions?: boolean;
  enableScrollEffects?: boolean;
  trackingEnabled?: boolean;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  variant,
  onMobileToggle,
  isMobileOpen = false,
  showSearch = true,
  showNotifications = false,
  showQuickActions = false,
  enableScrollEffects = true,
  trackingEnabled = true,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuClosing, setIsMobileMenuClosing] = useState(false);

  // Scroll state
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Refs
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll effects
  useEffect(() => {
    if (!enableScrollEffects) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrolled = scrollY > 10;

      setIsScrolled(scrolled);

      if (headerRef.current) {
        const blurAmount = Math.min(scrollY / 100, 1);
        headerRef.current.style.setProperty('--scroll-blur', `${blurAmount * 20}px`);
        headerRef.current.style.setProperty('--scroll-opacity', `${0.85 + blurAmount * 0.15}`);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableScrollEffects]);

  // Handle mobile menu toggle
  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Handle mobile menu close
  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuClosing(true);

    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMobileMenuClosing(false);
    }, 300); // Match animation duration
  }, []);

  // Handle navigation item click
  const handleNavigationClick = useCallback((item: NavigationItem) => {
    if (item.href.startsWith('#')) {
      // Anchor link - scroll to section
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: item.href } });
      } else {
        const element = document.querySelector(item.href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      // Regular route
      navigate(item.href);
    }

    // Close mobile menu if open
    if (isMobileMenuOpen) {
      handleMobileMenuClose();
    }

    // Analytics tracking
    if (trackingEnabled && window.gtag) {
      window.gtag('event', 'navigation_click', {
        navigation_item: item.label,
        navigation_href: item.href,
        navigation_variant: variant,
      });
    }
  }, [location.pathname, navigate, isMobileMenuOpen, handleMobileMenuClose, trackingEnabled, variant]);

  // Lock body scroll when mobile menu is open (or closing)
  useEffect(() => {
    if (isMobileMenuOpen || isMobileMenuClosing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isMobileMenuClosing]);

  // Focus trap and ESC key handler
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleMobileMenuClose();
        return;
      }

      // Focus trap: Tab key
      if (event.key === 'Tab') {
        const menu = mobileMenuRef.current;
        if (!menu) return;

        const focusableElements = menu.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus first item when menu opens
    setTimeout(() => {
      firstMenuItemRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen, handleMobileMenuClose]);

  // Handle search click
  const handleSearchClick = useCallback(() => {
    navigate('/dashboard/search');
    if (trackingEnabled && window.gtag) {
      window.gtag('event', 'header_search_click', {
        variant: variant,
      });
    }
  }, [navigate, trackingEnabled, variant]);

  // Get greeting message
  const getGreeting = useCallback(() => {
    if (!user?.firstName) return 'Witaj';

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'Dzień dobry' :
                     hour < 18 ? 'Dobry dzień' : 'Dobry wieczór';

    return `${timeOfDay}, ${user.firstName}`;
  }, [user?.firstName]);

  // Get greeting icon
  const getGreetingIcon = useCallback(() => {
    const hour = new Date().getHours();
    return hour < 18 ? <Sun size={20} /> : <Moon size={20} />;
  }, []);

  // Render auth buttons
  const renderAuthButtons = () => (
    <div className="unified-header__nav-auth">
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
    </div>
  );

  // Render greeting section
  const renderGreetingSection = () => (
    <div className="unified-header__greeting-section">
      <div className="unified-header__greeting-icon">
        {getGreetingIcon()}
      </div>
      <span className="unified-header__greeting-text">
        {getGreeting()}
      </span>
    </div>
  );

  // Render right section
  const renderRightSection = () => (
    <div className="unified-header__right">
      {variant === 'dashboard' && showSearch && !isMobile && (
        <button
          className="unified-header__search-btn"
          onClick={handleSearchClick}
          aria-label="Szukaj wydarzeń, gości..."
          title="Szukaj wydarzeń, gości... (Ctrl+K)"
        >
          <Search size={20} />
          {!isMobile && (
            <span className="unified-header__search-shortcut">
              <kbd>Ctrl</kbd> + <kbd>K</kbd>
            </span>
          )}
        </button>
      )}
      {/* Hide theme toggle on mobile for landing/auth - it's in mobile menu */}
      {!(isMobile && (variant === 'landing' || variant === 'auth')) && <ThemeToggle />}
      {variant === 'landing' && !user && renderAuthButtons()}
      {(variant === 'landing' || variant === 'auth') && isMobile && (
        <button
          className="unified-header__mobile-menu-toggle"
          onClick={handleMobileMenuToggle}
          aria-label={isMobileMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <Menu size={24} />
        </button>
      )}
    </div>
  );

  return (
    <>
      <header
        ref={headerRef}
        className={`unified-header unified-header--${variant} ${isScrolled ? 'unified-header--scrolled' : ''}`}
        role="banner"
      >
        <div className="unified-header__container">
          {/* Left Section - Logo */}
          <div className="unified-header__left">
            <div className="unified-header__logo">
              <h1
                className="logo"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
              >
                <LogoText />
              </h1>
            </div>
          </div>

          {/* Center Section - Navigation or Greeting */}
          <div className="unified-header__nav">
            {variant === 'landing' && (
              <NavigationLinks
                onItemClick={handleNavigationClick}
                showDescriptions={false}
                showIcons={false}
              />
            )}
            {variant === 'dashboard' && renderGreetingSection()}
          </div>

          {/* Right Section */}
          {renderRightSection()}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {(isMobileMenuOpen || isMobileMenuClosing) && (variant === 'landing' || variant === 'auth') && (
        <div
          className={`unified-header__mobile-overlay ${isMobileMenuClosing ? 'unified-header__mobile-overlay--closing' : ''}`}
          onClick={handleMobileMenuClose}
          aria-hidden="true"
        >
          <div
            ref={mobileMenuRef}
            className={`unified-header__mobile-menu ${isMobileMenuClosing ? 'unified-header__mobile-menu--closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Menu nawigacji"
            id="mobile-menu"
          >
            {/* Mobile Menu Header */}
            <div className="unified-header__mobile-menu-header">
              <div className="unified-header__mobile-menu-logo">
                <LogoText />
              </div>
              <button
                className="unified-header__mobile-menu-close"
                onClick={handleMobileMenuClose}
                aria-label="Zamknij menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="unified-header__mobile-menu-content">
              {/* Navigation Links */}
              <NavigationLinks
                onItemClick={handleNavigationClick}
                vertical={true}
                showDescriptions={true}
                showIcons={true}
                firstItemRef={firstMenuItemRef}
              />

              {/* Auth Buttons */}
              <div className="unified-header__mobile-menu-auth">
                  <button
                  className="unified-header__mobile-menu-auth-btn unified-header__mobile-menu-auth-btn--secondary"
                    onClick={() => {
                      navigate('/login');
                    handleMobileMenuClose();
                    }}
                  >
                    Zaloguj się
                  </button>
                  <button
                  className="unified-header__mobile-menu-auth-btn unified-header__mobile-menu-auth-btn--primary"
                    onClick={() => {
                      navigate('/register');
                    handleMobileMenuClose();
                    }}
                  >
                    Dołącz do nas
                  </button>
                </div>

              {/* Theme Toggle */}
              <div className="unified-header__mobile-menu-theme">
                <ThemeToggle showLabel size="large" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Toggle Button for Dashboard */}
      {variant === 'dashboard' && isMobile && (
        <button
          className="unified-header__mobile-dashboard-toggle"
          onClick={onMobileToggle}
          aria-label="Otwórz/Zamknij panel boczny"
          aria-expanded={isMobileOpen}
        >
          <Menu size={24} />
        </button>
      )}
    </>
  );
};

export default UnifiedHeader;