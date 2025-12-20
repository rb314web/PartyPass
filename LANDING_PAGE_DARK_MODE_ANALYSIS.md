# Analiza strony głównej (Landing Page) w trybie ciemnym

## 📊 Status ogólny

**Data analizy:** 2025-12-17  
**Status:** ⚠️ Częściowo zaimplementowany - wymaga poprawy spójności

---

## 1. Struktura strony głównej

Strona główna składa się z następujących sekcji:
1. **Header** - nawigacja z logo i przyciskami
2. **Hero** - główna sekcja z CTA i kartami wydarzeń
3. **Features** - sekcja z funkcjami
4. **PricingPlans** - sekcja z planami cenowymi
5. **ContactSection** - sekcja kontaktowa
6. **Footer** - stopka

---

## 2. Analiza komponentów

### 2.1 Header ✅ (POPRAWIONE)

**Status:** ✅ Używa zmiennych CSS

**Dark mode:**
- Używa `color-mix(in srgb, var(--bg-primary) 75%, transparent)` zamiast hardcoded granatowych kolorów
- Wszystkie kolory używają zmiennych CSS

---

### 2.2 Hero ⚠️ (WYMAGA POPRAWY)

**Status:** ⚠️ Ma hardcoded kolory w dark mode

**Problemy:**

#### Tryb jasny:
```scss
background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #7c3aed 100%);
```
- ❌ Hardcoded fioletowe kolory zamiast zmiennych CSS

#### Dark mode:
```scss
@media (prefers-color-scheme: dark) {
  .hero {
    background:
      radial-gradient(ellipse 800px 600px at 50% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
      linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 50%, var(--bg-secondary) 100%);
    
    &::before {
      background:
        radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(139, 122, 184, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
    }
  }
}
```

**Lokalizacja:** Linie 11, 541, 551, 556  
**Problem:** Używa hardcoded granatowych/fioletowych kolorów w gradientach  
**Rozwiązanie:** Zastąpić `rgba(99, 102, 241, ...)` na `var(--color-primary-light)` lub usunąć gradienty w dark mode

**Karty wydarzeń:**
- ✅ Używają `var(--bg-primary)` w dark mode
- ✅ Nie mają borderów i cieni (zgodnie z ostatnimi zmianami)

**Progress bar:**
- ⚠️ Używa `var(--color-primary)` - do sprawdzenia, czy nie ma hardcoded kolorów

---

### 2.3 Features ⚠️ (WYMAGA POPRAWY)

**Status:** ⚠️ Ma hardcoded kolory

**Problemy:**

```scss
&::before {
  background:
    radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(79, 172, 254, 0.08) 0%, transparent 50%);
}

&__icon {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05));
}
```

**Lokalizacja:** Linie 20, 25, 130-131  
**Problem:** Używa hardcoded granatowych kolorów  
**Rozwiązanie:** Zastąpić na `var(--color-primary-light)` lub usunąć w dark mode

**Karty:**
- ✅ Używają `var(--bg-primary)` i `var(--bg-secondary)`
- ⚠️ Mają `border: 2px solid var(--border-primary)` i `box-shadow: var(--shadow-sm)` - zgodnie z ostatnimi zmianami, może trzeba usunąć

**Brak dark mode:**
- ❌ Nie ma sekcji `@media (prefers-color-scheme: dark)` dla Features

---

### 2.4 PricingPlans ⚠️ (WYMAGA POPRAWY)

**Status:** ⚠️ Ma hardcoded cienie i kolory

**Problemy:**

```scss
&::before {
  background:
    radial-gradient(circle at 0% 0%, rgba(var(--primary-rgb), 0.08) 0%, transparent 50%),
    // ...
}
```

**Lokalizacja:** Linie 21, 26, 31  
**Problem:** Używa `var(--primary-rgb)` - nieistniejąca zmienna  
**Rozwiązanie:** Zastąpić na `var(--color-primary-light)` lub usunąć

**Cienie:**
```scss
box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
box-shadow: 0 3px 8px rgba(99, 102, 241, 0.3);
```

**Lokalizacja:** Linie 214, 233, 323, 326  
**Problem:** Hardcoded granatowe cienie  
**Rozwiązanie:** Zastąpić na `var(--shadow-md)`, `var(--shadow-lg)`

**Brak dark mode:**
- ❌ Nie ma sekcji `@media (prefers-color-scheme: dark)` dla PricingPlans

---

### 2.5 ContactSection ✅ (SPRAWDZONE)

**Status:** ✅ Używa zmiennych CSS

**Dark mode:**
- Używa `var(--bg-primary)`, `var(--bg-secondary)`, `var(--bg-tertiary)`
- Wszystkie kolory używają zmiennych CSS
- Formularz używa `var(--bg-primary)` i `var(--border-primary)`

**Uwaga:** Formularz ma `border: 2px solid var(--border-primary)` i `box-shadow: var(--shadow-lg)` - może trzeba usunąć zgodnie z ostatnimi zmianami

---

### 2.6 Footer ✅ (POPRAWIONE)

**Status:** ✅ Używa zmiennych CSS

**Dark mode:**
- Wszystkie kolory używają zmiennych CSS
- Neutralne szarości

---

## 3. Problemy znalezione

### 3.1 Hardcoded kolory granatowe/fioletowe

**Znalezione w:**

