// components/dashboard/QuickActions/QuickActions.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Users, BarChart3, Settings } from 'lucide-react';
import useActionAnalytics from '../../../hooks/useActionAnalytics';
import './QuickActions.scss';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { trackAction } = useActionAnalytics();

  const handleAction = async (actionName: string, path?: string) => {
    await trackAction(`quick_action_${actionName}`, {
      actionName,
      targetPath: path,
    });

    if (path) {
      navigate(path);
    }
  };

  const actions = [
    {
      icon: Plus,
      label: t('dashboardHome.quickNewEvent'),
      action: () => handleAction('create_event', '/dashboard/events/create'),
      primary: true,
    },
    {
      icon: Users,
      label: t('dashboardHome.quickAddGuests'),
      action: () => handleAction('add_guests', '/dashboard/contacts'),
    },
    {
      icon: BarChart3,
      label: t('dashboardHome.quickAnalytics'),
      action: () => handleAction('view_analytics', '/dashboard/analytics'),
    },
    {
      icon: Settings,
      label: t('dashboardHome.quickSettings'),
      action: () => handleAction('view_settings', '/dashboard/settings'),
    },
  ];

  return (
    <div className="quick-actions">
      {actions.map((action, index) => (
        <button
          key={index}
          className={`quick-actions__btn ${action.primary ? 'quick-actions__btn--primary' : ''}`}
          onClick={action.action}
          title={action.label}
        >
          <action.icon size={20} />
          <span className="quick-actions__label">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
