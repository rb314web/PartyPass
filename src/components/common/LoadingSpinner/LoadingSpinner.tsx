// components/common/LoadingSpinner/LoadingSpinner.tsx
import React from 'react';
import './LoadingSpinner.scss';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
}) => {
  return (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div className="loading-spinner__circle"></div>
    </div>
  );
};

export default LoadingSpinner;
