import React from 'react';
import { BarChart3 } from 'lucide-react';

const DemoAnalytics: React.FC = React.memo(() => (
  <div className="demo__analytics-content">
    <div className="demo__page-header">
      <h1>Analityka</h1>
      <p>Śledź wydajność swoich wydarzeń i zaangażowanie gości</p>
    </div>

    <div className="demo__analytics-grid">
      <div className="demo__metric-card">
        <h4>Średni czas odpowiedzi</h4>
        <div className="demo__metric-value">2.3 dni</div>
        <div className="demo__metric-change demo__metric-change--positive">
          -0.5 dni vs poprzedni miesiąc
        </div>
      </div>

      <div className="demo__metric-card">
        <h4>Najlepsza frekwencja</h4>
        <div className="demo__metric-value">94%</div>
        <div className="demo__metric-change demo__metric-change--positive">
          Konferencja IT 2024
        </div>
      </div>

      <div className="demo__metric-card">
        <h4>Średnia wielkość wydarzenia</h4>
        <div className="demo__metric-value">68 gości</div>
        <div className="demo__metric-change demo__metric-change--positive">
          +12 vs poprzedni miesiąc
        </div>
      </div>
    </div>

    <div className="demo__chart-placeholder">
      <BarChart3 size={48} />
      <h4>Wykres frekwencji w czasie</h4>
      <p>
        Tutaj byłby wyświetlony interaktywny wykres pokazujący trendy
        uczestnictwa w wydarzeniach
      </p>
    </div>
  </div>
));

DemoAnalytics.displayName = 'DemoAnalytics';

export default DemoAnalytics;


