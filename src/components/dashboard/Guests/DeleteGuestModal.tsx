import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Guest } from '../../../types';
import Modal from '../../common/Modal/Modal';
import './DeleteGuestModal.scss';

interface DeleteGuestModalProps {
  open: boolean;
  guest: Guest | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteGuestModal: React.FC<DeleteGuestModalProps> = ({
  open,
  guest,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!guest) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Usuń gościa"
      size="sm"
      icon={<AlertTriangle size={24} />}
      iconVariant="danger"
      closeDisabled={isDeleting}
      footer={
        <>
          <button
            type="button"
            className="pp-btn pp-btn--outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Anuluj
          </button>
          <button
            type="button"
            className="pp-btn pp-btn--danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Usuwanie...' : 'Usuń gościa'}
          </button>
        </>
      }
    >
      <div className="delete-guest-list-modal__guest-info">
        <div className="delete-guest-list-modal__avatar">
          {guest.firstName[0]}
          {guest.lastName[0]}
        </div>
        <div className="delete-guest-list-modal__details">
          <div className="delete-guest-list-modal__name">
            {guest.firstName} {guest.lastName}
          </div>
          <div className="delete-guest-list-modal__email">{guest.email}</div>
        </div>
      </div>
      <p className="delete-guest-list-modal__message">
        Czy na pewno chcesz usunąć tego gościa?
        <strong> Ta akcja jest nieodwracalna.</strong>
      </p>
    </Modal>
  );
};

export default DeleteGuestModal;
