import { useCallback } from 'react';
import { useSnackbar } from 'notistack';

export interface AppError {
  message: string;
  code?: string | number;
  details?: any;
}

export const useErrorHandler = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleError = useCallback((error: any, context?: string) => {

    let errorMessage = 'Wystąpił nieoczekiwany błąd';
    let errorCode: string | number | undefined;

    // Handle different error types
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
      errorCode = error.code;
    } else if (error?.error?.message) {
      // Firebase error
      errorMessage = error.error.message;
      errorCode = error.error.code;
    }

    // Handle specific error codes
    if (errorCode === 'permission-denied') {
      errorMessage = 'Brak uprawnień do wykonania tej operacji';
    } else if (errorCode === 'not-found') {
      errorMessage = 'Nie znaleziono żądanego zasobu';
    } else if (errorCode === 'network-request-failed') {
      errorMessage = 'Problem z połączeniem internetowym. Sprawdź połączenie i spróbuj ponownie.';
    } else if (errorCode === 'too-many-requests') {
      errorMessage = 'Zbyt wiele prób. Spróbuj ponownie za chwilę.';
    } else if (errorCode === 'auth/network-request-failed') {
      errorMessage = 'Problem z połączeniem. Sprawdź połączenie internetowe.';
    }

    // Show error notification
    enqueueSnackbar(errorMessage, {
      variant: 'error',
      autoHideDuration: 6000,
      action: (key) => (
        <button
          onClick={() => closeSnackbar(key)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            marginLeft: '8px'
          }}
        >
          ✕
        </button>
      ),
    });

    // Return normalized error for further handling
    return {
      message: errorMessage,
      code: errorCode,
      originalError: error,
    } as AppError;
  }, [enqueueSnackbar]);

  const handleSuccess = useCallback((message: string, options?: { autoHideDuration?: number }) => {
    enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: options?.autoHideDuration ?? 4000,
    });
  }, [enqueueSnackbar]);

  const handleWarning = useCallback((message: string) => {
    enqueueSnackbar(message, {
      variant: 'warning',
      autoHideDuration: 5000,
    });
  }, [enqueueSnackbar]);

  return {
    handleError,
    handleSuccess,
    handleWarning,
  };
};
