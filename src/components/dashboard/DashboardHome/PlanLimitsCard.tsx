// components/dashboard/DashboardHome/PlanLimitsCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ArrowUpRight, Check, Zap } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import './PlanLimitsCard.scss';

const PLAN_LIMITS: Record<string, { maxEvents: number; maxGuests: number }> = {
  starter: { maxEvents: 3, maxGuests: 50 },
  pro: { maxEvents: 15, maxGuests: 200 },
  enterprise: { maxEvents: -1, maxGuests: -1 }, // unlimited
};

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['Podstawowe zaproszenia', 'Email support', 'Podstawowe statystyki', 'RSVP system', 'Zarządzanie gośćmi'],
  pro: ['Spersonalizowane zaproszenia', 'SMS powiadomienia', 'Zaawansowane analityki', 'QR kody', 'Export danych', 'Priority support'],
  enterprise: ['Custom branding', 'API dostęp', '24/7 support', 'Integracje z CRM', 'Dedykowany manager', 'White-label'],
};

const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  starter: { monthly: 0, yearly: 0 },
  pro: { monthly: 29, yearly: 290 },
  enterprise: { monthly: 99, yearly: 990 },
};

const NEXT_PLAN_BENEFITS: Record<string, string[]> = {
  starter: ['15 wydarzeń miesięcznie', '200 gości na wydarzenie', 'SMS powiadomienia', 'Zaawansowane analityki'],
  pro: ['Nieograniczone wydarzenia', 'Nieograniczona liczba gości', 'Custom branding', 'API dostęp'],
  enterprise: [],
};

interface PlanLimitsCardProps {
  usedEvents: number;
  usedGuests: number;
  eventsThisMonth?: number;
  guestsThisMonth?: number;
}

