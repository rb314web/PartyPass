// components/landing/PricingPlans/PricingPlans.tsx
import React from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { Plan } from '../../../types';
import './PricingPlans.scss';

const plans: Plan[] = [
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    currency: 'PLN',
    interval: 'month',
    maxEvents: 15,
    maxGuestsPerEvent: 200,
    features: [
      'Do 15 wydarzeń miesięcznie',
      'Do 200 gości na wydarzenie',
      'Spersonalizowane zaproszenia',
      'Analityki i raporty',
      'QR kody dla gości',
      'SMS powiadomienia',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    currency: 'PLN',
    interval: 'month',
    maxEvents: -1, // unlimited
    maxGuestsPerEvent: -1, // unlimited
    features: [
      'Nieograniczone wydarzenia',
      'Nieograniczona liczba gości',
      'Zaawansowane analityki',
      'Custom branding',
      'API dostęp',
      'Dedykowany manager',
      '24/7 support',
      'Integracje z CRM',
    ],
  },
];

const PricingPlans: React.FC = () => {
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

  const getDisplayPrice = (plan: Plan) => (
    <div>
      <span className="pricing-plans__price">
        {plan.price} {plan.currency}
      </span>
      <span className="pricing-plans__price-interval">/miesiąc</span>
    </div>
  );

  return (
    <section className="pricing-plans">
      <div className="pricing-plans__container">
        <div className="pricing-plans__header">
          <span className="pricing-plans__label">Plany i Ceny</span>
          <h2 className="pricing-plans__title">
            Wybierz plan{' '}
            <span className="pricing-plans__title-highlight">
              idealny dla Ciebie
            </span>
          </h2>
          <p className="pricing-plans__subtitle">
            Dopasowane rozwiązania dla profesjonalnych organizatorów eventów
          </p>
        </div>

        <div className="pricing-plans__grid">
          {plans.map(plan => (
            <div key={plan.id} className="pricing-plans__card">
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
                  {plan.features.map((feature, index) => (
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
                <button className="pricing-plans__cta pricing-plans__cta--primary">
                  Wybierz plan
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
