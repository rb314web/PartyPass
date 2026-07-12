import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Calendar, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { previewNextEvent, previewStats } from './previewData';
import './LandingDashboardPreview.scss';

const LandingDashboardPreview: React.FC = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pl' ? pl : enUS;
  const eventDate = format(previewNextEvent.date, 'd MMMM', { locale });

  return (
    <div
      className="landing-dashboard-preview"
      role="img"
      aria-label={t('landing.cta.previewLabel')}
    >
      <div className="landing-dashboard-preview__chrome" aria-hidden="true">
        <span className="landing-dashboard-preview__dot" />
        <span className="landing-dashboard-preview__dot" />
        <span className="landing-dashboard-preview__dot" />
        <span className="landing-dashboard-preview__chrome-title">
          <LayoutDashboard size={14} />
          PartyPass
        </span>
      </div>

      <div className="landing-dashboard-preview__body">
        <div className="landing-dashboard-preview__metrics">
          <div className="landing-dashboard-preview__metric">
            <Calendar size={16} aria-hidden="true" />
            <span className="landing-dashboard-preview__metric-value">
              {previewStats.totalEvents}
            </span>
            <span className="landing-dashboard-preview__metric-label">
              {t('landing.cta.previewMetricEvents')}
            </span>
          </div>
          <div className="landing-dashboard-preview__metric">
            <TrendingUp size={16} aria-hidden="true" />
            <span className="landing-dashboard-preview__metric-value">
              {previewStats.responseRate}%
            </span>
            <span className="landing-dashboard-preview__metric-label">
              {t('landing.cta.previewMetricRsvp')}
            </span>
          </div>
          <div className="landing-dashboard-preview__metric">
            <Users size={16} aria-hidden="true" />
            <span className="landing-dashboard-preview__metric-value">
              {previewStats.totalContacts}
            </span>
            <span className="landing-dashboard-preview__metric-label">
              {t('landing.cta.previewMetricContacts')}
            </span>
          </div>
        </div>

        <div className="landing-dashboard-preview__event">
          <span className="landing-dashboard-preview__event-label">
            {t('landing.cta.previewNextEvent')}
          </span>
          <strong className="landing-dashboard-preview__event-title">
            {previewNextEvent.title}
          </strong>
          <span className="landing-dashboard-preview__event-date">{eventDate}</span>
        </div>
      </div>
    </div>
  );
};

export default LandingDashboardPreview;
