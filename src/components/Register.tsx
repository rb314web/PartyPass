import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/style/Register.scss';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

interface PasswordRequirement {
    id: string;
    text: string;
    validator: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
    {
        id: 'length',
        text: 'Minimum 8 znaków',
        validator: (password) => password.length >= 8
    },
    {
        id: 'uppercase',
        text: 'Przynajmniej jedna wielka litera',
        validator: (password) => /[A-Z]/.test(password)
    },
    {
        id: 'lowercase',
        text: 'Przynajmniej jedna mała litera',
        validator: (password) => /[a-z]/.test(password)
    },
    {
        id: 'number',
        text: 'Przynajmniej jedna cyfra',
        validator: (password) => /[0-9]/.test(password)
    },
    {
        id: 'special',
        text: 'Przynajmniej jeden znak specjalny',
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
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isRequirementsVisible, setIsRequirementsVisible] = useState(false);
    const [isRequirementsCollapsing, setIsRequirementsCollapsing] = useState(false);
    const requirementsRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const newStatus: Record<string, boolean> = {};
        passwordRequirements.forEach(req => {
            newStatus[req.id] = req.validator(formData.password);
        });
        setPasswordStatus(newStatus);
    }, [formData.password]);

    const isPasswordValid = Object.values(passwordStatus).every(status => status);

    useEffect(() => {
        if (isPasswordFocused) {
            setIsRequirementsCollapsing(false);
            setIsRequirementsVisible(true);
        } else {
            setIsRequirementsCollapsing(true);
            const timer = setTimeout(() => {
                setIsRequirementsVisible(false);
                setIsRequirementsCollapsing(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isPasswordFocused]);

    useEffect(() => {
        if (isPasswordValid && isRequirementsVisible) {
            setIsRequirementsCollapsing(true);
            const timer = setTimeout(() => {
                setIsRequirementsVisible(false);
                setIsRequirementsCollapsing(false);
            }, 300);
            return () => clearTimeout(timer);
        } else if (!isPasswordValid && !isRequirementsVisible && formData.password && isPasswordFocused) {
            setIsRequirementsCollapsing(false);
            setIsRequirementsVisible(true);
        }
    }, [isPasswordValid, isRequirementsVisible, formData.password, isPasswordFocused]);

    const validatePasswordMatch = (password: string, confirmPassword: string) => {
        if (confirmPassword && password !== confirmPassword) {
            setErrors(prev => ({
                ...prev,
                confirmPassword: 'Hasła nie są identyczne'
            }));
            return false;
        }
        setErrors(prev => ({
            ...prev,
            confirmPassword: undefined
        }));
        return true;
    };

    const validateTerms = () => {
        if (!acceptTerms) {
            setErrors(prev => ({
                ...prev,
                terms: 'Musisz zaakceptować regulamin'
            }));
            return false;
        }
        setErrors(prev => ({
            ...prev,
            terms: undefined
        }));
        return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }

        // Real-time validation for confirm password
        if (name === 'confirmPassword') {
            validatePasswordMatch(formData.password, value);
        }

        // Validate password match when password changes
        if (name === 'password' && formData.confirmPassword) {
            validatePasswordMatch(value, formData.confirmPassword);
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
        }

        if (!formData.email.trim()) {
            newErrors.email = 'E-mail jest wymagany';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Nieprawidłowy adres e-mail';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Hasło jest wymagane';
        } else if (!isPasswordValid) {
            newErrors.password = 'Hasło nie spełnia wszystkich wymagań';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Potwierdzenie hasła jest wymagane';
        }

        if (!acceptTerms) {
            newErrors.terms = 'Musisz zaakceptować regulamin';
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

    const handlePasswordFocus = () => {
        setIsPasswordFocused(true);
    };

    const handlePasswordBlur = () => {
        setIsPasswordFocused(false);
    };

    const handleSocialRegister = (provider: string) => {
        console.log(`Rejestracja przez ${provider}`);
    };

    return (
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
                            <p id="register-name-error" className={`register__error${errors.name ? ' register__error--visible' : ''}`}>{errors.name ? `Błąd: ${errors.name}` : ''}</p>
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
                            <p id="register-email-error" className={`register__error${errors.email ? ' register__error--visible' : ''}`}>{errors.email ? `Błąd: ${errors.email}` : ''}</p>
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
                            <p id="register-password-error" className={`register__error${errors.password ? ' register__error--visible' : ''}`}>{errors.password ? `Błąd: ${errors.password}` : ''}</p>
                        </div>
                        <div className="register__input-wrapper">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={handlePasswordFocus}
                                onBlur={handlePasswordBlur}
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
                        <div className="register__password-status">
                            <i className={`fas ${formData.password ? (isPasswordValid ? 'fa-check-circle' : 'fa-exclamation-circle') : 'fa-info-circle'}`}></i>
                            <span>
                                {formData.password 
                                    ? (isPasswordValid 
                                        ? 'Hasło spełnia wszystkie wymagania' 
                                        : 'Hasło nie spełnia wszystkich wymagań')
                                    : 'Wymagane: min. 8 znaków, wielka i mała litera, cyfra, znak specjalny'
                                }
                            </span>
                        </div>
                        {(isRequirementsVisible || isRequirementsCollapsing) && (
                            <div 
                                ref={requirementsRef}
                                className={`register__password-requirements ${isRequirementsCollapsing ? 'collapsing' : ''}`}
                            >
                                {passwordRequirements.map(req => (
                                    <div 
                                        key={req.id} 
                                        className={`register__requirement ${passwordStatus[req.id] ? 'register__requirement--met' : ''}`}
                                    >
                                        <i className={`fas ${passwordStatus[req.id] ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                        <span>{req.text}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="register__input-group">
                        <div className="register__label-row">
                            <label htmlFor="confirmPassword" className="register__label">Potwierdź hasło</label>
                            <p id="register-confirmPassword-error" className={`register__error${errors.confirmPassword ? ' register__error--visible' : ''}`}>{errors.confirmPassword ? `Błąd: ${errors.confirmPassword}` : ''}</p>
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
                        <label className="register__terms-content">
                            <span className={`register__switch${errors.terms ? ' register__switch--error' : ''} ${errors.terms ? ' shake' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={handleTermsChange}
                                />
                                <span className="register__slider"></span>
                            </span>
                            {errors.terms && (
                                <span className="register__terms-warning" aria-label="Musisz zaakceptować regulamin" title="Musisz zaakceptować regulamin">
                                    <i className="fas fa-exclamation-circle"></i>
                                </span>
                            )}
                            <span>
                                Akceptuję <Link to="/terms">regulamin</Link> i <Link to="/privacy">politykę prywatności</Link>
                            </span>
                        </label>
                        <div className="register__label-row">
                            <p id="register-terms-error" className={`register__error${errors.terms ? ' register__error--visible' : ''}`}>{errors.terms ? `Błąd: ${errors.terms}` : ''}</p>
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

                <div className="register__divider">
                    <span>lub zarejestruj się przez</span>
                </div>

                <div className="register__social">
                    <button
                        onClick={() => handleSocialRegister('google')}
                        className="register__social-button"
                    >
                        <i className="fab fa-google"></i>
                        <span>Google</span>
                    </button>
                    <button
                        onClick={() => handleSocialRegister('facebook')}
                        className="register__social-button"
                    >
                        <i className="fab fa-facebook-f"></i>
                        <span>Facebook</span>
                    </button>
                </div>

                <div className="register__footer">
                    <p>Masz już konto? <Link to="/login">Zaloguj się</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;