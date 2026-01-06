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
  isCollapsed?: boolean;
  onCollapsedToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: externalCollapsed,
  onCollapsedToggle,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isCompactScreen, setIsCompactScreen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Check if screen is in compact range (500px-1200px)
  useEffect(() => {
    const checkCompactScreen = () => {
      const width = window.innerWidth;
      setIsCompactScreen(width >= 500 && width <= 1200);
    };

    checkCompactScreen();
    window.addEventListener('resize', checkCompactScreen);
    return () => window.removeEventListener('resize', checkCompactScreen);
  }, []);

  // Auto collapse based on screen width only
  const isCollapsed = isCompactScreen;

  // Debug: sprawdź wartości
  console.log('Sidebar - isCompactScreen:', isCompactScreen);
  console.log('Sidebar - final isCollapsed:', isCollapsed);

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

  return (
    <aside
      id="sidebar"
      className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}
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
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__menu">
            {menuItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar__link ${isActive(item.path, item.exact) ? 'sidebar__link--active' : ''}`}
                  title={item.label}
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
            <Link to="/dashboard/settings" className="sidebar__user">
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
            </Link>
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
  );
};

export default Sidebar;
