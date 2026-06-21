// components/dashboard/Settings/ProfileSettings/ProfileSettings.tsx
import React, { useEffect, useState } from 'react';
import { Save, Trash2, Check, AlertCircle, AlertTriangle, User } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../common/Modal/Modal';
import PageHeader from '../../../common/PageHeader/PageHeader';
import './ProfileSettings.scss';

type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  bio: string;
  timezone: string;
  language: 'pl' | 'en' | 'de' | 'fr';
};

const emptyForm = (): ProfileFormData => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  website: '',
  bio: '',
  timezone: 'Europe/Warsaw',
  language: 'pl',
});

const ProfileSettings: React.FC = () => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileFormData>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [saveError, setSaveError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;

    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      company: user.company || '',
      website: user.website || '',
      bio: user.bio || '',
      timezone: user.timezone || 'Europe/Warsaw',
      language: (user.language as ProfileFormData['language']) || 'pl',
    });
  }, [user]);

  useEffect(() => {
    if (saveStatus !== 'saved') return;
    const timer = setTimeout(() => setSaveStatus('idle'), 4000);
    return () => clearTimeout(timer);
  }, [saveStatus]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (saveStatus === 'saved' || saveStatus === 'error') {
      setSaveStatus('idle');
      setSaveError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setSaveStatus('saving');
    setSaveError('');

    try {
      await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phone.trim(),
        company: formData.company.trim(),
        website: formData.website.trim(),
        bio: formData.bio.trim(),
        timezone: formData.timezone,
        language: formData.language,
      });
      setSaveStatus('saved');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Nie udało się zapisać profilu. Spróbuj ponownie.';
      setSaveError(message);
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
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
      navigate('/');
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : 'Nie udało się usunąć konta. Sprawdź hasło i spróbuj ponownie.'
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="profile-settings">
      <PageHeader
        title="Informacje osobiste"
        subtitle="Zaktualizuj swoje dane osobowe i informacje kontaktowe"
        icon={User}
        className="profile-settings__page-header"
      />

      <form onSubmit={handleSubmit} className="profile-settings__form">
        <div className="profile-settings__section">
          <h3>Dane osobowe</h3>
          <div className="profile-settings__grid">
            <div className="pp-field">
              <label className="pp-label" htmlFor="firstName">
                Imię *
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="pp-input"
                required
              />
            </div>

            <div className="pp-field">
              <label className="pp-label" htmlFor="lastName">
                Nazwisko *
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="pp-input"
                required
              />
            </div>

            <div className="pp-field">
              <label className="pp-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="pp-input"
              />
              <span className="profile-settings__hint">
                Adres e-mail można zmienić w sekcji Bezpieczeństwo.
              </span>
            </div>

            <div className="pp-field">
              <label className="pp-label" htmlFor="phone">
                Telefon
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="pp-input"
                placeholder="+48 123 456 789"
              />
            </div>

            <div className="pp-field">
              <label className="pp-label" htmlFor="company">
                Firma
              </label>
              <input
                id="company"
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="pp-input"
                placeholder="Nazwa firmy"
              />
            </div>

            <div className="pp-field">
              <label className="pp-label" htmlFor="website">
                Strona WWW
              </label>
              <input
                id="website"
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="pp-input"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="bio">
              O mnie
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="pp-textarea"
              rows={4}
              placeholder="Opowiedz coś o sobie..."
            />
          </div>
        </div>

        <div className="profile-settings__section">
          <h3>Preferencje</h3>
          <div className="profile-settings__grid">
            <div className="pp-field">
              <label className="pp-label" htmlFor="timezone">
                Strefa czasowa
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="pp-select"
              >
                <option value="Europe/Warsaw">Europa/Warszawa (GMT+1)</option>
                <option value="Europe/London">Europa/Londyn (GMT+0)</option>
                <option value="America/New_York">
                  Ameryka/Nowy Jork (GMT-5)
                </option>
                <option value="Asia/Tokyo">Azja/Tokio (GMT+9)</option>
              </select>
            </div>

            <div className="pp-field">
              <label className="pp-label" htmlFor="language">
                Język
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="pp-select"
              >
                <option value="pl">Polski</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>

        <div className="profile-settings__actions">
          <div className="profile-settings__save-status">
            {saveStatus === 'saved' && (
              <span className="profile-settings__save-message profile-settings__save-message--success">
                <Check size={16} />
                Profil został zapisany
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="profile-settings__save-message profile-settings__save-message--error">
                <AlertCircle size={16} />
                {saveError || 'Wystąpił błąd podczas zapisywania'}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="pp-btn pp-btn--primary profile-settings__save-btn"
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

      <div className="profile-settings__danger-zone">
        <h3>Strefa zagrożenia</h3>
        <p>Te akcje są nieodwracalne. Zachowaj ostrożność.</p>
        <button
          type="button"
          className="pp-btn pp-btn--danger profile-settings__danger-btn"
          onClick={handleDeleteAccount}
        >
          <Trash2 size={16} />
          Usuń konto
        </button>
      </div>

      <Modal
        open={showDeleteModal}
        onClose={() => {
          if (isDeleting) return;
          setShowDeleteModal(false);
          setDeletePassword('');
          setDeleteError('');
        }}
        title="Usuń konto"
        size="sm"
        icon={<AlertTriangle size={24} />}
        iconVariant="danger"
        closeDisabled={isDeleting}
        footer={
          <>
            <button
              type="button"
              className="pp-btn pp-btn--outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Anuluj
            </button>
            <button
              type="button"
              className="pp-btn pp-btn--danger"
              onClick={confirmDeleteAccount}
              disabled={isDeleting || !deletePassword}
            >
              {isDeleting ? 'Usuwanie...' : 'Usuń konto'}
            </button>
          </>
        }
      >
        <p className="profile-settings__modal-warning">
          <strong>Ostrzeżenie:</strong> Ta akcja jest nieodwracalna. Wszystkie
          Twoje dane, wydarzenia, kontakty i ustawienia zostaną trwale
          usunięte.
        </p>

        <div className="pp-field">
          <label className="pp-label" htmlFor="delete-password">
            Wprowadź hasło, aby potwierdzić *
          </label>
          <input
            id="delete-password"
            type="password"
            value={deletePassword}
            onChange={e => setDeletePassword(e.target.value)}
            className="pp-input"
            placeholder="Twoje hasło"
            autoComplete="current-password"
          />
        </div>

        {deleteError && (
          <div className="pp-form-alert pp-form-alert--error">
            {deleteError}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProfileSettings;
