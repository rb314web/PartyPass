// components/dashboard/DashboardHome/PlanSummary.tsx
import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getPlanLimits, PlanType } from '../../../services/firebase/planLimitsService';

interface PlanSummaryProps {
  totalEvents: number;
  totalGuests: number;
}

const PlanSummary: React.FC<PlanSummaryProps> = ({
  totalEvents,
  totalGuests,
}) => {
  const { user } = useAuth();
  if (!user) return null;
  const plan = user.planType || 'starter';
  const limits = getPlanLimits(plan as PlanType);

  return (
    <div className="plan-summary">
      <div className="plan-summary__icon">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      </div>
      <div className="plan-summary__content">
        <div className="plan-summary__row">
          <span>Plan:</span>
          <strong>{plan.charAt(0).toUpperCase() + plan.slice(1)}</strong>
        </div>
        <div className="plan-summary__row">
          <span>Wydarzenia:</span>
          <strong>
            {totalEvents} / {!isFinite(limits.events) ? '∞' : limits.events}
          </strong>
        </div>
        <div className="plan-summary__row">
          <span>Goście:</span>
          <strong>
            {totalGuests} / {!isFinite(limits.guests) ? '∞' : limits.guests}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default PlanSummary;
export {};
