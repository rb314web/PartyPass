import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Modal.scss';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  icon?: React.ReactNode;
  iconVariant?: 'default' | 'danger';
  closeOnBackdrop?: boolean;
  closeDisabled?: boolean;
  ariaLabel?: string;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  icon,
  iconVariant = 'default',
  closeOnBackdrop = true,
  closeDisabled = false,
  ariaLabel,
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !closeDisabled) {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, closeDisabled]);

  if (!open) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget && !closeDisabled) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="pp-modal__overlay"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={`pp-modal pp-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
      >
        {(title || icon) && (
          <div className="pp-modal__header">
            <div className="pp-modal__header-main">
              {icon && (
                <div
                  className={`pp-modal__icon${
                    iconVariant === 'danger' ? ' pp-modal__icon--danger' : ''
                  }`}
                >
                  {icon}
                </div>
              )}
              {title && <h2 className="pp-modal__title">{title}</h2>}
            </div>
            <button
              type="button"
              className="pp-modal__close"
              onClick={onClose}
              disabled={closeDisabled}
              aria-label="Zamknij"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="pp-modal__body">{children}</div>

        {footer && <div className="pp-modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
