import React from 'react';
import { Mail, Phone, Users } from 'lucide-react';
import { DemoContact } from './demo.types';

interface DemoContactsProps {
  mockContacts: DemoContact[];
}

const DemoContacts: React.FC<DemoContactsProps> = React.memo(({ mockContacts }) => (
  <div className="demo__contacts-content">
    <div className="demo__page-header">
      <h1>Kontakty</h1>
      <p>Zarządzaj swoją bazą kontaktów</p>
    </div>

    <div className="demo__contacts-grid">
      {mockContacts.map(contact => (
        <div key={contact.id} className="demo__contact-card">
          <div className="demo__contact-card-header">
            <div className="demo__contact-card-avatar">
              {contact.firstName[0]}{contact.lastName[0]}
            </div>
            <div className="demo__contact-card-info">
              <span className="demo__contact-card-name">
                {contact.firstName} {contact.lastName}
              </span>
              <span className="demo__contact-card-email">{contact.email}</span>
            </div>
          </div>
          <div className="demo__contact-card-details">
            <div className="demo__contact-card-detail-item">
              <Phone size={16} />
              <span>{contact.phone}</span>
            </div>
            <div className="demo__contact-card-detail-item">
              <Users size={16} />
              <span>Uczestniczył w {contact.eventsAttended} wydarzeniach</span>
            </div>
            <div className="demo__contact-card-detail-item">
              <span>Ostatnie wydarzenie: {contact.lastEvent}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

DemoContacts.displayName = 'DemoContacts';

export default DemoContacts;

