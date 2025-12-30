# Firebase Cloud Functions

Cloud Functions dla aplikacji PartyPass używające EmailJS do wysyłania emaili.

## Konfiguracja

### 1. Zainstaluj zależności

```bash
cd functions
npm install
```

### 2. Skonfiguruj EmailJS

#### Krok 1: Utwórz konto EmailJS (jeśli jeszcze nie masz)
1. Zarejestruj się na [EmailJS.com](https://www.emailjs.com/)
2. Utwórz Email Service (Gmail, Outlook, itp.)
3. Utwórz Email Template dla formularza kontaktowego
4. Skopiuj Service ID, Template ID i Public Key (User ID)

#### Krok 2: Ustaw konfigurację Firebase Functions

```bash
firebase functions:config:set emailjs.service_id="YOUR_SERVICE_ID"
firebase functions:config:set emailjs.template_id="YOUR_TEMPLATE_ID"
firebase functions:config:set emailjs.public_key="YOUR_PUBLIC_KEY"
```

#### Krok 3: Sprawdź konfigurację

```bash
firebase functions:config:get
```

## Development

### Kompilacja TypeScript

```bash
npm run build
```

### Emulator lokalny

```bash
npm run serve
```

## Deploy

### Deploy wszystkich funkcji

```bash
npm run deploy
```

### Deploy konkretnej funkcji

```bash
firebase deploy --only functions:sendContactFormEmail
```

## Funkcje

### `sendContactFormEmail`

Callable function do wysyłania emaili z formularza kontaktowego.

**Parametry:**
- `name` (string): Imię i nazwisko nadawcy
- `email` (string): Email nadawcy
- `message` (string): Treść wiadomości

**Template Parameters wysyłane do EmailJS:**
- `to_name`: "Administrator PartyPass"
- `from_name`: imię i nazwisko z formularza
- `from_email`: email z formularza
- `reply_to`: email z formularza
- `subject`: "Nowa wiadomość z formularza kontaktowego"
- `message`: treść wiadomości z formularza

**Przykład użycia w kliencie:**

```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

const sendContactFormEmail = httpsCallable(functions, 'sendContactFormEmail');

await sendContactFormEmail({
  name: 'Jan Kowalski',
  email: 'jan@example.com',
  message: 'Witam, chciałbym...'
});
```

**Uwaga:** Upewnij się, że Twój EmailJS Template używa tych samych nazw zmiennych!

## Wymagania

- Node.js 18
- Firebase CLI
- EmailJS konto (darmowy plan: 200 emaili/miesiąc)

## Troubleshooting

### Błąd: "EmailJS nie jest skonfigurowany"
Upewnij się, że ustawiłeś wszystkie wymagane konfiguracje:
```bash
firebase functions:config:set emailjs.service_id="YOUR_SERVICE_ID"
firebase functions:config:set emailjs.template_id="YOUR_TEMPLATE_ID"
firebase functions:config:set emailjs.public_key="YOUR_PUBLIC_KEY"
```

### Błąd: "Unauthorized" lub "Invalid template"
- Sprawdź czy Service ID, Template ID i Public Key są poprawne
- Sprawdź w EmailJS Dashboard czy template jest aktywny
- Upewnij się, że nazwy zmiennych w template_params odpowiadają template w EmailJS

### Testowanie lokalnie
Użyj emulatora:
```bash
npm run serve
```
I w kliencie połącz się z emulatorem (odkomentuj linię w `src/config/firebase.ts`).
