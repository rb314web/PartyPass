import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../assets/style/UserSettings.scss';
import Navigation from './Navigation';
import Footer from './Footer';
import { FaArrowLeft } from 'react-icons/fa';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, updateProfile, updatePassword } from 'firebase/auth';
import { useToast } from '../contexts/ToastContext';

const UserSettings: React.FC = () => {
    const { currentUser, signOut } = useAuth();
    const { showToast } = useToast();
    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [displayNameError, setDisplayNameError] = useState<string | null>(null);
    const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const validateProfile = () => {
        if (!displayName.trim()) {
            setDisplayNameError('Nazwa wyświetlana nie może być pusta.');
            return false;
        }
        setDisplayNameError(null);
        return true;
    };

    const validatePassword = () => {
        if (newPassword.length > 0 && newPassword.length < 6) {
            setNewPasswordError('Nowe hasło musi mieć co najmniej 6 znaków.');
            return false;
        }
        setNewPasswordError(null);
        return true;
    };

    const validateDeletion = () => {
        if (deleteConfirmation.toLowerCase() !== 'delete' && !passwordConfirmation) {
            setDeleteError('Proszę wpisać "delete" i podać swoje hasło.');
            return false;
        }
        if (deleteConfirmation.toLowerCase() !== 'delete') {
            setDeleteError('Proszę wpisać słowo "delete", aby potwierdzić.');
            return false;
        }
        if (!passwordConfirmation) {
            setDeleteError('Proszę podać swoje hasło, aby kontynuować.');
            return false;
        }

        setDeleteError(null);
        return true;
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateProfile() || !currentUser) return;

        try {
            await updateProfile(currentUser, { displayName });
            showToast('Profil zaktualizowany pomyślnie!', 'success');
        } catch (error) {
            showToast('Wystąpił błąd podczas aktualizacji profilu.', 'error');
            console.error("Error updating profile:", error);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePassword() || !currentUser || !currentUser.email) return;

        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        try {
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);
            showToast('Hasło zmienione pomyślnie!', 'success');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            showToast('Błąd podczas zmiany hasła. Sprawdź swoje obecne hasło.', 'error');
            console.error("Error changing password:", error);
        }
    };

    const handleDeleteAccount = async () => {
        if (!validateDeletion()) {
            return;
        }
        
        if (!currentUser || !currentUser.email) {
            setDeleteError("Nie można odnaleźć użytkownika. Spróbuj zalogować się ponownie.");
            return;
        }

        const credential = EmailAuthProvider.credential(currentUser.email, passwordConfirmation);

        try {
            await reauthenticateWithCredential(currentUser, credential);
            await deleteUser(currentUser);
            showToast('Twoje konto zostało pomyślnie usunięte.', 'success');
            await signOut();
            navigate('/');
        } catch (error) {
            console.error("Błąd podczas usuwania konta:", error);
            setDeleteError("Błędne hasło lub inny błąd. Spróbuj ponownie.");
        }
    };
    
    const openDeleteModal = () => {
        setIsDeleteModalOpen(true);
        setDeleteError(null);
        setDeleteConfirmation('');
        setPasswordConfirmation('');
    };

    return (
        <>
            <Navigation />
            <div className="user-settings">
                <div className="user-settings__container">
                    <div className="user-settings__header">
                        <h1 className="user-settings__title">Ustawienia</h1>
                        <button onClick={() => navigate(-1)} className="user-settings__back-button">
                            <FaArrowLeft />
                            <span>Powrót</span>
                        </button>
                    </div>

                    <div className="user-settings__card">
                        <h2 className="user-settings__card-title">Informacje o profilu</h2>
                        <form onSubmit={handleProfileUpdate}>
                            <div className="form-group">
                                <label htmlFor="displayName">Nazwa wyświetlana</label>
                                <input
                                    id="displayName"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Wprowadź nową nazwę"
                                />
                                {displayNameError && <p className="form-error">{displayNameError}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Adres email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Wprowadź nowy email"
                                />
                            </div>
                            <button type="submit" className="user-settings__button">Zapisz zmiany</button>
                        </form>
                    </div>

                    <div className="user-settings__card">
                        <h2 className="user-settings__card-title">Zmień hasło</h2>
                        <form onSubmit={handlePasswordChange}>
                            <div className="form-group">
                                <label htmlFor="currentPassword">Obecne hasło</label>
                                <input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Wprowadź obecne hasło"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newPassword">Nowe hasło</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Wprowadź nowe hasło"
                                />
                                {newPasswordError && <p className="form-error">{newPasswordError}</p>}
                            </div>
                            <button type="submit" className="user-settings__button">Zmień hasło</button>
                        </form>
                    </div>

                    <div className="user-settings__card user-settings__card--danger">
                        <h2 className="user-settings__card-title">Strefa niebezpieczeństwa</h2>
                        <p>Usunięcie konta jest operacją nieodwracalną.</p>
                        <button onClick={openDeleteModal} className="user-settings__button user-settings__button--danger">Usuń konto</button>
                    </div>
                </div>
            </div>

            {isDeleteModalOpen && (
                <div className="user-settings__modal">
                    <div className="user-settings__modal-content">
                        <h2 className="user-settings__modal-title">Potwierdź usunięcie konta</h2>
                        <p>Aby potwierdzić, wpisz słowo <strong>delete</strong> i podaj swoje hasło.</p>
                        {deleteError && <p className="user-settings__modal-error">{deleteError}</p>}
                        <input
                            type="text"
                            className="user-settings__modal-input"
                            placeholder="delete"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                        />
                        <input
                            type="password"
                            className="user-settings__modal-input"
                            placeholder="Twoje hasło"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                        />
                        <div className="user-settings__modal-actions">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="user-settings__button">
                                Anuluj
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="user-settings__button user-settings__button--danger"
                            >
                                Tak, usuń konto
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default UserSettings;