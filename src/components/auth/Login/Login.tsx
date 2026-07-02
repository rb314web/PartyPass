// components/auth/Login/Login.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import GoogleIcon from './GoogleIcon';
import ErrorBoundary from '../../common/ErrorBoundary/ErrorBoundary';
import AuthLayout from '../AuthLayout/AuthLayout';
import './Login.scss';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { login, loginWithGoogle, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData.email, formData.password);
    } catch {
      // Error is set in auth context
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    try {
      await loginWithGoogle();
    } catch {
      // Error is set in auth context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <ErrorBoundary>
      <AuthLayout
        variant="login"
        title={t('auth.loginTitle')}
        subtitle={t('auth.loginSubtitle')}
        footer={
          <p>
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="auth-page__link">
              {t('auth.register')}
            </Link>
          </p>
        }
      >
        {error && (
          <div className="pp-form-alert pp-form-alert--error auth-page__error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-page__body login__form">
          <div className="pp-field">
            <label className="pp-label" htmlFor="login-email">
              {t('common.email')}
            </label>
            <div className="pp-input-wrap">
              <Mail size={20} className="pp-input-icon" />
              <input
                id="login-email"
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

          <div className="pp-field">
            <label className="pp-label" htmlFor="login-password">
              {t('common.password')}
            </label>
            <div className="pp-input-wrap">
              <Lock size={20} className="pp-input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="pp-input pp-input--icon-left pp-input--icon-right"
                placeholder={t('auth.passwordPlaceholder')}
                required
                autoComplete="current-password"
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

          <div className="login__options">
            <label className="auth-page__checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <span className="auth-page__checkbox-box" />
              {t('auth.rememberMe')}
            </label>
            <Link to="/forgot-password" className="login__forgot">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <button
            type="submit"
            className="pp-btn pp-btn--primary pp-btn--block pp-btn--lg login__submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-page__spinner" />
            ) : (
              <>
                {t('auth.login')}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="auth-page__divider" role="separator">
          <span>{t('auth.or')}</span>
        </div>

        <button
          type="button"
          className="auth-page__social-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon size={20} />
          {t('auth.googleLogin')}
        </button>
      </AuthLayout>
    </ErrorBoundary>
  );
};

export default Login;
