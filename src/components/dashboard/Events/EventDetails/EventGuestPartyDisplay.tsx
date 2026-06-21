import React from 'react';
import type { EventGuest, GuestStatus } from '../../../../types';
import {
  formatMemberName,
  isMultiSeatInvitation,
  resolvePartyMembers,
} from '../../../../utils/partyInvitationUtils';

export interface EventGuestPartyDisplayProps {
  eventGuest: EventGuest;
}

const EventGuestPartyDisplay: React.FC<EventGuestPartyDisplayProps> = ({
  eventGuest,
}) => {
  if (!isMultiSeatInvitation(eventGuest)) return null;

  const members = resolvePartyMembers(eventGuest);
  if (members.length <= 1) return null;

  const status: GuestStatus = eventGuest.status || 'pending';
  const attendingIds = eventGuest.attendingMemberIds || [];

  if (status === 'declined') {
    return (
      <p className="event-details__guest-party-note">Nie przychodzą</p>
    );
  }

  const isMemberAttending = (memberId: string) => {
    if (attendingIds.length) return attendingIds.includes(memberId);
    return status === 'accepted' || status === 'maybe';
  };

  return (
    <p className="event-details__guest-party-note">
      {members.map((member, index) => {
        const name = formatMemberName(member) || 'Osoba towarzysząca';
        const attending = isMemberAttending(member.id);

        return (
          <React.Fragment key={member.id}>
            {index > 0 && <span className="event-details__guest-party-sep">·</span>}
            <span
              className={`event-details__guest-party-person${
                attending ? ' event-details__guest-party-person--yes' : ' event-details__guest-party-person--no'
              }`}
            >
              {name}
            </span>
          </React.Fragment>
        );
      })}
    </p>
  );
};

export default EventGuestPartyDisplay;
