import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Timestamp } from 'firebase/firestore';

interface Subscription {
    plan: 'Start' | 'Pro' | 'Premium' | 'Free' | null;
    status: 'active' | 'inactive' | 'expired';
    validUntil: Date | null;
    expiryDate?: Timestamp;
    planType?: string;
    maxEvents?: number;
    maxGuests?: number;
}

interface SubscriptionContextType {
    subscription: Subscription | null;
    loading: boolean;
    error: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
    subscription: null,
    loading: true,
    error: null
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let unsubscribe: () => void;

        const setupSubscriptionListener = () => {
            if (!currentUser) {
                setSubscription(null);
                setLoading(false);
                return;
            }

            const subscriptionRef = doc(db, 'subscriptions', currentUser.uid);
                
            unsubscribe = onSnapshot(subscriptionRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    setSubscription({
                        plan: data.plan as 'Start' | 'Pro' | 'Premium' | 'Free',
                        status: data.status as 'active' | 'inactive' | 'expired',
                        validUntil: data.validUntil ? new Date(data.validUntil.toDate()) : null,
                        expiryDate: data.expiryDate as Timestamp || undefined,
                        planType: data.planType as string || 'Free',
                        maxEvents: data.maxEvents as number || 0,
                        maxGuests: data.plan === 'Pro' ? 200 : (data.maxGuests as number || 0),
                    });
                } else {
                    setSubscription({
                        plan: 'Free',
                        status: 'inactive',
                        validUntil: null,
                        expiryDate: undefined,
                        planType: 'Free',
                        maxEvents: 0,
                        maxGuests: 0,
                    });
                }
                setLoading(false);
            }, (err) => {
                console.error('Błąd podczas nasłuchiwania subskrypcji:', err);
                setError('Nie udało się pobrać informacji o subskrypcji w czasie rzeczywistym');
                setLoading(false);
            });
        };

        setupSubscriptionListener();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [currentUser]);

    return (
        <SubscriptionContext.Provider value={{ subscription, loading, error }}>
            {children}
        </SubscriptionContext.Provider>
    );
}; 