// components/auth/Register/Register.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import Header from '../../common/Header/Header';
import ErrorBoundary from '../../common/ErrorBoundary/ErrorBoundary';
import './Register.scss';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    planType: 'starter' as 'starter' | 'pro' | 'enterprise',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);

  const { register, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      alert('Hasła nie są identyczne');
      return;
    }

    if (!formData.acceptTerms) {
      alert('Musisz zaakceptować regulamin');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        planType: formData.planType,
      });
    } catch (err) {
      // Error jest już ustawiony w kontekście
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const nextStep = () => {
    if (
      step === 1 &&
      formData.firstName &&
      formData.lastName &&
      formData.email
    ) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const plans = [
    { id: 'starter', name: 'Starter', price: 'Darmowy', popular: false },
    { id: 'pro', name: 'Pro', price: '29 PLN/mies', popular: true },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '99 PLN/mies',
      popular: false,
    },
  ];

  return (
    <ErrorBoundary>
      <>
        <Header />
      <div className="register">
        <div className="register__container">
          <div className="register__card">
            <div className="register__header">
              <h1 className="register__title">Stwórz konto</h1>
              <p className="register__subtitle">
                Dołącz do tysięcy zadowolonych organizatorów
              </p>

              <div className="register__steps">
                <div className={`register__step ${step >= 1 ? 'active' : ''}`}>
                  <span>1</span>
                  <span>Dane osobowe</span>
                </div>
                <div className={`register__step ${step >= 2 ? 'active' : ''}`}>
                  <span>2</span>
                  <span>Hasło i plan</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="register__error">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register__form">
              {step === 1 && (
                <div className="register__step-content">
                  <div className="register__field-group">
                    <div className="register__field">
                      <label className="register__label">Imię</label>
                      <div className="register__input-wrapper">
                        <User size={20} className="register__input-icon" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="register__input"
                          placeholder="Jan"
                          required
                        />
                      </div>
                    </div>

                    <div className="register__field">
                      <label className="register__label">Nazwisko</label>
                      <div className="register__input-wrapper">
                        <User size={20} className="register__input-icon" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="register__input"
                          placeholder="Kowalski"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="register__field">
                    <label className="register__label">Email</label>
                    <div className="register__input-wrapper">
                      <Mail size={20} className="register__input-icon" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="register__input"
                        placeholder="twoj@email.com"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="register__next"
                    disabled={
                      !formData.firstName ||
                      !formData.lastName ||
                      !formData.email
                    }
                  >
                    Dalej
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="register__step-content">
                  <div className="register__field">
                    <label className="register__label">Hasło</label>
                    <div className="register__input-wrapper">
                      <Lock size={20} className="register__input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="register__input"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        className="register__password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="register__field">
                    <label className="register__label">Potwierdź hasło</label>
                    <div className="register__input-wrapper">
                      <Lock size={20} className="register__input-icon" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="register__input"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        className="register__password-toggle"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="register__field">
                    <label className="register__label">Wybierz plan</label>
                    <div className="register__plans">
                      {plans.map(plan => (
                        <label key={plan.id} className="register__plan">
                          <input
                            type="radio"
                            name="planType"
                            value={plan.id}
                            checked={formData.planType === plan.id}
                            onChange={handleChange}
                          />
                          <div className="register__plan-content">
                            {plan.popular && (
                              <span className="register__plan-badge">
                                Popularne
                              </span>
                            )}
                            <div className="register__plan-name">
                              {plan.name}
                            </div>
                            <div className="register__plan-price">
                              {plan.price}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="register__terms">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      required
                    />
                    <span className="register__checkbox-custom"></span>
                    Akceptuję <Link to="/terms">regulamin</Link> i{' '}
                    <Link to="/privacy">politykę prywatności</Link>
                  </label>

                  <div className="register__actions">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="register__back"
                    >
                      Wstecz
                    </button>

                    <button
                      type="submit"
                      className="register__submit"
                      disabled={loading || !formData.acceptTerms}
                    >
                      {loading ? (
                        <div className="register__spinner"></div>
                      ) : (
                        <>
                          Stwórz konto
                          <Check size={20} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="register__footer">
              <p>
                Masz już konto?{' '}
                <Link to="/login" className="register__login-link">
                  Zaloguj się
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
    </ErrorBoundary>
  );
};

export default Register;
