import React, { useCallback, useState, Suspense, lazy } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RsvpPreviewScenarioState } from '../../../constants/rsvpPreviewScenarios';
import RSVPInvitationPreview from '../../rsvp/RSVPInvitationPreview';
import HeroBackground from './HeroBackground';
import './Hero.scss';

const Demo = lazy(() => import('../Demo/Demo'));

const INITIAL_PREVIEW_STATE: RsvpPreviewScenarioState = {
  index: 0,
  overlayIndex: null,
  isCrossfading: false,
};

const Hero: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [previewState, setPreviewState] =
    useState<RsvpPreviewScenarioState>(INITIAL_PREVIEW_STATE);
  const handlePreviewStateChange = useCallback((state: RsvpPreviewScenarioState) => {
    setPreviewState(state);
  }, []);

  return (
    <>
      {isDemoOpen && (
        <Suspense fallback={null}>
          <Demo isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
        </Suspense>
      )}
      <section className="hero">
        <HeroBackground {...previewState} />        <div className="hero__container">
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
          </div>

          <div className="hero__visual" aria-hidden="true">
            <RSVPInvitationPreview
              variant="hero"
              onScenarioStateChange={handlePreviewStateChange}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
