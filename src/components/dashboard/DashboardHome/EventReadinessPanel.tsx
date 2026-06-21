import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  MapPin,
  Users,
  Crown,
  ArrowRight,
} from 'lucide-react';
import {
  getPlanLimits,
  getEventUsagePercent,
  type PlanType,
} from '../../../services/firebase/planLimitsService';
import type { Event } from '../../../types';
import './EventReadinessPanel.scss';

export interface EventReadinessPanelProps {
  event: Event;
  planType?: PlanType;
  totalEvents: number;
  className?: string;
}

type CheckState = 'done' | 'open' | 'warn';

interface CheckItem {
  id: string;
  state: CheckState;
  label: string;
  hint?: string;
}

const EventReadinessPanel: React.FC<EventReadinessPanelProps> = ({
  event,
  planType = 'starter',
  totalEvents,
  className = '',
}) => {
  const { t } = useTranslation();

  const accepted = event.acceptedCount ?? 0;
  const pending = event.pendingCount ?? 0;
  const declined = event.declinedCount ?? 0;
  const maybe = event.maybeCount ?? 0;
  const total = event.guestCount ?? 0;
  const responded = accepted + declined + maybe;
  const responseRate =
    total > 0 ? Math.round((responded / total) * 100) : 0;

  const limits = getPlanLimits(planType);
  const eventUsage = getEventUsagePercent(totalEvents, planType);
  const planOk =
    !isFinite(limits.events) || eventUsage < 100;

  const checks: CheckItem[] = [
    {
      id: 'location',
      state: event.location?.trim() ? 'done' : 'open',
      label: t('dashboardHome.readinessCheckLocation'),
      hint: event.location?.trim()
        ? undefined
        : t('dashboardHome.readinessCheckLocationHint'),
    },
    {
      id: 'guests',
      state: total > 0 ? 'done' : 'open',
      label: t('dashboardHome.readinessCheckGuests'),
      hint: total > 0 ? undefined : t('dashboardHome.readinessCheckGuestsHint'),
    },
    {
      id: 'responses',
      state:
        total === 0
          ? 'open'
          : pending > 0
            ? 'warn'
            : responded > 0
              ? 'done'
              : 'open',
      label: t('dashboardHome.readinessCheckResponses'),
      hint:
        pending > 0
          ? t('dashboardHome.readinessCheckResponsesPending', { count: pending })
          : undefined,
    },
    {
      id: 'plan',
      state: planOk ? 'done' : 'warn',
      label: t('dashboardHome.readinessCheckPlan'),
      hint: planOk
        ? undefined
        : t('dashboardHome.readinessCheckPlanHint'),
    },
  ];

  const doneCount = checks.filter((c) => c.state === 'done').length;
  const readinessPercent = Math.round((doneCount / checks.length) * 100);

  const rsvpSegments = [
    { key: 'accepted', value: accepted, className: 'accepted' },
    { key: 'pending', value: pending, className: 'pending' },
    { key: 'declined', value: declined, className: 'declined' },
    { key: 'maybe', value: maybe, className: 'maybe' },
  ].filter((s) => s.value > 0);

  const checkIcon = (state: CheckState) => {
    if (state === 'done') {
      return <CheckCircle2 size={16} aria-hidden className="event-readiness__check-icon--done" />;
    }
    if (state === 'warn') {
      return <AlertCircle size={16} aria-hidden className="event-readiness__check-icon--warn" />;
    }
    return <Circle size={16} aria-hidden className="event-readiness__check-icon--open" />;
  };

  const checkRowIcon = (id: string) => {
    switch (id) {
      case 'location':
        return <MapPin size={14} aria-hidden />;
      case 'guests':
        return <Users size={14} aria-hidden />;
      case 'plan':
        return <Crown size={14} aria-hidden />;
      default:
        return <Users size={14} aria-hidden />;
    }
  };

  return (
    <section
      className={`event-readiness ${className}`.trim()}
      aria-label={t('dashboardHome.readinessAria', { title: event.title })}
    >
      <div className="event-readiness__head">
        <div>
          <p className="event-readiness__eyebrow">
            {t('dashboardHome.readinessEyebrow')}
          </p>
          <h2 className="event-readiness__title">{event.title}</h2>
        </div>
        <div className="event-readiness__score" aria-label={t('dashboardHome.readinessScore', { percent: readinessPercent })}>
          <span className="event-readiness__score-value">{readinessPercent}%</span>
          <span className="event-readiness__score-label">
            {t('dashboardHome.readinessScoreLabel')}
          </span>
        </div>
      </div>

      {total > 0 && (
        <div className="event-readiness__rsvp">
          <div className="event-readiness__rsvp-head">
            <span>{t('dashboardHome.readinessRsvpTitle')}</span>
            <span className="event-readiness__rsvp-rate">{responseRate}%</span>
          </div>
          <div
            className="event-readiness__rsvp-bar"
            role="img"
            aria-label={t('dashboardHome.readinessRsvpBarAria', {
              accepted,
              pending,
              declined,
              maybe,
            })}
          >
            {rsvpSegments.map((seg) => (
              <span
                key={seg.key}
                className={`event-readiness__rsvp-segment event-readiness__rsvp-segment--${seg.className}`}
                style={{ flexGrow: seg.value }}
              />
            ))}
          </div>
          <ul className="event-readiness__rsvp-legend">
            {accepted > 0 && (
              <li>
                <span className="event-readiness__dot event-readiness__dot--accepted" />
                {t('dashboardHome.readinessAccepted', { count: accepted })}
              </li>
            )}
            {pending > 0 && (
              <li>
                <span className="event-readiness__dot event-readiness__dot--pending" />
                {t('dashboardHome.readinessPending', { count: pending })}
              </li>
            )}
            {declined > 0 && (
              <li>
                <span className="event-readiness__dot event-readiness__dot--declined" />
                {t('dashboardHome.readinessDeclined', { count: declined })}
              </li>
            )}
            {maybe > 0 && (
              <li>
                <span className="event-readiness__dot event-readiness__dot--maybe" />
                {t('dashboardHome.readinessMaybe', { count: maybe })}
              </li>
            )}
          </ul>
        </div>
      )}

      <ul className="event-readiness__checks">
        {checks.map((check) => (
          <li
            key={check.id}
            className={`event-readiness__check event-readiness__check--${check.state}`}
          >
            {checkIcon(check.state)}
            <span className="event-readiness__check-icon-meta">
              {checkRowIcon(check.id)}
            </span>
            <div className="event-readiness__check-text">
              <span>{check.label}</span>
              {check.hint && (
                <span className="event-readiness__check-hint">{check.hint}</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Link
        to={`/dashboard/events/${event.id}`}
        className="event-readiness__cta"
      >
        {t('dashboardHome.readinessCta')}
        <ArrowRight size={16} aria-hidden />
      </Link>
    </section>
  );
};

export default EventReadinessPanel;
