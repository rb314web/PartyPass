import React from 'react';
import LegalPage from './LegalPage';
import { useLegalPageContent } from './useLegalPageContent';

const Privacy: React.FC = () => {
  const content = useLegalPageContent('privacy');
  return <LegalPage {...content} />;
};

export default Privacy;
