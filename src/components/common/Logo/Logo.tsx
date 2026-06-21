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

  /**
   * „Party” + „Pass” jak w UnifiedHeader (spójne z resztą dashboardu)
   * @default false
   */
  wordmark?: boolean;

  /**
   * Kolory wordmarku na ciemnym tle (np. sidebar w trybie ciemnym)
   * @default 'default'
   */
  tone?: 'default' | 'on-dark';
}

const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  href = '/',
  showIcon = false,
  className = '',
  collapsed = false,
  wordmark = false,
  tone = 'default',
}) => {
  const logoClasses = [
    'logo',
    `logo--${size}`,
    collapsed && 'logo--collapsed',
    wordmark && 'logo--wordmark',
    tone === 'on-dark' && 'logo--on-dark',
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

  const wordmarkBody =
    collapsed && wordmark ? (
      <span className="logo__text logo__text--monogram">
        <span className="logo__text--primary">P</span>
        <span className="logo__text--accent">P</span>
      </span>
    ) : (
      <span className="logo__text">
        <span className="logo__text--primary">Party</span>
        <span className="logo__text--accent">Pass</span>
      </span>
    );

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
      {wordmark ? wordmarkBody : textFallback}
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
