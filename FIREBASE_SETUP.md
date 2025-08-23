# 🔥 Firebase Setup Guide - PartyPass

## Przegląd integracji Firebase

PartyPass wykorzystuje Firebase jako backend-as-a-service, zapewniając:

- **Authentication** - Bezpieczne logowanie i rejestracja użytkowników
- **Firestore** - Baza danych NoSQL dla wydarzeń, gości i aktywności
- **Storage** - Przechowywanie zdjęć i plików
- **Functions** - Serverless funkcje (opcjonalnie)
- **Analytics** - Śledzenie zachowań użytkowników
- **Hosting** - Hosting aplikacji (opcjonalnie)

## 🚀 Szybka konfiguracja

### 1. Utwórz projekt Firebase

1. Przejdź do [Firebase Console](https://console.firebase.google.com/)
2. Kliknij "Dodaj projekt"
3. Wprowadź nazwę projektu: `partypass-app`
4. Włącz Google Analytics (opcjonalnie)
5. Wybierz konto Google Analytics
6. Kliknij "Utwórz projekt"

### 2. Dodaj aplikację web

1. W konsoli Firebase kliknij ikonę web (</>)
2. Wprowadź nazwę aplikacji: `PartyPass Web`
3. Włącz Firebase Hosting (opcjonalnie)
4. Kliknij "Zarejestruj aplikację"
5. Skopiuj konfigurację Firebase

### 3. Skonfiguruj zmienne środowiskowe

1. Skopiuj plik `env.example` do `.env.local`:
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

### 4. Zainstaluj zależności

```bash
npm install
```

### 5. Uruchom aplikację

```bash
npm start
```

## 🔧 Konfiguracja Firebase Services

### Authentication

1. W konsoli Firebase przejdź do **Authentication**
2. Kliknij **Get started**
3. Włącz **Email/Password** provider
4. Opcjonalnie włącz inne metody:
   - Google Sign-in
   - Facebook Sign-in
   - Phone Number

### Firestore Database

1. Przejdź do **Firestore Database**
2. Kliknij **Create database**
3. Wybierz **Start in test mode** (dla development)
4. Wybierz lokalizację (np. `europe-west3`)

#### Struktura kolekcji

```
users/
  {userId}/
    - email: string
    - firstName: string
    - lastName: string
    - planType: 'starter' | 'pro' | 'enterprise'
    - createdAt: timestamp
    - updatedAt: timestamp
    - avatar?: string
    - phoneNumber?: string
    - isEmailVerified: boolean
    - lastLoginAt: timestamp
    - preferences: object

events/
  {eventId}/
    - userId: string
    - title: string
    - description: string
    - date: timestamp
    - location: string
    - maxGuests: number
    - status: 'draft' | 'active' | 'completed' | 'cancelled'
    - createdAt: timestamp
    - updatedAt: timestamp
    - imageUrl?: string
    - category: string
    - tags: array
    - isPublic: boolean
    - settings: object
    - guestCount: number
    - acceptedCount: number
    - declinedCount: number
    - pendingCount: number

guests/
  {guestId}/
    - eventId: string
    - email: string
    - firstName: string
    - lastName: string
    - status: 'pending' | 'accepted' | 'declined' | 'maybe'
    - invitedAt: timestamp
    - respondedAt?: timestamp
    - phoneNumber?: string
    - dietaryRestrictions?: string
    - plusOne?: object
    - notes?: string
    - rsvpToken: string

activities/
  {activityId}/
    - userId: string
    - type: string
    - message: string
    - timestamp: timestamp
    - eventId?: string
    - guestId?: string
    - metadata?: object
    - isRead: boolean

notifications/
  {notificationId}/
    - userId: string
    - type: string
    - title: string
    - message: string
    - timestamp: timestamp
    - isRead: boolean
    - eventId?: string
    - guestId?: string
    - actionUrl?: string
    - priority: string
```

### Storage

1. Przejdź do **Storage**
2. Kliknij **Get started**
3. Wybierz **Start in test mode**
4. Wybierz lokalizację

#### Struktura folderów

```
avatars/
  {userId}/
    {timestamp}_{filename}

events/
  {userId}/
    {eventId}/
      {timestamp}_{filename}
```

### Security Rules

#### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Events - users can only access their own events
    match /events/{eventId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Guests - users can only access guests for their events
    match /guests/{guestId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/events/$(resource.data.eventId)) &&
        get(/databases/$(database)/documents/events/$(resource.data.eventId)).data.userId == request.auth.uid;
    }
    
    // Activities - users can only access their own activities
    match /activities/{activityId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Notifications - users can only access their own notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

#### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only upload to their own folders
    match /avatars/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /events/{userId}/{eventId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🧪 Firebase Emulators (Development)

### Instalacja Firebase CLI

```bash
npm install -g firebase-tools
```

### Login do Firebase

```bash
firebase login
```

### Inicjalizacja emulatorów

```bash
firebase init emulators
```

### Uruchomienie emulatorów

```bash
firebase emulators:start
```

### Konfiguracja w aplikacji

Odkomentuj linie w `src/config/firebase.ts`:

```typescript
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

## 📊 Analytics (Opcjonalnie)

1. W konsoli Firebase przejdź do **Analytics**
2. Kliknij **Get started**
3. Wybierz konto Google Analytics
4. Skonfiguruj śledzenie zdarzeń w aplikacji

## 🔔 Cloud Functions (Opcjonalnie)

### Inicjalizacja Functions

```bash
firebase init functions
```

### Przykładowe funkcje

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Send email notification when guest responds
export const onGuestResponse = functions.firestore
  .document('guests/{guestId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    
    if (newData.status !== previousData.status) {
      // Send email notification
      // Implementation here
    }
  });

// Clean up orphaned data
export const cleanupOrphanedData = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // Cleanup implementation
  });
```

## 🚀 Deployment

### Build aplikacji

```bash
npm run build
```

### Deploy do Firebase Hosting

```bash
firebase deploy
```

## 🔒 Bezpieczeństwo

### Najlepsze praktyki

1. **Zawsze używaj Security Rules**
2. **Waliduj dane po stronie klienta i serwera**
3. **Używaj HTTPS w produkcji**
4. **Regularnie aktualizuj zależności**
5. **Monitoruj użycie i koszty**

### Monitoring

1. Włącz **Crashlytics** dla monitorowania błędów
2. Użyj **Performance Monitoring** dla metryk wydajności
3. Skonfiguruj **Alerts** w konsoli Firebase

## 📚 Przydatne linki

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Firebase Pricing](https://firebase.google.com/pricing)

## 🆘 Troubleshooting

### Częste problemy

1. **"Firebase App named '[DEFAULT]' already exists"**
   - Sprawdź czy Firebase jest inicjalizowany tylko raz

2. **"Missing or insufficient permissions"**
   - Sprawdź Security Rules w Firestore/Storage

3. **"Network request failed"**
   - Sprawdź połączenie internetowe
   - Sprawdź czy Firebase project jest aktywny

4. **"Quota exceeded"**
   - Sprawdź limity w Firebase Console
   - Rozważ upgrade planu

### Support

- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [GitHub Issues](https://github.com/firebase/firebase-js-sdk/issues)
