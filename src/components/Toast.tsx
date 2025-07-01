import React, { useEffect, useRef, useState } from 'react';
import '../assets/style/Toast.scss';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const Toast: React.FC<ToastProps> = ({ 
    message, 
    type, 
    onClose, 
    duration = 3000,
    position = 'top-right'
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        console.log("Toast component rendered/updated. Message:", message, "Type:", type, "IsVisible:", isVisible);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
            closeTimeoutRef.current = setTimeout(onClose, 300);
        }, duration);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, [duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        closeTimeoutRef.current = setTimeout(onClose, 300);
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <i className="fas fa-check-circle"></i>;
            case 'error':
                return <i className="fas fa-exclamation-circle"></i>;
            case 'warning':
                return <i className="fas fa-exclamation-triangle"></i>;
            case 'info':
                return <i className="fas fa-info-circle"></i>;
            default:
                return null;
        }
    };

    return (
        <div 
            className={`toast toast--${type} ${isVisible ? 'toast--visible' : 'toast--hidden'} toast--${position}`}
            role="alert"
            aria-live="assertive"
        >
            <div className="toast__icon">
                {getIcon()}
            </div>
            <div className="toast__message">{message}</div>
            <button 
                className="toast__close" 
                onClick={handleClose}
                aria-label="Zamknij powiadomienie"
            >
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
};

export default Toast; 