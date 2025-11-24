import React, { useState, useRef, useCallback } from 'react';
import { Palette, Pipette, X } from 'lucide-react';

interface AccentColor {
  id: string;
  name: string;
  value: string;
  light: string;
  dark: string;
}

interface AccentColorSectionProps {
  settings: {
    accentColor: string;
    customColor: string;
  };
  onSettingChange: (key: keyof { accentColor: string; customColor: string }, value: any) => void;
  applyCustomColor: (hexColor: string) => void;
  accentColors: AccentColor[];
}

const AccentColorSection: React.FC<AccentColorSectionProps> = ({
  settings,
  onSettingChange,
  applyCustomColor,
  accentColors,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(settings.customColor);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Paleta sugerowanych kolorów
  const colorPalette = [
    '#5b7fd4',
    '#4663b8',
    '#7a9ee3',
    '#3b5998',
    '#1e3a8a',
    '#8b7ab8',
    '#7461a0',
    '#a594cc',
    '#6d28d9',
    '#5b21b6',
    '#5ba083',
    '#4a8a6d',
    '#75b89a',
    '#059669',
    '#047857',
    '#d4945b',
    '#b87d46',
    '#e3ab7a',
    '#d97706',
    '#b45309',
    '#d4695b',
    '#b85546',
    '#e3877a',
    '#dc2626',
    '#b91c1c',
    '#5ba8a0',
    '#4a8f88',
    '#75bcb5',
    '#0d9488',
    '#0f766e',
    '#6b7a8f',
    '#576478',
    '#8593a5',
    '#475569',
    '#334155',
    '#c084fc',
    '#a855f7',
    '#9333ea',
    '#7c3aed',
    '#6b21a8',
  ];

  const handleCustomColorClick = useCallback(() => {
    setShowColorPicker(true);
    setTempColor(settings.customColor);
  }, [settings.customColor]);

  const handleColorConfirm = useCallback(() => {
    applyCustomColor(tempColor);
    onSettingChange('accentColor', 'custom');
    onSettingChange('customColor', tempColor);
    setShowColorPicker(false);
  }, [tempColor, applyCustomColor, onSettingChange]);

  const handleColorCancel = useCallback(() => {
    setShowColorPicker(false);
    setTempColor(settings.customColor);
  }, [settings.customColor]);

  return (
    <>
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
          {accentColors.map(color => (
            <label key={color.id} className="appearance-settings__color-option">
              <input
                type="radio"
                name="accentColor"
                value={color.id}
                checked={settings.accentColor === color.id}
                onChange={e =>
                  onSettingChange('accentColor', e.target.value)
                }
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

          {/* Custom Color Option */}
          <label className="appearance-settings__color-option">
            <input
              type="radio"
              name="accentColor"
              value="custom"
              checked={settings.accentColor === 'custom'}
              onChange={e => onSettingChange('accentColor', e.target.value)}
            />
            <div
              className="appearance-settings__color-swatch appearance-settings__color-swatch--custom"
              style={{ backgroundColor: settings.customColor }}
              onClick={handleCustomColorClick}
            >
              {settings.accentColor === 'custom' && (
                <div className="appearance-settings__color-check">✓</div>
              )}
              <Pipette size={16} className="appearance-settings__pipette-icon" />
            </div>
            <span className="appearance-settings__color-name">Własny</span>
          </label>
        </div>

        {/* Custom Color Picker */}
        {settings.accentColor === 'custom' && (
          <div className="appearance-settings__custom-color-info">
            <div className="appearance-settings__color-preview">
              <div
                className="appearance-settings__color-circle"
                style={{ backgroundColor: settings.customColor }}
              ></div>
              <span className="appearance-settings__color-hex">
                {settings.customColor.toUpperCase()}
              </span>
            </div>
            <button
              className="appearance-settings__change-color-btn"
              onClick={handleCustomColorClick}
              type="button"
            >
              <Pipette size={14} />
              Zmień kolor
            </button>
          </div>
        )}
      </div>

      {/* Custom Color Picker Modal */}
      {showColorPicker && (
        <div className="appearance-settings__modal-overlay">
          <div
            className="appearance-settings__modal"
            ref={colorPickerRef}
          >
            <div className="appearance-settings__modal-header">
              <h4>Wybierz kolor</h4>
              <button
                className="appearance-settings__modal-close"
                onClick={handleColorCancel}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <div className="appearance-settings__modal-body">
              <div className="appearance-settings__color-picker-section">
                <label>Wybierz kolor:</label>
                <div className="appearance-settings__color-input-wrapper">
                  <input
                    type="color"
                    value={tempColor}
                    onChange={(e) => setTempColor(e.target.value)}
                    className="appearance-settings__color-input"
                  />
                  <span className="appearance-settings__color-hex-display">
                    {tempColor.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="appearance-settings__color-palette-section">
                <label>Popularne kolory:</label>
                <div className="appearance-settings__color-palette">
                  {colorPalette.map((color, index) => (
                    <button
                      key={index}
                      className={`appearance-settings__palette-color ${tempColor.toLowerCase() === color.toLowerCase() ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setTempColor(color)}
                      type="button"
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="appearance-settings__color-input-group">
                <label htmlFor="hex-input">HEX:</label>
                <input
                  id="hex-input"
                  type="text"
                  value={tempColor}
                  onChange={(e) => setTempColor(e.target.value)}
                  className="appearance-settings__hex-input"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="appearance-settings__modal-footer">
              <button
                className="appearance-settings__cancel-btn"
                onClick={handleColorCancel}
                type="button"
              >
                Anuluj
              </button>
              <button
                className="appearance-settings__confirm-btn"
                onClick={handleColorConfirm}
                type="button"
              >
                Zastosuj
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccentColorSection;