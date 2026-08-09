// App.tsx
import React, { useEffect, Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { AuthProvider } from './hooks/useAuth';
import { LanguageProvider } from './hooks/useLanguage';
import { useAccentColor } from './hooks/useAccentColor';
import { ThemeProvider } from './components/common/ThemeProvider/ThemeProvider';
import AuthGuard from './components/auth/AuthGuard/AuthGuard';
import AuthShell from './components/auth/ui/AuthShell';
import BottomNavigation from './components/common/BottomNavigation/BottomNavigation';
import { setupGlobalErrorHandlers } from './utils/errorUtils';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner/LoadingSpinner';
import ScrollToTop from './components/common/ScrollToTop/ScrollToTop';
import LanguageContentTransition from './components/common/LanguageContentTransition/LanguageContentTransition';
import AnalyticsListener from './components/common/AnalyticsListener/AnalyticsListener';
import CookieConsent from './components/common/CookieConsent/CookieConsent';

// Import accessibility styles
import './styles/accessibility.scss';

// Lazy load components
const Landing = lazy(() => import('./pages/Landing/Landing'));
const Login = lazy(() => import('./components/auth/Login/Login'));
const Register = lazy(() => import('./components/auth/Register/Register'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword/ForgotPassword'));
const Terms = lazy(() => import('./pages/Legal/Terms'));
const Privacy = lazy(() => import('./pages/Legal/Privacy'));
const Rodo = lazy(() => import('./pages/Legal/Rodo'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const PaymentReturn = lazy(() => import('./pages/PaymentReturn/PaymentReturn'));
const RSVP = lazy(() => import('./pages/RSVP/RSVP'));
const Debug = lazy(() => import('./pages/Debug/Debug'));

function AppContent() {
  // Załaduj zapisany kolor akcentu
  useAccentColor();

  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
            <Router>
              <AnalyticsListener />
              <CookieConsent />
              <ScrollToTop />
              <LanguageContentTransition>
              <div className="App">
                <Suspense
                  fallback={
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--bg-primary)',
                      zIndex: 9999
                    }}>
                      <LoadingSpinner size="lg" />
                    </div>
                  }
                >
                  <Routes>
                    {' '}
                    {/* Publiczne strony */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/rsvp/:token" element={<RSVP />} />
                    {/* Strony autoryzacji - tylko dla niezalogowanych */}
                    <Route
                      element={
                        <AuthGuard requireAuth={false}>
                          <AuthShell />
                        </AuthGuard>
                      }
                    >
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                    </Route>
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/rodo" element={<Rodo />} />
                    {/* Chronione strony - tylko dla zalogowanych */}
                    <Route
                      path="/payment/return"
                      element={
                        <AuthGuard requireAuth={true}>
                          <PaymentReturn />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/dashboard/*"
                      element={
                        <AuthGuard requireAuth={true}>
                          <Dashboard />
                        </AuthGuard>
                      }
                    />
                    {/* Debug Tools — tylko w trybie deweloperskim */}
                    {process.env.NODE_ENV === 'development' && (
                      <Route
                        path="/debug"
                        element={
                          <AuthGuard requireAuth={true}>
                            <Debug />
                          </AuthGuard>
                        }
                      />
                    )}
                    {/* Przekierowania */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>

                <BottomNavigation />
              </div>
              </LanguageContentTransition>
            </Router>
            </LanguageProvider>
          </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
