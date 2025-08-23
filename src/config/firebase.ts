// config/firebase.ts
// TEMPORARILY DISABLED - Firebase configuration will be enabled after proper setup
// import { initializeApp } from 'firebase/app';
// import { getAuth, connectAuthEmulator } from 'firebase/auth';
// import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
// import { getStorage, connectStorageEmulator } from 'firebase/storage';
// import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
// import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:demo',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-DEMO'
};

// Initialize Firebase - TEMPORARILY DISABLED
// const app = initializeApp(firebaseConfig);

// Initialize Firebase services - TEMPORARILY DISABLED
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);
// export const functions = getFunctions(app);

// Initialize Analytics conditionally - TEMPORARILY DISABLED
// export const analytics = isSupported().then((yes: boolean) => yes ? getAnalytics(app) : null);

// Connect to emulators in development - TEMPORARILY DISABLED
// if (process.env.NODE_ENV === 'development') {
//   // Uncomment these lines when you want to use Firebase emulators
//   // connectAuthEmulator(auth, 'http://localhost:9099');
//   // connectFirestoreEmulator(db, 'localhost', 8080);
//   // connectStorageEmulator(storage, 'localhost', 9199);
//   // connectFunctionsEmulator(functions, 'localhost', 5001);
// }

// Temporary mock exports to prevent import errors
export const auth = null as any;
export const db = null as any;
export const storage = null as any;
export const functions = null as any;
export const analytics = null as any;

export default null;
