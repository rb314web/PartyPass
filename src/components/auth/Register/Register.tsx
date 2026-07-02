// components/auth/Register/Register.tsx
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import ErrorBoundary from '../../common/ErrorBoundary/ErrorBoundary';
import Toast from '../../common/Toast/Toast';
import { useToast } from '../../../hooks/useToast';
import { getRegisterPlanOptions } from '../../../constants/plans';
import AuthLayout from '../AuthLayout/AuthLayout';
import './Register.scss';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const planFromUrl = searchParams.get('plan');
  const initialPlanType =
    planFromUrl === 'pro' || planFromUrl === 'enterprise'
      ? planFromUrl
      : 'starter';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // Error is set in auth context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const nextStep = () => {
    if (
      step === 1 &&
      formData.firstName &&
      formData.lastName &&
      formData.email
    ) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const plans = useMemo(() => getRegisterPlanOptions(t), [t]);

  const stepsHeader = (
    <div className="register__steps" aria-label={t('auth.registrationProgress')}>
      <div
        className={`register__step ${step >= 1 ? 'register__step--active' : ''} ${step > 1 ? 'register__step--done' : ''}`}
      >
        <span className="register__step-dot">1</span>
        <span>{t('auth.stepPersonal')}</span>
      </div>
      <div
        className={`register__step-track ${step > 1 ? 'register__step-track--filled' : ''}`}
        aria-hidden="true"
      >
        <span />
      </div>
      <div className={`register__step ${step >= 2 ? 'register__step--active' : ''}`}>
        <span className="register__step-dot">2</span>
        <span>{t('auth.stepAccount')}</span>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <AuthLayout
        variant="register"
        title={t('auth.registerTitle')}
        subtitle={t('auth.registerSubtitle')}
        headerExtra={stepsHeader}
        footer={
          <p>
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="auth-page__link">
              {t('auth.login')}
            </Link>
          </p>
        }
      >
        {error && (
          <div className="pp-form-alert pp-form-alert--error auth-page__error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-page__body register__form">
          {step === 1 && (
            <div className="register__step-content">
              <div className="register__field-group">
                <div className="pp-field">
                  <label className="pp-label" htmlFor="register-firstName">
                    {t('auth.firstName')}
                  </label>
                  <div className="pp-input-wrap">
                    <User size={20} className="pp-input-icon" />
                    <input
                      id="register-firstName"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pp-input pp-input--icon-left"
                      placeholder={t('auth.firstNamePlaceholder')}
                      required
                      autoComplete="given-name"
                    />
                  </div>
                </div>

                <div className="pp-field">
                  <label className="pp-label" htmlFor="register-lastName">
                    {t('auth.lastName')}
                  </label>
                  <div className="pp-input-wrap">
                    <User size={20} className="pp-input-icon" />
                    <input
                      id="register-lastName"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="pp-input pp-input--icon-left"
                      placeholder={t('auth.lastNamePlaceholder')}
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>

              <div className="pp-field">
                <label className="pp-label" htmlFor="register-email">
                  {t('common.email')}
                </label>
                <div className="pp-input-wrap">
                  <Mail size={20} className="pp-input-icon" />
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pp-input pp-input--icon-left"
                    placeholder={t('auth.emailPlaceholder')}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="pp-btn pp-btn--primary pp-btn--block register__next"
                disabled={
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.email
                }
              >
                {t('auth.next')}
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="register__step-content">
              <div className="pp-field">
                <label className="pp-label" htmlFor="register-password">
                  {t('common.password')}
                </label>
                <div className="pp-input-wrap">
                  <Lock size={20} className="pp-input-icon" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pp-input pp-input--icon-left pp-input--icon-right"
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-page__password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="pp-field">
                <label className="pp-label" htmlFor="register-confirmPassword">
                  {t('auth.confirmPassword')}
                </label>
                <div className="pp-input-wrap">
                  <Lock size={20} className="pp-input-icon" />
                  <input
                    id="register-confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pp-input pp-input--icon-left pp-input--icon-right"
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-page__password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="pp-field">
                <span className="pp-label">{t('auth.choosePlan')}</span>
                <div className="register__plans">
                  {plans.map(plan => (
                    <label key={plan.id} className="register__plan">
                      <input
                        type="radio"
                        name="planType"
                        value={plan.id}
                        checked={formData.planType === plan.id}
                        onChange={handleChange}
                      />
                      <div className="register__plan-content">
                        {plan.popular && (
                          <span className="register__plan-badge">
                            {t('auth.popular')}
                          </span>
                        )}
                        <div className="register__plan-name">{plan.name}</div>
                        <div className="register__plan-price">{plan.price}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <label className="register__terms auth-page__checkbox">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  required
                />
                <span className="auth-page__checkbox-box" />
                <Trans
                  i18nKey="auth.acceptTerms"
                  components={{
                    1: <Link to="/terms" />,
                    2: <Link to="/privacy" />,
                  }}
                />
              </label>

              <div className="register__actions">
                <button
                  type="button"
                  onClick={prevStep}
                  className="pp-btn pp-btn--outline register__back"
                >
                  {t('auth.back')}
                </button>

                <button
                  type="submit"
                  className="pp-btn pp-btn--primary register__submit"
                  disabled={loading || !formData.acceptTerms}
                >
                  {loading ? (
                    <span className="auth-page__spinner" />
                  ) : (
                    <>
                      {t('auth.createAccount')}
                      <Check size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </AuthLayout>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={dismiss} />
      )}
    </ErrorBoundary>
  );
};

export default Register;
