import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
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
    plusOne: false,
    plusOneType: 'none', // 'none', 'simple', 'detailed'
    plusOneDetails: {
      firstName: '',
      lastName: '',
      dietaryRestrictions: ''
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePlusOneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      plusOneDetails: {
        ...prev.plusOneDetails,
        [name]: value
      }
    }));
  };

  const handlePlusOneTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      plusOneType: value,
      plusOne: value !== 'none',
      // Reset szczegółów gdy przełączamy na 'simple'
      plusOneDetails: value === 'simple' ? {
        firstName: '',
        lastName: '',
        dietaryRestrictions: ''
      } : prev.plusOneDetails
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const guestData = {
        ...formData,
        // Ustaw plusOne na podstawie typu
        plusOne: formData.plusOneType !== 'none',
        // Tylko przekaż plusOneDetails jeśli typ to 'detailed' i pola są wypełnione
        plusOneDetails: formData.plusOneType === 'detailed' && (
          formData.plusOneDetails.firstName?.trim() || 
          formData.plusOneDetails.lastName?.trim()
        ) ? {
          firstName: formData.plusOneDetails.firstName?.trim() || undefined,
          lastName: formData.plusOneDetails.lastName?.trim() || undefined,
          dietaryRestrictions: formData.plusOneDetails.dietaryRestrictions?.trim() || undefined
        } : undefined
      };
      
      await GuestService.createGuest(userId, eventId, guestData);
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
        plusOne: false,
        plusOneType: 'none',
        plusOneDetails: {
          firstName: '',
          lastName: '',
          dietaryRestrictions: ''
        }
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
            <FormControl component="fieldset" disabled={loading}>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                Osoba towarzysząca
              </FormLabel>
              <RadioGroup
                value={formData.plusOneType}
                onChange={handlePlusOneTypeChange}
                name="plusOneType"
              >
                <FormControlLabel
                  value="none"
                  control={<Radio size="small" />}
                  label="Brak osoby towarzyszącej"
                />
                <FormControlLabel
                  value="simple"
                  control={<Radio size="small" />}
                  label="Osoba towarzysząca (bez szczegółów)"
                />
                <FormControlLabel
                  value="detailed"
                  control={<Radio size="small" />}
                  label="Osoba towarzysząca (ze szczegółami)"
                />
              </RadioGroup>
            </FormControl>
            
            {formData.plusOneType === 'detailed' && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                borderRadius: 1,
                border: '1px solid rgba(25, 118, 210, 0.12)'
              }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Dane osoby towarzyszącej
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Imię osoby towarzyszącej"
                    name="firstName"
                    value={formData.plusOneDetails.firstName}
                    onChange={handlePlusOneChange}
                    disabled={loading}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Nazwisko osoby towarzyszącej"
                    name="lastName"
                    value={formData.plusOneDetails.lastName}
                    onChange={handlePlusOneChange}
                    disabled={loading}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Preferencje żywieniowe osoby towarzyszącej"
                    name="dietaryRestrictions"
                    value={formData.plusOneDetails.dietaryRestrictions}
                    onChange={handlePlusOneChange}
                    multiline
                    rows={2}
                    disabled={loading}
                    size="small"
                  />
                </Box>
              </Box>
            )}
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
