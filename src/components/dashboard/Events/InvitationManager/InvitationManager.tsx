// components/dashboard/Events/InvitationManager/InvitationManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Printer,
  Download,
  Send,
  Copy,
  CheckCircle,
  AlertCircle,
  Users,
  Eye,
  X,
  Smartphone,
} from 'lucide-react';
import RSVPService from '../../../../services/firebase/rsvpService';
import { NewRSVPService } from '../../../../services/firebase/newRSVPService';
import { Event, GuestInvitation, InvitationDelivery } from '../../../../types';
import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner';
import './InvitationManager.scss';

interface InvitationManagerProps {
  event: Event;
  onClose: () => void;
}

const InvitationManager: React.FC<InvitationManagerProps> = ({
  event,
  onClose,
}) => {
  const [invitations, setInvitations] = useState<GuestInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<
    'email' | 'sms' | 'print'
  >('email');
  const [emailSubject, setEmailSubject] = useState(
    `Zaproszenie na ${event.title}`
  );
  const [emailMessage, setEmailMessage] = useState('');
  const [includeQR, setIncludeQR] = useState(true);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [sendingStatus, setSendingStatus] = useState<
    'idle' | 'sending' | 'success' | 'error'
  >('idle');

  const generateInvitations = useCallback(async () => {
    try {
      setLoading(true);
      const generatedInvitations =
        await NewRSVPService.generateInvitationsForEvent(event.id);
      setInvitations(generatedInvitations);
      setSelectedGuests(generatedInvitations.map(inv => inv.eventGuestId));
    } catch (error) {
      console.error('Błąd podczas generowania zaproszeń:', error);
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    generateInvitations();
  }, [event.id, generateInvitations]);

  const handleSelectAll = () => {
    if (selectedGuests.length === invitations.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(invitations.map(inv => inv.eventGuestId));
    }
  };

  const handleGuestSelect = (eventGuestId: string) => {
    if (selectedGuests.includes(eventGuestId)) {
      setSelectedGuests(prev => prev.filter(id => id !== eventGuestId));
    } else {
      setSelectedGuests(prev => [...prev, eventGuestId]);
    }
  };

  const handleSendInvitations = async () => {
    try {
      setSendingStatus('sending');

      const selectedInvitations = invitations.filter(inv =>
        selectedGuests.includes(inv.eventGuestId)
      );
      const delivery: InvitationDelivery = {
        method: deliveryMethod,
        recipients: selectedInvitations.map(inv => inv.email),
        subject: emailSubject,
        message: emailMessage,
        includeQR,
      };

      switch (deliveryMethod) {
        case 'email':
          await RSVPService.sendEmailInvitations(
            selectedInvitations,
            event,
            delivery
          );
          break;
        case 'sms':
          await handleSMSInvitations(selectedInvitations);
          break;
        case 'print':
          await handlePrintInvitations(selectedInvitations);
          break;
      }

      setSendingStatus('success');
      setTimeout(() => setSendingStatus('idle'), 3000);
    } catch (error) {
      console.error('Błąd podczas wysyłania zaproszeń:', error);
      setSendingStatus('error');
      setTimeout(() => setSendingStatus('idle'), 3000);
    }
  };

  const handleSMSInvitations = async (
    selectedInvitations: GuestInvitation[]
  ) => {
    // Generuj linki SMS dla każdego gościa
    const smsLinks = selectedInvitations.map(invitation => {
      const message = RSVPService.generateSMSMessage(invitation, event);
      const encodedMessage = encodeURIComponent(message);
      return `sms:?body=${encodedMessage}`;
    });

    // Otwórz każdy link SMS (ograniczenie przeglądarek - tylko jeden na raz)
    if (smsLinks.length > 0) {
      window.open(smsLinks[0], '_blank');
    }
  };

  const handlePrintInvitations = async (
    selectedInvitations: GuestInvitation[]
  ) => {
    const printContent = generatePrintContent(selectedInvitations);
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintContent = (
    selectedInvitations: GuestInvitation[]
  ): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Zaproszenia - ${event.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .invitation { page-break-after: always; margin-bottom: 40px; padding: 20px; border: 2px solid #ddd; }
        .invitation:last-child { page-break-after: auto; }
        .header { text-align: center; margin-bottom: 20px; }
        .qr-code { text-align: center; margin: 20px 0; }
        .qr-code img { width: 150px; height: 150px; }
        .details { margin: 15px 0; }
        .guest-name { font-size: 1.2em; font-weight: bold; margin-bottom: 10px; }
        @media print {
            body { margin: 0; }
            .invitation { margin: 0; padding: 15px; }
        }
    </style>
</head>
<body>
    ${selectedInvitations
      .map(
        invitation => `
        <div class="invitation">
            <div class="header">
                <h1>${event.title}</h1>
                <p><strong>Data:</strong> ${event.date.toLocaleDateString('pl-PL')}</p>
                <p><strong>Miejsce:</strong> ${event.location}</p>
            </div>
            
            <div class="guest-name">
                Dla: ${invitation.firstName} ${invitation.lastName}
            </div>
            
            <div class="details">
                <p>${event.description}</p>
                ${event.dresscode ? `<p><strong>Dress code:</strong> ${event.dresscode}</p>` : ''}
                ${event.additionalInfo ? `<p><strong>Dodatkowe informacje:</strong> ${event.additionalInfo}</p>` : ''}
            </div>
            
            <div class="qr-code">
                <p><strong>Zeskanuj kod QR aby potwierdzić obecność:</strong></p>
                <img src="${invitation.qrCode}" alt="QR Code" />
                <p><small>${invitation.rsvpUrl}</small></p>
            </div>
        </div>
    `
      )
      .join('')}
</body>
</html>
    `;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Błąd podczas kopiowania do schowka:', error);
    }
  };

  const downloadQRCode = (invitation: GuestInvitation) => {
    const link = document.createElement('a');
    link.download = `qr-${invitation.firstName}-${invitation.lastName}.png`;
    link.href = invitation.qrCode!;
    link.click();
  };

  if (loading) {
    return (
      <div className="invitation-manager invitation-manager--loading">
        <LoadingSpinner
          variant="full"
          icon={Mail}
          title="Generowanie zaproszeń"
          subtitle="Proszę czekać..."
        />
      </div>
    );
  }

  return (
    <div className="invitation-manager" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="invitation-manager__content">
        <div className="invitation-manager__header">
          <div className="invitation-manager__title">
            <h2>Zarządzanie zaproszeniami</h2>
            <p>
              {event.title} • {invitations.length} gości
            </p>
          </div>
          <button className="invitation-manager__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {/* Lista gości */}
        <div className="invitation-manager__guests">
          <div className="invitation-manager__guests-header">
            <h3>
              <Users size={20} />
              Lista gości ({selectedGuests.length}/{invitations.length})
            </h3>
            <button
              className="invitation-manager__select-all"
              onClick={handleSelectAll}
            >
              {selectedGuests.length === invitations.length
                ? 'Odznacz wszystkich'
                : 'Zaznacz wszystkich'}
            </button>
          </div>

          <div className="invitation-manager__guests-list">
            {invitations.map(invitation => (
              <div
                key={invitation.eventGuestId}
                className={`invitation-manager__guest ${
                  selectedGuests.includes(invitation.eventGuestId)
                    ? 'selected'
                    : ''
                }`}
              >
                <label className="invitation-manager__guest-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedGuests.includes(invitation.eventGuestId)}
                    onChange={() => handleGuestSelect(invitation.eventGuestId)}
                  />
                  <span className="invitation-manager__guest-name">
                    {invitation.firstName} {invitation.lastName}
                  </span>
                  <span className="invitation-manager__guest-email">
                    {invitation.email}
                  </span>
                </label>

                <div className="invitation-manager__guest-actions">
                  <button
                    className="invitation-manager__action-btn"
                    onClick={() => setShowPreview(invitation.rsvpToken)}
                    title="Podgląd QR"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="invitation-manager__action-btn"
                    onClick={() => copyToClipboard(invitation.rsvpUrl)}
                    title="Kopiuj link"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    className="invitation-manager__action-btn"
                    onClick={() => downloadQRCode(invitation)}
                    title="Pobierz QR"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opcje wysyłania */}
        <div className="invitation-manager__delivery">
          <h3>Metoda wysyłania</h3>

          <div className="invitation-manager__delivery-methods">
            <label
              className={`invitation-manager__method ${deliveryMethod === 'email' ? 'active' : ''}`}
            >
              <input
                type="radio"
                value="email"
                checked={deliveryMethod === 'email'}
                onChange={e => setDeliveryMethod(e.target.value as 'email')}
              />
              <Mail size={20} />
              <span>E-mail</span>
            </label>

            <label
              className={`invitation-manager__method ${deliveryMethod === 'sms' ? 'active' : ''}`}
            >
              <input
                type="radio"
                value="sms"
                checked={deliveryMethod === 'sms'}
                onChange={e => setDeliveryMethod(e.target.value as 'sms')}
              />
              <Smartphone size={20} />
              <span>SMS</span>
            </label>

            <label
              className={`invitation-manager__method ${deliveryMethod === 'print' ? 'active' : ''}`}
            >
              <input
                type="radio"
                value="print"
                checked={deliveryMethod === 'print'}
                onChange={e => setDeliveryMethod(e.target.value as 'print')}
              />
              <Printer size={20} />
              <span>Drukuj</span>
            </label>
          </div>

          {deliveryMethod === 'email' && (
            <div className="invitation-manager__email-options">
              <div className="invitation-manager__field">
                <label>Temat wiadomości:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Temat e-maila"
                />
              </div>

              <div className="invitation-manager__field">
                <label>Treść wiadomości:</label>
                <textarea
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                  placeholder="Dodatkowa treść wiadomości (opcjonalna)"
                  rows={4}
                />
              </div>

              <label className="invitation-manager__checkbox">
                <input
                  type="checkbox"
                  checked={includeQR}
                  onChange={e => setIncludeQR(e.target.checked)}
                />
                <span>Dołącz kod QR</span>
              </label>
            </div>
          )}

          <div className="invitation-manager__send-section">
            <div className="invitation-manager__send-info">
              <p>
                Wyślij zaproszenia do {selectedGuests.length} wybranych gości
              </p>
            </div>

            <button
              className={`invitation-manager__send-btn ${sendingStatus}`}
              onClick={handleSendInvitations}
              disabled={
                selectedGuests.length === 0 || sendingStatus === 'sending'
              }
            >
              {sendingStatus === 'sending' && <div className="spinner small" />}
              {sendingStatus === 'success' && <CheckCircle size={20} />}
              {sendingStatus === 'error' && <AlertCircle size={20} />}
              {sendingStatus === 'idle' && <Send size={20} />}

              <span>
                {sendingStatus === 'sending' && 'Wysyłanie...'}
                {sendingStatus === 'success' && 'Wysłano!'}
                {sendingStatus === 'error' && 'Błąd wysyłania'}
                {sendingStatus === 'idle' && 'Wyślij zaproszenia'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Podgląd QR Code */}
      {showPreview && (
        <div className="invitation-manager__preview-overlay">
          <div className="invitation-manager__preview">
            <div className="invitation-manager__preview-header">
              <h3>Kod QR</h3>
              <button onClick={() => setShowPreview(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="invitation-manager__preview-content">
              {(() => {
                const invitation = invitations.find(
                  inv => inv.rsvpToken === showPreview
                );
                return invitation ? (
                  <>
                    <img src={invitation.qrCode} alt="QR Code" />
                    <p>
                      <strong>
                        {invitation.firstName} {invitation.lastName}
                      </strong>
                    </p>
                    <p className="invitation-manager__preview-url">
                      {invitation.rsvpUrl}
                    </p>
                    <div className="invitation-manager__preview-actions">
                      <button
                        onClick={() => copyToClipboard(invitation.rsvpUrl)}
                      >
                        <Copy size={16} />
                        Kopiuj link
                      </button>
                      <button onClick={() => downloadQRCode(invitation)}>
                        <Download size={16} />
                        Pobierz QR
                      </button>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationManager;
