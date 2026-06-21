import React from 'react';
import type { LucideIcon } from 'lucide-react';
import './PageHeader.scss';

export interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  meta,
  actions,
  className = '',
}) => {
  return (
    <header className={`page-header ${className}`.trim()}>
      <div className="page-header__main">
        <div className="page-header__title-row">
          {Icon && (
            <span className="page-header__icon" aria-hidden="true">
              <Icon size={22} />
            </span>
          )}
          <h1 className="page-header__title">{title}</h1>
        </div>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        {meta && <div className="page-header__meta">{meta}</div>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
};

export default PageHeader;
