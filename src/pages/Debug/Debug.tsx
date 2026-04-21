// pages/Debug/Debug.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import MockEventGenerator from '../../components/debug/MockEventGenerator';
import './Debug.scss';

const Debug: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="debug-page">
        <div className="debug-page__error">
          <h2>Authentication Required</h2>
          <p>Please log in to access the debug tools.</p>
        </div>
      </div>
    );
  }

  // Only allow in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) {
    return (
      <div className="debug-page">
        <div className="debug-page__error">
          <h2>Debug Tools Disabled</h2>
          <p>Debug tools are only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="debug-page">
      <div className="debug-page__container">
        <header className="debug-page__header">
          <h1>🛠️ Debug & Test Data Tools</h1>
          <p>Generate, manage, and delete test events, guests, and contacts. Test different plan types.</p>
        </header>

        <div className="debug-page__tools">
          <section className="debug-page__section">
            <MockEventGenerator />
          </section>

          <section className="debug-page__section debug-page__section--info">
            <h3>User Information</h3>
            <div className="debug-page__info-grid">
              <div className="debug-page__info-item">
                <label>User ID</label>
                <code>{user.id}</code>
              </div>
              <div className="debug-page__info-item">
                <label>Email</label>
                <code>{user.email}</code>
              </div>
              <div className="debug-page__info-item">
                <label>Name</label>
                <code>{user.displayName || user.firstName + ' ' + user.lastName}</code>
              </div>
              <div className="debug-page__info-item">
                <label>Plan Type</label>
                <code>{user.planType}</code>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Debug;
