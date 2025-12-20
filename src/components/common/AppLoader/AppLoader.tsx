import React from 'react';
import './AppLoader.scss';

const AppLoader: React.FC = () => {
  return (
    <div className="app-loader">
      <div className="app-loader__spinner"></div>
    </div>
  );
};

export default AppLoader;
