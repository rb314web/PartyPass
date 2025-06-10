import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AutoPayService } from '../services/autopayService';
import { AUTOPAY_CONFIG } from '../config/autopay';
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
            const validUntil = new Date();
            validUntil.setMonth(validUntil.getMonth() + 1);

            // Zapisz w kolekcji subscriptions
            await setDoc(doc(db, 'subscriptions', currentUser!.uid), {
                plan: plan.name,
                status: 'active',
                validUntil: validUntil,
                createdAt: new Date(),
                price: plan.price
            });

            // Zapisz w dokumencie użytkownika
            const userEventRef = doc(db, 'events', currentUser!.uid);
            const userEventDoc = await getDoc(userEventRef);

            const maxGuests = plan.name === 'Start' ? 50 : 
                            plan.name === 'Pro' ? 200 : 
                            'Bez limitu'; // Tekst zamiast Infinity dla Premium

            if (userEventDoc.exists()) {
                await setDoc(userEventRef, {
                    ...userEventDoc.data(),
                    subscription: {
                        plan: plan.name,
                        status: 'active',
                        validUntil: validUntil,
                        createdAt: new Date(),
                        price: plan.price
                    },
                    maxGuests
                }, { merge: true });
            } else {
                await setDoc(userEventRef, {
                    subscription: {
                        plan: plan.name,
                        status: 'active',
                        validUntil: validUntil,
                        createdAt: new Date(),
                        price: plan.price
                    },
                    maxGuests,
                    guests: [],
                    createdAt: new Date()
                });
            }

            toast.success(`Plan ${plan.name} został aktywowany!`);
            navigate('/dashboard', { replace: true });

        } catch (error) {
            console.error('Błąd podczas aktywacji planu:', error);
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