# 🔍 Gdzie znaleźć dane EmailJS do konfiguracji

## 📋 Potrzebujesz 3 wartości:

1. **Service ID** (np. `service_abc123`)
2. **Template ID** (np. `template_xyz789`)  
3. **Public Key** (np. `abcdefghijkl`)

---

## 🎯 Krok 1: Zaloguj się do EmailJS

1. Przejdź na [EmailJS.com](https://www.emailjs.com/)
2. Zaloguj się do swojego konta

---

## 🔑 Krok 2: Znajdź Public Key (User ID)

1. Kliknij na **ikonę swojego profilu** (góra po prawej)
2. Wybierz **Account** → **General**
3. Znajdź sekcję **API Keys**
4. Skopiuj **Public Key** (to jest Twój User ID)
   - Wygląda np. tak: `abcdefghijklmnop`

---

## 📧 Krok 3: Znajdź Service ID

1. W menu bocznym kliknij **Email Services**
2. Zobaczysz listę swoich usług emailowych
3. Kliknij na usługę, którą chcesz użyć (lub utwórz nową)
4. **Service ID** znajdziesz:
   - W nagłówku strony (np. `service_abc123`)
   - Lub w URL: `https://dashboard.emailjs.com/admin/integration/service/abc123`
   - Skopiuj **Service ID**

---

## 📝 Krok 4: Znajdź Template ID

1. W menu bocznym kliknij **Email Templates**
2. Zobaczysz listę swoich szablonów
3. Kliknij na szablon, który chcesz użyć (lub utwórz nowy)
4. **Template ID** znajdziesz:
   - W nagłówku strony (np. `template_xyz789`)
   - Lub w URL: `https://dashboard.emailjs.com/admin/template/xyz789`
   - Skopiuj **Template ID**

---

## ⚙️ Krok 5: Ustaw konfigurację Firebase

Po skopiowaniu wszystkich 3 wartości, wykonaj w terminalu (zastąp przykładowe wartości swoimi):

```bash
firebase functions:config:set emailjs.service_id="service_01gsy9q"
firebase functions:config:set emailjs.template_id="template_hl51uq9"
firebase functions:config:set emailjs.public_key="uoa8cmJT5xHCmLk4H"
```

**Przykład z prawdziwymi wartościami:**
```bash
firebase functions:config:set emailjs.service_id="service_gmail123"
firebase functions:config:set emailjs.template_id="template_kontakt456"
firebase functions:config:set emailjs.public_key="user_abcDEF123ghiJKL456"
```

---

## ✅ Sprawdź czy się zapisało

```bash
firebase functions:config:get
```

Powinieneś zobaczyć swoje wartości (nie przykładowe!).

---

## 🆘 Jeśli nie masz jeszcze Email Service lub Template

### Utwórz Email Service:

1. **Email Services** → **Add New Service**
2. Wybierz dostawcę (Gmail, Outlook, Custom SMTP, itp.)
3. Postępuj zgodnie z instrukcjami
4. Po utworzeniu skopiuj **Service ID**

### Utwórz Email Template:

1. **Email Templates** → **Create New Template**
2. Wykorzystaj te zmienne w szablonie:
   - `{{to_name}}` - "Administrator PartyPass"
   - `{{from_name}}` - imię i nazwisko z formularza
   - `{{from_email}}` - email z formularza
   - `{{reply_to}}` - email do odpowiedzi
   - `{{subject}}` - "Nowa wiadomość z formularza kontaktowego"
   - `{{message}}` - treść wiadomości

**Przykładowy szablon:**
```
Od: {{from_name}} <{{from_email}}>
Temat: {{subject}}

{{message}}

---
Odpowiedz na: {{reply_to}}
```

3. Po zapisaniu skopiuj **Template ID**

---

## 📌 Ważne!

- **Nie zmieniaj wartości w pliku IMPLEMENTACJA_EMAILJS.md** - to tylko przykłady
- **Wykonaj komendy w terminalu** z własnymi wartościami
- Wartości są widoczne w dashboard EmailJS

