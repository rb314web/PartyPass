// components/dashboard/DashboardHome/PlanSummary.tsx
import React from 'react';
import { useAuth } from '../../../hooks/useAuth';

// Możesz tu podać limity dla każdego planu
const PLAN_LIMITS: Record<string, { maxEvents: number; maxGuests: number }> = {
  starter: { maxEvents: 3, maxGuests: 50 },
  pro: { maxEvents: 20, maxGuests: 500 },
  enterprise: { maxEvents: 100, maxGuests: 5000 },
};

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
  const limits = PLAN_LIMITS[plan];

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
            {totalEvents} / {limits.maxEvents}
          </strong>
        </div>
        <div className="plan-summary__row">
          <span>Goście:</span>
          <strong>
            {totalGuests} / {limits.maxGuests}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default PlanSummary;
export {};
