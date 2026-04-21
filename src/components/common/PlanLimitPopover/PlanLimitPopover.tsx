import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ArrowUpRight, Zap } from 'lucide-react';
import './PlanLimitPopover.scss';

interface PlanLimitPopoverProps {
  children: React.ReactNode;
  limitMessage: string;
  isLimitReached: boolean;
}

const PlanLimitPopover: React.FC<PlanLimitPopoverProps> = ({
  children,
  limitMessage,
  isLimitReached,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!isLimitReached) {
    return <>{children}</>;
  }

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
  };

  const hide = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(false), 120);
  };

  const handleUpgrade = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    navigate('/dashboard/plan');
  };

  return (
    <div
      className="plan-limit-popover__wrapper"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}

      {isVisible && (
        <div
          className="plan-limit-popover"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <div className="plan-limit-popover__arrow" />

          <div className="plan-limit-popover__header">
            <div className="plan-limit-popover__icon">
              <Crown size={16} />
            </div>
            <span className="plan-limit-popover__title">Osiągnięto limit planu</span>
          </div>

          <p className="plan-limit-popover__message">{limitMessage}</p>

          <button className="plan-limit-popover__cta" onClick={handleUpgrade}>
            <Zap size={14} />
            <span>Zmień plan</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PlanLimitPopover;
