// components/common/LoadingSpinner/LoadingSpinner.tsx
import React from 'react';
import './LoadingSpinner.scss';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text 
}) => {
  return (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div className="loading-spinner__circle"></div>
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;