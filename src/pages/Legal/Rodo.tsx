import React from 'react';
import LegalPage from './LegalPage';
import { useLegalPageContent } from './useLegalPageContent';

const Rodo: React.FC = () => {
  const content = useLegalPageContent('rodo');
  return <LegalPage {...content} />;
};

export default Rodo;
