// test-stats.js - Script do testowania statystyk
require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Konfiguracja Firebase (powinna być taka sama jak w aplikacji)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Sprawdź czy zmienne środowiskowe są załadowane
if (!firebaseConfig.projectId) {
  console.error('❌ Brak zmiennych środowiskowych Firebase!');
  console.log('💡 Upewnij się, że plik .env istnieje i zawiera REACT_APP_FIREBASE_* zmienne');
  process.exit(1);
}

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testEventStats(userId = "test-user-id") {
  try {
    console.log('🔍 Sprawdzanie statystyk dla userId:', userId);
    
    // Pobierz wszystkie wydarzenia
    const eventsQuery = query(
      collection(db, 'events'),
      where('userId', '==', userId)
    );
    
    const eventsSnapshot = await getDocs(eventsQuery);
    console.log('📊 Znaleziono wydarzeń:', eventsSnapshot.size);
    
    if (eventsSnapshot.size === 0) {
      console.log('⚠️  Brak wydarzeń w bazie danych dla tego użytkownika');
      
      // Sprawdź wszystkie wydarzenia bez filtra userId
      const allEventsQuery = query(collection(db, 'events'));
      const allEventsSnapshot = await getDocs(allEventsQuery);
      console.log('📈 Łączna liczba wydarzeń w bazie:', allEventsSnapshot.size);
      
      if (allEventsSnapshot.size > 0) {
        console.log('👥 Przykładowi użytkownicy w bazie:');
        allEventsSnapshot.forEach((doc, index) => {
          if (index < 5) { // Pokaż tylko pierwsze 5
            const data = doc.data();
            console.log(`   ${index + 1}. userId: ${data.userId}, title: ${data.title}`);
          }
        });
      }
      return;
    }
    
    // Analizuj wydarzenia
    const events = [];
    eventsSnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        title: data.title,
        status: data.status,
        guestCount: data.guestCount || 0,
        acceptedCount: data.acceptedCount || 0,
        createdAt: data.createdAt
      });
    });
    
    console.log('📋 Szczegóły wydarzeń:');
    events.forEach((event, index) => {
      console.log(`   ${index + 1}. "${event.title}" - Status: ${event.status}, Goście: ${event.guestCount}`);
    });
    
    // Oblicz statystyki
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = {
      totalEvents: events.length,
      totalGuests: events.reduce((acc, event) => acc + (event.guestCount || 0), 0),
      eventsThisMonth: events.filter(event => 
        event.createdAt && event.createdAt.toDate() >= thisMonth
      ).length,
      guestsThisMonth: events
        .filter(event => event.createdAt && event.createdAt.toDate() >= thisMonth)
        .reduce((acc, event) => acc + (event.guestCount || 0), 0)
    };
    
    console.log('📊 Obliczone statystyki:');
    console.log('   Łącznie wydarzeń:', stats.totalEvents);
    console.log('   Łącznie gości:', stats.totalGuests);
    console.log('   Wydarzenia w tym miesiącu:', stats.eventsThisMonth);
    console.log('   Goście w tym miesiącu:', stats.guestsThisMonth);
    
  } catch (error) {
    console.error('❌ Błąd podczas testowania statystyk:', error);
  }
}

// Uruchom test
const testUserId = process.argv[2] || "test-user-id";
testEventStats(testUserId).then(() => {
  console.log('✅ Test zakończony');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
