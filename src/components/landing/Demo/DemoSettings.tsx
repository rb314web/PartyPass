import React from 'react';
import { Settings as SettingsIcon, Bell, User, Shield, Globe } from 'lucide-react';

const DemoSettings: React.FC = React.memo(() => (
  <div className="demo__settings-content">
    <div className="demo__page-header">
      <h1>Ustawienia</h1>
      <p>Zarządzaj ustawieniami swojego konta</p>
    </div>

    <div className="demo__settings-sections">
      <div className="demo__settings-section">
        <div className="demo__settings-section-header">
          <User size={20} />
          <h3>Profil</h3>
        </div>
        <div className="demo__settings-item">
          <span>Imię i nazwisko</span>
          <span className="demo__settings-value">Anna Kowalska</span>
        </div>
        <div className="demo__settings-item">
          <span>Email</span>
          <span className="demo__settings-value">demo@partypass.pl</span>
        </div>
      </div>

      <div className="demo__settings-section">
        <div className="demo__settings-section-header">
          <Bell size={20} />
          <h3>Powiadomienia</h3>
        </div>
        <div className="demo__settings-item">
          <span>Powiadomienia email</span>
          <span className="demo__settings-value">Włączone</span>
        </div>
        <div className="demo__settings-item">
          <span>Powiadomienia push</span>
          <span className="demo__settings-value">Wyłączone</span>
        </div>
      </div>

      <div className="demo__settings-section">
        <div className="demo__settings-section-header">
          <Globe size={20} />
          <h3>Język</h3>
        </div>
        <div className="demo__settings-item">
          <span>Język interfejsu</span>
          <span className="demo__settings-value">Polski</span>
        </div>
      </div>

      <div className="demo__settings-section">
        <div className="demo__settings-section-header">
          <Shield size={20} />
          <h3>Bezpieczeństwo</h3>
        </div>
        <div className="demo__settings-item">
          <span>Weryfikacja dwuetapowa</span>
          <span className="demo__settings-value">Wyłączona</span>
        </div>
      </div>
    </div>
  </div>
));

DemoSettings.displayName = 'DemoSettings';

export default DemoSettings;

