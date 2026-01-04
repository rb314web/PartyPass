// components/dashboard/Settings/NotificationSettings/NotificationSettings.tsx
import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  Globe,
  Save,
  Check,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { UserSettingsService, UserNotificationSettings } from '../../../../services/firebase/userSettingsService';
import { NotificationTriggers } from '../../../../services/notificationTriggers';
import './NotificationSettings.scss';

const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  
  const [settings, setSettings] = useState<UserNotificationSettings>({
    email: {
      enabled: true,
      eventReminders: true,
      rsvpUpdates: true,
      eventUpdates: true,
      weeklyDigest: false,
    },
    sms: {
      enabled: false,
      urgentOnly: true,
      eventReminders: false,
    },
    push: {
      enabled: true,
      eventReminders: true,
      rsvpUpdates: true,
      browserNotifications: true,
    },
    digest: {
      frequency: 'never',
      time: '09:00',
      includeAnalytics: true,
      includeUpcoming: true,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingSMS, setTestingSMS] = useState(false);
  const [testingPush, setTestingPush] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    type: 'email' | 'sms' | 'push';
    status: 'success' | 'error';
    message: string;
  } | null>(null);

  // Załaduj ustawienia przy montowaniu komponentu
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingSettings(true);
        const userSettings = await UserSettingsService.getUserSettings(user.id);
        if (userSettings) {
          setSettings(userSettings);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, [user?.id]);

  const handleToggle = (category: keyof typeof settings, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]:
          !prev[category][setting as keyof (typeof prev)[typeof category]],
      },
    }));
    setSaveStatus('idle');
  };

  const handleSelectChange = (
    category: keyof typeof settings,
    setting: string,
    value: string | boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setSaveStatus('saving');

    try {
      await UserSettingsService.saveUserSettings(user.id, settings);
      setSaveStatus('saved');

      // Reset status po 3 sekundach
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!user?.email) {
      setTestStatus({
        type: 'email',
        status: 'error',
        message: 'Brak adresu email użytkownika',
      });
      setTimeout(() => setTestStatus(null), 5000);
      return;
    }

    setTestingEmail(true);
    setTestStatus(null);
    
    try {
      await NotificationTriggers.sendTestEmail(
        user.email,
        user.displayName || 'Użytkownik'
      );
      setTestStatus({
        type: 'email',
        status: 'success',
        message: `Test email wysłany na ${user.email}. Sprawdź swoją skrzynkę!`,
      });
      setTimeout(() => setTestStatus(null), 5000);
    } catch (error) {
      console.error('Error sending test email:', error);
      setTestStatus({
        type: 'email',
        status: 'error',
        message: 'Nie udało się wysłać. Sprawdź konfigurację EmailJS.',
      });
      setTimeout(() => setTestStatus(null), 5000);
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestSMS = async () => {
    setTestingSMS(true);
    setTestStatus(null);
    
    try {
      // SMS nie jest jeszcze zaimplementowany
      await new Promise(resolve => setTimeout(resolve, 800));
      setTestStatus({
        type: 'sms',
        status: 'error',
        message: 'Powiadomienia SMS nie są jeszcze dostępne.',
      });
      setTimeout(() => setTestStatus(null), 5000);
    } finally {
      setTestingSMS(false);
    }
  };

  const handleTestPush = async () => {
    setTestingPush(true);
    setTestStatus(null);
    
    try {
      // Push notifications - użyj browser notification API
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('PartyPass - Test', {
            body: 'To jest testowe powiadomienie push! ✅',
            icon: '/logo192.png',
          });
          setTestStatus({
            type: 'push',
            status: 'success',
            message: 'Powiadomienie push wysłane! Sprawdź swoją przeglądarkę.',
          });
          setTimeout(() => setTestStatus(null), 5000);
        } else if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification('PartyPass - Test', {
              body: 'To jest testowe powiadomienie push! ✅',
              icon: '/logo192.png',
            });
            setTestStatus({
              type: 'push',
              status: 'success',
              message: 'Powiadomienie push wysłane!',
            });
            setTimeout(() => setTestStatus(null), 5000);
          } else {
            setTestStatus({
              type: 'push',
              status: 'error',
              message: 'Musisz zezwolić na powiadomienia w przeglądarce.',
            });
            setTimeout(() => setTestStatus(null), 5000);
          }
        } else {
          setTestStatus({
            type: 'push',
            status: 'error',
            message: 'Powiadomienia są zablokowane w przeglądarce.',
          });
          setTimeout(() => setTestStatus(null), 5000);
        }
      } else {
        setTestStatus({
          type: 'push',
          status: 'error',
          message: 'Twoja przeglądarka nie obsługuje powiadomień push.',
        });
        setTimeout(() => setTestStatus(null), 5000);
      }
    } finally {
      setTestingPush(false);
    }
  };


  return (
    <div className="notification-settings">
      <div className="notification-settings__header">
        <h1>Powiadomienia</h1>
        <p>
          Wybierz jak chcesz otrzymywać powiadomienia o swoich wydarzeniach
        </p>
      </div>

      {/* Email Notifications */}
      <div className="notification-settings__section">
        <div className="notification-settings__section-header">
          <div className="notification-settings__section-icon notification-settings__section-icon--email">
            <Mail size={20} />
          </div>
          <div>
            <h3>Powiadomienia email</h3>
            <p>Otrzymuj ważne aktualizacje na swój adres email</p>
          </div>
        </div>

        <div className="notification-settings__options">
          <div className="notification-settings__option">
            <div className="notification-settings__option-info">
              <span className="notification-settings__option-title">
                Przypomnienia o wydarzeniach
              </span>
              <span className="notification-settings__option-description">
                Automatyczne przypomnienia 24h i 1h przed wydarzeniem
              </span>
            </div>
            <label className="notification-settings__toggle">
              <input
                type="checkbox"
                checked={settings.email.eventReminders}
                onChange={() => handleToggle('email', 'eventReminders')}
              />
              <span className="notification-settings__slider"></span>
            </label>
          </div>

          <div className="notification-settings__option">
            <div className="notification-settings__option-info">
              <span className="notification-settings__option-title">
                Odpowiedzi gości
              </span>
              <span className="notification-settings__option-description">
                Natychmiastowe powiadomienia gdy goście odpowiadają na
                zaproszenia
              </span>
            </div>
            <label className="notification-settings__toggle">
              <input
                type="checkbox"
                checked={settings.email.guestResponses}
                onChange={() => handleToggle('email', 'guestResponses')}
              />
              <span className="notification-settings__slider"></span>
            </label>
          </div>

          <div className="notification-settings__option">
            <div className="notification-settings__option-info">
              <span className="notification-settings__option-title">
                Tygodniowe podsumowanie
              </span>
              <span className="notification-settings__option-description">
                Statystyki wydarzeń, analityki i przegląd tygodnia
              </span>
            </div>
            <label className="notification-settings__toggle">
              <input
                type="checkbox"
                checked={settings.email.weeklyDigest}
                onChange={() => handleToggle('email', 'weeklyDigest')}
              />
              <span className="notification-settings__slider"></span>
            </label>
          </div>

          <div className="notification-settings__option">
            <div className="notification-settings__option-info">
              <span className="notification-settings__option-title">
                Aktualizacje systemowe
              </span>
              <span className="notification-settings__option-description">
                Ważne informacje o aktualizacjach i zmianach w aplikacji
              </span>
            </div>
            <label className="notification-settings__toggle">
              <input
                type="checkbox"
                checked={settings.email.systemUpdates}
                onChange={() => handleToggle('email', 'systemUpdates')}
              />
              <span className="notification-settings__slider"></span>
            </label>
          </div>

          <div className="notification-settings__option">
            <div className="notification-settings__option-info">
              <span className="notification-settings__option-title">
                Marketing i promocje
              </span>
              <span className="notification-settings__option-description">
                Nowości, porady, oferty specjalne i newsletter PartyPass
              </span>
            </div>
            <label className="notification-settings__toggle">
              <input
                type="checkbox"
                checked={settings.email.marketing}
                onChange={() => handleToggle('email', 'marketing')}
              />
              <span className="notification-settings__slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="notification-settings__section">
        <div className="notification-settings__section-header">
          <div className="notification-settings__section-icon notification-settings__section-icon--sms">
            <Smartphone size={20} />
          </div>
          <div>
            <h3>Powiadomienia SMS</h3>
            <p>Najważniejsze powiadomienia wysyłane bezpośrednio na telefon</p>
          </div>
        </div>

        <div className="notification-settings__options">
          <div className="notification-settings__option">
            <div className="notification-settings__option-info">
              <span className="notification-settings__option-title">
                Przypomnienia o wydarzeniach
              </span>
              <span className="notification-settings__option-description">
                SMS przypomnienie 1 godzinę przed wydarzeniem
              </span>
            </div>
            <label className="notification-settings__toggle">
              <input
                type="checkbox"
                checked={settings.sms.eventReminders}
                onChange={() => handleToggle('sms', 'eventReminders')}
              />
              <span className="notification-settings__slider"></span>
            </label>
          </div>

          <div className="notification-settings__option">
            <div className="notification-settings__option-info">
              <span className="notification-settings__option-title">
                Pilne odpowiedzi gości
              </span>
              <span className="notification-settings__option-description">
                SMS gdy goście odrzucają zaproszenie w ostatniej chwili
              </span>
            </div>
            <label className="notification-settings__toggle">
              <input
                type="checkbox"
                checked={settings.sms.guestResponses}
                onChange={() => handleToggle('sms', 'guestResponses')}
              />
              <span className="notification-settings__slider"></span>
            </label>
          </div>

          <div className="notification-settings__option">
            <div className="notification-settings__option-info">
              <span className="notification-settings__option-title">
                Tylko sytuacje awaryjne
              </span>
              <span className="notification-settings__option-description">
                SMS tylko w przypadku problemów z wydarzeniem lub aplikacją
              </span>
            </div>
            <label className="notification-settings__toggle">
              <input
                type="checkbox"
                checked={settings.sms.emergencyOnly}
                onChange={() => handleToggle('sms', 'emergencyOnly')}
              />
              <span className="notification-settings__slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="notification-settings__section">
        <div className="notification-settings__section-header">
          <div className="notification-settings__section-icon notification-settings__section-icon--push">
            <Bell size={20} />
          </div>
          <div>
            <h3>Powiadomienia push</h3>
            <p>
              Powiadomienia wyświetlane w przeglądarce lub aplikacji mobilnej
            </p>
          </div>
        </div>

        <div className="notification-settings__options">
          <div className="notification-settings__option">
            <div className="notification-settings__option-info">
              <span className="notification-settings__option-title">
                Przypomnienia o wydarzeniach
              </span>
              <span className="notification-settings__option-description">
                Push powiadomienia przed nadchodzącymi wydarzeniami
              </span>
            </div>
            <label className="notification-settings__toggle">
              <input
                type="checkbox"
                checked={settings.push.eventReminders}
                onChange={() => handleToggle('push', 'eventReminders')}
              />
              <span className="notification-settings__slider"></span>
            </label>
          </div>

          <div className="notification-settings__option">
            <div className="notification-settings__option-info">
              <span className="notification-settings__option-title">
                Odpowiedzi gości
              </span>
              <span className="notification-settings__option-description">
                Natychmiastowe push gdy goście akceptują lub odrzucają
                zaproszenia
              </span>
            </div>
            <label className="notification-settings__toggle">
              <input
                type="checkbox"
                checked={settings.push.guestResponses}
                onChange={() => handleToggle('push', 'guestResponses')}
              />
              <span className="notification-settings__slider"></span>
            </label>
          </div>

          <div className="notification-settings__option">
            <div className="notification-settings__option-info">
              <span className="notification-settings__option-title">
                Aktualizacje aplikacji
              </span>
              <span className="notification-settings__option-description">
                Powiadomienia o nowych funkcjach i ulepszeniach
              </span>
            </div>
            <label className="notification-settings__toggle">
              <input
                type="checkbox"
                checked={settings.push.appUpdates}
                onChange={() => handleToggle('push', 'appUpdates')}
              />
              <span className="notification-settings__slider"></span>
            </label>
          </div>

          <div className="notification-settings__option">
            <div className="notification-settings__option-info">
              <span className="notification-settings__option-title">
                Promocje marketingowe
              </span>
              <span className="notification-settings__option-description">
                Push powiadomienia o promocjach i nowych funkcjach
              </span>
            </div>
            <label className="notification-settings__toggle">
              <input
                type="checkbox"
                checked={settings.push.marketing}
                onChange={() => handleToggle('push', 'marketing')}
              />
              <span className="notification-settings__slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Digest Settings */}
      <div className="notification-settings__section">
        <div className="notification-settings__section-header">
          <div className="notification-settings__section-icon notification-settings__section-icon--digest">
            <Globe size={20} />
          </div>
          <div>
            <h3>Podsumowania i raporty</h3>
            <p>Regularne przeglądy Twoich wydarzeń, statystyki i analizy</p>
          </div>
        </div>

        <div className="notification-settings__digest">
          <div className="notification-settings__digest-main">
            <div className="notification-settings__field">
              <label>Częstotliwość wysyłania</label>
              <select
                value={settings.digest.frequency}
                onChange={e =>
                  handleSelectChange('digest', 'frequency', e.target.value)
                }
              >
                <option value="daily">Codziennie</option>
                <option value="weekly">Tygodniowo (w poniedziałki)</option>
                <option value="monthly">Miesięcznie (1 dzień miesiąca)</option>
                <option value="never">Nigdy nie wysyłaj</option>
              </select>
            </div>

            {settings.digest.frequency !== 'never' && (
              <div className="notification-settings__field">
                <label>Czas wysyłki</label>
                <select
                  value={settings.digest.time}
                  onChange={e =>
                    handleSelectChange('digest', 'time', e.target.value)
                  }
                >
                  <option value="07:00">07:00 - Wczesny poranek</option>
                  <option value="08:00">08:00 - Przed pracą</option>
                  <option value="09:00">09:00 - Początek dnia</option>
                  <option value="12:00">12:00 - Lunch break</option>
                  <option value="18:00">18:00 - Po pracy</option>
                  <option value="20:00">20:00 - Wieczorem</option>
                </select>
              </div>
            )}
          </div>

          {settings.digest.frequency !== 'never' && (
            <div className="notification-settings__digest-options">
              <h4>Co uwzględnić w podsumowaniu</h4>
              <div className="notification-settings__digest-checkboxes">
                <label className="notification-settings__checkbox">
                  <input
                    type="checkbox"
                    checked={settings.digest.includeAnalytics}
                    onChange={e =>
                      handleSelectChange(
                        'digest',
                        'includeAnalytics',
                        e.target.checked
                      )
                    }
                  />
                  <span className="notification-settings__checkbox-custom"></span>
                  <div>
                    <span className="notification-settings__checkbox-title">
                      Analityki i statystyki
                    </span>
                    <span className="notification-settings__checkbox-description">
                      Wykresy, wskaźniki odpowiedzi, podsumowania
                    </span>
                  </div>
                </label>

                <label className="notification-settings__checkbox">
                  <input
                    type="checkbox"
                    checked={settings.digest.includeUpcoming}
                    onChange={e =>
                      handleSelectChange(
                        'digest',
                        'includeUpcoming',
                        e.target.checked
                      )
                    }
                  />
                  <span className="notification-settings__checkbox-custom"></span>
                  <div>
                    <span className="notification-settings__checkbox-title">
                      Nadchodzące wydarzenia
                    </span>
                    <span className="notification-settings__checkbox-description">
                      Lista najbliższych wydarzeń i przypomnienia
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Notifications */}
      <div className="notification-settings__section notification-settings__section--test">
        <div className="notification-settings__section-header">
          <div className="notification-settings__section-icon notification-settings__section-icon--test">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3>Testuj powiadomienia</h3>
            <p>Wyślij testowe powiadomienia aby sprawdzić swoje ustawienia</p>
          </div>
        </div>

        <div className="notification-settings__test-buttons">
          <button 
            className="notification-settings__test-btn"
            onClick={handleTestEmail}
            disabled={testingEmail || !user?.email}
          >
            <Mail size={16} />
            {testingEmail ? 'Wysyłanie...' : 'Wyślij test email'}
          </button>
          <button 
            className="notification-settings__test-btn"
            onClick={handleTestSMS}
            disabled={testingSMS}
          >
            <Smartphone size={16} />
            {testingSMS ? 'Wysyłanie...' : 'Wyślij test SMS'}
          </button>
          <button 
            className="notification-settings__test-btn"
            onClick={handleTestPush}
            disabled={testingPush}
          >
            <Bell size={16} />
            {testingPush ? 'Wysyłanie...' : 'Wyślij test push'}
          </button>
        </div>

        {testStatus && (
          <div className={`notification-settings__test-status notification-settings__test-status--${testStatus.status}`}>
            {testStatus.status === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{testStatus.message}</span>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="notification-settings__actions">
        <div className="notification-settings__save-status">
          {saveStatus === 'saved' && (
            <span className="notification-settings__save-message notification-settings__save-message--success">
              <Check size={16} />
              Ustawienia zostały zapisane
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="notification-settings__save-message notification-settings__save-message--error">
              <AlertCircle size={16} />
              Wystąpił błąd podczas zapisywania
            </span>
          )}
        </div>

        <button
          className="notification-settings__save-btn"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="notification-settings__spinner"></div>
          ) : (
            <>
              <Save size={16} />
              Zapisz wszystkie ustawienia
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
