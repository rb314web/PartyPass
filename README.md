# 🎉 PartyPass - Platforma do Zarządzania Wydarzeniami

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange.svg)](https://firebase.google.com/)
[![Material--UI](https://img.shields.io/badge/Material--UI-5.14.0-blue.svg)](https://mui.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://developers.google.com/web/progressive-web-apps)
[![Tests](https://img.shields.io/badge/Tests-59%20Passed-brightgreen.svg)](https://jestjs.io/)
[![ESLint](https://img.shields.io/badge/ESLint-Configured-brightgreen.svg)](https://eslint.org/)

PartyPass to nowoczesna, responsywna platforma do zarządzania wydarzeniami zbudowana z wykorzystaniem najnowszych technologii webowych. Aplikacja oferuje intuicyjne narzędzia do tworzenia wydarzeń, zarządzania gośćmi, wysyłania zaproszeń oraz śledzenia odpowiedzi RSVP.

## ✨ Główne Funkcjonalności

### 🎯 Dla Organizatorów Wydarzeń
- **Intuicyjny kreator wydarzeń** - stwórz wydarzenie w kilka minut
- **Zaawansowane zarządzanie gośćmi** - dodawaj, edytuj i śledź uczestników
- **Automatyczne zaproszenia** - spersonalizowane email i SMS
- **Śledzenie RSVP** - w czasie rzeczywistym monitoruj odpowiedzi
- **Analityki i raporty** - szczegółowe statystyki wydarzeń
- **Powiadomienia** - automatyczne przypomnienia dla gości

### 📱 Dla Gości
- **Prosta rejestracja RSVP** - szybkie potwierdzenie udziału
- **Personalizowane zaproszenia** - unikalne linki dla każdego gościa
- **QR kody** - łatwy dostęp do informacji o wydarzeniu
- **Aktualizacje statusu** - możliwość zmiany decyzji

### 🎨 Dla Użytkowników
- **Responsywny design** - doskonała obsługa na wszystkich urządzeniach
- **Tryb ciemny/jasny** - automatyczne dostosowanie do preferencji systemu
- **PWA (Progressive Web App)** - instalacja jak natywna aplikacja
- **Dostępność** - zgodność z WCAG AA
- **Wielojęzyczność** - obsługa polskiego i angielskiego

## 🚀 Szybki Start

### Wymagania wstępne
- Node.js 18+
- npm lub yarn
- Konto Firebase

### Instalacja

1. **Sklonuj repozytorium**
   ```bash
   git clone https://github.com/your-username/partypass.git
   cd partypass
   ```

2. **Zainstaluj zależności**
   ```bash
   npm install
   ```

3. **Skonfiguruj środowisko**
   ```bash
   cp env.example .env
   # Edytuj .env z właściwymi kluczami Firebase
   ```

4. **Uruchom aplikację**
   ```bash
   npm start
   ```

Aplikacja będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000).

## 📋 Dostępne Skrypty

### Rozwój
```bash
npm start          # Uruchomienie serwera deweloperskiego
npm run build      # Budowa produkcyjna
npm test           # Uruchomienie testów
npm run lint       # Sprawdzanie jakości kodu
npm run lint:fix   # Automatyczne naprawianie błędów ESLint
```

### Dodatkowe narzędzia
```bash
npm run analyze    # Analiza bundle size (webpack-bundle-analyzer)
npm run format     # Formatowanie kodu (Prettier)
npm run clean-console # Usuwanie console.log z kodu produkcyjnego
```

## 🏗️ Architektura Techniczna

### Stack Technologiczny
- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI v5
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Stylizacja**: SCSS + CSS Modules
- **Testowanie**: Jest + React Testing Library
- **Build Tool**: Create React App (webpack)
- **PWA**: Service Worker + Web App Manifest

### Struktura Projektu
```
src/
├── components/          # Komponenty React
│   ├── common/         # Wspólne komponenty (Header, Footer, etc.)
│   ├── dashboard/      # Komponenty dashboard
│   ├── landing/        # Strona landingowa
│   └── auth/           # Komponenty autentyfikacji
├── hooks/              # Niestandardowe hooki React
├── services/           # Usługi (Firebase, API)
├── styles/             # Globalne style i theme
├── types/              # Definicje TypeScript
├── utils/              # Narzędzia pomocnicze
└── config/             # Konfiguracja aplikacji
```

### Kluczowe Funkcjonalności Techniczne

#### 🔐 Autentyfikacja i Autoryzacja
- Firebase Authentication z obsługą email/hasło
- Ochrona tras z AuthGuard
- Bezpieczeństwo danych użytkowników

#### 📊 Zarządzanie Stanem
- React Context dla theme i auth
- Lokalny state dla komponentów
- Optymalizacja z useMemo/useCallback

#### 🎯 Wydajność
- Code splitting z React.lazy
- Preloading krytycznych komponentów
- Lazy loading obrazów
- Bundle optimization

#### 🧪 Testowanie
- 59 testów jednostkowych (100% pass rate)
- Mockowanie Firebase i browser APIs
- Testowanie komponentów i hooków

#### ♿ Dostępność
- Zgodność z WCAG AA
- Semantic HTML
- Keyboard navigation
- Screen reader support

## 🔧 Konfiguracja Firebase

1. Utwórz projekt w [Firebase Console](https://console.firebase.google.com/)
2. Włącz Authentication, Firestore, Storage
3. Skopiuj klucze API do `.env`:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

## 📱 PWA Features

- **Offline support** - podstawowa funkcjonalność bez internetu
- **Install prompt** - automatyczne wyświetlanie opcji instalacji
- **Push notifications** - powiadomienia o wydarzeniach (planowane)
- **Background sync** - synchronizacja danych w tle

## 🧪 Testowanie

```bash
# Uruchom wszystkie testy
npm test

# Testy z pokryciem
npm test -- --coverage

# Testy specyficznego komponentu
npm test -- --testPathPattern=Header
```

### Pokrycie Testami
- ✅ Komponenty React (59 testów)
- ✅ Hooki niestandardowe
- ✅ Usługi Firebase
- ✅ Narzędzia pomocnicze
- ✅ Obsługa błędów

## 🚀 Deployment

### Netlify/Vercel (Zalecane)
1. Połącz repozytorium z platformą
2. Skonfiguruj zmienne środowiskowe
3. Wdróż automatycznie przy push do main

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## 🤝 Jak Przyczynić Się

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Standardy Kodowania
- **ESLint + Prettier** - automatyczne formatowanie
- **TypeScript** - ścisła typizacja
- **Conventional Commits** - opisowe wiadomości commit
- **Component naming** - PascalCase dla komponentów
- **File naming** - kebab-case dla plików

## 📈 Roadmap

### Wersja 2.0 (Planowana)
- [ ] Push notifications
- [ ] Calendar integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API for integrations

### Wersja 1.5 (Aktualna)
- [x] PWA implementation
- [x] Offline support
- [x] Advanced error handling
- [x] Performance optimization
- [x] Accessibility improvements

## 📄 Licencja

Ten projekt jest dostępny na licencji MIT. Zobacz plik `LICENSE` dla szczegółów.

## 📞 Kontakt

**PartyPass Team**
- Website: [https://partypass.app](https://partypass.app)
- Email: hello@partypass.app
- LinkedIn: [@partypass](https://linkedin.com/company/partypass)

---

⭐ Jeśli podoba Ci się projekt, daj nam gwiazdkę na GitHub!
