import React from 'react';
import { AlertTriangle, Calendar } from 'lucide-react';
import { Event } from '../../../../types';
import Modal from '../../../common/Modal/Modal';
import './DeleteEventModal.scss';

interface DeleteEventModalProps {
  open: boolean;
  event: Event | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
  open,
  event,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!event) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Usuń wydarzenie"
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
            {isDeleting ? 'Usuwanie...' : 'Usuń wydarzenie'}
          </button>
        </>
      }
    >
      <div className="delete-event-modal__event-info">
        <div className="delete-event-modal__icon">
          <Calendar size={24} />
        </div>
        <div className="delete-event-modal__details">
          <div className="delete-event-modal__title">{event.title}</div>
          <div className="delete-event-modal__date">
            {new Date(event.date).toLocaleDateString('pl-PL', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>
      </div>
      <p className="delete-event-modal__message">
        Czy na pewno chcesz usunąć to wydarzenie?
        <strong> Ta operacja jest nieodwracalna.</strong>
      </p>
    </Modal>
  );
};

export default DeleteEventModal;
