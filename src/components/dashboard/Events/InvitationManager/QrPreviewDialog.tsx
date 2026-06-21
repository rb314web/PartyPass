import React from 'react';
import { Copy, Download, QrCode } from 'lucide-react';
import { GuestInvitation } from '../../../../types';
import Modal from '../../../common/Modal/Modal';

interface QrPreviewDialogProps {
  guest: GuestInvitation;
  onClose: () => void;
  onCopy: (url: string) => void;
  onDownload: (guest: GuestInvitation) => void;
}

const QrPreviewDialog: React.FC<QrPreviewDialogProps> = ({
  guest,
  onClose,
  onCopy,
  onDownload,
}) => (
  <Modal
    open
    onClose={onClose}
    title={`${guest.firstName} ${guest.lastName}`}
    icon={<QrCode size={20} />}
    size="sm"
    footer={
      <>
        <button
          type="button"
          className="pp-btn pp-btn--outline"
          onClick={() => onCopy(guest.rsvpUrl)}
        >
          <Copy size={16} />
          Kopiuj link
        </button>
        <button
          type="button"
          className="pp-btn pp-btn--primary"
          onClick={() => onDownload(guest)}
        >
          <Download size={16} />
          Pobierz QR
        </button>
      </>
    }
  >
    {guest.qrCode && (
      <img
        className="inv-modal__qr-image"
        src={guest.qrCode}
        alt={`Kod QR dla ${guest.firstName}`}
      />
    )}
    <p className="inv-modal__qr-url">{guest.rsvpUrl}</p>
  </Modal>
);

export default QrPreviewDialog;
