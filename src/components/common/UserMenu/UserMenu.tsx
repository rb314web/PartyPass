// components/common/UserMenu/UserMenu.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Crown,
  Mail,
  Shield,
  LayoutDashboard,
} from 'lucide-react';
import './UserMenu.scss';

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  planType?: 'starter' | 'pro' | 'enterprise';
}

export interface UserMenuProps {
  user: UserData;
  onLogout: () => void;
  variant?: 'header' | 'sidebar';
  className?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onLogout,
  variant = 'header',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getPlanBadge = () => {
    const badges = {
      starter: { label: 'Starter', color: 'gray', icon: <Mail size={12} /> },
      pro: { label: 'Pro', color: 'primary', icon: <Crown size={12} /> },
      enterprise: {
        label: 'Enterprise',
        color: 'gold',
        icon: <Shield size={12} />,
      },
    };
    return badges[user.planType || 'starter'];
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  const menuClasses = [
    'user-menu',
    `user-menu--${variant}`,
    isOpen && 'user-menu--open',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const planBadge = getPlanBadge();
  const userInitials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <div ref={menuRef} className={menuClasses}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="user-menu__trigger"
        aria-label={`Menu użytkownika ${user.firstName}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="user-menu__avatar" aria-hidden="true">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              className="user-menu__avatar-img"
            />
          ) : (
            <span className="user-menu__avatar-initials">{userInitials}</span>
          )}
        </div>
        <div className="user-menu__info">
          <span className="user-menu__name">
            {user.firstName} {user.lastName}
          </span>
          <span
            className={`user-menu__plan user-menu__plan--${planBadge.color}`}
          >
            {planBadge.icon}
            {planBadge.label}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`user-menu__chevron ${isOpen ? 'user-menu__chevron--open' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__dropdown-header">
            <div className="user-menu__dropdown-avatar">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>
            <div className="user-menu__dropdown-info">
              <div className="user-menu__dropdown-name">
                {user.firstName} {user.lastName}
              </div>
              <div className="user-menu__dropdown-email">{user.email}</div>
              <div
                className={`user-menu__dropdown-badge user-menu__dropdown-badge--${planBadge.color}`}
              >
                {planBadge.icon}
                {planBadge.label}
              </div>
            </div>
          </div>

          <div className="user-menu__dropdown-divider" />

          <button
            onClick={() => handleNavigate('/dashboard')}
            className="user-menu__dropdown-item"
            role="menuitem"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleNavigate('/dashboard/settings')}
            className="user-menu__dropdown-item"
            role="menuitem"
          >
            <User size={18} />
            <span>Profil</span>
          </button>

          <button
            onClick={() => handleNavigate('/dashboard/settings')}
            className="user-menu__dropdown-item"
            role="menuitem"
          >
            <Settings size={18} />
            <span>Ustawienia</span>
          </button>

          <div className="user-menu__dropdown-divider" />

          <button
            onClick={handleLogoutClick}
            className="user-menu__dropdown-item user-menu__dropdown-item--danger"
            role="menuitem"
          >
            <LogOut size={18} />
            <span>Wyloguj się</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(UserMenu);
