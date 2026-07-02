// components/landing/PricingPlans/PricingPlans.tsx
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Plan } from '../../../types';
import { getLandingPlans } from '../../../constants/plans';
import type { PlanType } from '../../../services/firebase/planLimitsService';
import './PricingPlans.scss';

const PricingPlans: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const plans: Plan[] = useMemo(() => getLandingPlans(t), [t]);

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'pro':
        return <Star size={24} />;
      case 'enterprise':
        return <Crown size={24} />;
      default:
        return <Zap size={24} />;
    }
  };

  const getPlanFeatures = (planId: string): string[] => {
    const features = t(`landing.pricing.plans.${planId}.features`, {
      returnObjects: true,
    });
    if (!Array.isArray(features)) return [];
    return features.filter((feature): feature is string => typeof feature === 'string');
  };

  const getDisplayPrice = (plan: Plan) => {
    if (plan.price === 0) {
      return (
        <div>
          <span className="pricing-plans__price">{t('landing.pricing.free')}</span>
        </div>
      );
    }

    return (
      <div>
        <span className="pricing-plans__price">
          {plan.price} {plan.currency}
        </span>
        <span className="pricing-plans__price-interval">
          {t('landing.pricing.perMonth')}
        </span>
      </div>
    );
  };

  const getCtaLabel = (planId: PlanType) =>
    t(`landing.pricing.cta.${planId}`);

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === 'enterprise') {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    navigate(`/register?plan=${plan.id}`);
  };

  return (
    <section className="pricing-plans" id="pricing">
      <div className="pricing-plans__container">
        <div className="pricing-plans__header">
          <span className="pricing-plans__label">{t('landing.pricing.label')}</span>
          <h2 className="pricing-plans__title">
            {t('landing.pricing.title')}{' '}
            <span className="pricing-plans__title-highlight">
              {t('landing.pricing.titleHighlight')}
            </span>
          </h2>
          <p className="pricing-plans__subtitle">
            {t('landing.pricing.subtitle')}
          </p>
        </div>

        <div className="pricing-plans__grid">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`pricing-plans__card${
                plan.popular ? ' pricing-plans__card--popular' : ''
              }`}
            >
              {plan.popular && (
                <span className="pricing-plans__popular-badge">
                  {t('landing.pricing.mostPopular')}
                </span>
              )}
              <div className="pricing-plans__card-header">
                <div className="pricing-plans__plan-icon">
                  {getPlanIcon(plan.id)}
                </div>
                <h3 className="pricing-plans__plan-name">{plan.name}</h3>
                <div className="pricing-plans__plan-price">
                  {getDisplayPrice(plan)}
                </div>
              </div>

              <div className="pricing-plans__card-body">
                <ul className="pricing-plans__features">
                  {getPlanFeatures(plan.id).map((feature, index) => (
                    <li key={index} className="pricing-plans__feature">
                      <Check
                        size={20}
                        className="pricing-plans__feature-icon"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pricing-plans__card-footer">
                <button
                  type="button"
                  className="pp-btn pp-btn--primary pp-btn--block"
                  onClick={() => handleSelectPlan(plan)}
                >
                  {getCtaLabel(plan.id as PlanType)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
