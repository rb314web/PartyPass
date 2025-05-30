import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/style/Login.scss';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const googleProvider = new GoogleAuthProvider();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!email) {
            setErrors(prev => ({ ...prev, email: 'E-mail jest wymagany' }));
            return;
        }
        if (!password) {
            setErrors(prev => ({ ...prev, password: 'Hasło jest wymagane' }));
            return;
        }

        setIsSubmitting(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            // Sprawdź czy email jest zweryfikowany
            if (!user.emailVerified) {
                // Wyloguj użytkownika
                await auth.signOut();
                
                // Wyślij ponownie email weryfikacyjny
                await sendEmailVerification(user);
                
                setErrors(prev => ({
                    ...prev,
                    general: 'Proszę potwierdzić swój adres email. Wysłaliśmy nowy link weryfikacyjny.'
                }));
                return;
            }

            console.log('Użytkownik zalogowany pomyślnie (email/password):', user);
            navigate('/dashboard');

        } catch (error: any) {
            console.error('Błąd logowania (email/password):', error.message);
            setErrors(prev => ({
                ...prev,
                general: 'Nieprawidłowy adres e-mail lub hasło. Spróbuj ponownie.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        setIsSubmitting(true);
        setErrors({});

        try {
            if (provider === 'google') {
                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;
                console.log('Użytkownik zalogowany pomyślnie (Google):', user);

                navigate('/dashboard');

            } else if (provider === 'facebook') {
                console.log('Logowanie przez Facebook zostało usunięte.');
                setErrors(prev => ({ ...prev, general: 'Logowanie przez Facebook nie jest już dostępne.' }));

            }
        } catch (error: any) {
            console.error(`Błąd logowania przez ${provider}:`, error.message);
            setErrors(prev => ({
                ...prev,
                general: `Logowanie przez ${provider} nie powiodło się. ${error.message}`
            }));
        } finally {
            setIsSubmitting(false);
        }
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
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`login__input ${errors.email ? 'login__input--error' : ''}`}
                            placeholder="Wpisz swój e-mail"
                            autoComplete="email"
                            aria-invalid={!!errors.email}
                            aria-describedby="login-email-error"
                        />
                        <p id="login-email-error" className={`login__error${errors.email ? ' login__error--visible' : ''}`}>{errors.email ? `Błąd: ${errors.email}` : ''}</p>
                    </div>

                    <div className="login__input-group">
                        <div className="login__label">
                            <label htmlFor="password">Hasło</label>
                            {errors.password && <p className="login__error">{errors.password}</p>}
                        </div>
                        <div className="login__password-container">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`login__input ${errors.password ? 'login__input--error' : ''}`}
                                placeholder="Wpisz swoje hasło"
                                autoComplete="current-password"
                                aria-invalid={!!errors.password}
                                aria-describedby="login-password-error"
                            />
                            <button
                                type="button"
                                className="login__toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                        <p id="login-password-error" className={`login__error${errors.password ? ' login__error--visible' : ''}`}>{errors.password ? `Błąd: ${errors.password}` : ''}</p>
                    </div>

                    {errors.general && (
                        <div className="login__error login__error--visible" role="alert">
                            <i className="fas fa-exclamation-circle"></i>
                            <span>{errors.general}</span>
                        </div>
                    )}

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
                        disabled={isSubmitting}
                    >
                        <i className="fab fa-google"></i>
                        <span>Google</span>
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