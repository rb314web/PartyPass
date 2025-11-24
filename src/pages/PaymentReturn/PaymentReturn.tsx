// pages/PaymentReturn/PaymentReturn.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, X, AlertCircle, Loader } from 'lucide-react';
import autopayService from '../../services/autopayService';
import './PaymentReturn.scss';

type PaymentStatus = 'processing' | 'success' | 'failed' | 'cancelled';

const PaymentReturn: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>('processing');
  const [message, setMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        // Get payment details from URL parameters
        const paymentId = searchParams.get('payment_id');

        if (!paymentId) {
          setStatus('failed');
          setMessage('Brak identyfikatora płatności');
          return;
        }

        // Verify payment status with Autopay
        const paymentStatus = await autopayService.getPaymentStatus(paymentId);
        setPaymentDetails(paymentStatus);
        switch (paymentStatus.status) {
          case 'confirmed':
            setStatus('success');
            setMessage('Płatność została pomyślnie zrealizowana!');
            break;
          case 'failed':
            setStatus('failed');
            setMessage('Płatność nie powiodła się. Spróbuj ponownie.');
            break;
          case 'cancelled':
            setStatus('cancelled');
            setMessage('Płatność została anulowana.');
            break;
          case 'pending':
            setStatus('processing');
            setMessage('Płatność jest w trakcie realizacji...');
            // Check again after a delay
            setTimeout(handlePaymentReturn, 3000);
            break;
          default:
            setStatus('failed');
            setMessage('Nieznany status płatności');
        }
      } catch (error) {
        console.error('Payment return error:', error);
        setStatus('failed');
        setMessage('Wystąpił błąd podczas weryfikacji płatności');
      }
    };

    handlePaymentReturn();
  }, [searchParams]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/dashboard/settings', { state: { tab: 'plan' } });
    } else {
      navigate('/dashboard/settings');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <Check size={64} className="payment-return__icon--success" />;
      case 'failed':
        return <X size={64} className="payment-return__icon--error" />;
      case 'cancelled':
        return (
          <AlertCircle size={64} className="payment-return__icon--warning" />
        );
      case 'processing':
      default:
        return (
          <Loader size={64} className="payment-return__icon--processing" />
        );
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Płatność zakończona pomyślnie';
      case 'failed':
        return 'Płatność nieudana';
      case 'cancelled':
        return 'Płatność anulowana';
      case 'processing':
      default:
        return 'Przetwarzanie płatności';
    }
  };

  return (
    <div className="payment-return">
      <div className="payment-return__container">
        <div className="payment-return__card">
          <div className="payment-return__icon">{getStatusIcon()}</div>

          <h1 className="payment-return__title">{getStatusTitle()}</h1>

          <p className="payment-return__message">{message}</p>

          {paymentDetails && (
            <div className="payment-return__details">
              <h3>Szczegóły płatności</h3>
              <div className="payment-return__detail-row">
                <span>Kwota:</span>
                <span>
                  {paymentDetails.amount} {paymentDetails.currency}
                </span>
              </div>
              <div className="payment-return__detail-row">
                <span>Identyfikator:</span>
                <span>{paymentDetails.id}</span>
              </div>
              {paymentDetails.created_at && (
                <div className="payment-return__detail-row">
                  <span>Data:</span>
                  <span>
                    {new Date(paymentDetails.created_at).toLocaleString(
                      'pl-PL'
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="payment-return__actions">
            <button
              onClick={handleContinue}
              className={`payment-return__button payment-return__button--${status}`}
              disabled={status === 'processing'}
            >
              {status === 'processing' ? 'Przetwarzanie...' : 'Kontynuuj'}
            </button>

            {status !== 'processing' && status !== 'success' && (
              <button
                onClick={() =>
                  navigate('/dashboard/settings', { state: { tab: 'plan' } })
                }
                className="payment-return__button payment-return__button--secondary"
              >
                Spróbuj ponownie
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReturn;
