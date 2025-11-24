import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X, UserX } from 'lucide-react';
import { Contact } from '../../../../types';
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
    if (e.key === 'Enter' && !isDeleting) {
      onConfirm();
    }
  };

  const modalContent = (
    <div
      className="delete-guest-modal__overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="delete-guest-modal__container">
        <div className="delete-guest-modal__header">
          <div className="delete-guest-modal__icon">
            <UserX size={24} />
          </div>
          <button
            className="delete-guest-modal__close"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Zamknij"
          >
            <X size={20} />
          </button>
        </div>

        <div className="delete-guest-modal__content">
          <h2 className="delete-guest-modal__title">Usuń gościa z wydarzenia</h2>

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
        </div>

        <div className="delete-guest-modal__actions">
          <button
            className="delete-guest-modal__btn delete-guest-modal__btn--cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Anuluj
          </button>
          <button
            className="delete-guest-modal__btn delete-guest-modal__btn--danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="delete-guest-modal__spinner" />
                Usuwanie...
              </>
            ) : (
              <>
                <UserX size={16} />
                Usuń gościa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DeleteGuestModal;

