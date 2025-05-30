import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAcPl7U3xR42tSMj7VMvmYgqe1GPfV9dKw",
    authDomain: "partypass-1ead7.firebaseapp.com",
    projectId: "partypass-1ead7",
    storageBucket: "partypass-1ead7.firebasestorage.app",
    messagingSenderId: "233867654819",
    appId: "1:233867654819:web:3bea1bdd7c97324d847116",
    measurementId: "G-X6Y78LMG2T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db: Firestore = getFirestore(app);

// Log initialization
console.log('Firebase app:', app);
console.log('Firebase auth:', auth);
console.log('Firebase db:', db); 