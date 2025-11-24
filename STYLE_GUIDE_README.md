# PartyPass - Przewodnik Stylu Aplikacji

## 📋 Przegląd

Ten przewodnik stylu zawiera kompleksowe wytyczne dla designu i implementacji komponentów w aplikacji PartyPass. Został stworzony, aby zapewnić spójność wizualną i funkcjonalną w całej aplikacji.

## 📁 Struktura Plików

```
STYLE_GUIDE.md                           # Główny przewodnik stylu
src/styles/globals/
├── _party-pass-variables.scss          # Zmienne CSS dla całej aplikacji
├── _party-pass-mixins.scss             # Mixins i utility classes
├── _variables.scss                     # Import głównych zmiennych
└── _index.scss                         # Import wszystkich stylów
```

## 🎯 Filozofia Designu

PartyPass stosuje **minimalistyczny, nowoczesny design** z naciskiem na:
- **Czystość i prostotę** interfejsu
- **Intuicyjność** użytkowania  
- **Spójność** wizualna w całej aplikacji
- **Responsywność** na wszystkich urządzeniach
- **Dostępność** dla wszystkich użytkowników

## 🚀 Jak Używać

### 1. Zmienne CSS
```scss
// Używaj zmiennych zamiast hardkodowanych wartości
.my-component {
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
}
```

### 2. Mixins
```scss
// Używaj mixinów dla spójnych komponentów
.my-button {
  @include pp-button-base;
  
  &--primary {
    background: var(--color-primary);
    color: var(--text-inverse);
  }
}
```

### 3. Utility Classes
```scss
// Używaj utility classes dla szybkiego stylowania
<div className="flex flex-center p-lg rounded-md shadow-sm">
  <button className="button button--primary">Kliknij</button>
</div>
```

## 📱 Responsywność

### Breakpoints
- **Mobile**: `max-width: 768px`
- **Tablet**: `769px - 1024px`  
- **Desktop**: `min-width: 1025px`

### Zasady
- **Mobile First**: Zawsze zaczynaj od mobile
- **Touch Friendly**: Minimalne rozmiary 44px dla elementów dotykowych
- **Czytelność**: Minimalne rozmiary fontów 14px na mobile

## 🎨 Kolory

### Podstawowe
- **Primary**: `#3b82f6` (niebieski)
- **Success**: `#10b981` (zielony)
- **Warning**: `#f59e0b` (pomarańczowy)
- **Error**: `#ef4444` (czerwony)
- **Info**: `#06b6d4` (cyjan)

### Tekst
- **Primary**: `#1f2937` (ciemny szary)
- **Secondary**: `#6b7280` (średni szary)
- **Tertiary**: `#9ca3af` (jasny szary)

## 📏 Spacing

System spacing oparty na jednostce bazowej **0.25rem (4px)**:

```scss
--space-xs: 0.25rem;    // 4px
--space-sm: 0.5rem;      // 8px  
--space-md: 0.75rem;     // 12px
--space-lg: 1rem;        // 16px
--space-xl: 1.25rem;     // 20px
--space-2xl: 1.5rem;     // 24px
--space-3xl: 2rem;       // 32px
--space-4xl: 2.5rem;     // 40px
--space-5xl: 3rem;       // 48px
--space-6xl: 4rem;       // 64px
```

## 🔤 Typografia

### Rozmiary Fontów
```scss
--text-xs: 0.75rem;     // 12px
--text-sm: 0.875rem;    // 14px
--text-base: 1rem;      // 16px
--text-lg: 1.125rem;    // 18px
--text-xl: 1.25rem;     // 20px
--text-2xl: 1.5rem;     // 24px
--text-3xl: 1.875rem;   // 30px
--text-4xl: 2.25rem;    // 36px
```

### Wagi Fontów
```scss
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## 🎭 Animacje

### Podstawowe Animacje
```scss
// Fade In
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

// Slide In
@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

// Scale In
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

