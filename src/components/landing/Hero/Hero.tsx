import React, { useState, Suspense, lazy } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RSVPInvitationPreview from '../../rsvp/RSVPInvitationPreview';
import './Hero.scss';

const Demo = lazy(() => import('../Demo/Demo'));

const Hero: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <>
      {isDemoOpen && (
        <Suspense fallback={null}>
          <Demo isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
        </Suspense>
      )}
      <section className="hero">
        <div className="hero__container">
          <div className="hero__content">
            <span className="hero__eyebrow">{t('landing.heroEyebrow')}</span>

            <h1 className="hero__title">
              <Trans
                i18nKey="landing.heroTitle"
                components={{ 1: <span className="hero__title--highlight" /> }}
              />
            </h1>

            <p className="hero__subtitle">{t('landing.heroSubtitle')}</p>

            <div className="hero__actions">
              <button
                type="button"
                className="pp-btn pp-btn--primary pp-btn--lg"
                onClick={() => navigate('/register?plan=starter')}
              >
                {t('landing.startFree')}
                <ArrowRight size={20} />
              </button>
              <button
                type="button"
                className="pp-btn pp-btn--outline pp-btn--lg"
                onClick={() => setIsDemoOpen(true)}
              >
                <Play size={20} />
                {t('landing.watchDemo')}
              </button>
            </div>
          </div>

          <div className="hero__visual" aria-hidden="true">
            <div className="hero__preview">
              <div className="hero__preview-glow" aria-hidden="true" />
              <RSVPInvitationPreview variant="hero" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
