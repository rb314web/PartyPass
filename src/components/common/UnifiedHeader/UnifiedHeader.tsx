import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useHeaderNavLayout } from '../../../hooks/useHeaderNavLayout';
import NavigationLinks, {
  NavigationItem,
  buildLandingNavItems,
} from './components/NavigationLinks/NavigationLinks';
import { trackLandingNavClick } from '../../../services/landingAnalytics';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import UserMenu from '../UserMenu/UserMenu';
import '../LanguageSwitcher/LanguageSwitcher.scss';
import './UnifiedHeader.scss';

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
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const isMarketingHeader = variant === 'landing' || variant === 'auth';

  const {
    containerRef,
    measureLayerRef,
    leftMeasureRef,
    navMeasureRef,
    rightMeasureRef,
    inlineNavRef,
    useCompactNav,
  } = useHeaderNavLayout({
    enabled: isMarketingHeader,
    hasInlineNav: variant === 'landing' || variant === 'auth',
    measureKey: `${i18n.language}:${user?.id ?? 'guest'}:${location.pathname}`,
  });

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuClosing, setIsMobileMenuClosing] = useState(false);

  // Refs
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRafRef = useRef<number>(0);

  const SCROLL_DOWN_THRESHOLD = 28;
  const SCROLL_UP_THRESHOLD = 8;

  const getScrollY = useCallback(() => {
    return (
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }, []);

  // Landing: transparent at top, solid glass background after scroll
  useEffect(() => {
    if (!enableScrollEffects || variant !== 'landing') {
      setIsScrolled(false);
      return;
    }

    const updateScrollState = () => {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = requestAnimationFrame(() => {
        const scrollY = getScrollY();
        setIsScrolled((prev) => {
          if (!prev && scrollY > SCROLL_DOWN_THRESHOLD) return true;
          if (prev && scrollY < SCROLL_UP_THRESHOLD) return false;
          return prev;
        });
      });
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollState);
      cancelAnimationFrame(scrollRafRef.current);
    };
  }, [enableScrollEffects, variant, getScrollY]);

  // Zamknij menu po powrocie do pełnej nawigacji (np. resize okna)
  useEffect(() => {
    if (!useCompactNav && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      setIsMobileMenuClosing(false);
    }
  }, [useCompactNav, isMobileMenuOpen]);

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
  const handleNavigationClick = useCallback((item: NavigationItem, placement: 'header' | 'mobile' = 'header') => {
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

    if (variant === 'landing') {
      trackLandingNavClick(item.label, item.href, placement);
      return;
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

  // Lock page scroll when mobile menu is open (or closing)
  useEffect(() => {
    const shouldLockScroll = isMobileMenuOpen || isMobileMenuClosing;
    if (!shouldLockScroll) return;

    const scrollY = window.scrollY;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.width = '100%';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.width = '';
      body.style.paddingRight = '';
      window.scrollTo(0, scrollY);
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

  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isForgotPage = location.pathname === '/forgot-password';

  const landingHeaderNavItems = useMemo(
    () => buildLandingNavItems(t, 'header'),
    [t, i18n.language]
  );
  const landingFullNavItems = useMemo(
    () => buildLandingNavItems(t, 'full'),
    [t, i18n.language]
  );

  const navigateToAuth = useCallback(
    (path: '/login' | '/register') => {
      if (location.pathname === path) return;
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [location.pathname, navigate]
  );

  const handleLogoClick = useCallback(() => {
    if (location.pathname === '/') {
      if (location.hash) {
        navigate('/', { replace: true });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigate('/');
  }, [location.hash, location.pathname, navigate]);

  // Render auth buttons
  const renderAuthButtons = () => (
    <div className="unified-header__nav-auth">
      <button
        type="button"
        className={`pp-btn pp-btn--sm ${
          isLoginPage
            ? 'unified-header__auth-tab unified-header__auth-tab--active'
            : 'pp-btn--secondary'
        }`}
        onClick={() => navigateToAuth('/login')}
        aria-current={isLoginPage ? 'page' : undefined}
      >
        {t('auth.login')}
      </button>
      <button
        type="button"
        className={`pp-btn pp-btn--sm ${
          isRegisterPage
            ? 'unified-header__auth-tab unified-header__auth-tab--active'
            : 'pp-btn--primary'
        }`}
        onClick={() => navigateToAuth('/register')}
        aria-current={isRegisterPage ? 'page' : undefined}
      >
        {t('auth.joinUs')}
      </button>
    </div>
  );

  const renderLandingAuthActions = () => (
    <div className="unified-header__landing-auth">
      <button
        type="button"
        className="unified-header__login-link"
        onClick={() => navigateToAuth('/login')}
        aria-current={isLoginPage ? 'page' : undefined}
      >
        {t('auth.login')}
      </button>
      <button
        type="button"
        className="pp-btn pp-btn--sm pp-btn--primary"
        onClick={() => navigateToAuth('/register')}
        aria-current={isRegisterPage ? 'page' : undefined}
      >
        {t('landing.startFreeLong')}
      </button>
    </div>
  );

  const renderAuthPageActions = () => {
    if (isLoginPage || isForgotPage) {
      return (
        <div className="unified-header__landing-auth">
          <button
            type="button"
            className="pp-btn pp-btn--sm pp-btn--primary"
            onClick={() => navigateToAuth('/register')}
          >
            {t('landing.startFreeLong')}
          </button>
        </div>
      );
    }

    if (isRegisterPage) {
      return (
        <div className="unified-header__landing-auth">
          <button
            type="button"
            className="unified-header__login-link"
            onClick={() => navigateToAuth('/login')}
          >
            {t('auth.login')}
          </button>
        </div>
      );
    }

    return renderAuthButtons();
  };

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

  // Render user menu for logged in users
  const renderUserMenu = () => {
    if (!user) return null;
    
    return (
      <UserMenu
        user={{
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          planType: user.planType,
        }}
        onLogout={logout}
        variant="header"
      />
    );
  };

  // Render right section
  const renderRightSection = () => (
    <div className="unified-header__right">
      {variant === 'dashboard' && showSearch && (
        <button
          className="unified-header__search-btn"
          onClick={handleSearchClick}
          aria-label="Szukaj wydarzeń, gości..."
          title="Szukaj wydarzeń, gości..."
        >
          <Search size={20} />
        </button>
      )}
      {(variant === 'landing' || variant === 'auth') && !useCompactNav && (
        <LanguageSwitcher
          compact
          className="unified-header__language-switcher"
        />
      )}
      {variant !== 'landing' && !(useCompactNav && isMarketingHeader) && <ThemeToggle />}
      {variant === 'landing' && !user && !useCompactNav && renderLandingAuthActions()}
      {variant === 'landing' && user && !useCompactNav && renderUserMenu()}
      {variant === 'auth' && !user && !useCompactNav && renderAuthPageActions()}
      {variant === 'auth' && user && !useCompactNav && renderUserMenu()}
      {isMarketingHeader && useCompactNav && (
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
        className={[
          'unified-header',
          `unified-header--${variant}`,
          variant === 'landing' &&
            enableScrollEffects &&
            (isScrolled ? 'unified-header--scrolled' : 'unified-header--at-top'),
          isMarketingHeader && useCompactNav && 'unified-header--compact-nav',
        ]
          .filter(Boolean)
          .join(' ')}
        role="banner"
      >
        <div className="unified-header__container" ref={containerRef}>
          {/* Left Section - Logo */}
          {variant !== 'dashboard' && (
            <div className="unified-header__left">
              <div className="unified-header__logo">
                <h1
                  className="logo"
                  onClick={handleLogoClick}
                  style={{ cursor: 'pointer' }}
                >
                  <LogoText />
                </h1>
              </div>
            </div>
          )}
          
          {/* Dashboard Logo - zawsze renderuj, CSS kontroluje widoczność */}
          {variant === 'dashboard' && (
            <div className="unified-header__left unified-header__left--dashboard-mobile">
              <div className="unified-header__logo">
                <LogoText />
              </div>
            </div>
          )}

          {/* Center Section - Navigation or Greeting */}
          <div className="unified-header__nav" ref={inlineNavRef}>
            {(variant === 'landing' || variant === 'auth') && (
              <NavigationLinks
                onItemClick={handleNavigationClick}
                items={landingHeaderNavItems}
                showDescriptions={false}
                showIcons={false}
              />
            )}
            {variant === 'dashboard' && renderGreetingSection()}
          </div>

          {/* Right Section */}
          {renderRightSection()}
        </div>

        {isMarketingHeader && (
          <div
            ref={measureLayerRef}
            className="unified-header__layout-measure"
            aria-hidden="true"
          >
            <div ref={leftMeasureRef} className="unified-header__left">
              <div className="unified-header__logo">
                <h1 className="logo">
                  <LogoText />
                </h1>
              </div>
            </div>
            {(variant === 'landing' || variant === 'auth') && (
              <div ref={navMeasureRef} className="unified-header__nav-measure">
                <NavigationLinks
                  onItemClick={() => undefined}
                  items={landingHeaderNavItems}
                  showDescriptions={false}
                  showIcons={false}
                />
              </div>
            )}
            <div ref={rightMeasureRef} className="unified-header__right unified-header__right--measure">
              <LanguageSwitcher
                compact
                className="unified-header__language-switcher"
              />
              {variant === 'landing' ? (
                !user ? renderLandingAuthActions() : renderUserMenu()
              ) : variant === 'auth' ? (
                !user ? renderAuthPageActions() : renderUserMenu()
              ) : (
                <>
                  <ThemeToggle />
                  {!user ? renderAuthButtons() : renderUserMenu()}
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {(isMobileMenuOpen || isMobileMenuClosing) && isMarketingHeader && (
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
              <button
                type="button"
                className="unified-header__mobile-menu-logo"
                onClick={() => {
                  handleLogoClick();
                  handleMobileMenuClose();
                }}
                aria-label={t('landing.footer.home', { defaultValue: 'Home' })}
              >
                <LogoText />
              </button>
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
              <section className="unified-header__mobile-menu-section">
                <h2 className="unified-header__mobile-menu-section-title">
                  {t('header.mobileMenu.explore')}
                </h2>
                <NavigationLinks
                  onItemClick={handleNavigationClick}
                  items={landingFullNavItems}
                  vertical
                  showDescriptions={false}
                  showIcons
                  firstItemRef={user ? firstMenuItemRef : undefined}
                />
              </section>

              {!user ? (
                <section className="unified-header__mobile-menu-section">
                  <h2 className="unified-header__mobile-menu-section-title">
                    {t('header.mobileMenu.account')}
                  </h2>
                  {variant === 'landing' ? (
                    <div className="unified-header__mobile-menu-auth unified-header__mobile-menu-auth--landing">
                      <button
                        ref={firstMenuItemRef}
                        type="button"
                        className="unified-header__mobile-menu-auth-btn unified-header__mobile-menu-auth-btn--primary"
                        onClick={() => {
                          navigateToAuth('/register');
                          handleMobileMenuClose();
                        }}
                      >
                        {t('landing.startFreeLong')}
                      </button>
                      <button
                        type="button"
                        className="unified-header__mobile-menu-auth-btn unified-header__mobile-menu-auth-btn--link"
                        onClick={() => {
                          navigateToAuth('/login');
                          handleMobileMenuClose();
                        }}
                      >
                        {t('auth.login')}
                      </button>
                    </div>
                  ) : variant === 'auth' ? (
                    <div className="unified-header__mobile-menu-auth unified-header__mobile-menu-auth--landing">
                      {isRegisterPage ? (
                        <button
                          ref={firstMenuItemRef}
                          type="button"
                          className="unified-header__mobile-menu-auth-btn unified-header__mobile-menu-auth-btn--primary"
                          onClick={() => {
                            navigateToAuth('/login');
                            handleMobileMenuClose();
                          }}
                        >
                          {t('auth.login')}
                        </button>
                      ) : (
                        <button
                          ref={firstMenuItemRef}
                          type="button"
                          className="unified-header__mobile-menu-auth-btn unified-header__mobile-menu-auth-btn--primary"
                          onClick={() => {
                            navigateToAuth('/register');
                            handleMobileMenuClose();
                          }}
                        >
                          {t('landing.startFreeLong')}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="unified-header__mobile-menu-auth">
                      <button
                        ref={firstMenuItemRef}
                        type="button"
                        className={`unified-header__mobile-menu-auth-btn unified-header__mobile-menu-auth-btn--secondary${
                          isLoginPage ? ' unified-header__mobile-menu-auth-btn--current' : ''
                        }`}
                        onClick={() => {
                          navigateToAuth('/login');
                          handleMobileMenuClose();
                        }}
                        aria-current={isLoginPage ? 'page' : undefined}
                      >
                        {t('auth.login')}
                      </button>
                      <button
                        type="button"
                        className={`unified-header__mobile-menu-auth-btn unified-header__mobile-menu-auth-btn--primary${
                          isRegisterPage ? ' unified-header__mobile-menu-auth-btn--current' : ''
                        }`}
                        onClick={() => {
                          navigateToAuth('/register');
                          handleMobileMenuClose();
                        }}
                        aria-current={isRegisterPage ? 'page' : undefined}
                      >
                        {t('auth.joinUs')}
                      </button>
                    </div>
                  )}
                </section>
              ) : (
                <div className="unified-header__mobile-menu-user">
                  <div className="unified-header__mobile-menu-user-info">
                    <div className="unified-header__mobile-menu-user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                      ) : (
                        <span>{user.firstName[0]}{user.lastName[0]}</span>
                      )}
                    </div>
                    <div className="unified-header__mobile-menu-user-details">
                      <div className="unified-header__mobile-menu-user-name">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="unified-header__mobile-menu-user-email">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="unified-header__mobile-menu-user-actions">
                    <button
                      className="unified-header__mobile-menu-user-btn"
                      onClick={() => {
                        navigate('/dashboard');
                        handleMobileMenuClose();
                      }}
                    >
                      Dashboard
                    </button>
                    <button
                      className="unified-header__mobile-menu-user-btn unified-header__mobile-menu-user-btn--danger"
                      onClick={() => {
                        logout();
                        handleMobileMenuClose();
                      }}
                    >
                      Wyloguj się
                    </button>
                  </div>
                </div>
              )}

              <div className="unified-header__mobile-menu-preferences">
                <span className="unified-header__mobile-menu-section-title unified-header__mobile-menu-section-title--inline">
                  {t('header.mobileMenu.settings')}
                </span>
                <div className="unified-header__mobile-menu-preferences-row">
                  <LanguageSwitcher compact />
                  <ThemeToggle showLabel size="large" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UnifiedHeader;