// components/common/ErrorBoundary/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ErrorBoundary.scss';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// Default Error Fallback Component
interface FallbackProps {
  error: Error | null;
  onReset: () => void;
}

const DefaultErrorFallback: React.FC<FallbackProps> = ({ error, onReset }) => {
  const navigate = useNavigate;

  const handleGoHome = () => {
    onReset();
    window.location.href = '/dashboard';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="error-boundary">
      <div className="error-boundary__container">
        <div className="error-boundary__icon">
          <AlertTriangle size={64} />
        </div>
        
        <h1 className="error-boundary__title">Ups! Coś poszło nie tak</h1>
        
        <p className="error-boundary__message">
          Napotkaliśmy nieoczekiwany problem. Nie martw się, Twoje dane są bezpieczne.
        </p>

        {error && process.env.NODE_ENV === 'development' && (
          <details className="error-boundary__details">
            <summary>Szczegóły techniczne</summary>
            <pre className="error-boundary__error">
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="error-boundary__actions">
          <button
            className="error-boundary__button error-boundary__button--primary"
            onClick={handleReload}
          >
            <RefreshCw size={18} />
            Odśwież stronę
          </button>
          
          <button
            className="error-boundary__button error-boundary__button--secondary"
            onClick={handleGoHome}
          >
            <Home size={18} />
            Wróć do strony głównej
          </button>
        </div>

        <p className="error-boundary__help">
          Jeśli problem się powtarza, skontaktuj się z nami: <a href="mailto:support@partypass.pl">support@partypass.pl</a>
        </p>
      </div>
    </div>
  );
};

export default ErrorBoundary;
