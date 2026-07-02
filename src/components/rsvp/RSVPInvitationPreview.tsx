import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Send } from 'lucide-react';
import { usePreviewCarousel } from '../../hooks/usePreviewCarousel';
import PreviewMorphSlot from './PreviewMorphSlot';
import RSVPStatusOptions from './RSVPStatusOptions';
import RSVPInvitationHeroSection from './RSVPInvitationHeroSection';
import { useRsvpStatusOptions } from './useRsvpStatusOptions';
import {
  formatPreviewScenarioDate,
  RSVP_PREVIEW_SCENARIO_DATES,
  RSVP_PREVIEW_SCENARIO_KEYS,
  RSVP_PREVIEW_SCENARIO_SELECTION,
  type RsvpPreviewScenarioKey,
  type RsvpPreviewScenarioState,
} from '../../constants/rsvpPreviewScenarios';
import '../../pages/RSVP/RSVP.scss';
import './RSVPInvitationPreview.scss';

export interface RSVPInvitationPreviewProps {
  autoRotate?: boolean;
  variant?: 'hero' | 'flat';
  interactive?: boolean;
  onScenarioStateChange?: (state: RsvpPreviewScenarioState) => void;
}

const INTERACTIVE_SCENARIO: RsvpPreviewScenarioKey = 'birthday';

const PreviewFormFooter: React.FC<{ deadline: string }> = ({ deadline }) => {
  const { t } = useTranslation();

  return (
    <div className="rsvp-form-card__footer">
      <button type="button" className="rsvp-btn rsvp-btn--primary" disabled>
        <Send size={18} />
        {t('rsvp.form.submit.sendResponse')}
      </button>
      <p className="rsvp-form-card__hint">
        {t('rsvp.form.deadlineHint.active', { deadline })}
      </p>
    </div>
  );
};

const GuestIdentity: React.FC<{ scenarioKey: RsvpPreviewScenarioKey }> = ({
  scenarioKey,
}) => {
  const { t } = useTranslation();
  const scenarioBase = `landing.previewScenarios.${scenarioKey}`;

  return (
    <>
      <div className="rsvp-avatar" aria-hidden="true">
        {t(`${scenarioBase}.guestInitials`)}
      </div>
      <div className="rsvp-form-card__guest-text">
        <span className="rsvp-form-card__guest-label">
          {t('rsvp.common.invitationFor')}
        </span>
        <span
          className="rsvp-form-card__guest-name"
          title={t(`${scenarioBase}.guestName`)}
        >
          {t(`${scenarioBase}.guestName`)}
        </span>
        <span className="rsvp-form-card__guest-email">
          {t(`${scenarioBase}.guestEmail`)}
        </span>
      </div>
    </>
  );
};

const HeroDetails: React.FC<{ scenarioKey: RsvpPreviewScenarioKey }> = ({
  scenarioKey,
}) => {
  const { t, i18n } = useTranslation();
  const scenarioBase = `landing.previewScenarios.${scenarioKey}`;
  const formattedDate = formatPreviewScenarioDate(
    RSVP_PREVIEW_SCENARIO_DATES[scenarioKey],
    i18n.language
  );
  const title = t(`${scenarioBase}.title`);

  return (
    <>
      <h1 className="rsvp-hero__title" title={title}>
        {title}
      </h1>
      <ul className="rsvp-hero__meta">
        <li className="rsvp-hero__meta-item">
          <Calendar size={16} aria-hidden="true" />
          <span>{formattedDate}</span>
        </li>
      </ul>
    </>
  );
};

const RSVPInvitationPreviewInteractive: React.FC<{
  variant: 'hero' | 'flat';
  onScenarioStateChange?: (state: RsvpPreviewScenarioState) => void;
}> = ({ variant, onScenarioStateChange }) => {
  const { t, i18n } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const statusOptions = useRsvpStatusOptions();
  const formattedDate = formatPreviewScenarioDate(
    RSVP_PREVIEW_SCENARIO_DATES[INTERACTIVE_SCENARIO],
    i18n.language
  );

  useEffect(() => {
    onScenarioStateChange?.({
      index: RSVP_PREVIEW_SCENARIO_KEYS.indexOf(INTERACTIVE_SCENARIO),
      overlayIndex: null,
      isCrossfading: false,
    });
  }, [onScenarioStateChange]);

  return (
    <div className={`rsvp rsvp--preview rsvp--preview-${variant} rsvp--preview-interactive`}>
      <div className="rsvp__shell">
        <main className="rsvp__main">
          <RSVPInvitationHeroSection
            eventDate={RSVP_PREVIEW_SCENARIO_DATES[INTERACTIVE_SCENARIO]}
          >
            <HeroDetails scenarioKey={INTERACTIVE_SCENARIO} />
          </RSVPInvitationHeroSection>
        </main>

        <aside className="rsvp__aside">
          <form className="rsvp-form-card" onSubmit={event => event.preventDefault()}>
            <div className="rsvp-form-card__guest">
              <GuestIdentity scenarioKey={INTERACTIVE_SCENARIO} />
            </div>

            <div className="rsvp-form-card__body">
              <h2 className="rsvp-form-card__title">{t('rsvp.form.willYouAttend')}</h2>
              <RSVPStatusOptions
                options={statusOptions}
                selectedValue={selectedStatus}
                interactive
                radioName="landing-rsvp-preview-status"
                onSelect={setSelectedStatus}
              />
            </div>

            <PreviewFormFooter deadline={formattedDate} />
          </form>
        </aside>
      </div>
    </div>
  );
};