### Zasady Animacji
- **Czas trwania**: 0.2s dla hover, 0.3s dla transitions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` dla płynnych animacji
- **Reduced Motion**: Zawsze dodawaj `@media (prefers-reduced-motion: reduce)`

## ♿ Dostępność

### Zasady Dostępności
- **Kontrast**: Minimalny kontrast 4.5:1 dla tekstu
- **Focus**: Zawsze widoczne focus states
- **Keyboard Navigation**: Wszystkie elementy dostępne z klawiatury
- **Screen Readers**: Proper ARIA labels i roles
- **Color Blind**: Nie polegaj tylko na kolorach

### Focus States
```scss
.focusable {
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
```

## 🌙 Tryb Ciemny

Aplikacja automatycznie obsługuje tryb ciemny poprzez `@media (prefers-color-scheme: dark)`:

```scss
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --text-primary: #f9fafb;
    --border-primary: #374151;
  }
}
```

## 📋 Checklist Implementacji

### Przed każdym nowym komponentem:
- [ ] Sprawdź czy używa standardowych kolorów
- [ ] Zastosuj odpowiednie spacing (0.25rem increments)
- [ ] Dodaj hover states
- [ ] Dodaj focus states
- [ ] Sprawdź responsywność
- [ ] Dodaj animacje (jeśli potrzebne)
- [ ] Sprawdź dostępność
- [ ] Przetestuj w trybie ciemnym

### Przed każdą zmianą stylu:
- [ ] Czy zmiana jest zgodna z przewodnikiem?
- [ ] Czy nie łamie spójności wizualnej?
- [ ] Czy działa na wszystkich urządzeniach?
- [ ] Czy jest dostępna dla wszystkich użytkowników?

## 🔧 Narzędzia i Workflow

### 1. Używanie Zmiennych
```scss
// ✅ DOBRZE
.component {
  color: var(--text-primary);
  padding: var(--space-lg);
}

// ❌ ŹLE
.component {
  color: #1f2937;
  padding: 16px;
}
```

### 2. Używanie Mixinów
```scss
// ✅ DOBRZE
.my-button {
  @include pp-button-base;
}

// ❌ ŹLE
.my-button {
  display: inline-flex;
  align-items: center;
  // ... duplikacja kodu
}
```

### 3. Responsywność
```scss
// ✅ DOBRZE
.component {
  padding: var(--space-md);
  
  @include pp-mobile {
    padding: var(--space-sm);
  }
}

// ❌ ŹLE
.component {
  padding: 12px;
  
  @media (max-width: 768px) {
    padding: 8px;
  }
}
```

## 📚 Przykłady Implementacji

### Minimalistyczny Dashboard Card
```scss
.dashboard-card {
  @include pp-card-base;
  
  &__title {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-sm);
  }
  
  &__content {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    line-height: 1.5;
  }
}
```

### Action Button Group
```scss
.action-group {
  display: flex;
  gap: var(--space-md);
  align-items: center;
  
  .button {
    flex: 1;
    min-width: 0;
  }
  
  .button--primary {
    flex: 2;
  }
}
```

## 🔄 Aktualizacje

Przewodnik stylu jest żywym dokumentem, który powinien być regularnie aktualizowany:

- **Wersja 1.0**: Pierwsza wersja przewodnika
- **Data**: $(date)
- **Autor**: PartyPass Team

### Jak Aktualizować
1. Zmiany w designie → Aktualizuj przewodnik
2. Nowe komponenty → Dodaj do przewodnika
3. Zmiany w zmiennych → Zaktualizuj dokumentację
4. Nowe zasady → Dodaj do checklist

## 📞 Wsparcie

Jeśli masz pytania dotyczące przewodnika stylu:

1. Sprawdź dokumentację w `STYLE_GUIDE.md`
2. Przejrzyj przykłady implementacji
3. Skonsultuj się z zespołem
4. Zgłoś problem lub sugestię

---

**Pamiętaj**: Spójność wizualna to klucz do sukcesu aplikacji. Zawsze stosuj się do tego przewodnika! 🚀












