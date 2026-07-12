import React, { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RsvpPreviewScenarioState } from '../../../constants/rsvpPreviewScenarios';
import RSVPInvitationPreview from '../../rsvp/RSVPInvitationPreview';
import HeroBackground from './HeroBackground';
import { trackLandingCtaClick } from '../../../services/landingAnalytics';
import './Hero.scss';

const INITIAL_PREVIEW_STATE: RsvpPreviewScenarioState = {
  index: 0,
  overlayIndex: null,
  isCrossfading: false,
};

const Hero: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [previewState, setPreviewState] =
    useState<RsvpPreviewScenarioState>(INITIAL_PREVIEW_STATE);
  const handlePreviewStateChange = useCallback((state: RsvpPreviewScenarioState) => {
    setPreviewState(state);
  }, []);

  return (
    <section id="hero" className="hero">
      <HeroBackground {...previewState} />
      <div className="hero__container">
          <div className="hero__copy">
            <div className="hero__headline">
              <span className="hero__eyebrow">{t('landing.heroEyebrow')}</span>

              <h1 className="hero__title">
                <Trans
                  i18nKey="landing.heroTitle"
                  components={{ 1: <span className="hero__title--highlight" /> }}
                />
              </h1>
            </div>

            <div className="hero__details">
              <p className="hero__subtitle">{t('landing.heroSubtitle')}</p>

              <div className="hero__actions">
                <button
                  type="button"
                  className="pp-btn pp-btn--primary pp-btn--lg"
                  onClick={() => {
                    trackLandingCtaClick('hero', 'start_free', 'starter');
                    navigate('/register?plan=starter');
                  }}
                >
                  {t('landing.startFreeLong')}
                  <ArrowRight size={20} />
                </button>
                <button
                  type="button"
                  className="pp-btn pp-btn--outline pp-btn--lg"
                  onClick={() => {
                    trackLandingCtaClick('hero', 'view_pricing');
                    document.getElementById('pricing')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}
                >
                  {t('landing.viewPricing')}
                </button>
              </div>
            </div>
          </div>

          <div
            className="hero__visual"
            role="group"
            aria-labelledby="hero-preview-title"
            aria-describedby="hero-preview-desc"
          >
            <h2 id="hero-preview-title" className="sr-only">
              {t('landing.heroPreview.title')}
            </h2>
            <p id="hero-preview-desc" className="sr-only">
              {t('landing.heroPreview.description')}
            </p>
            <RSVPInvitationPreview
              variant="hero"
              onScenarioStateChange={handlePreviewStateChange}
            />
          </div>
        </div>
    </section>
  );
};

export default Hero;
