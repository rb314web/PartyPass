// components/common/Logo/Logo.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.scss';

export interface LogoProps {
  /**
   * Size variant of the logo
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Link destination when logo is clicked
   * @default '/'
   */
  href?: string;

  /**
   * Whether to show the emoji icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Custom className for additional styling
   */
  className?: string;

  /**
   * Whether the logo is in a collapsed state (icon only)
   * @default false
   */
  collapsed?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  href = '/',
  showIcon = true,
  className = '',
  collapsed = false,
}) => {
  const logoClasses = [
    'logo',
    `logo--${size}`,
    collapsed && 'logo--collapsed',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {showIcon && (
        <span className="logo__emoji" aria-hidden="true">
          🎉
        </span>
      )}
      {!collapsed && (
        <span className="logo__text">
          <span className="logo__text-main">Party</span>
          <span className="logo__text-accent">Pass</span>
        </span>
      )}
    </>
  );

  // External link
  if (href.startsWith('http')) {
    return (
      <a
        href={href}
        className={logoClasses}
        aria-label="PartyPass - przejdź do strony głównej"
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  // Internal link
  return (
    <Link
      to={href}
      className={logoClasses}
      aria-label="PartyPass - przejdź do strony głównej"
    >
      {content}
    </Link>
  );
};

export default React.memo(Logo);
