// firebase-debug.js - Skrypt do debugowania Firebase w konsoli przeglądarki

// Sprawdzenie czy Firebase jest załadowany
console.log('🔍 Sprawdzanie Firebase...');
console.log('Window.firebase:', typeof window.firebase);

// Sprawdzenie czy użytkownik jest zalogowany
if (window.firebase && window.firebase.auth) {
  const user = window.firebase.auth().currentUser;
  console.log('👤 Aktualny użytkownik:', user);
  if (user) {
    console.log('User ID:', user.uid);
    console.log('Email:', user.email);
  }
}

// Sprawdzenie stanu aplikacji React
if (window.React) {
  console.log('⚛️ React jest załadowany');
}

// Instrukcje dla konsoli deweloperskiej
console.log(`
📝 Instrukcje debugowania:

1. Otwórz DevTools (F12)
2. Przejdź do zakładki Console
3. Sprawdź logi z PlanSettings:
   - Szukaj: "Ładowanie statystyk dla użytkownika"
   - Szukaj: "Pobrane statystyki"
   - Szukaj: "getEventStats"

4. Sprawdź stan użytkownika:
   - W konsoli wpisz: window.user (jeśli dostępne)
   - Lub sprawdź Redux/Context state

5. Sprawdź Network tab:
   - Sprawdź żądania do Firebase
   - Szukaj błędów 403/401

6. Sprawdź Firebase Auth:
   - W konsoli wpisz: firebase.auth().currentUser
`);
