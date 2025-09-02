import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { ArrowLeft, Save, Mail, Phone, Calendar, User } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { GuestService } from '../../../../services/firebase/guestService';
import { EventService } from '../../../../services/firebase/eventService';
import { useAuth } from '../../../../hooks/useAuth';
import type { Guest } from '../../../../types';
import './EditGuest.scss';

export const EditGuest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dietaryRestrictions: '',
    notes: '',
    plusOne: false,
    status: 'pending' as Guest['status']
  });

  useEffect(() => {
    if (!id || !user) return;
    
    loadGuestData();
    loadEvents();
  }, [id, user]);

  const loadGuestData = async () => {
    try {
      setLoading(true);
      
      // Pobierz dane gościa - musimy przeszukać wszystkich gości użytkownika
      const result = await GuestService.getUserGuests(user!.id, {}, 1000);
      const foundGuest = result.guests.find(g => g.id === id);
      
      if (!foundGuest) {
        enqueueSnackbar('Nie znaleziono gościa', { variant: 'error' });
        navigate('/dashboard/guests');
        return;
      }

      setGuest(foundGuest);
      setFormData({
        firstName: foundGuest.firstName,
        lastName: foundGuest.lastName,
        email: foundGuest.email,
        phone: foundGuest.phone || '',
        dietaryRestrictions: foundGuest.dietaryRestrictions || '',
        notes: foundGuest.notes || '',
        plusOne: foundGuest.plusOne || false,
        status: foundGuest.status
      });
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Błąd podczas ładowania danych gościa', { 
        variant: 'error' 
      });
      navigate('/dashboard/guests');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const result = await EventService.getUserEvents(user!.id);
      const mappedEvents = result.events.map(event => ({
        id: event.id,
        title: event.title
      }));
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Błąd podczas ładowania wydarzeń:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;

    setSaving(true);
    try {
      await GuestService.updateGuest(guest.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dietaryRestrictions: formData.dietaryRestrictions,
        notes: formData.notes,
        plusOne: formData.plusOne,
        status: formData.status
      });

      enqueueSnackbar('Dane gościa zostały zaktualizowane!', { variant: 'success' });
      navigate('/dashboard/guests');
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Wystąpił błąd podczas aktualizacji gościa', { 
        variant: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: Guest['status']) => {
    const colors = {
      accepted: 'success',
      pending: 'warning',
      declined: 'error',
      maybe: 'info'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Guest['status']) => {
    const labels = {
      accepted: 'Potwierdzone',
      pending: 'Oczekujące',
      declined: 'Odrzucone',
      maybe: 'Może'
    };
    return labels[status];
  };

  if (loading) {
    return (
      <div className="edit-guest edit-guest--loading">
        <div className="edit-guest__loading">
          <CircularProgress size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Ładowanie danych gościa...
          </Typography>
        </div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="edit-guest edit-guest--error">
        <div className="edit-guest__error">
          <Typography variant="h6" color="error">
            Nie znaleziono gościa
          </Typography>
          <Button 
            onClick={() => navigate('/dashboard/guests')}
            startIcon={<ArrowLeft size={20} />}
            sx={{ mt: 2 }}
          >
            Powrót do listy gości
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-guest">
      <div className="edit-guest__header">
        <IconButton 
          onClick={() => navigate('/dashboard/guests')}
          className="edit-guest__back-btn"
        >
          <ArrowLeft size={24} />
        </IconButton>
        
        <div className="edit-guest__title-section">
          <div className="edit-guest__avatar">
            <User size={32} />
          </div>
          <div>
            <Typography variant="h4" component="h1" className="edit-guest__title">
              Edytuj gościa
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {guest.firstName} {guest.lastName}
            </Typography>
          </div>
        </div>

        <div className="edit-guest__event-info">
          <Chip 
            icon={<Calendar size={16} />}
            label={guest.eventName}
            variant="outlined"
            color="primary"
          />
          <Chip 
            label={getStatusLabel(guest.status)}
            color={getStatusColor(guest.status) as any}
            size="small"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="edit-guest__form">
        <div className="edit-guest__form-content">
          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* Basic Information */}
            <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
              Podstawowe informacje
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Imię"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={saving}
                InputProps={{
                  startAdornment: <User size={20} style={{ marginRight: 8, color: '#666' }} />
                }}
              />
              <TextField
                required
                fullWidth
                label="Nazwisko"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={saving}
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
              disabled={saving}
              InputProps={{
                startAdornment: <Mail size={20} style={{ marginRight: 8, color: '#666' }} />
              }}
            />
            
            <TextField
              fullWidth
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={saving}
              InputProps={{
                startAdornment: <Phone size={20} style={{ marginRight: 8, color: '#666' }} />
              }}
            />

            {/* Status */}
            <Typography variant="h6" component="h2" sx={{ mb: 1, mt: 2 }}>
              Status odpowiedzi
            </Typography>
            
            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={saving}
              helperText="Zmiana statusu wpłynie na statystyki wydarzenia"
            >
              <MenuItem value="pending">Oczekujące</MenuItem>
              <MenuItem value="accepted">Potwierdzone</MenuItem>
              <MenuItem value="declined">Odrzucone</MenuItem>
              <MenuItem value="maybe">Może</MenuItem>
            </TextField>

            {/* Additional Information */}
            <Typography variant="h6" component="h2" sx={{ mb: 1, mt: 2 }}>
              Dodatkowe informacje
            </Typography>
            
            <TextField
              fullWidth
              label="Preferencje żywieniowe"
              name="dietaryRestrictions"
              value={formData.dietaryRestrictions}
              onChange={handleChange}
              multiline
              rows={2}
              disabled={saving}
              placeholder="np. wegetariańska, bezglutenowa, alergia na orzechy..."
            />
            
            <TextField
              fullWidth
              label="Notatki"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
              disabled={saving}
              placeholder="Dodatkowe informacje o gościu..."
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.plusOne}
                  onChange={handleChange}
                  name="plusOne"
                  disabled={saving}
                />
              }
              label={
                <Typography>
                  Osoba towarzysząca (+1)
                </Typography>
              }
            />
          </Box>
        </div>

        <div className="edit-guest__form-actions">
          <Button 
            type="button"
            onClick={() => navigate('/dashboard/guests')}
            disabled={saving}
            variant="outlined"
            size="large"
          >
            Anuluj
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={saving}
            size="large"
            startIcon={saving ? <CircularProgress size={20} /> : <Save size={20} />}
          >
            {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditGuest;
