// components/dashboard/Contacts/EditContactModal/EditContactModal.tsx
import React, { useState, useEffect } from 'react';
import { Save, User, Tag } from 'lucide-react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box, 
  Typography,
  Chip,
  Alert
} from '@mui/material';
import { ContactService } from '../../../../services/firebase/contactService';
import { Contact, UpdateContactData } from '../../../../types';
import './EditContactModal.scss';

interface EditContactModalProps {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onContactUpdated?: (contact: Contact) => void;
}

const EditContactModal: React.FC<EditContactModalProps> = ({ 
  open, 
  contact, 
  onClose, 
  onContactUpdated 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState<UpdateContactData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dietaryRestrictions: '',
    notes: '',
    tags: []
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        phone: contact.phone || '',
        dietaryRestrictions: contact.dietaryRestrictions || '',
        notes: contact.notes || '',
        tags: contact.tags || []
      });
      setError(null);
    }
  }, [contact]);

  const handleInputChange = (field: keyof UpdateContactData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError(null);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contact) {
      setError('Brak danych kontaktu');
      return;
    }

    if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.email?.trim()) {
      setError('Imię, nazwisko i email są wymagane');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sprawdź czy email już istnieje (z wyłączeniem aktualnego kontaktu)
      const emailExists = await ContactService.checkEmailExists(
        contact.userId, 
        formData.email!.trim(), 
        contact.id
      );
      
      if (emailExists) {
        setError('Kontakt z tym adresem email już istnieje');
        setLoading(false);
        return;
      }

      await ContactService.updateContact(contact.id, {
        ...formData,
        firstName: formData.firstName!.trim(),
        lastName: formData.lastName!.trim(),
        email: formData.email!.trim(),
        phone: formData.phone?.trim() || undefined,
        dietaryRestrictions: formData.dietaryRestrictions?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        tags: formData.tags?.filter(tag => tag.trim()) || []
      });

      // Pobierz zaktualizowany kontakt
      const updatedContact = await ContactService.getContact(contact.id);
      if (updatedContact) {
        onContactUpdated?.(updatedContact);
      }

      onClose();
    } catch (error: any) {
      console.error('Error updating contact:', error);
      setError(error.message || 'Wystąpił błąd podczas aktualizacji kontaktu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!contact) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        pb: 2
      }}>
        <User size={24} />
        <Typography variant="h6" component="span">
          Edytuj kontakt
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 0 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box className="edit-contact__form">
            <Box className="edit-contact__row">
              <TextField
                fullWidth
                label="Imię"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                required
                disabled={loading}
                sx={{ mb: 2 }}
              />
            </Box>

            <Box className="edit-contact__row">
              <TextField
                fullWidth
                label="Nazwisko"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                required
                disabled={loading}
                sx={{ mb: 2 }}
              />
            </Box>

            <Box className="edit-contact__row">
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                disabled={loading}
                sx={{ mb: 2 }}
              />
            </Box>

            <Box className="edit-contact__row">
              <TextField
                fullWidth
                label="Telefon"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                disabled={loading}
                sx={{ mb: 2 }}
              />
            </Box>

            <Box className="edit-contact__row">
              <TextField
                fullWidth
                label="Preferencje żywieniowe"
                multiline
                rows={2}
                value={formData.dietaryRestrictions}
                onChange={handleInputChange('dietaryRestrictions')}
                disabled={loading}
                sx={{ mb: 2 }}
              />
            </Box>

            <Box className="edit-contact__row">
              <TextField
                fullWidth
                label="Notatki"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleInputChange('notes')}
                disabled={loading}
                sx={{ mb: 2 }}
              />
            </Box>

            <Box className="edit-contact__tags">
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Tagi
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {formData.tags?.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  label="Nowy tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  disabled={loading}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleAddTag}
                  disabled={loading || !newTag.trim()}
                  size="small"
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <Tag size={16} />
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleClose}
            disabled={loading}
            color="inherit"
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? undefined : <Save size={18} />}
            sx={{
              minWidth: 120,
              background: 'var(--primary-500)',
              '&:hover': {
                background: 'var(--primary-600)'
              }
            }}
          >
            {loading ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditContactModal;
