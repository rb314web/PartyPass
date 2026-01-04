# Analiza Pozycji Przycisku Menu na Mobile - PartyPass

## 📋 Przegląd

Analiza pozycji i wyświetlania przycisku menu (`unified-header__menu-toggle`) na urządzeniach mobilnych w aplikacji PartyPass.

---

## 🎯 Lokalizacja Przycisku

### HTML Struktura
```html
<button class="unified-header__menu-toggle" aria-label="Otwórz menu" aria-expanded="false">
  <svg class="unified-header__menu-icon">
    <!-- Hamburger icon lines -->
  </svg>
</button>
```

### Pozycja w Komponencie
- **Komponent:** `UnifiedHeader.tsx`
- **Sekcja:** `unified-header__right` (prawa sekcja headera)
- **Warunek wyświetlania:** `!showMobileToggle && isMobile`
- **Warianty:** `landing`, `auth` (nie w `dashboard`)

---

## 📐 Pozycjonowanie CSS

### 1. Podstawowe Style (`.unified-header__menu-toggle`)

```scss
&__menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.2s ease;
  border-radius: 8px;
}
```

**Właściwości:**
- **Display:** `flex` - flexbox layout
- **Wymiary:** `44px × 44px` (standardowy rozmiar dotykowy)
- **Pozycja:** Wewnątrz `unified-header__right` (normal flow)
- **Tło:** `transparent` (domyślnie)

---

### 2. Grid Layout Headera

```scss
&__container {
  display: grid;
  grid-template-columns: auto 1fr auto;  // Desktop
  gap: 1.5rem;
  align-items: center;
  height: 100%;
}
```

**Struktura Grid:**
- **Kolumna 1:** `auto` - Logo (`unified-header__left`)
- **Kolumna 2:** `1fr` - Navigation/Greeting (`unified-header__nav`)
- **Kolumna 3:** `auto` - Actions (`unified-header__right`) ← **Tutaj jest przycisk menu**

---

### 3. Responsive Layout (Mobile)

#### Landing Variant - Mobile (< 768px)

```scss
&--landing {
  @include respond-below('tablet') {
    .unified-header__container {
      grid-template-columns: auto 1fr;  // 2 kolumny zamiast 3
      justify-content: space-between;
    }

    .unified-header__right {
      width: auto;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .unified-header__menu-toggle {
      margin-left: 0;
    }
  }
}
```

**Zmiany na mobile:**
- **Grid:** `auto 1fr` (logo + reszta)
- **Right section:** `justify-content: flex-end` - przycisk menu po prawej stronie
- **Gap:** `0.5rem` między elementami w `__right`

---

## 📱 Wyświetlanie na Mobile

### Warunki Wyświetlania

1. **JavaScript (UnifiedHeader.tsx):**
   ```typescript
   {!showMobileToggle && isMobile && (
     <button className="unified-header__menu-toggle">
       <AnimatedMenuIcon isOpen={isMenuOpen} />
     </button>
   )}
   ```

2. **CSS (UnifiedHeader.scss):**
   - Przycisk jest zawsze widoczny w `__right` na mobile
   - Nie ma `display: none` dla `menu-toggle` na mobile
   - Ukrywane są tylko linki nawigacyjne (`display: none` dla `__nav`)

---

## 🎨 Style Specyficzne dla Landing (Mobile)

```scss
&--landing {
  .unified-header__menu-toggle {
    color: rgba(0, 0, 0, 0.7);
    border-radius: 6px;

    @include respond-below('tablet') {
      background: rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.1);
      color: rgba(0, 0, 0, 0.8);

      @media (prefers-color-scheme: dark) {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}
```

**Style na mobile (landing):**
- **Tło:** `rgba(0, 0, 0, 0.05)` (jasny tryb)
- **Obramowanie:** `1px solid rgba(0, 0, 0, 0.1)`
- **Kolor:** `rgba(0, 0, 0, 0.8)`
- **Border-radius:** `6px`

---

## 🔍 Aktualna Pozycja

### Desktop (> 768px)
- **Pozycja:** W `unified-header__right` (prawa sekcja)
- **Grid:** Kolumna 3 (`auto`)
- **Widoczność:** Ukryty (linki nawigacyjne są widoczne)

### Mobile (≤ 768px)
- **Pozycja:** W `unified-header__right` (prawa sekcja)
- **Grid:** Kolumna 2 (`1fr` - razem z logo)
- **Layout:** `justify-content: flex-end` - przycisk po prawej stronie
- **Widoczność:** Widoczny (linki nawigacyjne ukryte)

---

## 📊 Hierarchia Elementów na Mobile

```
unified-header (sticky, top: 0)
└── unified-header__container (grid: auto 1fr)
    ├── unified-header__left (auto)
    │   └── Logo
    │
    └── unified-header__right (1fr, justify-content: flex-end)
        ├── ThemeToggle (ukryty na mobile)
        └── unified-header__menu-toggle (widoczny)
```

---

## ⚠️ Potencjalne Problemy

### 1. Pozycja w Grid
- **Problem:** Przycisk jest w `__right`, który na mobile zajmuje `1fr` (całą dostępną przestrzeń)
- **Efekt:** Przycisk może być zbyt daleko od prawej krawędzi
- **Rozwiązanie:** Użyć `justify-content: flex-end` (już zastosowane)

### 2. Z-index
- **Aktualny:** Brak explicit `z-index` dla `menu-toggle`
- **Potencjalny problem:** Może być zakryty przez inne elementy
- **Rekomendacja:** Dodać `z-index` jeśli potrzebne

### 3. Odstęp od Krawędzi
- **Aktualny:** Brak explicit `margin-right` lub `padding-right`
- **Efekt:** Przycisk może być zbyt blisko prawej krawędzi ekranu
- **Rekomendacja:** Sprawdzić padding kontenera

---

## ✅ Rekomendacje

### 1. Upewnić się, że przycisk jest widoczny
```scss
&__menu-toggle {
  @include respond-below('tablet') {
    display: flex !important;  // Jeśli potrzebne
  }
}
```

### 2. Dodać odpowiedni odstęp
```scss
&__right {
  @include respond-below('tablet') {
    padding-right: var(--space-sm);  // Odstęp od prawej krawędzi
  }
}
```

### 3. Zapewnić odpowiedni z-index
```scss
&__menu-toggle {
  @include respond-below('tablet') {
    z-index: calc(var(--z-header) + 1);
  }
}
```

---

## 🎯 Podsumowanie

### Aktualna Pozycja:
- **Desktop:** Ukryty (w `__right`, ale linki nawigacyjne widoczne)
- **Mobile:** Widoczny w prawej sekcji headera (`__right`)
- **Layout:** Flexbox w `__right` z `justify-content: flex-end`
- **Grid:** Kolumna 2 na mobile (razem z logo)

### Status:
✅ Przycisk jest poprawnie pozycjonowany w `__right` sekcji
✅ Wyświetla się tylko na mobile (gdy `isMobile && !showMobileToggle`)
✅ Ma odpowiednie style dla landing variant
⚠️ Może wymagać dodatkowego odstępu od prawej krawędzi

---

*Dokument wygenerowany: ${new Date().toLocaleDateString('pl-PL')}*











