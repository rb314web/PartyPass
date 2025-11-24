// components/common/FloatingActionButton/FloatingActionButton.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './FloatingActionButton.scss';

const FloatingActionButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  // Ukryj FAB na niektórych stronach
  useEffect(() => {
    const hideOnPages = ['/login', '/register', '/'];
    setIsVisible(!hideOnPages.includes(location.pathname));
  }, [location.pathname]);

  if (!isVisible) return null;

  return (
    <div className="fab">
      {/* Akcje */}
      {/* Wszystkie akcje usunięte na żądanie */}

      {/* Główny przycisk usunięty na żądanie */}
    </div>
  );
};

export default FloatingActionButton;
