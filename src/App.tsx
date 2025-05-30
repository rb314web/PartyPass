import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import ServiceDescription from './components/ServiceDescription';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ResetPassword from './components/ResetPassword';
import RegistrationSuccess from './components/RegistrationSuccess';
import GuestConfirmation from './components/GuestConfirmation';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const ScrollHandler = () => {
    const location = useLocation();

    React.useEffect(() => {
        if (location.state?.scrollTo) {
            const element = document.querySelector(location.state.scrollTo);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        }
    }, [location.state]);

    return null;
};

function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    if (loading) {
        return <div>Ładowanie aplikacji...</div>;
    }

    return (
        <Router>
            <div className="app">
                <Navigation currentUser={currentUser} />
                <ScrollHandler />
                <main>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <>
                                    <Hero />
                                    <ServiceDescription />
                                    <Pricing />
                                    <Testimonials />
                                    <ContactForm />
                                </>
                            }
                        />
                        <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
                        <Route path="/register" element={currentUser ? <Navigate to="/dashboard" /> : <Register />} />
                        <Route path="/registration-success" element={<RegistrationSuccess />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route 
                            path="/dashboard"
                            element={currentUser ? <Dashboard /> : <Navigate to="/login" replace />}
                        />
                        <Route path="/confirm/:id/:email" element={<GuestConfirmation />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;