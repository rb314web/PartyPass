// components/dashboard/Settings/PlanSettings/PlanSettings.tsx
import React, { useState } from 'react';
import { Check, Crown, Zap, Star, CreditCard, Download } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import './PlanSettings.scss';

const PlanSettings: React.FC = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      icon: Zap,
      price: { monthly: 0, yearly: 0 },
      description: 'Idealny na początek',
      features: [
        'Do 3 wydarzeń miesięcznie',
        'Do 50 gości na wydarzenie',
        'Podstawowe zaproszenia',
        'Email support',
        'Podstawowe statystyki'
      ],
      limitations: [
        'Brak SMS powiadomień',
        'Brak zaawansowanych analityk',
        'Brak custom brandingu'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Star,
      price: { monthly: 29, yearly: 290 },
      description: 'Dla profesjonalistów',
      popular: true,
      features: [
        'Do 15 wydarzeń miesięcznie',
        'Do 200 gości na wydarzenie',
        'Spersonalizowane zaproszenia',
        'SMS powiadomienia',
        'Zaawansowane analityki',
        'QR kody dla gości',
        'Priority support',
        'Export danych'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Crown,
      price: { monthly: 99, yearly: 990 },
      description: 'Dla dużych organizacji',
      features: [
        'Nieograniczone wydarzenia',
        'Nieograniczona liczba gości',
        'Custom branding',
        'API dostęp',
        'Dedykowany manager',
        '24/7 support',
        'Integracje z CRM',
        'White-label opcje',
        'Advanced security'
      ]
    }
  ];

  const currentPlan = plans.find(plan => plan.id === user?.planType);
  const yearlyDiscount = 17; // 17% discount for yearly billing

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.price.monthly === 0) return 'Darmowy';
    
    const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
    const period = billingCycle === 'yearly' ? 'rok' : 'miesiąc';
    
    return `${price} PLN/${period}`;
  };

  const getYearlyMonthlyEquivalent = (plan: typeof plans[0]) => {
    if (plan.price.monthly === 0 || billingCycle === 'monthly') return null;
    
    const monthlyEquivalent = Math.round(plan.price.yearly / 12);
    return `~${monthlyEquivalent} PLN/miesiąc`;
  };

  const handlePlanUpgrade = async (planId: string) => {
    setIsLoading(true);
    
    // Symulacja procesu płatności
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert(`Upgrade do planu ${planId} zostanie wkrótce zaimplementowany!`);
    setIsLoading(false);
  };

  const mockInvoices = [
    {
      id: '1',
      date: '2024-07-01',
      amount: 29,
      status: 'paid' as const,
      plan: 'Pro',
      period: 'Lipiec 2024'
    },
    {
      id: '2',
      date: '2024-06-01',
      amount: 29,
      status: 'paid' as const,
      plan: 'Pro',
      period: 'Czerwiec 2024'
    },
    {
      id: '3',
      date: '2024-05-01',
      amount: 29,
      status: 'paid' as const,
      plan: 'Pro',
      period: 'Maj 2024'
    }
  ];

  return (
    <div className="plan-settings">
      {/* Current Plan */}
      <div className="plan-settings__current">
        <div className="plan-settings__current-header">
          <div className="plan-settings__current-info">
            <h2>Twój aktualny plan</h2>
            <div className="plan-settings__current-plan">
              {currentPlan?.icon && <currentPlan.icon size={20} />}
              <span>{currentPlan?.name}</span>
              {currentPlan?.id === 'pro' && <span className="plan-settings__badge">Aktywny</span>}
            </div>
          </div>
          <div className="plan-settings__current-price">
            <span className="plan-settings__price-amount">
              {currentPlan?.price.monthly === 0 ? 'Darmowy' : `${currentPlan?.price.monthly} PLN`}
            </span>
            {currentPlan?.price.monthly !== 0 && (
              <span className="plan-settings__price-period">/miesiąc</span>
            )}
          </div>
        </div>
        
        <div className="plan-settings__usage">
          <h3>Wykorzystanie w tym miesiącu</h3>
          <div className="plan-settings__usage-stats">
            <div className="plan-settings__usage-item">
              <span>Wydarzenia</span>
              <span>3 / {currentPlan?.id === 'enterprise' ? '∞' : currentPlan?.id === 'pro' ? '15' : '3'}</span>
            </div>
            <div className="plan-settings__usage-item">
              <span>Goście</span>
              <span>47 / {currentPlan?.id === 'enterprise' ? '∞' : currentPlan?.id === 'pro' ? '200' : '50'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="plan-settings__plans">
        <div className="plan-settings__plans-header">
          <h2>Porównaj plany</h2>
          <div className="plan-settings__billing-toggle">
            <button 
              className={billingCycle === 'monthly' ? 'active' : ''}
              onClick={() => setBillingCycle('monthly')}
            >
              Miesięcznie
            </button>
            <button 
              className={billingCycle === 'yearly' ? 'active' : ''}
              onClick={() => setBillingCycle('yearly')}
            >
              Rocznie
              <span className="plan-settings__discount">-{yearlyDiscount}%</span>
            </button>
          </div>
        </div>

        <div className="plan-settings__plans-grid">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`plan-settings__plan-card ${plan.popular ? 'plan-settings__plan-card--popular' : ''} ${plan.id === user?.planType ? 'plan-settings__plan-card--current' : ''}`}
            >
              {plan.popular && (
                <div className="plan-settings__popular-badge">
                  <Star size={16} />
                  Najpopularniejszy
                </div>
              )}

              <div className="plan-settings__plan-header">
                <div className="plan-settings__plan-icon">
                  <plan.icon size={24} />
                </div>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>

              <div className="plan-settings__plan-price">
                <span className="plan-settings__price-main">{getPrice(plan)}</span>
                {getYearlyMonthlyEquivalent(plan) && (
                  <span className="plan-settings__price-equivalent">
                    {getYearlyMonthlyEquivalent(plan)}
                  </span>
                )}
              </div>

              <ul className="plan-settings__features">
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <Check size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limitations && (
                <ul className="plan-settings__limitations">
                  {plan.limitations.map((limitation, index) => (
                    <li key={index}>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              )}

              <button
                className={`plan-settings__plan-btn ${plan.id === user?.planType ? 'plan-settings__plan-btn--current' : ''}`}
                onClick={() => handlePlanUpgrade(plan.id)}
                disabled={plan.id === user?.planType || isLoading}
              >
                {plan.id === user?.planType ? 'Aktualny plan' : 
                 plan.price.monthly === 0 ? 'Downgrade' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="plan-settings__payment">
        <h2>Metoda płatności</h2>
        <div className="plan-settings__payment-card">
          <div className="plan-settings__payment-info">
            <CreditCard size={24} />
            <div>
              <div className="plan-settings__card-number">•••• •••• •••• 4242</div>
              <div className="plan-settings__card-expiry">Wygasa 12/25</div>
            </div>
          </div>
          <button className="plan-settings__payment-change">
            Zmień kartę
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="plan-settings__billing">
        <div className="plan-settings__billing-header">
          <h2>Historia płatności</h2>
          <button className="plan-settings__download-btn">
            <Download size={16} />
            Pobierz wszystkie
          </button>
        </div>
        
        <div className="plan-settings__invoices">
          {mockInvoices.map((invoice) => (
            <div key={invoice.id} className="plan-settings__invoice">
              <div className="plan-settings__invoice-info">
                <div className="plan-settings__invoice-date">
                  {new Date(invoice.date).toLocaleDateString('pl-PL')}
                </div>
                <div className="plan-settings__invoice-details">
                  <span>{invoice.plan}</span>
                  <span>•</span>
                  <span>{invoice.period}</span>
                </div>
              </div>
              <div className="plan-settings__invoice-amount">
                {invoice.amount} PLN
              </div>
              <div className={`plan-settings__invoice-status plan-settings__invoice-status--${invoice.status}`}>
                {invoice.status === 'paid' ? 'Opłacone' : 'Oczekuje'}
              </div>
              <button className="plan-settings__invoice-download">
                <Download size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanSettings;