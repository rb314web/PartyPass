import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import '../assets/style/EmailManager.scss';

interface EmailManagerProps {
    eventName: string;
    guestCount: number;
}

const EmailManager: React.FC<EmailManagerProps> = ({ eventName, guestCount }) => {
    const { showToast } = useToast();
    const [emailContent, setEmailContent] = useState({
        subject: '',
        message: '',
        template: 'default'
    });
    const [isSending, setIsSending] = useState(false);

    const templates = {
        default: {
            subject: `Zaproszenie na ${eventName}`,
            message: `Drogi Gościu,\n\nSerdecznie zapraszamy Cię na ${eventName}.\n\nSzczegóły wydarzenia:\n- Data: [DATA]\n- Miejsce: [MIEJSCE]\n\nProsimy o potwierdzenie przybycia.\n\nPozdrawiamy,\nOrganizatorzy`
        },
        reminder: {
            subject: `Przypomnienie: ${eventName}`,
            message: `Drogi Gościu,\n\nPrzypominamy o zbliżającym się wydarzeniu ${eventName}.\n\nSzczegóły wydarzenia:\n- Data: [DATA]\n- Miejsce: [MIEJSCE]\n\nProsimy o potwierdzenie przybycia.\n\nPozdrawiamy,\nOrganizatorzy`
        },
        thankYou: {
            subject: `Podziękowanie za udział w ${eventName}`,
            message: `Drogi Gościu,\n\nSerdecznie dziękujemy za udział w ${eventName}.\n\nMamy nadzieję, że dobrze się bawiliście.\n\nPozdrawiamy,\nOrganizatorzy`
        }
    };

    const handleTemplateChange = (template: keyof typeof templates) => {
        setEmailContent({
            ...emailContent,
            template,
            subject: templates[template].subject,
            message: templates[template].message
        });
    };

    const handleSendEmails = async () => {
        if (!emailContent.subject || !emailContent.message) {
            showToast('Proszę wypełnić wszystkie pola', 'error');
            return;
        }

        setIsSending(true);
        try {
            // Tutaj będzie implementacja wysyłania emaili
            await new Promise(resolve => setTimeout(resolve, 2000)); // Symulacja wysyłania
            showToast(`Wiadomość została wysłana do ${guestCount} gości`, 'success');
            setEmailContent({
                subject: '',
                message: '',
                template: 'default'
            });
        } catch (error) {
            console.error('Error sending emails:', error);
            showToast('Wystąpił błąd podczas wysyłania wiadomości', 'error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="email-manager">
            <h2>Zarządzanie emailami</h2>
            
            <div className="email-manager__templates">
                <h3>Szablony wiadomości</h3>
                <div className="email-manager__template-buttons">
                    <button
                        className={`email-manager__template-button ${emailContent.template === 'default' ? 'active' : ''}`}
                        onClick={() => handleTemplateChange('default')}
                    >
                        <i className="fas fa-envelope"></i>
                        Zaproszenie
                    </button>
                    <button
                        className={`email-manager__template-button ${emailContent.template === 'reminder' ? 'active' : ''}`}
                        onClick={() => handleTemplateChange('reminder')}
                    >
                        <i className="fas fa-bell"></i>
                        Przypomnienie
                    </button>
                    <button
                        className={`email-manager__template-button ${emailContent.template === 'thankYou' ? 'active' : ''}`}
                        onClick={() => handleTemplateChange('thankYou')}
                    >
                        <i className="fas fa-heart"></i>
                        Podziękowanie
                    </button>
                </div>
            </div>

            <div className="email-manager__form">
                <div className="email-manager__form-group">
                    <label htmlFor="emailSubject">Temat</label>
                    <input
                        type="text"
                        id="emailSubject"
                        value={emailContent.subject}
                        onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                        placeholder="Temat wiadomości"
                    />
                </div>

                <div className="email-manager__form-group">
                    <label htmlFor="emailMessage">Treść wiadomości</label>
                    <textarea
                        id="emailMessage"
                        value={emailContent.message}
                        onChange={(e) => setEmailContent({ ...emailContent, message: e.target.value })}
                        placeholder="Treść wiadomości"
                        rows={10}
                    />
                </div>

                <div className="email-manager__preview">
                    <h3>Podgląd</h3>
                    <div className="email-manager__preview-content">
                        <p><strong>Temat:</strong> {emailContent.subject}</p>
                        <p><strong>Odbiorcy:</strong> {guestCount} gości</p>
                        <div className="email-manager__preview-message">
                            {emailContent.message.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="email-manager__actions">
                    <button
                        className="email-manager__send-button"
                        onClick={handleSendEmails}
                        disabled={isSending}
                    >
                        {isSending ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Wysyłanie...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane"></i>
                                Wyślij do wszystkich gości
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailManager; 