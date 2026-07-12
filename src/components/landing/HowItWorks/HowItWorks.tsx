import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarPlus, Mail, Users } from 'lucide-react';
import LandingReveal from '../LandingReveal/LandingReveal';
import './HowItWorks.scss';

const STEPS = [
  { icon: CalendarPlus, titleKey: 'step1Title', descKey: 'step1Desc' },
  { icon: Mail, titleKey: 'step2Title', descKey: 'step2Desc' },
  { icon: Users, titleKey: 'step3Title', descKey: 'step3Desc' },
] as const;

const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="how-it-works" id="how-it-works" aria-labelledby="how-it-works-title">
      <div className="how-it-works__container">
        <LandingReveal as="header" className="how-it-works__header" variant="up">
          <span className="how-it-works__eyebrow">
            {t('landing.howItWorks.eyebrow')}
          </span>
          <h2 id="how-it-works-title" className="how-it-works__title">
            {t('landing.howItWorks.title')}
          </h2>
          <p className="how-it-works__subtitle">
            {t('landing.howItWorks.subtitle')}
          </p>
        </LandingReveal>

        <LandingReveal className="how-it-works__panel" variant="scale" delay={60}>
          <LandingReveal
            as="ol"
            className="how-it-works__steps"
            nested
            staggerOnly
            staggerChildren
            delay={110}
          >
            {STEPS.map(({ icon: Icon, titleKey, descKey }, index) => (
              <li key={titleKey} className="how-it-works__step">
                <span className="how-it-works__step-badge" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="how-it-works__step-icon" aria-hidden="true">
                  <Icon size={20} strokeWidth={2.25} />
                </span>
                <div className="how-it-works__step-copy">
                  <h3>{t(`landing.howItWorks.${titleKey}`)}</h3>
                  <p>{t(`landing.howItWorks.${descKey}`)}</p>
                </div>
              </li>
            ))}
          </LandingReveal>
        </LandingReveal>
      </div>
    </section>
  );
};

export default HowItWorks;
