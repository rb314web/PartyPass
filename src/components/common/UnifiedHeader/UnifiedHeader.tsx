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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);

  // Scroll state
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Refs
  const headerRef = useRef<HTMLElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const firstItemRef = useRef<HTMLButtonElement>(null);

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
  const handleMobileToggle = useCallback(() => {
    if (isMenuOpen) {
      // Start closing animation
      setIsMenuClosing(true);

      // Store scroll position before closing
      scrollPositionRef.current = window.scrollY || window.pageYOffset || 0;

      // Close menu after animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsMenuOpen(false);
          setIsMenuClosing(false);
        });
      });
    } else {
      setIsMenuOpen(true);
    }
  }, [isMenuOpen]);

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

    // Close mobile menu
    if (isMenuOpen) {
      handleMobileToggle();
    }

    // Analytics tracking
    if (trackingEnabled && window.gtag) {
      window.gtag('event', 'navigation_click', {
        navigation_item: item.label,
        navigation_href: item.href,
        navigation_variant: variant,
      });
    }
  }, [location.pathname, navigate, isMenuOpen, handleMobileToggle, trackingEnabled, variant]);

  // Handle search click
  const handleSearchClick = useCallback(() => {
    navigate('/dashboard/search');
    if (trackingEnabled && window.gtag) {
      window.gtag('event', 'header_search_click', {
        variant: variant,
      });
    }
  }, [navigate, trackingEnabled, variant]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        handleMobileToggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, handleMobileToggle]);

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
      <ThemeToggle />
      {variant === 'landing' && !user && renderAuthButtons()}
      {(variant === 'landing' || variant === 'auth') && (
        <button
          className="unified-header__mobile-toggle"
          onClick={handleMobileToggle}
          aria-label={isMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
      {(isMenuOpen || isMenuClosing) && (
        <div
          className={`unified-header__mobile-overlay ${isMenuClosing ? 'unified-header__mobile-overlay--closing' : ''}`}
          onClick={handleMobileToggle}
          aria-hidden="true"
        >
          <div
            className={`unified-header__mobile-menu ${isMenuClosing ? 'unified-header__mobile-menu--closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Menu nawigacji"
            id="mobile-menu"
          >
            {/* Mobile Menu Header */}
            <div className="unified-header__mobile-header">
              <div className="unified-header__logo">
                <h1 className="logo">
                  <LogoText />
                </h1>
              </div>
              <button
                className="unified-header__mobile-close"
                onClick={handleMobileToggle}
                aria-label="Zamknij menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="unified-header__mobile-content">
              {/* User Section (if authenticated) */}
              {!!user && (
                <div className="unified-header__mobile-user">
                  <div className="unified-header__mobile-user-info">
                    <div className="unified-header__mobile-user-name">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="unified-header__mobile-user-email">
                      {user.email}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <NavigationLinks
                onItemClick={handleNavigationClick}
                vertical={true}
                showDescriptions={true}
                showIcons={true}
                firstItemRef={firstItemRef}
              />

              {/* Auth Buttons (if not authenticated) */}
              {!user && (
                <div className="unified-header__mobile-auth">
                  <button
                    className="unified-header__auth-btn unified-header__auth-btn--secondary"
                    onClick={() => {
                      navigate('/login');
                      handleMobileToggle();
                    }}
                  >
                    Zaloguj się
                  </button>
                  <button
                    className="unified-header__auth-btn unified-header__auth-btn--primary"
                    onClick={() => {
                      navigate('/register');
                      handleMobileToggle();
                    }}
                  >
                    Dołącz do nas
                  </button>
                </div>
              )}

              {/* Theme Toggle in Mobile Menu */}
              <div className="unified-header__mobile-theme">
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Menu Footer */}
            <div className="unified-header__mobile-footer">
              <div className="unified-header__mobile-copyright">
                © 2024 PartyPass. Wszelkie prawa zastrzeżone.
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