import { AUTOPAY_CONFIG, AutoPayOrder } from '../config/autopay';

export class AutoPayService {
    static async createPayment(order: AutoPayOrder): Promise<{ redirectUrl: string }> {
        try {
            // Symulacja odpowiedzi AutoPay w trybie testowym
            if (AUTOPAY_CONFIG.sandbox) {
                console.log('Tryb testowy AutoPay - symulacja odpowiedzi');
                return {
                    redirectUrl: 'https://test-payment.autopay.eu/pay/TEST_ORDER_ID'
                };
            }

            const response = await fetch(`${AUTOPAY_CONFIG.apiUrl}/v1/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${AUTOPAY_CONFIG.apiKey}`,
                },
                body: JSON.stringify({
                    ...order,
                    merchantId: AUTOPAY_CONFIG.merchantId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(
                    errorData?.message || 
                    `Błąd podczas tworzenia płatności AutoPay: ${response.status} ${response.statusText}`
                );
            }

            const data = await response.json();
            return {
                redirectUrl: data.redirectUrl,
            };
        } catch (error) {
            console.error('Błąd AutoPay:', error);
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new Error('Nie można połączyć się z serwerem AutoPay. Sprawdź połączenie internetowe.');
            }
            throw error;
        }
    }

    static async verifyPayment(paymentId: string): Promise<boolean> {
        try {
            // Symulacja weryfikacji w trybie testowym
            if (AUTOPAY_CONFIG.sandbox) {
                console.log('Tryb testowy AutoPay - symulacja weryfikacji płatności');
                return true;
            }

            const response = await fetch(`${AUTOPAY_CONFIG.apiUrl}/v1/payments/${paymentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${AUTOPAY_CONFIG.apiKey}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(
                    errorData?.message || 
                    `Błąd podczas weryfikacji płatności AutoPay: ${response.status} ${response.statusText}`
                );
            }

            const data = await response.json();
            return data.status === 'COMPLETED';
        } catch (error) {
            console.error('Błąd weryfikacji AutoPay:', error);
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new Error('Nie można połączyć się z serwerem AutoPay. Sprawdź połączenie internetowe.');
            }
            throw error;
        }
    }
} 