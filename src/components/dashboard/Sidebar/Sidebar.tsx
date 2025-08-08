// components/dashboard/Sidebar/Sidebar.tsx
import React, { useState } from 'react';
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
  Crown
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import './Sidebar.scss';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', exact: true },
    { icon: Calendar, label: 'Wydarzenia', path: '/dashboard/events' },
    { icon: Users, label: 'Goście', path: '/dashboard/guests' },
    { icon: BarChart3, label: 'Analityki', path: '/dashboard/analytics' },
    { icon: Settings, label: 'Ustawienia', path: '/dashboard/settings' }
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
      enterprise: { label: 'Enterprise', color: 'gold' }
    };
    return badges[user?.planType || 'starter'];
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="sidebar__overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile toggle */}
      <button 
        className="sidebar__mobile-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''} ${isMobileOpen ? 'sidebar--mobile-open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="sidebar__logo-icon">🎉</div>
            {!isCollapsed && <span className="sidebar__logo-text">PartyPass</span>}
          </div>
          
          <button 
            className="sidebar__collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__menu">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar__link ${isActive(item.path, item.exact) ? 'sidebar__link--active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
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
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                )}
              </div>
              
              {!isCollapsed && (
                <div className="sidebar__user-info">
                  <div className="sidebar__user-name">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className={`sidebar__user-plan sidebar__user-plan--${getPlanBadge().color}`}>
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