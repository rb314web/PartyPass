import { AppError } from '../hooks/useErrorHandler';

// Global error handler for unhandled errors
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {

    // Prevent the default browser behavior (logging to console)
    event.preventDefault();

    // Log to error tracking service
    logErrorToService({
      message: 'Unhandled promise rejection',
      code: 'UNHANDLED_REJECTION',
      details: event.reason,
    });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {

    // Log to error tracking service
    logErrorToService({
      message: event.message,
      code: 'UNCAUGHT_ERROR',
      details: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      },
    });
  });

  // Handle service worker errors
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'ERROR') {
        logErrorToService({
          message: 'Service Worker Error',
          code: 'SERVICE_WORKER_ERROR',
          details: event.data.error,
        });
      }
    });
  }
};

// Error logging utility
export const logErrorToService = (error: AppError) => {
  // In production, this would send to error tracking service like Sentry
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error);
  } else {
  }
};

// Utility to create user-friendly error messages
export const getUserFriendlyErrorMessage = (error: any): string => {
  if (!error) return 'Wystąpił nieznany błąd';

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
    return 'Problem z połączeniem internetowym. Sprawdź połączenie i spróbuj ponownie.';
  }

  // Authentication errors
  if (error.code === 'auth/user-not-found') {
    return 'Nie znaleziono użytkownika o podanych danych.';
  }
  if (error.code === 'auth/wrong-password') {
    return 'Nieprawidłowe hasło.';
  }
  if (error.code === 'auth/email-already-in-use') {
    return 'Ten adres email jest już używany.';
  }
  if (error.code === 'auth/weak-password') {
    return 'Hasło jest zbyt słabe. Użyj przynajmniej 6 znaków.';
  }

  // Permission errors
  if (error.code === 'permission-denied') {
    return 'Brak uprawnień do wykonania tej operacji.';
  }

  // Not found errors
  if (error.code === 'not-found') {
    return 'Nie znaleziono żądanego zasobu.';
  }

  // Rate limiting
  if (error.code === 'resource-exhausted') {
    return 'Zbyt wiele prób. Spróbuj ponownie za chwilę.';
  }

  // Firebase specific errors
  if (error.code === 'cancelled') {
    return 'Operacja została anulowana.';
  }
  if (error.code === 'unknown') {
    return 'Wystąpił nieznany błąd serwera.';
  }
  if (error.code === 'invalid-argument') {
    return 'Podano nieprawidłowe dane.';
  }
  if (error.code === 'deadline-exceeded') {
    return 'Upłynął limit czasu operacji.';
  }
  if (error.code === 'already-exists') {
    return 'Ten zasób już istnieje.';
  }

  // Generic fallback
  return error.message || 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
};

// Utility to determine if error is retryable
export const isRetryableError = (error: any): boolean => {
  const retryableCodes = [
    'network-request-failed',
    'deadline-exceeded',
    'unavailable',
    'cancelled',
    'resource-exhausted',
  ];

  return retryableCodes.includes(error.code) ||
         error.message?.toLowerCase().includes('network') ||
         error.message?.toLowerCase().includes('timeout');
};

// Retry utility with exponential backoff
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
