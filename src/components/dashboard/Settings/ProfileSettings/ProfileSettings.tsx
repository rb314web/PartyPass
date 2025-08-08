// components/dashboard/Settings/ProfileSettings/ProfileSettings.tsx
import React, { useState } from 'react';
import { Camera, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import './ProfileSettings.scss';

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    company: '',
    website: '',
    bio: '',
    timezone: 'Europe/Warsaw',
    language: 'pl'
  });
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    if (window.confirm('Czy na pewno chcesz usunąć konto? Ta akcja jest nieodwracalna.')) {
      alert('Funkcja usuwania konta zostanie wkrótce dodana.');
    }
  };

  return (
    <div className="profile-settings">
      <div className="profile-settings__header">
        <h2>Informacje osobiste</h2>
        <p>Zaktualizuj swoje dane osobowe i informacje kontaktowe</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-settings__form">
        {/* Avatar Section */}
        <div className="profile-settings__section">
          <h3>Zdjęcie profilowe</h3>
          <div className="profile-settings__avatar-section">
            <div className="profile-settings__avatar">
              {avatar ? (
                <img src={avatar} alt="Avatar" />
              ) : (
                <div className="profile-settings__avatar-placeholder">
                  {formData.firstName[0]}{formData.lastName[0]}
                </div>
              )}
            </div>
            <div className="profile-settings__avatar-actions">
              <label className="profile-settings__avatar-upload">
                <Camera size={16} />
                Zmień zdjęcie
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange}
                  hidden 
                />
              </label>
              {avatar && (
                <button 
                  type="button"
                  className="profile-settings__avatar-remove"
                  onClick={() => setAvatar('')}
                >
                  Usuń
                </button>
              )}
            </div>
          </div>
        </div>

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
              <select name="timezone" value={formData.timezone} onChange={handleInputChange}>
                <option value="Europe/Warsaw">Europa/Warszawa (GMT+1)</option>
                <option value="Europe/London">Europa/Londyn (GMT+0)</option>
                <option value="America/New_York">Ameryka/Nowy Jork (GMT-5)</option>
                <option value="Asia/Tokyo">Azja/Tokio (GMT+9)</option>
              </select>
            </div>

            <div className="profile-settings__field">
              <label>Język</label>
              <select name="language" value={formData.language} onChange={handleInputChange}>
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
    </div>
  );
};

export default ProfileSettings;