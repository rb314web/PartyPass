// components/dashboard/Events/DuplicateEventModal/DuplicateEventModal.tsx
import React, { useState } from 'react';
import {
  X,
  Copy,
  Calendar,
  Users,
  FileText,
  Save,
  AlertCircle
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Event } from '../../../../types';
import './DuplicateEventModal.scss';

interface DuplicateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onDuplicate: (duplicateData: DuplicateEventData) => Promise<void>;
}

export interface DuplicateEventData {
  title: string;
  date: Date;
  includeGuests: boolean;
  guestAction: 'copy' | 'invite' | 'none';
  dateOffset: 'same' | 'tomorrow' | 'nextWeek' | 'nextMonth' | 'custom';
  customDate?: Date;
}

const DuplicateEventModal: React.FC<DuplicateEventModalProps> = ({
  isOpen,
  onClose,
  event,
  onDuplicate
}) => {
  const [duplicateData, setDuplicateData] = useState<DuplicateEventData>({
    title: `${event.title} (kopia)`,
    date: addWeeks(event.date, 1),
    includeGuests: false,
    guestAction: 'none',
    dateOffset: 'nextWeek'
  });
  const [customDate, setCustomDate] = useState(format(addWeeks(event.date, 1), 'yyyy-MM-dd'));
  const [customTime, setCustomTime] = useState(format(addWeeks(event.date, 1), 'HH:mm'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateOffsetChange = (offset: DuplicateEventData['dateOffset']) => {
    setDuplicateData(prev => {
      let newDate: Date;
      
      switch (offset) {
        case 'same':
          newDate = event.date;
          break;
        case 'tomorrow':
          newDate = addDays(event.date, 1);
          break;
        case 'nextWeek':
          newDate = addWeeks(event.date, 1);
          break;
        case 'nextMonth':
          newDate = addMonths(event.date, 1);
          break;
        case 'custom':
          newDate = new Date(`${customDate}T${customTime}`);
          break;
        default:
          newDate = event.date;
      }
      
      return { ...prev, dateOffset: offset, date: newDate };
    });
    
    if (offset !== 'custom') {
      const newDate = getDateFromOffset(offset);
      setCustomDate(format(newDate, 'yyyy-MM-dd'));
      setCustomTime(format(newDate, 'HH:mm'));
    }
  };

  const getDateFromOffset = (offset: DuplicateEventData['dateOffset']): Date => {
    switch (offset) {
      case 'same':
        return event.date;
      case 'tomorrow':
        return addDays(event.date, 1);
      case 'nextWeek':
        return addWeeks(event.date, 1);
      case 'nextMonth':
        return addMonths(event.date, 1);
      default:
        return event.date;
    }
  };

  const handleCustomDateChange = () => {
    const newDate = new Date(`${customDate}T${customTime}`);
    setDuplicateData(prev => ({ ...prev, date: newDate, customDate: newDate }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onDuplicate(duplicateData);
      onClose();
    } catch (error) {
      console.error('Błąd podczas duplikowania wydarzenia:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="duplicate-modal">
      <div className="duplicate-modal__overlay" onClick={onClose} />
      <div className="duplicate-modal__content">
        <div className="duplicate-modal__header">
          <h2>
            <Copy size={24} />
            Duplikuj wydarzenie
          </h2>
          <button onClick={onClose} className="duplicate-modal__close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="duplicate-modal__form">
          <div className="duplicate-modal__section">
            <h3>
              <FileText size={20} />
              Podstawowe informacje
            </h3>
            
            <div className="duplicate-modal__field">
              <label htmlFor="title">Tytuł nowego wydarzenia</label>
              <input
                type="text"
                id="title"
                value={duplicateData.title}
                onChange={(e) => setDuplicateData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Wprowadź tytuł wydarzenia"
                required
              />
            </div>
          </div>

          <div className="duplicate-modal__section">
            <h3>
              <Calendar size={20} />
              Data wydarzenia
            </h3>
            
            <div className="duplicate-modal__date-options">
              <label className="duplicate-modal__radio">
                <input
                  type="radio"
                  value="same"
                  checked={duplicateData.dateOffset === 'same'}
                  onChange={(e) => handleDateOffsetChange(e.target.value as any)}
                />
                <span>Ta sama data ({format(event.date, 'dd MMMM yyyy, HH:mm', { locale: pl })})</span>
              </label>
              
              <label className="duplicate-modal__radio">
                <input
                  type="radio"
                  value="tomorrow"
                  checked={duplicateData.dateOffset === 'tomorrow'}
                  onChange={(e) => handleDateOffsetChange(e.target.value as any)}
                />
                <span>Jutro ({format(addDays(event.date, 1), 'dd MMMM yyyy, HH:mm', { locale: pl })})</span>
              </label>
              
              <label className="duplicate-modal__radio">
                <input
                  type="radio"
                  value="nextWeek"
                  checked={duplicateData.dateOffset === 'nextWeek'}
                  onChange={(e) => handleDateOffsetChange(e.target.value as any)}
                />
                <span>Za tydzień ({format(addWeeks(event.date, 1), 'dd MMMM yyyy, HH:mm', { locale: pl })})</span>
              </label>
              
              <label className="duplicate-modal__radio">
                <input
                  type="radio"
                  value="nextMonth"
                  checked={duplicateData.dateOffset === 'nextMonth'}
                  onChange={(e) => handleDateOffsetChange(e.target.value as any)}
                />
                <span>Za miesiąc ({format(addMonths(event.date, 1), 'dd MMMM yyyy, HH:mm', { locale: pl })})</span>
              </label>
              
              <label className="duplicate-modal__radio">
                <input
                  type="radio"
                  value="custom"
                  checked={duplicateData.dateOffset === 'custom'}
                  onChange={(e) => handleDateOffsetChange(e.target.value as any)}
                />
                <span>Inna data</span>
              </label>
              
              {duplicateData.dateOffset === 'custom' && (
                <div className="duplicate-modal__custom-date">
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => {
                      setCustomDate(e.target.value);
                      handleCustomDateChange();
                    }}
                  />
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => {
                      setCustomTime(e.target.value);
                      handleCustomDateChange();
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="duplicate-modal__section">
            <h3>
              <Users size={20} />
              Goście wydarzenia
            </h3>
            
            <div className="duplicate-modal__guest-options">
              <label className="duplicate-modal__checkbox">
                <input
                  type="checkbox"
                  checked={duplicateData.includeGuests}
                  onChange={(e) => {
                    const include = e.target.checked;
                    setDuplicateData(prev => ({
                      ...prev,
                      includeGuests: include,
                      guestAction: include ? 'copy' : 'none'
                    }));
                  }}
                />
                <span>Uwzględnij gości z oryginalnego wydarzenia</span>
              </label>
              
              {duplicateData.includeGuests && (
                <div className="duplicate-modal__guest-actions">
                  <label className="duplicate-modal__radio">
                    <input
                      type="radio"
                      value="copy"
                      checked={duplicateData.guestAction === 'copy'}
                      onChange={(e) => setDuplicateData(prev => ({ ...prev, guestAction: e.target.value as any }))}
                    />
                    <span>Skopiuj listę gości (bez wysyłania zaproszeń)</span>
                  </label>
                  
                  <label className="duplicate-modal__radio">
                    <input
                      type="radio"
                      value="invite"
                      checked={duplicateData.guestAction === 'invite'}
                      onChange={(e) => setDuplicateData(prev => ({ ...prev, guestAction: e.target.value as any }))}
                    />
                    <span>Skopiuj i wyślij nowe zaproszenia</span>
                  </label>
                </div>
              )}
              
              {event.guestCount > 0 && (
                <div className="duplicate-modal__guest-info">
                  <AlertCircle size={16} />
                  <span>Oryginalne wydarzenie ma {event.guestCount} gości</span>
                </div>
              )}
            </div>
          </div>

          <div className="duplicate-modal__actions">
            <button type="button" onClick={onClose} className="duplicate-modal__cancel">
              Anuluj
            </button>
            <button type="submit" disabled={isSubmitting} className="duplicate-modal__submit">
              <Save size={20} />
              {isSubmitting ? 'Duplikowanie...' : 'Duplikuj wydarzenie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DuplicateEventModal;
