import React from 'react';
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Smartphone, 
  Mail, 
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import './Features.scss';

const features = [
  {
    icon: <Calendar size={32} />,
    title: 'Łatwe tworzenie wydarzeń',
    description: 'Intuicyjny kreator pomoże Ci stworzyć wydarzenie w kilka minut'
  },
  {
    icon: <Users size={32} />,
    title: 'Zarządzanie gośćmi',
    description: 'Dodawaj gości, śledź odpowiedzi i zarządzaj listą uczestników'
  },
  {
    icon: <Mail size={32} />,
    title: 'Automatyczne zaproszenia',
    description: 'Wysyłaj spersonalizowane zaproszenia email i SMS'
  },
  {
    icon: <BarChart3 size={32} />,
    title: 'Analityki',
    description: 'Szczegółowe raporty i statystyki Twoich wydarzeń'
  },
  {
    icon: <Smartphone size={32} />,
    title: 'Aplikacja mobilna',
    description: 'Zarządzaj wydarzeniami z każdego miejsca na Ziemi'
  },
  {
    icon: <Shield size={32} />,
    title: 'Bezpieczeństwo',
    description: 'Twoje dane są chronione najwyższymi standardami'
  }
];

const Features: React.FC = () => {
  return (
    <section className="features" id="features">
      <div className="features__container">
        <div className="features__header">
          <h2 className="features__title">
            Wszystko czego potrzebujesz w jednym miejscu
          </h2>
          <p className="features__subtitle">
            PartyPass oferuje kompletny zestaw narzędzi do organizacji wydarzeń
          </p>
        </div>

        <div className="features__grid">
          {features.map((feature, index) => (
            <div key={index} className="features__card">
              <div className="features__icon">
                {feature.icon}
              </div>
              <h3 className="features__card-title">{feature.title}</h3>
              <p className="features__card-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;