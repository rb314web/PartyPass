// components/dashboard/Settings/Settings.tsx
import React, { useState } from 'react';
import {
  User,
  CreditCard,
  Bell,
  Shield,
  Palette,
  Settings as SettingsIcon,
} from 'lucide-react';
import ProfileSettings from './ProfileSettings/ProfileSettings';
import PlanSettings from './PlanSettings/PlanSettings';
import NotificationSettings from './NotificationSettings/NotificationSettings';
import SecuritySettings from './SecuritySettings/SecuritySettings';
import AppearanceSettings from './AppearanceSettings/AppearanceSettings';
import './Settings.scss';

type SettingsTab =
  | 'profile'
  | 'plan'
  | 'notifications'
  | 'security'
  | 'appearance';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    {
      id: 'profile' as const,
      label: 'Profil',
      icon: User,
    },
    {
      id: 'plan' as const,
      label: 'Plan i płatności',
      icon: CreditCard,
    },
    {
      id: 'notifications' as const,
      label: 'Powiadomienia',
      icon: Bell,
    },
    {
      id: 'security' as const,
      label: 'Bezpieczeństwo',
      icon: Shield,
    },
    {
      id: 'appearance' as const,
      label: 'Wygląd',
      icon: Palette,
    },
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
        <div className="settings__title-wrapper">
          <div className="settings__icon">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h1 className="settings__title">Ustawienia</h1>
            <p className="settings__subtitle">
              Zarządzaj swoim kontem, preferencjami i ustawieniami aplikacji
            </p>
          </div>
        </div>
      </div>

      <div className="settings__layout">
        <nav className="settings__tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings__tab ${activeTab === tab.id ? 'settings__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <main className="settings__content">{renderTabContent()}</main>
      </div>
    </div>
  );
};

export default Settings;
