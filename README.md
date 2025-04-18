# 🎉 PartyPass

**PartyPass** to nowoczesna aplikacja do zarządzania gośćmi na imprezach. Umożliwia tworzenie list gości, wysyłanie zaproszeń z potwierdzeniem obecności (RSVP) oraz szybkie sprawdzanie wejścia gości dzięki kodom QR. Idealna dla organizatorów imprez prywatnych, firmowych, konferencji i eventów.

## 🚀 Funkcje

- 📋 Zarządzanie listą gości
- 📧 Wysyłanie zaproszeń e-mail z opcją RSVP
- ✅ Skanowanie kodów QR przy wejściu
- 📊 Statystyki obecności w czasie rzeczywistym
- 👥 Konta organizatorów z różnymi poziomami dostępu
- 🔔 Powiadomienia o nowych odpowiedziach

## 🛠️ Technologie

- **Frontend:** React / TailwindCSS
- **Backend:** Node.js / Express
- **Baza danych:** MongoDB
- **Autoryzacja:** JWT
- **Inne:** QR Code Generator, Email Service (np. SendGrid)

## 📦 Instalacja

1. **Sklonuj repozytorium:**

   ```bash
   git clone https://github.com/twojanazwa/partypass.git
   cd partypass
   ```

2. **Zainstaluj zależności backendu:**

   ```bash
   npm install
   ```

3. **Skonfiguruj plik `.env` na podstawie `.env.example`. Przykład:**

   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/partypass
   JWT_SECRET=supersecret
   EMAIL_API_KEY=your_sendgrid_key
   ```

4. **Uruchom serwer backendu:**

   ```bash
   npm run dev
   ```

5. *(Opcjonalnie)* **Uruchom frontend:**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🧪 Testy

Aby uruchomić testy backendu:

```bash
npm run test
```

## 📸 Zrzuty ekranu

*Wkrótce dostępne – zrzuty z panelu zarządzania, formularza RSVP i skanowania QR.*

## 🤝 Wkład

Chcesz pomóc w rozwoju projektu? Zajrzyj do [CONTRIBUTING.md](CONTRIBUTING.md), aby dowiedzieć się, jak dołączyć.

## 📄 Licencja

Projekt dostępny na licencji [MIT](LICENSE).

## 📬 Kontakt

Masz pytania lub sugestie?

- 📧 Email: kontakt@partypass.app
- 🐛 Zgłoś błąd: [GitHub Issues](https://github.com/twojanazwa/partypass/issues)

---

Zorganizuj niezapomniane wydarzenia z **PartyPass** – bez stresu i chaosu! 🥳