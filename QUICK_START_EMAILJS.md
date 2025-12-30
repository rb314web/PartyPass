# 🚀 Szybki start - Implementacja EmailJS w Cloud Functions

## ✅ Co już jest gotowe

- ✅ Kod frontendowy (ContactSection i EmailService) - **GOTOWE**
- ✅ Struktura Cloud Functions - **GOTOWE**
- ✅ Konfiguracja Firebase - **GOTOWE**

## 📋 Co musisz zrobić (3 kroki)

### Krok 1: Zainstaluj zależności

```bash
cd functions
npm install
```

### Krok 2: Skonfiguruj EmailJS w Firebase

Musisz mieć z EmailJS:
- **Service ID** (np. `service_xxxxx`)
- **Template ID** (np. `template_xxxxx`)
- **Public Key** (User ID, np. `xxxxxxxxxxxxx`)

Następnie ustaw konfigurację:

```bash
firebase functions:config:set emailjs.service_id="TWÓJ_SERVICE_ID"
firebase functions:config:set emailjs.template_id="TWÓJ_TEMPLATE_ID"
firebase functions:config:set emailjs.public_key="TWÓJ_PUBLIC_KEY"
```

Sprawdź czy się zapisało:
```bash
firebase functions:config:get
```

### Krok 3: Zdeployuj funkcje

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

## 🎯 Template EmailJS - ważne!

Twój szablon EmailJS musi używać tych zmiennych:

- `{{to_name}}` - "Administrator PartyPass"
- `{{from_name}}` - imię i nazwisko z formularza
- `{{from_email}}` - email z formularza
- `{{reply_to}}` - email z formularza (do odpowiedzi)
- `{{subject}}` - "Nowa wiadomość z formularza kontaktowego"
- `{{message}}` - treść wiadomości

## ⚠️ Jeśli nie masz jeszcze EmailJS

1. Zarejestruj się na [EmailJS.com](https://www.emailjs.com/)
2. Utwórz **Email Service** (Gmail, Outlook, itp.)
3. Utwórz **Email Template** z powyższymi zmiennymi
4. Skopiuj Service ID, Template ID i Public Key

## ✅ Gotowe!

Po wykonaniu tych 3 kroków, formularz kontaktowy będzie działał! 🎉

