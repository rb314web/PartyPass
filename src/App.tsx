import React from 'react';
import Header from './components/Navigation';
import Hero from './components/Hero';
import ServiceDescription from './components/ServiceDescription';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import './assets/style/App.scss';

const App: React.FC = () => {
    return (
        <div className="app">
            <Header />
            <main>
                <Hero />
                <ServiceDescription />
                <Pricing />
                <Testimonials />
                <ContactForm />
            </main>
            <Footer />
        </div>
    );
};

export default App;