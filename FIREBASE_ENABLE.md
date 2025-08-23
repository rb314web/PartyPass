# 🔥 Jak włączyć Firebase w PartyPass

## ✅ Status: Firebase jest już włączone w kodzie!

Firebase zostało pomyślnie włączone w kodzie aplikacji. Teraz musisz tylko skonfigurować projekt Firebase i dodać zmienne środowiskowe.

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

### 7. Uruchom aplikację
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

### "Firebase not configured"
- Sprawdź czy plik `.env.local` istnieje i ma poprawne wartości
- Upewnij się, że zmienne środowiskowe zaczynają się od `REACT_APP_`

## 📚 Przydatne linki

- [Firebase Setup Guide](./FIREBASE_SETUP.md) - Pełny przewodnik konfiguracji
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)

## 🎉 Gotowe!

Po wykonaniu powyższych kroków, Firebase będzie w pełni funkcjonalne w Twojej aplikacji PartyPass!
