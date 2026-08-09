import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import ErrorBoundary from '../../common/ErrorBoundary/ErrorBoundary';
import AuthSheet from '../ui/AuthSheet';
import GateFieldError from '../ui/GateFieldError';
import GoogleIcon from './GoogleIcon';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { login, loginWithGoogle, loading, error, clearError } = useAuth();

  const clearFieldError = (name: string) => {
    setFieldErrors(prev => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = t('auth.fieldRequired');
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = t('auth.invalidEmail');
    }

    if (!password) {
      nextErrors.password = t('auth.fieldRequired');
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    clearError();

    if (!validate()) {
      return;
    }

    try {
      await login(email.trim(), password, rememberMe);
    } catch {
      // handled in auth context
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    setFieldErrors({});

    try {
      await loginWithGoogle({ rememberMe });
    } catch {
      // handled in auth context
    }
  };

  return (
    <ErrorBoundary>
      <AuthSheet
        title={t('auth.loginTitle')}
        subtitle={t('auth.loginSubtitle')}
        footer={
          <p>
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="gate__link">
              {t('auth.register')}
            </Link>
          </p>
        }
      >
        {error && (
          <div className="gate__alert gate__alert--error" role="alert">
            {error}
          </div>
        )}

        <button
          type="button"
          className="gate__btn gate__btn--ghost gate__btn--block"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon size={18} />
          <span>{t('auth.googleLogin')}</span>
        </button>

        <div className="gate__divider" role="separator">
          <span>{t('auth.or')}</span>
        </div>

        <form className="gate__form" onSubmit={handleSubmit} noValidate>
          <div
            className={`gate__field${fieldErrors.email ? ' gate__field--error' : ''}`}
          >
            <label className="gate__label" htmlFor="login-email">
              {t('common.email')}
            </label>
            <div className="gate__input-wrap gate__input-wrap--icon">
              <Mail size={16} className="gate__field-icon" aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                name="email"
                value={email}
                onChange={event => {
                  setEmail(event.target.value);
                  clearFieldError('email');
                  if (error) clearError();
                }}
                className="gate__input"
                placeholder={t('auth.emailPlaceholder')}
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                autoComplete="email"
              />
            </div>
            <GateFieldError id="login-email-error" message={fieldErrors.email} />
          </div>

          <div
            className={`gate__field${
              fieldErrors.password ? ' gate__field--error' : ''
            }`}
          >
            <label className="gate__label" htmlFor="login-password">
              {t('common.password')}
            </label>
            <div className="gate__input-wrap gate__input-wrap--icon">
              <Lock size={16} className="gate__field-icon" aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={event => {
                  setPassword(event.target.value);
                  clearFieldError('password');
                  if (error) clearError();
                }}
                className="gate__input"
                placeholder={t('auth.passwordPlaceholder')}
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={
                  fieldErrors.password ? 'login-password-error' : undefined
                }
                autoComplete="current-password"
              />
              <button
                type="button"
                className="gate__icon-btn"
                onClick={() => setShowPassword(value => !value)}
                aria-label={
                  showPassword ? t('auth.hidePassword') : t('auth.showPassword')
                }
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <GateFieldError
              id="login-password-error"
              message={fieldErrors.password}
            />
          </div>

          <div className="gate__row">
            <label className="gate__check">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={event => setRememberMe(event.target.checked)}
              />
              <span className="gate__check-mark" aria-hidden="true" />
              <span>{t('auth.rememberMe')}</span>
            </label>
            <Link to="/forgot-password" className="gate__link">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <button type="submit" className="gate__btn gate__btn--block" disabled={loading}>
            {loading ? (
              <span className="gate__spinner" aria-hidden="true" />
            ) : (
              <>
                <span>{t('auth.login')}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </AuthSheet>
    </ErrorBoundary>
  );
};

export default Login;
