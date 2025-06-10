import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/style/Register.scss';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, getAuth, updateProfile } from 'firebase/auth';
import Navigation from './Navigation';

interface PasswordRequirement {
    id: string;
    text: string;
    validator: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
    {
        id: 'length',
        text: '8 znaków',
        validator: (password) => password.length >= 8
    },
    {
        id: 'uppercase',
        text: 'wielka litera',
        validator: (password) => /[A-Z]/.test(password)
    },
    {
        id: 'lowercase',
        text: 'mała litera',
        validator: (password) => /[a-z]/.test(password)
    },
    {
        id: 'number',
        text: 'cyfra',
        validator: (password) => /[0-9]/.test(password)
    },
    {
        id: 'special',
        text: 'znak specjalny',
        validator: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
];

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        terms?: string;
        general?: string;
    }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [passwordStatus, setPasswordStatus] = useState<Record<string, boolean>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth();
    const [isErrorVisible, setIsErrorVisible] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const newStatus: Record<string, boolean> = {};
        passwordRequirements.forEach(req => {
            newStatus[req.id] = req.validator(formData.password);
        });
        setPasswordStatus(newStatus);
    }, [formData.password]);

    const isPasswordValid = Object.values(passwordStatus).every(status => status);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setIsErrorVisible(prev => ({ ...prev, [name]: false }));
            setTimeout(() => {
                setErrors(prev => ({
                    ...prev,
                    [name]: undefined
                }));
            }, 300);
        }

        // Usuwamy walidację w czasie rzeczywistym dla confirmPassword
        if (name === 'password' && formData.confirmPassword) {
            // Nie walidujemy już tutaj
        }
    };

    const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAcceptTerms(e.target.checked);
        if (e.target.checked) {
            setErrors(prev => ({
                ...prev,
                terms: undefined
            }));
        }
    };

    const validateForm = () => {
        const newErrors: typeof errors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Imię jest wymagane';
            setIsErrorVisible(prev => ({ ...prev, name: true }));
        }

        if (!formData.email.trim()) {
            newErrors.email = 'E-mail jest wymagany';
            setIsErrorVisible(prev => ({ ...prev, email: true }));
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Nieprawidłowy adres e-mail';
            setIsErrorVisible(prev => ({ ...prev, email: true }));
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Hasło jest wymagane';
            setIsErrorVisible(prev => ({ ...prev, password: true }));
        } else if (!isPasswordValid) {
            newErrors.password = 'Hasło nie spełnia wszystkich wymagań';
            setIsErrorVisible(prev => ({ ...prev, password: true }));
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Potwierdzenie hasła jest wymagane';
            setIsErrorVisible(prev => ({ ...prev, confirmPassword: true }));
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Hasła nie są identyczne';
            setIsErrorVisible(prev => ({ ...prev, confirmPassword: true }));
        }

        if (!acceptTerms) {
            newErrors.terms = 'error';
            setIsErrorVisible(prev => ({ ...prev, terms: true }));
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;
            console.log('Użytkownik zarejestrowany pomyślnie:', user);

            // Wyślij email weryfikacyjny
            await sendEmailVerification(user);
            console.log('Email weryfikacyjny wysłany.');
            
            // Wyloguj użytkownika
            await auth.signOut();
            
            // Przekieruj do strony sukcesu
            navigate('/registration-success');

        } catch (error: any) {
            console.error('Błąd rejestracji:', error.message);
            setErrors(prev => ({
                ...prev,
                email: error.message.includes('email-already-in-use') ? 'Ten adres e-mail jest już zarejestrowany.' : undefined,
                password: error.message.includes('weak-password') ? 'Hasło jest za słabe.' : undefined,
                general: 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navigation />
            <div className="register">
                <div className="register__background">
                    <div className="register__shape register__shape--1"></div>
                    <div className="register__shape register__shape--2"></div>
                    <div className="register__shape register__shape--3"></div>
                </div>

                <div className="register__container">
                    <div className="register__header">
                        <h1 className="register__title">Stwórz konto</h1>
                        <p className="register__subtitle">Dołącz do naszej społeczności</p>
                    </div>

                    <form onSubmit={handleSubmit} className="register__form">
                        <div className="register__input-group">
                            <div className="register__label-row">
                                <label htmlFor="name" className="register__label">Imię</label>
                                {errors.name && (
                                    <p 
                                        id="register-name-error" 
                                        className="register__error"
                                        style={{ animation: isErrorVisible.name ? 'fadeIn 0.3s ease-out forwards' : 'fadeOut 0.3s ease-out forwards' }}
                                    >
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className={`register__input ${errors.name ? 'register__input--error' : ''}`}
                                placeholder="Wpisz swoje imię"
                                aria-invalid={!!errors.name}
                                aria-describedby="register-name-error"
                            />
                        </div>

                        <div className="register__input-group">
                            <div className="register__label-row">
                                <label htmlFor="email" className="register__label">Adres e-mail</label>
                                {errors.email && (
                                    <p 
                                        id="register-email-error" 
                                        className="register__error"
                                        style={{ animation: isErrorVisible.email ? 'fadeIn 0.3s ease-out forwards' : 'fadeOut 0.3s ease-out forwards' }}
                                    >
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`register__input ${errors.email ? 'register__input--error' : ''}`}
                                placeholder="Wpisz swój e-mail"
                                autoComplete="email"
                                aria-invalid={!!errors.email}
                                aria-describedby="register-email-error"
                            />
                        </div>

                        <div className="register__input-group">
                            <div className="register__label-row">
                                <label htmlFor="password" className="register__label">Hasło</label>
                                {errors.password && (
                                    <p 
                                        id="register-password-error" 
                                        className="register__error"
                                        style={{ animation: isErrorVisible.password ? 'fadeIn 0.3s ease-out forwards' : 'fadeOut 0.3s ease-out forwards' }}
                                    >
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                            <div className="register__input-wrapper">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`register__input ${errors.password ? 'register__input--error' : ''}`}
                                    placeholder="Wpisz swoje hasło"
                                    autoComplete="new-password"
                                    aria-invalid={!!errors.password}
                                    aria-describedby="register-password-error"
                                />
                                <button
                                    type="button"
                                    className="register__show-password"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={0}
                                    aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                            <div className="register__password-requirements">
                                <span className="register__requirement-text">
                                    Wymagane: {passwordRequirements.map((req, index) => (
                                        <span key={req.id} className={passwordStatus[req.id] ? 'register__requirement--met' : ''}>
                                            {req.text}{index < passwordRequirements.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </span>
                            </div>
                        </div>

                        <div className="register__input-group">
                            <div className="register__label-row">
                                <label htmlFor="confirmPassword" className="register__label">Potwierdź hasło</label>
                                {errors.confirmPassword && (
                                    <p 
                                        id="register-confirmPassword-error" 
                                        className="register__error"
                                        style={{ animation: isErrorVisible.confirmPassword ? 'fadeIn 0.3s ease-out forwards' : 'fadeOut 0.3s ease-out forwards' }}
                                    >
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                            <div className="register__input-wrapper">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`register__input ${errors.confirmPassword ? 'register__input--error' : ''}`}
                                    placeholder="Potwierdź swoje hasło"
                                    autoComplete="new-password"
                                    aria-invalid={!!errors.confirmPassword}
                                    aria-describedby="register-confirmPassword-error"
                                />
                                <button
                                    type="button"
                                    className="register__show-password"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    tabIndex={0}
                                    aria-label={showConfirmPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                                >
                                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        <div className="register__terms">
                            <div className={`register__terms-content ${errors.terms ? 'register__terms-content--error' : ''}`}>
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={acceptTerms}
                                    onChange={handleTermsChange}
                                    style={{ animation: isErrorVisible.terms ? 'shake 0.5s ease-in-out' : 'none' }}
                                />
                                <span>
                                    Akceptuję <a href="/terms" target="_blank" rel="noopener noreferrer">regulamin</a> oraz{' '}
                                    <a href="/privacy" target="_blank" rel="noopener noreferrer">politykę prywatności</a>
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="register__button"
                        >
                            {isSubmitting ? 'Rejestracja...' : 'Zarejestruj się'}
                        </button>
                    </form>

                    <div className="register__footer">
                        <p>Masz już konto? <Link to="/login">Zaloguj się</Link></p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;