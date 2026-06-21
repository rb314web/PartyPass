import React, { useState } from 'react';
import { Bell, User, Shield, Palette, Settings as SettingsIcon } from 'lucide-react';
import PageHeader from '../../common/PageHeader/PageHeader';
import { useAuth } from '../../../hooks/useAuth';
import '../../dashboard/Settings/Settings.scss';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance';

const tabs: Array<{
  id: SettingsTab;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
}> = [
  { id: 'profile', label: 'Profil', description: 'Dane osobowe i kontakt', icon: User },
  {
    id: 'notifications',
    label: 'Powiadomienia',
    description: 'Email i komunikacja',
    icon: Bell,
  },
  {
    id: 'security',
    label: 'Bezpieczeństwo',
    description: 'Hasło i weryfikacja',
    icon: Shield,
  },
  {
    id: 'appearance',
    label: 'Wygląd',
    description: 'Motywy i kolory',
    icon: Palette,
  },
];

const DemoSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="settings">
      <PageHeader
        title="Ustawienia"
        subtitle="Zarządzaj swoim kontem i preferencjami"
        icon={SettingsIcon}
        className="settings__header"
      />

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
                aria-selected={isActive}
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

        <main className="settings__content" role="tabpanel">
          {activeTab === 'profile' && (
            <>
              <h2>Profil</h2>
              <p>
                <strong>Imię i nazwisko:</strong> {user?.firstName} {user?.lastName}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Plan:</strong> Pro
              </p>
            </>
          )}
          {activeTab === 'notifications' && (
            <>
              <h2>Powiadomienia</h2>
              <p>Przypomnienia RSVP i aktualizacje wydarzeń są włączone.</p>
            </>
          )}
          {activeTab === 'security' && (
            <>
              <h2>Bezpieczeństwo</h2>
              <p>W demo zmiana hasła jest niedostępna.</p>
            </>
          )}
          {activeTab === 'appearance' && (
            <>
              <h2>Wygląd</h2>
              <p>Motyw aplikacji jest synchronizowany z ustawieniami przeglądarki.</p>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DemoSettings;
