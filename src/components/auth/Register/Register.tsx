import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import ErrorBoundary from '../../common/ErrorBoundary/ErrorBoundary';
import Toast from '../../common/Toast/Toast';
import { useToast } from '../../../hooks/useToast';
import { getRegisterPlanOptions } from '../../../constants/plans';
import AuthSheet from '../ui/AuthSheet';
import GateFieldError from '../ui/GateFieldError';
import GoogleIcon from '../Login/GoogleIcon';
import './Register.scss';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
}

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const passwordRef = useRef<HTMLInputElement>(null);
  const { register, loginWithGoogle, loading, error, clearError } = useAuth();
  const { toast, dismiss } = useToast();

  const plans = useMemo(() => getRegisterPlanOptions(t), [t]);
  const passwordStrength = getPasswordStrength(formData.password);

  useEffect(() => {
    if (step === 2) {
      passwordRef.current?.focus();
    }
  }, [step]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    clearError();

    if (step === 1) {
      goToStep2();
      return;
    }

    const nextErrors: Record<string, string> = {};

    if (!formData.password) {
      nextErrors.password = t('auth.fieldRequired');
    } else if (formData.password.length < 8) {
      nextErrors.password = t('auth.passwordTooShort');
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = t('auth.fieldRequired');
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = t('auth.passwordMismatch');
    }

    if (!formData.acceptTerms) {
      nextErrors.acceptTerms = t('auth.termsRequired');
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await register({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        planType: formData.planType,
      });
    } catch {
      // handled in auth context
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (error) clearError();
  };

  const goToStep2 = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) {
      nextErrors.firstName = t('auth.fieldRequired');
    }
    if (!formData.lastName.trim()) {
      nextErrors.lastName = t('auth.fieldRequired');
    }
    if (!formData.email.trim()) {
      nextErrors.email = t('auth.fieldRequired');
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      nextErrors.email = t('auth.invalidEmail');
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setFieldErrors({});
    setStep(2);
  };

  const handleGoogleRegister = async () => {
    clearError();
    try {
      await loginWithGoogle({ planType: formData.planType });
    } catch {
      // handled in auth context
    }
  };

  const strengthKey =
    passwordStrength <= 1
      ? 'weak'
      : passwordStrength === 2
        ? 'fair'
        : passwordStrength === 3
          ? 'good'
          : 'strong';

  const stepsHeader = (
    <div className="register-flow__progress" aria-label={t('auth.registrationProgress')}>
      <div className="register-flow__progress-meta">
        <span>
          {step === 1 ? t('auth.stepPersonal') : t('auth.stepAccount')}
        </span>
        <span>
          {step}/2
        </span>
      </div>
      <div className="register-flow__progress-bar" aria-hidden="true">
        <span style={{ width: step === 1 ? '50%' : '100%' }} />
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <AuthSheet
        title={t('auth.registerTitle')}
        subtitle={t('auth.registerSubtitle')}
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

        {step === 1 && (
          <>
            <button
              type="button"
              className="gate__btn gate__btn--ghost gate__btn--block"
              onClick={handleGoogleRegister}
              disabled={loading}
            >
              <GoogleIcon size={18} />
              <span>{t('auth.googleRegister')}</span>
            </button>

            <div className="gate__divider" role="separator">
              <span>{t('auth.or')}</span>
            </div>
          </>
        )}

        <form className="gate__form register-flow" onSubmit={handleSubmit} noValidate>
          {step === 1 && (
            <>
              <div className="register-flow__grid">
                <div
                  className={`gate__field${
                    fieldErrors.firstName ? ' gate__field--error' : ''
                  }`}
                >
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
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.firstName)}
                      autoComplete="given-name"
                    />
                  </div>
                  <GateFieldError message={fieldErrors.firstName} />
                </div>

                <div
                  className={`gate__field${
                    fieldErrors.lastName ? ' gate__field--error' : ''
                  }`}
                >
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
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.lastName)}
                      autoComplete="family-name"
                    />
                  </div>
                  <GateFieldError message={fieldErrors.lastName} />
                </div>
              </div>

              <div
                className={`gate__field${fieldErrors.email ? ' gate__field--error' : ''}`}
              >
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
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.email)}
                    autoComplete="email"
                  />
                </div>
                <GateFieldError message={fieldErrors.email} />
              </div>

              <button
                type="button"
                className="gate__btn gate__btn--block"
                onClick={goToStep2}
              >
                <span>{t('auth.next')}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div
                className={`gate__field${
                  fieldErrors.password ? ' gate__field--error' : ''
                }`}
              >
                <label className="gate__label" htmlFor="register-password">
                  {t('common.password')}
                </label>
                <div className="gate__input-wrap gate__input-wrap--icon">
                  <Lock size={17} className="gate__field-icon" aria-hidden="true" />
                  <input
                    ref={passwordRef}
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="gate__input"
                    placeholder={t('auth.passwordPlaceholder')}
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password ? 'register-password-error' : undefined
                    }
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="gate__icon-btn"
                    onClick={() => setShowPassword(value => !value)}
                    aria-label={
                      showPassword ? t('auth.hidePassword') : t('auth.showPassword')
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div
                  className={`gate__password-meta${
                    formData.password ? ' gate__password-meta--visible' : ''
                  }`}
                  aria-hidden={!formData.password}
                >
                  <div
                    className="gate__password-meter"
                    aria-label={
                      formData.password
                        ? t(`auth.passwordStrength.${strengthKey}`)
                        : undefined
                    }
                  >
                    {[1, 2, 3, 4].map(level => (
                      <span
                        key={level}
                        className={`gate__password-seg${
                          formData.password && passwordStrength >= level
                            ? ` gate__password-seg--${strengthKey}`
                            : ''
                        }`}
                      />
                    ))}
                  </div>
                  <p className="gate__password-hint">
                    {formData.password
                      ? t(`auth.passwordStrength.${strengthKey}`)
                      : '\u00a0'}
                  </p>
                </div>
                <GateFieldError
                  id="register-password-error"
                  message={fieldErrors.password}
                />
              </div>

              <div
                className={`gate__field${
                  fieldErrors.confirmPassword ? ' gate__field--error' : ''
                }`}
              >
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
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    aria-describedby={
                      fieldErrors.confirmPassword
                        ? 'register-confirm-error'
                        : undefined
                    }
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="gate__icon-btn"
                    onClick={() => setShowConfirmPassword(value => !value)}
                    aria-label={
                      showConfirmPassword
                        ? t('auth.hidePassword')
                        : t('auth.showPassword')
                    }
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <GateFieldError
                  id="register-confirm-error"
                  message={fieldErrors.confirmPassword}
                />
              </div>

              <div className="gate__field">
                <span className="gate__label">{t('auth.choosePlan')}</span>
                <div className="register-flow__plans">
                  {plans.map(plan => (
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
                          <span className="register-flow__plan-badge">
                            {t('auth.popular')}
                          </span>
                        )}
                        <span className="register-flow__plan-top">
                          <span className="register-flow__plan-name">{plan.name}</span>
                          <span className="register-flow__plan-price">{plan.price}</span>
                        </span>
                        <span className="register-flow__plan-desc">
                          {plan.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div
                className={`gate__field${
                  fieldErrors.acceptTerms ? ' gate__field--error' : ''
                }`}
              >
                <label className="gate__check register-flow__terms">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.acceptTerms)}
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
                <GateFieldError message={fieldErrors.acceptTerms} />
              </div>

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
                  disabled={loading}
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
      </AuthSheet>

      {toast && <Toast message={toast.message} type={toast.type} onClose={dismiss} />}
    </ErrorBoundary>
  );
};

export default Register;