1. **Hero** (`src/components/landing/Hero/Hero.scss`)
   - Tryb jasny: `#6366f1`, `#8b5cf6`, `#7c3aed` (linia 11)
   - Dark mode: `rgba(99, 102, 241, ...)`, `rgba(139, 122, 184, ...)` (linie 541, 551, 556)

2. **Features** (`src/components/landing/Features/Features.scss`)
   - `rgba(99, 102, 241, 0.05)` (linia 20)
   - `rgba(79, 172, 254, 0.08)` (linia 25)
   - `rgba(99, 102, 241, 0.1)`, `rgba(99, 102, 241, 0.05)` (linie 130-131)

3. **PricingPlans** (`src/components/landing/PricingPlans/PricingPlans.scss`)
   - `rgba(var(--primary-rgb), ...)` - nieistniejąca zmienna (linie 21, 26, 31)
   - `rgba(99, 102, 241, 0.4)`, `rgba(99, 102, 241, 0.3)` w cieniach (linie 214, 233, 323, 326)

### 3.2 Brak dark mode

**Komponenty bez dark mode:**
- ❌ Features - brak sekcji `@media (prefers-color-scheme: dark)`
- ❌ PricingPlans - brak sekcji `@media (prefers-color-scheme: dark)`

### 3.3 Niespójne użycie borderów i cieni

**Komponenty z borderami/cieniami:**
- Features cards: `border: 2px solid var(--border-primary)`, `box-shadow: var(--shadow-sm)`
- ContactSection form: `border: 2px solid var(--border-primary)`, `box-shadow: var(--shadow-lg)`

**Uwaga:** Zgodnie z ostatnimi zmianami, użytkownik chce usunąć bordery i cienie z sekcji. Może trzeba to zastosować również do kart Features i formularza ContactSection.

---

## 4. Rekomendacje

### 4.1 Priorytet WYSOKI

1. **Hero** - zastąpić hardcoded kolory w dark mode na neutralne szarości lub usunąć gradienty
2. **Features** - dodać dark mode i zastąpić hardcoded kolory
3. **PricingPlans** - dodać dark mode i zastąpić hardcoded cienie na zmienne CSS

### 4.2 Priorytet ŚREDNI

1. **Features cards** - rozważyć usunięcie borderów i cieni (zgodnie z ostatnimi zmianami)
2. **ContactSection form** - rozważyć usunięcie borderów i cieni
3. **Hero tryb jasny** - zastąpić hardcoded gradient na zmienne CSS

### 4.3 Priorytet NISKI

1. **Dokumentacja** - stworzyć guide dla landing page components
2. **Testy** - dodać testy wizualne dla landing page w dark mode

---

## 5. Checklist poprawy dark mode

### Komponenty landing page
- [x] Header - używa zmiennych CSS, neutralne szarości ✅
- [x] Footer - używa zmiennych CSS, neutralne szarości ✅
- [x] Hero - ✅ NAPRAWIONE (usunięte hardcoded kolory w dark mode, poprawiony progress bar)
- [x] Features - ✅ NAPRAWIONE (dodany dark mode, usunięte hardcoded kolory, usunięte bordery/cienie)
- [x] PricingPlans - ✅ NAPRAWIONE (dodany dark mode, zastąpione hardcoded cienie, poprawione zmienne)
- [x] ContactSection - używa zmiennych CSS ✅

---

## 6. Podsumowanie

### ✅ Co działa dobrze:
1. Header i Footer używają zmiennych CSS i neutralnych szarości
2. ContactSection używa zmiennych CSS
3. Hero karty wydarzeń używają zmiennych CSS w dark mode

### ✅ Co zostało naprawione (2025-12-17):
1. **Hero dark mode** - ✅ Usunięte hardcoded kolory (`rgba(99, 102, 241, ...)`, `rgba(139, 122, 184, ...)`), usunięte gradienty w `::before`
2. **Hero progress bar** - ✅ Zastąpione `var(--primary)` i `var(--gray-200)` na `var(--color-primary)` i `var(--bg-tertiary)`
3. **Features** - ✅ Dodany dark mode, usunięte hardcoded kolory, usunięte bordery i cienie z kart
4. **PricingPlans** - ✅ Dodany dark mode, zastąpione hardcoded cienie na `var(--shadow-md)` i `var(--shadow-lg)`, poprawione zmienne (`var(--primary)` → `var(--color-primary)`)
5. **Features icons** - ✅ Zastąpione hardcoded kolory na `var(--color-primary-light)`

### ⚠️ Co może wymagać jeszcze uwagi:
1. **Hero tryb jasny** - hardcoded gradient (`#6366f1`, `#8b5cf6`, `#7c3aed`) - niski priorytet, może zostać jako akcent kolorowy
2. **ContactSection form** - ma bordery i cienie - rozważyć usunięcie zgodnie z ostatnimi zmianami

---

## 7. Przykłady poprawnego użycia

### ✅ DOBRY przykład (Hero dark mode):
```scss
@media (prefers-color-scheme: dark) {
  .hero {
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 50%, var(--bg-secondary) 100%);
    // Bez kolorowych gradientów
  }
}
```

### ❌ ZŁY przykład:
```scss
@media (prefers-color-scheme: dark) {
  .hero {
    background: radial-gradient(ellipse 800px 600px at 50% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 50%);
    // Hardcoded granatowy kolor
  }
}
```

---

**Ostatnia aktualizacja:** 2025-12-17
