import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AutoPayService } from '../services/autopayService';
import { AUTOPAY_CONFIG } from '../config/autopay';
import { Timestamp } from 'firebase/firestore';
import '../assets/style/Pricing.scss';

interface PricingPlan {
    name: string;
    price: number;
    features: string[];
    popular?: boolean;
}

const Pricing: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);

    const plans: PricingPlan[] = [
        {
            name: 'Start',
            price: 0,
            features: [
                'Do 50 gości',
                'Podstawowe szablony zaproszeń',
                'Podstawowa lista gości',
                'Email support'
            ]
        },
        {
            name: 'Pro',
            price: 49,
            features: [
                'Do 200 gości',
                'Wszystkie szablony zaproszeń',
                'Zaawansowana lista gości',
                'Integracja z kalendarzem',
                'Priority support',
                'Statystyki i raporty'
            ],
            popular: true
        },
        {
            name: 'Premium',
            price: 99,
            features: [
                'Bez limitu gości',
                'Wszystkie funkcje Pro',
                'Dedykowany manager wydarzeń',
                'Integracja z CRM',
                'API dostęp',
                '24/7 support'
            ]
        }
    ];

    const handlePlanSelect = async (plan: PricingPlan) => {
        if (!currentUser) {
            navigate('/register', { state: { selectedPlan: plan } });
            return;
        }

        if (processingPlan) return;

        try {
            setProcessingPlan(plan.name);

            // W trybie testowym lub dla darmowego planu od razu aktywuj subskrypcję
            if (AUTOPAY_CONFIG.sandbox || plan.price === 0) {
                await activateSubscription(plan);
                return;
            }

            // Dla płatnych planów w trybie produkcyjnym inicjuj płatność przez AutoPay
            const order = {
                merchantId: AUTOPAY_CONFIG.merchantId,
                amount: plan.price,
                currency: 'PLN',
                description: `Subskrypcja planu ${plan.name}`,
                customer: {
                    email: currentUser.email || '',
                    firstName: currentUser.displayName?.split(' ')[0] || '',
                    lastName: currentUser.displayName?.split(' ')[1] || ''
                },
                successUrl: `${window.location.origin}/payment/success`,
                failureUrl: `${window.location.origin}/payment/failure`,
                notifyUrl: `${window.location.origin}/api/payment/notify`
            };

            const { redirectUrl } = await AutoPayService.createPayment(order);
            
            // Zapisz informacje o zamówieniu w sesji
            sessionStorage.setItem('pendingSubscription', JSON.stringify({
                plan: plan.name,
                price: plan.price,
                paymentId: 'TEST_PAYMENT_ID'
            }));

            // Przekieruj do AutoPay
            window.location.href = redirectUrl;

        } catch (error) {
            console.error('Błąd podczas inicjowania płatności:', error);
            toast.error('Wystąpił błąd podczas przetwarzania płatności. Spróbuj ponownie później.');
            setProcessingPlan(null);
        }
    };

    const activateSubscription = async (plan: PricingPlan) => {
        try {
            console.log('Attempting to activate plan:', plan.name);
            const now = new Date();
            const expiryDate = new Date();
            // Set expiry date based on plan - 1 month from now for simplicity
            expiryDate.setMonth(expiryDate.getMonth() + 1);

            let maxEvents = 0;
            let maxGuests = 0;

            switch (plan.name) {
                case 'Start':
                    maxEvents = 1; // Example: 1 event for Start plan
                    maxGuests = 50;
                    break;
                case 'Pro':
                    maxEvents = 5; // Example: 5 events for Pro plan
                    maxGuests = 200;
                    break;
                case 'Premium':
                    maxEvents = 9999; // Essentially unlimited for Premium
                    maxGuests = 9999; // Essentially unlimited for Premium
                    break;
                case 'Free':
                default:
                    maxEvents = 0; // No events for Free plan (or 1 if you want to allow a demo event)
                    maxGuests = 0;
                    break;
            }

            const subscriptionData = {
                plan: plan.name, // The current plan name (e.g., 'Start', 'Pro', 'Premium')
                planType: plan.name, // Store planType explicitly for clarity
                status: 'active',
                expiryDate: Timestamp.fromDate(expiryDate), // Store as Firebase Timestamp
                createdAt: Timestamp.fromDate(now),
                price: plan.price,
                maxEvents: maxEvents,
                maxGuests: maxGuests,
                userId: currentUser!.uid,
            };

            console.log('Saving subscription data to Firestore:', subscriptionData);

            // Zapisz w kolekcji subscriptions
            await setDoc(doc(db, 'subscriptions', currentUser!.uid), subscriptionData, { merge: true });

            console.log(`Plan ${plan.name} aktywowany pomyślnie w Firebase.`);
            toast.success(`Plan ${plan.name} został aktywowany!`);
            navigate('/dashboard', { replace: true });

        } catch (error) {
            console.error('Błąd podczas aktywacji planu w Pricing.tsx:', error);
            toast.error('Wystąpił błąd podczas aktywacji planu. Spróbuj ponownie później.');
            setProcessingPlan(null);
        }
    };

    return (
        <section className="pricing" id="pricing">
            <div className="pricing__container">
                <div className="pricing__header">
                    <h2>Wybierz plan dla siebie</h2>
                    <p>Dostosuj swoją subskrypcję do potrzeb Twojego wydarzenia</p>
                </div>
                <div className="pricing__hero">
                    <h1>Wybierz plan dla swojego wydarzenia</h1>
                    <p className="pricing__hero-subtitle">Dostosuj PartyPass do swoich potrzeb</p>
                    <div className="pricing__hero-features">
                        <div className="pricing__hero-feature">
                            <i className="fas fa-check-circle"></i>
                            <span>Bezpieczne zarządzanie listą gości</span>
                        </div>
                        <div className="pricing__hero-feature">
                            <i className="fas fa-check-circle"></i>
                            <span>Automatyczne potwierdzenia obecności</span>
                        </div>
                        <div className="pricing__hero-feature">
                            <i className="fas fa-check-circle"></i>
                            <span>Wsparcie techniczne 24/7</span>
                        </div>
                    </div>
                </div>
                <div className="pricing__plans">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`pricing__plan ${plan.popular ? 'pricing__plan--popular' : ''}`}
                        >
                            <h3 className="pricing__plan-name">{plan.name}</h3>
                            <div className="pricing__plan-price">
                                {plan.price === 0 ? 'Darmowy' : `${plan.price} zł`}
                                {plan.price > 0 && <span>/miesiąc</span>}
                            </div>
                            <ul className="pricing__plan-features">
                                {plan.features.map((feature, index) => (
                                    <li key={index}>
                                        <i className="fas fa-check"></i>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className={`pricing__plan-button ${plan.price === 0 ? 'pricing__plan-button--secondary' : ''} ${processingPlan === plan.name ? 'pricing__plan-button--processing' : ''}`}
                                onClick={() => handlePlanSelect(plan)}
                                disabled={!!processingPlan}
                            >
                                {processingPlan === plan.name ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Przetwarzanie...
                                    </>
                                ) : (
                                    plan.price === 0 ? 'Rozpocznij za darmo' : 'Wybierz plan'
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;