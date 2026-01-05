// components/dashboard/Sidebar/Sidebar.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  ChevronRight,
  Activity,
  Search,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import Logo from '../../common/Logo/Logo';
import './Sidebar.scss';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
  isCollapsed?: boolean;
  onCollapsedToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen: externalMobileOpen = false,
  onMobileToggle,
  isCollapsed: externalCollapsed,
  onCollapsedToggle,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const [isCompactScreen, setIsCompactScreen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Check if screen is in compact range (769px-1200px)
  useEffect(() => {
    const checkCompactScreen = () => {
      const width = window.innerWidth;
      setIsCompactScreen(width >= 769 && width <= 1200);
    };

    checkCompactScreen();
    window.addEventListener('resize', checkCompactScreen);
    return () => window.removeEventListener('resize', checkCompactScreen);
  }, []);

  // Use external state if provided, otherwise use internal state
  const isMobileOpen =
    externalMobileOpen !== false ? externalMobileOpen : internalMobileOpen;
  const isCollapsed =
    externalCollapsed !== undefined ? externalCollapsed : (internalCollapsed || isCompactScreen);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', exact: true },
    { icon: Search, label: 'Wyszukaj', path: '/dashboard/search' },
    { icon: Calendar, label: 'Wydarzenia', path: '/dashboard/events' },
    { icon: Users, label: 'Kontakty', path: '/dashboard/contacts' },
    { icon: Activity, label: 'Aktywności', path: '/dashboard/activities' },
    { icon: BarChart3, label: 'Analityka', path: '/dashboard/analytics' },
    { icon: Settings, label: 'Ustawienia', path: '/dashboard/settings' },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getPlanBadge = () => {
    const badges = {
      starter: { label: 'Starter', color: 'gray' },
      pro: { label: 'Pro', color: 'primary' },
      enterprise: { label: 'Enterprise', color: 'gold' },
    };
    return badges[user?.planType || 'starter'];
  };

  // Handle escape key to close mobile menu
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        if (onMobileToggle) {
          onMobileToggle();
        } else {
          setInternalMobileOpen(false);
        }
      }
    },
    [isMobileOpen, onMobileToggle]
  );

  // Handle body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen, handleKeyDown]);

  const handleMobileClose = () => {
    if (onMobileToggle) {
      onMobileToggle();
    } else {
      setInternalMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="sidebar__overlay"
          onClick={handleMobileClose}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              handleMobileClose();
            }
          }}
          role="button"
          tabIndex={-1}
          aria-label="Zamknij menu"
        />
      )}

      {/* Mobile toggle moved to Header */}

      <aside
        id="sidebar"
        className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''} ${isMobileOpen ? 'sidebar--mobile-open' : ''}`}
        role="navigation"
        aria-label="Menu nawigacyjne"
      >
        <div className="sidebar__header">
          <Logo
            size="small"
            href="/dashboard"
            showIcon={false}
            collapsed={isCollapsed}
            className="sidebar__logo"
          />

          {/* Mobile close button - only visible on mobile when open */}
          <button
            className="sidebar__mobile-close"
            onClick={handleMobileClose}
            aria-label="Zamknij menu"
            title="Zamknij menu"
          >
            <X size={20} />
          </button>

          {/* Desktop collapse button - hidden on mobile */}
          <button
            className="sidebar__collapse-btn"
            onClick={() => {
              if (onCollapsedToggle) {
                onCollapsedToggle();
              } else {
                setInternalCollapsed(!internalCollapsed);
              }
            }}
            aria-label={isCollapsed ? 'Rozwiń menu' : 'Zwiń menu'}
            title={isCollapsed ? 'Rozwiń menu' : 'Zwiń menu'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__menu">
            {menuItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar__link ${isActive(item.path, item.exact) ? 'sidebar__link--active' : ''}`}
                  title={item.label}
                  onClick={() => {
                    handleMobileClose();
                    // Focus management - focus on main content after navigation
                    setTimeout(() => {
                      const mainContent = document.querySelector(
                        '.dashboard__content'
                      );
                      if (mainContent) {
                        (mainContent as HTMLElement).focus();
                      }
                    }, 100);
                  }}
                >
                  <item.icon size={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__footer">
          {user && (
            <div className="sidebar__user">
              <div className="sidebar__user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.firstName} />
                ) : (
                  <div className="sidebar__user-avatar-placeholder">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <div className="sidebar__user-info">
                  <div className="sidebar__user-name">
                    {user.firstName} {user.lastName}
                  </div>
                  <div
                    className={`sidebar__user-plan sidebar__user-plan--${getPlanBadge().color}`}
                  >
                    {user.planType === 'enterprise' && <Crown size={12} />}
                    {getPlanBadge().label}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            className="sidebar__logout"
            onClick={logout}
            title="Wyloguj się"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Wyloguj</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
