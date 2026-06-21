import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DemoFooterProps {
  onClose: () => void;
}

const DemoFooter: React.FC<DemoFooterProps> = React.memo(({ onClose }) => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    onClose();
    navigate('/register');
  };

  return (
    <div className="demo__footer">
      <div className="demo__cta">
        <p>Gotowy na start? Załóż konto już dziś!</p>
        <button
          className="demo__start-btn"
          onClick={handleStartClick}
          aria-label="Rozpocznij bezpłatny okres próbny PartyPass"
        >
          Rozpocznij
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

DemoFooter.displayName = 'DemoFooter';

export default DemoFooter;
