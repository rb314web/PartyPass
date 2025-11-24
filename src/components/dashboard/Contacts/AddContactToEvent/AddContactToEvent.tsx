import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { useAuth } from '../../../../hooks/useAuth';
import { EventService } from '../../../../services/firebase/eventService';
import { EventGuestService } from '../../../../services/firebase/eventGuestService';
import { Contact, Event } from '../../../../types';
import './AddContactToEvent.scss';

interface AddContactToEventProps {
  open: boolean;
  onClose: () => void;
  contact: Contact;
  onSuccess: () => void;
}

const AddContactToEvent: React.FC<AddContactToEventProps> = ({
  open,
  onClose,
  contact,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    eventSpecificNotes: '',
    plusOneType: 'none' as 'none' | 'withoutDetails' | 'withDetails',
    plusOneDetails: {
      firstName: '',
      lastName: '',
      dietaryRestrictions: '',
    },
  });

  // Load user events
  useEffect(() => {
    const loadEvents = async () => {
      if (!user?.id || !open) return;

      setLoadingEvents(true);
      try {
        const result = await EventService.getUserEvents(user.id);
        setEvents(
          result.events.filter(
            event => event.status === 'draft' || event.status === 'active'
          )
        );
        setError(null);
      } catch (err: any) {
        setError('Błąd podczas ładowania wydarzeń');
        console.error('Error loading events:', err);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, [user?.id, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEventId) {
      setError('Wybierz wydarzenie');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await EventGuestService.addContactToEvent(selectedEventId, contact.id, {
        contactId: contact.id,
        eventSpecificNotes: formData.eventSpecificNotes,
        plusOneType: formData.plusOneType,
        plusOneDetails:
          formData.plusOneType === 'withDetails'
            ? formData.plusOneDetails
            : undefined,
      });

      onSuccess();
      onClose();

      // Reset form
      setSelectedEventId('');
      setFormData({
        eventSpecificNotes: '',
        plusOneType: 'none',
        plusOneDetails: {
          firstName: '',
          lastName: '',
          dietaryRestrictions: '',
        },
      });
    } catch (err: any) {
      setError(err.message || 'Błąd podczas dodawania kontaktu do wydarzenia');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Dodaj kontakt do wydarzenia</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Contact info */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Kontakt do dodania:
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {contact.firstName} {contact.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {contact.email}
              </Typography>
            </Box>

            {/* Error alert */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Event selection */}
            <FormControl fullWidth required>
              <InputLabel>Wydarzenie</InputLabel>
              <Select
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value)}
                disabled={loading || loadingEvents}
                label="Wydarzenie"
              >
                {loadingEvents ? (
                  <MenuItem disabled>Ładowanie wydarzeń...</MenuItem>
                ) : events.length === 0 ? (
                  <MenuItem disabled>Brak dostępnych wydarzeń</MenuItem>
                ) : (
                  events.map(event => (
                    <MenuItem key={event.id} value={event.id}>
                      <Box>
                        <Typography variant="body1">{event.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.date.toLocaleDateString('pl-PL')} -{' '}
                          {event.location}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Event specific notes */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notatki dotyczące wydarzenia"
              value={formData.eventSpecificNotes}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  eventSpecificNotes: e.target.value,
                }))
              }
              disabled={loading}
              placeholder="Dodatkowe informacje dla tego gościa w kontekście wydarzenia..."
            />

            {/* Plus one options */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Opcje plus one
              </Typography>

              <FormControl component="fieldset">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.plusOneType === 'none'}
                        onChange={() =>
                          setFormData(prev => ({
                            ...prev,
                            plusOneType: 'none',
                          }))
                        }
                        disabled={loading}
                      />
                    }
                    label="Bez plus one"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.plusOneType === 'withoutDetails'}
                        onChange={() =>
                          setFormData(prev => ({
                            ...prev,
                            plusOneType: 'withoutDetails',
                          }))
                        }
                        disabled={loading}
                      />
                    }
                    label="Plus one bez szczegółów"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.plusOneType === 'withDetails'}
                        onChange={() =>
                          setFormData(prev => ({
                            ...prev,
                            plusOneType: 'withDetails',
                          }))
                        }
                        disabled={loading}
                      />
                    }
                    label="Plus one ze szczegółami"
                  />
                </Box>
              </FormControl>

              {/* Plus one details */}
              {formData.plusOneType === 'withDetails' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Szczegóły plus one
                  </Typography>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <TextField
                      label="Imię"
                      value={formData.plusOneDetails.firstName}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          plusOneDetails: {
                            ...prev.plusOneDetails,
                            firstName: e.target.value,
                          },
                        }))
                      }
                      disabled={loading}
                    />

                    <TextField
                      label="Nazwisko"
                      value={formData.plusOneDetails.lastName}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          plusOneDetails: {
                            ...prev.plusOneDetails,
                            lastName: e.target.value,
                          },
                        }))
                      }
                      disabled={loading}
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label="Ograniczenia dietetyczne"
                    value={formData.plusOneDetails.dietaryRestrictions}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        plusOneDetails: {
                          ...prev.plusOneDetails,
                          dietaryRestrictions: e.target.value,
                        },
                      }))
                    }
                    disabled={loading}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Anuluj
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !selectedEventId}
          >
            {loading ? 'Dodawanie...' : 'Dodaj do wydarzenia'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddContactToEvent;
