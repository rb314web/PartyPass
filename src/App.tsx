import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import ServiceDescription from './components/ServiceDescription';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';

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
    return (
        <Router>
            <div className="app">
                <Navigation />
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
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;