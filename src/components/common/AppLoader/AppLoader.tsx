import React from 'react';
import './AppLoader.scss';

interface AppLoaderProps {
  message?: string;
}

const AppLoader: React.FC<AppLoaderProps> = ({ 
  message = "Ładowanie..." 
}) => {
  return (
    <div className="app-loader">
      <div className="app-loader__container">
        <div className="app-loader__spinner"></div>
        <div className="app-loader__message">{message}</div>
      </div>
    </div>
  );
};

export default AppLoader;
