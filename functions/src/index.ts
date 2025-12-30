import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

admin.initializeApp();

// EmailJS Configuration - ustaw w Firebase Functions config:
// firebase functions:config:set emailjs.service_id="YOUR_SERVICE_ID"
// firebase functions:config:set emailjs.template_id="YOUR_TEMPLATE_ID"
// firebase functions:config:set emailjs.public_key="YOUR_PUBLIC_KEY"

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

/**
 * Cloud Function do wysyłania emaili z formularza kontaktowego
 * Używa EmailJS REST API do wysyłania wiadomości
 */
export const sendContactFormEmail = functions.https.onCall(
  async (data: ContactFormData, context) => {
    // Weryfikacja danych
    if (!data.name || !data.email || !data.message) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Wszystkie pola są wymagane (name, email, message)'
      );
    }

    // Walidacja emaila
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Nieprawidłowy format adresu email'
      );
    }

    // Pobierz konfigurację EmailJS
    const config = functions.config();
    const serviceId = config.emailjs?.service_id;
    const templateId = config.emailjs?.template_id;
    const publicKey = config.emailjs?.public_key;

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS nie jest skonfigurowany');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Konfiguracja EmailJS nie jest ustawiona. Sprawdź firebase functions:config:get'
      );
    }

    // Przygotuj parametry szablonu
    const templateParams = {
      to_name: 'Administrator PartyPass',
      from_name: data.name,
      from_email: data.email,
      reply_to: data.email,
      subject: 'Nowa wiadomość z formularza kontaktowego',
      message: data.message,
    };

    try {
      // Wyślij email przez EmailJS REST API
      const response = await axios.post(
        `https://api.emailjs.com/api/v1.0/email/send`,
        {
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: templateParams,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        console.log(`✅ Email wysłany pomyślnie od ${data.email}`);
        return {
          success: true,
          message: 'Wiadomość została wysłana pomyślnie',
        };
      } else {
        throw new Error(`EmailJS zwrócił status ${response.status}`);
      }
    } catch (error: any) {
      console.error('❌ Błąd podczas wysyłania emaila:', error);

      // Loguj szczegóły błędu
      if (error.response) {
        console.error('EmailJS response error:', {
          status: error.response.status,
          data: error.response.data,
        });
      }

      const errorMessage =
        error.response?.data?.error || error.message || 'Nieznany błąd';
      throw new functions.https.HttpsError(
        'internal',
        'Nie udało się wysłać wiadomości. Spróbuj ponownie później.',
        { originalError: errorMessage }
      );
    }
  }
);
