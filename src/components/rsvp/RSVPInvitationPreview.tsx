import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import { usePreviewCarousel } from '../../hooks/usePreviewCarousel';
import PreviewMorphSlot from './PreviewMorphSlot';
import '../../pages/RSVP/RSVP.scss';
import './RSVPInvitationPreview.scss';

const PREVIEW_SCENARIO_KEYS = ['birthday', 'meetup', 'gala'] as const;
type PreviewScenarioKey = (typeof PREVIEW_SCENARIO_KEYS)[number];

const SCENARIO_SELECTED_INDEX: Record<PreviewScenarioKey, number> = {
  birthday: 0,
  meetup: 1,
  gala: 2,
};

type StatusOption = {
  value: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
};

export interface RSVPInvitationPreviewProps {
  autoRotate?: boolean;
  variant?: 'hero' | 'flat';
  interactive?: boolean;
}

const INTERACTIVE_SCENARIO: PreviewScenarioKey = 'birthday';

const RSVPInvitationPreviewInteractive: React.FC<{ variant: 'hero' | 'flat' }> = ({
  variant,
}) => {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const scenarioBase = `landing.previewScenarios.${INTERACTIVE_SCENARIO}`;

  const statusOptions = useMemo(
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

  return (
    <div className={`rsvp rsvp--preview rsvp--preview-${variant} rsvp--preview-interactive`}>
      <div className="rsvp-preview__stage">
        <section className="rsvp-hero">
          <div className="rsvp-hero__top">
            <span className="rsvp-hero__eyebrow">{t('rsvp.common.invitation')}</span>
          </div>
          <div className="rsvp-hero__content">
            <h2 className="rsvp-hero__title">{t(`${scenarioBase}.title`)}</h2>
            <ul className="rsvp-hero__meta">
              <li className="rsvp-hero__meta-item">
                <Calendar size={16} aria-hidden="true" />
                <span>{t(`${scenarioBase}.date`)}</span>
              </li>
            </ul>
          </div>
        </section>

        <div className="rsvp-form-card">
          <div className="rsvp-form-card__guest">
            <div className="rsvp-avatar" aria-hidden="true">
              {t(`${scenarioBase}.guestInitials`)}
            </div>
            <div className="rsvp-form-card__guest-text">
              <span className="rsvp-form-card__guest-label">
                {t('rsvp.common.invitationFor')}
              </span>
              <span className="rsvp-form-card__guest-name">
                {t(`${scenarioBase}.guestName`)}
              </span>
              <span className="rsvp-form-card__guest-email">
                {t(`${scenarioBase}.guestEmail`)}
              </span>
            </div>
          </div>

          <div className="rsvp-form-card__body">
            <h3 className="rsvp-form-card__title">{t('rsvp.form.willYouAttend')}</h3>
            <div
              className="rsvp-options"
              role="radiogroup"
              aria-label={t('rsvp.form.willYouAttend')}
            >
              {statusOptions.map(option => (
                <label
                  key={option.value}
                  className={`rsvp-option rsvp-option--${option.value}${
                    selectedStatus === option.value ? ' is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="landing-rsvp-preview-status"
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
          </div>
        </div>
      </div>
    </div>
  );
};

const RSVPInvitationPreviewCarousel: React.FC<{
  autoRotate: boolean;
  variant: 'hero' | 'flat';
}> = ({ autoRotate, variant }) => {
  const { t } = useTranslation();

  const {
    index,
    overlayIndex,
    isCrossfading,
    completeCrossfade,
    pauseHandlers,
  } = usePreviewCarousel({
    count: PREVIEW_SCENARIO_KEYS.length,
    autoRotate,
  });

  const statusOptions = useMemo(
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

  const renderHeroContent = (scenarioIndex: number) => {
    const scenarioKey = PREVIEW_SCENARIO_KEYS[scenarioIndex];
    const scenarioBase = `landing.previewScenarios.${scenarioKey}`;

    return (
      <>
        <h2 className="rsvp-hero__title">{t(`${scenarioBase}.title`)}</h2>
        <ul className="rsvp-hero__meta">
          <li className="rsvp-hero__meta-item">
            <Calendar size={16} aria-hidden="true" />
            <span>{t(`${scenarioBase}.date`)}</span>
          </li>
        </ul>
      </>
    );
  };

  const renderGuestContent = (scenarioIndex: number) => {
    const scenarioKey = PREVIEW_SCENARIO_KEYS[scenarioIndex];
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
          <span className="rsvp-form-card__guest-name">
            {t(`${scenarioBase}.guestName`)}
          </span>
          <span className="rsvp-form-card__guest-email">
            {t(`${scenarioBase}.guestEmail`)}
          </span>
        </div>
      </>
    );
  };


  const selectionScenarioIndex =
    isCrossfading && overlayIndex !== null ? overlayIndex : index;

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
      <div className="rsvp-preview__stage">
        <section className="rsvp-hero">
          <div className="rsvp-hero__top">
            <span className="rsvp-hero__eyebrow">{t('rsvp.common.invitation')}</span>
          </div>
          <div className="rsvp-hero__content">
            <PreviewMorphSlot
              stagger="hero"
              minHeight="5.75rem"
              index={index}
              overlayIndex={overlayIndex}
              isCrossfading={isCrossfading}
              render={renderHeroContent}
              onCrossfadeComplete={() => completeCrossfade()}
            />
          </div>
        </section>

        <div className="rsvp-form-card">
          <div className="rsvp-form-card__guest">
            <PreviewMorphSlot
              stagger="guest"
              minHeight="3.5rem"
              index={index}
              overlayIndex={overlayIndex}
              isCrossfading={isCrossfading}
              render={renderGuestContent}
            />
          </div>

          <div className="rsvp-form-card__body">
            <h3 className="rsvp-form-card__title">{t('rsvp.form.willYouAttend')}</h3>
            <div className="rsvp-options">
              {statusOptions.map((option, optionIndex) => {
                const scenarioKey = PREVIEW_SCENARIO_KEYS[selectionScenarioIndex];
                const selectedOptionIndex = SCENARIO_SELECTED_INDEX[scenarioKey];

                return (
                  <div
                    key={option.value}
                    className={`rsvp-option rsvp-option--${option.value}${
                      optionIndex === selectedOptionIndex ? ' is-selected' : ''
                    }`}
                  >
                    <span className="rsvp-option__icon">{option.icon}</span>
                    <span className="rsvp-option__text">
                      <span className="rsvp-option__label">{option.label}</span>
                      <span className="rsvp-option__hint">{option.hint}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RSVPInvitationPreview: React.FC<RSVPInvitationPreviewProps> = ({
  autoRotate = true,
  variant = 'hero',
  interactive = false,
}) => {
  if (interactive) {
    return <RSVPInvitationPreviewInteractive variant={variant} />;
  }

  return <RSVPInvitationPreviewCarousel autoRotate={autoRotate} variant={variant} />;
};

export default RSVPInvitationPreview;
