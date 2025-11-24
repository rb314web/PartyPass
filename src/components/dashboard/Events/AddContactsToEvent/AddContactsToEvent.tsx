import React, { useState, useEffect } from 'react';
import { Search, Users, UserCheck, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { ContactService } from '../../../../services/firebase/contactService';
import { EventGuestService } from '../../../../services/firebase/eventGuestService';
import { Contact } from '../../../../types';
import './AddContactsToEvent.scss';

interface AddContactsToEventProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  onContactsAdded: () => void;
}

type GuestOption = {
  type: 'alone' | 'spouse' | 'companion';
  spouseFirstName?: string;
  spouseLastName?: string;
  companionFirstName?: string;
  companionLastName?: string;
};

const AddContactsToEvent: React.FC<AddContactsToEventProps> = ({
  open,
  onClose,
  eventId,
  eventTitle,
  onContactsAdded
}) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [contactGuestOptions, setContactGuestOptions] = useState<Record<string, GuestOption>>({});
  const [globalSettings, setGlobalSettings] = useState({
    eventSpecificNotes: ''
  });

  // Load contacts when dialog opens
  useEffect(() => {
    const loadContacts = async () => {
      if (!user?.id || !open) return;
      
      setLoadingContacts(true);
      try {
        const result = await ContactService.getUserContacts(user.id, {}, 100);
        
        // Filter out contacts that are already in the event
        const existingContactIds = await getExistingContactIds();
        const availableContacts = result.contacts.filter(
          contact => !existingContactIds.includes(contact.id)
        );
        
        setContacts(availableContacts);
        setError(null);
      } catch (err: any) {
        setError('Błąd podczas ładowania kontaktów');
        console.error('Error loading contacts:', err);
      } finally {
        setLoadingContacts(false);
      }
    };

    loadContacts();
  }, [user?.id, open, eventId]);

  // Get existing contact IDs for this event
  const getExistingContactIds = async (): Promise<string[]> => {
    try {
      const eventGuests = await EventGuestService.getEventGuests(eventId);
      return eventGuests.map(guest => guest.contact.id);
    } catch (error) {
      console.error('Error getting existing contacts:', error);
      return [];
    }
  };

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      contact.firstName.toLowerCase().includes(searchTerm) ||
      contact.lastName.toLowerCase().includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm)
    );
  });

  const handleContactToggle = (contactId: string) => {
    if (loading) return;
    
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        // Usuwanie kontaktu - usuń też jego opcje
        const updated = { ...contactGuestOptions };
        delete updated[contactId];
        setContactGuestOptions(updated);
        return prev.filter(id => id !== contactId);
      } else {
        // Dodawanie kontaktu - domyślnie "idzie sam"
        setContactGuestOptions({
          ...contactGuestOptions,
          [contactId]: { type: 'alone' }
        });
        return [...prev, contactId];
      }
    });
  };

  const handleSelectAll = () => {
    if (loading || loadingContacts) return;
    
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
      setContactGuestOptions({});
    } else {
      const newSelected = filteredContacts.map(contact => contact.id);
      setSelectedContacts(newSelected);
      const newOptions: Record<string, GuestOption> = {};
      newSelected.forEach(id => {
        newOptions[id] = { type: 'alone' };
      });
      setContactGuestOptions(newOptions);
    }
  };

  const handleSubmit = async () => {
    if (selectedContacts.length === 0) {
      setError('Wybierz przynajmniej jeden kontakt');
      return;
    }

    // Walidacja pól
    const newFieldErrors: Record<string, string> = {};
    for (const contactId of selectedContacts) {
      const guestOption = contactGuestOptions[contactId] || { type: 'alone' };
      if (guestOption.type === 'spouse') {
        if (!guestOption.spouseFirstName || !guestOption.spouseLastName) {
          newFieldErrors[contactId] = 'Podaj imię i nazwisko żony/męża';
        }
      }
    }
    setFieldErrors(newFieldErrors);
    if (Object.keys(newFieldErrors).length > 0) {
      setError('Uzupełnij wymagane pola dla wybranych kontaktów');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      for (const contactId of selectedContacts) {
        const guestOption = contactGuestOptions[contactId] || { type: 'alone' };
        let plusOneType: 'none' | 'withDetails' = 'none';
        let plusOneDetails: { firstName?: string; lastName?: string } | undefined = undefined;
        if (guestOption.type === 'spouse') {
          plusOneType = 'withDetails';
          plusOneDetails = {
            firstName: guestOption.spouseFirstName || '',
            lastName: guestOption.spouseLastName || ''
          };
        } else if (guestOption.type === 'companion') {
          plusOneType = 'withDetails';
          plusOneDetails = {
            firstName: guestOption.companionFirstName || '',
            lastName: guestOption.companionLastName || ''
          };
        }
        await EventGuestService.addContactToEvent(eventId, contactId, {
          contactId,
          eventSpecificNotes: globalSettings.eventSpecificNotes,
          plusOneType,
          plusOneDetails
        });
      }
      onContactsAdded();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Błąd podczas dodawania kontaktów');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setSelectedContacts([]);
      setSearchQuery('');
      setError(null);
      setFieldErrors({});
      setContactGuestOptions({});
      setGlobalSettings({
        eventSpecificNotes: ''
      });
    }
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const getContactName = (contact: Contact): string => {
    return `${contact.firstName} ${contact.lastName}`;
  };

  if (!open) return null;

  return (
    <div className="add-contacts-modal" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="add-contacts-modal__dialog">
        {/* Header */}
        <div className="add-contacts-modal__header">
          <div className="add-contacts-modal__title-section">
            <UserCheck size={24} className="add-contacts-modal__title-icon" />
            <div className="add-contacts-modal__title-content">
              <h2 className="add-contacts-modal__title">Dodaj kontakty do wydarzenia</h2>
              <p className="add-contacts-modal__subtitle">{eventTitle}</p>
            </div>
          </div>
          <button 
            className="add-contacts-modal__close"
            onClick={handleClose}
            disabled={loading}
            aria-label="Zamknij"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="add-contacts-modal__content">
          {/* Error alert */}
          {error && (
            <div className="add-contacts-modal__error">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button 
                className="add-contacts-modal__error-close"
                onClick={() => setError(null)}
                aria-label="Zamknij błąd"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Search */}
          <div className="add-contacts-modal__search">
            <Search size={20} className="add-contacts-modal__search-icon" />
            <input
              type="text"
              placeholder="Szukaj kontaktów..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading || loadingContacts}
              className="add-contacts-modal__search-input"
            />
          </div>

          {/* Select all */}
          {filteredContacts.length > 0 && (
            <div className="add-contacts-modal__select-all-section">
              <button
                className="add-contacts-modal__select-all-btn"
                onClick={handleSelectAll}
                disabled={loading || loadingContacts}
              >
                {selectedContacts.length === filteredContacts.length ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
              </button>
              <p className="add-contacts-modal__selected-count">
                Wybrano: {selectedContacts.length} z {filteredContacts.length}
              </p>
            </div>
          )}

          {/* Contacts list */}
          <div className="add-contacts-modal__contacts-list">
            {loadingContacts ? (
              <div className="add-contacts-modal__empty-state">
                <div className="add-contacts-modal__spinner"></div>
                <p>Ładowanie kontaktów...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="add-contacts-modal__empty-state">
                <Users size={48} />
                <h3>
                  {searchQuery ? 'Nie znaleziono kontaktów' : 'Brak dostępnych kontaktów'}
                </h3>
                <p>
                  {searchQuery 
                    ? 'Spróbuj zmienić wyszukiwanie'
                    : 'Wszystkie kontakty są już dodane do wydarzenia'
                  }
                </p>
              </div>
            ) : (
              <div className="add-contacts-modal__contacts">
                {filteredContacts.map((contact, index) => {
                  const selected = selectedContacts.includes(contact.id);
                  const guestOption = contactGuestOptions[contact.id] || { type: 'alone' };
                  return (
                    <div key={contact.id}>
                      <div 
                        className={`add-contacts-modal__contact ${selected ? 'add-contacts-modal__contact--selected' : ''} ${loading ? 'add-contacts-modal__contact--loading' : ''}`}
                        onClick={() => handleContactToggle(contact.id)}
                      >
                        <label className="add-contacts-modal__contact-checkbox">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => handleContactToggle(contact.id)}
                            disabled={loading}
                          />
                          <span className="add-contacts-modal__checkbox-custom"></span>
                        </label>
                        <div className="add-contacts-modal__contact-avatar">
                          {getInitials(contact.firstName, contact.lastName)}
                        </div>
                        <div className="add-contacts-modal__contact-info">
                          <div className="add-contacts-modal__contact-name">
                            {getContactName(contact)}
                          </div>
                          <div className="add-contacts-modal__contact-details">
                            <p className="add-contacts-modal__contact-email">{contact.email}</p>
                            {contact.phone && (
                              <span className="add-contacts-modal__contact-phone">{contact.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Guest options */}
                      {selected && (
                        <div className="add-contacts-modal__guest-options">
                          <div className="add-contacts-modal__guest-options-header">
                            <label className="add-contacts-modal__guest-options-label">Opcje gościa</label>
                            <div className="add-contacts-modal__guest-options-radio-group">
                              <label className="add-contacts-modal__radio-label">
                                <input
                                  type="radio"
                                  name={`guest-option-${contact.id}`}
                                  value="alone"
                                  checked={guestOption.type === 'alone'}
                                  onChange={(e) => {
                                    setContactGuestOptions(prev => ({
                                      ...prev,
                                      [contact.id]: { type: 'alone' }
                                    }));
                                  }}
                                />
                                <span>Idzie sam</span>
                              </label>
                              <label className="add-contacts-modal__radio-label">
                                <input
                                  type="radio"
                                  name={`guest-option-${contact.id}`}
                                  value="spouse"
                                  checked={guestOption.type === 'spouse'}
                                  onChange={(e) => {
                                    setContactGuestOptions(prev => ({
                                      ...prev,
                                      [contact.id]: { type: 'spouse' }
                                    }));
                                  }}
                                />
                                <span>Z żoną/mężem</span>
                              </label>
                              <label className="add-contacts-modal__radio-label">
                                <input
                                  type="radio"
                                  name={`guest-option-${contact.id}`}
                                  value="companion"
                                  checked={guestOption.type === 'companion'}
                                  onChange={(e) => {
                                    setContactGuestOptions(prev => ({
                                      ...prev,
                                      [contact.id]: { type: 'companion' }
                                    }));
                                  }}
                                />
                                <span>Z osobą towarzyszącą</span>
                              </label>
                            </div>
                          </div>

                          {guestOption.type === 'spouse' && (
                            <div className="add-contacts-modal__guest-fields">
                              <div className="add-contacts-modal__field">
                                <label>Imię żony/męża</label>
                                <input
                                  type="text"
                                  value={guestOption.spouseFirstName || ''}
                                  onChange={(e) => setContactGuestOptions(prev => ({
                                    ...prev,
                                    [contact.id]: {
                                      ...prev[contact.id],
                                      spouseFirstName: e.target.value
                                    }
                                  }))}
                                  className={fieldErrors[contact.id] && !guestOption.spouseFirstName ? 'add-contacts-modal__field--error' : ''}
                                />
                              </div>
                              <div className="add-contacts-modal__field">
                                <label>Nazwisko żony/męża</label>
                                <input
                                  type="text"
                                  value={guestOption.spouseLastName || ''}
                                  onChange={(e) => setContactGuestOptions(prev => ({
                                    ...prev,
                                    [contact.id]: {
                                      ...prev[contact.id],
                                      spouseLastName: e.target.value
                                    }
                                  }))}
                                  className={fieldErrors[contact.id] && !guestOption.spouseLastName ? 'add-contacts-modal__field--error' : ''}
                                />
                              </div>
                            </div>
                          )}

                          {guestOption.type === 'companion' && (
                            <div className="add-contacts-modal__guest-fields">
                              <div className="add-contacts-modal__field">
                                <label>Imię osoby towarzyszącej (opcjonalnie)</label>
                                <input
                                  type="text"
                                  value={guestOption.companionFirstName || ''}
                                  onChange={(e) => setContactGuestOptions(prev => ({
                                    ...prev,
                                    [contact.id]: {
                                      ...prev[contact.id],
                                      companionFirstName: e.target.value
                                    }
                                  }))}
                                />
                              </div>
                              <div className="add-contacts-modal__field">
                                <label>Nazwisko osoby towarzyszącej (opcjonalnie)</label>
                                <input
                                  type="text"
                                  value={guestOption.companionLastName || ''}
                                  onChange={(e) => setContactGuestOptions(prev => ({
                                    ...prev,
                                    [contact.id]: {
                                      ...prev[contact.id],
                                      companionLastName: e.target.value
                                    }
                                  }))}
                                />
                              </div>
                            </div>
                          )}

                          {fieldErrors[contact.id] && (
                            <p className="add-contacts-modal__field-error">{fieldErrors[contact.id]}</p>
                          )}
                        </div>
                      )}

                      {index < filteredContacts.length - 1 && (
                        <div className="add-contacts-modal__divider"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Global notes */}
          {selectedContacts.length > 0 && (
            <div className="add-contacts-modal__global-notes">
              <label className="add-contacts-modal__global-notes-label">
                Notatki dotyczące wydarzenia (dla wszystkich wybranych)
              </label>
              <textarea
                placeholder="Dodatkowe informacje dla wszystkich wybranych gości..."
                value={globalSettings.eventSpecificNotes}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  eventSpecificNotes: e.target.value
                }))}
                disabled={loading}
                rows={3}
                className="add-contacts-modal__global-notes-textarea"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="add-contacts-modal__footer">
          <button 
            className="add-contacts-modal__btn add-contacts-modal__btn--secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Anuluj
          </button>
          <button 
            className="add-contacts-modal__btn add-contacts-modal__btn--primary"
            onClick={handleSubmit}
            disabled={loading || selectedContacts.length === 0}
          >
            {loading 
              ? 'Dodawanie...' 
              : `Dodaj ${selectedContacts.length} kontakt${selectedContacts.length === 1 ? '' : selectedContacts.length < 5 ? 'y' : 'ów'}`
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContactsToEvent;
