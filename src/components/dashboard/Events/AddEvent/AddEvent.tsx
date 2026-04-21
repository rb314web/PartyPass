import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { pl } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import { EventService } from '../../../../services/firebase/eventService';
import { useAuth } from '../../../../hooks/useAuth';
import { canCreateEvent, getEventLimitErrorMessage, PlanType } from '../../../../services/firebase/planLimitsService';
import './AddEvent.scss';

interface AddEventProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onEventAdded: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  date: Date;
  location: string;
  maxGuests: string;
  dresscode?: string;
  additionalInfo?: string;
}

export const AddEvent: React.FC<AddEventProps> = ({
  open,
  onClose,
  userId,
  onEventAdded,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [canAddEvent, setCanAddEvent] = useState(true);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: new Date(),
    location: '',
    maxGuests: '',
    dresscode: '',
    additionalInfo: '',
  });

  // Sprawdź limit zdarzeń
  useEffect(() => {
    const checkEventLimit = async () => {
      if (!user) return;
      
      try {
        const count = await EventService.getEventCount(userId);
        setEventCount(count);
        setCanAddEvent(canCreateEvent(count, user.planType as PlanType));
      } catch (error) {
        console.error('Error checking event limit:', error);
      }
    };

    if (open) {
      checkEventLimit();
    }
  }, [open, userId, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setFormData(prev => ({
        ...prev,
        date: newDate,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const maxGuestsNum = parseInt(formData.maxGuests);
      if (isNaN(maxGuestsNum) || maxGuestsNum <= 0) {
        throw new Error('Maksymalna liczba gości musi być liczbą większą od 0');
      }

      await EventService.createEvent(userId, {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        maxGuests: maxGuestsNum,
        dresscode: formData.dresscode || '',
        additionalInfo: formData.additionalInfo || '',
        guestCount: 0,
        acceptedCount: 0,
        declinedCount: 0,
        pendingCount: 0,
      });

      enqueueSnackbar('Wydarzenie zostało utworzone pomyślnie!', {
        variant: 'success',
      });
      onEventAdded();
      onClose();
      setFormData({
        title: '',
        description: '',
        date: new Date(),
        location: '',
        maxGuests: '',
        dresscode: '',
        additionalInfo: '',
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.message || 'Wystąpił błąd podczas tworzenia wydarzenia',
        {
          variant: 'error',
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="add-event-dialog"
    >
      <DialogTitle>Utwórz nowe wydarzenie</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Nazwa wydarzenia"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
            />

            <TextField
              required
              fullWidth
              label="Opis"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              disabled={loading}
            />

            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={pl}
            >
              <DateTimePicker
                label="Data i godzina wydarzenia"
                value={formData.date}
                onChange={handleDateChange}
                disabled={loading}
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>

            <TextField
              required
              fullWidth
              label="Lokalizacja"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
            />

            <TextField
              required
              fullWidth
              label="Maksymalna liczba gości"
              name="maxGuests"
              type="number"
              value={formData.maxGuests}
              onChange={handleChange}
              disabled={loading}
              inputProps={{ min: 1 }}
            />

            <TextField
              fullWidth
              label="Dress code"
              name="dresscode"
              value={formData.dresscode}
              onChange={handleChange}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Dodatkowe informacje"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              multiline
              rows={3}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Anuluj
          </Button>
          <Tooltip 
            title={!canAddEvent ? getEventLimitErrorMessage(user?.planType as PlanType) : ''}
            disableHoverListener={canAddEvent}
          >
            <span>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !canAddEvent}
              >
                {loading ? 'Tworzenie...' : 'Utwórz wydarzenie'}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddEvent;
