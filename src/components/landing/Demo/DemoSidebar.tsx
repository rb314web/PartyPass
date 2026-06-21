import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Crown,
  Activity,
  Search,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { useThemeContext } from '../../common/ThemeProvider/ThemeProvider';
import Logo from '../../common/Logo/Logo';
import { DemoView } from './demo.types';
import '../../dashboard/Sidebar/Sidebar.scss';

const menuItems: Array<{
  icon: typeof Home;
  labelKey: string;
  view: DemoView;
  path: string;
  exact?: boolean;
}> = [
  { icon: Home, labelKey: 'nav.dashboard', view: 'dashboard', path: '/demo', exact: true },
  { icon: Search, labelKey: 'nav.search', view: 'search', path: '/demo/search' },
  { icon: Calendar, labelKey: 'nav.events', view: 'events', path: '/demo/events' },
  { icon: Users, labelKey: 'nav.contacts', view: 'contacts', path: '/demo/contacts' },
  { icon: Activity, labelKey: 'nav.activities', view: 'activities', path: '/demo/activities' },
  { icon: BarChart3, labelKey: 'nav.analytics', view: 'analytics', path: '/demo/analytics' },
  { icon: Crown, labelKey: 'nav.plan', view: 'plan', path: '/demo/plan' },
  { icon: Settings, labelKey: 'nav.settings', view: 'settings', path: '/demo/settings' },
];

interface DemoSidebarBaseProps {
  isMobileOpen?: boolean;
}

interface DemoSidebarRouterProps extends DemoSidebarBaseProps {
  mode: 'router';
}

interface DemoSidebarStateProps extends DemoSidebarBaseProps {
  mode: 'state';
  currentView: DemoView;
  onViewChange: (view: DemoView) => void;
}

export type DemoSidebarProps = DemoSidebarRouterProps | DemoSidebarStateProps;

const DemoSidebar: React.FC<DemoSidebarProps> = props => {
  const [isCompactScreen, setIsCompactScreen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { isDark } = useThemeContext();
  const location = useLocation();

  useEffect(() => {
    const checkCompactScreen = () => {
      const width = window.innerWidth;
      setIsCompactScreen(width >= 500 && width <= 1200);
    };

    checkCompactScreen();
    window.addEventListener('resize', checkCompactScreen);
    return () => window.removeEventListener('resize', checkCompactScreen);
  }, []);

  const isCollapsed = isCompactScreen;

  const getPlanBadge = () => {
    const badges = {
      starter: { label: 'Starter', color: 'gray' },
      pro: { label: 'Pro', color: 'primary' },
      enterprise: { label: 'Enterprise', color: 'gold' },
    };
    return badges[user?.planType || 'starter'];
  };

  const isActivePath = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (
    item: (typeof menuItems)[number],
    isActive: boolean,
    onClick?: () => void
  ) => {
    const className = `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`;
    const content = (
      <>
        <item.icon size={20} />
        {!isCollapsed && <span>{t(item.labelKey)}</span>}
      </>
    );

    if (props.mode === 'router') {
      return (
        <Link
          to={item.path}
          className={className}
          title={t(item.labelKey)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        type="button"
        className={className}
        title={t(item.labelKey)}
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
      >
        {content}
      </button>
    );
  };

  return (
    <aside
      id="sidebar"
      className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}
      role="navigation"
      aria-label="Menu nawigacyjne demo"
    >
      <div className="sidebar__header">
        <Logo
          size="small"
          href={props.mode === 'router' ? '/demo' : '/'}
          showIcon={false}
          wordmark
          tone={isDark ? 'on-dark' : 'default'}
          collapsed={isCollapsed}
          className="sidebar__logo"
        />
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems.map(item => {
            const isActive =
              props.mode === 'router'
                ? isActivePath(item.path, item.exact)
                : props.currentView === item.view;

            return (
              <li key={item.view}>
                {renderNavItem(
                  item,
                  isActive,
                  props.mode === 'state'
                    ? () => props.onViewChange(item.view)
                    : undefined
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar__footer">
        {user && (
          props.mode === 'router' ? (
            <Link to="/demo/settings" className="sidebar__user">
              <div className="sidebar__user-avatar">
                <div className="sidebar__user-avatar-placeholder">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
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
          ) : (
            <button
              type="button"
              className="sidebar__user"
              onClick={() => props.onViewChange('settings')}
            >
              <div className="sidebar__user-avatar">
                <div className="sidebar__user-avatar-placeholder">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
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
            </button>
          )
        )}

        <button
          className="sidebar__logout"
          onClick={() => logout()}
          title={t('nav.logout')}
          type="button"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>{t('nav.logout')}</span>}
        </button>
      </div>
    </aside>
  );
};

export default DemoSidebar;
