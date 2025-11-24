// components/dashboard/Settings/SecuritySettings/SecuritySettings.tsx
import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Smartphone,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import './SecuritySettings.scss';

const SecuritySettings: React.FC = () => {
  const { changePassword, deleteAccount, error, clearError } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    delete: false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Nowe hasła nie są identyczne');
      return;
    }

    if (newPassword.length < 8) {
      alert('Hasło musi mieć co najmniej 8 znaków');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      await changePassword(currentPassword, newPassword);
      alert('Hasło zostało zmienione!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Błąd podczas zmiany hasła:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = (
    field: 'current' | 'new' | 'confirm' | 'delete'
  ) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert('Wprowadź hasło aby usunąć konto');
      return;
    }

    const confirmText = 'USUŃ KONTO';
    const userConfirmation = prompt(
      `⚠️ UWAGA! Ta operacja jest nieodwracalna!\n\nWszystkie Twoje dane, wydarzenia i goście zostaną trwale usunięte.\n\nAby potwierdzić, wpisz: ${confirmText}`
    );

    if (userConfirmation !== confirmText) {
      alert('Nieprawidłowe potwierdzenie. Usuwanie konta zostało anulowane.');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      await deleteAccount(deletePassword);
      alert('Konto zostało pomyślnie usunięte. Żegnamy!');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Błąd podczas usuwania konta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAToggle = async () => {
    if (!twoFactorEnabled) {
      // Enable 2FA
      alert('Funkcja włączania 2FA zostanie wkrótce dodana!');
    } else {
      // Disable 2FA
      if (
        window.confirm(
          'Czy na pewno chcesz wyłączyć dwuskładnikowe uwierzytelnianie?'
        )
      ) {
        setTwoFactorEnabled(false);
        alert('Dwuskładnikowe uwierzytelnianie zostało wyłączone.');
      }
    }
  };

  const mockSessions = [
    {
      id: '1',
      device: 'MacBook Pro - Chrome',
      location: 'Warszawa, Polska',
      ipAddress: '192.168.1.100',
      lastActive: '2024-08-06T14:30:00Z',
      current: true,
    },
    {
      id: '2',
      device: 'iPhone 15 - Safari',
      location: 'Warszawa, Polska',
      ipAddress: '192.168.1.101',
      lastActive: '2024-08-06T09:15:00Z',
      current: false,
    },
    {
      id: '3',
      device: 'Windows PC - Edge',
      location: 'Kraków, Polska',
      ipAddress: '10.0.0.50',
      lastActive: '2024-08-05T16:22:00Z',
      current: false,
    },
  ];

  const handleLogoutSession = (sessionId: string) => {
    if (window.confirm('Czy na pewno chcesz wylogować to urządzenie?')) {
      alert(`Sesja ${sessionId} została zakończona.`);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6)
      return { strength: 25, label: 'Słabe', color: 'var(--error)' };
    if (password.length < 8)
      return { strength: 50, label: 'Średnie', color: 'var(--secondary)' };
    if (password.length < 12)
      return { strength: 75, label: 'Dobre', color: '#10b981' };
    return { strength: 100, label: 'Bardzo silne', color: 'var(--success)' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="security-settings">
      <div className="security-settings__header">
        <h1>Bezpieczeństwo</h1>
        <p>Zarządzaj hasłem, dwuskładnikowym uwierzytelnianiem i sesjami</p>
      </div>

      {/* Password Change */}
      <div className="security-settings__section">
        <div className="security-settings__section-header">
          <div className="security-settings__section-icon">
            <Lock size={20} />
          </div>
          <div>
            <h3>Zmiana hasła</h3>
            <p>Regularnie zmieniaj hasło dla lepszego bezpieczeństwa</p>
          </div>
        </div>

        <form
          onSubmit={handlePasswordChange}
          className="security-settings__form"
        >
          <div className="security-settings__field">
            <label>Obecne hasło</label>
            <div className="security-settings__input-wrapper">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="security-settings__password-toggle"
                onClick={() => handleTogglePassword('current')}
              >
                {showPasswords.current ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <div className="security-settings__field">
            <label>Nowe hasło</label>
            <div className="security-settings__input-wrapper">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="security-settings__password-toggle"
                onClick={() => handleTogglePassword('new')}
              >
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {newPassword && (
              <div className="security-settings__strength">
                <div className="security-settings__strength-bar">
                  <div
                    className="security-settings__strength-fill"
                    style={{
                      width: `${passwordStrength.strength}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
                <span
                  className="security-settings__strength-label"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <div className="security-settings__field">
            <label>Potwierdź nowe hasło</label>
            <div className="security-settings__input-wrapper">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="security-settings__password-toggle"
                onClick={() => handleTogglePassword('confirm')}
              >
                {showPasswords.confirm ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {confirmPassword && newPassword !== confirmPassword && (
              <span className="security-settings__error">
                Hasła nie są identyczne
              </span>
            )}
          </div>

          <button
            type="submit"
            className="security-settings__save-btn"
            disabled={
              isLoading ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword
            }
          >
            {isLoading ? (
              <div className="security-settings__spinner"></div>
            ) : (
              <>
                <Key size={16} />
                Zmień hasło
              </>
            )}
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="security-settings__section">
        <div className="security-settings__section-header">
          <div className="security-settings__section-icon">
            <Smartphone size={20} />
          </div>
          <div>
            <h3>Dwuskładnikowe uwierzytelnianie (2FA)</h3>
            <p>Dodatkowa warstwa zabezpieczeń dla Twojego konta</p>
          </div>
        </div>

        <div className="security-settings__2fa">
          <div className="security-settings__2fa-status">
            <div className="security-settings__2fa-info">
              <div
                className={`security-settings__status-badge ${twoFactorEnabled ? 'security-settings__status-badge--enabled' : 'security-settings__status-badge--disabled'}`}
              >
                {twoFactorEnabled ? (
                  <>
                    <Shield size={16} />
                    Włączone
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    Wyłączone
                  </>
                )}
              </div>
              <p>
                {twoFactorEnabled
                  ? 'Twoje konto jest chronione dodatkowym kodem weryfikacyjnym'
                  : 'Włącz 2FA aby zwiększyć bezpieczeństwo swojego konta'}
              </p>
            </div>

            <button
              className={`security-settings__2fa-btn ${twoFactorEnabled ? 'security-settings__2fa-btn--danger' : 'security-settings__2fa-btn--primary'}`}
              onClick={handle2FAToggle}
            >
              {twoFactorEnabled ? 'Wyłącz 2FA' : 'Włącz 2FA'}
            </button>
          </div>

          {twoFactorEnabled && (
            <div className="security-settings__2fa-details">
              <h4>Kody zapasowe</h4>
              <p>
                Zapisz te kody w bezpiecznym miejscu. Możesz ich użyć gdy nie
                masz dostępu do telefonu.
              </p>
              <div className="security-settings__backup-codes">
                <code>A4B7-C9D2</code>
                <code>E8F1-G3H6</code>
                <code>I2J5-K7L0</code>
                <code>M9N4-P6Q1</code>
              </div>
              <button className="security-settings__generate-codes">
                Wygeneruj nowe kody
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="security-settings__section">
        <div className="security-settings__section-header">
          <div className="security-settings__section-icon">
            <Shield size={20} />
          </div>
          <div>
            <h3>Aktywne sesje</h3>
            <p>Zarządzaj urządzeniami które mają dostęp do Twojego konta</p>
          </div>
        </div>

        <div className="security-settings__sessions">
          {mockSessions.map(session => (
            <div key={session.id} className="security-settings__session">
              <div className="security-settings__session-info">
                <div className="security-settings__session-device">
                  {session.device}
                  {session.current && (
                    <span className="security-settings__current-badge">
                      Bieżąca sesja
                    </span>
                  )}
                </div>
                <div className="security-settings__session-details">
                  <span>{session.location}</span>
                  <span>•</span>
                  <span>{session.ipAddress}</span>
                  <span>•</span>
                  <span>
                    {new Date(session.lastActive).toLocaleString('pl-PL')}
                  </span>
                </div>
              </div>

              {!session.current && (
                <button
                  className="security-settings__logout-btn"
                  onClick={() => handleLogoutSession(session.id)}
                >
                  Wyloguj
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="security-settings__sessions-actions">
          <button className="security-settings__logout-all">
            Wyloguj wszystkie inne sesje
          </button>
        </div>
      </div>

      {/* Delete Account */}
      <div className="security-settings__section security-settings__danger-section">
        <div className="security-settings__section-header">
          <div className="security-settings__section-icon security-settings__danger-icon">
            <Trash2 size={20} />
          </div>
          <div>
            <h3>Usuń konto</h3>
            <p>Trwale usuń swoje konto i wszystkie powiązane dane</p>
          </div>
        </div>

        <div className="security-settings__danger-zone">
          <div className="security-settings__warning">
            <AlertTriangle size={20} />
            <div>
              <strong>Uwaga! Ta operacja jest nieodwracalna.</strong>
              <p>Usunięcie konta spowoduje trwałe usunięcie:</p>
              <ul>
                <li>Wszystkich wydarzeń i ich danych</li>
                <li>Listy gości i RSVP</li>
                <li>Historii aktywności</li>
                <li>Ustawień i preferencji</li>
              </ul>
            </div>
          </div>

          <button
            className="security-settings__delete-trigger"
            onClick={() => setShowDeleteModal(true)}
            disabled={isLoading}
          >
            <Trash2 size={16} />
            Usuń konto
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="security-settings__modal-overlay">
          <div className="security-settings__modal">
            <div className="security-settings__modal-header">
              <h3>Potwierdź usunięcie konta</h3>
              <button
                className="security-settings__modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>

            <div className="security-settings__modal-content">
              <div className="security-settings__final-warning">
                <AlertTriangle size={24} />
                <p>
                  <strong>Ostatnie ostrzeżenie!</strong>
                  <br />
                  Ta operacja usunie trwale Twoje konto i wszystkie dane.
                </p>
              </div>

              {error && (
                <div className="security-settings__error-message">{error}</div>
              )}

              <div className="security-settings__field">
                <label>Wprowadź swoje hasło aby potwierdzić:</label>
                <div className="security-settings__input-wrapper">
                  <input
                    type={showPasswords.delete ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    placeholder="Twoje hasło"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="security-settings__password-toggle"
                    onClick={() => handleTogglePassword('delete')}
                  >
                    {showPasswords.delete ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="security-settings__modal-actions">
                <button
                  className="security-settings__modal-cancel"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    clearError();
                  }}
                  disabled={isLoading}
                >
                  Anuluj
                </button>
                <button
                  className="security-settings__modal-delete"
                  onClick={handleDeleteAccount}
                  disabled={isLoading || !deletePassword}
                >
                  {isLoading ? (
                    <div className="security-settings__spinner"></div>
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
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
