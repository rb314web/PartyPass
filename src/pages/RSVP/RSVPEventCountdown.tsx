import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Timer } from 'lucide-react';
import { formatEventCountdown } from '../../utils/rsvpEventHelpers';
import './RSVPEventCountdown.scss';

interface RSVPEventCountdownProps {
  eventDate: Date;
  compact?: boolean;
}

const RSVPEventCountdown: React.FC<RSVPEventCountdownProps> = ({
  eventDate,
  compact = false,
}) => {
  const { i18n } = useTranslation();
  const [countdown, setCountdown] = useState(() =>
    formatEventCountdown(eventDate)
  );

  useEffect(() => {
    const update = () => setCountdown(formatEventCountdown(eventDate));
    update();

    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, [eventDate, i18n.language]);

  return (
    <div
      className={[
        'rsvp-countdown',
        `rsvp-countdown--${countdown.variant}`,
        compact ? 'rsvp-countdown--compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
    >
      <Timer size={compact ? 15 : 18} aria-hidden="true" />
      <span>{countdown.label}</span>
    </div>
  );
};

export default RSVPEventCountdown;
