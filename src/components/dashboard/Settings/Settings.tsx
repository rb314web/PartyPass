// components/dashboard/Settings/Settings.tsx
import React, { useState } from 'react';
import {
  User,
  CreditCard,
  Bell,
  Shield,
  Palette,
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
      description: 'Dane osobowe i kontakt',
      icon: User,
    },
    {
      id: 'plan' as const,
      label: 'Plan',
      description: 'Subskrypcja i płatności',
      icon: CreditCard,
    },
    {
      id: 'notifications' as const,
      label: 'Powiadomienia',
      description: 'Email i komunikacja',
      icon: Bell,
    },
    {
      id: 'security' as const,
      label: 'Bezpieczeństwo',
      description: 'Hasło i weryfikacja',
      icon: Shield,
    },
    {
      id: 'appearance' as const,
      label: 'Wygląd',
      description: 'Motywy i kolory',
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
        <h1>Ustawienia</h1>
        <p>Zarządzaj swoim kontem i preferencjami</p>
      </div>

      <div className="settings__layout">
        <nav
          className="settings__sidebar"
          role="tablist"
          aria-label="Sekcje ustawień"
        >
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`settings-tab-${tab.id}`}
                aria-controls="settings-panel"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className={`settings__tab ${isActive ? 'settings__tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="settings__tab-icon">
                  <Icon size={20} />
                </div>
                <div className="settings__tab-content">
                  <span className="settings__tab-label">{tab.label}</span>
                  <span className="settings__tab-description">
                    {tab.description}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        <main
          className="settings__content"
          id="settings-panel"
          role="tabpanel"
          aria-labelledby={`settings-tab-${activeTab}`}
        >
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default Settings;
