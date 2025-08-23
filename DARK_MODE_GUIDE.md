# 🌙 Tryb ciemny w PartyPass

## 🎯 Funkcje trybu ciemnego

PartyPass obsługuje teraz pełny tryb ciemny z następującymi funkcjami:

### ✨ **Główne funkcje:**
- **3 opcje motywu**: Jasny, Ciemny, Auto (system)
- **Automatyczne przełączanie**: Wykrywa preferencje systemu
- **Zapamiętywanie wyboru**: Przechowuje preferencje w localStorage
- **Płynne przejścia**: Animacje przy zmianie motywu
- **Responsywny design**: Działa na wszystkich urządzeniach

## 🎨 **Obsługiwane komponenty:**

### ✅ **Główne elementy:**
- **Header** - Nawigacja i wyszukiwanie
- **Sidebar** - Menu nawigacyjne
- **Dashboard** - Główny layout
- **EventCard** - Karty wydarzeń
- **ThemeToggle** - Przełącznik motywu
- **Formularze** - Inputy i przyciski
- **Modalne okna** - Popupy i dialogi

### 🎯 **Kolory w trybie ciemnym:**
- **Tło główne**: `#111827` (gray-900)
- **Tło komponentów**: `#1f2937` (gray-800)
- **Tekst główny**: `#f9fafb` (gray-100)
- **Tekst drugorzędny**: `#d1d5db` (gray-300)
- **Obramowania**: `#374151` (gray-700)
- **Akcenty**: `#3b82f6` (blue-500)

## 🚀 **Jak używać:**

### 1. **Przełącznik motywu**
- Znajdź przycisk z ikoną słońca/księżyca w headerze
- Kliknij, aby otworzyć menu wyboru motywu
- Wybierz: **Jasny**, **Ciemny** lub **Auto**

### 2. **Opcje motywu:**
- **🌞 Jasny**: Klasyczny jasny motyw
- **🌙 Ciemny**: Ciemny motyw dla lepszej czytelności
- **🖥️ Auto**: Automatycznie dopasowuje się do systemu

### 3. **Automatyczne przełączanie:**
- Tryb **Auto** wykrywa preferencje systemu
- Zmienia się automatycznie przy zmianie ustawień systemu
- Działa na Windows, macOS i Linux

## 🎨 **Dostosowywanie:**

### **Zmienne CSS:**
Wszystkie kolory są zdefiniowane jako zmienne CSS w `src/styles/globals/_variables.scss`:

```scss
// Jasny motyw (domyślny)
:root {
  --bg-primary: white;
  --text-primary: var(--gray-900);
  --border-primary: var(--gray-200);
}

// Ciemny motyw
.dark {
  --bg-primary: var(--gray-900);
  --text-primary: var(--gray-100);
  --border-primary: var(--gray-700);
}
```

### **Dodawanie nowych komponentów:**
Aby dodać obsługę trybu ciemnego do nowego komponentu:

```scss
.my-component {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

// Dark mode styles
.dark {
  .my-component {
    // Dodatkowe style dla trybu ciemnego (opcjonalne)
  }
}
```

## 🔧 **Techniczne szczegóły:**

### **Hook useTheme:**
```typescript
import { useTheme } from '../hooks/useTheme';

const { theme, isDark, toggleTheme, setTheme } = useTheme();
```

### **Dostępne funkcje:**
- `theme` - Aktualny motyw ('light' | 'dark' | 'auto')
- `isDark` - Czy tryb ciemny jest aktywny
- `toggleTheme()` - Przełącz między jasnym a ciemnym
- `setTheme(theme)` - Ustaw konkretny motyw

### **Przechowywanie preferencji:**
- Preferencje są zapisywane w `localStorage` jako `partypass_theme`
- Automatycznie przywracane przy ponownym uruchomieniu
- Domyślny motyw: `auto`

## 🎯 **Dostępność:**

### **WCAG 2.1 Compliance:**
- **Kontrast**: Wszystkie kolory spełniają wymagania AA (4.5:1)
- **Nawigacja klawiaturą**: Pełna obsługa klawiatury
- **Screen readers**: Odpowiednie ARIA labels
- **Reduced motion**: Obsługa preferencji użytkownika

### **Preferencje użytkownika:**
```css
/* Obsługa preferencji systemu */
@media (prefers-color-scheme: dark) {
  /* Automatyczne style dla trybu ciemnego */
}

/* Obsługa reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
```

## 🐛 **Rozwiązywanie problemów:**

### **Motyw się nie zmienia:**
1. Sprawdź czy `ThemeProvider` jest dodany do `App.tsx`
2. Sprawdź console w DevTools pod kątem błędów
3. Wyczyść localStorage i spróbuj ponownie

### **Style nie działają:**
1. Sprawdź czy zmienne CSS są poprawnie zdefiniowane
2. Upewnij się, że selektor `.dark` jest używany
3. Sprawdź kolejność importów SCSS

### **Animacje są zbyt szybkie:**
1. Sprawdź preferencje systemu `prefers-reduced-motion`
2. Dostosuj czas trwania animacji w zmiennych CSS

## 🚀 **Przyszłe ulepszenia:**

### **Planowane funkcje:**
- **Własne motywy**: Możliwość tworzenia własnych schematów kolorów
- **Scheduled themes**: Automatyczne przełączanie o określonych godzinach
- **High contrast mode**: Dodatkowy tryb wysokiego kontrastu
- **Color blind support**: Optymalizacja dla daltonistów

### **Integracja z Firebase:**
- Zapisywanie preferencji motywu w profilu użytkownika
- Synchronizacja między urządzeniami
- Preferencje zespołowe dla organizacji

---

**PartyPass** - Nowoczesny tryb ciemny dla lepszego doświadczenia użytkownika! 🌙✨
