import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import ErrorBoundary from '../../common/ErrorBoundary/ErrorBoundary';
import Toast from '../../common/Toast/Toast';
import { useToast } from '../../../hooks/useToast';
import { getRegisterPlanOptions } from '../../../constants/plans';
import AuthCanvas from '../ui/AuthCanvas';
import './Register.scss';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const planFromUrl = searchParams.get('plan');
  const initialPlanType =
    planFromUrl === 'pro' || planFromUrl === 'enterprise' ? planFromUrl : 'starter';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    planType: initialPlanType as 'starter' | 'pro' | 'enterprise',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);

  const { register, loading, error, clearError } = useAuth();
  const { toast, dismiss, showError } = useToast();

  const plans = useMemo(() => getRegisterPlanOptions(t), [t]);

  const stats = useMemo(
    () => [
      { value: t('auth.showcase.register.statEventsValue'), label: t('auth.showcase.register.statEvents') },
      { value: t('auth.showcase.register.statRsvpValue'), label: t('auth.showcase.register.statRsvp') },
    ],
    [t]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      showError(t('auth.passwordMismatch'));
      return;
    }

    if (!formData.acceptTerms) {
      showError(t('auth.termsRequired'));
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        planType: formData.planType,
      });
    } catch {
      // handled in auth context
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const stepsHeader = (
    <div className="register-flow__steps" aria-label={t('auth.registrationProgress')}>
      <div
        className={`register-flow__step${step >= 1 ? ' register-flow__step--active' : ''}${step > 1 ? ' register-flow__step--done' : ''}`}
      >
        <span className="register-flow__step-dot">1</span>
        <span>{t('auth.stepPersonal')}</span>
      </div>
      <div
        className={`register-flow__track${step > 1 ? ' register-flow__track--filled' : ''}`}
        aria-hidden="true"
      >
        <span />
      </div>
      <div className={`register-flow__step${step >= 2 ? ' register-flow__step--active' : ''}`}>
        <span className="register-flow__step-dot">2</span>
        <span>{t('auth.stepAccount')}</span>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <AuthCanvas
        wide
        badge={t('auth.register')}
        title={t('auth.registerTitle')}
        subtitle={t('auth.registerSubtitle')}
        stats={stats}
        headerExtra={stepsHeader}
        footer={
          <p>
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="gate__link">
              {t('auth.login')}
            </Link>
          </p>
        }
      >
        {error && (
          <div className="gate__alert gate__alert--error" role="alert">
            {error}
          </div>
        )}

        <form className="gate__form register-flow" onSubmit={handleSubmit} noValidate>
          {step === 1 && (
            <>
              <div className="register-flow__grid">
                <div className="gate__field">
                  <label className="gate__label" htmlFor="register-firstName">
                    {t('auth.firstName')}
                  </label>
                  <div className="gate__input-wrap gate__input-wrap--icon">
                    <User size={17} className="gate__field-icon" aria-hidden="true" />
                    <input
                      id="register-firstName"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="gate__input"
                      placeholder={t('auth.firstNamePlaceholder')}
                      required
                      autoComplete="given-name"
                    />
                  </div>
                </div>

                <div className="gate__field">
                  <label className="gate__label" htmlFor="register-lastName">
                    {t('auth.lastName')}
                  </label>
                  <div className="gate__input-wrap gate__input-wrap--icon">
                    <User size={17} className="gate__field-icon" aria-hidden="true" />
                    <input
                      id="register-lastName"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="gate__input"
                      placeholder={t('auth.lastNamePlaceholder')}
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>

              <div className="gate__field">
                <label className="gate__label" htmlFor="register-email">
                  {t('common.email')}
                </label>
                <div className="gate__input-wrap gate__input-wrap--icon">
                  <Mail size={17} className="gate__field-icon" aria-hidden="true" />
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="gate__input"
                    placeholder={t('auth.emailPlaceholder')}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="button"
                className="gate__btn gate__btn--block"
                onClick={() => setStep(2)}
                disabled={!formData.firstName || !formData.lastName || !formData.email}
              >
                <span>{t('auth.next')}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="gate__field">
                <label className="gate__label" htmlFor="register-password">
                  {t('common.password')}
                </label>
                <div className="gate__input-wrap gate__input-wrap--icon">
                  <Lock size={17} className="gate__field-icon" aria-hidden="true" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="gate__input"
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="gate__icon-btn"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword
                        ? t('auth.hidePassword', { defaultValue: 'Hide password' })
                        : t('auth.showPassword', { defaultValue: 'Show password' })
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="gate__field">
                <label className="gate__label" htmlFor="register-confirmPassword">
                  {t('auth.confirmPassword')}
                </label>
                <div className="gate__input-wrap gate__input-wrap--icon">
                  <Lock size={17} className="gate__field-icon" aria-hidden="true" />
                  <input
                    id="register-confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="gate__input"
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="gate__icon-btn"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={
                      showConfirmPassword
                        ? t('auth.hidePassword', { defaultValue: 'Hide password' })
                        : t('auth.showPassword', { defaultValue: 'Show password' })
                    }
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="gate__field">
                <span className="gate__label">{t('auth.choosePlan')}</span>
                <div className="register-flow__plans">
                  {plans.map((plan) => (
                    <label key={plan.id} className="register-flow__plan">
                      <input
                        type="radio"
                        name="planType"
                        value={plan.id}
                        checked={formData.planType === plan.id}
                        onChange={handleChange}
                      />
                      <span className="register-flow__plan-card">
                        {plan.popular && (
                          <span className="register-flow__plan-badge">{t('auth.popular')}</span>
                        )}
                        <span className="register-flow__plan-name">{plan.name}</span>
                        <span className="register-flow__plan-price">{plan.price}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="gate__check register-flow__terms">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  required
                />
                <span className="gate__check-mark" aria-hidden="true" />
                <Trans
                  i18nKey="auth.acceptTerms"
                  components={{
                    1: <Link to="/terms" className="gate__link" />,
                    2: <Link to="/privacy" className="gate__link" />,
                  }}
                />
              </label>

              <div className="register-flow__actions">
                <button
                  type="button"
                  className="gate__btn gate__btn--ghost register-flow__back"
                  onClick={() => setStep(1)}
                >
                  {t('auth.back')}
                </button>
                <button
                  type="submit"
                  className="gate__btn register-flow__submit"
                  disabled={loading || !formData.acceptTerms}
                >
                  {loading ? (
                    <span className="gate__spinner" aria-hidden="true" />
                  ) : (
                    <>
                      <span>{t('auth.createAccount')}</span>
                      <Check size={18} aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </AuthCanvas>

      {toast && <Toast message={toast.message} type={toast.type} onClose={dismiss} />}
    </ErrorBoundary>
  );
};

export default Register;
