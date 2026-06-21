import React, { useEffect, useRef } from 'react';
import DemoShell from './DemoShell';

interface DemoProps {
  isOpen: boolean;
  onClose: () => void;
}

const Demo: React.FC<DemoProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    firstElement?.focus();
    modal.addEventListener('keydown', handleTab);

    return () => {
      modal.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  return (
    <DemoShell
      variant="modal"
      isOpen={isOpen}
      onClose={onClose}
      modalRef={modalRef}
    />
  );
};

export default Demo;
