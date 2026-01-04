import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DemoView } from './demo.types';

interface DemoFooterProps {
  currentView: DemoView;
  onViewChange: (view: DemoView) => void;
  onClose: () => void;
}

const DemoFooter: React.FC<DemoFooterProps> = React.memo(({ currentView, onViewChange, onClose }) => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    onClose(); // Zamknij modal demo
    navigate('/register'); // Przekieruj do rejestracji
  };

  return (
  <div className="demo__footer">
    <div className="demo__view-selector">
      <button
        className={`demo__view-btn ${currentView === 'dashboard' ? 'active' : ''}`}
        onClick={() => onViewChange('dashboard')}
      >
        Dashboard
      </button>
      <button
        className={`demo__view-btn ${currentView === 'events' ? 'active' : ''}`}
        onClick={() => onViewChange('events')}
      >
        Wydarzenia
      </button>
      <button
        className={`demo__view-btn ${currentView === 'analytics' ? 'active' : ''}`}
        onClick={() => onViewChange('analytics')}
      >
        Analityki
      </button>
    </div>
    <div className="demo__cta">
      <p>Gotowy na start? Załóż konto już dziś!</p>
            <button className="demo__start-btn" onClick={handleStartClick} aria-label="Rozpocznij bezpłatny okres próbny PartyPass">
              Rozpocznij
              <ArrowRight size={16} aria-hidden="true" />
            </button>
    </div>
  </div>
  );
});

DemoFooter.displayName = 'DemoFooter';

export default DemoFooter;


