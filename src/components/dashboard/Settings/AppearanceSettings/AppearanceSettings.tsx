// components/dashboard/Settings/AppearanceSettings/AppearanceSettings.tsx
import React, { useState } from 'react';
import { Palette, Monitor, Sun, Moon, Globe, Type } from 'lucide-react';
import './AppearanceSettings.scss';

const AppearanceSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    theme: 'light' as 'light' | 'dark' | 'system',
    accentColor: 'blue' as 'blue' | 'purple' | 'green' | 'orange' | 'red',
    language: 'pl' as 'pl' | 'en' | 'de' | 'fr',
    dateFormat: 'DD/MM/YYYY' as 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD',
    timeFormat: '24h' as '12h' | '24h',
    currency: 'PLN' as 'PLN' | 'EUR' | 'USD' | 'GBP',
    compactMode: false,
    reducedMotion: false,
    highContrast: false
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Symulacja API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('Ustawienia wyglądu zostały zapisane!');
    setIsLoading(false);
  };

  const themes = [
    { id: 'light', name: 'Jasny', icon: Sun, description: 'Klasyczny jasny motyw' },
    { id: 'dark', name: 'Ciemny', icon: Moon, description: 'Oszczędza baterię i oczy' },
    { id: 'system', name: 'Systemowy', icon: Monitor, description: 'Dopasuj do systemu' }
  ];

  const accentColors = [
    { id: 'blue', name: 'Niebieski', value: '#6366f1' },
    { id: 'purple', name: 'Fioletowy', value: '#8b5cf6' },
    { id: 'green', name: 'Zielony', value: '#10b981' },
    { id: 'orange', name: 'Pomarańczowy', value: '#f59e0b' },
    { id: 'red', name: 'Czerwony', value: '#ef4444' }
  ];

  const languages = [
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  return (
    <div className="appearance-settings">
      <div className="appearance-settings__header">
        <h2>Wygląd i personalizacja</h2>
        <p>Dostosuj interfejs aplikacji do swoich preferencji</p>
      </div>

      {/* Theme Selection */}
      <div className="appearance-settings__section">
        <div className="appearance-settings__section-header">
          <div className="appearance-settings__section-icon">
            <Palette size={20} />
          </div>
          <div>
            <h3>Motyw</h3>
            <p>Wybierz preferowany schemat kolorów</p>
          </div>
        </div>

        <div className="appearance-settings__theme-grid">
          {themes.map((theme) => (
            <label key={theme.id} className="appearance-settings__theme-option">
              <input
                type="radio"
                name="theme"
                value={theme.id}
                checked={settings.theme === theme.id}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
              />
              <div className="appearance-settings__theme-card">
                <div className="appearance-settings__theme-preview">
                  <theme.icon size={24} />
                </div>
                <div className="appearance-settings__theme-info">
                  <span className="appearance-settings__theme-name">{theme.name}</span>
                  <span className="appearance-settings__theme-description">{theme.description}</span>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="appearance-settings__section">
        <div className="appearance-settings__section-header">
          <div className="appearance-settings__section-icon">
            <Palette size={20} />
          </div>
          <div>
            <h3>Kolor akcentu</h3>
            <p>Główny kolor używany w interfejsie</p>
          </div>
        </div>

        <div className="appearance-settings__color-grid">
          {accentColors.map((color) => (
            <label key={color.id} className="appearance-settings__color-option">
              <input
                type="radio"
                name="accentColor"
                value={color.id}
                checked={settings.accentColor === color.id}
                onChange={(e) => handleSettingChange('accentColor', e.target.value)}
              />
              <div 
                className="appearance-settings__color-swatch"
                style={{ backgroundColor: color.value }}
              >
                {settings.accentColor === color.id && (
                  <div className="appearance-settings__color-check">✓</div>
                )}
              </div>
              <span className="appearance-settings__color-name">{color.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Language & Region */}
      <div className="appearance-settings__section">
        <div className="appearance-settings__section-header">
          <div className="appearance-settings__section-icon">
            <Globe size={20} />
          </div>
          <div>
            <h3>Język i region</h3>
            <p>Ustaw język interfejsu i formaty regionalne</p>
          </div>
        </div>

        <div className="appearance-settings__form-grid">
          <div className="appearance-settings__field">
            <label>Język interfejsu</label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="appearance-settings__field">
            <label>Format daty</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
            </select>
          </div>

          <div className="appearance-settings__field">
            <label>Format czasu</label>
            <select
              value={settings.timeFormat}
              onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
            >
              <option value="24h">24-godzinny (15:30)</option>
              <option value="12h">12-godzinny (3:30 PM)</option>
            </select>
          </div>

          <div className="appearance-settings__field">
            <label>Waluta</label>
            <select
              value={settings.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
            >
              <option value="PLN">PLN (Polski złoty)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (Dolar amerykański)</option>
              <option value="GBP">GBP (Funt brytyjski)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="appearance-settings__section">
        <div className="appearance-settings__section-header">
          <div className="appearance-settings__section-icon">
            <Type size={20} />
          </div>
          <div>
            <h3>Dostępność</h3>
            <p>Opcje ułatwień dostępu i wygody użytkowania</p>
          </div>
        </div>

        <div className="appearance-settings__accessibility-options">
          <div className="appearance-settings__option">
            <div className="appearance-settings__option-info">
              <span className="appearance-settings__option-title">Tryb kompaktowy</span>
              <span className="appearance-settings__option-description">
                Zmniejsza odstępy i rozmiary elementów
              </span>
            </div>
            <label className="appearance-settings__toggle">
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
              />
              <span className="appearance-settings__slider"></span>
            </label>
          </div>

          <div className="appearance-settings__option">
            <div className="appearance-settings__option-info">
              <span className="appearance-settings__option-title">Ograniczone animacje</span>
              <span className="appearance-settings__option-description">
                Redukuje ruchy i animacje w interfejsie
              </span>
            </div>
            <label className="appearance-settings__toggle">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
              />
              <span className="appearance-settings__slider"></span>
            </label>
          </div>

          <div className="appearance-settings__option">
            <div className="appearance-settings__option-info">
              <span className="appearance-settings__option-title">Wysoki kontrast</span>
              <span className="appearance-settings__option-description">
                Zwiększa kontrast dla lepszej czytelności
              </span>
            </div>
            <label className="appearance-settings__toggle">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
              />
              <span className="appearance-settings__slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="appearance-settings__section">
        <div className="appearance-settings__section-header">
          <div className="appearance-settings__section-icon">
            <Monitor size={20} />
          </div>
          <div>
            <h3>Podgląd</h3>
            <p>Zobacz jak będzie wyglądać interfejs z wybranymi ustawieniami</p>
          </div>
        </div>

        <div className="appearance-settings__preview">
          <div className="appearance-settings__preview-window">
            <div className="appearance-settings__preview-header">
              <div className="appearance-settings__preview-buttons">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>PartyPass - Podgląd</span>
            </div>
            <div className="appearance-settings__preview-content">
              <div className="appearance-settings__preview-sidebar">
                <div className="appearance-settings__preview-nav">
                  <div className="appearance-settings__preview-nav-item active">Dashboard</div>
                  <div className="appearance-settings__preview-nav-item">Wydarzenia</div>
                  <div className="appearance-settings__preview-nav-item">Goście</div>
                </div>
              </div>
              <div className="appearance-settings__preview-main">
                <div className="appearance-settings__preview-card">
                  <div className="appearance-settings__preview-title">Urodziny Ani</div>
                  <div className="appearance-settings__preview-subtitle">15 maja 2024, 19:00</div>
                  <div 
                    className="appearance-settings__preview-button"
                    style={{ 
                      backgroundColor: accentColors.find(c => c.id === settings.accentColor)?.value 
                    }}
                  >
                    Zobacz szczegóły
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="appearance-settings__actions">
        <button 
          className="appearance-settings__save-btn"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="appearance-settings__spinner"></div>
          ) : (
            <>
              <Palette size={16} />
              Zapisz ustawienia
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AppearanceSettings;