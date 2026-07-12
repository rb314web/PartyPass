import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import ErrorBoundary from '../../common/ErrorBoundary/ErrorBoundary';
import AuthCanvas from '../ui/AuthCanvas';
import GoogleIcon from './GoogleIcon';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { login, loginWithGoogle, loading, error, clearError } = useAuth();

  const stats = useMemo(
    () => [
      { value: t('auth.showcase.login.statEventsValue'), label: t('auth.showcase.login.statEvents') },
      { value: t('auth.showcase.login.statRsvpValue'), label: t('auth.showcase.login.statRsvp') },
    ],
    [t]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();

    try {
      await login(email, password);
    } catch {
      // handled in auth context
    }
  };

  const handleGoogleLogin = async () => {
    clearError();

    try {
      await loginWithGoogle();
    } catch {
      // handled in auth context
    }
  };

  return (
    <ErrorBoundary>
      <AuthCanvas
        badge={t('auth.login')}
        title={t('auth.loginTitle')}
        subtitle={t('auth.loginSubtitle')}
        stats={stats}
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

        <form className="gate__form" onSubmit={handleSubmit} noValidate>
          <div className="gate__field">
            <label className="gate__label" htmlFor="login-email">
              {t('common.email')}
            </label>
            <div className="gate__input-wrap gate__input-wrap--icon">
              <Mail size={17} className="gate__field-icon" aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="gate__input"
                placeholder={t('auth.emailPlaceholder')}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="gate__field">
            <label className="gate__label" htmlFor="login-password">
              {t('common.password')}
            </label>
            <div className="gate__input-wrap gate__input-wrap--icon">
              <Lock size={17} className="gate__field-icon" aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="gate__input"
                placeholder={t('auth.passwordPlaceholder')}
                required
                autoComplete="current-password"
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

          <div className="gate__row">
            <label className="gate__check">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
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
                <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <div className="gate__divider" role="separator">
          <span>{t('auth.or')}</span>
        </div>

        <button
          type="button"
          className="gate__btn gate__btn--ghost gate__btn--block"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon size={20} />
          <span>{t('auth.googleLogin')}</span>
        </button>
      </AuthCanvas>
    </ErrorBoundary>
  );
};

export default Login;
