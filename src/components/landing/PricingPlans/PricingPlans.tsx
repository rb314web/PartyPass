// components/landing/PricingPlans/PricingPlans.tsx
import React, { useState } from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { Plan } from '../../../types';
import './PricingPlans.scss';

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    currency: 'PLN',
    interval: 'month',
    maxEvents: 3,
    maxGuestsPerEvent: 50,
    features: [
      'Do 3 wydarzeń miesięcznie',
      'Do 50 gości na wydarzenie',
      'Podstawowe zaproszenia',
      'Lista gości',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    currency: 'PLN',
    interval: 'month',
    maxEvents: 15,
    maxGuestsPerEvent: 200,
    popular: true,
    features: [
      'Do 15 wydarzeń miesięcznie',
      'Do 200 gości na wydarzenie',
      'Spersonalizowane zaproszenia',
      'Analityki i raporty',
      'QR kody dla gości',
      'SMS powiadomienia',
      'Priority support'
    ]
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
      'Integracje z CRM'
    ]
  }
];

const PricingPlans: React.FC = () => {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter': return <Zap size={24} />;
      case 'pro': return <Star size={24} />;
      case 'enterprise': return <Crown size={24} />;
      default: return <Zap size={24} />;
    }
  };

  const getDisplayPrice = (plan: Plan) => {
    if (plan.price === 0) return 'Darmowy';
    
    const yearlyPrice = billingInterval === 'year' ? Math.round(plan.price * 10) : plan.price * 12;
    const monthlyEquivalent = billingInterval === 'year' ? Math.round(yearlyPrice / 12) : plan.price;
    
    if (billingInterval === 'year') {
      return (
        <div>
          <span className="pricing-plans__price">{yearlyPrice} {plan.currency}</span>
          <span className="pricing-plans__price-interval">/rok</span>
          <div className="pricing-plans__monthly-equivalent">
            ~{monthlyEquivalent} PLN/miesiąc
          </div>
        </div>
      );
    }
    
    return (
      <div>
        <span className="pricing-plans__price">{plan.price} {plan.currency}</span>
        <span className="pricing-plans__price-interval">/miesiąc</span>
      </div>
    );
  };

  return (
    <section className="pricing-plans">
      <div className="pricing-plans__container">
        <div className="pricing-plans__header">
          <h2 className="pricing-plans__title">
            Wybierz plan idealny dla Ciebie
          </h2>
          <p className="pricing-plans__subtitle">
            Rozpocznij za darmo i rozwijaj się wraz z Twoimi potrzebami
          </p>
          
          <div className="pricing-plans__billing-toggle">
            <button 
              className={`pricing-plans__toggle-btn ${billingInterval === 'month' ? 'active' : ''}`}
              onClick={() => setBillingInterval('month')}
            >
              Miesięcznie
            </button>
            <button 
              className={`pricing-plans__toggle-btn ${billingInterval === 'year' ? 'active' : ''}`}
              onClick={() => setBillingInterval('year')}
            >
              Rocznie
              <span className="pricing-plans__discount-badge">-17%</span>
            </button>
          </div>
        </div>

        <div className="pricing-plans__grid">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`pricing-plans__card ${plan.popular ? 'pricing-plans__card--popular' : ''}`}
            >
              {plan.popular && (
                <div className="pricing-plans__popular-badge">
                  <Star size={16} />
                  Najpopularniejszy
                </div>
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
                  {plan.features.map((feature, index) => (
                    <li key={index} className="pricing-plans__feature">
                      <Check size={20} className="pricing-plans__feature-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pricing-plans__card-footer">
                <button 
                  className={`pricing-plans__cta ${plan.popular ? 'pricing-plans__cta--primary' : 'pricing-plans__cta--secondary'}`}
                >
                  {plan.price === 0 ? 'Rozpocznij za darmo' : 'Wybierz plan'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pricing-plans__guarantee">
          <div className="pricing-plans__guarantee-icon">
            <Check size={24} />
          </div>
          <div>
            <h4>30-dniowa gwarancja zwrotu pieniędzy</h4>
            <p>Jeśli nie jesteś zadowolony, zwrócimy Ci pieniądze bez pytań</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;