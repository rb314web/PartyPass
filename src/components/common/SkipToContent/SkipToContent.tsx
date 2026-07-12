import React from 'react';
import { useTranslation } from 'react-i18next';
import './SkipToContent.scss';

interface SkipToContentProps {
  targetId?: string;
}

const SkipToContent: React.FC<SkipToContentProps> = ({ targetId = 'main-content' }) => {
  const { t } = useTranslation();

  return (
    <a href={`#${targetId}`} className="skip-link">
      {t('accessibility.skipToContent')}
    </a>
  );
};

export default SkipToContent;
