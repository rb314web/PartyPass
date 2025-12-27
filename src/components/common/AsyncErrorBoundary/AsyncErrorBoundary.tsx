import React, { useState, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface AsyncErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error) => void;
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  fallback: Fallback,
  onError,
}) => {
  const [error, setError] = useState<Error | null>(null);

  const handleRetry = useCallback(() => {
    setError(null);
  }, []);

  const handleAsyncError = useCallback((error: Error) => {
    setError(error);

    // Call optional error handler
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Wrap children with error boundary for async operations
  const wrappedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Add error handler to child props if it's a component that might throw async errors
      return React.cloneElement(child, {
        onAsyncError: handleAsyncError,
        ...(child.props as any),
      });
    }
    return child;
  });

  if (error) {
    if (Fallback) {
      return <Fallback error={error} retry={handleRetry} />;
    }

    return <DefaultAsyncErrorFallback error={error} onRetry={handleRetry} />;
  }

  return <>{wrappedChildren}</>;
};

interface DefaultAsyncErrorFallbackProps {
  error: Error;
  onRetry: () => void;
}

const DefaultAsyncErrorFallback: React.FC<DefaultAsyncErrorFallbackProps> = ({
  error,
  onRetry,
}) => {
  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="async-error-boundary">
      <div className="async-error-boundary__container">
        <div className="async-error-boundary__icon">
          <AlertTriangle size={48} />
        </div>

        <h2 className="async-error-boundary__title">Operacja nie powiodła się</h2>

        <p className="async-error-boundary__message">
          {error.message || 'Wystąpił błąd podczas wykonywania operacji.'}
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="async-error-boundary__details">
            <summary>Szczegóły techniczne (tylko w trybie deweloperskim)</summary>
            <pre className="async-error-boundary__error">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="async-error-boundary__actions">
          <button
            className="async-error-boundary__button async-error-boundary__button--primary"
            onClick={onRetry}
          >
            <RefreshCw size={18} />
            Spróbuj ponownie
          </button>

          <button
            className="async-error-boundary__button async-error-boundary__button--secondary"
            onClick={handleGoHome}
          >
            <Home size={18} />
            Wróć do strony głównej
          </button>
        </div>
      </div>
    </div>
  );
};
