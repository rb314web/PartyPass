import {
  Event,
  GuestInvitation,
  GuestStatus,
  InvitationDelivery,
} from '../../../../types';

export type GuestFilter = 'all' | 'pending' | 'hasEmail' | 'hasPhone';
export type DeliveryMethod = InvitationDelivery['method'];
export type SendPhase = 'idle' | 'sending' | 'success' | 'error';

export const STATUS_LABELS: Record<GuestStatus, string> = {
  pending: 'Oczekuje',
  accepted: 'Potwierdził',
  declined: 'Odmówił',
  maybe: 'Może',
};

export const FILTER_OPTIONS: { id: GuestFilter; label: string }[] = [
  { id: 'all', label: 'Wszyscy' },
  { id: 'pending', label: 'Bez odpowiedzi' },
  { id: 'hasEmail', label: 'Z e-mailem' },
  { id: 'hasPhone', label: 'Z telefonem' },
];

export function matchesGuestFilter(
  invitation: GuestInvitation,
  filter: GuestFilter
): boolean {
  switch (filter) {
    case 'pending':
      return invitation.status === 'pending' || invitation.status === 'maybe';
    case 'hasEmail':
      return Boolean(invitation.email?.trim());
    case 'hasPhone':
      return Boolean(invitation.phone?.trim());
    default:
      return true;
  }
}

export function countByFilter(
  invitations: GuestInvitation[],
  filter: GuestFilter
): number {
  return invitations.filter(inv => matchesGuestFilter(inv, filter)).length;
}

export function formatLastSent(date?: Date): string {
  if (!date) return '';
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDefaultSubject(kind: 'invitation' | 'reminder', title: string) {
  return kind === 'reminder'
    ? `Przypomnienie: ${title}`
    : `Zaproszenie na ${title}`;
}

export function getDefaultMessage(kind: 'invitation' | 'reminder', title: string) {
  return kind === 'reminder'
    ? `Przypominamy o wydarzeniu „${title}”. Prosimy o potwierdzenie obecności.`
    : '';
}

export function buildPrintHtml(event: Event, guests: GuestInvitation[]): string {
  const cards = guests
    .map(
      guest => `
      <section class="card">
        <header>
          <h1>${event.title}</h1>
          <p><strong>Data:</strong> ${event.date.toLocaleDateString('pl-PL')}</p>
          <p><strong>Miejsce:</strong> ${event.location}</p>
        </header>
        <p class="guest">Dla: ${guest.firstName} ${guest.lastName}</p>
        ${event.description ? `<p>${event.description}</p>` : ''}
        ${event.dresscode ? `<p><strong>Dress code:</strong> ${event.dresscode}</p>` : ''}
        <div class="qr">
          <p>Potwierdź obecność — zeskanuj kod QR:</p>
          <img src="${guest.qrCode}" alt="QR" width="140" height="140" />
          <small>${guest.rsvpUrl}</small>
        </div>
      </section>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <title>Zaproszenia — ${event.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; color: #111; }
    .card { page-break-after: always; border: 1px solid #ddd; border-radius: 8px; padding: 24px; margin-bottom: 24px; }
    .card:last-child { page-break-after: auto; }
    header { text-align: center; margin-bottom: 16px; }
    h1 { margin: 0 0 8px; font-size: 1.4rem; }
    .guest { font-weight: 600; }
    .qr { text-align: center; margin-top: 20px; }
    .qr small { display: block; margin-top: 8px; word-break: break-all; color: #555; }
    @media print { body { margin: 0; } .card { border: none; margin: 0; } }
  </style>
</head>
<body>${cards}</body>
</html>`;
}