const PlanLimitsCard: React.FC<PlanLimitsCardProps> = ({
  usedEvents,
  usedGuests,
  eventsThisMonth = 0,
  guestsThisMonth = 0,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const planType = user.planType || 'starter';
  const limits = PLAN_LIMITS[planType] || PLAN_LIMITS.starter;

  const eventsPercentage =
    limits.maxEvents === -1
      ? 0
      : Math.min(100, Math.round((usedEvents / limits.maxEvents) * 100));
  const guestsPercentage =
    limits.maxGuests === -1
      ? 0
      : Math.min(100, Math.round((usedGuests / limits.maxGuests) * 100));

  const isNearLimit =
    (limits.maxEvents !== -1 && eventsPercentage >= 80) ||
    (limits.maxGuests !== -1 && guestsPercentage >= 80);

  const remainingEvents = limits.maxEvents === -1 ? null : limits.maxEvents - usedEvents;
  const remainingGuests = limits.maxGuests === -1 ? null : limits.maxGuests - usedGuests;

  const features = PLAN_FEATURES[planType] || [];
  const nextPlanBenefits = NEXT_PLAN_BENEFITS[planType] || [];
  const planPrice = PLAN_PRICES[planType] || PLAN_PRICES.starter;

  const handleUpgrade = () => {
    navigate('/dashboard/settings?tab=plan');
  };

  const getPlanDescription = () => {
    switch (planType) {
      case 'starter':
        return 'Idealny do rozpoczęcia';
      case 'pro':
        return 'Dla profesjonalistów';
      case 'enterprise':
        return 'Bez limitu';
      default:
        return 'Wykorzystane limity';
    }
  };

  return (
    <div className={`plan-limits-card ${isNearLimit ? 'plan-limits-card--warning' : ''}`}>
      <div className="plan-limits-card__header">
        <div className="plan-limits-card__icon">
          <Crown size={20} />
        </div>
        <div className="plan-limits-card__title">
          <h3>Plan {planType.charAt(0).toUpperCase() + planType.slice(1)}</h3>
          <p className="plan-limits-card__subtitle-mobile">Wykorzystane limity</p>
          <p className="plan-limits-card__subtitle-desktop">{getPlanDescription()}</p>
        </div>
      </div>

      <div className="plan-limits-card__content">
        <div className="plan-limits-card__limit">
          <div className="plan-limits-card__limit-header">
            <div className="plan-limits-card__limit-label">
              <span>Wydarzenia</span>
              {limits.maxEvents !== -1 && (
                <span className="plan-limits-card__limit-percent plan-limits-card__limit-percent--desktop">
                  {eventsPercentage}%
                </span>
              )}
            </div>
            <span className="plan-limits-card__limit-value">
              {usedEvents} / {limits.maxEvents === -1 ? '∞' : limits.maxEvents}
            </span>
          </div>
          {limits.maxEvents !== -1 && (
            <>
              <div className="plan-limits-card__progress">
                <div
                  className="plan-limits-card__progress-bar"
                  style={{ width: `${eventsPercentage}%` }}
                />
              </div>
              <div className="plan-limits-card__limit-info plan-limits-card__limit-info--desktop">
                <span className="plan-limits-card__limit-remaining">
                  Pozostało: {remainingEvents} {remainingEvents === 1 ? 'wydarzenie' : remainingEvents > 1 && remainingEvents < 5 ? 'wydarzenia' : 'wydarzeń'}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="plan-limits-card__limit">
          <div className="plan-limits-card__limit-header">
            <div className="plan-limits-card__limit-label">
              <span>Goście</span>
              {limits.maxGuests !== -1 && (
                <span className="plan-limits-card__limit-percent plan-limits-card__limit-percent--desktop">
                  {guestsPercentage}%
                </span>
              )}
            </div>
            <span className="plan-limits-card__limit-value">
              {usedGuests} / {limits.maxGuests === -1 ? '∞' : limits.maxGuests}
            </span>
          </div>
          {limits.maxGuests !== -1 && (
            <>
              <div className="plan-limits-card__progress">
                <div
                  className="plan-limits-card__progress-bar"
                  style={{ width: `${guestsPercentage}%` }}
                />
              </div>
              <div className="plan-limits-card__limit-info plan-limits-card__limit-info--desktop">
                <span className="plan-limits-card__limit-remaining">
                  Pozostało: {remainingGuests} {remainingGuests === 1 ? 'gość' : remainingGuests > 1 && remainingGuests < 5 ? 'gości' : 'gości'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Informacje o planie - tylko na większych ekranach */}
      <div className="plan-limits-card__plan-info plan-limits-card__plan-info--desktop">
        {planPrice.monthly > 0 && (
          <div className="plan-limits-card__plan-price">
            <span className="plan-limits-card__plan-price-amount">{planPrice.monthly} PLN</span>
            <span className="plan-limits-card__plan-price-period">/miesiąc</span>
          </div>
        )}
        {planPrice.monthly === 0 && (
          <div className="plan-limits-card__plan-badge plan-limits-card__plan-badge--free">
            Darmowy plan
          </div>
        )}
      </div>

      {/* Kluczowe funkcje planu - tylko na większych ekranach */}
      {features.length > 0 && (
        <div className="plan-limits-card__features plan-limits-card__features--desktop">
          <div className="plan-limits-card__features-title">Kluczowe funkcje:</div>
          <div className="plan-limits-card__features-list">
            {features.map((feature, idx) => (
              <div key={idx} className="plan-limits-card__feature">
                <Check size={12} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Co zyskasz po upgrade - tylko na większych ekranach */}
      {nextPlanBenefits.length > 0 && (
        <div className="plan-limits-card__upgrade-benefits plan-limits-card__upgrade-benefits--desktop">
          <div className="plan-limits-card__upgrade-benefits-title">
            <Zap size={14} />
            <span>Po upgrade zyskasz:</span>
          </div>
          <div className="plan-limits-card__upgrade-benefits-list">
            {nextPlanBenefits.slice(0, 2).map((benefit, idx) => (
              <div key={idx} className="plan-limits-card__upgrade-benefit">
                <ArrowUpRight size={10} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {planType !== 'enterprise' && (
        <button
          className="plan-limits-card__upgrade-btn"
          onClick={handleUpgrade}
        >
          <span>Rozwiń możliwości</span>
          <ArrowUpRight size={16} />
        </button>
      )}
    </div>
  );
};

export default PlanLimitsCard;

