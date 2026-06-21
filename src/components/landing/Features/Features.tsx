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
import './Features.scss';

const Features: React.FC = () => {
  const { t, i18n } = useTranslation();

  const features = useMemo(
    () => [
      {
        icon: <Calendar size={24} />,
        title: t('landing.features.eventCreationTitle'),
        description: t('landing.features.eventCreationDesc'),
      },
      {
        icon: <Users size={24} />,
        title: t('landing.features.guestManagementTitle'),
        description: t('landing.features.guestManagementDesc'),
      },
      {
        icon: <Mail size={24} />,
        title: t('landing.features.emailInvitesTitle'),
        description: t('landing.features.emailInvitesDesc'),
      },
      {
        icon: <BarChart3 size={24} />,
        title: t('landing.features.analyticsTitle'),
        description: t('landing.features.analyticsDesc'),
      },
      {
        icon: <Link2 size={24} />,
        title: t('landing.features.rsvpLinkTitle'),
        description: t('landing.features.rsvpLinkDesc'),
      },
      {
        icon: <Shield size={24} />,
        title: t('landing.features.securityTitle'),
        description: t('landing.features.securityDesc'),
      },
    ],
    [t, i18n.language]
  );

  return (
    <section className="features">
      <div className="features__container">
        <div className="features__header">
          <span className="features__eyebrow">{t('landing.features.eyebrow')}</span>
          <h2 className="features__title">{t('landing.features.title')}</h2>
          <p className="features__subtitle">{t('landing.features.subtitle')}</p>
        </div>

        <div className="features__grid">
          {features.map((feature, index) => (
            <div key={index} className="features__card">
              <div className="features__icon">{feature.icon}</div>
              <div className="features__card-copy">
                <h3 className="features__card-title">{feature.title}</h3>
                <p className="features__card-description">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
