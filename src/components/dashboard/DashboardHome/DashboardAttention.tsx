import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Clock,
  Users,
  Crown,
  ArrowRight,
} from 'lucide-react';
import {
  getPlanLimits,
  getEventUsagePercent,
  getContactUsagePercent,
  type PlanType,
} from '../../../services/firebase/planLimitsService';
import type { Event } from '../../../types';
import './DashboardAttention.scss';

export interface DashboardAttentionProps {
  pendingGuests: number;
  nextEvent: Event | null;
  planType?: PlanType;
  totalEvents: number;
  totalContacts: number;
}

type AttentionSeverity = 'info' | 'warning' | 'urgent';

interface AttentionItem {
  id: string;
  severity: AttentionSeverity;
  icon: React.ReactNode;
  message: string;
  actionLabel: string;
  actionTo: string;
}

const DashboardAttention: React.FC<DashboardAttentionProps> = ({
  pendingGuests,
  nextEvent,
  planType = 'starter',
  totalEvents,
  totalContacts,
}) => {
  const { t } = useTranslation();

  const items = React.useMemo(() => {
    const list: AttentionItem[] = [];
    const limits = getPlanLimits(planType);

    if (pendingGuests > 0) {
      const nextPending = nextEvent?.pendingCount ?? 0;
      const message =
        nextEvent && nextPending > 0
          ? pendingGuests === nextPending
            ? t('dashboardHome.attentionPendingEventSingle', {
                count: nextPending,
                title: nextEvent.title,
              })
            : t('dashboardHome.attentionPendingEvent', {
                total: pendingGuests,
                pending: nextPending,
                title: nextEvent.title,
              })
          : t('dashboardHome.attentionPending', { count: pendingGuests });

      list.push({
        id: 'pending-rsvp',
        severity: 'urgent',
        icon: <Users size={18} aria-hidden />,
        message,
        actionLabel: nextEvent
          ? t('dashboardHome.attentionManageGuests')
          : t('dashboardHome.attentionViewContacts'),
        actionTo: nextEvent
          ? `/dashboard/events/${nextEvent.id}`
          : '/dashboard/contacts',
      });
    }

    const eventUsage = getEventUsagePercent(totalEvents, planType);
    if (isFinite(limits.events) && eventUsage >= 80) {
      list.push({
        id: 'plan-events',
        severity: eventUsage >= 95 ? 'urgent' : 'warning',
        icon: <Crown size={18} aria-hidden />,
        message: t('dashboardHome.attentionPlanEvents', {
          used: totalEvents,
          max: limits.events,
          percent: eventUsage,
        }),
        actionLabel: t('dashboardHome.attentionChangePlan'),
        actionTo: '/dashboard/plan',
      });
    }

    const contactUsage = getContactUsagePercent(totalContacts, planType);
    if (isFinite(limits.contacts) && contactUsage >= 80) {
      list.push({
        id: 'plan-contacts',
        severity: contactUsage >= 95 ? 'urgent' : 'warning',
        icon: <Crown size={18} aria-hidden />,
        message: t('dashboardHome.attentionPlanContacts', {
          used: totalContacts,
          max: limits.contacts,
          percent: contactUsage,
        }),
        actionLabel: t('dashboardHome.attentionChangePlan'),
        actionTo: '/dashboard/plan',
      });
    }

    if (nextEvent) {
      const eventDate = new Date(nextEvent.date);
      const now = new Date();
      const diffMs = eventDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 2) {
        const when =
          diffDays === 0
            ? t('dashboardHome.attentionEventToday')
            : diffDays === 1
              ? t('dashboardHome.attentionEventTomorrow')
              : t('dashboardHome.attentionEventInDays', { count: diffDays });
        list.push({
          id: 'next-event-soon',
          severity: diffDays === 0 ? 'urgent' : 'warning',
          icon: <Clock size={18} aria-hidden />,
          message: t('dashboardHome.attentionEventSoon', {
            title: nextEvent.title,
            when,
          }),
          actionLabel: t('dashboardHome.attentionOpenEvent'),
          actionTo: `/dashboard/events/${nextEvent.id}`,
        });
      }
    }

    const seen = new Set<string>();
    return list
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .slice(0, 3);
  }, [pendingGuests, nextEvent, planType, totalEvents, totalContacts, t]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="dashboard-attention" aria-label={t('dashboardHome.attentionTitle')}>
      <div className="dashboard-attention__head">
        <AlertCircle size={16} aria-hidden />
        <span>{t('dashboardHome.attentionTitle')}</span>
      </div>
      <ul className="dashboard-attention__list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`dashboard-attention__item dashboard-attention__item--${item.severity}`}
          >
            <span className="dashboard-attention__icon">{item.icon}</span>
            <p className="dashboard-attention__message">{item.message}</p>
            <Link to={item.actionTo} className="dashboard-attention__action">
              {item.actionLabel}
              <ArrowRight size={14} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default DashboardAttention;
