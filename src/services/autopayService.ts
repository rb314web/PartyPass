// services/autopayService.ts
import { User } from '../types';

// Autopay API configuration
export const AUTOPAY_CONFIG = {
  apiUrl: process.env.REACT_APP_AUTOPAY_API_URL || 'https://api.autopay.pl/v1',
  merchantId: process.env.REACT_APP_AUTOPAY_MERCHANT_ID || '',
  secretKey: process.env.REACT_APP_AUTOPAY_SECRET_KEY || '',
  returnUrl: process.env.REACT_APP_AUTOPAY_RETURN_URL || 'http://localhost:3000/payment/return',
  notificationUrl: process.env.REACT_APP_AUTOPAY_NOTIFICATION_URL || 'http://localhost:3000/api/autopay/notification',
  sandbox: process.env.NODE_ENV !== 'production'
};

export interface AutopayPaymentRequest {
  amount: number;
  currency: string;
  title: string;
  description?: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
}

export interface AutopayPaymentResponse {
  transactionId: string;
  paymentUrl: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  createdAt: string;
}

export interface AutopaySubscription {
  subscriptionId: string;
  planId: string;
  status: 'active' | 'suspended' | 'cancelled';
  nextPaymentDate: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
}

export interface AutopayWebhookData {
  transactionId: string;
  status: 'confirmed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  merchantData?: string;
  signature: string;
}

class AutopayService {
  private static instance: AutopayService;

  public static getInstance(): AutopayService {
    if (!AutopayService.instance) {
      AutopayService.instance = new AutopayService();
    }
    return AutopayService.instance;
  }

  /**
   * Sprawdza konfigurację Autopay
   */
  public isConfigured(): boolean {
    return !!(AUTOPAY_CONFIG.merchantId && AUTOPAY_CONFIG.secretKey);
  }

  /**
   * Generuje sygnaturę dla żądania Autopay
   */
  private generateSignature(data: Record<string, any>): string {
    // W prawdziwej implementacji używamy HMAC-SHA256
    // To jest uproszczona wersja dla demonstracji
    const sortedKeys = Object.keys(data).sort();
    const signatureString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&') + AUTOPAY_CONFIG.secretKey;
    
    // Symulacja HMAC-SHA256
    return btoa(signatureString).substring(0, 32);
  }

  /**
   * Weryfikuje sygnaturę webhook
   */
  public verifyWebhookSignature(data: AutopayWebhookData): boolean {
    const { signature, ...payloadData } = data;
    const expectedSignature = this.generateSignature(payloadData);
    return signature === expectedSignature;
  }

