// pages/RSVP/RSVP.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Shirt,
  Info,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowLeft,
  AlertCircle,
  Loader,
  Send,
  PenLine,
  PartyPopper,
} from 'lucide-react';
import AppLoader from '../../components/common/AppLoader/AppLoader';
import LanguageSwitcher from '../../components/common/LanguageSwitcher/LanguageSwitcher';
import LazyEventLocationMap from '../../components/dashboard/Events/EventDetails/EventLocationMap/LazyEventLocationMap';
import EventWeatherPanel from '../../components/common/EventWeatherPanel/EventWeatherPanel';
import { NewRSVPService } from '../../services/firebase/newRSVPService';
import { NotificationTriggers } from '../../services/notificationTriggers';
import { RSVPResponse, Guest, Event, GuestStatus, PartyMember, GuestInvitationKind } from '../../types';
import RSVPEventCountdown from './RSVPEventCountdown';
import RSVPCalendarActions from './RSVPCalendarActions';
import RSVPOrganizerContact from './RSVPOrganizerContact';
import RSVPPartyAttendance from './RSVPPartyAttendance';
import {
  getInvitedSeatCount,
  getPartyDisplayLabel,
  formatMemberName,
  resolvePartyMembers,
} from '../../utils/partyInvitationUtils';
import {
  formatRsvpLocationDisplay,
  formatRsvpDeadlineLabel,
  getRsvpResponseDeadline,
  resolveRsvpDeadlineFromDates,
  isRsvpDeadlinePassed,
} from '../../utils/rsvpEventHelpers';
import { formatAppDate } from '../../utils/locale';
import '../../components/common/LanguageSwitcher/LanguageSwitcher.scss';
import './RSVPEventCountdown.scss';
import './RSVP.scss';

type StatusOption = {
  value: Extract<GuestStatus, 'accepted' | 'declined' | 'maybe'>;
  label: string;
  hint: string;
  icon: React.ReactNode;
};

type RsvpSubmittedStatus = 'accepted' | 'maybe' | 'declined';

const SUBMITTED_ICON_MODIFIERS: Record<
  RsvpSubmittedStatus,
  'success' | 'warning' | 'declined'
> = {
  accepted: 'success',
  maybe: 'warning',
  declined: 'declined',
};

const SUBMITTED_SHOW_EVENT_DETAILS: Record<RsvpSubmittedStatus, boolean> = {
  accepted: true,
  maybe: true,
  declined: false,
};

const getSubmittedStatusIcon = (status: RsvpSubmittedStatus): React.ReactNode => {
  switch (status) {
    case 'accepted':
      return <PartyPopper size={36} />;
    case 'maybe':
      return <HelpCircle size={36} />;
    case 'declined':
      return <XCircle size={36} />;
  }
};

