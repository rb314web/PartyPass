import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import './Toast.scss';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="toast">
      <AlertCircle size={20} className="toast__icon" />
      <p className="toast__message">{message}</p>
    </div>
  );
};

export default Toast;