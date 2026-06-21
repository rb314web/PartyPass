import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Link2,
  Sparkles,
  Users,
} from 'lucide-react';
import UnifiedHeader from '../../common/UnifiedHeader/UnifiedHeader';
import './AuthLayout.scss';

export type AuthLayoutVariant = 'login' | 'register' | 'forgot';

export interface AuthLayoutProps {
  variant: AuthLayoutVariant;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerExtra?: React.ReactNode;
}

const showcaseIcons = [Sparkles, Link2, Users];

const AuthLayout: React.FC<AuthLayoutProps> = ({
  variant,
  title,
  subtitle,
  children,
  footer,
  headerExtra,
}) => {
  const { t } = useTranslation();
  const ns = `auth.showcase.${variant}`;

  const features = [1, 2, 3].map(index => ({
    icon: showcaseIcons[index - 1],
    text: t(`${ns}.feature${index}`),
  }));

  return (
    <>
      <UnifiedHeader variant="auth" />
      <div className={`auth-page auth-page--${variant}`}>
        <aside className="auth-page__showcase" aria-hidden="true">
          <div className="auth-page__showcase-grid" />
          <div className="auth-page__showcase-glow auth-page__showcase-glow--1" />
          <div className="auth-page__showcase-glow auth-page__showcase-glow--2" />

          <div className="auth-page__showcase-inner">
            <Link to="/" className="auth-page__brand" tabIndex={-1}>
              <span className="auth-page__brand-primary">Party</span>
              <span className="auth-page__brand-accent">Pass</span>
            </Link>

            <span className="auth-page__eyebrow">{t(`${ns}.eyebrow`)}</span>
            <h2 className="auth-page__showcase-title">{t(`${ns}.title`)}</h2>
            <p className="auth-page__showcase-subtitle">{t(`${ns}.subtitle`)}</p>

            <ul className="auth-page__features">
              {features.map(({ icon: Icon, text }, index) => (
                <li key={index} className="auth-page__feature">
                  <span className="auth-page__feature-icon">
                    <Icon size={18} strokeWidth={2.25} />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="auth-page__stats">
              <div className="auth-page__stat">
                <CalendarCheck size={18} />
                <div>
                  <strong>{t(`${ns}.statEventsValue`)}</strong>
                  <span>{t(`${ns}.statEvents`)}</span>
                </div>
              </div>
              <div className="auth-page__stat">
                <Users size={18} />
                <div>
                  <strong>{t(`${ns}.statRsvpValue`)}</strong>
                  <span>{t(`${ns}.statRsvp`)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-page__preview">
            <div className="auth-page__preview-card">
              <div className="auth-page__preview-label">
                {t('auth.showcase.previewLabel')}
              </div>
              <div className="auth-page__preview-title">
                {t('auth.showcase.previewEvent')}
              </div>
              <div className="auth-page__preview-row">
                <span className="auth-page__preview-pill auth-page__preview-pill--yes">
                  {t('auth.showcase.previewGoing')}
                </span>
                <span className="auth-page__preview-pill auth-page__preview-pill--maybe">
                  {t('auth.showcase.previewMaybe')}
                </span>
              </div>
              <div className="auth-page__preview-bar">
                <span style={{ width: '72%' }} />
              </div>
            </div>
          </div>
        </aside>

        <main className="auth-page__panel">
          <div className="auth-page__panel-inner">
            <header className="auth-page__form-header">
              <h1 className="auth-page__title">{title}</h1>
              <p className="auth-page__subtitle">{subtitle}</p>
              {headerExtra}
            </header>

            {children}

            {footer && <footer className="auth-page__footer">{footer}</footer>}
          </div>
        </main>
      </div>
    </>
  );
};

export default AuthLayout;
