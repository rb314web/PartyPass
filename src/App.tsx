import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import ServiceDescription from './components/ServiceDescription';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import { Dashboard } from './components/Dashboard';
import ResetPassword from './components/ResetPassword';
import RegistrationSuccess from './components/RegistrationSuccess';
import GuestConfirmation from './components/GuestConfirmation';
import Purchase from './components/Purchase';
import PaymentSuccess from './components/PaymentSuccess';
import PrivateRoute from './components/PrivateRoute';
import Demo from './components/Demo';
import UserSettings from './components/UserSettings';
import Spinner from './components/Spinner';
import './assets/style/App.scss';

const ScrollHandler: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.state?.scrollToTop) {
            window.scrollTo(0, 0);
        }
    }, [location]);

    return null;
};

const PurchaseRoute: React.FC = () => {
    const location = useLocation();
    const selectedPlan = location.state?.selectedPlan;

    if (!selectedPlan) {
        return <Navigate to="/#pricing" replace />;
    }

    return (
        <PrivateRoute>
            <Purchase selectedPlan={selectedPlan} />
        </PrivateRoute>
    );
};

const AppContent = () => {
    const { loading } = useAuth();
    const location = useLocation();

    // Check if current location is a route that might not need the full-screen spinner
    const isSpecialRoute = location.pathname.startsWith('/guest/') ||
                           location.pathname.startsWith('/event/') ||
                           location.pathname === '/login' ||
                           location.pathname === '/register' ||
                           location.pathname === '/reset-password' ||
                           location.pathname === '/registration-success' ||
                           location.pathname === '/payment-success' ||
                           location.pathname === '/pricing' ||
                           location.pathname === '/purchase' ||
                           location.pathname === '/service-description' ||
                           location.pathname === '/demo';

    if (loading && !isSpecialRoute) {
        return <Spinner />;
    }

    return (
                            <Routes>
                                <Route path="/" element={
                                    <>
                                        <Navigation />
                                        <Hero />
                                        <ServiceDescription />
                                        <Pricing />
                                        <Testimonials />
                                        <ContactForm />
                                        <Footer />
                                    </>
                                } />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/registration-success" element={<RegistrationSuccess />} />
                                <Route path="/confirm/:id/:email" element={<GuestConfirmation />} />
                                <Route path="/guest/:id" element={<GuestConfirmation />} />
                                <Route path="/purchase" element={<PurchaseRoute />} />
                                <Route path="/payment/success" element={<PaymentSuccess />} />
                                <Route
                                    path="/dashboard/*"
                                    element={
                                        <PrivateRoute>
                                            <Dashboard />
                                        </PrivateRoute>
                                    }
                                />
                                <Route path="/demo" element={<Demo />} />
            <Route
                path="/settings"
                element={
                    <PrivateRoute>
                        <UserSettings />
                    </PrivateRoute>
                }
            />
                            </Routes>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <ThemeProvider>
                    <SubscriptionProvider>
                        <ToastProvider>
                            <ScrollHandler />
                            <AppContent />
                        </ToastProvider>
                    </SubscriptionProvider>
                </ThemeProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;