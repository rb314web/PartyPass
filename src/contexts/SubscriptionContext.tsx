import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Subscription {
    plan: 'Start' | 'Pro' | 'Premium' | null;
    status: 'active' | 'inactive' | 'expired';
    validUntil: Date | null;
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
        const fetchSubscription = async () => {
            if (!currentUser) {
                setSubscription(null);
                setLoading(false);
                return;
            }

            try {
                const subscriptionDoc = await getDoc(doc(db, 'subscriptions', currentUser.uid));
                
                if (subscriptionDoc.exists()) {
                    const data = subscriptionDoc.data();
                    setSubscription({
                        plan: data.plan,
                        status: data.status,
                        validUntil: data.validUntil ? new Date(data.validUntil.toDate()) : null
                    });
                } else {
                    setSubscription({
                        plan: null,
                        status: 'inactive',
                        validUntil: null
                    });
                }
            } catch (err) {
                console.error('Błąd podczas pobierania subskrypcji:', err);
                setError('Nie udało się pobrać informacji o subskrypcji');
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [currentUser]);

    return (
        <SubscriptionContext.Provider value={{ subscription, loading, error }}>
            {children}
        </SubscriptionContext.Provider>
    );
}; 