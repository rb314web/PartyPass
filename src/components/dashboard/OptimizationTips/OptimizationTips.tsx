import React from 'react';
import {
  Zap,
  Users,
  Calendar,
  Clock,
  Sparkles,
  Trophy,
  Gift,
  Send,
  Bell,
} from 'lucide-react';
import './OptimizationTips.scss';

const OptimizationTips: React.FC = () => {
  const tips = [
    {
      icon: <Calendar size={18} />,
      category: 'Planowanie',
      title: 'Optymalne daty',
      description: 'Piątki i soboty mają najwyższy wskaźnik potwierdzeń',
      type: 'success',
    },
    {
      icon: <Clock size={18} />,
      category: 'Przypomnienia',
      title: 'Automatyzacja',
      description:
        'Włącz automatyczne przypomnienia na 3 dni przed wydarzeniem',
      type: 'warning',
    },
    {
      icon: <Send size={18} />,
      category: 'Komunikacja',
      title: 'Personalizacja',
      description: 'Spersonalizowane zaproszenia zwiększają odpowiedzi o 45%',
      type: 'info',
    },
  ];

  const insights = [
    {
      value: '76%',
      label: 'średnia frekwencja',
      trend: '+12%',
      description: 'lepiej niż średnia',
    },
    {
      value: '2.3',
      label: 'dni do odpowiedzi',
      trend: '-15%',
      description: 'szybciej niż zwykle',
    },
  ];

  return (
    <div className="optimization-tips">
      <div className="optimization-tips__header">
        <div className="optimization-tips__title">
          <Sparkles size={20} />
          <h3>Optymalizacje i porady</h3>
        </div>
        <Trophy className="optimization-tips__trophy" size={20} />
      </div>

      <div className="optimization-tips__content">
        {/* Achievement Section */}
        <div className="optimization-tips__achievements">
          {insights.map((insight, index) => (
            <div key={index} className="optimization-tips__achievement">
              <div className="optimization-tips__achievement-value">
                <strong>{insight.value}</strong>
                <span className="optimization-tips__trend">
                  {insight.trend}
                </span>
              </div>
              <div className="optimization-tips__achievement-details">
                <span className="optimization-tips__label">
                  {insight.label}
                </span>
                <span className="optimization-tips__description">
                  {insight.description}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="optimization-tips__tips">
          {tips.map((tip, index) => (
            <div
              key={index}
              className={`optimization-tips__tip optimization-tips__tip--${tip.type}`}
            >
              <div className="optimization-tips__tip-icon">{tip.icon}</div>
              <div className="optimization-tips__tip-content">
                <span className="optimization-tips__tip-category">
                  {tip.category}
                </span>
                <h4 className="optimization-tips__tip-title">{tip.title}</h4>
                <p className="optimization-tips__tip-description">
                  {tip.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Section */}
        <button className="optimization-tips__action">
          <Bell size={16} />
          Włącz wszystkie sugestie
        </button>
      </div>
    </div>
  );
};

export default OptimizationTips;
