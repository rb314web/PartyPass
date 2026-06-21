import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarPlus, Mail, Users } from 'lucide-react';
import './HowItWorks.scss';

const STEPS = [
  { icon: CalendarPlus, titleKey: 'step1Title', descKey: 'step1Desc' },
  { icon: Mail, titleKey: 'step2Title', descKey: 'step2Desc' },
  { icon: Users, titleKey: 'step3Title', descKey: 'step3Desc' },
] as const;

const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works__container">
        <header className="how-it-works__header">
          <span className="how-it-works__eyebrow">
            {t('landing.howItWorks.eyebrow')}
          </span>
          <h2 className="how-it-works__title">
            {t('landing.howItWorks.title')}
          </h2>
          <p className="how-it-works__subtitle">
            {t('landing.howItWorks.subtitle')}
          </p>
        </header>

        <ol className="how-it-works__steps">
          {STEPS.map(({ icon: Icon, titleKey, descKey }, index) => (
            <li key={titleKey} className="how-it-works__step">
              <span className="how-it-works__step-num">{index + 1}</span>
              <div className="how-it-works__step-icon">
                <Icon size={22} strokeWidth={2} />
              </div>
              <div className="how-it-works__step-copy">
                <h3>{t(`landing.howItWorks.${titleKey}`)}</h3>
                <p>{t(`landing.howItWorks.${descKey}`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
