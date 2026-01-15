// components/common/LoadingSpinner/LoadingSpinner.tsx
import React from 'react';
import './LoadingSpinner.scss';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'simple' | 'full';
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'simple',
  icon,
  title = 'Ładowanie...',
  subtitle = 'Przygotowujemy dane',
  className = '',
}) => {
  // Simple spinner for inline use
  if (variant === 'simple') {
    return (
      <div className={`loading-spinner loading-spinner--${size} ${className}`}>
        <div className="loading-spinner__circle"></div>
      </div>
    );
  }

  // Full spinner with icon and text for page-level loading
  return (
    <div className={`loading-spinner-full ${className}`}>
      <div className="loading-spinner-full__wrapper">
        <div className="loading-spinner-full__ring"></div>
        <div className="loading-spinner-full__ring loading-spinner-full__ring--delay"></div>
        {icon && <div className="loading-spinner-full__icon">{icon}</div>}
      </div>
      {title && <h3 className="loading-spinner-full__title">{title}</h3>}
      {subtitle && <p className="loading-spinner-full__subtitle">{subtitle}</p>}
    </div>
  );
};

export default LoadingSpinner;
