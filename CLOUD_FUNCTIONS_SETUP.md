# Konfiguracja Cloud Functions z EmailJS

## 🎯 Co zostało zaimplementowane

✅ Utworzona struktura Cloud Functions z TypeScript
✅ Funkcja `sendContactFormEmail` używająca EmailJS REST API
✅ Zaktualizowany `EmailService` do używania Cloud Functions
✅ Zaktualizowany `firebase.json` z konfiguracją functions

## 📋 Krok po kroku - Konfiguracja

### 1. Zainstaluj zależności dla Functions

```bash
cd functions
npm install
```

### 2. Utwórz/Sprawdź konto EmailJS

1. Zaloguj się na [EmailJS.com](https://www.emailjs.com/)
2. Utwórz **Email Service** (jeśli jeszcze nie masz):
   - Przejdź do **Email Services**
   - Kliknij **Add New Service**
   - Wybierz dostawcę (Gmail, Outlook, itp.)
   - Połącz swoje konto email
   - Skopiuj **Service ID**

3. Utwórz **Email Template** dla formularza kontaktowego:
   - Przejdź do **Email Templates**
   - Kliknij **Create New Template**
   - Użyj tych zmiennych w szablonie:
     - `{{to_name}}` - "Administrator PartyPass"
     - `{{from_name}}` - imię i nazwisko nadawcy
     - `{{from_email}}` - email nadawcy
     - `{{reply_to}}` - email do odpowiedzi
     - `{{subject}}` - temat emaila
     - `{{message}}` - treść wiadomości
   - Skopiuj **Template ID**

4. Skopiuj **Public Key** (User ID):
   - Przejdź do **Account > General**
   - Skopiuj **Public Key**

### 3. Skonfiguruj Firebase Functions

```bash
# Ustaw EmailJS Service ID
firebase functions:config:set emailjs.service_id="YOUR_SERVICE_ID"

# Ustaw EmailJS Template ID
firebase functions:config:set emailjs.template_id="YOUR_TEMPLATE_ID"

# Ustaw EmailJS Public Key (User ID)
firebase functions:config:set emailjs.public_key="YOUR_PUBLIC_KEY"
```

### 4. Sprawdź konfigurację

```bash
firebase functions:config:get
```

Powinieneś zobaczyć:
```
emailjs:
  service_id: "service_xxxxx"
  template_id: "template_xxxxx"
  public_key: "xxxxxxxxxxxxx"
```

### 5. Kompiluj i deploy

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

## 🧪 Testowanie lokalnie

### 1. Uruchom emulator

```bash
cd functions
npm run serve
```

### 2. Połącz aplikację z emulatorem

W pliku `src/config/firebase.ts` odkomentuj linię:

```typescript
// connectFunctionsEmulator(functions, 'localhost', 5001);
```

Zmień na:

```typescript
connectFunctionsEmulator(functions, 'localhost', 5001);
```

### 3. Ustaw konfigurację dla emulatora

```bash
cd functions
# Ustaw zmienne środowiskowe w .env lub użyj firebase functions:config:get
```

## 🔍 Jak to działa

### Frontend (ContactSection)

```typescript
// W ContactSection.tsx
await EmailService.sendContactForm({
  name: 'Jan Kowalski',
  email: 'jan@example.com',
  message: 'Witam...'
});
```

### EmailService

```typescript
// W emailService.ts
const sendContactFormEmail = httpsCallable(functions, 'sendContactFormEmail');
await sendContactFormEmail({ name, email, message });
```

### Cloud Function

```typescript
// W functions/src/index.ts
export const sendContactFormEmail = functions.https.onCall(async (data) => {
  // Walidacja danych
  // Wyślij email przez EmailJS REST API
  // Zwróć wynik
});
```

## ⚠️ Ważne uwagi

1. **EmailJS Public Key** - nie jest tajny, można go używać po stronie klienta
2. **Darmowy plan EmailJS** - 200 emaili/miesiąc (wystarczy dla formularza kontaktowego)
3. **Template Variables** - upewnij się, że nazwy zmiennych w szablonie EmailJS odpowiadają tym w kodzie
4. **Koszty Firebase Functions** - darmowy plan: 2 miliony wywołań/miesiąc

## 🐛 Troubleshooting

### Błąd: "EmailJS nie jest skonfigurowany"
- Sprawdź czy wykonałeś wszystkie trzy komendy `firebase functions:config:set emailjs.*`
- Sprawdź konfigurację: `firebase functions:config:get`

### Błąd: "Unauthorized" lub "Invalid template"
- Sprawdź czy Service ID, Template ID i Public Key są poprawne
- Sprawdź w EmailJS Dashboard czy template jest aktywny
- Sprawdź czy nazwy zmiennych w template odpowiadają tym w kodzie

### Email nie dociera
- Sprawdź folder SPAM
- Sprawdź logi w EmailJS Dashboard > Email Logs
- Sprawdź logi Firebase: `firebase functions:log`
- Sprawdź czy Email Service jest poprawnie połączony

## 📚 Przydatne linki

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS REST API](https://www.emailjs.com/docs/rest-api/send/)
- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)

## 🎉 Gotowe!

Po wykonaniu wszystkich kroków, formularz kontaktowy będzie wysyłał emaile przez SendGrid używając Firebase Cloud Functions!
