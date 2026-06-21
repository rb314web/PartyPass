import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MessageCircle, Phone } from 'lucide-react';

interface RSVPOrganizerContactProps {
  organizerEmail?: string;
  organizerPhone?: string;
  eventTitle: string;
}

const RSVPOrganizerContact: React.FC<RSVPOrganizerContactProps> = ({
  organizerEmail,
  organizerPhone,
  eventTitle,
}) => {
  const { t } = useTranslation();
  const email = organizerEmail?.trim();
  const phone = organizerPhone?.trim();

  if (!email && !phone) {
    return null;
  }

  const mailSubject = encodeURIComponent(
    t('rsvp.organizerContact.emailSubject', { eventTitle })
  );
  const mailBody = encodeURIComponent(t('rsvp.organizerContact.emailBody'));

  return (
    <div className="rsvp-contact">
      <p className="rsvp-contact__lead">{t('rsvp.organizerContact.lead')}</p>
      <div className="rsvp-contact__actions">
        {email && (
          <a
            className="rsvp-contact__btn"
            href={`mailto:${email}?subject=${mailSubject}&body=${mailBody}`}
          >
            <Mail size={18} />
            {t('rsvp.organizerContact.sendEmail')}
          </a>
        )}
        {phone && (
          <a className="rsvp-contact__btn" href={`tel:${phone.replace(/\s/g, '')}`}>
            <Phone size={18} />
            {t('rsvp.organizerContact.call')}
          </a>
        )}
        {email && (
          <a
            className="rsvp-contact__btn rsvp-contact__btn--ghost"
            href={`mailto:${email}?subject=${mailSubject}&body=${mailBody}`}
          >
            <MessageCircle size={18} />
            {email}
          </a>
        )}
      </div>
    </div>
  );
};

export default RSVPOrganizerContact;
