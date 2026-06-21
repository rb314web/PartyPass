import React, { useState, useEffect } from 'react';
import {
  Copy,
  Download,
  CheckCircle,
  Loader,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import { NewRSVPService } from '../../../../services/firebase/newRSVPService';
import { EventGuest, Contact, Event } from '../../../../types';
import Modal from '../../../common/Modal/Modal';
import './RSVPLinkModal.scss';

interface RSVPLinkModalProps {
  open: boolean;
  onClose: () => void;
  eventGuest: (EventGuest & { contact: Contact }) | null;
  event: Event | null;
}

const RSVPLinkModal: React.FC<RSVPLinkModalProps> = ({
  open,
  onClose,
  eventGuest,
  event,
}) => {
  const [rsvpUrl, setRsvpUrl] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRSVPLinkAndQR = async () => {
    if (!eventGuest || !event) return;

    setLoading(true);
    setError(null);

    try {
      const result = await NewRSVPService.getRSVPLinkAndQR(
        eventGuest.id,
        event.id
      );
      setRsvpUrl(result.rsvpUrl);
      setQrCode(result.qrCode);
    } catch (err: unknown) {
      console.error('Error loading RSVP link:', err);
      setError('Nie udało się wygenerować linku RSVP');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && eventGuest && event) {
      loadRSVPLinkAndQR();
    } else {
      setRsvpUrl('');
      setQrCode('');
      setError(null);
      setCopied(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventGuest, event]);

  const handleCopyLink = async () => {
    if (!rsvpUrl) return;

    try {
      await navigator.clipboard.writeText(rsvpUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Błąd podczas kopiowania linku:', err);
      const textArea = document.createElement('textarea');
      textArea.value = rsvpUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCode || !eventGuest) return;

    const link = document.createElement('a');
    link.download = `qr-rsvp-${eventGuest.contact.firstName}-${eventGuest.contact.lastName}.png`;
    link.href = qrCode;
    link.click();
  };

  if (!eventGuest || !event) return null;

  const guestName = `${eventGuest.contact.firstName} ${eventGuest.contact.lastName}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Link RSVP dla ${guestName}`}
      icon={<LinkIcon size={24} />}
      size="md"
      closeDisabled={loading}
    >
      {loading ? (
        <div className="rsvp-link-modal__loading">
          <Loader size={32} className="rsvp-link-modal__spinner" />
          <p>Generowanie linku RSVP i kodu QR...</p>
        </div>
      ) : error ? (
        <div className="rsvp-link-modal__error">
          <p>{error}</p>
          <button
            type="button"
            onClick={loadRSVPLinkAndQR}
            className="pp-btn pp-btn--outline rsvp-link-modal__retry-btn"
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : (
        <>
          <div className="rsvp-link-modal__link-section">
            <label className="pp-label">Link RSVP</label>
            <div className="rsvp-link-modal__link-container">
              <input
                type="text"
                value={rsvpUrl}
                readOnly
                className="pp-input rsvp-link-modal__link-input"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="pp-btn pp-btn--outline rsvp-link-modal__copy-btn"
                title="Kopiuj link"
              >
                {copied ? (
                  <>
                    <CheckCircle size={18} />
                    <span>Skopiowano!</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    <span>Kopiuj</span>
                  </>
                )}
              </button>
            </div>
            <p className="rsvp-link-modal__hint">
              Gość może użyć tego linku, aby potwierdzić lub odwołać swoją
              obecność
            </p>
            {rsvpUrl && (
              <a
                href={rsvpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pp-btn pp-btn--secondary rsvp-link-modal__preview-btn"
              >
                <ExternalLink size={18} />
                <span>Podgląd jako gość</span>
              </a>
            )}
          </div>

          {qrCode && (
            <div className="rsvp-link-modal__qr-section">
              <label className="pp-label">Kod QR</label>
              <div className="rsvp-link-modal__qr-container">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="rsvp-link-modal__qr-image"
                />
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="pp-btn pp-btn--outline rsvp-link-modal__download-btn"
                  title="Pobierz kod QR"
                >
                  <Download size={18} />
                  <span>Pobierz QR</span>
                </button>
              </div>
              <p className="rsvp-link-modal__hint">
                Gość może zeskanować ten kod QR, aby przejść do strony
                potwierdzenia
              </p>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default RSVPLinkModal;
