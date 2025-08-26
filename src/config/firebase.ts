// config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-8qwvOfQab02YrftdgqLNI9rPdo95Nk4",
  authDomain: "partypass-app-9539e.firebaseapp.com",
  projectId: "partypass-app-9539e",
  storageBucket: "partypass-app-9539e.appspot.com",
  messagingSenderId: "583171646923",
  appId: "1:583171646923:web:b2d26b6966af7933b1c24e",
  measurementId: "G-G28WF7GJ2W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Analytics conditionally
export const analytics = isSupported().then((yes: boolean) => yes ? getAnalytics(app) : null);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment these lines when you want to use Firebase emulators
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, 'localhost', 9199);
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}

export default app;
