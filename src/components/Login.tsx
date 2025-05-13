import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/style/Login.scss';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email.trim()) {
            newErrors.email = 'E-mail jest wymagany';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Nieprawidłowy adres e-mail';
        }
        if (!password.trim()) {
            newErrors.password = 'Hasło jest wymagane';
        } else if (password.length < 6) {
            newErrors.password = 'Hasło musi mieć minimum 6 znaków';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate('/dashboard');
        } catch (error) {
            setErrors({ email: 'Nieprawidłowy email lub hasło' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        console.log(`Logowanie przez ${provider}`);
    };

    return (
        <div className="login">
            <div className="login__background">
                <div className="login__shape login__shape--1"></div>
                <div className="login__shape login__shape--2"></div>
                <div className="login__shape login__shape--3"></div>
            </div>

            <div className="login__container">
                <div className="login__header">
                    <h1 className="login__title">Witaj z powrotem!</h1>
                    <p className="login__subtitle">Zaloguj się, aby kontynuować</p>
                </div>

                <form onSubmit={handleSubmit} className="login__form">
                    <div className="login__input-group">
                        <div className="login__label">
                            <label htmlFor="email">Adres e-mail</label>
                            {errors.email && <p className="login__error">{errors.email}</p>}
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`login__input ${errors.email ? 'login__input--error' : ''}`}
                            placeholder="Wpisz swój e-mail"
                            autoComplete="email"
                        />
                    </div>

                    <div className="login__input-group">
                        <div className="login__label">
                            <label htmlFor="password">Hasło</label>
                            {errors.password && <p className="login__error">{errors.password}</p>}
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`login__input ${errors.password ? 'login__input--error' : ''}`}
                            placeholder="Wpisz swoje hasło"
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="login__options">
                        <label className="login__remember">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Zapamiętaj mnie</span>
                        </label>
                        <Link to="/reset-password" className="login__forgot">
                            Zapomniałeś hasła?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="login__button"
                    >
                        {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
                    </button>
                </form>

                <div className="login__divider">
                    <span>lub kontynuuj przez</span>
                </div>

                <div className="login__social">
                    <button
                        onClick={() => handleSocialLogin('google')}
                        className="login__social-button"
                    >
                        <i className="fab fa-google"></i>
                        <span>Google</span>
                    </button>
                    <button
                        onClick={() => handleSocialLogin('facebook')}
                        className="login__social-button"
                    >
                        <i className="fab fa-facebook-f"></i>
                        <span>Facebook</span>
                    </button>
                </div>

                <div className="login__footer">
                    <p>Nie masz konta? <Link to="/register">Stwórz teraz</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;