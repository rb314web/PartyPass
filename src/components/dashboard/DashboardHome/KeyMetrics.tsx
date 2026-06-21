import React from 'react';

import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { Calendar, MessageCircle, Crown } from 'lucide-react';

import { getPlanLimits, PlanType } from '../../../services/firebase/planLimitsService';

import './KeyMetrics.scss';



interface MetricProps {

  value: number;

  label: string;

  footnote?: string;

  icon: React.ComponentType<{ size?: number }>;

  color: 'blue' | 'green' | 'purple';

  isPercent?: boolean;

  details?: Array<{ label: string; value: number; color?: string; max?: number | null }>;

  upgradeLink?: string;

  upgradeLinkText?: string;

}



interface KeyMetricsProps {

  totalEvents: number;

  eventsThisMonth: number;

  responseRate: number;

  totalContacts: number;

  activeEvents: number;

  completedEvents: number;

  acceptedGuests: number;

  pendingGuests: number;

  declinedGuests: number;

  planType?: 'starter' | 'pro' | 'enterprise';

}



const KeyMetrics: React.FC<KeyMetricsProps> = ({

  totalEvents,

  eventsThisMonth,

  responseRate,

  totalContacts,

  activeEvents,

  completedEvents,

  acceptedGuests,

  pendingGuests,

  declinedGuests,

  planType = 'starter',

}) => {

  const { t } = useTranslation();

  const currentLimits = getPlanLimits(planType as PlanType);



  const planLabelKey =

    planType === 'pro'

      ? 'dashboardHome.planPro'

      : planType === 'enterprise'

        ? 'dashboardHome.planEnterprise'

        : 'dashboardHome.planStarter';



  const contactUsagePercent = isFinite(currentLimits.contacts)

    ? Math.round((totalContacts / currentLimits.contacts) * 100)

    : 0;



  const eventsFootnote =

    eventsThisMonth > 0

      ? t('dashboardHome.metricsEventsNew', { count: eventsThisMonth })

      : undefined;



  const rsvpFootnote =

    pendingGuests > 0

      ? t('dashboardHome.metricsRsvpPending', { count: pendingGuests })

      : responseRate > 0

        ? t('dashboardHome.metricsRsvpFootnote')

        : undefined;



  const metrics: MetricProps[] = [

    {

      value: totalEvents,

      label: t('dashboardHome.metricsEvents'),

      footnote: eventsFootnote,

      icon: Calendar,

      color: 'blue',

      details: [

        { label: t('dashboardHome.metricsActive'), value: activeEvents, color: 'success' },

        { label: t('dashboardHome.metricsCompleted'), value: completedEvents, color: 'neutral' },

      ],

      upgradeLink: '/dashboard/events',

      upgradeLinkText: t('dashboardHome.metricsEventsViewAll'),

    },

    {

      value: responseRate,

      label: t('dashboardHome.metricsRsvp'),

      footnote: rsvpFootnote,

      isPercent: true,

      icon: MessageCircle,

      color: 'green',

      details: [

        { label: t('dashboardHome.metricsAccepted'), value: acceptedGuests, color: 'success' },

        { label: t('dashboardHome.metricsPending'), value: pendingGuests, color: 'warning' },

        { label: t('dashboardHome.metricsDeclined'), value: declinedGuests, color: 'neutral' },

      ],

      upgradeLink: '/dashboard/analytics',

      upgradeLinkText: t('dashboardHome.metricsRsvpAnalytics'),

    },

    {

      value: contactUsagePercent,

      label: t(planLabelKey),

      footnote: t('dashboardHome.metricsPlanUsage'),

      icon: Crown,

      color: 'purple',

      details: [

        {

          label: t('dashboardHome.metricsPlanEvents'),

          value: totalEvents,

          color: 'neutral',

          max: isFinite(currentLimits.events) ? currentLimits.events : null,

        },

        {

          label: t('dashboardHome.metricsPlanContacts'),

          value: totalContacts,

          color: 'neutral',

          max: isFinite(currentLimits.contacts) ? currentLimits.contacts : null,

        },

      ],

      upgradeLink: '/dashboard/plan',

      upgradeLinkText: t('dashboardHome.metricsChangePlan'),

    },

  ];



  return (

    <div className="key-metrics">

      {metrics.map((metric, index) => (

        <MetricCard key={index} {...metric} seeMoreLabel={t('dashboardHome.metricsSeeMore')} />

      ))}

    </div>

  );

};



const MetricCard: React.FC<MetricProps & { seeMoreLabel: string }> = ({

  value,

  label,

  footnote,

  icon: Icon,

  color,

  isPercent,

  details,

  upgradeLink,

  upgradeLinkText,

  seeMoreLabel,

}) => {

  return (

    <div className={`key-metrics__card key-metrics__card--${color}`}>

      <div className="key-metrics__header">

        <div className={`key-metrics__icon key-metrics__icon--${color}`}>

          <Icon size={20} />

        </div>

        <span className="key-metrics__label">{label}</span>

      </div>



      <div className="key-metrics__value">

        {isPercent ? `${value}%` : value}

      </div>



      {footnote && (

        <p className="key-metrics__footnote">{footnote}</p>

      )}



      {details && details.length > 0 && (

        <div className="key-metrics__details">

          {details.map((detail, idx) => (

            <div key={idx} className="key-metrics__detail">

              <span

                className={`key-metrics__detail-indicator key-metrics__detail-indicator--${detail.color}`}

              />

              <span className="key-metrics__detail-label">{detail.label}</span>

              <span className="key-metrics__detail-value">

                {detail.max === null

                  ? `${detail.value} / ∞`

                  : detail.max

                    ? `${detail.value} / ${detail.max}`

                    : detail.value}

              </span>

            </div>

          ))}

        </div>

      )}



      {upgradeLink && (

        <Link to={upgradeLink} className="key-metrics__upgrade-link">

          {upgradeLinkText || seeMoreLabel}

        </Link>

      )}

    </div>

  );

};



export default KeyMetrics;

