// components/dashboard/Settings/PlanSettings/PlanSettings.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Check,
  Crown,
  Zap,
  Star,
  CreditCard,
  Download,
  AlertCircle,
  Loader,
  X,
} from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { usePayments } from '../../../../hooks/usePayments';
import {
  EventService,
  EventStats,
} from '../../../../services/firebase/eventService';
import { getPlanLimits, PlanType } from '../../../../services/firebase/planLimitsService';
import { PLAN_CATALOG } from '../../../../constants/plans';
import ConfigurationStatus from '../ConfigurationStatus';
import './PlanSettings.scss';
import { useDashboardViewMotion } from '../../../../hooks/useDashboardViewMotion';
import Toast from '../../../common/Toast/Toast';
import PageHeader from '../../../common/PageHeader/PageHeader';
import { useToast } from '../../../../hooks/useToast';

const PlanSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast, dismiss, showError } = useToast();
  const { className: viewClassName } = useDashboardViewMotion({
    variant: 'shell',
    pageClass: 'plan-settings',
  });
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly'
  );
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
    isConfigured,
    resetState,
  } = usePayments(user || undefined);

  const planType = (user?.planType as PlanType) || 'starter';
  const planLimits = getPlanLimits(planType);

  const planIcons = { starter: Zap, pro: Star, enterprise: Crown } as const;

  const plans = PLAN_CATALOG.map(entry => ({
    id: entry.id,
    name: entry.name,
    icon: planIcons[entry.id],
    price: entry.pricing,
    description: entry.description,
    popular: entry.popular,
    features: entry.features,
    limitations: entry.limitations,
  }));

  const currentPlan = plans.find(p => p.id === user?.planType) ?? plans[0];
  const yearlyDiscount = 17;

  const loadInvoices = useCallback(async () => {
    setLoadingInvoices(true);
    try {
      const invoiceList = await getInvoices();
      setInvoices(invoiceList);
    } catch (error) {
      console.error('Błąd podczas ładowania faktur:', error);
    } finally {
      setLoadingInvoices(false);
    }
  }, [getInvoices]);

  const loadUsageStats = useCallback(async () => {
    if (!user?.id) return;
    setLoadingStats(true);
    try {
      const stats = await EventService.getEventStats(user.id);
      setUsageStats(stats);
    } catch (error) {
      console.error('Błąd podczas ładowania statystyk:', error);
    } finally {
      setLoadingStats(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadUsageStats();
      if (isConfigured) loadInvoices();
    }
  }, [user, isConfigured, loadInvoices, loadUsageStats]);

  const getPrice = (plan: (typeof plans)[0]) => {
    if (plan.price.monthly === 0) return 'Darmowy';
    const price =
      billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
    const period = billingCycle === 'yearly' ? 'rok' : 'miesiąc';
    return `${price} PLN/${period}`;
  };

  const getYearlyEquivalent = (plan: (typeof plans)[0]) => {
    if (plan.price.monthly === 0 || billingCycle === 'monthly') return null;
    return `~${Math.round(plan.price.yearly / 12)} PLN/miesiąc`;
  };

  const handlePlanUpgrade = async (planId: string) => {
    if (!isConfigured) {
      showError('Autopay nie jest skonfigurowane. Skontaktuj się z administratorem.');
      return;
    }
    resetState();
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;
    const price =
      billingCycle === 'yearly'
        ? selectedPlan.price.yearly
        : selectedPlan.price.monthly;
    if (price === 0) {
      showError(`Przejście na plan ${selectedPlan.name} zostanie wkrótce zaimplementowane!`);
      return;
    }
    try {
      await initiatePlanPayment(planId, selectedPlan.name, price, billingCycle);
    } catch (error) {
      console.error('Błąd podczas inicjowania płatności:', error);
    }
  };

  const mockInvoices = [
    { id: '1', date: '2024-07-01', amount: 29, status: 'paid' as const, plan: 'Pro', period: 'Lipiec 2024' },
    { id: '2', date: '2024-06-01', amount: 29, status: 'paid' as const, plan: 'Pro', period: 'Czerwiec 2024' },
    { id: '3', date: '2024-05-01', amount: 29, status: 'paid' as const, plan: 'Pro', period: 'Maj 2024' },
  ];

  const eventsLimit = planLimits.events === Infinity ? '∞' : String(planLimits.events);
  const guestsLimit = planLimits.guests === Infinity ? '∞' : String(planLimits.guests);
  const eventsUsed = usageStats?.totalEvents ?? 0;
  const guestsUsed = usageStats?.totalGuests ?? 0;
  const eventsPercent =
    planLimits.events === Infinity ? 0 : Math.min(Math.round((eventsUsed / planLimits.events) * 100), 100);
  const guestsPercent =
    planLimits.guests === Infinity ? 0 : Math.min(Math.round((guestsUsed / planLimits.guests) * 100), 100);

  const getBarMod = (pct: number) =>
    pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : '';

  const getStatusLabel = (status: string) => {
    if (status === 'paid') return 'Opłacone';
    if (status === 'pending') return 'Oczekuje';
    if (status === 'failed') return 'Nieudane';
    return 'Oczekuje';
  };

  return (
    <div className={viewClassName}>
      <PageHeader
        title="Plan i subskrypcja"
        subtitle="Zarządzaj swoim planem, płatnościami i limitami"
        icon={Crown}
        className="plan-settings__page-header"
      />

      {/* ── Config Status ── */}
      <ConfigurationStatus />

      {/* ── Alerts ── */}
      {paymentError && (
        <div className="plan-settings__alert plan-settings__alert--error">
          <AlertCircle size={18} />
          <span>Błąd płatności: {paymentError}</span>
          <button className="plan-settings__alert-close" onClick={resetState}>
            <X size={16} />
          </button>
        </div>
      )}
      {paymentSuccess && (
        <div className="plan-settings__alert plan-settings__alert--success">
          <Check size={18} />
          <span>Płatność zainicjowana! Sprawdź swój email w celu dalszych instrukcji.</span>
          <button className="plan-settings__alert-close" onClick={resetState}>
            <X size={16} />
          </button>
        </div>
      )}
      {!isConfigured && (
        <div className="plan-settings__alert plan-settings__alert--warning">
          <AlertCircle size={18} />
          <span>System płatności nie jest skonfigurowany. Skontaktuj się z administratorem.</span>
        </div>
      )}
      {paymentLoading && (
        <div className="plan-settings__loading-bar">
          <Loader size={18} className="plan-settings__spinner" />
          <span>Przetwarzanie płatności...</span>
        </div>
      )}

      {/* ── Current Plan ── */}
      <div className="plan-settings__current">
        <div className="plan-settings__current-top">
          <div className="plan-settings__current-info">
            <span className="plan-settings__current-label">Twój aktualny plan</span>
            <div className="plan-settings__current-name">
              {currentPlan.icon && <currentPlan.icon size={20} />}
              <span>{currentPlan.name}</span>
              <span className="plan-settings__status-badge">Aktywny</span>
            </div>
          </div>
          <div className="plan-settings__current-price-block">
            <span className="plan-settings__price-main">
              {currentPlan.price.monthly === 0 ? 'Darmowy' : `${currentPlan.price.monthly} PLN`}
            </span>
            {currentPlan.price.monthly !== 0 && (
              <span className="plan-settings__price-period">/miesiąc</span>
            )}
          </div>
        </div>

        <div className="plan-settings__usage-section">
          <h3 className="plan-settings__usage-title">Wykorzystanie zasobów</h3>
          {loadingStats ? (
            <div className="plan-settings__loading">
              <Loader size={16} className="plan-settings__spinner" />
              <span>Ładowanie statystyk...</span>
            </div>
          ) : (
            <div className="plan-settings__usage-grid">
              <div className="plan-settings__usage-item">
                <div className="plan-settings__usage-item-header">
                  <span className="plan-settings__usage-item-label">Wydarzenia</span>
                  <span className="plan-settings__usage-item-count">
                    {eventsUsed} / {eventsLimit}
                  </span>
                </div>
                <div className="plan-settings__usage-bar">
                  <div
                    className={`plan-settings__usage-bar-fill ${getBarMod(eventsPercent) ? `plan-settings__usage-bar-fill--${getBarMod(eventsPercent)}` : ''}`}
                    style={{ width: `${eventsPercent}%` }}
                  />
                </div>
              </div>
              <div className="plan-settings__usage-item">
                <div className="plan-settings__usage-item-header">
                  <span className="plan-settings__usage-item-label">Goście</span>
                  <span className="plan-settings__usage-item-count">
                    {guestsUsed} / {guestsLimit}
                  </span>
                </div>
                <div className="plan-settings__usage-bar">
                  <div
                    className={`plan-settings__usage-bar-fill ${getBarMod(guestsPercent) ? `plan-settings__usage-bar-fill--${getBarMod(guestsPercent)}` : ''}`}
                    style={{ width: `${guestsPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Plan Comparison ── */}
      <div className="plan-settings__plans">
        <div className="plan-settings__plans-header">
          <h2>Porównaj plany</h2>
          <div className="plan-settings__billing-toggle">
            <button
              className={`plan-settings__billing-option ${billingCycle === 'monthly' ? 'plan-settings__billing-option--active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Miesięcznie
            </button>
            <button
              className={`plan-settings__billing-option ${billingCycle === 'yearly' ? 'plan-settings__billing-option--active' : ''}`}
              onClick={() => setBillingCycle('yearly')}
            >
              Rocznie
              <span className="plan-settings__discount">-{yearlyDiscount}%</span>
            </button>
          </div>
        </div>

        <div className="plan-settings__plans-grid">
          {plans.map(plan => {
            const isCurrent = plan.id === user?.planType;
            const isUpgrade = plan.price.monthly > currentPlan.price.monthly;
            return (
              <div
                key={plan.id}
                className={`plan-settings__plan-card ${plan.popular ? 'plan-settings__plan-card--popular' : ''} ${isCurrent ? 'plan-settings__plan-card--current' : ''}`}
              >
                {plan.popular && (
                  <div className="plan-settings__popular-badge">
                    <Star size={13} />
                    Najpopularniejszy
                  </div>
                )}

                <div className="plan-settings__plan-header">
                  <div className="plan-settings__plan-icon">
                    <plan.icon size={22} />
                  </div>
                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>
                </div>

                <div className="plan-settings__plan-price">
                  <span className="plan-settings__price-main">{getPrice(plan)}</span>
                  {getYearlyEquivalent(plan) && (
                    <span className="plan-settings__price-equivalent">
                      {getYearlyEquivalent(plan)}
                    </span>
                  )}
                </div>

                <ul className="plan-settings__features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <Check size={15} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {'limitations' in plan && plan.limitations && (
                  <ul className="plan-settings__limitations">
                    {plan.limitations.map((lim, i) => (
                      <li key={i}>{lim}</li>
                    ))}
                  </ul>
                )}

                <button
                  className={`plan-settings__plan-btn ${isCurrent ? 'plan-settings__plan-btn--current' : isUpgrade ? 'plan-settings__plan-btn--upgrade' : 'plan-settings__plan-btn--downgrade'}`}
                  onClick={() => handlePlanUpgrade(plan.id)}
                  disabled={isCurrent || paymentLoading}
                >
                  {isCurrent ? 'Aktualny plan' : isUpgrade ? 'Upgrade' : 'Downgrade'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Payment Method ── */}
      <div className="plan-settings__payment">
        <h2>Metoda płatności</h2>
        <div className="plan-settings__payment-card">
          <div className="plan-settings__payment-info">
            <CreditCard size={22} />
            <div>
              <div className="plan-settings__card-number">•••• •••• •••• 4242</div>
              <div className="plan-settings__card-expiry">Wygasa 12/25</div>
            </div>
          </div>
          <button className="plan-settings__payment-change">Zmień kartę</button>
        </div>
      </div>

      {/* ── Billing History ── */}
      <div className="plan-settings__billing">
        <div className="plan-settings__billing-header">
          <h2>Historia płatności</h2>
          <button className="plan-settings__download-all">
            <Download size={15} />
            Pobierz wszystkie
          </button>
        </div>

        <div className="plan-settings__invoices">
          {loadingInvoices ? (
            <div className="plan-settings__loading">
              <Loader size={18} className="plan-settings__spinner" />
              <span>Ładowanie faktur...</span>
            </div>
          ) : (
            <>
              {(invoices.length > 0 ? invoices : mockInvoices).map(invoice => (
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
                  <div className="plan-settings__invoice-amount">{invoice.amount} PLN</div>
                  <div className={`plan-settings__invoice-status plan-settings__invoice-status--${invoice.status}`}>
                    {getStatusLabel(invoice.status)}
                  </div>
                  <button className="plan-settings__invoice-download" title="Pobierz fakturę">
                    <Download size={15} />
                  </button>
                </div>
              ))}
              {invoices.length === 0 && !loadingInvoices && (
                <div className="plan-settings__no-invoices">
                  <CreditCard size={40} />
                  <h3>Brak faktur</h3>
                  <p>Gdy dokonasz pierwszej płatności, faktury pojawią się tutaj.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={dismiss} />
      )}
    </div>
  );
};

export default PlanSettings;
