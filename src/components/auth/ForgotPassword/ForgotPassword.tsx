import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle, KeyRound, Mail } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import ErrorBoundary from '../../common/ErrorBoundary/ErrorBoundary';
import AuthSheet from '../ui/AuthSheet';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { resetPassword, loading, error, clearError } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();

    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      // handled in auth context
    }
  };

  return (
    <ErrorBoundary>
      <AuthSheet
        title={t('auth.forgotTitle')}
        subtitle={sent ? t('auth.forgotSubtitleSent') : t('auth.forgotSubtitle')}
        footer={
          !sent ? (
            <p>
              <Link to="/login" className="gate__link">
                {t('auth.backToLogin')}
              </Link>
            </p>
          ) : undefined
        }
      >
        {error && !sent && (
          <div className="gate__alert gate__alert--error" role="alert">
            {error}
          </div>
        )}

        {sent ? (
          <div className="gate__form">
            <div className="gate__alert gate__alert--success" role="status">
              <CheckCircle size={18} aria-hidden="true" />
              <span>
                <Trans
                  i18nKey="auth.forgotSentMessage"
                  values={{ email }}
                  components={{ strong: <strong /> }}
                />
              </span>
            </div>
            <Link to="/login" className="gate__btn gate__btn--block">
              <span>{t('auth.backToLogin')}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <form className="gate__form" onSubmit={handleSubmit} noValidate>
            <div className="gate__field">
              <label className="gate__label" htmlFor="forgot-email">
                {t('common.email')}
              </label>
              <div className="gate__input-wrap gate__input-wrap--icon">
                <Mail size={17} className="gate__field-icon" aria-hidden="true" />
                <input
                  id="forgot-email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="gate__input"
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              className="gate__btn gate__btn--block"
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <span className="gate__spinner" aria-hidden="true" />
              ) : (
                <>
                  <KeyRound size={18} aria-hidden="true" />
                  <span>{t('auth.forgotSubmit')}</span>
                </>
              )}
            </button>
          </form>
        )}
      </AuthSheet>
    </ErrorBoundary>
  );
};

export default ForgotPassword;
