// components/dashboard/Settings/AppearanceSettings/AppearanceSettings.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Palette, Globe, Type } from 'lucide-react';
import AccentColorSection from './AccentColorSection';
import './AppearanceSettings.scss';

// Kolory akcentu z wartościami CSS - stonowane odcienie
const accentColors = [
  {
    id: 'blue',
    name: 'Niebieski',
    value: '#5b7fd4',
    light: '#7a9ee3',
    dark: '#4663b8',
  },
  {
    id: 'purple',
    name: 'Fioletowy',
    value: '#8b7ab8',
    light: '#a594cc',
    dark: '#7461a0',
  },
  {
    id: 'green',
    name: 'Zielony',
    value: '#5ba083',
    light: '#75b89a',
    dark: '#477066',
  },
  {
    id: 'orange',
    name: 'Pomarańczowy',
    value: '#d4945b',
    light: '#e0ad7c',
    dark: '#b87a45',
  },
  {
    id: 'red',
    name: 'Czerwony',
    value: '#d4695b',
    light: '#e0857c',
    dark: '#b85145',
  },
  {
    id: 'teal',
    name: 'Morski',
    value: '#5ba8a0',
    light: '#7cbab4',
    dark: '#45827c',
  },
  {
    id: 'slate',
    name: 'Łupkowy',
    value: '#6b7a8f',
    light: '#8a96a8',
    dark: '#535f6f',
  },
];

const AppearanceSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    theme: 'light' as 'light',
    accentColor:
      (localStorage.getItem('accentColor') as
        | 'blue'
        | 'purple'
        | 'green'
        | 'orange'
        | 'red'
        | 'teal'
        | 'slate'
        | 'custom') || 'blue',
    customColor: localStorage.getItem('customAccentColor') || '#5b7fd4',
    language: 'pl' as 'pl' | 'en' | 'de' | 'fr',
    dateFormat: 'DD/MM/YYYY' as 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD',
    timeFormat: '24h' as '12h' | '24h',
    currency: 'PLN' as 'PLN' | 'EUR' | 'USD' | 'GBP',
    compactMode: false,
    reducedMotion: false,
    highContrast: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const applyCustomColor = useCallback((hexColor: string) => {
    const root = document.documentElement;
    const light = lightenColor(hexColor, 15);
    const dark = darkenColor(hexColor, 15);

    root.style.setProperty('--color-primary', hexColor);
    root.style.setProperty('--primary', hexColor);
    root.style.setProperty('--color-primary-light', light);
    root.style.setProperty('--primary-light', light);
    root.style.setProperty('--color-primary-dark', dark);
    root.style.setProperty('--primary-dark', dark);

    localStorage.setItem('customAccentColor', hexColor);
    localStorage.setItem('accentColor', 'custom');
  }, []);

  const applyAccentColor = useCallback((colorId: string) => {
    const color = accentColors.find(c => c.id === colorId);
    if (color) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', color.value);
      root.style.setProperty('--primary', color.value);
      root.style.setProperty('--color-primary-light', color.light);
      root.style.setProperty('--primary-light', color.light);
      root.style.setProperty('--color-primary-dark', color.dark);
      root.style.setProperty('--primary-dark', color.dark);

      localStorage.setItem('accentColor', colorId);
      localStorage.removeItem('customAccentColor');
    }
  }, []);

  // Zastosuj kolor akcentu przy montowaniu komponentu
  useEffect(() => {
    if (settings.accentColor === 'custom') {
      applyCustomColor(settings.customColor);
    } else {
      applyAccentColor(settings.accentColor);
    }
  }, [settings.accentColor, settings.customColor, applyAccentColor, applyCustomColor]);

  const lightenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  };

  const darkenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;
    return (
      '#' +
      (
        0x1000000 +
        (R > 0 ? R : 0) * 0x10000 +
        (G > 0 ? G : 0) * 0x100 +
        (B > 0 ? B : 0)
      )
        .toString(16)
        .slice(1)
    );
  };

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));

    // Natychmiast zastosuj kolor akcentu
    if (key === 'accentColor') {
      if (value === 'custom') {
        applyCustomColor(settings.customColor);
      } else {
        applyAccentColor(value);
      }
    } else if (key === 'customColor') {
      applyCustomColor(value);
      setSettings(prev => ({
        ...prev,
        accentColor: 'custom',
      }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    // Symulacja API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    alert('Ustawienia wyglądu zostały zapisane!');
    setIsLoading(false);
  };

  const languages = [
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className="appearance-settings">
      <div className="appearance-settings__header">
        <h1>Wygląd i personalizacja</h1>
        <p>Dostosuj interfejs aplikacji do swoich preferencji</p>
      </div>

      <AccentColorSection
        settings={settings}
        onSettingChange={handleSettingChange}
        applyCustomColor={applyCustomColor}
        accentColors={accentColors}
      />

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
              onChange={e => handleSettingChange('language', e.target.value)}
            >
              {languages.map(lang => (
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
              onChange={e => handleSettingChange('dateFormat', e.target.value)}
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
              onChange={e => handleSettingChange('timeFormat', e.target.value)}
            >
              <option value="24h">24-godzinny (15:30)</option>
              <option value="12h">12-godzinny (3:30 PM)</option>
            </select>
          </div>

          <div className="appearance-settings__field">
            <label>Waluta</label>
            <select
              value={settings.currency}
              onChange={e => handleSettingChange('currency', e.target.value)}
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
              <span className="appearance-settings__option-title">
                Tryb kompaktowy
              </span>
              <span className="appearance-settings__option-description">
                Zmniejsza odstępy i rozmiary elementów
              </span>
            </div>
            <label className="appearance-settings__toggle">
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={e =>
                  handleSettingChange('compactMode', e.target.checked)
                }
              />
              <span className="appearance-settings__slider"></span>
            </label>
          </div>

          <div className="appearance-settings__option">
            <div className="appearance-settings__option-info">
              <span className="appearance-settings__option-title">
                Ograniczone animacje
              </span>
              <span className="appearance-settings__option-description">
                Redukuje ruchy i animacje w interfejsie
              </span>
            </div>
            <label className="appearance-settings__toggle">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={e =>
                  handleSettingChange('reducedMotion', e.target.checked)
                }
              />
              <span className="appearance-settings__slider"></span>
            </label>
          </div>

          <div className="appearance-settings__option">
            <div className="appearance-settings__option-info">
              <span className="appearance-settings__option-title">
                Wysoki kontrast
              </span>
              <span className="appearance-settings__option-description">
                Zwiększa kontrast dla lepszej czytelności
              </span>
            </div>
            <label className="appearance-settings__toggle">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={e =>
                  handleSettingChange('highContrast', e.target.checked)
                }
              />
              <span className="appearance-settings__slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      {(() => {
        // Lokalne accentColors tylko dla podglądu
        const accentColors = [
          { id: 'blue', value: '#5b7fd4' },
          { id: 'purple', value: '#8b7ab8' },
          { id: 'green', value: '#5ba083' },
          { id: 'orange', value: '#d4945b' },
          { id: 'red', value: '#d4695b' },
          { id: 'teal', value: '#5ba8a0' },
          { id: 'slate', value: '#6b7a8f' },
        ];

        return (
      <div className="appearance-settings__section">
        <div className="appearance-settings__section-header">
          <div className="appearance-settings__section-icon">
            <Palette size={20} />
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
                  <div className="appearance-settings__preview-nav-item active">
                    Dashboard
                  </div>
                  <div className="appearance-settings__preview-nav-item">
                    Wydarzenia
                  </div>
                  <div className="appearance-settings__preview-nav-item">
                    Goście
                  </div>
                </div>
              </div>
              <div className="appearance-settings__preview-main">
                <div className="appearance-settings__preview-card">
                  <div className="appearance-settings__preview-title">
                    Urodziny Ani
                  </div>
                  <div className="appearance-settings__preview-subtitle">
                    15 maja 2024, 19:00
                  </div>
                  <div
                    className="appearance-settings__preview-button"
                    style={{
                      backgroundColor: accentColors.find(
                        c => c.id === settings.accentColor
                      )?.value,
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
      );
      })()}

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
