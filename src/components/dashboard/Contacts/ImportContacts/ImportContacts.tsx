import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Download,
  FileDown,
} from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { ContactService } from '../../../../services/firebase/contactService';
import { Contact } from '../../../../types';
import './ImportContacts.scss';

interface ImportError {
  row: number;
  message: string;
  data?: any;
}

const ImportContacts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: ImportError[];
    total: number;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type === 'text/csv' ||
        droppedFile.name.endsWith('.csv')
      ) {
        setFile(droppedFile);
      }
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
      }
    },
    []
  );

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0]
      .split(',')
      .map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    const rows = lines.slice(1);

    return rows.map((row, index) => {
      // Parsowanie CSV z obsługą cudzysłowów
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < row.length; i++) {
        const char = row[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const obj: any = { rowNumber: index + 2 };

      headers.forEach((header, i) => {
        // Usuń cudzysłowy z wartości
        obj[header] = (values[i] || '').replace(/^"|"$/g, '');
      });

      return obj;
    });
  };

  const handleImport = async () => {
    if (!file || !user?.id) return;

    setIsImporting(true);
    const errors: ImportError[] = [];
    let successCount = 0;

    try {
      const text = await file.text();
      const data = parseCSV(text);

      for (const row of data) {
        try {
          const contactData = {
            firstName: row.firstname || row['first name'] || row.imie || '',
            lastName: row.lastname || row['last name'] || row.nazwisko || '',
            email: row.email || row['e-mail'] || '',
            phone: row.phone || row.telefon || row.tel || '',
            dietaryRestrictions:
              row.dietary || row.dieta || row.preferencje || '',
          };

          if (
            !contactData.firstName ||
            !contactData.lastName ||
            !contactData.email
          ) {
            errors.push({
              row: row.rowNumber,
              message: 'Brak wymaganych pól: imię, nazwisko, email',
              data: row,
            });
            continue;
          }

          await ContactService.createContact(user.id, contactData);
          successCount++;
        } catch (err: any) {
          errors.push({
            row: row.rowNumber,
            message: err.message || 'Nieznany błąd',
            data: row,
          });
        }
      }

      setImportResults({
        success: successCount,
        errors,
        total: data.length,
      });
    } catch (err: any) {
      console.error('Import error:', err);
      errors.push({
        row: 0,
        message: 'Błąd podczas odczytu pliku: ' + err.message,
      });
      setImportResults({
        success: 0,
        errors,
        total: 0,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template =
      'firstname,lastname,email,phone,dietary\nJan,Kowalski,jan@example.com,123456789,Wegetariańska\nAnna,Nowak,anna@example.com,987654321,Bezglutenowa';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'szablon_kontakty.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = useCallback(async () => {
    if (!user?.id) {
      setExportStatus({
        type: 'error',
        message: 'Brak danych użytkownika do eksportu.',
      });
      return;
    }

    setIsExporting(true);
    setExportStatus(null);

    try {
      const allContacts: Contact[] = [];
      let lastDocument: any = undefined;
      let hasMore = true;

      while (hasMore) {
        const result = await ContactService.getUserContacts(
          user.id,
          {},
          500,
          lastDocument
        );
        allContacts.push(...result.contacts);

        if (result.hasMore && result.lastDoc) {
          lastDocument = result.lastDoc;
        } else {
          hasMore = false;
        }
      }

      if (!allContacts.length) {
        setExportStatus({
          type: 'error',
          message: 'Brak kontaktów do eksportu.',
        });
        return;
      }

      const headers = ['firstname', 'lastname', 'email', 'phone', 'dietary'];
      const rows = allContacts.map(contact => [
        contact.firstName || '',
        contact.lastName || '',
        contact.email || '',
        contact.phone || '',
        contact.dietaryRestrictions || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kontakty_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      setExportStatus({
        type: 'success',
        message: `Wyeksportowano ${allContacts.length} kontaktów.`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      setExportStatus({
        type: 'error',
        message: error?.message || 'Nie udało się wyeksportować kontaktów.',
      });
    } finally {
      setIsExporting(false);
    }
  }, [user?.id]);

  return (
    <div className="import-contacts">
      <div className="import-contacts__header">
        <button
          className="import-contacts__back"
          onClick={() => navigate('/dashboard/contacts')}
        >
          <ArrowLeft size={20} />
          Powrót
        </button>
        <div className="import-contacts__title">
          <h1>Import i eksport kontaktów</h1>
          <p>Zarządzaj bazą kontaktów za pomocą plików CSV</p>
        </div>
      </div>

      {!importResults ? (
        <div className="import-contacts__content">
          <section className="import-contacts__card import-contacts__card--import">
            <div className="import-contacts__instructions">
              <h2>Jak zaimportować kontakty?</h2>
              <ol>
                <li>Pobierz szablon CSV lub przygotuj własny plik</li>
                <li>
                  Wypełnij dane kontaktów (wymagane: imię, nazwisko, email)
                </li>
                <li>Przeciągnij plik tutaj lub wybierz z dysku</li>
                <li>Kliknij "Importuj kontakty"</li>
              </ol>
              <button
                className="import-contacts__template-btn"
                onClick={downloadTemplate}
              >
                <Download size={18} />
                Pobierz szablon CSV
              </button>
            </div>

            <div
              className={`import-contacts__dropzone ${dragActive ? 'import-contacts__dropzone--active' : ''} ${file ? 'import-contacts__dropzone--has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="import-contacts__file-info">
                  <FileText size={48} />
                  <p className="import-contacts__file-name">{file.name}</p>
                  <p className="import-contacts__file-size">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    className="import-contacts__remove-file"
                    onClick={() => setFile(null)}
                  >
                    Usuń plik
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={48} />
                  <p className="import-contacts__dropzone-text">
                    Przeciągnij plik CSV tutaj
                  </p>
                  <p className="import-contacts__dropzone-subtext">lub</p>
                  <label className="import-contacts__file-label">
                    Wybierz plik
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="import-contacts__file-input"
                    />
                  </label>
                </>
              )}
            </div>

            {file && (
              <button
                className="import-contacts__import-btn"
                onClick={handleImport}
                disabled={isImporting}
              >
                {isImporting ? 'Importowanie...' : 'Importuj kontakty'}
              </button>
            )}
          </section>

          <section className="import-contacts__card import-contacts__card--export">
            <div className="import-contacts__export-header">
              <h2>Eksport kontaktów</h2>
              <p>Pobierz aktualną bazę kontaktów w formacie CSV.</p>
            </div>
            <ul className="import-contacts__export-list">
              <li>
                Eksport obejmuje wszystkie kontakty przypisane do Twojego konta.
              </li>
              <li>Plik CSV jest kompatybilny z Excel oraz Google Sheets.</li>
              <li>
                Zawiera pola: imię, nazwisko, email, telefon i preferencje
                dietetyczne.
              </li>
            </ul>
            <button
              className="import-contacts__export-btn"
              onClick={handleExport}
              disabled={isExporting}
            >
              <FileDown size={18} />
              {isExporting ? 'Eksportowanie...' : 'Eksportuj kontakty'}
            </button>
            {exportStatus && (
              <div
                className={`import-contacts__export-status import-contacts__export-status--${exportStatus.type}`}
              >
                {exportStatus.type === 'success' ? (
                  <CheckCircle size={18} aria-hidden="true" />
                ) : (
                  <AlertCircle size={18} aria-hidden="true" />
                )}
                <span>{exportStatus.message}</span>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="import-contacts__results">
          <div
            className={`import-contacts__summary ${importResults.errors.length === 0 ? 'import-contacts__summary--success' : ''}`}
          >
            {importResults.errors.length === 0 ? (
              <>
                <CheckCircle size={48} />
                <h2>Import zakończony sukcesem!</h2>
                <p>
                  Zaimportowano {importResults.success} z {importResults.total}{' '}
                  kontaktów
                </p>
              </>
            ) : (
              <>
                <AlertCircle size={48} />
                <h2>Import zakończony z błędami</h2>
                <p>
                  Zaimportowano {importResults.success} z {importResults.total}{' '}
                  kontaktów
                </p>
              </>
            )}
          </div>

          {importResults.errors.length > 0 && (
            <div className="import-contacts__errors">
              <h3>Błędy importu:</h3>
              <ul>
                {importResults.errors.map((error, index) => (
                  <li key={index}>
                    <strong>Wiersz {error.row}:</strong> {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="import-contacts__actions">
            <button
              className="import-contacts__action-btn import-contacts__action-btn--primary"
              onClick={() =>
                navigate('/dashboard/contacts', { state: { fromImport: true } })
              }
            >
              Przejdź do kontaktów
            </button>
            <button
              className="import-contacts__action-btn import-contacts__action-btn--secondary"
              onClick={() => {
                setFile(null);
                setImportResults(null);
              }}
            >
              Importuj kolejny plik
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportContacts;
