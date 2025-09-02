// components/auth/Login/Login.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import Navigation from '../../common/Navigation/Navigation';
import GoogleIcon from './GoogleIcon';
import './Login.scss';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: 'demo@partypass.pl',
    password: 'demo123'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const { login, loginWithGoogle, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      // Error jest już ustawiony w kontekście
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    try {
      await loginWithGoogle();
    } catch (err) {
      // Error jest już ustawiony w kontekście
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <Navigation variant="auth" />
      <div className="login">
        <div className="login__container">
          <div className="login__card">
            <div className="login__header">
              <h1 className="login__title">Witaj ponownie!</h1>
              <p className="login__subtitle">
                Zaloguj się do swojego konta PartyPass
              </p>
            </div>

            {error && (
              <div className="login__error">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login__form">
              <div className="login__field">
                <label className="login__label">Email</label>
                <div className="login__input-wrapper">
                  <Mail size={20} className="login__input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="login__input"
                    placeholder="twoj@email.com"
                    required
                  />
                </div>
              </div>

              <div className="login__field">
                <label className="login__label">Hasło</label>
                <div className="login__input-wrapper">
                  <Lock size={20} className="login__input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="login__input"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="login__password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="login__options">
                <label className="login__checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="login__checkbox-custom"></span>
                  Zapamiętaj mnie
                </label>
                <Link to="/forgot-password" className="login__forgot">
                  Zapomniałeś hasła?
                </Link>
              </div>

              <button
                type="submit"
                className="login__submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="login__spinner"></div>
                ) : (
                  <>
                    Zaloguj się
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="login__google">
              <button
                type="button"
                className="login__google-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <GoogleIcon size={20} />
                Zaloguj się przez Google
              </button>
            </div>

            <div className="login__footer">
              <p>
                Nie masz konta? {' '}
                <Link to="/register" className="login__register-link">
                  Zarejestruj się
                </Link>
              </p>
            </div>

            <div className="login__demo">
              <div className="login__demo-header">
                <span>🎉 Demo Account</span>
              </div>
              <p>Email: <code>demo@partypass.pl</code></p>
              <p>Hasło: <code>demo123</code></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;