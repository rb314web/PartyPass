import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import UnifiedHeader from '../../common/UnifiedHeader/UnifiedHeader';
import Footer from '../../common/Footer/Footer';
import './AuthCanvas.scss';

export interface AuthCanvasStat {
  value: string;
  label: string;
}

export interface AuthCanvasProps {
  badge?: string;
  title: string;
  subtitle: string;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
  stats?: AuthCanvasStat[];
  wide?: boolean;
  children: React.ReactNode;
}

const AuthCanvas: React.FC<AuthCanvasProps> = ({
  badge,
  title,
  subtitle,
  headerExtra,
  footer,
  stats,
  wide = false,
  children,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="gate">
      <UnifiedHeader variant="auth" />

      <main id="main-content" className="gate__main" tabIndex={-1}>
        <div className="gate__ambient" aria-hidden="true">
          <div className="gate__orb gate__orb--one" />
          <div className="gate__orb gate__orb--two" />
          <div className="gate__grid" />
        </div>

        <div className="gate__stage">
          <div className={`gate__card${wide ? ' gate__card--wide' : ''}`}>
            <button type="button" className="gate__logo" onClick={() => navigate('/')}>
              <span className="gate__logo-mark" aria-hidden="true">
                PP
              </span>
              <span className="gate__logo-text">
                <span className="gate__logo-primary">Party</span>
                <span className="gate__logo-accent">Pass</span>
              </span>
            </button>

            <header className="gate__head">
              {badge && <span className="gate__badge">{badge}</span>}
              <h1 className="gate__title">{title}</h1>
              <p className="gate__subtitle">{subtitle}</p>
              {headerExtra}
            </header>

            <div className="gate__body">{children}</div>

            {footer && <footer className="gate__foot">{footer}</footer>}
          </div>

          <div className="gate__trust">
            {stats && stats.length > 0 && (
              <div className="gate__stats">
                {stats.map((stat) => (
                  <div key={stat.label} className="gate__stat">
                    <span className="gate__stat-value">{stat.value}</span>
                    <span className="gate__stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="gate__secure">
              <ShieldCheck size={14} aria-hidden="true" />
              <span>{t('auth.secureNote')}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthCanvas;
