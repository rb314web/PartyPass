// components/common/BottomNavigation/BottomNavigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  Search
} from 'lucide-react';
import './BottomNavigation.scss';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <Home size={20} />,
      exact: true
    },
    {
      path: '/dashboard/search',
      label: 'Wyszukaj',
      icon: <Search size={20} />
    },
    {
      path: '/dashboard/events',
      label: 'Wydarzenia',
      icon: <Calendar size={20} />
    },
    {
      path: '/dashboard/guests',
      label: 'Goście',
      icon: <Users size={20} />
    },
    {
      path: '/dashboard/analytics',
      label: 'Analityka',
      icon: <BarChart3 size={20} />
    },
    {
      path: '/dashboard/settings',
      label: 'Ustawienia',
      icon: <Settings size={20} />
    }
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
    <nav className="bottom-nav" role="navigation" aria-label="Nawigacja mobilna">
      <div className="bottom-nav__container">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav__item ${isActive(item) ? 'bottom-nav__item--active' : ''}`}
            aria-label={item.label}
          >
            <div className="bottom-nav__icon">
              {item.icon}
            </div>
            <span className="bottom-nav__label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
