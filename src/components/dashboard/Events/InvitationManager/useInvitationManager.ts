import { useCallback, useEffect, useMemo, useState } from 'react';
import { NewRSVPService } from '../../../../services/firebase/newRSVPService';
import { InvitationService } from '../../../../services/firebase/invitationService';
import {
  Event,
  GuestInvitation,
  InvitationDelivery,
  InvitationKind,
  InvitationSendResult,
} from '../../../../types';
import {
  buildPrintHtml,
  countByFilter,
  DeliveryMethod,
  getDefaultMessage,
  getDefaultSubject,
  GuestFilter,
  matchesGuestFilter,
  SendPhase,
} from './invitationManagerUtils';

export function useInvitationManager(event: Event) {
  const [invitations, setInvitations] = useState<GuestInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<GuestFilter>('pending');
  const [kind, setKind] = useState<InvitationKind>('invitation');
  const [method, setMethod] = useState<DeliveryMethod>('email');
  const [subject, setSubject] = useState(() =>
    getDefaultSubject('invitation', event.title)
  );
  const [message, setMessage] = useState('');
  const [includeQr, setIncludeQr] = useState(true);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [phase, setPhase] = useState<SendPhase>('idle');
  const [sendResult, setSendResult] = useState<InvitationSendResult | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const emailSetup = InvitationService.getEmailSetupStatus();

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const generated = await NewRSVPService.generateInvitationsForEvent(event.id);

      let logs: Awaited<
        ReturnType<typeof InvitationService.getInvitationLogsForEvent>
      > = [];
      try {
        logs = await InvitationService.getInvitationLogsForEvent(event.id);
      } catch {
        // opcjonalne
      }

      const lastSent = InvitationService.getLastSentByGuest(logs);
      const enriched = generated.map(inv => ({
        ...inv,
        lastInvitationSentAt:
          inv.lastInvitationSentAt ?? lastSent.get(inv.eventGuestId),
      }));

      setInvitations(enriched);

      const pendingIds = enriched
        .filter(i => i.status === 'pending' || i.status === 'maybe')
        .map(i => i.eventGuestId);
      setSelectedIds(
        pendingIds.length > 0 ? pendingIds : enriched.map(i => i.eventGuestId)
      );
    } catch (err) {
      console.error(err);
      setLoadError('Nie udało się przygotować zaproszeń. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    setSubject(getDefaultSubject(kind, event.title));
    setMessage(getDefaultMessage(kind, event.title));
  }, [kind, event.title]);

  const visible = useMemo(
    () => invitations.filter(inv => matchesGuestFilter(inv, filter)),
    [invitations, filter]
  );

  const filterCounts = useMemo(
    () => ({
      all: invitations.length,
      pending: countByFilter(invitations, 'pending'),
      hasEmail: countByFilter(invitations, 'hasEmail'),
      hasPhone: countByFilter(invitations, 'hasPhone'),
    }),
    [invitations]
  );

  const selected = useMemo(
    () => invitations.filter(inv => selectedIds.includes(inv.eventGuestId)),
    [invitations, selectedIds]
  );

  const emailCount = selected.filter(inv => inv.email?.trim()).length;
  const phoneCount = selected.filter(inv => inv.phone?.trim()).length;

  const allVisibleSelected =
    visible.length > 0 &&
    visible.every(inv => selectedIds.includes(inv.eventGuestId));

  const toggleGuest = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAllVisible = () => {
    const ids = visible.map(v => v.eventGuestId);
    if (allVisibleSelected) {
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...ids])));
    }
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  };

  const downloadQr = (inv: GuestInvitation) => {
    if (!inv.qrCode) return;
    const link = document.createElement('a');
    link.download = `qr-${inv.firstName}-${inv.lastName}.png`;
    link.href = inv.qrCode;
    link.click();
  };

  const openSms = (items: GuestInvitation[]) => {
    const guest = items.find(inv => inv.phone?.trim());
    if (!guest?.phone) {
      throw new Error('Żaden z wybranych gości nie ma numeru telefonu');
    }
    const body = encodeURIComponent(
      NewRSVPService.generateSMSMessage(guest, event)
    );
    window.open(`sms:${guest.phone}?body=${body}`, '_blank');
  };

  const openPrint = (items: GuestInvitation[]) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(buildPrintHtml(event, items));
    win.document.close();
    win.print();
  };

  const send = async () => {
    if (selected.length === 0 || phase === 'sending') return;

    setPhase('sending');
    setSendResult(null);
    setSendError(null);

    const delivery: InvitationDelivery = {
      method,
      recipients: selected.map(s => s.email),
      subject,
      message,
      includeQR: includeQr,
      kind,
    };

    try {
      if (method === 'email') {
        const result = await NewRSVPService.sendEmailInvitations(
          selected,
          event,
          delivery
        );
        setSendResult(result);
        setPhase(result.failed > 0 ? 'error' : 'success');
        if (result.failed === 0) await reload();
      } else if (method === 'sms') {
        openSms(selected);
        setPhase('success');
      } else {
        openPrint(selected);
        setPhase('success');
      }
    } catch (err) {
      const partial = (err as { sendResult?: InvitationSendResult }).sendResult;
      if (partial) setSendResult(partial);
      setSendError(
        err instanceof Error ? err.message : 'Nie udało się wysłać zaproszeń'
      );
      setPhase('error');
    } finally {
      window.setTimeout(() => setPhase('idle'), 4000);
    }
  };

  const canSend =
    selected.length > 0 &&
    phase !== 'sending' &&
    (method !== 'email' || emailCount > 0) &&
    (method !== 'sms' || phoneCount > 0);

  const previewGuest = previewToken
    ? invitations.find(i => i.rsvpToken === previewToken) ?? null
    : null;

  return {
    loading,
    loadError,
    invitations,
    visible,
    filter,
    setFilter,
    filterCounts,
    kind,
    setKind,
    selectedIds,
    toggleGuest,
    toggleAllVisible,
    allVisibleSelected,
    selected,
    emailCount,
    phoneCount,
    method,
    setMethod,
    subject,
    setSubject,
    message,
    setMessage,
    includeQr,
    setIncludeQr,
    phase,
    sendResult,
    sendError,
    emailSetup,
    send,
    canSend,
    previewToken,
    setPreviewToken,
    previewGuest,
    copyLink,
    downloadQr,
    reload,
  };
}
