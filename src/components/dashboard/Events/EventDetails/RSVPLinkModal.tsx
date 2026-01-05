import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Download, CheckCircle, Loader, Link as LinkIcon } from 'lucide-react';
import { NewRSVPService } from '../../../../services/firebase/newRSVPService';
import { EventGuest, Contact, Event } from '../../../../types';
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
      // Fallback - wybierz tekst
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

  if (!open || !eventGuest || !event) return null;

  const guestName = `${eventGuest.contact.firstName} ${eventGuest.contact.lastName}`;

  const modalContent = (
    <div className="rsvp-link-modal__overlay" onClick={onClose}>
      <div className="rsvp-link-modal__container" onClick={(e) => e.stopPropagation()}>
        <div className="rsvp-link-modal__header">
          <div className="rsvp-link-modal__title">
            <LinkIcon size={24} />
            <h2>Link RSVP dla {guestName}</h2>
          </div>
          <button
            className="rsvp-link-modal__close"
            onClick={onClose}
            aria-label="Zamknij"
          >
            <X size={20} />
          </button>
        </div>

        <div className="rsvp-link-modal__content">
          {loading ? (
            <div className="rsvp-link-modal__loading">
              <Loader size={32} className="rsvp-link-modal__spinner" />
              <p>Generowanie linku RSVP i kodu QR...</p>
            </div>
          ) : error ? (
            <div className="rsvp-link-modal__error">
              <p>{error}</p>
              <button onClick={loadRSVPLinkAndQR} className="rsvp-link-modal__retry-btn">
                Spróbuj ponownie
              </button>
            </div>
          ) : (
            <>
              <div className="rsvp-link-modal__link-section">
                <label className="rsvp-link-modal__label">Link RSVP</label>
                <div className="rsvp-link-modal__link-container">
                  <input
                    type="text"
                    value={rsvpUrl}
                    readOnly
                    className="rsvp-link-modal__link-input"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="rsvp-link-modal__copy-btn"
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
                  Gość może użyć tego linku, aby potwierdzić lub odwołać swoją obecność
                </p>
              </div>

              {qrCode && (
                <div className="rsvp-link-modal__qr-section">
                  <label className="rsvp-link-modal__label">Kod QR</label>
                  <div className="rsvp-link-modal__qr-container">
                    <img src={qrCode} alt="QR Code" className="rsvp-link-modal__qr-image" />
                    <button
                      onClick={handleDownloadQR}
                      className="rsvp-link-modal__download-btn"
                      title="Pobierz kod QR"
                    >
                      <Download size={18} />
                      <span>Pobierz QR</span>
                    </button>
                  </div>
                  <p className="rsvp-link-modal__hint">
                    Gość może zeskanować ten kod QR, aby przejść do strony potwierdzenia
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RSVPLinkModal;

