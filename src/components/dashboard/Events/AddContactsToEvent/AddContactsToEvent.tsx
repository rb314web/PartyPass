import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Checkbox,
  InputAdornment,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { Search, Users, UserCheck } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { ContactService } from '../../../../services/firebase/contactService';
import { EventGuestService } from '../../../../services/firebase/eventGuestService';
import { Contact } from '../../../../types';
import './AddContactsToEvent.scss';

interface AddContactsToEventProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  onContactsAdded: () => void;
}

const AddContactsToEvent: React.FC<AddContactsToEventProps> = ({
  open,
  onClose,
  eventId,
  eventTitle,
  onContactsAdded
}) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data for selected contacts
  const [globalSettings, setGlobalSettings] = useState({
    plusOneType: 'none' as 'none' | 'withoutDetails' | 'withDetails',
    eventSpecificNotes: ''
  });

  // Load contacts when dialog opens
  useEffect(() => {
    const loadContacts = async () => {
      if (!user?.id || !open) return;
      
      setLoadingContacts(true);
      try {
        const result = await ContactService.getUserContacts(user.id, {}, 100);
        
        // Filter out contacts that are already in the event
        const existingContactIds = await getExistingContactIds();
        const availableContacts = result.contacts.filter(
          contact => !existingContactIds.includes(contact.id)
        );
        
        setContacts(availableContacts);
        setError(null);
      } catch (err: any) {
        setError('Błąd podczas ładowania kontaktów');
        console.error('Error loading contacts:', err);
      } finally {
        setLoadingContacts(false);
      }
    };

    loadContacts();
  }, [user?.id, open, eventId]);

  // Get existing contact IDs for this event
  const getExistingContactIds = async (): Promise<string[]> => {
    try {
      const eventGuests = await EventGuestService.getEventGuests(eventId);
      return eventGuests.map(guest => guest.contact.id);
    } catch (error) {
      console.error('Error getting existing contacts:', error);
      return [];
    }
  };

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      contact.firstName.toLowerCase().includes(searchTerm) ||
      contact.lastName.toLowerCase().includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm)
    );
  });

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedContacts.length === 0) {
      setError('Wybierz przynajmniej jeden kontakt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Add each selected contact to the event
      for (const contactId of selectedContacts) {
        await EventGuestService.addContactToEvent(eventId, contactId, {
          contactId,
          eventSpecificNotes: globalSettings.eventSpecificNotes,
          plusOneType: globalSettings.plusOneType,
          plusOneDetails: globalSettings.plusOneType === 'withDetails' ? {
            firstName: '',
            lastName: '',
            dietaryRestrictions: ''
          } : undefined
        });
      }

      onContactsAdded();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Błąd podczas dodawania kontaktów');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setSelectedContacts([]);
      setSearchQuery('');
      setError(null);
      setGlobalSettings({
        plusOneType: 'none',
        eventSpecificNotes: ''
      });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserCheck size={24} />
          <Box>
            <Typography variant="h6">
              Dodaj kontakty do wydarzenia
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {eventTitle}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '600px' }}>
          {/* Error alert */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Search */}
          <TextField
            placeholder="Szukaj kontaktów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading || loadingContacts}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              )
            }}
          />

          {/* Select all */}
          {filteredContacts.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                size="small"
                onClick={handleSelectAll}
                disabled={loading || loadingContacts}
              >
                {selectedContacts.length === filteredContacts.length ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
              </Button>
              <Typography variant="body2" color="text.secondary">
                Wybrano: {selectedContacts.length} z {filteredContacts.length}
              </Typography>
            </Box>
          )}

          {/* Contacts list */}
          <Box sx={{ flex: 1, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            {loadingContacts ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Ładowanie kontaktów...</Typography>
              </Box>
            ) : filteredContacts.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Users size={48} color="#ccc" />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                  {searchQuery ? 'Nie znaleziono kontaktów' : 'Brak dostępnych kontaktów'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery 
                    ? 'Spróbuj zmienić wyszukiwanie'
                    : 'Wszystkie kontakty są już dodane do wydarzenia'
                  }
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredContacts.map((contact, index) => (
                  <React.Fragment key={contact.id}>
                    <ListItem
                      onClick={() => !loading && handleContactToggle(contact.id)}
                      sx={{
                        cursor: loading ? 'default' : 'pointer',
                        backgroundColor: selectedContacts.includes(contact.id) ? 'action.selected' : 'inherit',
                        '&:hover': {
                          backgroundColor: loading ? 'inherit' : 'action.hover'
                        },
                        opacity: loading ? 0.5 : 1
                      }}
                    >
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleContactToggle(contact.id)}
                        disabled={loading}
                      />
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {contact.firstName[0]}{contact.lastName[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${contact.firstName} ${contact.lastName}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {contact.email}
                            </Typography>
                            {contact.phone && (
                              <Typography variant="caption" color="text.secondary">
                                {contact.phone}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < filteredContacts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>

          {/* Global settings */}
          {selectedContacts.length > 0 && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Ustawienia dla wybranych kontaktów
              </Typography>
              
              {/* Plus one settings */}
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend">Opcje plus one</FormLabel>
                <RadioGroup
                  value={globalSettings.plusOneType}
                  onChange={(e) => setGlobalSettings(prev => ({ 
                    ...prev, 
                    plusOneType: e.target.value as any 
                  }))}
                  row
                >
                  <FormControlLabel 
                    value="none" 
                    control={<Radio />} 
                    label="Bez plus one"
                    disabled={loading}
                  />
                  <FormControlLabel 
                    value="withoutDetails" 
                    control={<Radio />} 
                    label="Bez szczegółów"
                    disabled={loading}
                  />
                  <FormControlLabel 
                    value="withDetails" 
                    control={<Radio />} 
                    label="Ze szczegółami"
                    disabled={loading}
                  />
                </RadioGroup>
              </FormControl>

              {/* Event notes */}
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notatki dotyczące wydarzenia"
                value={globalSettings.eventSpecificNotes}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  eventSpecificNotes: e.target.value
                }))}
                disabled={loading}
                placeholder="Dodatkowe informacje dla wszystkich wybranych gości..."
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Anuluj
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || selectedContacts.length === 0}
        >
          {loading 
            ? 'Dodawanie...' 
            : `Dodaj ${selectedContacts.length} kontakt${selectedContacts.length === 1 ? '' : selectedContacts.length < 5 ? 'y' : 'ów'}`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddContactsToEvent;
