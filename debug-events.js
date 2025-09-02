const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, query, where } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration (powinna być taka sama jak w aplikacji)
const firebaseConfig = {
  apiKey: "AIzaSyBOCJM8p1pWFTW2ZwRz7hckUnk6VLb87_I",
  authDomain: "partypass-22e93.firebaseapp.com",
  projectId: "partypass-22e93",
  storageBucket: "partypass-22e93.firebasestorage.app",
  messagingSenderId: "1013737906978",
  appId: "1:1013737906978:web:8a7d82b7e9a12e6a5e5a8e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function debugEvents() {
  try {
    console.log('🔍 Sprawdzanie wydarzeń w bazie danych...\n');
    
    // Pobierz wszystkie wydarzenia
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    console.log(`📊 Łącznie wydarzeń w bazie: ${eventsSnapshot.size}\n`);
    
    if (eventsSnapshot.size === 0) {
      console.log('⚠️ Brak wydarzeń w bazie danych!');
      return;
    }
    
    // Pokaż szczegóły każdego wydarzenia
    eventsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ID: ${doc.id}`);
      console.log(`   Tytuł: ${data.title}`);
      console.log(`   Użytkownik: ${data.userId}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Data utworzenia: ${data.createdAt?.toDate?.() || 'brak daty'}`);
      console.log(`   Liczba gości: ${data.guestCount || 0}`);
      console.log('');
    });
    
    // Sprawdź konkretne wydarzenie jeśli podano ID
    const eventId = process.argv[2];
    if (eventId) {
      console.log(`🔍 Sprawdzanie konkretnego wydarzenia: ${eventId}`);
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      
      if (eventDoc.exists()) {
        const data = eventDoc.data();
        console.log('✅ Wydarzenie istnieje:');
        console.log(`   Tytuł: ${data.title}`);
        console.log(`   Użytkownik: ${data.userId}`);
        console.log(`   Status: ${data.status}`);
      } else {
        console.log('❌ Wydarzenie o podanym ID nie istnieje!');
      }
    }
    
  } catch (error) {
    console.error('❌ Błąd podczas sprawdzania wydarzeń:', error);
  }
}

// Uruchom debugowanie
debugEvents();
