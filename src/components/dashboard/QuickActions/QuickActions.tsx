// components/dashboard/QuickActions/QuickActions.tsx
import React from 'react';
import { Plus, Calendar, Users, BarChart3, Settings } from 'lucide-react';
import './QuickActions.scss';

const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: Plus,
      label: 'Nowe wydarzenie',
      action: () => console.log('Create event'),
      primary: true
    },
    {
      icon: Users,
      label: 'Dodaj gości',
      action: () => console.log('Add guests')
    },
    {
      icon: BarChart3,
      label: 'Analityki',
      action: () => console.log('Analytics')
    },
    {
      icon: Settings,
      label: 'Ustawienia',
      action: () => console.log('Settings')
    }
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