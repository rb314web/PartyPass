import React, { useState } from 'react';
import '../assets/style/UserSettings.scss';

interface UserSettingsProps {
    onClose: () => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ onClose }) => {
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            sms: false,
            browser: true
        },
        theme: 'light',
        language: 'pl'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Tutaj dodamy logikę zapisywania ustawień
    };

    return (
        <div className="user-settings">
            <div className="user-settings__header">
                <h2>Ustawienia</h2>
                <button className="user-settings__close" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div className="user-settings__content">
                <form onSubmit={handleSubmit}>
                    <div className="user-settings__section">
                        <h3>Powiadomienia</h3>
                        <div className="user-settings__option">
                            <label className="user-settings__checkbox">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.email}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notifications: {
                                            ...settings.notifications,
                                            email: e.target.checked
                                        }
                                    })}
                                />
                                <span>Powiadomienia email</span>
                            </label>
                        </div>
                        <div className="user-settings__option">
                            <label className="user-settings__checkbox">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.sms}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notifications: {
                                            ...settings.notifications,
                                            sms: e.target.checked
                                        }
                                    })}
                                />
                                <span>Powiadomienia SMS</span>
                            </label>
                        </div>
                        <div className="user-settings__option">
                            <label className="user-settings__checkbox">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.browser}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notifications: {
                                            ...settings.notifications,
                                            browser: e.target.checked
                                        }
                                    })}
                                />
                                <span>Powiadomienia przeglądarki</span>
                            </label>
                        </div>
                    </div>

                    <div className="user-settings__section">
                        <h3>Wygląd</h3>
                        <div className="user-settings__option">
                            <label>Motyw</label>
                            <select
                                value={settings.theme}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    theme: e.target.value
                                })}
                            >
                                <option value="light">Jasny</option>
                                <option value="dark">Ciemny</option>
                                <option value="system">Systemowy</option>
                            </select>
                        </div>
                    </div>

                    <div className="user-settings__section">
                        <h3>Język</h3>
                        <div className="user-settings__option">
                            <label>Wybierz język</label>
                            <select
                                value={settings.language}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    language: e.target.value
                                })}
                            >
                                <option value="pl">Polski</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>

                    <div className="user-settings__actions">
                        <button type="submit" className="user-settings__save-button">
                            <i className="fas fa-save"></i>
                            Zapisz ustawienia
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserSettings; 