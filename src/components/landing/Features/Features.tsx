import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Users,
  BarChart3,
  Link2,
  Mail,
  Shield,
} from 'lucide-react';
import LandingReveal from '../LandingReveal/LandingReveal';
import './Features.scss';

const Features: React.FC = () => {
  const { t, i18n } = useTranslation();

  const features = useMemo(
    () => [
      {
        icon: <Calendar size={18} />,
        title: t('landing.features.eventCreationTitle'),
        description: t('landing.features.eventCreationDesc'),
      },
      {
        icon: <Users size={18} />,
        title: t('landing.features.guestManagementTitle'),
        description: t('landing.features.guestManagementDesc'),
      },
      {
        icon: <Mail size={18} />,
        title: t('landing.features.emailInvitesTitle'),
        description: t('landing.features.emailInvitesDesc'),
      },
      {
        icon: <BarChart3 size={18} />,
        title: t('landing.features.analyticsTitle'),
        description: t('landing.features.analyticsDesc'),
      },
      {
        icon: <Link2 size={18} />,
        title: t('landing.features.rsvpLinkTitle'),
        description: t('landing.features.rsvpLinkDesc'),
      },
      {
        icon: <Shield size={18} />,
        title: t('landing.features.securityTitle'),
        description: t('landing.features.securityDesc'),
      },
    ],
    [t, i18n.language]
  );

  return (
    <section id="features" className="features" aria-labelledby="features-title">
      <div className="features__container">
        <div className="features__layout">
          <LandingReveal as="header" className="features__header" variant="up">
            <span className="features__eyebrow">{t('landing.features.eyebrow')}</span>
            <h2 id="features-title" className="features__title">
              {t('landing.features.title')}
            </h2>
            <p className="features__subtitle">{t('landing.features.subtitle')}</p>
          </LandingReveal>

          <LandingReveal className="features__panel" variant="right" delay={60}>
            <LandingReveal
              as="ul"
              className="features__list"
              nested
              staggerOnly
              staggerChildren
              delay={100}
            >
              {features.map(feature => (
                <li key={feature.title} className="features__item">
                  <span className="features__icon" aria-hidden="true">
                    {feature.icon}
                  </span>
                  <div className="features__item-copy">
                    <h3 className="features__item-title">{feature.title}</h3>
                    <p className="features__item-description">{feature.description}</p>
                  </div>
                </li>
              ))}
            </LandingReveal>
          </LandingReveal>
        </div>
      </div>
    </section>
  );
};

export default Features;
