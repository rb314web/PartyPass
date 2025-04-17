import React, { useState } from 'react';
import '../assets/style/ContactForm.scss';

const ContactForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors: { name?: string; email?: string; message?: string } = {};
        if (!name.trim()) {
            newErrors.name = 'Imię jest wymagane';
        } else if (name.length < 2) {
            newErrors.name = 'Imię musi mieć co najmniej 2 znaki';
        }
        if (!email.trim()) {
            newErrors.email = 'E-mail jest wymagany';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Nieprawidłowy adres e-mail';
        }
        if (!message.trim()) {
            newErrors.message = 'Wiadomość jest wymagana';
        } else if (message.length < 10) {
            newErrors.message = 'Wiadomość musi mieć co najmniej 10 znaków';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            alert(`Dziękujemy za wiadomość, ${name}! Odpowiemy wkrótce.`);
            setName('');
            setEmail('');
            setMessage('');
            setErrors({});
        } catch (error) {
            alert('Wystąpił błąd podczas wysyłania wiadomości.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="contact-form">
            <div className="contact-form__container">
                <h2 className="contact-form__heading">Skontaktuj się z nami</h2>
                <div className="contact-form__form">
                    <div>
                        <label htmlFor="name" className="contact-form__label">
                            Imię
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`contact-form__input ${errors.name ? 'contact-form__input--error' : ''}`}
                            placeholder="Wpisz swoje imię"
                        />
                        {errors.name && <p className="contact-form__error">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="contact-form__label">
                            E-mail
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`contact-form__input ${errors.email ? 'contact-form__input--error' : ''}`}
                            placeholder="Wpisz swój e-mail"
                        />
                        {errors.email && <p className="contact-form__error">{errors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="message" className="contact-form__label">
                            Wiadomość
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            className={`contact-form__textarea ${errors.message ? 'contact-form__textarea--error' : ''}`}
                            placeholder="Wpisz swoją wiadomość"
                        />
                        {errors.message && <p className="contact-form__error">{errors.message}</p>}
                    </div>
                    <div className="contact-form__button-container">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="contact-form__button"
                        >
                            {isSubmitting ? 'Wysyłanie...' : 'Wyślij'}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactForm;