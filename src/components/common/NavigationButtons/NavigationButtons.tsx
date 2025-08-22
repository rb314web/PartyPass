// components/common/NavigationButtons/NavigationButtons.tsx
import React from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { useNavigationHistory } from '../../../hooks/useNavigationHistory';
import './NavigationButtons.scss';

interface NavigationButtonsProps {
  showRefresh?: boolean;
  className?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ 
  showRefresh = true, 
  className = '' 
}) => {
  const { canGoBack, canGoForward, goBack, goForward } = useNavigationHistory();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={`navigation-buttons ${className}`}>
      <button
        onClick={goBack}
        disabled={!canGoBack}
        className="navigation-buttons__btn navigation-buttons__btn--back"
        title="Wstecz"
        aria-label="Przejdź do poprzedniej strony"
      >
        <ArrowLeft size={18} />
      </button>

      <button
        onClick={goForward}
        disabled={!canGoForward}
        className="navigation-buttons__btn navigation-buttons__btn--forward"
        title="Do przodu"
        aria-label="Przejdź do następnej strony"
      >
        <ArrowRight size={18} />
      </button>

      {showRefresh && (
        <button
          onClick={handleRefresh}
          className="navigation-buttons__btn navigation-buttons__btn--refresh"
          title="Odśwież"
          aria-label="Odśwież stronę"
        >
          <RotateCcw size={18} />
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;
