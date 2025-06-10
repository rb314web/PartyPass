import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayUService } from '../services/payuService';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../assets/style/PaymentSuccess.scss';

interface PendingSubscription {
    plan: string;
    price: number;
    orderId: string;
}

const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isVerifying, setIsVerifying] = useState(true);

    const activateSubscription = async (plan: string, price: number) => {
        try {
            const validUntil = new Date();
            validUntil.setMonth(validUntil.getMonth() + 1);

            // Zapisz w kolekcji subscriptions
            await setDoc(doc(db, 'subscriptions', currentUser!.uid), {
                plan,
                status: 'active',
                validUntil,
                createdAt: new Date(),
                price
            });

            // Zapisz w dokumencie użytkownika
            const userEventRef = doc(db, 'events', currentUser!.uid);
            const userEventDoc = await getDoc(userEventRef);

            if (userEventDoc.exists()) {
                await setDoc(userEventRef, {
                    ...userEventDoc.data(),
                    subscription: {
                        plan,
                        status: 'active',
                        validUntil,
                        createdAt: new Date(),
                        price
                    },
                    maxGuests: plan === 'Start' ? 50 : plan === 'Pro' ? 200 : 999999
                }, { merge: true });
            } else {
                await setDoc(userEventRef, {
                    subscription: {
                        plan,
                        status: 'active',
                        validUntil,
                        createdAt: new Date(),
                        price
                    },
                    maxGuests: plan === 'Start' ? 50 : plan === 'Pro' ? 200 : 999999,
                    guests: [],
                    createdAt: new Date()
                });
            }

            toast.success(`Plan ${plan} został aktywowany!`);
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error('Błąd podczas aktywacji subskrypcji:', error);
            throw error;
        }
    };

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Pobierz informacje o zamówieniu z sesji
                const pendingSubscription = sessionStorage.getItem('pendingSubscription');
                if (!pendingSubscription) {
                    throw new Error('Brak informacji o zamówieniu');
                }

                const subscriptionData: PendingSubscription = JSON.parse(pendingSubscription);

                // Zweryfikuj status płatności
                const isPaymentSuccessful = await PayUService.verifyPayment(subscriptionData.orderId);

                if (isPaymentSuccessful) {
                    // Aktywuj subskrypcję
                    await activateSubscription(subscriptionData.plan, subscriptionData.price);
                    // Wyczyść dane sesji
                    sessionStorage.removeItem('pendingSubscription');
                } else {
                    throw new Error('Płatność nie została potwierdzona');
                }
            } catch (error) {
                console.error('Błąd weryfikacji płatności:', error);
                toast.error('Wystąpił błąd podczas weryfikacji płatności. Skontaktuj się z obsługą.');
                navigate('/pricing', { replace: true });
            } finally {
                setIsVerifying(false);
            }
        };

        verifyPayment();
    }, [navigate, currentUser]);

    if (isVerifying) {
        return (
            <div className="payment-success">
                <div className="payment-success__container">
                    <h2>Weryfikacja płatności...</h2>
                    <div className="payment-success__spinner">
                        <i className="fas fa-spinner fa-spin"></i>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default PaymentSuccess; 