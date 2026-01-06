// components/common/Logo/Logo.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../../../assets/logo/party-pass-logo.svg';
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
   * Whether to render the graphic mark.
   * Left in place for backwards compatibility with legacy layouts.
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
  showIcon = false,
  className = '',
  collapsed = false,
}) => {
  // Debug: sprawdź czy collapsed przechodzi
  console.log('Logo collapsed:', collapsed);
  
  const logoClasses = [
    'logo',
    `logo--${size}`,
    collapsed && 'logo--collapsed',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const graphic = showIcon ? (
    <span className="logo__image-wrapper" aria-hidden="true">
      <img
        src={logoImage}
        alt=""
        className="logo__image"
        loading="lazy"
        decoding="async"
      />
    </span>
  ) : null;

  const textFallback = (
    <span className="logo__text">
      <span className="logo__text-main">
        <span className="logo__letter logo__letter--first">P</span>
        <span className="logo__letter logo__letter--middle">arty</span>
      </span>
      <span className="logo__text-accent">
        <span className="logo__letter logo__letter--first">P</span>
        <span className="logo__letter logo__letter--middle">ass</span>
      </span>
    </span>
  );

  const content = (
    <>
      {graphic}
      {textFallback}
      <span className="logo__sr-only">PartyPass</span>
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
