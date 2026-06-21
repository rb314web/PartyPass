import React from 'react';
import { BarChart3, Calendar, TrendingUp, Users } from 'lucide-react';
import PageHeader from '../../common/PageHeader/PageHeader';
import '../../dashboard/Analytics/Analytics.scss';

const DemoAnalytics: React.FC = () => (
  <div className="analytics">
    <PageHeader
      title="Analityka"
      subtitle="Śledź wydajność swoich wydarzeń i zaangażowanie gości"
      icon={BarChart3}
    />

    <div className="analytics__stats-grid">
      <article className="analytics__stat-card">
        <div className="analytics__stat-card-header">
          <div className="analytics__stat-icon">
            <TrendingUp size={20} />
          </div>
          <h3 className="analytics__stat-title">Średni czas odpowiedzi</h3>
        </div>
        <div className="analytics__stat-value">2.3 dni</div>
        <p className="analytics__stat-subtitle">-0.5 dni vs poprzedni miesiąc</p>
      </article>

      <article className="analytics__stat-card">
        <div className="analytics__stat-card-header">
          <div className="analytics__stat-icon">
            <Users size={20} />
          </div>
          <h3 className="analytics__stat-title">Najlepsza frekwencja</h3>
        </div>
        <div className="analytics__stat-value">94%</div>
        <p className="analytics__stat-subtitle">Meetup Product Design</p>
      </article>

      <article className="analytics__stat-card">
        <div className="analytics__stat-card-header">
          <div className="analytics__stat-icon">
            <Calendar size={20} />
          </div>
          <h3 className="analytics__stat-title">Średnia wielkość wydarzenia</h3>
        </div>
        <div className="analytics__stat-value">68 gości</div>
        <p className="analytics__stat-subtitle">+12 vs poprzedni miesiąc</p>
      </article>
    </div>

    <section className="analytics__chart-card">
      <div className="analytics__chart-header">
        <h3 className="analytics__chart-title">Frekwencja w czasie</h3>
      </div>
      <div className="analytics__chart-content analytics__chart-content--placeholder">
        <BarChart3 size={48} aria-hidden />
        <p>Interaktywny wykres trendów uczestnictwa w wydarzeniach</p>
      </div>
    </section>
  </div>
);

export default DemoAnalytics;
