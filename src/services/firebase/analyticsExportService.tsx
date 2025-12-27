// services/firebase/analyticsExportService.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalyticsReport } from './analyticsService';

export class AnalyticsExportService {
  /**
   * Export analytics data to CSV format
   */
  static async exportToCSV(
    data: AnalyticsReport,
    filters?: any
  ): Promise<void> {
    try {
      const csvData = this.generateCSVData(data);
      const csvContent = this.convertToCSV(csvData);
      const fileName = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
      this.downloadFile(csvContent, fileName, 'text/csv');
    } catch (error) {
      throw new Error('Nie udało się wyeksportować danych do CSV');
    }
  }

  /**
   * Export analytics data to PDF format
   */
  static async exportToPDF(
    elementId: string,
    fileName?: string
  ): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element nie został znaleziony');
      }

      // Create high-quality canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Calculate dimensions to fit A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add title page
      pdf.setFontSize(20);
      pdf.text('Raport Analityczny PartyPass', 20, 30);

      pdf.setFontSize(12);
      pdf.text(
        `Data wygenerowania: ${new Date().toLocaleDateString('pl-PL')}`,
        20,
        50
      );
      pdf.text(`Okres: ${this.getDateRangeText()}`, 20, 60);

      // Add charts
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Add summary page
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Podsumowanie', 20, 30);

      // You can add more summary content here

      const pdfFileName =
        fileName ||
        `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(pdfFileName);
    } catch (error) {
      throw new Error('Nie udało się wyeksportować raportu do PDF');
    }
  }

  /**
   * Export analytics dashboard as interactive HTML
   */
  static async exportToHTML(
    data: AnalyticsReport,
    elementId: string
  ): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element nie został znaleziony');
      }

      const htmlContent = this.generateHTMLReport(data, element.innerHTML);
      const fileName = `analytics-report-${new Date().toISOString().split('T')[0]}.html`;
      this.downloadFile(htmlContent, fileName, 'text/html');
    } catch (error) {
      throw new Error('Nie udało się wyeksportować raportu do HTML');
    }
  }

  /**
   * Export specific chart data to JSON
   */
  static async exportChartData(
    chartData: any,
    chartName: string
  ): Promise<void> {
    try {
      const jsonData = JSON.stringify(chartData, null, 2);
      const fileName = `${chartName}-data-${new Date().toISOString().split('T')[0]}.json`;
      this.downloadFile(jsonData, fileName, 'application/json');
    } catch (error) {
      throw new Error('Nie udało się wyeksportować danych wykresu');
    }
  }

  /**
   * Generate comprehensive analytics report with insights
   */
  static generateInsightsReport(data: AnalyticsReport): string {
    const insights = [];

    // Growth analysis
    if (data.growthRate > 20) {
      insights.push(
        '🚀 Doskonały wzrost! Twoje wydarzenia zyskują coraz większą popularność.'
      );
    } else if (data.growthRate > 0) {
      insights.push('📈 Pozytywny trend wzrostu wydarzeń.');
    } else if (data.growthRate < -10) {
      insights.push('⚠️ Spadek aktywności. Rozważ nowe strategie promocji.');
    }

    // Guest engagement analysis
    const totalGuests =
      data.guestEngagement.confirmed +
      data.guestEngagement.pending +
      data.guestEngagement.declined +
      data.guestEngagement.maybe;
    const confirmationRate =
      (data.guestEngagement.confirmed / totalGuests) * 100;

    if (confirmationRate > 80) {
      insights.push('✨ Wysoki wskaźnik potwierdzenia uczestnictwa!');
    } else if (confirmationRate < 50) {
      insights.push(
        '💡 Rozważ poprawę komunikacji z gośćmi - niski wskaźnik potwierdzeń.'
      );
    }

    // Popular events analysis
    if (data.popularEventTypes.length > 0) {
      const topEvent = data.popularEventTypes[0];
      insights.push(
        `🎯 Najpopularniejszy typ wydarzeń: ${topEvent.type} (${topEvent.count} wydarzeń)`
      );
    }

    // Response time analysis
    if ((data as any).avgResponseTime && (data as any).avgResponseTime < 24) {
      insights.push('⚡ Goście szybko odpowiadają na zaproszenia!');
    } else if (
      (data as any).avgResponseTime &&
      (data as any).avgResponseTime > 72
    ) {
      insights.push(
        '⏰ Goście potrzebują więcej czasu na odpowiedź. Rozważ wcześniejsze wysyłanie zaproszeń.'
      );
    }

    return insights.join('\n\n');
  }

  private static generateCSVData(data: AnalyticsReport): any[] {
    const csvData = [];

    // Summary data
    csvData.push({
      Category: 'Podsumowanie',
      Metric: 'Łącznie wydarzeń',
      Value: data.totalEvents,
      Date: new Date().toLocaleDateString('pl-PL'),
    });

    csvData.push({
      Category: 'Podsumowanie',
      Metric: 'Łącznie gości',
      Value: data.totalGuests,
      Date: new Date().toLocaleDateString('pl-PL'),
    });

    csvData.push({
      Category: 'Podsumowanie',
      Metric: 'Średnio gości na wydarzenie',
      Value: data.averageGuestsPerEvent,
      Date: new Date().toLocaleDateString('pl-PL'),
    });

    // Monthly trends
    data.monthlyTrends.forEach((trend: any) => {
      csvData.push({
        Category: 'Trendy miesięczne',
        Metric: 'Wydarzenia',
        Value: trend.events,
        Date: trend.month,
      });
    });

    // Popular event types
    data.popularEventTypes.forEach((type: any) => {
      csvData.push({
        Category: 'Popularne typy',
        Metric: type.type,
        Value: type.count,
        Date: new Date().toLocaleDateString('pl-PL'),
      });
    });

    // Guest engagement
    csvData.push({
      Category: 'Zaangażowanie gości',
      Metric: 'Potwierdzone',
      Value: data.guestEngagement.confirmed,
      Date: new Date().toLocaleDateString('pl-PL'),
    });

    csvData.push({
      Category: 'Zaangażowanie gości',
      Metric: 'Oczekujące',
      Value: data.guestEngagement.pending,
      Date: new Date().toLocaleDateString('pl-PL'),
    });

    csvData.push({
      Category: 'Zaangażowanie gości',
      Metric: 'Odrzucone',
      Value: data.guestEngagement.declined,
      Date: new Date().toLocaleDateString('pl-PL'),
    });

    return csvData;
  }

  private static convertToCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers
          .map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value;
          })
          .join(',')
      ),
    ].join('\n');

    return csvContent;
  }

  private static generateHTMLReport(
    data: AnalyticsReport,
    chartContent: string
  ): string {
    return `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Raport Analityczny PartyPass</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f8fafc;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
        }
        .charts {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .insights {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #3b82f6;
            margin-top: 30px;
        }
        @media print {
            body { background: white; }
            .header, .summary-card, .charts { box-shadow: none; border: 1px solid #e5e7eb; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Raport Analityczny PartyPass</h1>
        <p>Data wygenerowania: ${new Date().toLocaleDateString('pl-PL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3>Łącznie wydarzeń</h3>
            <h2>${data.totalEvents}</h2>
        </div>
        <div class="summary-card">
            <h3>Łącznie gości</h3>
            <h2>${data.totalGuests}</h2>
        </div>
        <div class="summary-card">
            <h3>Średnio gości/wydarzenie</h3>
            <h2>${data.averageGuestsPerEvent}</h2>
        </div>
        <div class="summary-card">
            <h3>Wzrost</h3>
            <h2>${data.growthRate > 0 ? '+' : ''}${data.growthRate}%</h2>
        </div>
    </div>
    
    <div class="charts">
        <h2>Wykresy i Statystyki</h2>
        ${chartContent}
    </div>
    
    <div class="insights">
        <h3>🔍 Spostrzeżenia</h3>
        <p>${this.generateInsightsReport(data).replace(/\n\n/g, '</p><p>')}</p>
    </div>
</body>
</html>`;
  }

  private static downloadFile(
    content: string,
    fileName: string,
    mimeType: string
  ): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private static getDateRangeText(): string {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Default to 30 days

    return `${startDate.toLocaleDateString('pl-PL')} - ${endDate.toLocaleDateString('pl-PL')}`;
  }
}

export default AnalyticsExportService;
