import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import '../assets/style/SettingsPanel.scss';

interface SettingsPanelProps {
    onSettingsChange: (settings: any) => void;
    initialSettings?: any;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onSettingsChange, initialSettings }) => {
    const { showToast } = useToast();
    const [isExpanded, setIsExpanded] = useState(false);
    const [settings, setSettings] = useState({
        emailService: initialSettings?.emailService || 'none',
        smsService: initialSettings?.smsService || 'none',
        emailTemplates: initialSettings?.emailTemplates || {
            invitation: 'Drogi {name},\n\nSerdecznie zapraszamy Cię na wydarzenie.\n\nProsimy o potwierdzenie przybycia.\n\nPozdrawiamy,\nOrganizatorzy',
            reminder: 'Drogi {name},\n\nPrzypominamy o nadchodzącym wydarzeniu.\n\nProsimy o potwierdzenie przybycia.\n\nPozdrawiamy,\nOrganizatorzy',
            thankYou: 'Drogi {name},\n\nDziękujemy za potwierdzenie przybycia.\n\nDo zobaczenia na wydarzeniu!\n\nPozdrawiamy,\nOrganizatorzy'
        },
        smsTemplates: initialSettings?.smsTemplates || {
            invitation: 'Drogi {name}, serdecznie zapraszamy Cię na wydarzenie. Prosimy o potwierdzenie przybycia. Pozdrawiamy, Organizatorzy',
            reminder: 'Drogi {name}, przypominamy o nadchodzącym wydarzeniu. Prosimy o potwierdzenie przybycia. Pozdrawiamy, Organizatorzy',
            thankYou: 'Drogi {name}, dziękujemy za potwierdzenie przybycia. Do zobaczenia na wydarzeniu! Pozdrawiamy, Organizatorzy'
        },
        apiKeys: initialSettings?.apiKeys || {
            email: '',
            sms: ''
        }
    });

    const handleSave = () => {
        onSettingsChange(settings);
        showToast('Ustawienia zostały zapisane', 'success');
        setIsExpanded(false);
    };

    return (
        <div className={`settings-panel ${isExpanded ? 'settings-panel--expanded' : ''}`}>
            <div className="settings-panel__header" onClick={() => setIsExpanded(!isExpanded)}>
                <h2>
                    <i className="fas fa-cog"></i>
                    Ustawienia
                </h2>
                <button className="settings-panel__toggle">
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                </button>
            </div>

            {isExpanded && (
                <div className="settings-panel__content">
                    <div className="settings-panel__section">
                        <h3>Integracje</h3>
                        <div className="settings-panel__form-group">
                            <label htmlFor="emailService">Serwis Email</label>
                            <select
                                id="emailService"
                                value={settings.emailService}
                                onChange={(e) => setSettings({ ...settings, emailService: e.target.value })}
                            >
                                <option value="none">Brak</option>
                                <option value="sendgrid">SendGrid</option>
                                <option value="mailgun">Mailgun</option>
                                <option value="ses">Amazon SES</option>
                            </select>
                        </div>

                        <div className="settings-panel__form-group">
                            <label htmlFor="smsService">Serwis SMS</label>
                            <select
                                id="smsService"
                                value={settings.smsService}
                                onChange={(e) => setSettings({ ...settings, smsService: e.target.value })}
                            >
                                <option value="none">Brak</option>
                                <option value="twilio">Twilio</option>
                                <option value="messagebird">MessageBird</option>
                                <option value="nexmo">Nexmo</option>
                            </select>
                        </div>
                    </div>

                    <div className="settings-panel__section">
                        <h3>Klucze API</h3>
                        <div className="settings-panel__form-group">
                            <label htmlFor="emailApiKey">Klucz API Email</label>
                            <input
                                type="password"
                                id="emailApiKey"
                                value={settings.apiKeys.email}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    apiKeys: { ...settings.apiKeys, email: e.target.value }
                                })}
                                placeholder="Wprowadź klucz API dla serwisu email"
                            />
                        </div>

                        <div className="settings-panel__form-group">
                            <label htmlFor="smsApiKey">Klucz API SMS</label>
                            <input
                                type="password"
                                id="smsApiKey"
                                value={settings.apiKeys.sms}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    apiKeys: { ...settings.apiKeys, sms: e.target.value }
                                })}
                                placeholder="Wprowadź klucz API dla serwisu SMS"
                            />
                        </div>
                    </div>

                    <div className="settings-panel__section">
                        <h3>Szablony Email</h3>
                        <div className="settings-panel__form-group">
                            <label htmlFor="emailInvitation">Szablon zaproszenia</label>
                            <textarea
                                id="emailInvitation"
                                value={settings.emailTemplates.invitation}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    emailTemplates: { ...settings.emailTemplates, invitation: e.target.value }
                                })}
                                rows={5}
                            />
                        </div>

                        <div className="settings-panel__form-group">
                            <label htmlFor="emailReminder">Szablon przypomnienia</label>
                            <textarea
                                id="emailReminder"
                                value={settings.emailTemplates.reminder}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    emailTemplates: { ...settings.emailTemplates, reminder: e.target.value }
                                })}
                                rows={5}
                            />
                        </div>

                        <div className="settings-panel__form-group">
                            <label htmlFor="emailThankYou">Szablon podziękowania</label>
                            <textarea
                                id="emailThankYou"
                                value={settings.emailTemplates.thankYou}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    emailTemplates: { ...settings.emailTemplates, thankYou: e.target.value }
                                })}
                                rows={5}
                            />
                        </div>
                    </div>

                    <div className="settings-panel__section">
                        <h3>Szablony SMS</h3>
                        <div className="settings-panel__form-group">
                            <label htmlFor="smsInvitation">Szablon zaproszenia</label>
                            <textarea
                                id="smsInvitation"
                                value={settings.smsTemplates.invitation}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    smsTemplates: { ...settings.smsTemplates, invitation: e.target.value }
                                })}
                                rows={3}
                                maxLength={160}
                            />
                            <div className="settings-panel__char-counter">
                                {settings.smsTemplates.invitation.length}/160 znaków
                            </div>
                        </div>

                        <div className="settings-panel__form-group">
                            <label htmlFor="smsReminder">Szablon przypomnienia</label>
                            <textarea
                                id="smsReminder"
                                value={settings.smsTemplates.reminder}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    smsTemplates: { ...settings.smsTemplates, reminder: e.target.value }
                                })}
                                rows={3}
                                maxLength={160}
                            />
                            <div className="settings-panel__char-counter">
                                {settings.smsTemplates.reminder.length}/160 znaków
                            </div>
                        </div>

                        <div className="settings-panel__form-group">
                            <label htmlFor="smsThankYou">Szablon podziękowania</label>
                            <textarea
                                id="smsThankYou"
                                value={settings.smsTemplates.thankYou}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    smsTemplates: { ...settings.smsTemplates, thankYou: e.target.value }
                                })}
                                rows={3}
                                maxLength={160}
                            />
                            <div className="settings-panel__char-counter">
                                {settings.smsTemplates.thankYou.length}/160 znaków
                            </div>
                        </div>
                    </div>

                    <div className="settings-panel__actions">
                        <button className="settings-panel__save-button" onClick={handleSave}>
                            <i className="fas fa-save"></i>
                            Zapisz ustawienia
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPanel; 