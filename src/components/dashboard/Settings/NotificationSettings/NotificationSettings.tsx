// components/dashboard/Settings/NotificationSettings/NotificationSettings.tsx
import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Globe, Save, Check, AlertCircle } from 'lucide-react';
import './NotificationSettings.scss';

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    email: {
      eventReminders: true,
      guestResponses: true,
      weeklyDigest: false,
      marketing: false,
      systemUpdates: true
    },
    sms: {
      eventReminders: false,
      guestResponses: true,
      emergencyOnly: true
    },
    push: {
      eventReminders: true,
      guestResponses: true,
      appUpdates: false,
      marketing: false
    },
    digest: {
      frequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'never',
      time: '09:00',
      includeAnalytics: true,
      includeUpcoming: true
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleToggle = (category: keyof typeof settings, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]]
      }
    }));
    setSaveStatus('idle');
  };

  const handleSelectChange = (category: keyof typeof settings, setting: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      // Symulacja API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSaveStatus('saved');
      
      // Reset status po 3 sekundach
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationCount = () => {
    let count = 0;
    Object.values(settings).forEach(category => {
      if (typeof category === 'object' && category !== null) {
        Object.values(category).forEach(value => {
          if (typeof value === 'boolean' && value) count++;
        });
      }
    });
    return count;
  };

  return (
    <div className="notification-settings">
      <div className="notification-settings__header">
        <div className="notification-settings__title-section">
          <h2>Powiadomienia</h2>
          <p>Wybierz jak chcesz otrzymywać powiadomienia o swoich wydarzeniach</p>
        </div>
        <div className="notification-settings__summary">
          <div className="notification-settings__count">
            <Bell size={16} />
            <span>{getNotificationCount()} aktywnych</span>
          </div>
        </div>
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
                Natychmiastowe powiadomienia gdy goście odpowiadają na zaproszenia
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
            <p>Powiadomienia wyświetlane w przeglądarce lub aplikacji mobilnej</p>
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
                Natychmiastowe push gdy goście akceptują lub odrzucają zaproszenia
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
                onChange={(e) => handleSelectChange('digest', 'frequency', e.target.value)}
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
                  onChange={(e) => handleSelectChange('digest', 'time', e.target.value)}
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
                    onChange={(e) => handleSelectChange('digest', 'includeAnalytics', e.target.checked)}
                  />
                  <span className="notification-settings__checkbox-custom"></span>
                  <div>
                    <span className="notification-settings__checkbox-title">Analityki i statystyki</span>
                    <span className="notification-settings__checkbox-description">Wykresy, wskaźniki odpowiedzi, podsumowania</span>
                  </div>
                </label>

                <label className="notification-settings__checkbox">
                  <input
                    type="checkbox"
                    checked={settings.digest.includeUpcoming}
                    onChange={(e) => handleSelectChange('digest', 'includeUpcoming', e.target.checked)}
                  />
                  <span className="notification-settings__checkbox-custom"></span>
                  <div>
                    <span className="notification-settings__checkbox-title">Nadchodzące wydarzenia</span>
                    <span className="notification-settings__checkbox-description">Lista najbliższych wydarzeń i przypomnienia</span>
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
          <button className="notification-settings__test-btn">
            <Mail size={16} />
            Wyślij test email
          </button>
          <button className="notification-settings__test-btn">
            <Smartphone size={16} />
            Wyślij test SMS
          </button>
          <button className="notification-settings__test-btn">
            <Bell size={16} />
            Wyślij test push
          </button>
        </div>
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
