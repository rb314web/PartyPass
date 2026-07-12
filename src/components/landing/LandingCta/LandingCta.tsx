import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import LandingDashboardPreview from '../LandingDashboardPreview/LandingDashboardPreview';
import LandingReveal from '../LandingReveal/LandingReveal';
import { trackLandingCtaClick } from '../../../services/landingAnalytics';
import './LandingCta.scss';

const LandingCta: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="landing-cta" id="cta" aria-labelledby="landing-cta-title">
      <div className="landing-cta__inner">
        <LandingReveal className="landing-cta__copy" variant="up">
          <span className="landing-cta__eyebrow">{t('landing.cta.eyebrow')}</span>
          <h2 id="landing-cta-title" className="landing-cta__title">
            {t('landing.cta.title')}
          </h2>
          <p className="landing-cta__subtitle">{t('landing.cta.subtitle')}</p>
          <ul className="landing-cta__perks">
            <li>
              <Check size={16} aria-hidden />
              {t('landing.cta.perkFree')}
            </li>
            <li>
              <Check size={16} aria-hidden />
              {t('landing.cta.perkNoCard')}
            </li>
            <li>
              <Check size={16} aria-hidden />
              {t('landing.cta.perkFast')}
            </li>
          </ul>
          <div className="landing-cta__actions">
            <button
              type="button"
              className="pp-btn pp-btn--primary pp-btn--lg"
              onClick={() => {
                trackLandingCtaClick('cta', 'start_free', 'starter');
                navigate('/register?plan=starter');
              }}
            >
              {t('landing.cta.button')}
              <ArrowRight size={20} />
            </button>
          </div>
        </LandingReveal>

        <LandingReveal className="landing-cta__visual" variant="right" delay={70}>
          <LandingDashboardPreview />
          <p className="landing-cta__preview-label">{t('landing.cta.previewLabel')}</p>
        </LandingReveal>
      </div>
    </section>
  );
};

export default LandingCta;
