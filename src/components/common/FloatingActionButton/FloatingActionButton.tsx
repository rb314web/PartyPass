// components/common/FloatingActionButton/FloatingActionButton.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, Users, BarChart3, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './FloatingActionButton.scss';

interface ActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  shortcut?: string;
  color?: string;
}

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Ukryj FAB na niektórych stronach
  useEffect(() => {
    const hideOnPages = ['/login', '/register', '/'];
    setIsVisible(!hideOnPages.includes(location.pathname));
  }, [location.pathname]);

  const actions: ActionItem[] = [
    {
      id: 'new-event',
      label: 'Nowe wydarzenie',
      icon: <Calendar size={20} />,
      path: '/dashboard/events/create',
      shortcut: 'Ctrl+N',
      color: 'primary'
    },
    {
      id: 'new-guest',
      label: 'Dodaj gościa',
      icon: <Users size={20} />,
      path: '/dashboard/guests/create',
      shortcut: 'Ctrl+G',
      color: 'success'
    },
    {
      id: 'analytics',
      label: 'Analityka',
      icon: <BarChart3 size={20} />,
      path: '/dashboard/analytics',
      shortcut: 'Ctrl+A',
      color: 'info'
    }
  ];

  const handleActionClick = (action: ActionItem) => {
    navigate(action.path);
    setIsOpen(false);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          navigate('/dashboard/events/create');
          break;
        case 'g':
          e.preventDefault();
          navigate('/dashboard/guests/create');
          break;
        case 'a':
          e.preventDefault();
          navigate('/dashboard/analytics');
          break;
      }
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, handleKeyDown]);

  if (!isVisible) return null;

  return (
    <div className="fab">
      {/* Akcje */}
      {isOpen && (
        <div className="fab__actions">
          {actions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={`fab__action fab__action--${action.color}`}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
              title={`${action.label} (${action.shortcut})`}
            >
              <div className="fab__action-icon">
                {action.icon}
              </div>
              <span className="fab__action-label">{action.label}</span>
              <span className="fab__action-shortcut">{action.shortcut}</span>
            </button>
          ))}
        </div>
      )}

      {/* Główny przycisk */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fab__main ${isOpen ? 'fab__main--open' : ''}`}
        title={isOpen ? 'Zamknij menu' : 'Szybkie akcje'}
        aria-label={isOpen ? 'Zamknij menu szybkich akcji' : 'Otwórz menu szybkich akcji'}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fab__overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FloatingActionButton;
