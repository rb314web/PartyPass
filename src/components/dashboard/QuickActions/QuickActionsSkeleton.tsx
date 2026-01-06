// components/dashboard/QuickActions/QuickActionsSkeleton.tsx
import React from 'react';
import './QuickActionsSkeleton.scss';

const QuickActionsSkeleton: React.FC = () => {
  return (
    <div className="quick-actions-skeleton">
      {[1, 2, 3, 4].map((index) => (
        <div key={index} className="quick-actions-skeleton__btn skeleton-shimmer" />
      ))}
    </div>
  );
};

export default QuickActionsSkeleton;