  /**
   * Tworzy płatność jednorazową
   */
  public async createPayment(
    paymentData: AutopayPaymentRequest,
    user?: User
  ): Promise<AutopayPaymentResponse> {
    if (!this.isConfigured()) {
      throw new Error('Autopay nie jest skonfigurowane. Sprawdź zmienne środowiskowe.');
    }

    const requestData = {
      merchant_id: AUTOPAY_CONFIG.merchantId,
      amount: Math.round(paymentData.amount * 100), // kwota w groszach
      currency: paymentData.currency,
      title: paymentData.title,
      description: paymentData.description || '',
      customer_id: paymentData.customerId || user?.id,
      customer_email: paymentData.customerEmail || user?.email,
      customer_name: paymentData.customerName || `${user?.firstName} ${user?.lastName}`,
      return_url: AUTOPAY_CONFIG.returnUrl,
      notification_url: AUTOPAY_CONFIG.notificationUrl,
      merchant_data: JSON.stringify({
        planId: paymentData.planId,
        billingCycle: paymentData.billingCycle,
        userId: user?.id
      })
    };

    const signature = this.generateSignature(requestData);

    try {
      // W sandbox mode, symulujemy odpowiedź
      if (AUTOPAY_CONFIG.sandbox) {
        return this.simulatePaymentResponse(paymentData);
      }

      const response = await fetch(`${AUTOPAY_CONFIG.apiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTOPAY_CONFIG.secretKey}`,
          'X-Signature': signature
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Błąd Autopay: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      return {
        transactionId: responseData.transaction_id,
        paymentUrl: responseData.payment_url,
        status: responseData.status,
        amount: responseData.amount / 100, // konwersja z groszy
        currency: responseData.currency,
        createdAt: responseData.created_at
      };
    } catch (error) {
      console.error('Błąd podczas tworzenia płatności Autopay:', error);
      throw new Error('Nie udało się utworzyć płatności. Spróbuj ponownie.');
    }
  }

  /**
   * Tworzy subskrypcję cykliczną
   */
  public async createSubscription(
    paymentData: AutopayPaymentRequest,
    user?: User
  ): Promise<AutopaySubscription> {
    if (!this.isConfigured()) {
      throw new Error('Autopay nie jest skonfigurowane. Sprawdź zmienne środowiskowe.');
    }

    const requestData = {
      merchant_id: AUTOPAY_CONFIG.merchantId,
      amount: Math.round(paymentData.amount * 100),
      currency: paymentData.currency,
      title: paymentData.title,
      customer_id: paymentData.customerId || user?.id,
      customer_email: paymentData.customerEmail || user?.email,
      billing_cycle: paymentData.billingCycle,
      plan_id: paymentData.planId
    };

    const signature = this.generateSignature(requestData);

    try {
      if (AUTOPAY_CONFIG.sandbox) {
        return this.simulateSubscriptionResponse(paymentData);
      }

      const response = await fetch(`${AUTOPAY_CONFIG.apiUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTOPAY_CONFIG.secretKey}`,
          'X-Signature': signature
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Błąd Autopay: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      return {
        subscriptionId: responseData.subscription_id,
        planId: responseData.plan_id,
        status: responseData.status,
        nextPaymentDate: responseData.next_payment_date,
        amount: responseData.amount / 100,
        currency: responseData.currency,
        billingCycle: responseData.billing_cycle
      };
    } catch (error) {
      console.error('Błąd podczas tworzenia subskrypcji Autopay:', error);
      throw new Error('Nie udało się utworzyć subskrypcji. Spróbuj ponownie.');
    }
  }

  /**
   * Sprawdza status płatności
   */
  public async getPaymentStatus(transactionId: string): Promise<AutopayPaymentResponse> {
    if (!this.isConfigured()) {
      throw new Error('Autopay nie jest skonfigurowane.');
    }

    try {
      if (AUTOPAY_CONFIG.sandbox) {
        // Symulacja sprawdzenia statusu
        return {
          transactionId,
          paymentUrl: '',
          status: 'confirmed',
          amount: 29,
          currency: 'PLN',
          createdAt: new Date().toISOString()
        };
      }

      const response = await fetch(`${AUTOPAY_CONFIG.apiUrl}/payments/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${AUTOPAY_CONFIG.secretKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Błąd Autopay: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      return {
        transactionId: responseData.transaction_id,
        paymentUrl: responseData.payment_url || '',
        status: responseData.status,
        amount: responseData.amount / 100,
        currency: responseData.currency,
        createdAt: responseData.created_at
      };
    } catch (error) {
      console.error('Błąd podczas sprawdzania statusu płatności:', error);
      throw new Error('Nie udało się sprawdzić statusu płatności.');
    }
  }

  /**
   * Anuluje subskrypcję
   */
  public async cancelSubscription(subscriptionId: string): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('Autopay nie jest skonfigurowane.');
    }

    try {
      if (AUTOPAY_CONFIG.sandbox) {
        // Symulacja anulowania subskrypcji
        return true;
      }

      const response = await fetch(`${AUTOPAY_CONFIG.apiUrl}/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AUTOPAY_CONFIG.secretKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Błąd podczas anulowania subskrypcji:', error);
      throw new Error('Nie udało się anulować subskrypcji.');
    }
  }

  /**
   * Pobiera listę faktur użytkownika
   */
  public async getInvoices(customerId: string): Promise<any[]> {
    if (!this.isConfigured()) {
      throw new Error('Autopay nie jest skonfigurowane.');
    }

    try {
      if (AUTOPAY_CONFIG.sandbox) {
        // Zwracamy mock faktury
        return [
          {
            id: 'inv_1',
            date: '2024-12-01',
            amount: 29,
            status: 'paid',
            plan: 'Pro',
            period: 'Grudzień 2024',
            downloadUrl: '#'
          },
          {
            id: 'inv_2',
            date: '2024-11-01',
            amount: 29,
            status: 'paid',
            plan: 'Pro',
            period: 'Listopad 2024',
            downloadUrl: '#'
          }
        ];
      }

      const response = await fetch(`${AUTOPAY_CONFIG.apiUrl}/invoices?customer_id=${customerId}`, {
        headers: {
          'Authorization': `Bearer ${AUTOPAY_CONFIG.secretKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Błąd Autopay: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Błąd podczas pobierania faktur:', error);
      throw new Error('Nie udało się pobrać listy faktur.');
    }
  }

  /**
   * Symuluje odpowiedź płatności w trybie sandbox
   */
  private simulatePaymentResponse(paymentData: AutopayPaymentRequest): AutopayPaymentResponse {
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      transactionId,
      paymentUrl: `https://sandbox.autopay.pl/payment/${transactionId}`,
      status: 'pending',
      amount: paymentData.amount,
      currency: paymentData.currency,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Symuluje odpowiedź subskrypcji w trybie sandbox
   */
  private simulateSubscriptionResponse(paymentData: AutopayPaymentRequest): AutopaySubscription {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const nextPaymentDate = new Date();
    
    if (paymentData.billingCycle === 'monthly') {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    } else {
      nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
    }

    return {
      subscriptionId,
      planId: paymentData.planId,
      status: 'active',
      nextPaymentDate: nextPaymentDate.toISOString(),
      amount: paymentData.amount,
      currency: paymentData.currency,
      billingCycle: paymentData.billingCycle
    };
  }

  /**
   * Zwraca konfigurację dla debugowania
   */
  public getConfigStatus(): {
    configured: boolean;
    sandbox: boolean;
    missing: string[];
  } {
    const missing: string[] = [];
    
    if (!AUTOPAY_CONFIG.merchantId) missing.push('REACT_APP_AUTOPAY_MERCHANT_ID');
    if (!AUTOPAY_CONFIG.secretKey) missing.push('REACT_APP_AUTOPAY_SECRET_KEY');

    return {
      configured: missing.length === 0,
      sandbox: AUTOPAY_CONFIG.sandbox,
      missing
    };
  }
}

export default AutopayService.getInstance();
