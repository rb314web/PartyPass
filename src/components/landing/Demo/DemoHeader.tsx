import React from 'react';
import { Search, Mail, X } from 'lucide-react';

interface DemoHeaderProps {
  onMobileToggle: () => void;
}

const DemoHeader: React.FC<DemoHeaderProps> = ({ onMobileToggle }) => (
  <>
    {/* Header */}
    <div className="demo__header">
      <div className="demo__title">
        <h2>PartyPass Dashboard - Demo</h2>
        <p>Pełny podgląd aplikacji z przykładowymi danymi</p>
      </div>
      <button className="demo__close" onClick={() => window.history.back()}>
        <X size={24} aria-hidden="true" />
      </button>
    </div>

    {/* Top header */}
    <div className="demo__top-header">
      <button
        className="demo__mobile-toggle"
        onClick={onMobileToggle}
        aria-label="Przełącz menu nawigacyjne"
      >
        <X size={20} aria-hidden="true" />
      </button>

      <div className="demo__header-actions">
        <button className="demo__header-btn" aria-label="Otwórz wyszukiwanie">
          <Search size={20} aria-hidden="true" />
        </button>
        <button className="demo__header-btn" aria-label="Otwórz skrzynkę odbiorczą, 3 nowe wiadomości">
          <Mail size={20} aria-hidden="true" />
          <span className="demo__notification-badge" aria-hidden="true">3</span>
        </button>
      </div>
    </div>
  </>
);

export default DemoHeader;


