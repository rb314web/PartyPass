import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../assets/style/UserProfile.scss';

interface UserProfileProps {
    onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        displayName: currentUser?.displayName || '',
        phoneNumber: currentUser?.phoneNumber || '',
        photoURL: currentUser?.photoURL || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Tutaj dodamy logikę aktualizacji profilu
        setIsEditing(false);
    };

    return (
        <div className="user-profile">
            <div className="user-profile__header">
                <h2>Profil użytkownika</h2>
                <button className="user-profile__close" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div className="user-profile__content">
                {!isEditing ? (
                    <div className="user-profile__info">
                        <div className="user-profile__avatar">
                            {currentUser?.photoURL ? (
                                <img src={currentUser.photoURL} alt="Avatar" />
                            ) : (
                                <i className="fas fa-user-circle"></i>
                            )}
                        </div>
                        <div className="user-profile__details">
                            <p className="user-profile__email">{currentUser?.email}</p>
                            {currentUser?.displayName && (
                                <p className="user-profile__name">{currentUser.displayName}</p>
                            )}
                            {currentUser?.phoneNumber && (
                                <p className="user-profile__phone">{currentUser.phoneNumber}</p>
                            )}
                        </div>
                        <button 
                            className="user-profile__edit-button"
                            onClick={() => setIsEditing(true)}
                        >
                            <i className="fas fa-edit"></i>
                            Edytuj profil
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="user-profile__form">
                        <div className="user-profile__form-group">
                            <label htmlFor="displayName">Nazwa wyświetlana</label>
                            <input
                                type="text"
                                id="displayName"
                                value={formData.displayName}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    displayName: e.target.value
                                })}
                            />
                        </div>
                        <div className="user-profile__form-group">
                            <label htmlFor="phoneNumber">Numer telefonu</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    phoneNumber: e.target.value
                                })}
                            />
                        </div>
                        <div className="user-profile__form-group">
                            <label htmlFor="photoURL">URL zdjęcia profilowego</label>
                            <input
                                type="url"
                                id="photoURL"
                                value={formData.photoURL}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    photoURL: e.target.value
                                })}
                            />
                        </div>
                        <div className="user-profile__form-actions">
                            <button type="submit" className="user-profile__save-button">
                                <i className="fas fa-save"></i>
                                Zapisz zmiany
                            </button>
                            <button 
                                type="button" 
                                className="user-profile__cancel-button"
                                onClick={() => setIsEditing(false)}
                            >
                                Anuluj
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserProfile; 