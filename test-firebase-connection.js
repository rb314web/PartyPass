// test-firebase-connection.js - Test połączenia z Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

// Konfiguracja Firebase - pobierz z pliku .env
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

async function testFirebaseConnection() {
  try {
    console.log('🔄 Testowanie połączenia z Firebase...');
    
    // Inicjalizacja Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase zainicjalizowany');
    
    // Test połączenia poprzez pobranie użytkowników
    console.log('🔍 Sprawdzanie kolekcji users...');
    const usersQuery = query(collection(db, 'users'), limit(5));
    const usersSnapshot = await getDocs(usersQuery);
    
    console.log(`📊 Znaleziono ${usersSnapshot.size} użytkowników`);
    
    if (usersSnapshot.size > 0) {
      console.log('👤 Przykładowi użytkownicy:');
      usersSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${doc.id} - ${data.firstName} ${data.lastName} (${data.email})`);
      });
      
      // Test wydarzeń dla pierwszego użytkownika
      const firstUserId = usersSnapshot.docs[0].id;
      console.log(`\n🎉 Sprawdzanie wydarzeń dla użytkownika: ${firstUserId}`);
      
      const eventsQuery = query(collection(db, 'events'), limit(10));
      const eventsSnapshot = await getDocs(eventsQuery);
      
      console.log(`📅 Znaleziono ${eventsSnapshot.size} wydarzeń (ogółem)`);
      
      if (eventsSnapshot.size > 0) {
        console.log('📋 Przykładowe wydarzenia:');
        eventsSnapshot.forEach((doc, index) => {
          const data = doc.data();
          console.log(`   ${index + 1}. "${data.title}" - Właściciel: ${data.userId}, Goście: ${data.guestCount || 0}`);
        });
      }
    } else {
      console.log('⚠️  Brak użytkowników w bazie danych');
    }
    
    console.log('\n✅ Test zakończony pomyślnie');
    
  } catch (error) {
    console.error('❌ Błąd podczas testowania Firebase:', error);
    console.error('Stack:', error.stack);
  }
}

testFirebaseConnection().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
