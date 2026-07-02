import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export type RsvpStatusOption = {
  value: string;
  label: string;
  hint: string;
  icon: ReactNode;
};

export const useRsvpStatusOptions = () => {
  const { t } = useTranslation();

  return useMemo<RsvpStatusOption[]>(
    () => [
      {
        value: 'accepted',
        label: t('rsvp.status.accepted.label'),
        hint: t('rsvp.status.accepted.hint'),
        icon: <CheckCircle size={22} />,
      },
      {
        value: 'maybe',
        label: t('rsvp.status.maybe.label'),
        hint: t('rsvp.status.maybe.hint'),
        icon: <HelpCircle size={22} />,
      },
      {
        value: 'declined',
        label: t('rsvp.status.declined.label'),
        hint: t('rsvp.status.declined.hint'),
        icon: <XCircle size={22} />,
      },
    ],
    [t]
  );
};
