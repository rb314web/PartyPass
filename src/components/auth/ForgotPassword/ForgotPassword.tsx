import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import ErrorBoundary from '../../common/ErrorBoundary/ErrorBoundary';
import AuthLayout from '../AuthLayout/AuthLayout';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { resetPassword, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      // error from context
    }
  };

  return (
    <ErrorBoundary>
      <AuthLayout
        variant="forgot"
        title={t('auth.forgotTitle')}
        subtitle={sent ? t('auth.forgotSubtitleSent') : t('auth.forgotSubtitle')}
      >
        {error && !sent && (
          <div className="pp-form-alert pp-form-alert--error auth-page__error">
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="auth-page__body">
            <div className="pp-form-alert pp-form-alert--success">
              <CheckCircle size={18} />
              <span>
                <Trans
                  i18nKey="auth.forgotSentMessage"
                  values={{ email }}
                  components={{ strong: <strong /> }}
                />
              </span>
            </div>
            <Link
              to="/login"
              className="pp-btn pp-btn--primary pp-btn--block pp-btn--lg"
            >
              {t('auth.backToLogin')}
              <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-page__body">
            <div className="pp-field">
              <label className="pp-label" htmlFor="forgot-email">
                {t('common.email')}
              </label>
              <div className="pp-input-wrap">
                <Mail size={20} className="pp-input-icon" />
                <input
                  id="forgot-email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pp-input pp-input--icon-left"
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              className="pp-btn pp-btn--primary pp-btn--block pp-btn--lg"
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <span className="auth-page__spinner" />
              ) : (
                <>
                  {t('auth.forgotSubmit')}
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <p className="auth-page__footer auth-page__footer--inline">
              <Link to="/login" className="auth-page__link">
                {t('auth.backToLogin')}
              </Link>
            </p>
          </form>
        )}
      </AuthLayout>
    </ErrorBoundary>
  );
};

export default ForgotPassword;
