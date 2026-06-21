// components/common/BottomNavigation/BottomNavigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Settings, Users, Search, Activity, BarChart3 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { preloadDashboardRoute } from '../../../utils/preloadDashboardRoute';
import './BottomNavigation.scss';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  useAuth();

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: t('nav.dashboard'),
      icon: <Home size={20} />,
      exact: true,
    },
    {
      path: '/dashboard/search',
      label: t('nav.search'),
      icon: <Search size={20} />,
    },
    {
      path: '/dashboard/events',
      label: t('nav.events'),
      icon: <Calendar size={20} />,
    },
    {
      path: '/dashboard/contacts',
      label: t('nav.contacts'),
      icon: <Users size={20} />,
    },
    {
      path: '/dashboard/activities',
      label: t('nav.activities'),
      icon: <Activity size={20} />,
    },
    {
      path: '/dashboard/analytics',
      label: t('nav.analytics'),
      icon: <BarChart3 size={20} />,
    },
    {
      path: '/dashboard/settings',
      label: t('nav.settings'),
      icon: <Settings size={20} />,
    },
  ];

  const isActive = (item: NavItem) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  // Sprawdź czy jesteśmy w dashboard
  const isInDashboard = location.pathname.startsWith('/dashboard');

  if (!isInDashboard) {
    return null;
  }

  return (
    <nav
      className="bottom-nav"
      role="navigation"
      aria-label="Nawigacja mobilna"
    >
      <div className="bottom-nav__container">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav__item ${isActive(item) ? 'bottom-nav__item--active' : ''}`}
            aria-label={item.label}
            onMouseEnter={() => preloadDashboardRoute(item.path)}
            onFocus={() => preloadDashboardRoute(item.path)}
            onTouchStart={() => preloadDashboardRoute(item.path)}
          >
            <div className="bottom-nav__icon">{item.icon}</div>
            <span className="bottom-nav__label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
