// config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import type { Functions } from 'firebase/functions';

const env = process.env;

const firebaseConfig = {
  apiKey: env.REACT_APP_FIREBASE_API_KEY,
  authDomain: env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.REACT_APP_FIREBASE_APP_ID,
  measurementId: env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    'Konfiguracja Firebase jest niekompletna. Ustaw zmienne środowiskowe w pliku .env.local',
    '(wzór: .env.example). Wymagane: REACT_APP_FIREBASE_API_KEY, REACT_APP_FIREBASE_PROJECT_ID.'
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
