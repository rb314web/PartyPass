import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GuestInvitationKind, PartyMember } from '../../types';
import { formatMemberName } from '../../utils/partyInvitationUtils';

export interface RSVPPartyAttendanceProps {
  members: PartyMember[];
  invitationKind?: GuestInvitationKind;
  attendingMemberIds: string[];
  memberDietary: Record<string, string>;
  onToggleMember: (memberId: string, checked: boolean) => void;
  onDietaryChange: (memberId: string, value: string) => void;
  disabled?: boolean;
}

const RSVPPartyAttendance: React.FC<RSVPPartyAttendanceProps> = ({
  members,
  invitationKind,
  attendingMemberIds,
  memberDietary,
  onToggleMember,
  onDietaryChange,
  disabled = false,
}) => {
  const { t } = useTranslation();

  if (members.length <= 1) return null;

  const titleKey =
    invitationKind === 'couple'
      ? 'rsvp.form.partyWhoCouple'
      : 'rsvp.form.partyWhoCompanion';

  return (
    <div className="rsvp-party">
      <p className="rsvp-party__title">{t(titleKey)}</p>
      <ul className="rsvp-party__list">
        {members.map(member => {
          const checked = attendingMemberIds.includes(member.id);
          const name = formatMemberName(member) || t('rsvp.form.partyUnnamed');

          return (
            <li key={member.id} className="rsvp-party__item">
              <label className="rsvp-party__check">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={e => onToggleMember(member.id, e.target.checked)}
                />
                <span>{name}</span>
              </label>
              {checked && (
                <input
                  type="text"
                  className="rsvp-input rsvp-party__dietary"
                  placeholder={t('rsvp.form.placeholders.plusOneDietary')}
                  value={memberDietary[member.id] || member.dietaryRestrictions || ''}
                  disabled={disabled}
                  onChange={e => onDietaryChange(member.id, e.target.value)}
                />
              )}
            </li>
          );
        })}
      </ul>
      {attendingMemberIds.length === 0 && (
        <p className="rsvp-party__hint">{t('rsvp.form.partySelectOne')}</p>
      )}
    </div>
  );
};

export default RSVPPartyAttendance;
