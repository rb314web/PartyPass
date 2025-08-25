// App.tsx
import React from 'react';
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
import FloatingActionButton from './components/common/FloatingActionButton/FloatingActionButton';
import BottomNavigation from './components/common/BottomNavigation/BottomNavigation';
import ShortcutsHelp from './components/common/ShortcutsHelp/ShortcutsHelp';

function App() {
  return (
    <MaterialUIProvider>
      <ThemeProvider>
        <SnackbarProvider maxSnack={3}>
          <AuthProvider>
            <Router>
            <div className="App">
              <Routes>
                {/* Publiczne strony */}
                <Route path="/" element={<Landing />} />
                
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
              <ShortcutsHelp />
            </div>
          </Router>
        </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </MaterialUIProvider>
  );
}

export default App;