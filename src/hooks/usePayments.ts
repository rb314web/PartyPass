// hooks/usePayments.ts
import { useState, useCallback } from 'react';
import { User } from '../types';
import autopayService, {
  AutopayPaymentRequest,
  AutopayPaymentResponse,
  AutopaySubscription,
} from '../services/autopayService';

export interface PaymentState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  currentPayment: AutopayPaymentResponse | null;
  currentSubscription: AutopaySubscription | null;
}

export const usePayments = (user?: User) => {
  const [state, setState] = useState<PaymentState>({
    isLoading: false,
    error: null,
    success: false,
    currentPayment: null,
    currentSubscription: null,
  });

  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      success: false,
      currentPayment: null,
      currentSubscription: null,
    });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading, error: null }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, isLoading: false, success: false }));
  }, []);

  const setSuccess = useCallback(
    (payment?: AutopayPaymentResponse, subscription?: AutopaySubscription) => {
      setState(prev => ({
        ...prev,
        success: true,
        isLoading: false,
        error: null,
        currentPayment: payment || null,
        currentSubscription: subscription || null,
      }));
    },
    []
  );

  /**
   * Inicjuje proces płatności za plan
   */
  const initiatePlanPayment = useCallback(
    async (
      planId: string,
      planName: string,
      amount: number,
      billingCycle: 'monthly' | 'yearly'
    ) => {
      if (!user) {
        setError('Musisz być zalogowany, aby dokonać płatności');
        return null;
      }

      setLoading(true);

      try {
        const paymentData: AutopayPaymentRequest = {
          amount,
          currency: 'PLN',
          title: `Plan ${planName} - ${billingCycle === 'monthly' ? 'miesięczny' : 'roczny'}`,
          description: `Subskrypcja planu ${planName} dla użytkownika ${user.email}`,
          customerId: user.id,
          customerEmail: user.email,
          customerName: `${user.firstName} ${user.lastName}` || user.email,
          planId,
          billingCycle,
        };

        const paymentResponse = await autopayService.createPayment(
          paymentData,
          user
        );

        setSuccess(paymentResponse);

        // Przekieruj użytkownika do Autopay
        if (paymentResponse.paymentUrl) {
          window.location.href = paymentResponse.paymentUrl;
        }

        return paymentResponse;
      } catch (error: any) {
        setError(error.message || 'Nie udało się zainicjować płatności');
        return null;
      }
    },
    [user, setLoading, setError, setSuccess]
  );

  /**
   * Tworzy subskrypcję cykliczną
   */
  const createSubscription = useCallback(
    async (
      planId: string,
      planName: string,
      amount: number,
      billingCycle: 'monthly' | 'yearly'
    ) => {
      if (!user) {
        setError('Musisz być zalogowany, aby utworzyć subskrypcję');
        return null;
      }

      setLoading(true);

      try {
        const paymentData: AutopayPaymentRequest = {
          amount,
          currency: 'PLN',
          title: `Subskrypcja ${planName}`,
          description: `Cykliczna subskrypcja planu ${planName}`,
          customerId: user.id,
          customerEmail: user.email,
          customerName: `${user.firstName} ${user.lastName}` || user.email,
          planId,
          billingCycle,
        };

        const subscription = await autopayService.createSubscription(
          paymentData,
          user
        );

        setSuccess(undefined, subscription);

        return subscription;
      } catch (error: any) {
        setError(error.message || 'Nie udało się utworzyć subskrypcji');
        return null;
      }
    },
    [user, setLoading, setError, setSuccess]
  );

  /**
   * Sprawdza status płatności
   */
  const checkPaymentStatus = useCallback(
    async (transactionId: string) => {
      setLoading(true);

      try {
        const paymentStatus =
          await autopayService.getPaymentStatus(transactionId);

        if (paymentStatus.status === 'confirmed') {
          setSuccess(paymentStatus);
        } else if (
          paymentStatus.status === 'failed' ||
          paymentStatus.status === 'cancelled'
        ) {
          setError('Płatność nie została zrealizowana');
        } else {
          setState(prev => ({
            ...prev,
            currentPayment: paymentStatus,
            isLoading: false,
          }));
        }

        return paymentStatus;
      } catch (error: any) {
        setError(error.message || 'Nie udało się sprawdzić statusu płatności');
        return null;
      }
    },
    [setLoading, setError, setSuccess]
  );

  /**
   * Anuluje subskrypcję
   */
  const cancelSubscription = useCallback(
    async (subscriptionId: string) => {
      setLoading(true);

      try {
        const success = await autopayService.cancelSubscription(subscriptionId);

        if (success) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            success: true,
            currentSubscription: prev.currentSubscription
              ? {
                  ...prev.currentSubscription,
                  status: 'cancelled',
                }
              : null,
          }));
        } else {
          setError('Nie udało się anulować subskrypcji');
        }

        return success;
      } catch (error: any) {
        setError(error.message || 'Nie udało się anulować subskrypcji');
        return false;
      }
    },
    [setLoading, setError]
  );

  /**
   * Pobiera historię faktur
   */
  const getInvoices = useCallback(async () => {
    if (!user) {
      setError('Musisz być zalogowany, aby pobrać faktury');
      return [];
    }

    setLoading(true);

    try {
      const invoices = await autopayService.getInvoices(user.id);
      setState(prev => ({ ...prev, isLoading: false }));
      return invoices;
    } catch (error: any) {
      setError(error.message || 'Nie udało się pobrać listy faktur');
      return [];
    }
  }, [user, setLoading, setError]);

  /**
   * Sprawdza konfigurację Autopay
   */
  const getConfigStatus = useCallback(() => {
    return autopayService.getConfigStatus();
  }, []);

  return {
    // Stan
    ...state,

    // Akcje
    initiatePlanPayment,
    createSubscription,
    checkPaymentStatus,
    cancelSubscription,
    getInvoices,
    resetState,

    // Utilities
    getConfigStatus,
    isConfigured: autopayService.isConfigured(),
  };
};

export default usePayments;
