import React from 'react';
import { useTranslation } from 'react-i18next';
import LandingReveal from '../LandingReveal/LandingReveal';
import './FaqSection.scss';

const FAQ_ITEMS = ['freePlan', 'guestAccount', 'emailInvites', 'changePlan', 'rsvpLink'] as const;

const FaqSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="faq__container">
        <LandingReveal as="header" className="faq__header" variant="up">
          <span className="faq__eyebrow">{t('landing.faq.eyebrow')}</span>
          <h2 id="faq-title" className="faq__title">
            {t('landing.faq.title')}
          </h2>
          <p className="faq__subtitle">{t('landing.faq.subtitle')}</p>
        </LandingReveal>

        <LandingReveal className="faq__panel" variant="scale" delay={60}>
          <LandingReveal
            as="div"
            className="faq__list"
            nested
            staggerOnly
            staggerChildren
            delay={100}
          >
            {FAQ_ITEMS.map((key) => (
              <details key={key} className="faq__item">
                <summary className="faq__question">
                  {t(`landing.faq.items.${key}.question`)}
                </summary>
                <p className="faq__answer">{t(`landing.faq.items.${key}.answer`)}</p>
              </details>
            ))}
          </LandingReveal>
        </LandingReveal>
      </div>
    </section>
  );
};

export default FaqSection;
