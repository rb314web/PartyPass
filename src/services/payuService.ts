import { PAYU_CONFIG, PayUOrder } from '../config/payu';

export class PayUService {
    private static async generateSignature(order: PayUOrder): Promise<string> {
        const signatureBase = [
            PAYU_CONFIG.clientId,
            order.merchantPosId,
            order.description,
            order.totalAmount.toString(),
            order.currencyCode,
            order.customerIp,
            PAYU_CONFIG.clientSecret
        ].join('');

        // Konwertuj string na ArrayBuffer
        const encoder = new TextEncoder();
        const data = encoder.encode(signatureBase);

        // Generuj hash SHA-256
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        
        // Konwertuj ArrayBuffer na hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    static async createOrder(order: PayUOrder): Promise<{ redirectUrl: string }> {
        try {
            const signature = await this.generateSignature(order);
            
            // Symulacja odpowiedzi PayU w trybie testowym
            if (PAYU_CONFIG.sandbox) {
                console.log('Tryb testowy PayU - symulacja odpowiedzi');
                return {
                    redirectUrl: 'https://secure.snd.payu.com/pay/?orderId=TEST_ORDER_ID'
                };
            }

            const response = await fetch(`${PAYU_CONFIG.apiUrl}/api/v2_1/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PAYU_CONFIG.clientId}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    ...order,
                    signature,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(
                    errorData?.message || 
                    `Błąd podczas tworzenia zamówienia PayU: ${response.status} ${response.statusText}`
                );
            }

            const data = await response.json();
            return {
                redirectUrl: data.redirectUri,
            };
        } catch (error) {
            console.error('Błąd PayU:', error);
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new Error('Nie można połączyć się z serwerem PayU. Sprawdź połączenie internetowe.');
            }
            throw error;
        }
    }

    static async verifyPayment(orderId: string): Promise<boolean> {
        try {
            // Symulacja weryfikacji w trybie testowym
            if (PAYU_CONFIG.sandbox) {
                console.log('Tryb testowy PayU - symulacja weryfikacji płatności');
                return true;
            }

            const response = await fetch(`${PAYU_CONFIG.apiUrl}/api/v2_1/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${PAYU_CONFIG.clientId}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(
                    errorData?.message || 
                    `Błąd podczas weryfikacji płatności PayU: ${response.status} ${response.statusText}`
                );
            }

            const data = await response.json();
            return data.status === 'COMPLETED';
        } catch (error) {
            console.error('Błąd weryfikacji PayU:', error);
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new Error('Nie można połączyć się z serwerem PayU. Sprawdź połączenie internetowe.');
            }
            throw error;
        }
    }
} 