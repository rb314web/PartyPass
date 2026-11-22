// components/dashboard/Sidebar/Sidebar.tsx
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';
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
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import Logo from '../../common/Logo/Logo';
import { useThemeContext } from '../../common/ThemeProvider/ThemeProvider';
import { preloadDashboardRoute } from '../../../utils/preloadDashboardRoute';
import './Sidebar.scss';

interface SidebarProps {
  isCollapsed?: boolean;
  onCollapsedToggle?: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: externalCollapsed,
  onCollapsedToggle,
  isMobileOpen,
  onMobileToggle,
}) => {
  const [isCompactScreen, setIsCompactScreen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { isDark } = useThemeContext();
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

  const menuItems = [
    { icon: Home, label: t('nav.dashboard'), path: '/dashboard', exact: true },
    { icon: Search, label: t('nav.search'), path: '/dashboard/search' },
    { icon: Calendar, label: t('nav.events'), path: '/dashboard/events' },
    { icon: Users, label: t('nav.contacts'), path: '/dashboard/contacts' },
    { icon: Activity, label: t('nav.activities'), path: '/dashboard/activities' },
    { icon: BarChart3, label: t('nav.analytics'), path: '/dashboard/analytics' },
    { icon: Crown, label: t('nav.plan'), path: '/dashboard/plan' },
    { icon: Settings, label: t('nav.settings'), path: '/dashboard/settings' },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Przesuwany wskaźnik aktywnej karty
  const menuRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    visible: boolean;
  }>({ top: 0, left: 0, width: 0, height: 0, visible: false });
  const [indicatorReady, setIndicatorReady] = useState(false);

  const activePath =
    menuItems.find(item => isActive(item.path, item.exact))?.path ?? null;

  const measureIndicator = useCallback(() => {
    const el = activePath ? linkRefs.current[activePath] : null;
    if (!el) {
      setIndicator(prev => ({ ...prev, visible: false }));
      return;
    }
    setIndicator({
      top: el.offsetTop,
      left: el.offsetLeft,
      width: el.offsetWidth,
      height: el.offsetHeight,
      visible: true,
    });
  }, [activePath]);

  useLayoutEffect(() => {
    measureIndicator();
  }, [measureIndicator, isCollapsed]);

  // Włącz animację dopiero po pierwszym pomiarze (bez „wjazdu” od góry)
  useEffect(() => {
    if (indicator.visible && !indicatorReady) {
      const id = requestAnimationFrame(() => setIndicatorReady(true));
      return () => cancelAnimationFrame(id);
    }
  }, [indicator.visible, indicatorReady]);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(() => measureIndicator());
    observer.observe(menu);
    return () => observer.disconnect();
  }, [measureIndicator]);

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
            wordmark
            tone={isDark ? 'on-dark' : 'default'}
            collapsed={isCollapsed}
            className="sidebar__logo"
          />
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__menu" ref={menuRef}>
            <li
              aria-hidden="true"
              className={`sidebar__indicator ${indicatorReady ? 'sidebar__indicator--animated' : ''} ${indicator.visible ? '' : 'sidebar__indicator--hidden'}`}
              style={{
                transform: `translate3d(${indicator.left}px, ${indicator.top}px, 0)`,
                width: indicator.width,
                height: indicator.height,
              }}
            />
            {menuItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  ref={el => {
                    linkRefs.current[item.path] = el;
                  }}
                  aria-current={
                    activePath === item.path ? 'page' : undefined
                  }
                  className={`sidebar__link ${isActive(item.path, item.exact) ? 'sidebar__link--active' : ''}`}
                  title={item.label}
                  onMouseEnter={() => preloadDashboardRoute(item.path)}
                  onFocus={() => preloadDashboardRoute(item.path)}
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
            title={t('nav.logout')}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>
  );
};

export default Sidebar;
