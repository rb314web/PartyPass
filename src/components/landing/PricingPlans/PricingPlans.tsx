// components/landing/PricingPlans/PricingPlans.tsx
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPlanCatalog, type PlanCatalogEntry } from '../../../constants/plans';
import type { PlanType } from '../../../services/firebase/planLimitsService';
import {
  trackLandingCtaClick,
  trackLandingPricingSelect,
} from '../../../services/landingAnalytics';
import LandingReveal from '../LandingReveal/LandingReveal';
import './PricingPlans.scss';

type BillingCycle = 'monthly' | 'yearly';

const YEARLY_DISCOUNT_PERCENT = 17;

const PricingPlans: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const plans: PlanCatalogEntry[] = useMemo(() => getPlanCatalog(t), [t]);

  const getDisplayPrice = (plan: PlanCatalogEntry) => {
    if (plan.pricing.monthly === 0) {
      return {
        amount: t('landing.pricing.free'),
        suffix: null as string | null,
        note: null as string | null,
      };
    }

    const isYearly = billingCycle === 'yearly';
    const displayPrice = isYearly
      ? Math.round(plan.pricing.yearly / 12)
      : plan.pricing.monthly;

    return {
      amount: `${displayPrice} PLN`,
      suffix: t('landing.pricing.perMonth'),
      note: isYearly
        ? t('landing.pricing.yearlyEquivalent', { price: plan.pricing.yearly })
        : null,
    };
  };

  const getCtaLabel = (planId: PlanType) => t(`landing.pricing.cta.${planId}`);

  const handleSelectPlan = (plan: PlanCatalogEntry) => {
    if (plan.id === 'enterprise') {
      trackLandingPricingSelect(plan.id, 'contact');
      trackLandingCtaClick('pricing', 'contact_enterprise', plan.id);
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    trackLandingPricingSelect(plan.id, 'register');
    trackLandingCtaClick('pricing', 'select_plan', plan.id);
    navigate(`/register?plan=${plan.id}`);
  };

  return (
    <section className="pricing-plans" id="pricing" aria-labelledby="pricing-plans-title">
      <div className="pricing-plans__container">
        <LandingReveal as="header" className="pricing-plans__header" variant="up">
          <span className="pricing-plans__label">{t('landing.pricing.label')}</span>
          <h2 id="pricing-plans-title" className="pricing-plans__title">
            {t('landing.pricing.title')}{' '}
            <span className="pricing-plans__title-highlight">
              {t('landing.pricing.titleHighlight')}
            </span>
          </h2>
          <p className="pricing-plans__subtitle">{t('landing.pricing.subtitle')}</p>
        </LandingReveal>

        <LandingReveal className="pricing-plans__toolbar" variant="up" delay={40}>
          <div
            className="pricing-plans__billing"
            role="group"
            aria-label={t('landing.pricing.billingToggleAria')}
          >
            <span
              className={`pricing-plans__billing-indicator pricing-plans__billing-indicator--${billingCycle}`}
              aria-hidden="true"
            />
            <button
              type="button"
              className={`pricing-plans__billing-btn${
                billingCycle === 'monthly' ? ' pricing-plans__billing-btn--active' : ''
              }`}
              onClick={() => setBillingCycle('monthly')}
              aria-pressed={billingCycle === 'monthly'}
            >
              {t('landing.pricing.billingMonthly')}
            </button>
            <button
              type="button"
              className={`pricing-plans__billing-btn${
                billingCycle === 'yearly' ? ' pricing-plans__billing-btn--active' : ''
              }`}
              onClick={() => setBillingCycle('yearly')}
              aria-pressed={billingCycle === 'yearly'}
            >
              {t('landing.pricing.billingYearly')}
              <span className="pricing-plans__billing-badge">
                {t('landing.pricing.yearlySave', { percent: YEARLY_DISCOUNT_PERCENT })}
              </span>
            </button>
          </div>
        </LandingReveal>

        <LandingReveal
          className="pricing-plans__deck"
          variant="up"
          delay={70}
          staggerOnly
          staggerChildren
        >
          {plans.map((plan) => {
            const price = getDisplayPrice(plan);

            return (
              <article
                key={plan.id}
                className={`pricing-plans__tier${
                  plan.popular ? ' pricing-plans__tier--featured' : ''
                }`}
                data-plan={plan.id}
              >
                {plan.popular && (
                  <span className="pricing-plans__ribbon">
                    {t('landing.pricing.mostPopular')}
                  </span>
                )}

                <div className="pricing-plans__tier-head">
                  <p className="pricing-plans__tier-name">{plan.name}</p>
                  {plan.description && (
                    <p className="pricing-plans__tier-tagline">{plan.description}</p>
                  )}

                  <div className="pricing-plans__tier-price">
                    <span className="pricing-plans__tier-amount">{price.amount}</span>
                    {price.suffix && (
                      <span className="pricing-plans__tier-interval">{price.suffix}</span>
                    )}
                  </div>
                  {price.note && (
                    <p className="pricing-plans__tier-note">{price.note}</p>
                  )}
                </div>

                <ul className="pricing-plans__tier-features">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="pricing-plans__tier-feature">
                      <Check size={15} strokeWidth={2.5} aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations && plan.limitations.length > 0 && (
                  <p className="pricing-plans__tier-excludes">
                    <span className="pricing-plans__tier-excludes-label">
                      {t('landing.pricing.notIncluded')}
                    </span>
                    {plan.limitations.join(' · ')}
                  </p>
                )}

                <div className="pricing-plans__tier-action">
                  <button
                    type="button"
                    className={`pricing-plans__cta${
                      plan.popular ? ' pricing-plans__cta--primary' : ''
                    }`}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    <span>{getCtaLabel(plan.id)}</span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </LandingReveal>

        <LandingReveal
          as="p"
          className="pricing-plans__footnote"
          variant="up"
          delay={90}
        >
          {t('landing.pricing.footnote')}
        </LandingReveal>
      </div>
    </section>
  );
};

export default PricingPlans;
