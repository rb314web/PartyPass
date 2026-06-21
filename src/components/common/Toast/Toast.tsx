import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import './Toast.scss';

export type ToastType = 'error' | 'success';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  type?: ToastType;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 5000, type = 'error' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`toast toast--${type}`} role="status" aria-live="polite">
      <Icon size={20} className="toast__icon" />
      <p className="toast__message">{message}</p>
    </div>
  );
};

export default Toast;
