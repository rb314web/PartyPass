# 🔥 Jak włączyć Firebase w PartyPass

## Aktualny status
Firebase jest obecnie **wyłączone** i aplikacja używa mock danych. Aby włączyć Firebase, wykonaj poniższe kroki:

## 📋 Kroki do włączenia Firebase

### 1. Utwórz projekt Firebase
1. Przejdź do [Firebase Console](https://console.firebase.google.com/)
2. Kliknij "Dodaj projekt"
3. Wprowadź nazwę: `partypass-app`
4. Włącz Google Analytics (opcjonalnie)
5. Kliknij "Utwórz projekt"

### 2. Dodaj aplikację web
1. W konsoli Firebase kliknij ikonę web (</>)
2. Wprowadź nazwę: `PartyPass Web`
3. Kliknij "Zarejestruj aplikację"
4. Skopiuj konfigurację Firebase

### 3. Skonfiguruj zmienne środowiskowe
1. Utwórz plik `.env.local` w głównym katalogu projektu:
```bash
cp env.example .env.local
```

2. Zastąp wartości w `.env.local` swoimi danymi Firebase:
```env
REACT_APP_FIREBASE_API_KEY=your_actual_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Włącz Firebase Authentication
1. W konsoli Firebase przejdź do **Authentication**
2. Kliknij **Get started**
3. Włącz **Email/Password** provider

### 5. Włącz Firestore Database
1. Przejdź do **Firestore Database**
2. Kliknij **Create database**
3. Wybierz **Start in test mode**
4. Wybierz lokalizację (np. `europe-west3`)

### 6. Włącz Storage
1. Przejdź do **Storage**
2. Kliknij **Get started**
3. Wybierz **Start in test mode**

### 7. Włącz Firebase w kodzie

#### Krok 7a: Włącz konfigurację Firebase
W pliku `src/config/firebase.ts` odkomentuj wszystkie linie:

```typescript
// Usuń komentarze z początku pliku
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Usuń komentarze z inicjalizacji
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const analytics = isSupported().then((yes: boolean) => yes ? getAnalytics(app) : null);

// Usuń mock exports na końcu pliku
```

#### Krok 7b: Włącz Firebase Auth Service
W pliku `src/services/firebase/authService.ts` odkomentuj cały kod Firebase i usuń mock exports.

#### Krok 7c: Włącz Firebase w useAuth
W pliku `src/hooks/useAuth.tsx`:
1. Odkomentuj import: `import { AuthService, AuthError } from '../services/firebase/authService';`
2. Usuń mock users
3. Zastąp mock logikę Firebase logiką

### 8. Uruchom aplikację
```bash
npm start
```

## 🔧 Konfiguracja Security Rules

### Firestore Rules
W konsoli Firebase przejdź do **Firestore Database** > **Rules** i wklej:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /events/{eventId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    match /guests/{guestId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/events/$(resource.data.eventId)) &&
        get(/databases/$(database)/documents/events/$(resource.data.eventId)).data.userId == request.auth.uid;
    }
  }
}
```

### Storage Rules
W konsoli Firebase przejdź do **Storage** > **Rules** i wklej:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /events/{userId}/{eventId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## ✅ Testowanie

Po włączeniu Firebase:

1. **Rejestracja** - Utwórz nowe konto
2. **Logowanie** - Zaloguj się z utworzonym kontem
3. **Tworzenie wydarzeń** - Utwórz nowe wydarzenie
4. **Sprawdź Firestore** - Zobacz dane w konsoli Firebase

## 🆘 Troubleshooting

### "Firebase App named '[DEFAULT]' already exists"
- Sprawdź czy Firebase jest inicjalizowany tylko raz

### "Missing or insufficient permissions"
- Sprawdź Security Rules w Firestore/Storage

### "Network request failed"
- Sprawdź połączenie internetowe
- Sprawdź czy Firebase project jest aktywny

## 📚 Przydatne linki

- [Firebase Setup Guide](./FIREBASE_SETUP.md) - Pełny przewodnik konfiguracji
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
