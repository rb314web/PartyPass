import React from 'react';
import LegalPage from './LegalPage';
import { useLegalPageContent } from './useLegalPageContent';

const Terms: React.FC = () => {
  const content = useLegalPageContent('terms');
  return <LegalPage {...content} />;
};

export default Terms;