const RSVP: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyResponded, setAlreadyResponded] = useState(false);
  const [deadlineExpired, setDeadlineExpired] = useState(false);
  // Ostatnia zapisana odpowiedź gościa (do odznacznika) — niezależna od bieżącego wyboru w formularzu
  const [savedStatus, setSavedStatus] = useState<GuestStatus>('pending');

  // Form state
  const [selectedStatus, setSelectedStatus] = useState<GuestStatus>('pending');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [notes, setNotes] = useState('');
  const [plusOne, setPlusOne] = useState(false);
  const [plusOneDetails, setPlusOneDetails] = useState({
    firstName: '',
    lastName: '',
    dietaryRestrictions: '',
  });
  const [partyMembers, setPartyMembers] = useState<PartyMember[]>([]);
  const [invitationKind, setInvitationKind] = useState<GuestInvitationKind>('individual');
  const [invitedSeatCount, setInvitedSeatCount] = useState(1);
  const [attendingMemberIds, setAttendingMemberIds] = useState<string[]>([]);
  const [memberDietary, setMemberDietary] = useState<Record<string, string>>({});

  const isMultiSeat = invitedSeatCount > 1 || partyMembers.length > 1;

  const statusOptions = useMemo<StatusOption[]>(
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

  const statusBadge = useMemo(
    () => ({
      accepted: {
        label: t('rsvp.status.accepted.label'),
        modifier: 'accepted',
        icon: <CheckCircle size={15} />,
      },
      maybe: {
        label: t('rsvp.status.maybe.label'),
        modifier: 'maybe',
        icon: <HelpCircle size={15} />,
      },
      declined: {
        label: t('rsvp.status.declined.label'),
        modifier: 'declined',
        icon: <XCircle size={15} />,
      },
    }),
    [t]
  );

  const loadRSVPData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDeadlineExpired(false);

      if (!token) {
        setError(t('rsvp.errors.missingToken'));
        return;
      }

      const rsvpData = await NewRSVPService.getRSVPData(token);
      if (!rsvpData) {
        setError(t('rsvp.errors.tokenNotFound'));
        return;
      }

      const { eventGuest, event: eventData } = rsvpData;
      const members = resolvePartyMembers(eventGuest);
      const seats = getInvitedSeatCount(eventGuest);

      setGuest({
        id: eventGuest.id,
        userId: eventGuest.userId,
        eventId: eventGuest.eventId,
        firstName: eventGuest.firstName,
        lastName: eventGuest.lastName,
        email: eventGuest.email,
        status: eventGuest.status,
        invitedAt: eventGuest.invitedAt,
        respondedAt: eventGuest.respondedAt,
        createdAt: eventGuest.createdAt,
        updatedAt: eventGuest.updatedAt,
        phone: eventGuest.phone,
        dietaryRestrictions: eventGuest.dietaryRestrictions,
        notes: eventGuest.notes,
        plusOne: eventGuest.plusOne,
        eventName: eventData.title,
        eventDate: eventData.date,
      });
      setEvent(eventData);
      setPartyMembers(members);
      setInvitationKind(eventGuest.invitationKind || (seats > 1 ? 'couple' : 'individual'));
      setInvitedSeatCount(seats);
      setSavedStatus(eventGuest.status);

      const defaultAttending =
        eventGuest.attendingMemberIds && eventGuest.attendingMemberIds.length > 0
          ? eventGuest.attendingMemberIds
          : members.map(m => m.id);

      if (eventGuest.status !== 'pending') {
        setSelectedStatus(eventGuest.status);
        setDietaryRestrictions(eventGuest.dietaryRestrictions || '');
        setNotes(eventGuest.notes || '');
        setPlusOne(eventGuest.plusOne || false);
        setAttendingMemberIds(
          eventGuest.status === 'declined' ? [] : defaultAttending
        );
        setAlreadyResponded(true);
      } else {
        setAttendingMemberIds(members.map(m => m.id));
      }

      const deadline = resolveRsvpDeadlineFromDates(
        eventData.rsvpDeadline,
        eventData.date
      );
      if (isRsvpDeadlinePassed(deadline)) {
        setDeadlineExpired(true);
      }
    } catch (err: any) {
      console.error('Błąd podczas ładowania danych RSVP:', err);
      setError(err.message || t('rsvp.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    if (token) {
      loadRSVPData();
    }
  }, [token, loadRSVPData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || selectedStatus === 'pending') return;

    if (
      isMultiSeat &&
      (selectedStatus === 'accepted' || selectedStatus === 'maybe') &&
      attendingMemberIds.length === 0
    ) {
      setError(t('rsvp.form.partySelectOne'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response: RSVPResponse = {
        status: selectedStatus,
        dietaryRestrictions: dietaryRestrictions.trim(),
        notes: notes.trim(),
        plusOne:
          selectedStatus === 'accepted' && !isMultiSeat ? plusOne : false,
        plusOneDetails:
          selectedStatus === 'accepted' && !isMultiSeat && plusOne
            ? plusOneDetails
            : undefined,
        attendingMemberIds:
          isMultiSeat &&
          (selectedStatus === 'accepted' || selectedStatus === 'maybe')
            ? attendingMemberIds
            : undefined,
        memberDietary:
          isMultiSeat &&
          (selectedStatus === 'accepted' || selectedStatus === 'maybe')
            ? memberDietary
            : undefined,
      };

      await NewRSVPService.processRSVPResponse(token, response);
      setSavedStatus(selectedStatus);
      setAlreadyResponded(true);
      setSubmitted(true);

      if (event && guest) {
        void NotificationTriggers.onGuestResponse(
          event.id,
          guest.id,
          response,
          {
            event,
            guestName: `${guest.firstName} ${guest.lastName}`.trim(),
            guestEmail: guest.email,
          }
        );
      }
    } catch (err: any) {
      console.error('Błąd podczas wysyłania odpowiedzi:', err);
      setError(err.message || t('rsvp.errors.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatFullDate = (date: Date) =>
    formatAppDate(date, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const formatTime = (date: Date) =>
    formatAppDate(date, {
      hour: '2-digit',
      minute: '2-digit',
    });

  const renderStateEventBlock = (eventData: Event) => {
    const location = eventData.location
      ? formatRsvpLocationDisplay(eventData.location, { maxLength: 48 })
      : null;

    return (
      <div className="rsvp-state-card__event">
        <h3>{eventData.title}</h3>
        <ul className="rsvp-state-card__meta">
          <li className="rsvp-state-card__meta-item">
            <Calendar size={16} aria-hidden="true" />
            <span>
              {formatFullDate(eventData.date)}, {formatTime(eventData.date)}
            </span>
          </li>
          {location?.primary && (
            <li className="rsvp-state-card__meta-item">
              <MapPin size={16} aria-hidden="true" />
              <span title={location.full}>{location.primary}</span>
            </li>
          )}
        </ul>
      </div>
    );
  };

  const renderStateCardHead = (
    icon: React.ReactNode,
    iconModifier: string,
    title: string,
    message?: string
  ) => (
    <div className="rsvp-state-card__head">
      <div className={`rsvp-state-card__icon rsvp-state-card__icon--${iconModifier}`}>
        {icon}
      </div>
      <div className="rsvp-state-card__intro">
        <h2>{title}</h2>
        {message && <p>{message}</p>}
      </div>
    </div>
  );

  if (loading) {
    return <AppLoader />;
  }

  if (error && (!guest || !event)) {
    return (
      <div className="rsvp rsvp--state">
        <div className="rsvp-state-card">
          {renderStateCardHead(
            <AlertCircle size={32} />,
            'error',
            t('rsvp.errors.genericTitle'),
            error
          )}
          <div className="rsvp-state-card__actions">
            <button className="rsvp-btn rsvp-btn--ghost" onClick={() => navigate('/')}>
              <ArrowLeft size={18} />
              {t('common.backToHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    const submittedStatus: RsvpSubmittedStatus =
      selectedStatus === 'accepted' ||
      selectedStatus === 'maybe' ||
      selectedStatus === 'declined'
        ? selectedStatus
        : 'accepted';
    const guestDisplayName = guest
      ? getPartyDisplayLabel({
          ...guest,
          partyMembers,
          invitedSeatCount,
          invitationKind,
        }) || guest.firstName?.trim()
      : undefined;
    const submittedCopy = {
      iconModifier: SUBMITTED_ICON_MODIFIERS[submittedStatus],
      showEventDetails: SUBMITTED_SHOW_EVENT_DETAILS[submittedStatus],
      title: guestDisplayName
        ? t(`rsvp.submitted.${submittedStatus}.titleWithName`, {
            name: guestDisplayName,
          })
        : t(`rsvp.submitted.${submittedStatus}.title`),
      message: t(`rsvp.submitted.${submittedStatus}.message`),
    };
    const { date: responseDeadline } = event
      ? getRsvpResponseDeadline(event)
      : { date: new Date() };
    const deadlinePassed = isRsvpDeadlinePassed(responseDeadline);
    const deadlineLabel = formatRsvpDeadlineLabel(responseDeadline);

    return (
      <div className="rsvp rsvp--state">
        <div className="rsvp-state-card">
          {renderStateCardHead(
            getSubmittedStatusIcon(submittedStatus),
            submittedCopy.iconModifier,
            submittedCopy.title,
            submittedCopy.message
          )}

          {submittedCopy.showEventDetails && event && renderStateEventBlock(event)}

          {event && !deadlinePassed && (
            <p className="rsvp-state-card__hint rsvp-state-card__hint--deadline">
              <Clock size={16} aria-hidden="true" />
              <span>{t('rsvp.submitted.changeResponseHint', { deadline: deadlineLabel })}</span>
            </p>
          )}

          {event && deadlinePassed && (
            <p className="rsvp-state-card__hint">
              {t('rsvp.form.deadlineHint.passed')}
            </p>
          )}

          <div className="rsvp-state-card__actions">
            {!deadlinePassed && (
              <button
                type="button"
                className="rsvp-btn rsvp-btn--primary"
                onClick={() => {
                  setSubmitted(false);
                  setAlreadyResponded(true);
                }}
              >
                <PenLine size={18} />
                {t('rsvp.submitted.changeResponse')}
              </button>
            )}
            <button
              type="button"
              className="rsvp-btn rsvp-btn--ghost"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={18} />
              {t('common.backToHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (deadlineExpired && event) {
    const savedLabel =
      savedStatus !== 'pending' ? statusBadge[savedStatus]?.label : null;
    // Rozróżnienie: wydarzenie już się odbyło vs. minął tylko termin RSVP (wydarzenie wciąż przed nami)
    const eventHasPassed = event.date.getTime() < Date.now();
    return (
      <div className="rsvp rsvp--state">
        <div className="rsvp-state-card">
          {renderStateCardHead(
            eventHasPassed ? <Calendar size={32} /> : <Clock size={32} />,
            'info',
            eventHasPassed
              ? t('rsvp.deadlineExpired.eventPassed.title')
              : t('rsvp.deadlineExpired.rsvpDeadlinePassed.title'),
            `${eventHasPassed
              ? t('rsvp.deadlineExpired.eventPassed.body')
              : t('rsvp.deadlineExpired.rsvpDeadlinePassed.body')}${
              savedLabel
                ? t('rsvp.deadlineExpired.lastResponseSuffix', { status: savedLabel })
                : ''
            }`
          )}

          {renderStateEventBlock(event)}

          <p className="rsvp-state-card__hint">
            {eventHasPassed
              ? t('rsvp.deadlineExpired.eventPassed.hint')
              : t('rsvp.deadlineExpired.rsvpDeadlinePassed.hint')}
          </p>

          <div className="rsvp-state-card__actions">
            <button
              type="button"
              className="rsvp-btn rsvp-btn--ghost"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={18} />
              {t('common.backToHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!guest || !event) {
    return (
      <div className="rsvp rsvp--state">
        <div className="rsvp-state-card">
          {renderStateCardHead(
            <AlertCircle size={32} />,
            'error',
            t('rsvp.notFound.title'),
            t('rsvp.notFound.body')
          )}
        </div>
      </div>
    );
  }

  const initials =
    isMultiSeat && partyMembers.length > 1
      ? partyMembers
          .slice(0, 2)
          .map(member => member.firstName?.[0] ?? member.lastName?.[0] ?? '')
          .join('')
          .toUpperCase()
      : `${guest.firstName?.[0] ?? ''}${guest.lastName?.[0] ?? ''}`.trim().toUpperCase();
  const formatHeroWhen = (date: Date) => {
    const day = formatAppDate(date, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return `${day} · ${formatTime(date)}`;
  };

  // Termin na zmianę odpowiedzi
  const { date: responseDeadline } = getRsvpResponseDeadline(event);
  const deadlinePassed = isRsvpDeadlinePassed(responseDeadline);
  const deadlineLabel = formatRsvpDeadlineLabel(responseDeadline);
  const savedBadge =
    savedStatus !== 'pending' ? statusBadge[savedStatus] : null;

  const invitationLabel =
    getPartyDisplayLabel({
      ...guest,
      partyMembers,
      invitedSeatCount,
      invitationKind,
    }) || `${guest.firstName} ${guest.lastName}`.trim();

  const handleToggleMember = (memberId: string, checked: boolean) => {
    setAttendingMemberIds(prev => {
      if (checked) return [...new Set([...prev, memberId])];
      return prev.filter(id => id !== memberId);
    });
  };

  const calendarEvent = {
    title: event.title,
    description: event.description,
    location: event.location,
    date: event.date,
  };

  const heroLocation = event.location
    ? formatRsvpLocationDisplay(event.location, { maxLength: 40 })
    : null;

  const hasOrganizerContact =
    Boolean(event.organizerEmail?.trim()) ||
    Boolean(event.organizerPhone?.trim());
  const hasExtraDetails = Boolean(event.dresscode || event.additionalInfo);

  return (
    <div className="rsvp">
      <div className="rsvp__shell">
        <aside className="rsvp__aside">
          <form className="rsvp-form-card" onSubmit={handleSubmit}>
            <div className="rsvp-form-card__guest">
              <div className="rsvp-avatar" aria-hidden="true">
                {initials || <Users size={20} />}
              </div>
              <div className="rsvp-form-card__guest-text">
                <span className="rsvp-form-card__guest-label">
                  {t('rsvp.common.invitationFor')}
                </span>
                {isMultiSeat && partyMembers.length > 1 ? (
                  <div className="rsvp-form-card__guest-names">
                    {partyMembers.map(member => {
                      const name = formatMemberName(member);
                      if (!name) return null;

                      return (
                        <span key={member.id} className="rsvp-form-card__guest-name">
                          {name}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className="rsvp-form-card__guest-name">
                    {invitationLabel}
                  </span>
                )}
                {guest.email && (
                  <span className="rsvp-form-card__guest-email">
                    {guest.email}
                  </span>
                )}
              </div>
              {savedBadge && (
                <span
                  className={`rsvp-status-badge rsvp-status-badge--${savedBadge.modifier}`}
                >
                  {savedBadge.icon}
                  {savedBadge.label}
                </span>
              )}
            </div>

            {alreadyResponded && (
              <div className="rsvp-form-card__note">
                <Info size={16} />
                <span>
                  {t('rsvp.form.responseSavedHint', { deadline: deadlineLabel })}
                </span>
              </div>
            )}

            <div className="rsvp-form-card__body">
              <h2 className="rsvp-form-card__title">{t('rsvp.form.willYouAttend')}</h2>

              <div className="rsvp-options" role="radiogroup">
                {statusOptions.map(option => (
                  <label
                    key={option.value}
                    className={`rsvp-option rsvp-option--${option.value} ${
                      selectedStatus === option.value ? 'is-selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={selectedStatus === option.value}
                      onChange={() => setSelectedStatus(option.value)}
                    />
                    <span className="rsvp-option__icon">{option.icon}</span>
                    <span className="rsvp-option__text">
                      <span className="rsvp-option__label">{option.label}</span>
                      <span className="rsvp-option__hint">{option.hint}</span>
                    </span>
                  </label>
                ))}
              </div>

              {(selectedStatus === 'accepted' || selectedStatus === 'maybe') && (
                <div className="rsvp-form-card__extra">
                  {isMultiSeat && (
                      <RSVPPartyAttendance
                        members={partyMembers}
                        invitationKind={invitationKind}
                        attendingMemberIds={attendingMemberIds}
                        memberDietary={memberDietary}
                        onToggleMember={handleToggleMember}
                        onDietaryChange={(memberId, value) =>
                          setMemberDietary(prev => ({
                            ...prev,
                            [memberId]: value,
                          }))
                        }
                        disabled={deadlinePassed}
                      />
                    )}

                  {selectedStatus === 'accepted' && !isMultiSeat && event.allowPlusOne && (
                    <div className="rsvp-field">
                      <label className="rsvp-switch">
                        <input
                          type="checkbox"
                          checked={plusOne}
                          onChange={e => setPlusOne(e.target.checked)}
                        />
                        <span className="rsvp-switch__track" aria-hidden="true">
                          <span className="rsvp-switch__thumb" />
                        </span>
                        <span className="rsvp-switch__label">
                          {t('rsvp.form.plusOne')}
                        </span>
                      </label>

                      {plusOne && (
                        <div className="rsvp-plus-one">
                          <div className="rsvp-plus-one__row">
                            <input
                              type="text"
                              className="rsvp-input"
                              placeholder={t('rsvp.form.placeholders.firstName')}
                              value={plusOneDetails.firstName}
                              onChange={e =>
                                setPlusOneDetails(prev => ({
                                  ...prev,
                                  firstName: e.target.value,
                                }))
                              }
                            />
                            <input
                              type="text"
                              className="rsvp-input"
                              placeholder={t('rsvp.form.placeholders.lastName')}
                              value={plusOneDetails.lastName}
                              onChange={e =>
                                setPlusOneDetails(prev => ({
                                  ...prev,
                                  lastName: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <input
                            type="text"
                            className="rsvp-input"
                            placeholder={t('rsvp.form.placeholders.plusOneDietary')}
                            value={plusOneDetails.dietaryRestrictions}
                            onChange={e =>
                              setPlusOneDetails(prev => ({
                                ...prev,
                                dietaryRestrictions: e.target.value,
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rsvp-field">
                    <label className="rsvp-label">
                      {t('rsvp.form.labels.dietaryRestrictions')}
                    </label>
                    <input
                      type="text"
                      className="rsvp-input"
                      placeholder={t('rsvp.form.placeholders.dietaryRestrictions')}
                      value={dietaryRestrictions}
                      onChange={e => setDietaryRestrictions(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="rsvp-field">
                <label className="rsvp-label">{t('rsvp.form.labels.notes')}</label>
                <textarea
                  className="rsvp-input rsvp-input--textarea"
                  placeholder={t('rsvp.form.placeholders.notes')}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="rsvp-form-card__footer">
              {error && (
                <div className="rsvp-alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="rsvp-btn rsvp-btn--primary"
                disabled={submitting || selectedStatus === 'pending' || deadlinePassed}
              >
                {submitting ? (
                  <>
                    <Loader className="rsvp-spin" size={20} />
                    {t('rsvp.form.submit.sending')}
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {alreadyResponded
                      ? t('rsvp.form.submit.saveChange')
                      : t('rsvp.form.submit.sendResponse')}
                  </>
                )}
              </button>
              <p className="rsvp-form-card__hint">
                {deadlinePassed
                  ? t('rsvp.form.deadlineHint.passed')
                  : t('rsvp.form.deadlineHint.active', { deadline: deadlineLabel })}
              </p>
            </div>
          </form>
        </aside>

        <main className="rsvp__main">
          <section className="rsvp-hero">
            <div className="rsvp-hero__top">
              <span className="rsvp-hero__eyebrow">{t('rsvp.common.invitation')}</span>
              <div className="rsvp-hero__top-actions">
                <LanguageSwitcher compact variant="hero" />
                <RSVPEventCountdown eventDate={event.date} compact />
              </div>
            </div>

            <div className="rsvp-hero__content">
              <h1 className="rsvp-hero__title">{event.title}</h1>

              <ul className="rsvp-hero__meta">
                <li className="rsvp-hero__meta-item">
                  <Calendar size={16} aria-hidden="true" />
                  <span>{formatHeroWhen(event.date)}</span>
                </li>
                {heroLocation && (
                  <li className="rsvp-hero__meta-item rsvp-hero__meta-item--location">
                    <MapPin size={16} aria-hidden="true" />
                    <span title={heroLocation.full}>{heroLocation.primary}</span>
                  </li>
                )}
              </ul>

              {event.description && (
                <p className="rsvp-hero__lead">{event.description}</p>
              )}
            </div>
          </section>

          <section className="rsvp-card rsvp-card--plan">
            <h2 className="rsvp-card__title">{t('rsvp.eventDetails.getReady')}</h2>
            <RSVPCalendarActions event={calendarEvent} embedded />
            {event.location && (
              <>
                <div className="rsvp-card__divider" />
                <h3 className="rsvp-card__subtitle">{t('rsvp.eventDetails.weatherAndAttire')}</h3>
                <EventWeatherPanel
                  variant="rsvp"
                  showPackingTips
                  showLocation={false}
                  location={event.location}
                  latitude={event.latitude}
                  longitude={event.longitude}
                  eventDate={event.date}
                />
              </>
            )}
          </section>

          {event.location && (
            <section className="rsvp-card rsvp-card--location">
              <h2 className="rsvp-card__title">{t('rsvp.eventDetails.location')}</h2>
              <div className="rsvp-location__map">
                <LazyEventLocationMap
                  location={event.location}
                  themeMode="system"
                />
              </div>
            </section>
          )}

          {hasExtraDetails && (
            <section className="rsvp-card">
              <h2 className="rsvp-card__title">{t('rsvp.eventDetails.details')}</h2>
              <ul className="rsvp-details">
                {event.dresscode && (
                  <li className="rsvp-details__item">
                    <span className="rsvp-details__icon">
                      <Shirt size={18} />
                    </span>
                    <div>
                      <span className="rsvp-details__label">
                        {t('rsvp.eventDetails.dressCode')}
                      </span>
                      <p className="rsvp-details__value">{event.dresscode}</p>
                    </div>
                  </li>
                )}

                {event.additionalInfo && (
                  <li className="rsvp-details__item">
                    <span className="rsvp-details__icon">
                      <Info size={18} />
                    </span>
                    <div>
                      <span className="rsvp-details__label">
                        {t('rsvp.eventDetails.additionalInfo')}
                      </span>
                      <p className="rsvp-details__value">
                        {event.additionalInfo}
                      </p>
                    </div>
                  </li>
                )}
              </ul>
            </section>
          )}

          {hasOrganizerContact && (
            <section className="rsvp-card rsvp-card--contact">
              <h2 className="rsvp-card__title">{t('rsvp.eventDetails.haveQuestion')}</h2>
              <RSVPOrganizerContact
                organizerEmail={event.organizerEmail}
                organizerPhone={event.organizerPhone}
                eventTitle={event.title}
              />
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default RSVP;
