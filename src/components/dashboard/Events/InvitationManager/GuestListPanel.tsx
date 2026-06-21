import React from 'react';
import { Copy, Download, Eye, Users } from 'lucide-react';
import { GuestInvitation } from '../../../../types';
import {
  FILTER_OPTIONS,
  formatLastSent,
  GuestFilter,
  STATUS_LABELS,
} from './invitationManagerUtils';

interface GuestListPanelProps {
  visible: GuestInvitation[];
  selectedIds: string[];
  totalCount: number;
  filter: GuestFilter;
  filterCounts: Record<GuestFilter, number>;
  allVisibleSelected: boolean;
  onFilterChange: (filter: GuestFilter) => void;
  onToggleGuest: (id: string) => void;
  onToggleAllVisible: () => void;
  onPreview: (token: string) => void;
  onCopy: (url: string) => void;
  onDownloadQr: (guest: GuestInvitation) => void;
}

const GuestListPanel: React.FC<GuestListPanelProps> = ({
  visible,
  selectedIds,
  totalCount,
  filter,
  filterCounts,
  allVisibleSelected,
  onFilterChange,
  onToggleGuest,
  onToggleAllVisible,
  onPreview,
  onCopy,
  onDownloadQr,
}) => (
  <section className="inv-modal__panel inv-modal__panel--guests">
    <div className="inv-modal__panel-head">
      <h3>
        <Users size={18} aria-hidden />
        Goście
        <span className="inv-modal__muted">
          {selectedIds.length}/{totalCount}
        </span>
      </h3>
      <button type="button" className="inv-modal__link-btn" onClick={onToggleAllVisible}>
        {allVisibleSelected ? 'Odznacz widocznych' : 'Zaznacz widocznych'}
      </button>
    </div>

    <div className="inv-modal__chips" role="tablist" aria-label="Filtr gości">
      {FILTER_OPTIONS.map(option => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={filter === option.id}
          className={`inv-modal__chip${filter === option.id ? ' is-active' : ''}`}
          onClick={() => onFilterChange(option.id)}
        >
          {option.label}
          <span className="inv-modal__chip-count">{filterCounts[option.id]}</span>
        </button>
      ))}
    </div>

    <div className="inv-modal__list" role="list">
      {visible.length === 0 ? (
        <p className="inv-modal__empty">Brak gości dla wybranego filtra.</p>
      ) : (
        visible.map(guest => {
          const checked = selectedIds.includes(guest.eventGuestId);
          return (
            <article
              key={guest.eventGuestId}
              role="listitem"
              className={`inv-modal__row${checked ? ' is-selected' : ''}`}
            >
              <input
                type="checkbox"
                className="inv-modal__check"
                checked={checked}
                onChange={() => onToggleGuest(guest.eventGuestId)}
                aria-label={`Zaznacz ${guest.firstName} ${guest.lastName}`}
              />

              <div className="inv-modal__row-main">
                <div className="inv-modal__row-top">
                  <span className="inv-modal__name">
                    {guest.firstName} {guest.lastName}
                  </span>
                  <span
                    className={`inv-modal__badge inv-modal__badge--${guest.status}`}
                  >
                    {STATUS_LABELS[guest.status]}
                  </span>
                </div>
                <p className="inv-modal__contact">
                  {guest.email?.trim() || (
                    <span className="inv-modal__warn">Brak e-mail</span>
                  )}
                  {guest.phone?.trim() ? ` · ${guest.phone}` : ''}
                </p>
                {guest.lastInvitationSentAt && (
                  <p className="inv-modal__sent">
                    Ostatnia wysyłka: {formatLastSent(guest.lastInvitationSentAt)}
                  </p>
                )}
              </div>

              <div className="inv-modal__row-tools">
                <button
                  type="button"
                  className="inv-modal__icon-btn"
                  title="Podgląd QR"
                  onClick={() => onPreview(guest.rsvpToken)}
                >
                  <Eye size={15} />
                </button>
                <button
                  type="button"
                  className="inv-modal__icon-btn"
                  title="Kopiuj link RSVP"
                  onClick={() => onCopy(guest.rsvpUrl)}
                >
                  <Copy size={15} />
                </button>
                <button
                  type="button"
                  className="inv-modal__icon-btn"
                  title="Pobierz QR"
                  onClick={() => onDownloadQr(guest)}
                >
                  <Download size={15} />
                </button>
              </div>
            </article>
          );
        })
      )}
    </div>
  </section>
);

export default GuestListPanel;
