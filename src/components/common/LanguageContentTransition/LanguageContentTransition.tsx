import React from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import './LanguageContentTransition.scss';

interface LanguageContentTransitionProps {
  children: React.ReactNode;
}

const LanguageContentTransition: React.FC<LanguageContentTransitionProps> = ({
  children,
}) => {
  const { languageTransitionPhase } = useLanguage();

  return (
    <div
      className={`language-content-transition language-content-transition--${languageTransitionPhase}`}
    >
      {children}
    </div>
  );
};

export default LanguageContentTransition;
