import React from 'react';
import { Crown, Star } from 'lucide-react';
import PageHeader from '../../common/PageHeader/PageHeader';
import { demoStats } from './demoDashboardData';
import '../../dashboard/Settings/PlanSettings/PlanSettings.scss';

const DemoPlan: React.FC = () => (
  <div className="plan-settings">
    <PageHeader
      title="Plan"
      subtitle="Zarządzaj subskrypcją i limitami konta"
      icon={Crown}
      className="plan-settings__page-header"
    />

    <div className="plan-settings__current">
      <div className="plan-settings__current-top">
        <div className="plan-settings__current-info">
          <span className="plan-settings__current-label">Twój aktualny plan</span>
          <div className="plan-settings__current-name">
            <Star size={20} aria-hidden />
            Pro
            <span className="plan-settings__status-badge">Aktywny</span>
          </div>
        </div>
        <div className="plan-settings__current-price-block">
          <span className="plan-settings__price-main">29 PLN</span>
          <span className="plan-settings__price-period">/miesiąc</span>
        </div>
      </div>

      <div className="plan-settings__usage-section">
        <h3 className="plan-settings__usage-title">Wykorzystanie zasobów</h3>
        <div className="plan-settings__usage-grid">
          <div className="plan-settings__usage-item">
            <span>Wydarzenia</span>
            <strong>
              {demoStats.totalEvents} / 50
            </strong>
          </div>
          <div className="plan-settings__usage-item">
            <span>Kontakty</span>
            <strong>
              {demoStats.totalContacts} / 1000
            </strong>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DemoPlan;
