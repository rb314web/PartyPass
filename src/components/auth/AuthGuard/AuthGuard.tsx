// components/auth/AuthGuard/AuthGuard.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-guard-loading">
        <div className="auth-guard-spinner"></div>
        <p>Ładowanie...</p>
      </div>
    );
  }

  if (requireAuth && !user) {
    // Zapisz aktualną lokalizację do przekierowania po logowaniu
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && user) {
    // Jeśli użytkownik jest zalogowany i próbuje dostać się do strony logowania
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;