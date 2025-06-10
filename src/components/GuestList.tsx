import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, getDocs, limit, getFirestore, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';
import CryptoJS from 'crypto-js';
import { useToast } from '../contexts/ToastContext';
import '../assets/style/GuestList.scss';

interface Guest {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'confirmed' | 'pending' | 'declined';
    notes?: string;
    createdAt: number;
    updatedAt: number;
}

interface GuestStats {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
}

interface GuestListProps {
    onStatsChange: (stats: GuestStats) => void;
    maxGuests: number;
    currentGuests: number;
}

const GuestList: React.FC<GuestListProps> = ({ onStatsChange, maxGuests, currentGuests }) => {
    const { showToast } = useToast();
    const [guests, setGuests] = useState<Guest[]>([]);
    const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddingGuest, setIsAddingGuest] = useState(false);
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [selectedGuestForQR, setSelectedGuestForQR] = useState<Guest | null>(null);
    const [formData, setFormData] = useState<Omit<Guest, 'id'>>({
        name: '',
        email: '',
        phone: '',
        status: 'pending',
        notes: '',
        createdAt: 0,
        updatedAt: 0
    });
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
    const qrRef = useRef<HTMLDivElement>(null);
    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedGuestForEmail, setSelectedGuestForEmail] = useState<Guest | null>(null);
    const [emailContent, setEmailContent] = useState({
        subject: '',
        message: '',
        template: 'default'
    });
    const [showSMSModal, setShowSMSModal] = useState(false);
    const [selectedGuestForSMS, setSelectedGuestForSMS] = useState<Guest | null>(null);
    const [smsContent, setSmsContent] = useState({
        message: '',
        template: 'default'
    });
    const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
    const [showBulkSMSModal, setShowBulkSMSModal] = useState(false);
    const [bulkEmailContent, setBulkEmailContent] = useState({
        subject: '',
        message: '',
        template: 'default',
        recipients: 'all' as 'all' | 'unconfirmed'
    });
    const [bulkSMSContent, setBulkSMSContent] = useState({
        message: '',
        template: 'default',
        recipients: 'all' as 'all' | 'unconfirmed'
    });

    // Funkcja do ustawiania błędu z automatycznym czyszczeniem
    const setErrorWithTimeout = (errorMessage: string) => {
        // Wyczyść poprzedni timeout jeśli istnieje
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
        }
        
        setError(errorMessage);
        
        // Ustaw nowy timeout
        errorTimeoutRef.current = setTimeout(() => {
            setError(null);
        }, 2000);
    };

    // Funkcja do ustawiania komunikatu o sukcesie z automatycznym czyszczeniem
    const setSuccessWithTimeout = (successMessage: string) => {
        // Wyczyść poprzedni timeout jeśli istnieje
        if (successTimeoutRef.current) {
            clearTimeout(successTimeoutRef.current);
        }
        
        setSuccess(successMessage);
        
        // Ustaw nowy timeout
        successTimeoutRef.current = setTimeout(() => {
            setSuccess(null);
        }, 2000);
    };

    // Czyszczenie timeoutów przy odmontowaniu komponentu
    useEffect(() => {
        return () => {
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const initializeFirestore = async () => {
            try {
                // Sprawdź czy użytkownik jest zalogowany
                if (!auth.currentUser) {
                    throw new Error('Użytkownik nie jest zalogowany');
                }

                // Subskrybuj się na zmiany w kolekcji gości
                const q = query(
                    collection(db, 'guests'),
                    where('userId', '==', auth.currentUser.uid)
                );

                const unsubscribe = onSnapshot(q, 
                    (snapshot) => {
                        const guestList: Guest[] = [];
                        snapshot.forEach((doc) => {
                            const data = doc.data();
                            guestList.push({ 
                                id: doc.id, 
                                ...data,
                                createdAt: data.createdAt || Date.now(),
                                updatedAt: data.updatedAt || Date.now()
                            } as Guest);
                        });
                        console.log('Pobrane goście:', guestList);
                        setGuests(guestList);

                        // Oblicz statystyki
                        const stats: GuestStats = {
                            total: guestList.length,
                            confirmed: guestList.filter(g => g.status === 'confirmed').length,
                            pending: guestList.filter(g => g.status === 'pending').length,
                            declined: guestList.filter(g => g.status === 'declined').length
                        };
                        onStatsChange(stats);
                    }, 
                    (error) => {
                        console.error('Błąd podczas pobierania gości:', error);
                        setErrorWithTimeout(`Nie udało się pobrać listy gości: ${error.message}`);
                    }
                );

                setIsInitialized(true);
                setError(null);

                return () => unsubscribe();
            } catch (error) {
                console.error('Błąd podczas inicjalizacji:', error);
                setErrorWithTimeout(error instanceof Error ? error.message : 'Nieznany błąd');
                setIsInitialized(false);
            }
        };

        initializeFirestore();
    }, [onStatsChange]);

    useEffect(() => {
        // Filtrowanie gości przy każdej zmianie searchQuery lub guests
        const filtered = guests.filter(guest => {
            const searchLower = searchQuery.toLowerCase();
            return (
                guest.name.toLowerCase().includes(searchLower) ||
                guest.email.toLowerCase().includes(searchLower) ||
                guest.phone.toLowerCase().includes(searchLower)
            );
        });
        setFilteredGuests(filtered);
    }, [searchQuery, guests]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) {
            setErrorWithTimeout('Użytkownik nie jest zalogowany');
            return;
        }

        // Sprawdź czy nie przekroczono limitu gości
        if (typeof maxGuests === 'number' && currentGuests >= maxGuests) {
            setErrorWithTimeout(`Osiągnięto maksymalną liczbę gości (${maxGuests})`);
            return;
        }

        try {
            const timestamp = Date.now();
            const guestData = {
                ...formData,
                userId: auth.currentUser.uid,
                createdAt: timestamp,
                updatedAt: timestamp,
                status: 'pending'
            };

            const db = getFirestore();
            const eventRef = doc(db, 'events', auth.currentUser.uid);
            const eventDoc = await getDoc(eventRef);

            if (!eventDoc.exists()) {
                setErrorWithTimeout('Nie znaleziono wydarzenia');
                return;
            }

            const eventData = eventDoc.data();
            const guests = eventData.guests || [];
            
            // Sprawdź czy gość już istnieje
            const existingGuest = guests.find((g: any) => g.email === guestData.email);
            if (existingGuest) {
                setErrorWithTimeout('Gość o podanym adresie email już istnieje');
                return;
            }

            await updateDoc(eventRef, {
                guests: [...guests, guestData]
            });

            // Reset formularza
            setFormData({
                name: '',
                email: '',
                phone: '',
                status: 'pending',
                notes: '',
                createdAt: 0,
                updatedAt: 0
            });
            setIsAddingGuest(false);
            setEditingGuest(null);
            setSuccessWithTimeout('Gość został dodany pomyślnie');
        } catch (error) {
            console.error('Błąd podczas dodawania gościa:', error);
            setErrorWithTimeout('Nie udało się dodać gościa. Spróbuj ponownie później.');
        }
    };

    const handleDelete = async (guestId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tego gościa?')) return;
        if (!db) {
            setErrorWithTimeout('Brak dostępu do bazy danych');
            return;
        }

        try {
            await deleteDoc(doc(db, 'guests', guestId));
            setSuccessWithTimeout('Gość został usunięty pomyślnie');
        } catch (error) {
            console.error('Błąd podczas usuwania gościa:', error);
            setErrorWithTimeout('Nie udało się usunąć gościa');
        }
    };

    const handleEdit = (guest: Guest) => {
        setEditingGuest(guest);
        setFormData({
            name: guest.name,
            email: guest.email,
            phone: guest.phone,
            status: guest.status,
            notes: guest.notes || '',
            createdAt: guest.createdAt,
            updatedAt: guest.updatedAt
        });
        setIsAddingGuest(true);
    };

    const generateQRCode = (guest: Guest) => {
        // Używamy aktualnego adresu URL zamiast sztywnego IP
        const baseUrl = window.location.origin;
        const data = {
            email: guest.email,
            id: guest.id
        };
        
        console.log('Dane gościa:', data);
        
        // Tworzymy URL z danymi
        const confirmationUrl = `${baseUrl}/confirm/${guest.id}/${encodeURIComponent(guest.email)}`;
        console.log('Wygenerowany URL:', confirmationUrl);
        
        return confirmationUrl;
    };

    const handleShowQR = (guest: Guest) => {
        console.log('Showing QR for guest:', guest);
        setSelectedGuest(guest);
        setShowQRModal(true);
    };

    const exportToExcel = () => {
        // Przygotuj dane do eksportu
        const exportData = guests.map(guest => ({
            'Imię i Nazwisko': guest.name,
            'Email': guest.email,
            'Telefon': guest.phone,
            'Status': guest.status === 'pending' ? 'Oczekujący' : 
                     guest.status === 'confirmed' ? 'Potwierdzony' : 
                     'Odrzucony',
            'Notatki': guest.notes || '',
            'Data dodania': new Date(guest.createdAt).toLocaleDateString('pl-PL'),
            'Ostatnia aktualizacja': new Date(guest.updatedAt).toLocaleDateString('pl-PL')
        }));

        // Utwórz nowy arkusz
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // Dostosuj szerokość kolumn
        const wscols = [
            {wch: 20}, // Imię i Nazwisko
            {wch: 25}, // Email
            {wch: 15}, // Telefon
            {wch: 12}, // Status
            {wch: 30}, // Notatki
            {wch: 15}, // Data dodania
            {wch: 15}  // Ostatnia aktualizacja
        ];
        ws['!cols'] = wscols;
        
        // Utwórz nową książkę
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Lista Gości');

        // Zapisz plik
        XLSX.writeFile(wb, 'lista_gosci.xlsx');
    };

    const downloadQRCode = () => {
        if (!qrRef.current || !selectedGuest) return;

        const canvas = document.createElement('canvas');
        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(img, 0, 0);
            
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `qr-code-${selectedGuest.name}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    const sendQRCodeEmail = async () => {
        if (!selectedGuest) return;

        try {
            const confirmationUrl = generateQRCode(selectedGuest);
            const emailData = {
                to: selectedGuest.email,
                subject: 'Twój kod QR do potwierdzenia obecności',
                text: `Witaj ${selectedGuest.name},\n\nOto Twój kod QR do potwierdzenia obecności na wydarzeniu. Możesz go zeskanować lub kliknąć w link poniżej:\n\n${confirmationUrl}\n\nPozdrawiamy,\nZespół PartyPass`,
                html: `
                    <h2>Witaj ${selectedGuest.name},</h2>
                    <p>Oto Twój kod QR do potwierdzenia obecności na wydarzeniu.</p>
                    <p>Możesz go zeskanować lub kliknąć w link poniżej:</p>
                    <p><a href="${confirmationUrl}">${confirmationUrl}</a></p>
                    <p>Pozdrawiamy,<br>Zespół PartyPass</p>
                `
            };

            // TODO: Implement email sending functionality
            console.log('Sending email with QR code to:', selectedGuest.email);
            alert('Funkcja wysyłania emaila będzie dostępna wkrótce!');
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Wystąpił błąd podczas wysyłania emaila.');
        }
    };

    const handleSendEmail = (guest: Guest) => {
        setSelectedGuestForEmail(guest);
        setEmailContent({
            subject: `Zaproszenie na wydarzenie`,
            message: `Drogi ${guest.name},\n\nSerdecznie zapraszamy Cię na wydarzenie.\n\nProsimy o potwierdzenie przybycia.\n\nPozdrawiamy,\nOrganizatorzy`,
            template: 'default'
        });
        setShowEmailModal(true);
    };

    const handleEmailSubmit = async () => {
        if (!selectedGuestForEmail) return;

        try {
            // TODO: Implement email sending functionality
            await new Promise(resolve => setTimeout(resolve, 1000)); // Symulacja wysyłania
            showToast(`Wiadomość została wysłana do ${selectedGuestForEmail.name}`, 'success');
            setShowEmailModal(false);
        } catch (error) {
            console.error('Error sending email:', error);
            showToast('Wystąpił błąd podczas wysyłania wiadomości', 'error');
        }
    };

    const handleSendSMS = (guest: Guest) => {
        setSelectedGuestForSMS(guest);
        setSmsContent({
            message: `Drogi ${guest.name}, serdecznie zapraszamy Cię na wydarzenie. Prosimy o potwierdzenie przybycia. Pozdrawiamy, Organizatorzy`,
            template: 'default'
        });
        setShowSMSModal(true);
    };

    const handleSMSSubmit = async () => {
        if (!selectedGuestForSMS) return;

        try {
            // TODO: Implement SMS sending functionality
            await new Promise(resolve => setTimeout(resolve, 1000)); // Symulacja wysyłania
            showToast(`SMS został wysłany do ${selectedGuestForSMS.name}`, 'success');
            setShowSMSModal(false);
        } catch (error) {
            console.error('Error sending SMS:', error);
            showToast('Wystąpił błąd podczas wysyłania SMS-a', 'error');
        }
    };

    const handleBulkEmail = (recipients: 'all' | 'unconfirmed') => {
        setBulkEmailContent({
            subject: 'Zaproszenie na wydarzenie',
            message: 'Drogi Gościu,\n\nSerdecznie zapraszamy Cię na wydarzenie.\n\nProsimy o potwierdzenie przybycia.\n\nPozdrawiamy,\nOrganizatorzy',
            template: 'default',
            recipients
        });
        setShowBulkEmailModal(true);
    };

    const handleBulkSMS = (recipients: 'all' | 'unconfirmed') => {
        setBulkSMSContent({
            message: 'Drogi Gościu, serdecznie zapraszamy Cię na wydarzenie. Prosimy o potwierdzenie przybycia. Pozdrawiamy, Organizatorzy',
            template: 'default',
            recipients
        });
        setShowBulkSMSModal(true);
    };

    const handleBulkEmailSubmit = async () => {
        try {
            const targetGuests = bulkEmailContent.recipients === 'all' 
                ? guests 
                : guests.filter(g => g.status === 'pending');

            // TODO: Implement bulk email sending functionality
            await new Promise(resolve => setTimeout(resolve, 1000)); // Symulacja wysyłania
            showToast(`Wiadomości zostały wysłane do ${targetGuests.length} gości`, 'success');
            setShowBulkEmailModal(false);
        } catch (error) {
            console.error('Error sending bulk emails:', error);
            showToast('Wystąpił błąd podczas wysyłania wiadomości', 'error');
        }
    };

    const handleBulkSMSSubmit = async () => {
        try {
            const targetGuests = bulkSMSContent.recipients === 'all' 
                ? guests 
                : guests.filter(g => g.status === 'pending');

            // TODO: Implement bulk SMS sending functionality
            await new Promise(resolve => setTimeout(resolve, 1000)); // Symulacja wysyłania
            showToast(`SMS-y zostały wysłane do ${targetGuests.length} gości`, 'success');
            setShowBulkSMSModal(false);
        } catch (error) {
            console.error('Error sending bulk SMS:', error);
            showToast('Wystąpił błąd podczas wysyłania SMS-ów', 'error');
        }
    };

    if (!isInitialized) {
        return (
            <div className="guest-list">
                <div className="guest-list__error">
                    <p>{error || 'Inicjalizacja...'}</p>
                    <button onClick={() => window.location.reload()}>Odśwież stronę</button>
                </div>
            </div>
        );
    }

    return (
        <div className="guest-list">
            <div className="guest-list__header">
                <h2>Lista Gości</h2>
                <div className="guest-list__limit-info">
                    {typeof maxGuests === 'number' ? (
                        `Liczba gości: ${currentGuests} / ${maxGuests}`
                    ) : (
                        `Liczba gości: ${currentGuests} / ${maxGuests}`
                    )}
                </div>
                <div className="guest-list__actions">
                    <button 
                        className="guest-list__export-button"
                        onClick={exportToExcel}
                        title="Eksportuj do Excel"
                    >
                        <i className="fas fa-file-excel"></i>
                        Eksportuj do Excel
                    </button>
                    {typeof maxGuests === 'number' && currentGuests >= maxGuests ? (
                        <div className="guest-list__limit-reached">
                            <i className="fas fa-exclamation-circle"></i>
                            Osiągnięto limit gości
                        </div>
                    ) : (
                        <button 
                            className="guest-list__add-button"
                            onClick={() => {
                                setIsAddingGuest(true);
                                setEditingGuest(null);
                                setFormData({
                                    name: '',
                                    email: '',
                                    phone: '',
                                    status: 'pending',
                                    notes: '',
                                    createdAt: 0,
                                    updatedAt: 0
                                });
                            }}
                        >
                            <i className="fas fa-plus"></i>
                            Dodaj Gościa
                        </button>
                    )}
                </div>
            </div>

            <div className="guest-list__search">
                <div className="guest-list__search-input">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Szukaj gościa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="guest-list__search-clear"
                            onClick={() => setSearchQuery('')}
                            title="Wyczyść wyszukiwanie"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <div className="guest-list__search-info">
                        Znaleziono {filteredGuests.length} {filteredGuests.length === 1 ? 'gościa' : 'gości'}
                    </div>
                )}
            </div>

            {isAddingGuest && (
                <form onSubmit={handleSubmit} className="guest-list__form">
                    <h3>{editingGuest ? 'Edytuj Gościa' : 'Dodaj Nowego Gościa'}</h3>
                    
                    <div className="guest-list__form-group">
                        <label htmlFor="name">Imię i Nazwisko</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="guest-list__form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="guest-list__form-group">
                        <label htmlFor="phone">Telefon</label>
                        <input
                            type="tel"
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>

                    <div className="guest-list__form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as Guest['status'] })}
                        >
                            <option value="pending">Oczekujący</option>
                            <option value="confirmed">Potwierdzony</option>
                            <option value="declined">Odrzucony</option>
                        </select>
                    </div>

                    <div className="guest-list__form-group">
                        <label htmlFor="notes">Notatki</label>
                        <textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="guest-list__form-actions">
                        <button type="submit" className="guest-list__submit-button">
                            {editingGuest ? 'Zapisz Zmiany' : 'Dodaj Gościa'}
                        </button>
                        <button 
                            type="button" 
                            className="guest-list__cancel-button"
                            onClick={() => {
                                setIsAddingGuest(false);
                                setEditingGuest(null);
                            }}
                        >
                            Anuluj
                        </button>
                    </div>
                </form>
            )}

            <div className="guest-list__table-container">
                <div className="guest-list__bulk-actions">
                    <button 
                        className="guest-list__bulk-button"
                        onClick={() => handleBulkEmail('all')}
                    >
                        <i className="fas fa-envelope"></i>
                        Wyślij email do wszystkich
                    </button>
                    <button 
                        className="guest-list__bulk-button"
                        onClick={() => handleBulkSMS('all')}
                    >
                        <i className="fas fa-sms"></i>
                        Wyślij SMS do wszystkich
                    </button>
                    <button 
                        className="guest-list__bulk-button"
                        onClick={() => handleBulkEmail('unconfirmed')}
                    >
                        <i className="fas fa-envelope"></i>
                        Wyślij email do niepotwierdzonych
                    </button>
                    <button 
                        className="guest-list__bulk-button"
                        onClick={() => handleBulkSMS('unconfirmed')}
                    >
                        <i className="fas fa-sms"></i>
                        Wyślij SMS do niepotwierdzonych
                    </button>
                </div>
                <table className="guest-list__table">
                    <thead>
                        <tr>
                            <th>Imię i Nazwisko</th>
                            <th>Email</th>
                            <th>Telefon</th>
                            <th>Status</th>
                            <th>Uwagi od gościa</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGuests.map((guest) => (
                            <tr key={guest.id}>
                                <td data-label="Imię i Nazwisko">{guest.name}</td>
                                <td data-label="Email">{guest.email}</td>
                                <td data-label="Telefon">{guest.phone}</td>
                                <td data-label="Status">
                                    <span className={`guest-list__status guest-list__status--${guest.status}`}>
                                        {guest.status === 'pending' && 'Oczekujący'}
                                        {guest.status === 'confirmed' && 'Potwierdzony'}
                                        {guest.status === 'declined' && 'Odrzucony'}
                                    </span>
                                </td>
                                <td data-label="Uwagi od gościa">
                                    {guest.notes ? (
                                        <div className="guest-list__notes">
                                            <p>{guest.notes}</p>
                                        </div>
                                    ) : (
                                        <span className="guest-list__no-notes">Brak uwag</span>
                                    )}
                                </td>
                                <td data-label="Akcje">
                                    <div className="guest-list__actions">
                                        <button
                                            onClick={() => handleEdit(guest)}
                                            className="guest-list__edit-button"
                                            title="Edytuj"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => handleShowQR(guest)}
                                            className="guest-list__qr-button"
                                            title="Generuj kod QR"
                                        >
                                            <i className="fas fa-qrcode"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(guest.id)}
                                            className="guest-list__delete-button"
                                            title="Usuń"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                        <button
                                            onClick={() => handleSendEmail(guest)}
                                            className="guest-list__email-button"
                                            title="Wyślij przypomnienie email"
                                        >
                                            <i className="fas fa-envelope"></i>
                                        </button>
                                        <button
                                            onClick={() => handleSendSMS(guest)}
                                            className="guest-list__sms-button"
                                            title="Wyślij przypomnienie SMS"
                                        >
                                            <i className="fas fa-sms"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showQRModal && selectedGuest && (
                <div className="guest-list__modal">
                    <div className="guest-list__modal-content">
                        <h2>Kod QR dla {selectedGuest.name}</h2>
                        <div className="guest-list__qr-code" ref={qrRef}>
                            <QRCodeSVG
                                value={generateQRCode(selectedGuest)}
                                size={200}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <p className="guest-list__qr-info">
                            Zeskanuj ten kod QR, aby potwierdzić swoją obecność.
                        </p>
                        <div className="guest-list__qr-actions">
                            <button
                                onClick={downloadQRCode}
                                className="guest-list__download-button"
                            >
                                <i className="fas fa-download"></i>
                                Pobierz kod QR
                            </button>
                            <button
                                onClick={sendQRCodeEmail}
                                className="guest-list__email-button"
                            >
                                <i className="fas fa-envelope"></i>
                                Wyślij kod QR mailem
                            </button>
                        </div>
                        <a 
                            href={generateQRCode(selectedGuest)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="guest-list__qr-link"
                        >
                            Otwórz link potwierdzający
                        </a>
                        <button
                            className="guest-list__close-button"
                            onClick={() => setShowQRModal(false)}
                        >
                            Zamknij
                        </button>
                    </div>
                </div>
            )}

            {showEmailModal && selectedGuestForEmail && (
                <div className="guest-list__modal">
                    <div className="guest-list__modal-content">
                        <h2>Wyślij wiadomość do {selectedGuestForEmail.name}</h2>
                        <div className="guest-list__email-form">
                            <div className="guest-list__form-group">
                                <label htmlFor="emailSubject">Temat</label>
                                <input
                                    type="text"
                                    id="emailSubject"
                                    value={emailContent.subject}
                                    onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                                    placeholder="Temat wiadomości"
                                />
                            </div>
                            <div className="guest-list__form-group">
                                <label htmlFor="emailMessage">Treść wiadomości</label>
                                <textarea
                                    id="emailMessage"
                                    value={emailContent.message}
                                    onChange={(e) => setEmailContent({ ...emailContent, message: e.target.value })}
                                    placeholder="Treść wiadomości"
                                    rows={10}
                                />
                            </div>
                            <div className="guest-list__form-actions">
                                <button
                                    className="guest-list__submit-button"
                                    onClick={handleEmailSubmit}
                                >
                                    <i className="fas fa-paper-plane"></i>
                                    Wyślij wiadomość
                                </button>
                                <button
                                    className="guest-list__cancel-button"
                                    onClick={() => setShowEmailModal(false)}
                                >
                                    Anuluj
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSMSModal && selectedGuestForSMS && (
                <div className="guest-list__modal">
                    <div className="guest-list__modal-content">
                        <h2>Wyślij SMS do {selectedGuestForSMS.name}</h2>
                        <div className="guest-list__sms-form">
                            <div className="guest-list__form-group">
                                <label htmlFor="smsMessage">Treść wiadomości</label>
                                <textarea
                                    id="smsMessage"
                                    value={smsContent.message}
                                    onChange={(e) => setSmsContent({ ...smsContent, message: e.target.value })}
                                    placeholder="Treść wiadomości SMS"
                                    rows={5}
                                    maxLength={160}
                                />
                                <div className="guest-list__sms-counter">
                                    {smsContent.message.length}/160 znaków
                                </div>
                            </div>
                            <div className="guest-list__form-actions">
                                <button
                                    className="guest-list__submit-button"
                                    onClick={handleSMSSubmit}
                                >
                                    <i className="fas fa-paper-plane"></i>
                                    Wyślij SMS
                                </button>
                                <button
                                    className="guest-list__cancel-button"
                                    onClick={() => setShowSMSModal(false)}
                                >
                                    Anuluj
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showBulkEmailModal && (
                <div className="guest-list__modal">
                    <div className="guest-list__modal-content">
                        <h2>Wyślij email do {bulkEmailContent.recipients === 'all' ? 'wszystkich' : 'niepotwierdzonych'} gości</h2>
                        <div className="guest-list__email-form">
                            <div className="guest-list__form-group">
                                <label htmlFor="bulkEmailSubject">Temat</label>
                                <input
                                    type="text"
                                    id="bulkEmailSubject"
                                    value={bulkEmailContent.subject}
                                    onChange={(e) => setBulkEmailContent({ ...bulkEmailContent, subject: e.target.value })}
                                    placeholder="Temat wiadomości"
                                />
                            </div>
                            <div className="guest-list__form-group">
                                <label htmlFor="bulkEmailMessage">Treść wiadomości</label>
                                <textarea
                                    id="bulkEmailMessage"
                                    value={bulkEmailContent.message}
                                    onChange={(e) => setBulkEmailContent({ ...bulkEmailContent, message: e.target.value })}
                                    placeholder="Treść wiadomości"
                                    rows={10}
                                />
                            </div>
                            <div className="guest-list__form-actions">
                                <button
                                    className="guest-list__submit-button"
                                    onClick={handleBulkEmailSubmit}
                                >
                                    <i className="fas fa-paper-plane"></i>
                                    Wyślij wiadomości
                                </button>
                                <button
                                    className="guest-list__cancel-button"
                                    onClick={() => setShowBulkEmailModal(false)}
                                >
                                    Anuluj
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showBulkSMSModal && (
                <div className="guest-list__modal">
                    <div className="guest-list__modal-content">
                        <h2>Wyślij SMS do {bulkSMSContent.recipients === 'all' ? 'wszystkich' : 'niepotwierdzonych'} gości</h2>
                        <div className="guest-list__sms-form">
                            <div className="guest-list__form-group">
                                <label htmlFor="bulkSMSMessage">Treść wiadomości</label>
                                <textarea
                                    id="bulkSMSMessage"
                                    value={bulkSMSContent.message}
                                    onChange={(e) => setBulkSMSContent({ ...bulkSMSContent, message: e.target.value })}
                                    placeholder="Treść wiadomości SMS"
                                    rows={5}
                                    maxLength={160}
                                />
                                <div className="guest-list__sms-counter">
                                    {bulkSMSContent.message.length}/160 znaków
                                </div>
                            </div>
                            <div className="guest-list__form-actions">
                                <button
                                    className="guest-list__submit-button"
                                    onClick={handleBulkSMSSubmit}
                                >
                                    <i className="fas fa-paper-plane"></i>
                                    Wyślij SMS-y
                                </button>
                                <button
                                    className="guest-list__cancel-button"
                                    onClick={() => setShowBulkSMSModal(false)}
                                >
                                    Anuluj
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="guest-list__error">
                    <p>{error}</p>
                </div>
            )}
            {success && (
                <div className="guest-list__success">
                    <p>{success}</p>
                </div>
            )}
        </div>
    );
};

export default GuestList;