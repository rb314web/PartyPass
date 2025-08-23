# 🧪 Przewodnik testowania PartyPass

## 🎯 Aktualny status aplikacji

PartyPass jest obecnie skonfigurowane do pracy z **mock danymi**. Firebase jest wyłączone, ale aplikacja jest w pełni funkcjonalna z symulowanymi danymi.

## 🚀 Jak uruchomić aplikację

```bash
cd PartyPass
npm start
```

Aplikacja będzie dostępna pod adresem: `http://localhost:3000`

## 👤 Dane testowe

### Konto demo
- **Email**: `demo@partypass.pl`
- **Hasło**: `demo123`

### Funkcje do przetestowania

#### 1. **Autoryzacja**
- ✅ Logowanie z danymi demo
- ✅ Rejestracja nowego konta
- ✅ Wylogowanie
- ✅ Reset hasła (symulacja)

#### 2. **Dashboard**
- ✅ Wyświetlanie statystyk
- ✅ Nawigacja między sekcjami
- ✅ Responsywny design

#### 3. **Wydarzenia**
- ✅ Lista wydarzeń
- ✅ Tworzenie nowego wydarzenia
- ✅ Edycja wydarzenia
- ✅ Usuwanie wydarzenia
- ✅ Filtrowanie i wyszukiwanie

#### 4. **Profil użytkownika**
- ✅ Wyświetlanie profilu
- ✅ Aktualizacja danych
- ✅ Zmiana hasła
- ✅ Usuwanie konta

#### 5. **Ustawienia**
- ✅ Ustawienia profilu
- ✅ Ustawienia powiadomień
- ✅ Ustawienia wyglądu
- ✅ Ustawienia bezpieczeństwa

## 🔧 Mock dane

### Wydarzenia
Aplikacja używa mock danych z `src/services/mockData.ts`:
- Przykładowe wydarzenia z różnymi statusami
- Różne kategorie i lokalizacje
- Różne daty (przeszłe, przyszłe, dzisiejsze)

### Użytkownicy
- Demo użytkownik: `demo@partypass.pl`
- Możliwość rejestracji nowych kont
- Dane przechowywane w localStorage

### Statystyki
- Symulowane statystyki wydarzeń
- Liczby gości i odpowiedzi
- Trendy i zmiany

## 🎨 Funkcje UI/UX

### Responsywność
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

### Motywy
- ✅ Jasny motyw (domyślny)
- ✅ Ciemny motyw (prefers-color-scheme)
- ✅ Przełączanie motywów

### Dostępność
- ✅ Nawigacja klawiaturą
- ✅ Focus management
- ✅ ARIA labels
- ✅ Kontrast kolorów

## 🐛 Znane ograniczenia (mock data)

### Brakujące funkcje
- ❌ Real-time synchronizacja
- ❌ Upload plików (zdjęcia wydarzeń)
- ❌ Email notifications
- ❌ Push notifications
- ❌ Współdzielenie wydarzeń

### Ograniczenia mock danych
- Dane nie są trwałe (reset po odświeżeniu)
- Brak prawdziwej walidacji
- Symulowane opóźnienia API

## 📱 Testowanie na różnych urządzeniach

### Chrome DevTools
1. Otwórz DevTools (F12)
2. Kliknij ikonę urządzenia (📱)
3. Wybierz różne rozmiary ekranów:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1200px)

### Testowanie funkcji
- Sprawdź nawigację na mobile
- Testuj formularze na różnych rozmiarach
- Sprawdź responsywność sidebar
- Testuj modalne okna

## 🔍 Debugowanie

### Console logs
Otwórz DevTools Console, aby zobaczyć:
- Symulowane API calls
- Mock data operations
- Error handling

### LocalStorage
Sprawdź localStorage w DevTools:
- `partypass_user` - dane zalogowanego użytkownika
- `partypass_theme` - wybrany motyw

### Network tab
- Symulowane opóźnienia API (1-1.5s)
- Mock responses
- Error simulation

## 🚀 Następne kroki

### Włączenie Firebase
Gdy będziesz gotowy na prawdziwe dane:
1. Postępuj zgodnie z `FIREBASE_ENABLE.md`
2. Skonfiguruj projekt Firebase
3. Włącz Firebase w kodzie
4. Przetestuj z prawdziwymi danymi

### Funkcje do dodania
- Real-time notifications
- File upload
- Email integration
- Advanced analytics
- Social sharing

## 📞 Wsparcie

Jeśli napotkasz problemy:
1. Sprawdź console w DevTools
2. Sprawdź czy wszystkie zależności są zainstalowane
3. Uruchom `npm install` jeśli potrzebne
4. Sprawdź czy port 3000 jest wolny

---

**PartyPass** - Twój asystent do organizacji wydarzeń! 🎉
