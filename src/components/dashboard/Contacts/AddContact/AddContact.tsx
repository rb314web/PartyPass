// components/dashboard/Contacts/AddContact/AddContact.tsx
import React, { useState } from 'react';
import { Save, User, Tag, X, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { ContactService } from '../../../../services/firebase/contactService';
import { CreateContactData } from '../../../../types';
import './AddContact.scss';

interface AddContactProps {
  open: boolean;
  onClose: () => void;
  onContactAdded?: (contact: any) => void;
}

const AddContact: React.FC<AddContactProps> = ({ open, onClose, onContactAdded }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState<CreateContactData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dietaryRestrictions: '',
    notes: '',
    tags: []
  });

  const handleInputChange = (field: keyof CreateContactData) => (
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
    
    if (!user) {
      setError('Musisz być zalogowany');
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError('Imię, nazwisko i email są wymagane');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sprawdź czy email już istnieje
      const emailExists = await ContactService.checkEmailExists(user.id, formData.email.trim());
      if (emailExists) {
        setError('Kontakt z tym adresem email już istnieje');
        setLoading(false);
        return;
      }

      const contact = await ContactService.createContact(user.id, {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        dietaryRestrictions: formData.dietaryRestrictions?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        tags: formData.tags?.filter(tag => tag.trim()) || []
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dietaryRestrictions: '',
        notes: '',
        tags: []
      });

      onContactAdded?.(contact);
      onClose();
    } catch (error: any) {
      console.error('Error creating contact:', error);
      setError(error.message || 'Wystąpił błąd podczas tworzenia kontaktu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!open) return null;

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
      className="add-contact-modal__overlay" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="add-contact-modal__container">
        <div className="add-contact-modal__header">
          <div className="add-contact-modal__icon">
            <UserPlus size={24} />
          </div>
          <h2 className="add-contact-modal__title">
            Dodaj nowy kontakt
          </h2>
          <button
            className="add-contact-modal__close"
            onClick={handleClose}
            disabled={loading}
            aria-label="Zamknij"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-contact-modal__form">
          <div className="add-contact-modal__content">
            {error && (
              <div className="add-contact-modal__error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="add-contact-modal__contact-preview">
              <div className="add-contact-modal__avatar">
                {(formData.firstName?.[0] || '?')}{(formData.lastName?.[0] || '?')}
              </div>
              <div className="add-contact-modal__preview-info">
                <div className="add-contact-modal__preview-name">
                  {formData.firstName || 'Imię'} {formData.lastName || 'Nazwisko'}
                </div>
                <div className="add-contact-modal__preview-email">
                  {formData.email || 'email@example.com'}
                </div>
              </div>
            </div>

            <div className="add-contact-modal__fields">
              <div className="add-contact-modal__row">
                <div className="add-contact-modal__field-group">
                  <label className="add-contact-modal__label">
                    Imię <span className="add-contact-modal__required">*</span>
                  </label>
                  <input
                    type="text"
                    className="add-contact-modal__input"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    required
                    disabled={loading}
                    placeholder="Wprowadź imię"
                  />
                </div>
                <div className="add-contact-modal__field-group">
                  <label className="add-contact-modal__label">
                    Nazwisko <span className="add-contact-modal__required">*</span>
                  </label>
                  <input
                    type="text"
                    className="add-contact-modal__input"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    required
                    disabled={loading}
                    placeholder="Wprowadź nazwisko"
                  />
                </div>
              </div>

              <div className="add-contact-modal__field-group">
                <label className="add-contact-modal__label">
                  Email <span className="add-contact-modal__required">*</span>
                </label>
                <input
                  type="email"
                  className="add-contact-modal__input"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  disabled={loading}
                  placeholder="Wprowadź adres email"
                />
              </div>

              <div className="add-contact-modal__field-group">
                <label className="add-contact-modal__label">Telefon</label>
                <input
                  type="tel"
                  className="add-contact-modal__input"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  disabled={loading}
                  placeholder="Wprowadź numer telefonu"
                />
              </div>

              <div className="add-contact-modal__field-group">
                <label className="add-contact-modal__label">Preferencje żywieniowe</label>
                <textarea
                  className="add-contact-modal__textarea"
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange('dietaryRestrictions')}
                  disabled={loading}
                  placeholder="Opisz preferencje żywieniowe..."
                  rows={2}
                />
              </div>

              <div className="add-contact-modal__field-group">
                <label className="add-contact-modal__label">Notatki</label>
                <textarea
                  className="add-contact-modal__textarea"
                  value={formData.notes}
                  onChange={handleInputChange('notes')}
                  disabled={loading}
                  placeholder="Dodaj notatki..."
                  rows={3}
                />
              </div>

              <div className="add-contact-modal__field-group">
                <label className="add-contact-modal__label">Tagi</label>
                
                {formData.tags && formData.tags.length > 0 && (
                  <div className="add-contact-modal__tags">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="add-contact-modal__tag">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="add-contact-modal__tag-remove"
                          disabled={loading}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="add-contact-modal__tag-input">
                  <input
                    type="text"
                    className="add-contact-modal__input"
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
                    className="add-contact-modal__tag-add-btn"
                    onClick={handleAddTag}
                    disabled={loading || !newTag.trim()}
                  >
                    <Tag size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="add-contact-modal__actions">
            <button
              type="button"
              className="add-contact-modal__btn add-contact-modal__btn--cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="add-contact-modal__btn add-contact-modal__btn--primary"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white',
                borderColor: '#6366f1'
              }}
            >
              {loading ? (
                <>
                  <div className="add-contact-modal__spinner" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Dodaj kontakt
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContact;
