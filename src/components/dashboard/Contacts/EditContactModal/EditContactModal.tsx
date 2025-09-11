// components/dashboard/Contacts/EditContactModal/EditContactModal.tsx
import React, { useState, useEffect } from 'react';
import { Save, User, Tag, X, AlertCircle } from 'lucide-react';
import { ContactService } from '../../../../services/firebase/contactService';
import { Contact, UpdateContactData } from '../../../../types';
import './EditContactModal.scss';

interface EditContactModalProps {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onContactUpdated?: (contact: Contact) => void;
}

const EditContactModal: React.FC<EditContactModalProps> = ({ 
  open, 
  contact, 
  onClose, 
  onContactUpdated 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState<UpdateContactData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dietaryRestrictions: '',
    notes: '',
    tags: []
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        phone: contact.phone || '',
        dietaryRestrictions: contact.dietaryRestrictions || '',
        notes: contact.notes || '',
        tags: contact.tags || []
      });
      setError(null);
    }
  }, [contact]);

  const handleInputChange = (field: keyof UpdateContactData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError(null);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contact) {
      setError('Brak danych kontaktu');
      return;
    }

    if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.email?.trim()) {
      setError('Imię, nazwisko i email są wymagane');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sprawdź czy email już istnieje (z wyłączeniem aktualnego kontaktu)
      const emailExists = await ContactService.checkEmailExists(
        contact.userId, 
        formData.email!.trim(), 
        contact.id
      );
      
      if (emailExists) {
        setError('Kontakt z tym adresem email już istnieje');
        setLoading(false);
        return;
      }

      await ContactService.updateContact(contact.id, {
        ...formData,
        firstName: formData.firstName!.trim(),
        lastName: formData.lastName!.trim(),
        email: formData.email!.trim(),
        phone: formData.phone?.trim() || undefined,
        dietaryRestrictions: formData.dietaryRestrictions?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        tags: formData.tags?.filter(tag => tag.trim()) || []
      });

      // Pobierz zaktualizowany kontakt
      const updatedContact = await ContactService.getContact(contact.id);
      if (updatedContact) {
        onContactUpdated?.(updatedContact);
      }

      onClose();
    } catch (error: any) {
      console.error('Error updating contact:', error);
      setError(error.message || 'Wystąpił błąd podczas aktualizacji kontaktu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!open || !contact) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) {
      onClose();
    }
  };

  return (
    <div 
      className="edit-contact-modal__overlay" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="edit-contact-modal__container">
        <div className="edit-contact-modal__header">
          <div className="edit-contact-modal__icon">
            <User size={24} />
          </div>
          <h2 className="edit-contact-modal__title">
            Edytuj kontakt
          </h2>
          <button
            className="edit-contact-modal__close"
            onClick={handleClose}
            disabled={loading}
            aria-label="Zamknij"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-contact-modal__form">
          <div className="edit-contact-modal__content">
            {error && (
              <div className="edit-contact-modal__error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="edit-contact-modal__contact-preview">
              <div className="edit-contact-modal__avatar">
                {(formData.firstName?.[0] || contact.firstName[0])}{(formData.lastName?.[0] || contact.lastName[0])}
              </div>
              <div className="edit-contact-modal__preview-info">
                <div className="edit-contact-modal__preview-name">
                  {formData.firstName || contact.firstName} {formData.lastName || contact.lastName}
                </div>
                <div className="edit-contact-modal__preview-email">
                  {formData.email || contact.email}
                </div>
              </div>
            </div>

            <div className="edit-contact-modal__fields">
              <div className="edit-contact-modal__row">
                <div className="edit-contact-modal__field-group">
                  <label className="edit-contact-modal__label">
                    Imię <span className="edit-contact-modal__required">*</span>
                  </label>
                  <input
                    type="text"
                    className="edit-contact-modal__input"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    required
                    disabled={loading}
                    placeholder="Wprowadź imię"
                  />
                </div>
                <div className="edit-contact-modal__field-group">
                  <label className="edit-contact-modal__label">
                    Nazwisko <span className="edit-contact-modal__required">*</span>
                  </label>
                  <input
                    type="text"
                    className="edit-contact-modal__input"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    required
                    disabled={loading}
                    placeholder="Wprowadź nazwisko"
                  />
                </div>
              </div>

              <div className="edit-contact-modal__field-group">
                <label className="edit-contact-modal__label">
                  Email <span className="edit-contact-modal__required">*</span>
                </label>
                <input
                  type="email"
                  className="edit-contact-modal__input"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  disabled={loading}
                  placeholder="Wprowadź adres email"
                />
              </div>

              <div className="edit-contact-modal__field-group">
                <label className="edit-contact-modal__label">Telefon</label>
                <input
                  type="tel"
                  className="edit-contact-modal__input"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  disabled={loading}
                  placeholder="Wprowadź numer telefonu"
                />
              </div>

              <div className="edit-contact-modal__field-group">
                <label className="edit-contact-modal__label">Preferencje żywieniowe</label>
                <textarea
                  className="edit-contact-modal__textarea"
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange('dietaryRestrictions')}
                  disabled={loading}
                  placeholder="Opisz preferencje żywieniowe..."
                  rows={2}
                />
              </div>

              <div className="edit-contact-modal__field-group">
                <label className="edit-contact-modal__label">Notatki</label>
                <textarea
                  className="edit-contact-modal__textarea"
                  value={formData.notes}
                  onChange={handleInputChange('notes')}
                  disabled={loading}
                  placeholder="Dodaj notatki..."
                  rows={3}
                />
              </div>

              <div className="edit-contact-modal__field-group">
                <label className="edit-contact-modal__label">Tagi</label>
                
                {formData.tags && formData.tags.length > 0 && (
                  <div className="edit-contact-modal__tags">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="edit-contact-modal__tag">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="edit-contact-modal__tag-remove"
                          disabled={loading}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="edit-contact-modal__tag-input">
                  <input
                    type="text"
                    className="edit-contact-modal__input"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    disabled={loading}
                    placeholder="Dodaj tag"
                  />
                  <button
                    type="button"
                    className="edit-contact-modal__tag-add-btn"
                    onClick={handleAddTag}
                    disabled={loading || !newTag.trim()}
                  >
                    <Tag size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="edit-contact-modal__actions">
            <button
              type="button"
              className="edit-contact-modal__btn edit-contact-modal__btn--cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="edit-contact-modal__btn edit-contact-modal__btn--primary"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white',
                borderColor: '#6366f1'
              }}
            >
              {loading ? (
                <>
                  <div className="edit-contact-modal__spinner" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Zapisz zmiany
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContactModal;
