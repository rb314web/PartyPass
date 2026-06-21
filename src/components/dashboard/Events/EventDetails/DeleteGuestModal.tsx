import React from 'react';
import { AlertTriangle, UserX } from 'lucide-react';
import { Contact } from '../../../../types';
import Modal from '../../../common/Modal/Modal';
import './DeleteGuestModal.scss';

interface DeleteGuestModalProps {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteGuestModal: React.FC<DeleteGuestModalProps> = ({
  open,
  contact,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!contact) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Usuń gościa z wydarzenia"
      size="sm"
      icon={<UserX size={24} />}
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
      <div className="delete-guest-modal__contact-info">
        <div className="delete-guest-modal__avatar">
          {contact.firstName?.[0] || ''}
          {contact.lastName?.[0] || ''}
        </div>
        <div className="delete-guest-modal__details">
          <div className="delete-guest-modal__name">
            {contact.firstName} {contact.lastName}
          </div>
          {contact.email && (
            <div className="delete-guest-modal__email">{contact.email}</div>
          )}
        </div>
      </div>
      <div className="delete-guest-modal__warning">
        <AlertTriangle size={20} />
        <p className="delete-guest-modal__message">
          Czy na pewno chcesz usunąć tego gościa z wydarzenia?
          <strong> Ta akcja jest nieodwracalna.</strong>
        </p>
      </div>
    </Modal>
  );
};

export default DeleteGuestModal;
