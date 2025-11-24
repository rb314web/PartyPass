import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Contact } from '../../../types';
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
  if (!open || !contact) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter') {
      onConfirm();
    }
  };

  return (
    <div
      className="delete-contact-modal__overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="delete-contact-modal__container">
        <div className="delete-contact-modal__header">
          <div className="delete-contact-modal__icon">
            <AlertTriangle size={24} />
          </div>
          <button
            className="delete-contact-modal__close"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Zamknij"
          >
            <X size={20} />
          </button>
        </div>

        <div className="delete-contact-modal__content">
          <h2 className="delete-contact-modal__title">Usuń kontakt</h2>

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
        </div>

        <div className="delete-contact-modal__actions">
          <button
            className="delete-contact-modal__btn delete-contact-modal__btn--cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Anuluj
          </button>
          <button
            className="delete-contact-modal__btn delete-contact-modal__btn--danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="delete-contact-modal__spinner" />
                Usuwanie...
              </>
            ) : (
              'Usuń kontakt'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteContactModal;
