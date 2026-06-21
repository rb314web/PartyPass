# PartyPass - Przewodnik Stylu Aplikacji

## 🎨 Filozofia Designu

PartyPass stosuje **minimalistyczny, nowoczesny design** z naciskiem na:
- **Czystość i prostotę** interfejsu
- **Intuicyjność** użytkowania
- **Spójność** wizualna w całej aplikacji
- **Responsywność** na wszystkich urządzeniach
- **Dostępność** dla wszystkich użytkowników

---

## 🎯 Zasady Ogólne

### Kolory
- **Podstawowy**: `#6366f1` (indigo) — token `--color-primary`
- **Sukces**: `#10b981` (zielony)
- **Ostrzeżenie**: `#f59e0b` (pomarańczowy)
- **Błąd**: `#ef4444` (czerwony)
- **Informacja**: `#06b6d4` (cyjan)

### System komponentów UI (2026)

Ujednolicone klasy globalne w `src/styles/globals/`:

| System | Klasy / komponent | Zastosowanie |
|--------|-------------------|--------------|
| Przyciski | `pp-btn`, `pp-btn--primary`, `--outline`, `--danger`, `--sm`, `--lg`, `--block` | CTA, akcje formularzy |
| Formularze | `pp-field`, `pp-label`, `pp-input`, `pp-textarea`, `pp-select`, `pp-field-error`, `pp-form-alert` | Pola i walidacja |
| Badge | `pp-badge`, `pp-badge--success`, `--warning`, `--error`, `--info`, `--neutral` | Statusy, liczniki |
| Modale | komponent `Modal` (`src/components/common/Modal/`) | Dialogi, pickery |
| Nagłówki | komponent `PageHeader` | Tytuł widoku dashboardu |
| Pusty stan | komponent `EmptyState` | Brak danych na listach |
| Feedback | `Toast` + hook `useToast()` | Komunikaty zamiast `alert()` / `useSnackbar` |
| Plany | `src/constants/plans.ts` | Katalog planów (landing, rejestracja, ustawienia) |

Limity techniczne planów pozostają w `src/services/firebase/planLimitsService.ts` (`PLAN_LIMITS`).

### Zmigrowane obszary (2026)

- **Auth:** Login, Register, ForgotPassword
- **Dashboard:** Events, Guests, Contacts, Analytics, Activities, Settings, Search, ContactUs, DashboardHome
- **Modale:** kontakty, goście, wydarzenia, RSVP, QR, zaproszenia, ustawienia wyglądu, skróty klawiszowe
- **Formularze wydarzeń:** CreateEvent, EditEvent, AddEvent
- **Strony prawne:** `/terms`, `/privacy`, `/rodo` (`LegalPage`)
- **Landing:** PricingPlans korzysta z `constants/plans.ts`

**MUI usunięte** (czerwiec 2026): brak `@mui/*`, `notistack`, `MaterialUIProvider`. Kalendarz na dashboardzie: `CompactCalendar` (własny). Potwierdzenia: `Modal` zamiast `window.confirm`.

Przy nowych ekranach preferuj `pp-*` + `Modal` + `useToast()` zamiast MUI Dialog / `alert()`.

### Typografia
- **Główny font**: System fonts (Inter, -apple-system, BlinkMacSystemFont)
- **Rozmiary**: 0.75rem, 0.875rem, 1rem, 1.125rem, 1.25rem, 1.5rem, 1.875rem, 2.25rem
- **Wagi**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- **Jednostka bazowa**: 0.25rem (4px)
- **Skala**: 0.25rem, 0.5rem, 0.75rem, 1rem, 1.25rem, 1.5rem, 2rem, 2.5rem, 3rem, 4rem

### Border Radius
- **Małe**: 0.25rem (4px)
- **Średnie**: 0.5rem (8px)
- **Duże**: 0.75rem (12px)
- **Okrągłe**: 50% (dla przycisków okrągłych)

---

## 🧩 Komponenty

### 1. Przyciski (Buttons)

#### Podstawowy Przycisk
```scss
.button {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
}
```

#### Przycisk Podstawowy (Primary)
Użyj `pp-btn pp-btn--primary` — szczegóły w `_buttons.scss`.

#### Przycisk Sukces
```scss
.button--success {
  background: #10b981;
  color: white;
  border-color: #10b981;

  &:hover {
    background: #059669;
    border-color: #059669;
  }
}
```

### 2. Karty (Cards)

```scss
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
}
```

### 3. Floating Action Button (FAB)

```scss
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;

  &__main {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    background: #3b82f6;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: #2563eb;
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    &--open {
      background: #ef4444;
      transform: rotate(45deg);

      &:hover {
        background: #dc2626;
      }
    }
  }

  &__action {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 2rem;
    color: #1f2937;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
    animation: fabActionSlideIn 0.3s ease forwards;

    &:hover {
      transform: translateX(-5px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}
```

### 4. Formularze (Forms)

#### Input
```scss
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #1f2937;
  background: #ffffff;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
}
```

#### Label
```scss
.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}
```

### 5. Nawigacja (Navigation)

#### Sidebar
```scss
.sidebar {
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #6b7280;
  text-decoration: none;
  border-radius: 0.5rem;
  margin: 0.25rem 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  &--active {
    background: #eff6ff;
    color: #3b82f6;
    font-weight: 500;
  }
}
```

### 6. Header

```scss
.header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

---

## 📱 Responsywność

### Breakpoints
```scss
// Mobile
@media (max-width: 768px) {
  // Style dla mobile
}

// Tablet
@media (min-width: 769px) and (max-width: 1024px) {
  // Style dla tablet
}

// Desktop
@media (min-width: 1025px) {
  // Style dla desktop
}
```

### Zasady Responsywne
- **Mobile First**: Zawsze zaczynaj od mobile
- **Touch Friendly**: Minimalne rozmiary 44px dla elementów dotykowych
- **Czytelność**: Minimalne rozmiary fontów 14px na mobile
- **Spacing**: Zmniejsz padding/margin na mniejszych ekranach

---

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

---

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
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
}
```

---

## 🌙 Tryb Ciemny

### Zmienne CSS dla Dark Mode
```scss
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --bg-secondary: #1f2937;
    --text-primary: #f9fafb;
    --text-secondary: #d1d5db;
    --border-color: #374151;
  }
}
```

---

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

---

## 🚀 Przykłady Implementacji

### Minimalistyczny Dashboard Card
```scss
.dashboard-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  &__content {
    color: #6b7280;
    font-size: 0.875rem;
    line-height: 1.5;
  }
}
```

### Action Button Group
```scss
.action-group {
  display: flex;
  gap: 0.75rem;
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

---

## 📝 Notatki

- **Zawsze używaj zmiennych CSS** dla kolorów i spacing
- **Testuj na różnych urządzeniach** przed wdrożeniem
- **Dokumentuj niestandardowe komponenty** w tym przewodniku
- **Regularnie aktualizuj** przewodnik przy zmianach designu
- **Konsultuj zmiany** z zespołem przed implementacją

---

*Ostatnia aktualizacja: czerwiec 2026*
*Wersja: 1.1*

