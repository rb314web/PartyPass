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
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Icon size={48} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {action && (
        <button
          className="empty-state__action"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;