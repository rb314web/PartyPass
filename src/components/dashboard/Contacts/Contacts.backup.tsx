import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Mail,
  Phone,
  AlertCircle,
  Edit3,
  Utensils
} from 'lucide-react';
import { Box, Typography, Skeleton } from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import { Contact } from '../../../types';
import { ContactService, ContactFilters } from '../../../services/firebase/contactService';
import AddContact from './AddContact';
import EditContactModal from './EditContactModal';
import DeleteContactModal from './DeleteContactModal';
import './Contacts.scss';

const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Contacts state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [deleteContactOpen, setDeleteContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadContacts = useCallback(async (isLoadingMore = false, currentLastDoc?: any) => {
    try {
      if (!isLoadingMore) {
        setIsLoading(true);
      }
      const filters: ContactFilters = {};
      if (searchQuery) {
        filters.search = searchQuery;
      }

      const result = await ContactService.getUserContacts(
        user!.id,
        filters,
        10,
        isLoadingMore ? currentLastDoc : undefined
      );

      setContacts(prev => isLoadingMore ? [...prev, ...result.contacts] : result.contacts);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, searchQuery]); // Usunięte lastDoc - używane z aktualną wartością

  // Handle contact actions
  const handleAddContact = () => {
    setAddContactOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setEditContactOpen(true);
  };

  const handleOpenDeleteModal = (contact: Contact) => {
    setSelectedContact(contact);
    setDeleteContactOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedContact) return;
    
    setIsDeleting(true);
    try {
      await handleDeleteContact(selectedContact);
      setDeleteContactOpen(false);
      setSelectedContact(null);
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeleteContactOpen(false);
      setSelectedContact(null);
    }
  };

  const handleContactAdded = (newContact: Contact) => {
    setContacts(prev => [newContact, ...prev]);
  };

  const handleContactUpdated = (updatedContact: Contact) => {
    setContacts(prev => prev.map(contact => 
      contact.id === updatedContact.id ? updatedContact : contact
    ));
  };

  const handleDeleteContact = async (contact: Contact) => {
    try {
      await ContactService.deleteContact(contact.id);
      setContacts(prev => prev.filter(c => c.id !== contact.id));
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      setError('Błąd podczas usuwania kontaktu');
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadContacts();
    }
  }, [user?.id, searchQuery]);

  const handleContactAction = async (action: string, contactId: string) => {
    try {
      switch (action) {
        case 'edit':
          const contactToEdit = contacts.find(c => c.id === contactId);
          if (contactToEdit) {
            handleEditContact(contactToEdit);
          }
          break;
        case 'delete':
          const contactToDelete = contacts.find(c => c.id === contactId);
          if (contactToDelete) {
            handleOpenDeleteModal(contactToDelete);
          }
          break;
        case 'email':
          window.open(`mailto:${contacts.find(c => c.id === contactId)?.email}`);
          break;
        case 'phone':
          const contact = contacts.find(c => c.id === contactId);
          if (contact?.phone) {
            window.open(`tel:${contact.phone}`);
          }
          break;
        case 'addToEvent':
          // Usunięte - funkcjonalność przeniesiona do EventDetails
          break;
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filtering and sorting
  const filteredAndSortedContacts = useMemo(() => {
    let filtered = contacts.filter(contact => {
      const matchesSearch = contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           contact.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      const aValue = `${a.firstName} ${a.lastName}`;
      const bValue = `${b.firstName} ${b.lastName}`;

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [contacts, searchQuery, sortDirection]);

  // Tab content component
  const ContactsTab = () => {
    console.log('🔥 RENDERING CONDITIONS', { 
      error, 
      filteredLength: filteredAndSortedContacts.length,
      contacts: filteredAndSortedContacts
    });
    return (
    <div className="contacts__content">
      {false ? (
        <div className="contacts__table">
          <table>
            <thead>
              <tr>
                <th>Kontakt</th>
                <th>Telefon</th>
                <th>Preferencje</th>
                <th>Kontakt</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td>
                    <div className="contacts__contact-info">
                      <Skeleton 
                        variant="circular" 
                        width={40} 
                        height={40}
                        animation="wave"
                        sx={{ backgroundColor: '#f0f0f0' }}
                      />
                      <div>
                        <Skeleton 
                          variant="text" 
                          width={120} 
                          height={20}
                          animation="wave"
                          sx={{ marginBottom: '4px', backgroundColor: '#f0f0f0' }}
                        />
                        <Skeleton 
                          variant="text" 
                          width={160} 
                          height={16}
                          animation="wave"
                          sx={{ backgroundColor: '#f0f0f0' }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <Skeleton 
                      variant="text" 
                      width={100} 
                      height={16}
                      animation="wave"
                      sx={{ backgroundColor: '#f0f0f0' }}
                    />
                  </td>
                  <td>
                    <Skeleton 
                      variant="text" 
                      width={80} 
                      height={16}
                      animation="wave"
                      sx={{ backgroundColor: '#f0f0f0' }}
                    />
                  </td>
                  <td>
                    <div className="contacts__contact-actions">
                      <Skeleton 
                        variant="rectangular" 
                        width={32} 
                        height={32}
                        animation="wave"
                        sx={{ borderRadius: '6px', backgroundColor: '#f0f0f0' }}
                      />
                      <Skeleton 
                        variant="rectangular" 
                        width={32} 
                        height={32}
                        animation="wave"
                        sx={{ borderRadius: '6px', backgroundColor: '#f0f0f0' }}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="contacts__actions-cell">
                      <Skeleton 
                        variant="rectangular" 
                        width={60} 
                        height={32}
                        animation="wave"
                        sx={{ borderRadius: '6px', backgroundColor: '#f0f0f0' }}
                      />
                      <Skeleton 
                        variant="rectangular" 
                        width={50} 
                        height={32}
                        animation="wave"
                        sx={{ borderRadius: '6px', backgroundColor: '#f0f0f0' }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '4rem 2rem',
            backgroundColor: '#ffffff'
          }}
        >
          <Box 
            sx={{ 
              color: '#ef4444', 
              marginBottom: 2 
            }}
          >
            <AlertCircle size={48} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#333333',
              fontWeight: 600,
              marginBottom: 1
            }}
          >
            Wystąpił błąd
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#666666',
              textAlign: 'center',
              marginBottom: 3
            }}
          >
            {error}
          </Typography>
          <button 
            onClick={() => loadContacts()} 
            className="contacts__action-btn contacts__action-btn--primary"
          >
            Spróbuj ponownie
          </button>
        </Box>
      ) : filteredAndSortedContacts.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '4rem 2rem',
            backgroundColor: '#ffffff'
          }}
        >
          <Box 
            sx={{ 
              color: '#94a3b8', 
              marginBottom: 2 
            }}
          >
            <Users size={64} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#333333',
              fontWeight: 600,
              marginBottom: 1
            }}
          >
            {searchQuery 
              ? 'Nie znaleziono kontaktów' 
              : 'Brak kontaktów'
            }
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#666666',
              textAlign: 'center',
              marginBottom: 3,
              maxWidth: '400px'
            }}
          >
            {searchQuery
              ? 'Spróbuj zmienić wyszukiwanie'
              : 'Dodaj pierwszy kontakt do swojej bazy'
            }
          </Typography>
          {!searchQuery && (
            <button 
              className="contacts__action-btn contacts__action-btn--primary"
              onClick={handleAddContact}
            >
              <Plus size={20} />
              Dodaj kontakt
            </button>
          )}
        </Box>
      ) : (
        <div className="contacts__table">
          <table>
            <thead>
              <tr>
                <th>Kontakt</th>
                <th>Telefon</th>
                <th>Preferencje</th>
                <th>Kontakt</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedContacts.map((contact) => (
                <tr key={contact.id}>
                  <td>
                    <div className="contacts__contact-info">
                      <div className="contacts__contact-avatar">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </div>
                      <div>
                        <div className="contacts__contact-name">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="contacts__contact-email">
                          {contact.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contacts__phone">
                      {contact.phone || '—'}
                    </div>
                  </td>
                  <td>
                    <div className="contacts__dietary">
                      {contact.dietaryRestrictions || '—'}
                    </div>
                  </td>
                  <td>
                    <div className="contacts__contact-actions">
                      {contact.email && (
                        <button
                          onClick={() => handleContactAction('email', contact.id)}
                          className="contacts__contact-btn"
                          title="Wyślij email"
                        >
                          <Mail size={16} />
                        </button>
                      )}
                      {contact.phone && (
                        <button
                          onClick={() => handleContactAction('phone', contact.id)}
                          className="contacts__contact-btn"
                          title="Zadzwoń"
                        >
                          <Phone size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="contacts__actions-cell">
                      <button
                        onClick={() => handleContactAction('edit', contact.id)}
                        className="contacts__action-btn contacts__action-btn--small"
                        title="Edytuj kontakt"
                      >
                        <Edit3 size={14} />
                        Edytuj
                      </button>
                      <button
                        onClick={() => handleContactAction('delete', contact.id)}
                        className="contacts__action-btn contacts__action-btn--small contacts__action-btn--danger"
                        title="Usuń kontakt"
                      >
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    );
  };

  // Main component
  const ContactsListPage = () => (
    <div className="contacts">
      <div className="contacts__header">
        <div className="contacts__title">
          <Users size={32} />
          <div>
            <h1>Kontakty</h1>
            <p>Zarządzaj bazą kontaktów</p>
          </div>
        </div>
        
        <div className="contacts__actions">
          <button 
            className="contacts__action-btn contacts__action-btn--secondary"
            onClick={() => navigate('/dashboard/contacts/import')}
          >
            <Download size={20} />
            Importuj
          </button>
          <button 
            className="contacts__action-btn contacts__action-btn--primary"
            onClick={handleAddContact}
          >
            <Plus size={20} />
            Dodaj kontakt
          </button>
        </div>
      </div>

      <div className="contacts__filters">
        <div className="contacts__search">
          <Search size={20} />
          <input
            id="contacts-search"
            name="contactsSearch"
            type="text"
            placeholder="Szukaj kontaktów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="contacts__filter-group">
          <select
            id="contacts-sort"
            name="contactsSort"
            value={`name-${sortDirection}`}
            onChange={(e) => {
              const [, direction] = e.target.value.split('-');
              setSortDirection(direction as any);
            }}
            className="contacts__filter-select"
          >
            <option value="name-asc">Imię A-Z</option>
            <option value="name-desc">Imię Z-A</option>
          </select>
        </div>
      </div>

      {/* 🔥 BEZPOŚREDNIE RENDEROWANIE - BEZ CLOSURE! */}
      <div className="contacts__content">

        {error ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '4rem 2rem',
              backgroundColor: '#ffffff'
            }}
          >
            <Box 
              sx={{ 
                color: '#ef4444', 
                marginBottom: 2 
              }}
            >
              <AlertCircle size={48} />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#333333',
                fontWeight: 600,
                marginBottom: 1
              }}
            >
              Wystąpił błąd
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#666666',
                textAlign: 'center',
                marginBottom: 3
              }}
            >
              {error}
            </Typography>
            <button 
              onClick={() => loadContacts()} 
              className="contacts__action-btn contacts__action-btn--primary"
            >
              Spróbuj ponownie
            </button>
          </Box>
        ) : filteredAndSortedContacts.length === 0 ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '4rem 2rem',
              backgroundColor: '#ffffff'
            }}
          >
            <Box 
              sx={{ 
                color: '#94a3b8', 
                marginBottom: 2 
              }}
            >
              <Users size={64} />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#333333',
                fontWeight: 600,
                marginBottom: 1
              }}
            >
              {searchQuery 
                ? 'Nie znaleziono kontaktów' 
                : 'Brak kontaktów'
              }
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#666666',
                textAlign: 'center',
                marginBottom: 3,
                maxWidth: '400px'
              }}
            >
              {searchQuery
                ? 'Spróbuj zmienić wyszukiwanie'
                : 'Dodaj pierwszy kontakt do swojej bazy'
              }
            </Typography>
            {!searchQuery && (
              <button 
                className="contacts__action-btn contacts__action-btn--primary"
                onClick={handleAddContact}
              >
                <Plus size={20} />
                Dodaj kontakt
              </button>
            )}
          </Box>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="contacts__table contacts__desktop-only">
              <table>
                <thead>
                  <tr>
                    <th>Kontakt</th>
                    <th>Telefon</th>
                    <th>Preferencje</th>
                    <th>Kontakt</th>
                    <th>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedContacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      <div className="contacts__contact-info">
                        <div className="contacts__contact-avatar">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </div>
                        <div>
                          <div className="contacts__contact-name">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="contacts__contact-email">
                            {contact.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contacts__phone">
                        {contact.phone || '—'}
                      </div>
                    </td>
                    <td>
                      <div className="contacts__dietary">
                        {contact.dietaryRestrictions || '—'}
                      </div>
                    </td>
                    <td>
                      <div className="contacts__contact-actions">
                        {contact.email && (
                          <button
                            onClick={() => handleContactAction('email', contact.id)}
                            className="contacts__contact-btn"
                            title="Wyślij email"
                          >
                            <Mail size={16} />
                          </button>
                        )}
                        {contact.phone && (
                          <button
                            onClick={() => handleContactAction('phone', contact.id)}
                            className="contacts__contact-btn"
                            title="Zadzwoń"
                          >
                            <Phone size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="contacts__actions-cell">
                        <button
                          onClick={() => handleContactAction('edit', contact.id)}
                          className="contacts__action-btn contacts__action-btn--small"
                          title="Edytuj kontakt"
                        >
                          <Edit3 size={14} />
                          Edytuj
                        </button>
                        <button
                          onClick={() => handleContactAction('delete', contact.id)}
                          className="contacts__action-btn contacts__action-btn--small contacts__action-btn--danger"
                          title="Usuń kontakt"
                        >
                          Usuń
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="contacts__mobile-cards">
              {filteredAndSortedContacts.map((contact) => (
                <div key={contact.id} className="contacts__mobile-card contact-animate">
                  <div className="contacts__mobile-card-header">
                    <div className="contacts__contact-avatar">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </div>
                    <div className="contacts__mobile-card-info">
                      <div className="contacts__mobile-card-name">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="contacts__mobile-card-email">
                        {contact.email}
                      </div>
                    </div>
                  </div>

                  <div className="contacts__mobile-card-details">
                    <div className="contacts__mobile-card-detail">
                      <Phone size={16} />
                      <div className="contacts__mobile-card-detail-label">Telefon:</div>
                      <div className="contacts__mobile-card-detail-value">
                        {contact.phone || '—'}
                      </div>
                    </div>
                    <div className="contacts__mobile-card-detail">
                      <Utensils size={16} />
                      <div className="contacts__mobile-card-detail-label">Dieta:</div>
                      <div className="contacts__mobile-card-detail-value">
                        {contact.dietaryRestrictions || '—'}
                      </div>
                    </div>
                  </div>

                  <div className="contacts__mobile-card-actions">
                    <div className="contacts__mobile-card-contact-actions">
                      {contact.email && (
                        <button
                          onClick={() => handleContactAction('email', contact.id)}
                          className="contacts__mobile-card-contact-btn"
                          title="Wyślij email"
                        >
                          <Mail size={16} />
                        </button>
                      )}
                      {contact.phone && (
                        <button
                          onClick={() => handleContactAction('phone', contact.id)}
                          className="contacts__mobile-card-contact-btn"
                          title="Zadzwoń"
                        >
                          <Phone size={16} />
                        </button>
                      )}
                    </div>
                    <div className="contacts__mobile-card-main-actions">
                      <button
                        onClick={() => handleContactAction('edit', contact.id)}
                        className="contacts__action-btn contacts__action-btn--small"
                      >
                        <Edit3 size={14} />
                        Edytuj
                      </button>
                      <button
                        onClick={() => handleContactAction('delete', contact.id)}
                        className="contacts__action-btn contacts__action-btn--small contacts__action-btn--danger"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Routes>
        <Route index element={<ContactsListPage />} />
        <Route path="import" element={<div>Import kontaktów</div>} />
      </Routes>

      {/* Modale kontaktów */}
      <AddContact
        open={addContactOpen}
        onClose={() => setAddContactOpen(false)}
        onContactAdded={handleContactAdded}
      />

      <EditContactModal
        open={editContactOpen}
        contact={selectedContact}
        onClose={() => {
          setEditContactOpen(false);
          setSelectedContact(null);
        }}
        onContactUpdated={handleContactUpdated}
      />

      <DeleteContactModal
        open={deleteContactOpen}
        contact={selectedContact}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default Contacts;
