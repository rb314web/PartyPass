import React from 'react';
import '../assets/style/Testimonials.scss';

const Testimonials: React.FC = () => {
    return (
        <section id="testimonials" className="testimonials">
            <h2>Co mówią nasi klienci</h2>
            <div className="testimonial">
                <p>"[Nazwa usługi] zmieniła moje życie! Polecam wszystkim!" - Jan Kowalski</p>
            </div>
            <div className="testimonial">
                <p>"Profesjonalna obsługa i świetne rezultaty. Nie mogłem być bardziej zadowolony." - Anna Nowak</p>
            </div>
        </section>
    );
};

export default Testimonials;