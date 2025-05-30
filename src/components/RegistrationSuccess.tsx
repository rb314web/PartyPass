import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/style/RegistrationSuccess.scss';

const RegistrationSuccess: React.FC = () => {
    return (
        <div className="registration-success">
            <div className="registration-success__container">
                <div className="registration-success__icon">
                    <i className="fas fa-envelope"></i>
                </div>
                <h1 className="registration-success__title">Rejestracja zakończona pomyślnie!</h1>
                <p className="registration-success__message">
                    Dziękujemy za rejestrację. Wysłaliśmy link weryfikacyjny na Twój adres e-mail.
                    Proszę sprawdź swoją skrzynkę i kliknij w link, aby aktywować konto.
                </p>
                <div className="registration-success__actions">
                    <Link to="/login" className="registration-success__button">
                        Przejdź do logowania
                    </Link>
                </div>
                <p className="registration-success__note">
                    Nie otrzymałeś e-maila? Sprawdź folder spam lub{' '}
                    <Link to="/register" className="registration-success__link">
                        zarejestruj się ponownie
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegistrationSuccess; 