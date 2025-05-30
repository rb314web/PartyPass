import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';
import CryptoJS from 'crypto-js';
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
}

const GuestList: React.FC<GuestListProps> = ({ onStatsChange }) => {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [isAddingGuest, setIsAddingGuest] = useState(false);
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const [error, setError] = useState<string | null>(null);
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

    useEffect(() => {
        const initializeFirestore = async () => {
            try {
                // Sprawdź czy db jest zainicjalizowany
                if (!db) {
                    throw new Error('Firestore nie jest zainicjalizowany');
                }

                // Sprawdź czy użytkownik jest zalogowany
                if (!auth.currentUser) {
                    throw new Error('Użytkownik nie jest zalogowany');
                }

                // Test połączenia z Firestore
                const testQuery = query(collection(db, 'guests'), limit(1));
                await getDocs(testQuery);
                
                // Jeśli dotarliśmy tutaj, wszystko jest OK
                setIsInitialized(true);
                setError(null);

                // Subskrybuj się na zmiany w kolekcji gości
                const q = query(
                    collection(db, 'guests'),
                    where('userId', '==', auth.currentUser.uid)
                );

                const unsubscribe = onSnapshot(q, 
                    (snapshot) => {
                        const guestList: Guest[] = [];
                        snapshot.forEach((doc) => {
                            guestList.push({ id: doc.id, ...doc.data() } as Guest);
                        });
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
                        setError(`Nie udało się pobrać listy gości: ${error.message}`);
                    }
                );

                return () => unsubscribe();
            } catch (error) {
                console.error('Błąd podczas inicjalizacji:', error);
                setError(error instanceof Error ? error.message : 'Nieznany błąd');
                setIsInitialized(false);
            }
        };

        initializeFirestore();
    }, [onStatsChange]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser || !db) {
            setError('Brak dostępu do bazy danych');
            return;
        }

        try {
            const timestamp = Date.now();
            const guestData = {
                ...formData,
                userId: auth.currentUser.uid,
                createdAt: timestamp,
                updatedAt: timestamp
            };

            if (editingGuest) {
                // Aktualizacja istniejącego gościa
                await updateDoc(doc(db, 'guests', editingGuest.id), {
                    ...guestData,
                    createdAt: editingGuest.createdAt // Zachowujemy oryginalną datę utworzenia
                });
            } else {
                // Dodawanie nowego gościa
                const docRef = await addDoc(collection(db, 'guests'), guestData);
                // Aktualizujemy dokument, aby dodać ID
                await updateDoc(docRef, {
                    id: docRef.id
                });
            }

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
            setError(null);
        } catch (error) {
            console.error('Błąd podczas zapisywania gościa:', error);
            setError('Nie udało się zapisać gościa');
        }
    };

    const handleDelete = async (guestId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tego gościa?')) return;
        if (!db) {
            setError('Brak dostępu do bazy danych');
            return;
        }

        try {
            await deleteDoc(doc(db, 'guests', guestId));
            setError(null);
        } catch (error) {
            console.error('Błąd podczas usuwania gościa:', error);
            setError('Nie udało się usunąć gościa');
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
        const baseUrl = window.location.origin;
        const data = {
            email: guest.email,
            id: guest.id
        };
        
        console.log('Dane gościa:', data);
        
        // Tworzymy prosty URL z danymi
        const confirmationUrl = `${baseUrl}/confirm/${guest.id}/${guest.email}`;
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
                <div className="guest-list__actions">
                    <button 
                        className="guest-list__export-button"
                        onClick={exportToExcel}
                        title="Eksportuj do Excel"
                    >
                        <i className="fas fa-file-excel"></i>
                        Eksportuj do Excel
                    </button>
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
                </div>
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
                        onClick={() => console.log('Wyślij email do wszystkich gości')}
                    >
                        <i className="fas fa-envelope"></i>
                        Wyślij email do wszystkich
                    </button>
                    <button 
                        className="guest-list__bulk-button"
                        onClick={() => console.log('Wyślij SMS do wszystkich gości')}
                    >
                        <i className="fas fa-sms"></i>
                        Wyślij SMS do wszystkich
                    </button>
                    <button 
                        className="guest-list__bulk-button"
                        onClick={() => console.log('Wyślij email do niepotwierdzonych')}
                    >
                        <i className="fas fa-envelope"></i>
                        Wyślij email do niepotwierdzonych
                    </button>
                    <button 
                        className="guest-list__bulk-button"
                        onClick={() => console.log('Wyślij SMS do niepotwierdzonych')}
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
                        {guests.map((guest) => (
                            <tr key={guest.id}>
                                <td>{guest.name}</td>
                                <td>{guest.email}</td>
                                <td>{guest.phone}</td>
                                <td>
                                    <span className={`guest-list__status guest-list__status--${guest.status}`}>
                                        {guest.status === 'pending' && 'Oczekujący'}
                                        {guest.status === 'confirmed' && 'Potwierdzony'}
                                        {guest.status === 'declined' && 'Odrzucony'}
                                    </span>
                                </td>
                                <td>
                                    {guest.notes ? (
                                        <div className="guest-list__notes">
                                            <p>{guest.notes}</p>
                                        </div>
                                    ) : (
                                        <span className="guest-list__no-notes">Brak uwag</span>
                                    )}
                                </td>
                                <td>
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
                                            onClick={() => console.log('Wyślij email do:', guest.email)}
                                            className="guest-list__email-button"
                                            title="Wyślij przypomnienie email"
                                        >
                                            <i className="fas fa-envelope"></i>
                                        </button>
                                        <button
                                            onClick={() => console.log('Wyślij SMS do:', guest.phone)}
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
        </div>
    );
};

export default GuestList;