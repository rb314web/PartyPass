// App.tsx
import React, { useEffect, Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { useAccentColor } from './hooks/useAccentColor';
import { ThemeProvider } from './components/common/ThemeProvider/ThemeProvider';
import { MaterialUIProvider } from './components/common/MaterialUIProvider/MaterialUIProvider';
import { SnackbarProvider } from 'notistack';
import AuthGuard from './components/auth/AuthGuard/AuthGuard';
import FloatingActionButton from './components/common/FloatingActionButton/FloatingActionButton';
import BottomNavigation from './components/common/BottomNavigation/BottomNavigation';
import EmailService from './services/emailService';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner/LoadingSpinner';

// Lazy load components
const Landing = lazy(() => import('./pages/Landing/Landing'));
const Login = lazy(() => import('./components/auth/Login/Login'));
const Register = lazy(() => import('./components/auth/Register/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const DemoPage = lazy(() => import('./pages/Demo/Demo'));
const PaymentReturn = lazy(() => import('./pages/PaymentReturn/PaymentReturn'));
const RSVP = lazy(() => import('./pages/RSVP/RSVP'));

function AppContent() {
  // Załaduj zapisany kolor akcentu
  useAccentColor();

  useEffect(() => {
    // Initialize EmailJS
    EmailService.init();
  }, []);

  return (
    <ThemeProvider>
    <MaterialUIProvider>
        <SnackbarProvider maxSnack={3}>
          <AuthProvider>
            <Router>
              <div className="App">
                <Suspense
                  fallback={
                    <LoadingSpinner size="lg" text="Ładowanie strony..." />
                  }
                >
                  <Routes>
                    {' '}
                    {/* Publiczne strony */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/demo" element={<DemoPage />} />
                    <Route path="/rsvp/:token" element={<RSVP />} />
                    {/* Strony autoryzacji - tylko dla niezalogowanych */}
                    <Route
                      path="/login"
                      element={
                        <AuthGuard requireAuth={false}>
                          <Login />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <AuthGuard requireAuth={false}>
                          <Register />
                        </AuthGuard>
                      }
                    />
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
                    {/* Przekierowania */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>

                {/* Globalne komponenty nawigacji */}
                <FloatingActionButton />
                <BottomNavigation />
              </div>
            </Router>
          </AuthProvider>
        </SnackbarProvider>
      </MaterialUIProvider>
      </ThemeProvider>
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
