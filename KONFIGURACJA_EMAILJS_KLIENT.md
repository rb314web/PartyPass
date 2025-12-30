# 📧 Konfiguracja EmailJS - Wersja po stronie klienta

## ✅ Implementacja zakończona

Formularz kontaktowy używa teraz EmailJS bezpośrednio z przeglądarki (bez Cloud Functions).

## 🚀 Szybki start (3 kroki)

### Krok 1: Utwórz plik `.env.local`

Skopiuj `env.example` do `.env.local`:

```bash
cp env.example .env.local
```

**UWAGA:** Plik `.env.local` nie jest commitowany do repozytorium (jest w `.gitignore`).

### Krok 2: Skonfiguruj zmienne środowiskowe

Otwórz `.env.local` i uzupełnij dane EmailJS:

```env
REACT_APP_EMAILJS_SERVICE_ID=service_01gsy9q
REACT_APP_EMAILJS_TEMPLATE_ID=template_hl51uq9
REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID=template_hl51uq9
REACT_APP_EMAILJS_PUBLIC_KEY=uoa8cmJT5xHCmLk4H
```

**Gdzie znaleźć te wartości?** Zobacz `GDZIE_ZNALEZC_EMAILJS_DANE.md`

**Uwaga:** 
- Jeśli nie ustawisz `REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID`, zostanie użyty `REACT_APP_EMAILJS_TEMPLATE_ID`
- Możesz użyć tego samego template dla zaproszeń i formularza kontaktowego, lub stworzyć osobny

### Krok 3: Zrestartuj aplikację

```bash
npm start
```

**Ważne:** Po zmianie zmiennych środowiskowych musisz zrestartować serwer deweloperski!

## 📝 Template EmailJS dla formularza kontaktowego

Twój szablon EmailJS musi używać tych zmiennych:

- `{{to_name}}` - "Administrator PartyPass"
- `{{from_name}}` - imię i nazwisko z formularza
- `{{from_email}}` - email z formularza
- `{{reply_to}}` - email z formularza (do odpowiedzi)
- `{{subject}}` - "Nowa wiadomość z formularza kontaktowego"
- `{{message}}` - treść wiadomości

### Przykładowy template:

```
Temat: {{subject}}

Od: {{from_name}} <{{from_email}}>
Do: {{to_name}}

Wiadomość:
{{message}}

---
Odpowiedz na: {{reply_to}}
```

## 🔒 Bezpieczeństwo

**Ważne:** EmailJS Public Key jest bezpieczny do użycia po stronie klienta. Jest to publiczny identyfikator, który nie daje dostępu do Twojego konta EmailJS.

Jednak dla dodatkowego bezpieczeństwa możesz:
1. Ograniczyć domeny w EmailJS Dashboard (Settings → API Keys → Allowed Referrers)
2. Użyć rate limiting w EmailJS (darmowy plan: 200 emaili/miesiąc)

## ✅ Sprawdzenie konfiguracji

Formularz kontaktowy automatycznie sprawdzi konfigurację przy starcie aplikacji. Jeśli EmailJS nie jest skonfigurowany, wiadomości będą logowane do konsoli w trybie deweloperskim.

Możesz też sprawdzić w konsoli przeglądarki (F12):

```javascript
// Sprawdź status konfiguracji
EmailService.getConfigurationStatus()
```

## 🐛 Troubleshooting

### Błąd: "EmailJS nie jest skonfigurowany"
- Sprawdź czy plik `.env.local` istnieje
- Sprawdź czy zmienne zaczynają się od `REACT_APP_`
- Sprawdź czy zrestartowałeś serwer (`npm start`)

### Email nie wysyła się
- Sprawdź konsolę przeglądarki (F12) - mogą być błędy EmailJS
- Sprawdź czy template ID jest poprawne
- Sprawdź czy nazwy zmiennych w template odpowiadają tym w kodzie

### Email trafia do SPAM
- To normalne dla EmailJS - sprawdź folder SPAM
- Możesz skonfigurować własną domenę w EmailJS (płatne)

## 📚 Więcej informacji

- **Gdzie znaleźć dane EmailJS:** `GDZIE_ZNALEZC_EMAILJS_DANE.md`
- **EmailJS Dashboard:** https://dashboard.emailjs.com/
- **Dokumentacja EmailJS:** https://www.emailjs.com/docs/

---

**Gotowe!** 🎉 Formularz kontaktowy powinien teraz działać bez potrzeby używania Cloud Functions.

