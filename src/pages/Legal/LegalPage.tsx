import React from 'react';
import { Link } from 'react-router-dom';
import UnifiedHeader from '../../components/common/UnifiedHeader/UnifiedHeader';
import Footer from '../../components/common/Footer/Footer';
import '../../pages/Landing/Landing.scss';
import './LegalPage.scss';

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalPageProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  updatedLabel: string;
  backToHome: string;
  sections: LegalSection[];
}

const LegalPage: React.FC<LegalPageProps> = ({
  title,
  subtitle,
  lastUpdated,
  updatedLabel,
  backToHome,
  sections,
}) => {
  return (
    <div className="landing">
      <UnifiedHeader variant="landing" />
      <main className="legal-page">
        <div className="legal-page__container">
          <header className="legal-page__header">
            <h1>{title}</h1>
            <p className="legal-page__subtitle">{subtitle}</p>
            <p className="legal-page__updated">
              {updatedLabel} {lastUpdated}
            </p>
          </header>

          <div className="legal-page__content">
            {sections.map(section => (
              <section key={section.title} className="legal-page__section">
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>

          <p className="legal-page__back">
            <Link to="/">{backToHome}</Link>
          </p>
        </div>
      </main>
      <Footer variant="landing" />
    </div>
  );
};

export default LegalPage;
