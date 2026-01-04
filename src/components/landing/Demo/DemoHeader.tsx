import React from 'react';
import { X } from 'lucide-react';

interface DemoHeaderProps {
  onClose: () => void;
}

const DemoHeader: React.FC<DemoHeaderProps> = React.memo(({ onClose }) => (
  <div className="demo__header">
    <div className="demo__title">
      <h2 id="demo-title">PartyPass Dashboard - Demo</h2>
      <p>Pełny podgląd aplikacji z przykładowymi danymi</p>
    </div>
    <button className="demo__close" onClick={onClose} aria-label="Zamknij demo">
      <X size={24} aria-hidden="true" />
    </button>
  </div>
));

DemoHeader.displayName = 'DemoHeader';

export default DemoHeader;


