// simple-firebase-test.js - Prosty test Firebase bez uwierzytelnienia
require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, connectFirestoreEmulator } = require('firebase/firestore');

// Konfiguracja Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

console.log('🔧 Konfiguracja Firebase:');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testBasicConnection() {
  try {
    console.log('\n🔄 Testowanie podstawowego połączenia...');
    
    // Spróbuj pobrać kolekcje bez uwierzytelnienia
    const collections = ['events', 'users', 'guests'];
    
    for (const collectionName of collections) {
      try {
        console.log(`\n📂 Testowanie kolekcji: ${collectionName}`);
        const snapshot = await getDocs(collection(db, collectionName));
        console.log(`✅ Rozmiar kolekcji ${collectionName}: ${snapshot.size}`);
        
        if (snapshot.size > 0) {
          console.log(`📋 Pierwsze 3 dokumenty z ${collectionName}:`);
          snapshot.docs.slice(0, 3).forEach((doc, index) => {
            const data = doc.data();
            console.log(`   ${index + 1}. ID: ${doc.id}`);
            console.log(`      Klucze: ${Object.keys(data).join(', ')}`);
            if (data.userId) console.log(`      userId: ${data.userId}`);
            if (data.title) console.log(`      title: ${data.title}`);
            if (data.email) console.log(`      email: ${data.email}`);
          });
        }
      } catch (error) {
        console.error(`❌ Błąd dla kolekcji ${collectionName}:`, error.code, error.message);
      }
    }
    
  } catch (error) {
    console.error('💥 Ogólny błąd:', error);
  }
}

testBasicConnection().then(() => {
  console.log('\n✅ Test zakończony');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
