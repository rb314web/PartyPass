// components/dashboard/Settings/Settings.tsx
import React, { useState } from 'react';
import { User, CreditCard, Bell, Shield, Palette, Globe } from 'lucide-react';
import ProfileSettings from './ProfileSettings/ProfileSettings';
import PlanSettings from './PlanSettings/PlanSettings';
import NotificationSettings from './NotificationSettings/NotificationSettings';
import SecuritySettings from './SecuritySettings/SecuritySettings';
import AppearanceSettings from './AppearanceSettings/AppearanceSettings';
import './Settings.scss';

type SettingsTab = 'profile' | 'plan' | 'notifications' | 'security' | 'appearance';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    {
      id: 'profile' as const,
      label: 'Profil',
      icon: User,
      description: 'Zarządzaj danymi osobowymi i informacjami konta'
    },
    {
      id: 'plan' as const,
      label: 'Plan i płatności',
      icon: CreditCard,
      description: 'Zmień plan, zarządzaj płatnościami i fakturami'
    },
    {
      id: 'notifications' as const,
      label: 'Powiadomienia',
      icon: Bell,
      description: 'Skonfiguruj preferencje powiadomień'
    },
    {
      id: 'security' as const,
      label: 'Bezpieczeństwo',
      icon: Shield,
      description: 'Hasło, dwuskładnikowe uwierzytelnianie'
    },
    {
      id: 'appearance' as const,
      label: 'Wygląd',
      icon: Palette,
      description: 'Motyw, język i personalizacja interfejsu'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'plan':
        return <PlanSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'appearance':
        return <AppearanceSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="settings">
      <div className="settings__header">
        <h1 className="settings__title">Ustawienia</h1>
        <p className="settings__subtitle">
          Zarządzaj swoim kontem, preferencjami i ustawieniami aplikacji
        </p>
      </div>

      <div className="settings__layout">
        <nav className="settings__nav">
          <ul className="settings__nav-list">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  className={`settings__nav-item ${activeTab === tab.id ? 'settings__nav-item--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <div className="settings__nav-icon">
                    <tab.icon size={20} />
                  </div>
                  <div className="settings__nav-content">
                    <div className="settings__nav-label">{tab.label}</div>
                    <div className="settings__nav-description">{tab.description}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="settings__content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default Settings;