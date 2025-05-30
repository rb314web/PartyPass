import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase'; // Importuj auth
import { sendPasswordResetEmail } from 'firebase/auth'; // Importuj funkcję do resetowania hasła
import '../assets/style/ResetPassword.scss'; // Stworzymy ten plik stylów w następnym kroku

const ResetPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null); // Wyczyść poprzednie wiadomości
        setError(null); // Wyczyść poprzednie błędy

        if (!email) {
            setError('Proszę podać adres e-mail.');
            return;
        }

        setIsSubmitting(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Instrukcje resetowania hasła zostały wysłane na podany adres e-mail (sprawdź folder spam!).');
        } catch (err: any) {
            console.error('Błąd wysyłania e-maila resetującego hasło:', err);
            // Możesz dostosować komunikat błędu w zależności od err.code
            // np. 'auth/user-not-found'
            setError('Nie udało się wysłać e-maila resetującego hasło. Sprawdź adres e-mail i spróbuj ponownie.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="reset-password">
            <div className="reset-password__container">
                <h1 className="reset-password__title">Resetowanie hasła</h1>
                <p className="reset-password__subtitle">Podaj adres e-mail powiązany z Twoim kontem. Wyślemy Ci link do zresetowania hasła.</p>

                <form onSubmit={handleSubmit} className="reset-password__form">
                    <div className="reset-password__input-group">
                        <label htmlFor="email" className="reset-password__label">Adres e-mail</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="reset-password__input"
                            placeholder="Wpisz swój e-mail"
                            autoComplete="email"
                            required
                        />
                    </div>

                    {message && <p className="reset-password__message--success">{message}</p>}
                    {error && <p className="reset-password__message--error">{error}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="reset-password__button"
                    >
                        {isSubmitting ? 'Wysyłanie...' : 'Wyślij link resetujący'}
                    </button>
                </form>

                <div className="reset-password__footer">
                    <Link to="/login">Powrót do logowania</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword; 