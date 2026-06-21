import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarPlus, Download } from 'lucide-react';
import {
  downloadIcsFile,
  getAppleCalendarUrl,
  getGoogleCalendarUrl,
  type RsvpCalendarEvent,
} from '../../utils/rsvpEventHelpers';

interface RSVPCalendarActionsProps {
  event: RsvpCalendarEvent;
  embedded?: boolean;
}

const RSVPCalendarActions: React.FC<RSVPCalendarActionsProps> = ({
  event,
  embedded = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`rsvp-actions ${embedded ? 'rsvp-actions--embedded' : ''}`}>
      {embedded ? (
        <h3 className="rsvp-card__subtitle">{t('rsvp.calendar.addToCalendar')}</h3>
      ) : (
        <h2 className="rsvp-card__title">{t('rsvp.calendar.addToCalendar')}</h2>
      )}
      <div className="rsvp-actions__row">
        <a
          className="rsvp-actions__btn"
          href={getGoogleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          title={t('rsvp.calendar.googleTitle')}
        >
          <CalendarPlus size={20} />
          {t('rsvp.calendar.google')}
        </a>
        <a
          className="rsvp-actions__btn"
          href={getAppleCalendarUrl(event)}
          onClick={(e) => {
            e.preventDefault();
            downloadIcsFile(event);
          }}
          title={t('rsvp.calendar.appleTitle')}
        >
          <CalendarPlus size={20} />
          {t('rsvp.calendar.apple')}
        </a>
        <button
          type="button"
          className="rsvp-actions__btn"
          onClick={() => downloadIcsFile(event)}
          title={t('rsvp.calendar.downloadIcsTitle')}
        >
          <Download size={20} />
          {t('rsvp.calendar.downloadIcs')}
        </button>
      </div>
    </div>
  );
};

export default RSVPCalendarActions;
