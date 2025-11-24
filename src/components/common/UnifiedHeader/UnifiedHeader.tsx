// components/common/UnifiedHeader/UnifiedHeader.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import Logo from '../Logo/Logo';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import NavigationLinks, { NavigationItem } from './components/NavigationLinks';
import './UnifiedHeader.scss';

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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isMobile]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);

    trackEvent('menu_toggle', {
      menu_state: newState ? 'opened' : 'closed',
      variant,
    });
  };

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
          {/* Center Section - Navigation (Landing only) */}
          {showNavigation && !isMobile && (
            <NavigationLinks
              onItemClick={handleNavItemClick}
              showDescriptions={true}
              showIcons={true}
            />
          )}

          {/* Center Section - Greeting (Dashboard only - Desktop) */}
          {showGreeting && !isMobile && user && (() => {
            const greeting = getGreeting();
            return (
              <div className="unified-header__greeting-section">
                {greeting.icon}
                <span className="unified-header__greeting">
                  {greeting.text}
                </span>
              </div>
            );
          })()}

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
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay (Landing/Auth only) */}
        {!showMobileToggle && isMenuOpen && isMobile && (
          <div className="unified-header__mobile-menu">
            <div className="unified-header__mobile-menu-content">
              {/* Mobile menu content will be implemented in Phase 4.3 */}
              <p>Mobile Menu (Phase 4.3)</p>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default UnifiedHeader;
