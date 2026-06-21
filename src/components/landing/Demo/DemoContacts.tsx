import React from 'react';
import { Users } from 'lucide-react';
import PageHeader from '../../common/PageHeader/PageHeader';
import { mockContacts } from './demoData';
import '../../dashboard/Contacts/Contacts.scss';

const DemoContacts: React.FC = () => (
  <div className="contacts">
    <PageHeader
      title="Kontakty"
      subtitle="Zarządzaj swoją bazą kontaktów i gości"
      icon={Users}
    />

    <div className="contacts__list">
      {mockContacts.map(contact => (
        <article key={contact.id} className="contacts__card">
          <div className="contacts__card-header">
            <div className="contacts__card-info">
              <div className="contacts__contact-avatar">
                {contact.firstName[0]}
                {contact.lastName[0]}
              </div>
              <div>
                <div className="contacts__contact-name">
                  {contact.firstName} {contact.lastName}
                </div>
                <div className="contacts__contact-email">{contact.email}</div>
              </div>
            </div>
          </div>
          <div className="contacts__card-details">
            <div className="contacts__card-field">
              <div className="contacts__card-label">Telefon</div>
              <div className="contacts__card-value">{contact.phone}</div>
            </div>
            <div className="contacts__card-field">
              <div className="contacts__card-label">Wydarzenia</div>
              <div className="contacts__card-value">
                {contact.eventsAttended} · ostatnio: {contact.lastEvent}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
);

export default DemoContacts;
