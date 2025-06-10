import React, { useEffect } from 'react';
import { FaMapMarkerAlt, FaShare } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import Map from './Map';

interface Event {
  name: string;
  date: string;
  location: string;
  description?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface EventConfirmationProps {
  event: Event;
  qrCodeValue: string;
}

const EventConfirmation: React.FC<EventConfirmationProps> = ({ event, qrCodeValue }) => {
  useEffect(() => {
    console.log('Event data:', event);
    console.log('Coordinates:', event.coordinates);
  }, [event]);

  const handleShare = () => {
    // Implement the share logic here
  };

  return (
    <div className="event-confirmation">
      <div className="event-confirmation__header">
        <h2>{event.name}</h2>
        <p className="event-confirmation__date">
          {new Date(event.date).toLocaleString('pl-PL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      <div className="event-confirmation__details">
        <div className="event-confirmation__detail">
          <FaMapMarkerAlt />
          <span>{event.location}</span>
        </div>
        {event.coordinates && (
          <div className="event-confirmation__map">
            <Map
              lat={event.coordinates.lat}
              lng={event.coordinates.lng}
              zoom={15}
              showSearch={false}
            />
          </div>
        )}
        {event.description && (
          <div className="event-confirmation__description">
            <p>{event.description}</p>
          </div>
        )}
      </div>

      <div className="event-confirmation__qr">
        <QRCodeSVG value={qrCodeValue} size={200} />
        <p>Zeskanuj kod QR, aby potwierdzić obecność</p>
      </div>

      <div className="event-confirmation__actions">
        <button onClick={handleShare} className="event-confirmation__share">
          <FaShare />
          Udostępnij wydarzenie
        </button>
      </div>
    </div>
  );
};

export default EventConfirmation; 