import { useCallback, useState } from 'react';
import type { ToastType } from '../components/common/Toast/Toast';

interface ToastState {
  message: string;
  type: ToastType;
}

export function useToast(defaultDuration = 5000) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const dismiss = useCallback(() => setToast(null), []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'error') => {
      setToast({ message, type });
    },
    []
  );

  const showError = useCallback(
    (message: string) => showToast(message, 'error'),
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string) => showToast(message, 'success'),
    [showToast]
  );

  return {
    toast,
    dismiss,
    showToast,
    showError,
    showSuccess,
    duration: defaultDuration,
  };
}
