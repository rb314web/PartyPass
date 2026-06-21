// components/common/EmptyState/EmptyState.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import './EmptyState.scss';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`.trim()}>
      <div className="empty-state__icon" aria-hidden="true">
        <Icon size={48} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {action && (
        <button
          type="button"
          className="pp-btn pp-btn--primary"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
