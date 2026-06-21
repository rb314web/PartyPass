import React from 'react';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  Printer,
  Send,
  Smartphone,
} from 'lucide-react';
import { InvitationSendResult } from '../../../../types';
import { DeliveryMethod, SendPhase } from './invitationManagerUtils';

interface DeliveryPanelProps {
  method: DeliveryMethod;
  onMethodChange: (method: DeliveryMethod) => void;
  subject: string;
  onSubjectChange: (value: string) => void;
  message: string;
  onMessageChange: (value: string) => void;
  includeQr: boolean;
  onIncludeQrChange: (value: boolean) => void;
  phase: SendPhase;
  sendResult: InvitationSendResult | null;
  sendError: string | null;
  emailConfigured: boolean;
  emailSetupMessage: string;
  canSend: boolean;
  isReminder: boolean;
  selectedCount: number;
  emailCount: number;
  phoneCount: number;
  onSend: () => void;
}

const METHODS: {
  id: DeliveryMethod;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'email', label: 'E-mail', icon: <Mail size={16} /> },
  { id: 'sms', label: 'SMS', icon: <Smartphone size={16} /> },
  { id: 'print', label: 'Druk', icon: <Printer size={16} /> },
];

const DeliveryPanel: React.FC<DeliveryPanelProps> = ({
  method,
  onMethodChange,
  subject,
  onSubjectChange,
  message,
  onMessageChange,
  includeQr,
  onIncludeQrChange,
  phase,
  sendResult,
  sendError,
  emailConfigured,
  emailSetupMessage,
  canSend,
  isReminder,
  selectedCount,
  emailCount,
  phoneCount,
  onSend,
}) => {
  const summary =
    method === 'email'
      ? `${emailCount} z ${selectedCount} ma e-mail`
      : method === 'sms'
        ? `${phoneCount} z ${selectedCount} ma telefon`
        : `${selectedCount} do wydruku`;

  const sendLabel =
    phase === 'sending'
      ? 'Wysyłanie…'
      : phase === 'success'
        ? 'Gotowe'
        : phase === 'error'
          ? 'Błąd wysyłki'
          : isReminder
            ? 'Wyślij przypomnienia'
            : 'Wyślij zaproszenia';

  return (
    <aside className="inv-modal__panel inv-modal__panel--delivery">
      <h3 className="inv-modal__aside-title">Wysyłka</h3>

      <div className="inv-modal__methods" role="radiogroup" aria-label="Metoda wysyłki">
        {METHODS.map(item => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={method === item.id}
            className={`inv-modal__method${method === item.id ? ' is-active' : ''}`}
            onClick={() => onMethodChange(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {method === 'email' && !emailConfigured && (
        <p className="inv-modal__warn-box">
          EmailJS nie jest skonfigurowany lokalnie ({emailSetupMessage}). Wysyłka
          spróbuje funkcji Firebase sendInvitations — jeśli nie jest wdrożona,
          e-maile nie dojdą. Ustaw REACT_APP_EMAILJS_* w .env.local.
        </p>
      )}

      {method === 'email' && (
        <div className="inv-modal__form">
          <label className="inv-modal__field">
            <span>Temat</span>
            <input
              type="text"
              value={subject}
              onChange={e => onSubjectChange(e.target.value)}
            />
          </label>
          <label className="inv-modal__field">
            <span>Treść (opcjonalnie)</span>
            <textarea
              rows={3}
              value={message}
              onChange={e => onMessageChange(e.target.value)}
              placeholder="Wiadomość dla gości…"
            />
          </label>
          <label className="inv-modal__toggle">
            <input
              type="checkbox"
              checked={includeQr}
              onChange={e => onIncludeQrChange(e.target.checked)}
            />
            Dołącz kod QR w e-mailu
          </label>
        </div>
      )}

      {method === 'sms' && (
        <p className="inv-modal__hint">
          Otworzy się aplikacja SMS z treścią dla pierwszego gościa z numerem.
          Pozostałych wyślij osobno lub użyj e-maila.
        </p>
      )}

      {method === 'print' && (
        <p className="inv-modal__hint">
          Wygeneruje dokument z kodami QR do wydruku dla zaznaczonych gości.
        </p>
      )}

      {sendError && (
        <div className="inv-modal__feedback inv-modal__feedback--error">
          <p>{sendError}</p>
        </div>
      )}

      {sendResult && !sendError && (
        <div
          className={`inv-modal__feedback${
            sendResult.failed > 0 ? ' inv-modal__feedback--error' : ''
          }`}
        >
          <p>
            Wysłano {sendResult.sent}
            {sendResult.failed > 0 && ` · błędy ${sendResult.failed}`}
            {sendResult.skipped > 0 && ` · pominięto ${sendResult.skipped}`}
          </p>
        </div>
      )}

      <div className="inv-modal__aside-foot">
        <p className="inv-modal__summary">{summary}</p>
        <button
          type="button"
          className={`inv-modal__submit inv-modal__submit--${phase}`}
          disabled={!canSend}
          onClick={onSend}
        >
          {phase === 'sending' && <Loader2 size={18} className="inv-modal__spin" />}
          {phase === 'success' && <CheckCircle size={18} />}
          {phase === 'error' && <AlertCircle size={18} />}
          {phase === 'idle' && <Send size={18} />}
          {sendLabel}
        </button>
      </div>
    </aside>
  );
};

export default DeliveryPanel;
