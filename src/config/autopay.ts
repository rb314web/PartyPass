export const AUTOPAY_CONFIG = {
    // Dane testowe - w produkcji należy użyć danych produkcyjnych
    merchantId: '123456', // ID sprzedawcy
    apiKey: 'test_api_key', // Klucz API
    sandbox: true, // Tryb testowy
    apiUrl: 'https://sandbox.autopay.eu', // URL API AutoPay (sandbox)
    // apiUrl: 'https://api.autopay.eu', // URL API AutoPay (produkcja)
};

export interface AutoPayOrder {
    merchantId: string;
    amount: number;
    currency: string;
    description: string;
    customer: {
        email: string;
        firstName: string;
        lastName: string;
    };
    successUrl: string;
    failureUrl: string;
    notifyUrl: string;
} 