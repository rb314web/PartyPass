import React from 'react';

export type PreviewMorphStagger = 'hero' | 'guest' | 'rsvp';

interface PreviewMorphSlotProps {
  stagger: PreviewMorphStagger;
  minHeight?: string;
  onCrossfadeComplete?: (event: React.TransitionEvent<HTMLDivElement>) => void;
  render: (scenarioIndex: number) => React.ReactNode;
  index: number;
  overlayIndex: number | null;
  isCrossfading: boolean;
}

const PreviewMorphSlot: React.FC<PreviewMorphSlotProps> = ({
  stagger,
  minHeight,
  onCrossfadeComplete,
  render,
  index,
  overlayIndex,
  isCrossfading,
}) => {
  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== 'opacity') return;
    if (!isCrossfading || overlayIndex === null) return;

    onCrossfadeComplete?.(event);
  };

  return (
    <div
      className={`rsvp-preview__morph-slot rsvp-preview__morph-slot--${stagger}`}
      style={minHeight ? { minHeight } : undefined}
    >
      <div
        className={`rsvp-preview__morph-layer rsvp-preview__morph-layer--base${
          isCrossfading ? ' is-dimming' : ''
        }`}
      >
        {render(index)}
      </div>

      {overlayIndex !== null && (
        <div
          className={`rsvp-preview__morph-layer rsvp-preview__morph-layer--overlay${
            isCrossfading ? ' is-visible' : ''
          }`}
          onTransitionEnd={stagger === 'hero' ? handleTransitionEnd : undefined}
        >
          {render(overlayIndex)}
        </div>
      )}
    </div>
  );
};

export default PreviewMorphSlot;
