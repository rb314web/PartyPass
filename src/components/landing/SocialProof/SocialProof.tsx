import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Link2, Quote, Zap } from 'lucide-react';
import LandingReveal from '../LandingReveal/LandingReveal';
import './SocialProof.scss';

const STATS = [
  { icon: Clock, valueKey: 'statSetupValue', labelKey: 'statSetupLabel' },
  { icon: Link2, valueKey: 'statRsvpValue', labelKey: 'statRsvpLabel' },
  { icon: Zap, valueKey: 'statLiveValue', labelKey: 'statLiveLabel' },
] as const;

const TESTIMONIALS = ['birthday', 'meetup', 'gala'] as const;

const SocialProof: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="social-proof" id="social-proof" aria-labelledby="social-proof-title">
      <div className="social-proof__container">
        <div className="social-proof__layout">
          <div className="social-proof__intro">
            <LandingReveal as="header" className="social-proof__header" variant="up">
              <p className="social-proof__eyebrow">{t('landing.socialProof.eyebrow')}</p>
              <h2 id="social-proof-title" className="social-proof__title">
                {t('landing.socialProof.title')}
              </h2>
              <p className="social-proof__subtitle">{t('landing.socialProof.subtitle')}</p>
              <p className="social-proof__disclaimer">{t('landing.socialProof.disclaimer')}</p>
            </LandingReveal>

            <LandingReveal
              as="ul"
              className="social-proof__metrics"
              aria-label={t('landing.socialProof.metricsAria')}
              variant="up"
              delay={70}
              staggerOnly
              staggerChildren
            >
              {STATS.map(({ icon: Icon, valueKey, labelKey }) => (
                <li key={valueKey} className="social-proof__metric">
                  <span className="social-proof__metric-icon" aria-hidden="true">
                    <Icon size={16} strokeWidth={2.25} />
                  </span>
                  <span className="social-proof__metric-copy">
                    <span className="social-proof__metric-value">
                      {t(`landing.socialProof.${valueKey}`)}
                    </span>
                    <span className="social-proof__metric-label">
                      {t(`landing.socialProof.${labelKey}`)}
                    </span>
                  </span>
                </li>
              ))}
            </LandingReveal>
          </div>

          <LandingReveal
            as="aside"
            className="social-proof__quotes-panel"
            aria-label={t('landing.socialProof.voicesLabel')}
            variant="right"
            delay={50}
          >
            <p className="social-proof__voices-label">{t('landing.socialProof.voicesLabel')}</p>
            <LandingReveal
              as="ul"
              className="social-proof__testimonials"
              nested
              staggerOnly
              staggerChildren
              delay={110}
            >
              {TESTIMONIALS.map(key => (
                <li key={key} className="social-proof__quote">
                  <div className="social-proof__quote-top">
                    <span className="social-proof__quote-mark" aria-hidden="true">
                      <Quote size={14} strokeWidth={2.5} />
                    </span>
                    <span className="social-proof__quote-tag">
                      {t(`landing.socialProof.testimonials.${key}.tag`)}
                    </span>
                  </div>
                  <blockquote className="social-proof__quote-text">
                    <p>{t(`landing.socialProof.testimonials.${key}.quote`)}</p>
                  </blockquote>
                  <footer className="social-proof__quote-author">
                    <span className="social-proof__avatar" aria-hidden="true">
                      {t(`landing.socialProof.testimonials.${key}.initials`)}
                    </span>
                    <span className="social-proof__author-meta">
                      <cite className="social-proof__author-name">
                        {t(`landing.socialProof.testimonials.${key}.name`)}
                      </cite>
                      <span className="social-proof__author-role">
                        {t(`landing.socialProof.testimonials.${key}.role`)}
                      </span>
                    </span>
                  </footer>
                </li>
              ))}
            </LandingReveal>
          </LandingReveal>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
