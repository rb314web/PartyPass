// App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './components/common/ThemeProvider/ThemeProvider';
import { MaterialUIProvider } from './components/common/MaterialUIProvider/MaterialUIProvider';
import { SnackbarProvider } from 'notistack';
import AuthGuard from './components/auth/AuthGuard/AuthGuard';
import Landing from './pages/Landing/Landing';
import Login from './components/auth/Login/Login';
import Register from './components/auth/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import DemoPage from './pages/Demo/Demo';
import PaymentReturn from './pages/PaymentReturn/PaymentReturn';
import RSVP from './pages/RSVP/RSVP';
import FloatingActionButton from './components/common/FloatingActionButton/FloatingActionButton';
import BottomNavigation from './components/common/BottomNavigation/BottomNavigation';
import EmailService from './services/emailService';

function App() {
  useEffect(() => {
    // Initialize EmailJS
    EmailService.init();
    
    // Log configuration status
    const emailStatus = EmailService.getConfigurationStatus();
    if (emailStatus.configured) {
      console.log('✅ EmailJS jest skonfigurowany i gotowy do użycia');
    } else {
      console.warn('⚠️ EmailJS nie jest skonfigurowany:', emailStatus.message);
      console.log('💡 Aby skonfigurować EmailJS, dodaj zmienne środowiskowe do pliku .env');
      console.log('📄 Zobacz plik .env.example dla instrukcji');
    }
  }, []);
  return (
    <MaterialUIProvider>
      <ThemeProvider>
        <SnackbarProvider maxSnack={3}>
          <AuthProvider>
            <Router>
            <div className="App">
              <Routes>                {/* Publiczne strony */}
                <Route path="/" element={<Landing />} />
                <Route path="/demo" element={<DemoPage />} />
                <Route path="/rsvp/:token" element={<RSVP />} />
                
                {/* Strony autoryzacji - tylko dla niezalogowanych */}
                <Route path="/login" element={
                  <AuthGuard requireAuth={false}>
                    <Login />
                  </AuthGuard>
                } />
                <Route path="/register" element={
                  <AuthGuard requireAuth={false}>
                    <Register />
                  </AuthGuard>
                } />
                  {/* Chronione strony - tylko dla zalogowanych */}
                <Route path="/payment/return" element={
                  <AuthGuard requireAuth={true}>
                    <PaymentReturn />
                  </AuthGuard>
                } />
                <Route path="/dashboard/*" element={
                  <AuthGuard requireAuth={true}>
                    <Dashboard />
                  </AuthGuard>
                } />
                
                {/* Przekierowania */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              
              {/* Globalne komponenty nawigacji */}
              <FloatingActionButton />
              <BottomNavigation />
            </div>
          </Router>
        </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </MaterialUIProvider>
  );
}

export default App;