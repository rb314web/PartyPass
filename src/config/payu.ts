export const PAYU_CONFIG = {
    // Dane testowe - w produkcji należy użyć danych produkcyjnych
    merchantId: '145227', // ID sprzedawcy
    posId: '145227', // ID punktu sprzedaży
    clientId: '145227', // ID klienta
    clientSecret: '12f071174cb7eb79d4aac5bc2f07563f', // Klucz szyfrowania
    sandbox: true, // Tryb testowy
    apiUrl: 'https://secure.snd.payu.com', // URL API PayU (sandbox)
    // apiUrl: 'https://secure.payu.com', // URL API PayU (produkcja)
};

export interface PayUOrder {
    customerIp: string;
    merchantPosId: string;
    description: string;
    currencyCode: string;
    totalAmount: number;
    products: {
        name: string;
        unitPrice: number;
        quantity: number;
    }[];
    buyer: {
        email: string;
        firstName: string;
        lastName: string;
    };
    continueUrl: string;
    notifyUrl: string;
} 