const RSVPInvitationPreviewCarousel: React.FC<{
  autoRotate: boolean;
  variant: 'hero' | 'flat';
  onScenarioStateChange?: (state: RsvpPreviewScenarioState) => void;
}> = ({ autoRotate, variant, onScenarioStateChange }) => {
  const { t, i18n } = useTranslation();
  const statusOptions = useRsvpStatusOptions();

  const {
    index,
    overlayIndex,
    isCrossfading,
    completeCrossfade,
    pauseHandlers,
  } = usePreviewCarousel({
    count: RSVP_PREVIEW_SCENARIO_KEYS.length,
    autoRotate,
  });

  useEffect(() => {
    onScenarioStateChange?.({ index, overlayIndex, isCrossfading });
  }, [index, overlayIndex, isCrossfading, onScenarioStateChange]);

  const renderHeroContent = (scenarioIndex: number) => (
    <HeroDetails scenarioKey={RSVP_PREVIEW_SCENARIO_KEYS[scenarioIndex]} />
  );

  const renderGuestContent = (scenarioIndex: number) => (
    <GuestIdentity scenarioKey={RSVP_PREVIEW_SCENARIO_KEYS[scenarioIndex]} />
  );

  const selectionScenarioIndex =
    isCrossfading && overlayIndex !== null ? overlayIndex : index;
  const activeScenarioKey = RSVP_PREVIEW_SCENARIO_KEYS[selectionScenarioIndex];
  const selectedOptionIndex = RSVP_PREVIEW_SCENARIO_SELECTION[activeScenarioKey];
  const selectedStatus = statusOptions[selectedOptionIndex]?.value ?? null;
  const formattedDeadline = formatPreviewScenarioDate(
    RSVP_PREVIEW_SCENARIO_DATES[activeScenarioKey],
    i18n.language
  );

  return (
    <div
      className={[
        'rsvp',
        'rsvp--preview',
        `rsvp--preview-${variant}`,
        isCrossfading ? 'rsvp-preview--transitioning' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...pauseHandlers}
    >
      <div className="rsvp__shell">
        <main className="rsvp__main">
          <RSVPInvitationHeroSection
            eventDate={RSVP_PREVIEW_SCENARIO_DATES[activeScenarioKey]}
          >
            <PreviewMorphSlot
              stagger="hero"
              index={index}
              overlayIndex={overlayIndex}
              isCrossfading={isCrossfading}
              render={renderHeroContent}
              onCrossfadeComplete={() => completeCrossfade()}
            />
          </RSVPInvitationHeroSection>
        </main>

        <aside className="rsvp__aside">
          <form className="rsvp-form-card" onSubmit={event => event.preventDefault()}>
            <div className="rsvp-form-card__guest">
              <PreviewMorphSlot
                stagger="guest"
                index={index}
                overlayIndex={overlayIndex}
                isCrossfading={isCrossfading}
                render={renderGuestContent}
              />
            </div>

            <div className="rsvp-form-card__body">
              <h2 className="rsvp-form-card__title">{t('rsvp.form.willYouAttend')}</h2>
              <RSVPStatusOptions
                options={statusOptions}
                selectedValue={selectedStatus}
                radioName="rsvp-preview-status"
              />
            </div>

            <PreviewFormFooter deadline={formattedDeadline} />
          </form>
        </aside>
      </div>
    </div>
  );
};

const RSVPInvitationPreview: React.FC<RSVPInvitationPreviewProps> = ({
  autoRotate = true,
  variant = 'hero',
  interactive = false,
  onScenarioStateChange,
}) => {
  if (interactive) {
    return (
      <RSVPInvitationPreviewInteractive
        variant={variant}
        onScenarioStateChange={onScenarioStateChange}
      />
    );
  }

  return (
    <RSVPInvitationPreviewCarousel
      autoRotate={autoRotate}
      variant={variant}
      onScenarioStateChange={onScenarioStateChange}
    />
  );
};

export default RSVPInvitationPreview;
