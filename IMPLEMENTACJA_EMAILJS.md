# 📧 Implementacja EmailJS w Cloud Functions - Krok po kroku

## ✅ Status

**Kod jest już przygotowany!** Musisz tylko wykonać 3 proste kroki.

---

## 📋 Co musisz zrobić

### 1️⃣ Zainstaluj zależności (raz)

```bash
cd functions
npm install
```

Spowoduje to zainstalowanie:
- `firebase-functions`
- `firebase-admin`
- `axios` (do wywołań REST API EmailJS)
- `typescript` i inne zależności

---

### 2️⃣ Skonfiguruj EmailJS w Firebase Functions

#### A) Jeśli NIE masz jeszcze EmailJS:

1. Zarejestruj się na [EmailJS.com](https://www.emailjs.com/)
2. Utwórz **Email Service**:
   - Przejdź do **Email Services** → **Add New Service**
   - Wybierz dostawcę (Gmail, Outlook, itp.)
   - Połącz swoje konto email
   - **Skopiuj Service ID** (np. `service_abc123`)

3. Utwórz **Email Template**:
   - Przejdź do **Email Templates** → **Create New Template**
   - Użyj tego szablonu:

   ```
   Od: {{from_name}} <{{from_email}}>
   Temat: {{subject}}
   
   {{message}}
   
   ---
   Odpowiedz na: {{reply_to}}
   ```

   Lub użyj tych zmiennych w HTML:
   - `{{to_name}}` - "Administrator PartyPass"
   - `{{from_name}}` - imię i nazwisko z formularza
   - `{{from_email}}` - email z formularza
   - `{{reply_to}}` - email do odpowiedzi
   - `{{subject}}` - "Nowa wiadomość z formularza kontaktowego"
   - `{{message}}` - treść wiadomości
   
   - **Skopiuj Template ID** (np. `template_xyz789`)

4. Skopiuj **Public Key** (User ID):
   - Przejdź do **Account → General**
   - **Skopiuj Public Key** (np. `abcdefghijkl`)

#### B) Ustaw konfigurację Firebase:

```bash
firebase functions:config:set emailjs.service_id="TWÓJ_SERVICE_ID"
firebase functions:config:set emailjs.template_id="TWÓJ_TEMPLATE_ID"
firebase functions:config:set emailjs.public_key="TWÓJ_PUBLIC_KEY"
```

**Przykład:**
```bash
firebase functions:config:set emailjs.service_id="service_abc123"
firebase functions:config:set emailjs.template_id="template_xyz789"
firebase functions:config:set emailjs.public_key="abcdefghijkl"
```

#### C) Sprawdź konfigurację:

```bash
firebase functions:config:get
```

Powinieneś zobaczyć:
```json
{
  "emailjs": {
    "service_id": "service_abc123",
    "template_id": "template_xyz789",
    "public_key": "abcdefghijkl"
  }
}
```

---

### 3️⃣ Zdeployuj funkcje

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

To skompiluje TypeScript i wdroży funkcję na Firebase.

---

## ✅ Gotowe!

Teraz formularz kontaktowy na stronie będzie wysyłał emaile przez EmailJS używając Cloud Functions! 🎉

---

## 🧪 Testowanie

1. Otwórz stronę z formularzem kontaktowym
2. Wypełnij formularz
3. Wyślij
4. Sprawdź czy email dotarł do skrzynki ustawionej w EmailJS Service

---

## 🐛 Troubleshooting

### Błąd: "EmailJS nie jest skonfigurowany"
- Sprawdź czy wykonałeś wszystkie 3 komendy `firebase functions:config:set`
- Sprawdź: `firebase functions:config:get`

### Błąd: "Invalid template"
- Sprawdź czy Template ID jest poprawny
- Sprawdź czy nazwy zmiennych w szablonie odpowiadają tym w kodzie

### Email nie dociera
- Sprawdź folder SPAM
- Sprawdź logi w EmailJS Dashboard → Email Logs
- Sprawdź logi Firebase: `firebase functions:log`

---

## 📚 Przydatne linki

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [CLOUD_FUNCTIONS_SETUP.md](./CLOUD_FUNCTIONS_SETUP.md) - pełna dokumentacja

