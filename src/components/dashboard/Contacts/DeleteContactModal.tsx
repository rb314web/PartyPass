import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Contact } from '../../../types';
import Modal from '../../common/Modal/Modal';
import './DeleteContactModal.scss';

interface DeleteContactModalProps {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteContactModal: React.FC<DeleteContactModalProps> = ({
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
      title="Usuń kontakt"
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
            {isDeleting ? 'Usuwanie...' : 'Usuń kontakt'}
          </button>
        </>
      }
    >
      <div className="delete-contact-modal__contact-info">
        <div className="delete-contact-modal__avatar">
          {contact.firstName[0]}
          {contact.lastName[0]}
        </div>
        <div className="delete-contact-modal__details">
          <div className="delete-contact-modal__name">
            {contact.firstName} {contact.lastName}
          </div>
          <div className="delete-contact-modal__email">{contact.email}</div>
        </div>
      </div>
      <p className="delete-contact-modal__message">
        Czy na pewno chcesz usunąć ten kontakt?
        <strong> Ta akcja jest nieodwracalna.</strong>
      </p>
    </Modal>
  );
};

export default DeleteContactModal;
