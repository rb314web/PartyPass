// components/dashboard/Settings/PlanSettings/PlanSettings.tsx
import React, { useState, useEffect } from 'react';
import { Check, Crown, Zap, Star, CreditCard, Download, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { usePayments } from '../../../../hooks/usePayments';
import { EventService, EventStats } from '../../../../services/firebase/eventService';
import ConfigurationStatus from '../ConfigurationStatus';
import './PlanSettings.scss';

const PlanSettings: React.FC = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [usageStats, setUsageStats] = useState<EventStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
    const {
    isLoading: paymentLoading,
    error: paymentError,
    success: paymentSuccess,
    initiatePlanPayment,
    getInvoices,
    getConfigStatus,
    isConfigured,
    resetState
  } = usePayments(user || undefined);

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
  const configStatus = getConfigStatus();  // Pobierz faktury przy załadowaniu komponentu
  useEffect(() => {
    console.log('🎯 PlanSettings.useEffect: Komponent załadowany');
    console.log('👤 PlanSettings.useEffect: user:', user);
    console.log('⚙️ PlanSettings.useEffect: isConfigured:', isConfigured);
    
    if (user && isConfigured) {
      console.log('✅ PlanSettings.useEffect: Warunki spełnione, ładuję dane...');
      loadInvoices();
      loadUsageStats();
    } else {
      console.log('⚠️ PlanSettings.useEffect: Warunki niespełnione - user:', !!user, 'isConfigured:', isConfigured);
    }
  }, [user, isConfigured]);

  const loadInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const invoiceList = await getInvoices();
      setInvoices(invoiceList);
    } catch (error) {
      console.error('Błąd podczas ładowania faktur:', error);
    } finally {
      setLoadingInvoices(false);
    }
  };  const loadUsageStats = async () => {
    if (!user?.id) {
      console.log('🚫 PlanSettings.loadUsageStats: Brak user.id, nie ładuję statystyk');
      return;
    }
    
    console.log('📊 PlanSettings.loadUsageStats: Rozpoczynam ładowanie statystyk dla użytkownika:', user.id);
    console.log('👤 PlanSettings.loadUsageStats: Obiekt user:', user);
    setLoadingStats(true);
    try {
      console.log('🔄 PlanSettings.loadUsageStats: Wywołuję EventService.getEventStats...');
      const stats = await EventService.getEventStats(user.id);
      console.log('✅ PlanSettings.loadUsageStats: Pobrane statystyki:', stats);
      setUsageStats(stats);
    } catch (error) {
      console.error('❌ PlanSettings.loadUsageStats: Błąd podczas ładowania statystyk:', error);
      console.error('📝 PlanSettings.loadUsageStats: Stack trace:', error.stack);
    } finally {
      setLoadingStats(false);
      console.log('🏁 PlanSettings.loadUsageStats: Zakończono ładowanie statystyk');
    }
  };

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
    if (!isConfigured) {
      alert('Autopay nie jest skonfigurowane. Skontaktuj się z administratorem.');
      return;
    }

    // Reset poprzednich błędów
    resetState();
    
    const selectedPlan = plans.find(plan => plan.id === planId);
    if (!selectedPlan) {
      alert('Wybrany plan nie został znaleziony.');
      return;
    }

    const price = billingCycle === 'yearly' ? selectedPlan.price.yearly : selectedPlan.price.monthly;
    
    if (price === 0) {
      // Darmowy plan - nie wymaga płatności
      alert(`Przejście na plan ${selectedPlan.name} zostanie wkrótce zaimplementowane!`);
      return;
    }

    try {
      await initiatePlanPayment(
        planId,
        selectedPlan.name,
        price,
        billingCycle
      );
    } catch (error) {
      console.error('Błąd podczas inicjowania płatności:', error);
    }
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
  ];  return (
    <div className="plan-settings">
      {/* Configuration Status */}
      <ConfigurationStatus />

      {/* Payment Status Messages */}
      {paymentError && (
        <div className="plan-settings__alert plan-settings__alert--error">
          <AlertCircle size={20} />
          <span>Błąd płatności: {paymentError}</span>
          <button onClick={resetState} className="plan-settings__alert-close">×</button>
        </div>
      )}

      {paymentSuccess && (
        <div className="plan-settings__alert plan-settings__alert--success">
          <Check size={20} />
          <span>Płatność została zainicjowana pomyślnie! Sprawdź swój email w celu dalszych instrukcji.</span>
          <button onClick={resetState} className="plan-settings__alert-close">×</button>
        </div>
      )}

      {!isConfigured && (
        <div className="plan-settings__alert plan-settings__alert--warning">
          <AlertCircle size={20} />
          <span>System płatności nie jest skonfigurowany. Skontaktuj się z administratorem.</span>
        </div>
      )}

      {paymentLoading && (
        <div className="plan-settings__loading">
          <Loader size={20} className="plan-settings__spinner" />
          <span>Przetwarzanie płatności...</span>
        </div>
      )}
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
        </div>        <div className="plan-settings__usage">
          <h3>Wykorzystanie w tym miesiącu</h3>
          {loadingStats ? (
            <div className="plan-settings__loading">
              <Loader size={16} className="plan-settings__spinner" />
              <span>Ładowanie statystyk...</span>
            </div>
          ) : (
            <>
              <div className="plan-settings__usage-stats">
                <div className="plan-settings__usage-item">
                  <span>Wydarzenia</span>
                  <span>
                    {usageStats?.eventsThisMonth || 0} / {
                      currentPlan?.id === 'enterprise' ? '∞' : 
                      currentPlan?.id === 'pro' ? '15' : '3'
                    }
                  </span>
                </div>
                <div className="plan-settings__usage-item">
                  <span>Goście</span>
                  <span>
                    {usageStats?.guestsThisMonth || 0} / {
                      currentPlan?.id === 'enterprise' ? '∞' : 
                      currentPlan?.id === 'pro' ? '200' : '50'
                    }
                  </span>
                </div>
              </div>
              
              {usageStats && (
                <div className="plan-settings__usage-summary">
                  <div className="plan-settings__usage-total">
                    <h4>Statystyki ogólne</h4>
                    <div className="plan-settings__usage-grid">
                      <div className="plan-settings__usage-metric">
                        <span className="plan-settings__usage-metric-value">{usageStats.totalEvents}</span>
                        <span className="plan-settings__usage-metric-label">Łącznie wydarzeń</span>
                      </div>
                      <div className="plan-settings__usage-metric">
                        <span className="plan-settings__usage-metric-value">{usageStats.totalGuests}</span>
                        <span className="plan-settings__usage-metric-label">Łącznie gości</span>
                      </div>
                      <div className="plan-settings__usage-metric">
                        <span className="plan-settings__usage-metric-value">{usageStats.responseRate}%</span>
                        <span className="plan-settings__usage-metric-label">Wskaźnik odpowiedzi</span>
                      </div>
                      <div className="plan-settings__usage-metric">
                        <span className="plan-settings__usage-metric-value">{usageStats.upcomingEvents}</span>
                        <span className="plan-settings__usage-metric-label">Nadchodzące</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
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
                disabled={plan.id === user?.planType || paymentLoading}
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
          {loadingInvoices ? (
            <div className="plan-settings__loading-invoices">
              <Loader size={20} className="plan-settings__spinner" />
              <span>Ładowanie faktur...</span>
            </div>
          ) : (
            <>
              {(invoices.length > 0 ? invoices : mockInvoices).map((invoice) => (
                <div key={invoice.id} className="plan-settings__invoice">
                  <div className="plan-settings__invoice-info">
                    <div className="plan-settings__invoice-date">
                      {new Date(invoice.date).toLocaleDateString('pl-PL')}
                    </div>
                    <div className="plan-settings__invoice-details">
                      <span>{invoice.plan || invoice.description || 'Plan'}</span>
                      <span>•</span>
                      <span>{invoice.period || `${invoice.amount} PLN`}</span>
                    </div>
                  </div>
                  <div className="plan-settings__invoice-amount">
                    {invoice.amount} PLN
                  </div>
                  <div className={`plan-settings__invoice-status plan-settings__invoice-status--${invoice.status}`}>
                    {invoice.status === 'paid' ? 'Opłacone' : 
                     invoice.status === 'pending' ? 'Oczekuje' : 
                     invoice.status === 'failed' ? 'Nieudane' : 'Oczekuje'}
                  </div>
                  <button className="plan-settings__invoice-download">
                    <Download size={16} />
                  </button>
                </div>
              ))}
              {invoices.length === 0 && !loadingInvoices && (
                <div className="plan-settings__no-invoices">
                  <CreditCard size={48} />
                  <h3>Brak faktur</h3>
                  <p>Nie masz jeszcze żadnych faktur. Gdy dokonasz pierwszej płatności, pojawią się tutaj.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanSettings;