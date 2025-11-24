// components/dashboard/Settings/ProfileSettings/ProfileSettings.tsx
import React, { useState } from 'react';
import { Save, Trash2, X } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './ProfileSettings.scss';

const ProfileSettings: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    company: '',
    website: '',
    bio: '',
    timezone: 'Europe/Warsaw',
    language: 'pl',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Symulacja API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    alert('Profil został zaktualizowany!');
    setIsLoading(false);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
    setDeletePassword('');
    setDeleteError('');
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Wprowadź hasło, aby potwierdzić usunięcie konta');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteAccount(deletePassword);
      // Po usunięciu konta użytkownik zostanie automatycznie wylogowany
      // i przekierowany do strony głównej przez AuthGuard
      navigate('/');
    } catch (err: any) {
      setDeleteError(
        err.message ||
          'Nie udało się usunąć konta. Sprawdź hasło i spróbuj ponownie.'
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="profile-settings">
      <div className="profile-settings__header">
        <h1>Informacje osobiste</h1>
        <p>Zaktualizuj swoje dane osobowe i informacje kontaktowe</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-settings__form">
        {/* Personal Information */}
        <div className="profile-settings__section">
          <h3>Dane osobowe</h3>
          <div className="profile-settings__grid">
            <div className="profile-settings__field">
              <label>Imię *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="profile-settings__field">
              <label>Nazwisko *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="profile-settings__field">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="profile-settings__field">
              <label>Telefon</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+48 123 456 789"
              />
            </div>

            <div className="profile-settings__field">
              <label>Firma</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Nazwa firmy"
              />
            </div>

            <div className="profile-settings__field">
              <label>Strona WWW</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="profile-settings__field">
            <label>O mnie</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              placeholder="Opowiedz coś o sobie..."
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="profile-settings__section">
          <h3>Preferencje</h3>
          <div className="profile-settings__grid">
            <div className="profile-settings__field">
              <label>Strefa czasowa</label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
              >
                <option value="Europe/Warsaw">Europa/Warszawa (GMT+1)</option>
                <option value="Europe/London">Europa/Londyn (GMT+0)</option>
                <option value="America/New_York">
                  Ameryka/Nowy Jork (GMT-5)
                </option>
                <option value="Asia/Tokyo">Azja/Tokio (GMT+9)</option>
              </select>
            </div>

            <div className="profile-settings__field">
              <label>Język</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
              >
                <option value="pl">Polski</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="profile-settings__actions">
          <button
            type="submit"
            className="profile-settings__save-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="profile-settings__spinner"></div>
            ) : (
              <>
                <Save size={16} />
                Zapisz zmiany
              </>
            )}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="profile-settings__danger-zone">
        <h3>Strefa zagrożenia</h3>
        <p>Te akcje są nieodwracalne. Zachowaj ostrożność.</p>
        <button
          className="profile-settings__danger-btn"
          onClick={handleDeleteAccount}
        >
          <Trash2 size={16} />
          Usuń konto
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="profile-settings__modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="profile-settings__modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="profile-settings__modal-header">
              <h3>Usuń konto</h3>
              <button
                className="profile-settings__modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="profile-settings__modal-body">
              <p className="profile-settings__modal-warning">
                <strong>Ostrzeżenie:</strong> Ta akcja jest nieodwracalna.
                Wszystkie Twoje dane, wydarzenia, kontakty i ustawienia zostaną
                trwale usunięte.
              </p>

              <div className="profile-settings__field">
                <label htmlFor="delete-password">
                  Wprowadź hasło, aby potwierdzić *
                </label>
                <input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  placeholder="Twoje hasło"
                  autoComplete="current-password"
                />
              </div>

              {deleteError && (
                <div className="profile-settings__modal-error">
                  {deleteError}
                </div>
              )}
            </div>

            <div className="profile-settings__modal-footer">
              <button
                className="profile-settings__modal-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Anuluj
              </button>
              <button
                className="profile-settings__modal-confirm"
                onClick={confirmDeleteAccount}
                disabled={isDeleting || !deletePassword}
              >
                {isDeleting ? (
                  <>
                    <div className="profile-settings__spinner"></div>
                    Usuwanie...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Usuń konto
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
