import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import { useSnackbar } from 'notistack';
import { GuestService } from '../../../../services/firebase/guestService';
import './AddGuest.scss';

interface AddGuestProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  eventId: string;
  onGuestAdded: () => void;
  events: Array<{
    id: string;
    title: string;
  }>;
  onEventChange: (eventId: string) => void;
}

export const AddGuest: React.FC<AddGuestProps> = ({ 
  open, 
  onClose, 
  userId, 
  eventId,
  events,
  onEventChange,
  onGuestAdded 
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dietaryRestrictions: '',
    notes: '',
    plusOne: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await GuestService.createGuest(userId, eventId, formData);
      enqueueSnackbar('Gość został dodany pomyślnie!', { variant: 'success' });
      onGuestAdded();
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dietaryRestrictions: '',
        notes: '',
        plusOne: false
      });
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Wystąpił błąd podczas dodawania gościa', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Dodaj nowego gościa</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              select
              required
              fullWidth
              label="Wydarzenie"
              value={eventId}
              onChange={(e) => onEventChange(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.title}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Imię"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                required
                fullWidth
                label="Nazwisko"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />
            </Box>
            <TextField
              required
              fullWidth
              type="email"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Preferencje żywieniowe"
              name="dietaryRestrictions"
              value={formData.dietaryRestrictions}
              onChange={handleChange}
              multiline
              rows={2}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Notatki"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
              disabled={loading}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.plusOne}
                  onChange={handleChange}
                  name="plusOne"
                  disabled={loading}
                />
              }
              label={
                <Typography>
                  Osoba towarzysząca (+1)
                </Typography>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Anuluj
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Dodawanie...' : 'Dodaj gościa'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddGuest;
