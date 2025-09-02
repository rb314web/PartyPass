import React, { useState, useEffect } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import { Save, Mail, Phone, User, Calendar } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { GuestService } from '../../../../services/firebase/guestService';
import type { Guest, UpdateGuestData } from '../../../../types';
import './EditGuestModal.scss';

interface EditGuestModalProps {
  open: boolean;
  onClose: () => void;
  guest: Guest | null;
  onGuestUpdated: () => void;
}

export const EditGuestModal: React.FC<EditGuestModalProps> = ({ 
  open, 
  onClose, 
  guest,
  onGuestUpdated 
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

  useEffect(() => {
    if (guest && open) {
      // Określ typ plus one na podstawie danych gościa
      let plusOneType = 'none';
      if (guest.plusOne) {
        if (guest.plusOneDetails && (guest.plusOneDetails.firstName || guest.plusOneDetails.lastName)) {
          plusOneType = 'detailed';
        } else {
          plusOneType = 'simple';
        }
      }
      
      setFormData({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone || '',
        dietaryRestrictions: guest.dietaryRestrictions || '',
        notes: guest.notes || '',
        plusOne: guest.plusOne || false,
        plusOneType: plusOneType,
        plusOneDetails: {
          firstName: guest.plusOneDetails?.firstName || '',
          lastName: guest.plusOneDetails?.lastName || '',
          dietaryRestrictions: guest.plusOneDetails?.dietaryRestrictions || ''
        }
      });
    }
  }, [guest, open]);

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
      plusOneDetails: value === 'detailed' ? prev.plusOneDetails : {
        firstName: '',
        lastName: '',
        dietaryRestrictions: ''
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;

    setLoading(true);
    try {
      const updateData: UpdateGuestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dietaryRestrictions: formData.dietaryRestrictions,
        notes: formData.notes,
        plusOne: formData.plusOne,
        plusOneDetails: formData.plusOne && formData.plusOneType === 'detailed' ? {
          firstName: formData.plusOneDetails.firstName?.trim() || undefined,
          lastName: formData.plusOneDetails.lastName?.trim() || undefined,
          dietaryRestrictions: formData.plusOneDetails.dietaryRestrictions?.trim() || undefined
        } : undefined
      };

      await GuestService.updateGuest(guest.id, updateData);

      enqueueSnackbar('Dane gościa zostały zaktualizowane!', { variant: 'success' });
      onGuestUpdated();
      onClose();
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Wystąpił błąd podczas aktualizacji gościa', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  if (!guest) return null;

  // Common styles for all TextFields
  const textFieldStyles = {
    '& .MuiInputBase-root': {
      backgroundColor: '#f8f9fa',
      color: '#333333',
      borderRadius: '8px',
      '&:hover': {
        backgroundColor: '#f1f3f4'
      },
      '&.Mui-focused': {
        backgroundColor: '#ffffff',
        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
      }
    },
    '& .MuiInputLabel-root': {
      color: '#666666',
      fontWeight: 500,
      '&.Mui-focused': {
        color: '#1976d2'
      }
    },
    '& .MuiFormHelperText-root': {
      color: '#666666',
      fontSize: '0.75rem'
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          color: '#333333',
          '& .MuiDialogTitle-root': {
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            borderBottom: '1px solid #e0e0e0',
            padding: '24px',
            color: '#333333'
          },
          '& .MuiDialogContent-root': {
            padding: '24px',
            backgroundColor: '#ffffff',
            color: '#333333'
          },
          '& .MuiDialogActions-root': {
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #e0e0e0',
            padding: '16px 24px'
          }
        }
      }}
    >
      <DialogTitle sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 48, 
            height: 48, 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #1976d2, #1565c0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <User size={24} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" sx={{ color: '#333333', fontWeight: 600 }}>
              Edytuj gościa
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#666666' }}>
              {guest.firstName} {guest.lastName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
            <Chip 
              icon={<Calendar size={16} />}
              label={guest.eventName}
              variant="outlined"
              color="primary"
              size="small"
              sx={{
                backgroundColor: '#ffffff',
                borderColor: '#1976d2',
                color: '#1976d2',
                '& .MuiChip-icon': { color: '#1976d2' }
              }}
            />
          </Box>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ backgroundColor: '#ffffff' }}>
          <Box sx={{ display: 'grid', gap: 3, mt: 1 }}>
            {/* Basic Information */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2' }}>
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
                disabled={loading}
                sx={textFieldStyles}
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
                disabled={loading}
                sx={textFieldStyles}
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
              sx={textFieldStyles}
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
              disabled={loading}
              sx={textFieldStyles}
              InputProps={{
                startAdornment: <Phone size={20} style={{ marginRight: 8, color: '#666' }} />
              }}
            />

            {/* Additional Information */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mt: 1 }}>
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
              disabled={loading}
              sx={textFieldStyles}
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
              disabled={loading}
              sx={textFieldStyles}
              placeholder="Dodatkowe informacje o gościu..."
            />
            
            {/* Plus One Options */}
            <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
              <FormLabel component="legend" sx={{ 
                color: '#333333', 
                fontWeight: 500,
                fontSize: '0.9rem',
                mb: 1
              }}>
                Osoba towarzysząca (+1)
              </FormLabel>
              <RadioGroup
                value={formData.plusOneType}
                onChange={handlePlusOneTypeChange}
                sx={{ ml: 1 }}
              >
                <FormControlLabel
                  value="none"
                  control={<Radio size="small" />}
                  label="Bez osoby towarzyszącej"
                  disabled={loading}
                />
                <FormControlLabel
                  value="simple"
                  control={<Radio size="small" />}
                  label="Z osobą towarzyszącą (bez danych)"
                  disabled={loading}
                />
                <FormControlLabel
                  value="detailed"
                  control={<Radio size="small" />}
                  label="Z osobą towarzyszącą (z danymi)"
                  disabled={loading}
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
                    sx={textFieldStyles}
                  />
                  <TextField
                    fullWidth
                    label="Nazwisko osoby towarzyszącej"
                    name="lastName"
                    value={formData.plusOneDetails.lastName}
                    onChange={handlePlusOneChange}
                    disabled={loading}
                    size="small"
                    sx={textFieldStyles}
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
                    sx={textFieldStyles}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1, backgroundColor: '#ffffff' }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            variant="outlined"
            sx={{
              color: '#666666',
              borderColor: '#e0e0e0',
              backgroundColor: '#ffffff',
              '&:hover': {
                backgroundColor: '#f8f9fa',
                borderColor: '#d0d0d0'
              }
            }}
          >
            Anuluj
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Save size={16} />}
            sx={{
              backgroundColor: '#1976d2',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#1565c0'
              },
              '&:disabled': {
                backgroundColor: '#e0e0e0',
                color: '#999999'
              }
            }}
          >
            {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditGuestModal;
