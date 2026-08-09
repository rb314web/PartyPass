import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import UnifiedHeader from '../../common/UnifiedHeader/UnifiedHeader';
import Footer from '../../common/Footer/Footer';
import './AuthCanvas.scss';

export type AuthShowcaseKey = 'login' | 'register' | 'forgot';

export interface AuthCanvasProps {
  title: string;
  subtitle: string;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
  showcase?: AuthShowcaseKey;
  wide?: boolean;
  children: React.ReactNode;
}

const AuthCanvas: React.FC<AuthCanvasProps> = ({
  title,
  subtitle,
  headerExtra,
  footer,
  showcase,
  wide = false,
  children,
}) => {
  const { t } = useTranslation();

  const features = showcase
    ? [
        t(`auth.showcase.${showcase}.feature1`),
        t(`auth.showcase.${showcase}.feature2`),
        t(`auth.showcase.${showcase}.feature3`),
      ]
    : [];

  return (
    <div className="gate">
      <UnifiedHeader variant="auth" />

      <main id="main-content" className="gate__main" tabIndex={-1}>
        <div
          className={`gate__layout${wide ? ' gate__layout--wide' : ''}${
            showcase ? ' gate__layout--split' : ''
          }`}
        >
          {showcase && (
            <aside className="gate__intro">
              <div className="gate__intro-top">
                <p className="gate__intro-kicker">
                  {t(`auth.showcase.${showcase}.eyebrow`)}
                </p>
                <h2 className="gate__intro-title">
                  {t(`auth.showcase.${showcase}.title`)}
                </h2>
                <p className="gate__intro-copy">
                  {t(`auth.showcase.${showcase}.subtitle`)}
                </p>
              </div>

              <ul className="gate__intro-list">
                {features.map(feature => (
                  <li key={feature}>
                    <span className="gate__intro-check" aria-hidden="true">
                      <Check size={14} strokeWidth={2.75} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <dl className="gate__intro-stats">
                <div>
                  <dd>{t(`auth.showcase.${showcase}.statEventsValue`)}</dd>
                  <dt>{t(`auth.showcase.${showcase}.statEvents`)}</dt>
                </div>
                <div>
                  <dd>{t(`auth.showcase.${showcase}.statRsvpValue`)}</dd>
                  <dt>{t(`auth.showcase.${showcase}.statRsvp`)}</dt>
                </div>
              </dl>
            </aside>
          )}

          <section className={`gate__sheet${wide ? ' gate__sheet--wide' : ''}`}>
            <header className="gate__sheet-head">
              <h1 className="gate__sheet-title">{title}</h1>
              <p className="gate__sheet-subtitle">{subtitle}</p>
              {headerExtra}
            </header>

            <div className="gate__sheet-body">{children}</div>

            {footer && <div className="gate__sheet-foot">{footer}</div>}
          </section>
        </div>
      </main>

      <Footer variant="landing" />
    </div>
  );
};

export default AuthCanvas;
