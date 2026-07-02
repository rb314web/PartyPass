import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher/LanguageSwitcher';
import RSVPEventCountdown from '../../pages/RSVP/RSVPEventCountdown';
import '../common/LanguageSwitcher/LanguageSwitcher.scss';
import '../../pages/RSVP/RSVPEventCountdown.scss';

interface RSVPInvitationHeroSectionProps {
  eventDate: Date;
  children: React.ReactNode;
}

const RSVPInvitationHeroSection: React.FC<RSVPInvitationHeroSectionProps> = ({
  eventDate,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <section className="rsvp-hero">
      <div className="rsvp-hero__top">
        <span className="rsvp-hero__eyebrow">{t('rsvp.common.invitation')}</span>
        <div className="rsvp-hero__top-actions">
          <LanguageSwitcher compact variant="hero" />
          <RSVPEventCountdown eventDate={eventDate} compact />
        </div>
      </div>

      <div className="rsvp-hero__content">{children}</div>
    </section>
  );
};

export default RSVPInvitationHeroSection;
