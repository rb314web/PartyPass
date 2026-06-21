// components/dashboard/Settings/Settings.tsx
import React, { useState, Suspense, lazy } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Settings as SettingsIcon,
} from 'lucide-react';
import PageHeader from '../../common/PageHeader/PageHeader';
import DashboardViewSkeleton from '../DashboardViewSkeleton/DashboardViewSkeleton';
import './Settings.scss';
import { useDashboardViewMotion } from '../../../hooks/useDashboardViewMotion';

const ProfileSettings = lazy(
  () => import('./ProfileSettings/ProfileSettings')
);
const NotificationSettings = lazy(
  () => import('./NotificationSettings/NotificationSettings')
);
const SecuritySettings = lazy(
  () => import('./SecuritySettings/SecuritySettings')
);
const AppearanceSettings = lazy(
  () => import('./AppearanceSettings/AppearanceSettings')
);

type SettingsTab =
  | 'profile'
  | 'notifications'
  | 'security'
  | 'appearance';

const SettingsTabFallback = () => (
  <DashboardViewSkeleton variant="list" count={4} />
);

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { className: viewClassName } = useDashboardViewMotion({
    variant: 'shell',
    pageClass: 'settings',
  });

  const tabs = [
    {
      id: 'profile' as const,
      label: 'Profil',
      description: 'Dane osobowe i kontakt',
      icon: User,
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
    <div className={viewClassName}>
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
          <Suspense fallback={<SettingsTabFallback />}>
            {renderTabContent()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default Settings;
