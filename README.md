# PartyPass — platforma do zarządzania wydarzeniami

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12-orange.svg)](https://firebase.google.com/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-brightgreen.svg)](https://vitest.dev/)

PartyPass to aplikacja do organizacji wydarzeń: kreator wydarzeń, lista gości, zaproszenia e-mail, publiczna strona RSVP, analityka i plany cenowe (Starter / Pro / Enterprise).

## Główne funkcje

**Organizator**
- Tworzenie i edycja wydarzeń (lokalizacja na mapie, dress code, deadline RSVP)
- Kontakty i import gości
- Zaproszenia e-mail (EmailJS + Cloud Functions)
- Dashboard z analityką, aktywnościami i limitami planu

**Gość**
- Publiczny link `/rsvp/:token` bez konta
- Potwierdzenie / odmowa / „może”, plus-one, preferencje żywieniowe

**Aplikacja**
- Landing PL/EN, demo interaktywne, strony prawne (Terms, Privacy, RODO)
- Tryb jasny/ciemny, przełącznik języka
- Responsywny panel (sidebar + bottom nav na mobile)

## Szybki start

### Wymagania
- Node.js 18+
- npm
- Projekt Firebase (Auth, Firestore, Storage; opcjonalnie Functions)

### Instalacja

```bash
git clone <repo-url> partypass
cd partypass
npm install
cp .env.example .env
# Uzupełnij .env — patrz sekcja „Zmienne środowiskowe”
npm start
```

Aplikacja: [http://localhost:3000](http://localhost:3000)

## Skrypty

| Polecenie | Opis |
|-----------|------|
| `npm start` / `npm run dev` | Serwer deweloperski (Vite, port 3000) |
| `npm run build` | `tsc --noEmit` + build produkcyjny |
| `npm test` | Testy (Vitest) |
| `npm run test:watch` | Vitest w trybie watch |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Stack technologiczny

| Warstwa | Technologia |
|---------|-------------|
| UI | React 19, TypeScript, SCSS (design system `pp-*`) |
| Build | Vite 6 |
| Routing | React Router 7 |
| Stan serwera | TanStack React Query |
| Stan globalny | React Context (auth, theme, language) |
| Backend | Firebase Auth, Firestore, Storage, Functions |
| i18n | i18next (pl, en) |
| Mapy | Leaflet |
| E-mail | EmailJS |
| Testy | Vitest + Testing Library |

## Struktura projektu

```
src/
├── components/
│   ├── auth/           # Login, Register, AuthLayout, AuthGuard
│   ├── common/         # Header, Toast, Theme, i18n UI
│   ├── dashboard/      # Panel organizatora
│   ├── landing/        # Marketing
│   └── rsvp/           # Podgląd zaproszenia
├── pages/              # Landing, Dashboard, RSVP, Legal, Demo
├── hooks/              # useAuth, useLanguage, useNotifications…
├── services/
│   ├── firebase/       # eventService, guestService, newRSVPService…
│   └── emailService.ts
├── constants/          # plany, motion, limity
├── config/             # firebase.ts, queryClient.ts
├── i18n/locales/       # pl.json, en.json
├── types/
└── styles/globals/     # tokeny, przyciski, formularze

functions/              # Firebase Cloud Functions (RSVP, zaproszenia)
firestore.rules         # Reguły bezpieczeństwa Firestore
```

## Trasy aplikacji

| Ścieżka | Dostęp |
|---------|--------|
| `/` | Landing |
| `/demo` | Interaktywne demo |
| `/login`, `/register`, `/forgot-password` | Auth (tylko niezalogowani) |
| `/rsvp/:token` | Publiczne RSVP |
| `/dashboard/*` | Panel (wymaga logowania) |
| `/terms`, `/privacy`, `/rodo` | Dokumenty prawne |

## Zmienne środowiskowe

Skopiuj `.env.example` → `.env`. Projekt używa prefiksu `REACT_APP_*` (kompatybilność z Vite przez `vite.config.ts`). Stopniowo wprowadzany jest też alias `VITE_*` — oba działają.

Wymagane minimum:
- `REACT_APP_FIREBASE_*` — konfiguracja Firebase
- `REACT_APP_BASE_URL` — URL aplikacji (linki RSVP)

Opcjonalne:
- `REACT_APP_EMAILJS_*` — zaproszenia i formularz kontaktowy
- `REACT_APP_STRIPE_PUBLISHABLE_KEY` — płatności
- `REACT_APP_OPENWEATHER_API_KEY` — pogoda (fallback: Open-Meteo)

## Firebase

1. Utwórz projekt w [Firebase Console](https://console.firebase.google.com/)
2. Włącz Authentication (email + Google), Firestore, Storage
3. Wdróż reguły: `firebase deploy --only firestore:rules`
4. Functions (opcjonalnie): `cd functions && npm install && npm run build`

## Testowanie

```bash
npm test
npm test -- --coverage
```

Obecnie testy obejmują głównie landing, komponenty wspólne, hooki auth/theme i utils RSVP. Rozszerzanie pokrycia — w toku.

## CI/CD

Workflow: `.github/workflows/ci-cd.yml` — na push/PR do `main` i `develop`:
- ESLint
- `tsc --noEmit`
- `npm test`
- `npm run build`

Deploy staging/production — szkielety w workflow (do podpięcia Firebase Hosting / Vercel).

## Deployment

```bash
npm run build
firebase deploy --only hosting
```

Alternatywnie: Netlify / Vercel z katalogiem `dist` i zmiennymi z `.env.example`.

## Standardy

- ESLint (`eslint-config-react-app`) + Prettier
- Komponenty: PascalCase; pliki: PascalCase dla komponentów
- Commity: opisowe, po angielsku lub polsku — spójnie w ramach PR

## Licencja

MIT — patrz `LICENSE`.
