import React from 'react';
import { useTranslation } from 'react-i18next';
import type { RsvpStatusOption } from './useRsvpStatusOptions';

interface RSVPStatusOptionsProps {
  options: RsvpStatusOption[];
  selectedValue: string | null;
  interactive?: boolean;
  previewOnly?: boolean;
  radioName?: string;
  onSelect?: (value: string) => void;
}

const RSVPStatusOptions: React.FC<RSVPStatusOptionsProps> = ({
  options,
  selectedValue,
  interactive = false,
  previewOnly = false,
  radioName = 'rsvp-status',
  onSelect,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="rsvp-options"
      role="radiogroup"
      aria-label={t('rsvp.form.willYouAttend')}
      aria-readonly={previewOnly || undefined}
    >
      {options.map(option => (
        <label
          key={option.value}
          className={`rsvp-option rsvp-option--${option.value}${
            selectedValue === option.value ? ' is-selected' : ''
          }`}
        >
          <input
            type="radio"
            name={radioName}
            value={option.value}
            checked={selectedValue === option.value}
            disabled={!interactive}
            onChange={() => onSelect?.(option.value)}
          />
          <span className="rsvp-option__icon">{option.icon}</span>
          <span className="rsvp-option__text">
            <span className="rsvp-option__label">{option.label}</span>
            <span className="rsvp-option__hint">{option.hint}</span>
          </span>
        </label>
      ))}
    </div>
  );
};

export default RSVPStatusOptions;
