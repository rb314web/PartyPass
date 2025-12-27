# 🔒 Polityka Bezpieczeństwa PartyPass

Bezpieczeństwo użytkowników i ich danych jest naszym najwyższym priorytetem. Ta dokumentacja opisuje nasze praktyki bezpieczeństwa oraz jak zgłaszać potencjalne problemy.

## 🚨 Zgłaszanie Luk Bezpieczeństwa

Jeśli znalazłeś lukę bezpieczeństwa w PartyPass, **prosimy nie publikować jej publicznie**. Zamiast tego:

### 🔐 Sposób Zgłoszenia
1. **Email**: security@partypass.app
2. **GitHub Security Advisory**: [Utwórz advisory](https://github.com/your-username/partypass/security/advisories/new)
3. **Nagroda**: Program bug bounty (do $500 za krytyczne luki)

### 📋 Co Zawrzeć w Zgłoszeniu
```markdown
Tytuł: [Krótki opis problemu]

Opis:
[Szczegółowy opis luki]

Kroki reprodukcji:
1. [Krok 1]
2. [Krok 2]
3. [Krok 3]

Wpływ:
[Jakie dane/możliwości mogą być zagrożone]

Środowisko testowe:
- URL: [jeśli dotyczy]
- Browser: [Chrome 91, Firefox 89, etc.]
- OS: [Windows 10, macOS 12, etc.]
```

### ⏱️ Proces Rozpatrywania
1. **Potwierdzenie** - 24-48 godzin
2. **Analiza** - 1-7 dni
3. **Naprawa** - W zależności od złożoności
4. **Upublicznienie** - Po naprawie i koordynacji z zgłaszającym

## 🛡️ Środki Bezpieczeństwa

### 🔐 Autentyfikacja i Autoryzacja

#### Firebase Authentication
- **Bezpieczne hasła** - Wymuszanie silnych haseł
- **Multi-factor authentication** - Wsparcie dla 2FA
- **Session management** - Automatyczne wylogowanie nieaktywnych sesji
- **Brute force protection** - Ograniczenie prób logowania

#### Role-Based Access Control (RBAC)
```typescript
// Przykład sprawdzenia uprawnień
const canEditEvent = (userId: string, event: Event): boolean => {
  return event.userId === userId || event.collaborators.includes(userId);
};
```

### 📊 Ochrona Danych

#### Szyfrowanie
- **HTTPS Only** - Wszystkie połączenia szyfrowane
- **Data at Rest** - Firebase automatycznie szyfruje dane
- **Data in Transit** - TLS 1.3 dla wszystkich połączeń

#### Firestore Security Rules
```javascript
// Przykład reguł bezpieczeństwa
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tylko właściciel może czytać/zapisywać swoje wydarzenia
    match /events/{eventId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }

    // Goście mogą aktualizować tylko swój status RSVP
    match /events/{eventId}/guests/{guestId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                   request.auth.token.email == resource.data.email;
    }
  }
}
```

### 🌐 Bezpieczeństwo Aplikacji Webowej

#### Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com;
">
```

#### Input Validation & Sanitization
```typescript
// Przykład walidacji danych wejściowych
const validateEventData = (data: any): EventData => {
  const validated = {
    title: sanitizeString(data.title, { maxLength: 100 }),
    description: sanitizeString(data.description, { maxLength: 1000 }),
    date: validateDate(data.date),
    location: sanitizeString(data.location, { maxLength: 200 }),
  };

  if (!validated.title) throw new ValidationError('Title is required');
  if (validated.date < new Date()) throw new ValidationError('Date cannot be in the past');

  return validated;
};
```

#### XSS Protection
- **React's automatic escaping** - Bezpieczne renderowanie HTML
- **DOMPurify** - Sanitizacja HTML dla rich text
- **CSP nonces** - Dodatkowa ochrona przed XSS

### 🔒 Bezpieczeństwo Infrastruktury

#### Firebase Security
- **Automatic backups** - Codzienne kopie zapasowe
- **Multi-region replication** - Dane w wielu regionach
- **DDoS protection** - Wbudowana ochrona Google Cloud
- **Access logging** - Szczegółowe logi dostępu

#### Environment Variables
```bash
# .env.example - Nigdy nie commitować prawdziwych kluczy!
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
```

### 📱 PWA Security

#### Service Worker Security
```javascript
// public/sw.js - Bezpieczny service worker
const CACHE_NAME = 'partypass-v1.0.0';

// Cache only our own resources
const CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  // Nie cachować wrażliwych danych
];

self.addEventListener('install', (event) => {
  // Install logic
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests for same-origin resources
  if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
    event.respondWith(cacheFirst(event.request));
  }
});
```

#### Offline Data Security
- **Local storage encryption** - Wrażliwe dane szyfrowane
- **Data expiration** - Automatyczne usuwanie starych danych
- **Background sync** - Bezpieczna synchronizacja z serwerem

## 🚨 Incident Response

### Klasyfikacja Incydentów
- **KRYTYCZNY**: Masowy wyciek danych, całkowita niedostępność systemu
- **WYSOKI**: Wyciek wrażliwych danych, dłuższa niedostępność
- **ŚREDNI**: Częściowa utrata danych, tymczasowe problemy
- **NISKI**: Drobne problemy, potencjalne zagrożenia

### Procedura Reagowania
1. **Wykrycie** - Monitoring i alerting
2. **Ocena** - Analiza wpływu i zakresu
3. **Izolacja** - Ograniczenie dostępu do zagrożonych zasobów
4. **Naprawa** - Usunięcie przyczyny
5. **Komunikacja** - Informowanie użytkowników
6. **Uczenie się** - Analiza po-incydentowa

## 📊 Compliance & Standards

### GDPR Compliance
- **Data minimization** - Zbieramy tylko niezbędne dane
- **Consent management** - Jasne zgody na przetwarzanie danych
- **Right to erasure** - Możliwość usunięcia danych
- **Data portability** - Eksport danych użytkownika
- **Privacy by design** - Bezpieczeństwo od początku

### WCAG 2.1 AA Accessibility
- **Semantic HTML** - Poprawne użycie znaczników
- **Keyboard navigation** - Dostępność bez myszki
- **Screen reader support** - Kompatybilność z czytnikami ekranu
- **Color contrast** - Minimalny kontrast 4.5:1
- **Focus management** - Wskaźnik fokusu zawsze widoczny

## 🔍 Security Monitoring

### Automated Monitoring
```typescript
// src/hooks/useSecurityMonitoring.ts
export const useSecurityMonitoring = () => {
  const logSecurityEvent = (event: SecurityEvent) => {
    // Log to security service
    console.warn('Security Event:', event);
    // Send to monitoring service
  };

  return { logSecurityEvent };
};
```

### Security Headers
```nginx
# nginx.conf - Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self';" always;
```

## 📞 Kontakt

**Security Team**
- Email: security@partypass.app
- Response Time: < 24 hours for critical issues
- PGP Key: [Available on request]

**Emergency Contact**
- Phone: +48 XXX XXX XXX (tylko dla krytycznych incydentów)
- Available: 24/7

---

*Ta polityka bezpieczeństwa jest regularnie aktualizowana. Ostatnia aktualizacja: Grudzień 2025*
