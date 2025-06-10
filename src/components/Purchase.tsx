import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/style/Purchase.scss';

interface PurchaseProps {
    selectedPlan: {
        name: string;
        price: number;
        features: string[];
    };
}

const Purchase: React.FC<PurchaseProps> = ({ selectedPlan }) => {
    const navigate = useNavigate();

    const handlePurchase = () => {
        // TODO: Implement payment processing
        console.log('Processing purchase for plan:', selectedPlan.name);
    };

    return (
        <div className="purchase">
            <div className="purchase__container">
                <h2>Wybierz metodę płatności</h2>
                <div className="purchase__plan-summary">
                    <h3>Wybrany plan: {selectedPlan.name}</h3>
                    <p className="purchase__price">{selectedPlan.price} zł/mies.</p>
                    <ul className="purchase__features">
                        {selectedPlan.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                        ))}
                    </ul>
                </div>
                <div className="purchase__payment-methods">
                    <button className="purchase__payment-button purchase__payment-button--card">
                        <i className="fas fa-credit-card"></i>
                        Karta płatnicza
                    </button>
                    <button className="purchase__payment-button purchase__payment-button--transfer">
                        <i className="fas fa-university"></i>
                        Przelew bankowy
                    </button>
                </div>
                <div className="purchase__actions">
                    <button 
                        className="purchase__back-button"
                        onClick={() => navigate('/#pricing')}
                    >
                        Wróć do planów
                    </button>
                    <button 
                        className="purchase__confirm-button"
                        onClick={handlePurchase}
                    >
                        Potwierdź zakup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Purchase; 