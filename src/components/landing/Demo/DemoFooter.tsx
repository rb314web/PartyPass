import React from 'react';
import { ArrowRight } from 'lucide-react';

interface DemoFooterProps {
  currentView: 'dashboard' | 'events' | 'analytics';
  onViewChange: (view: 'dashboard' | 'events' | 'analytics') => void;
  onClose: () => void;
}

const DemoFooter: React.FC<DemoFooterProps> = ({ currentView, onViewChange, onClose }) => (
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
      <p>Gotowy na start? Załóż darmowe konto już dziś!</p>
      <button className="demo__start-btn" onClick={onClose} aria-label="Rozpocznij bezpłatny okres próbny PartyPass">
        Rozpocznij za darmo
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </div>
  </div>
);

export default DemoFooter;


