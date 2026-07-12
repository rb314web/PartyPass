// config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Analytics } from 'firebase/analytics';
import type { FirebaseStorage } from 'firebase/storage';
import type { Functions } from 'firebase/functions';
import { readEnv } from './env';

const firebaseConfig = {
  apiKey: readEnv('FIREBASE_API_KEY'),
  authDomain: readEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('FIREBASE_APP_ID'),
  measurementId: readEnv('FIREBASE_MEASUREMENT_ID'),
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    'Konfiguracja Firebase jest niekompletna. Ustaw zmienne w .env',
    '(wzór: .env.example). Wymagane: REACT_APP_FIREBASE_API_KEY lub VITE_FIREBASE_API_KEY.'
  );
}

const app = initializeApp(firebaseConfig);

/** Wymagane przy starcie — logowanie i dane aplikacji. */
export const auth = getAuth(app);
export const db = getFirestore(app);

let storageInstance: FirebaseStorage | null = null;
let storageLoad: Promise<FirebaseStorage> | null = null;

/** Storage ładowany on-demand (upload awatara, zdjęć wydarzeń). */
export function getFirebaseStorage(): Promise<FirebaseStorage> {
  if (storageInstance) {
    return Promise.resolve(storageInstance);
  }

  if (!storageLoad) {
    storageLoad = import('firebase/storage').then(({ getStorage }) => {
      storageInstance = getStorage(app);
      return storageInstance;
    });
  }

  return storageLoad;
}

let functionsInstance: Functions | null = null;
let functionsLoad: Promise<Functions> | null = null;

let analyticsInstance: Analytics | null = null;
let analyticsLoad: Promise<Analytics | null> | null = null;

/** Firebase Analytics — tylko w przeglądarce, gdy measurementId jest ustawione. */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined' || !firebaseConfig.measurementId) {
    return Promise.resolve(null);
  }

  if (analyticsInstance) {
    return Promise.resolve(analyticsInstance);
  }

  if (!analyticsLoad) {
    analyticsLoad = import('firebase/analytics').then(({ getAnalytics, isSupported }) =>
      isSupported().then(supported => {
        if (!supported) {
          return null;
        }
        analyticsInstance = getAnalytics(app);
        return analyticsInstance;
      })
    );
  }

  return analyticsLoad;
}

/** Cloud Functions ładowane on-demand (RSVP, zaproszenia). */
export function getFirebaseFunctions(): Promise<Functions> {
  if (functionsInstance) {
    return Promise.resolve(functionsInstance);
  }

  if (!functionsLoad) {
    functionsLoad = import('firebase/functions').then(({ getFunctions }) => {
      functionsInstance = getFunctions(app);
      return functionsInstance;
    });
  }

  return functionsLoad;
}

export default app;
