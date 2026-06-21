import React from 'react';
import { Bell, Mail, Send } from 'lucide-react';
import { Event } from '../../../../types';
import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner';
import Modal from '../../../common/Modal/Modal';
import DeliveryPanel from './DeliveryPanel';
import GuestListPanel from './GuestListPanel';
import QrPreviewDialog from './QrPreviewDialog';
import { useInvitationManager } from './useInvitationManager';
import './InvitationManager.scss';

interface InvitationManagerProps {
  event: Event;
  onClose: () => void;
}

const InvitationManager: React.FC<InvitationManagerProps> = ({
  event,
  onClose,
}) => {
  const vm = useInvitationManager(event);

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title="Zaproszenia"
        icon={<Send size={20} />}
        size="lg"
        closeDisabled={!!vm.previewToken}
        ariaLabel="Zaproszenia"
      >
        <div className="inv-modal inv-modal--embedded">
          <p className="inv-modal__meta">
            {event.title} · {vm.invitations.length} gości ·{' '}
            {vm.filterCounts.pending} bez odpowiedzi
          </p>

          <div className="inv-modal__segments" role="tablist" aria-label="Typ wiadomości">
          <button
            type="button"
            role="tab"
            aria-selected={vm.kind === 'invitation'}
            className={`inv-modal__segment${vm.kind === 'invitation' ? ' is-active' : ''}`}
            onClick={() => vm.setKind('invitation')}
          >
            <Mail size={16} />
            Zaproszenie
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={vm.kind === 'reminder'}
            className={`inv-modal__segment${vm.kind === 'reminder' ? ' is-active' : ''}`}
            onClick={() => vm.setKind('reminder')}
          >
            <Bell size={16} />
            Przypomnienie
          </button>
        </div>

        {vm.loading ? (
          <div className="inv-modal__loading">
            <LoadingSpinner
              variant="full"
              icon={<Mail />}
              title="Przygotowanie zaproszeń"
              subtitle="Generuję linki RSVP…"
            />
          </div>
        ) : vm.loadError ? (
          <div className="inv-modal__error">
            <p>{vm.loadError}</p>
            <button
              type="button"
              className="pp-btn pp-btn--outline"
              onClick={vm.reload}
            >
              Spróbuj ponownie
            </button>
          </div>
        ) : (
          <div className="inv-modal__layout">
            <GuestListPanel
              visible={vm.visible}
              selectedIds={vm.selectedIds}
              totalCount={vm.invitations.length}
              filter={vm.filter}
              filterCounts={vm.filterCounts}
              allVisibleSelected={vm.allVisibleSelected}
              onFilterChange={vm.setFilter}
              onToggleGuest={vm.toggleGuest}
              onToggleAllVisible={vm.toggleAllVisible}
              onPreview={vm.setPreviewToken}
              onCopy={vm.copyLink}
              onDownloadQr={vm.downloadQr}
            />
            <DeliveryPanel
              method={vm.method}
              onMethodChange={vm.setMethod}
              subject={vm.subject}
              onSubjectChange={vm.setSubject}
              message={vm.message}
              onMessageChange={vm.setMessage}
              includeQr={vm.includeQr}
              onIncludeQrChange={vm.setIncludeQr}
              phase={vm.phase}
              sendResult={vm.sendResult}
              sendError={vm.sendError}
              emailConfigured={vm.emailSetup.configured}
              emailSetupMessage={vm.emailSetup.message}
              canSend={vm.canSend}
              isReminder={vm.kind === 'reminder'}
              selectedCount={vm.selected.length}
              emailCount={vm.emailCount}
              phoneCount={vm.phoneCount}
              onSend={vm.send}
            />
          </div>
        )}
        </div>
      </Modal>

      {vm.previewGuest && (
        <QrPreviewDialog
          guest={vm.previewGuest}
          onClose={() => vm.setPreviewToken(null)}
          onCopy={vm.copyLink}
          onDownload={vm.downloadQr}
        />
      )}
    </>
  );
};

export default InvitationManager;
