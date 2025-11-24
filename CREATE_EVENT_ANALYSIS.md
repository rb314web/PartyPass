# 📋 Analiza Wyglądu: Strona Tworzenia Wydarzenia (/dashboard/events/create)

> **Data**: 2025-01-13  
> **URL**: http://localhost:3000/dashboard/events/create  
> **Komponent**: `src/components/dashboard/Events/CreateEvent/CreateEvent.tsx`  
> **Plik stylów**: `src/components/dashboard/Events/CreateEvent/CreateEvent.scss` (726 linii)  
> **Status**: ✅ Production-Ready

---

## 📐 Layout Ogólny

### Struktura Strony
```
┌─────────────────────────────────────────┐
│ ← Wróć | Nowe wydarzenie                │
├─────────────────────────────────────────┤
│ Kroki: [1] → [2] → [3]                  │
├─────────────────────────────────────────┤
│                                         │
│  ╔═══════════════════════════════════╗  │
│  ║  [Step 1/2/3] Zawartość Kroku    ║  │
│  ║                                   ║  │
│  ║  Pole 1        Pole 2             ║  │
│  ║                                   ║  │
│  ║  Pole 3                           ║  │
│  ║                                   ║  │
│  ╚═══════════════════════════════════╝  │
│                                         │
│  [← Wróć]                  [Dalej →]    │
│                                         │
└─────────────────────────────────────────┘
```

### Wymiary
- **Max-width**: 800px (container)
- **Padding**: 2rem (desktop), 1rem (tablet), 0.5rem (mobile)
- **Min-height**: 100vh
- **Background**: `var(--bg-secondary)` (jasnoszary)

---

## 🎯 Komponenty Główne

### 1. **Header Sekcji**
```tsx
// Location: Górna część
// Klasy: .create-event__header
```

| Element | Style | Uwagi |
|---------|-------|-------|
| **Back Button** | Transparent button z ikoną | `<ArrowLeft>` lucide-react |
| **Title** | `font-size: var(--text-3xl)` | "Nowe wydarzenie" |
| **Font Weight** | `var(--font-bold)` | ~700 |
| **Color** | `var(--text-primary)` | Czarny/biały (dark mode) |

**Zachowanie:**
- Back button: `color: var(--text-secondary)` → hover: `var(--text-primary)`
- Focus state: `outline: 2px solid var(--primary)` + `outline-offset: 2px`

---

### 2. **Progress Steps (Kroki)**
```
┌──────┐  ─── Linia ───  ┌──────┐  ─── Linia ───  ┌──────┐
│  1   │                 │  2   │                 │  3   │
│ Info │                 │ Data │                 │ Goście
└──────┘                 └──────┘                 └──────┘
```

**Struktura:**
```tsx
.create-event__progress {
  display: flex;
  padding: var(--space-lg); // 1rem
  background: white;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl); // 0.75rem
}

.create-event__progress-step {
  display: flex;
  align-items: center;
  gap: var(--space-md); // 0.75rem
  flex: 1;
}

.create-event__progress-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gray-200);
}

.create-event__progress-line {
  flex: 1;
  height: 2px;
  background: var(--gray-200);
  margin: 0 var(--space-lg);
}
```

**Stany Ikony:**

| Stan | Icon BG | Icon Color | Border/Shadow |
|------|---------|-----------|--------------|
| **Inactive** | `var(--gray-200)` | `var(--gray-500)` | Brak |
| **Active** | `var(--primary)` | white | `0 0 0 3px rgba(99,102,241,0.2)` |
| **Completed** | `var(--success)` | white | Brak |

**Responsive:**
- **Desktop**: Flex horizontal (5 kolumn: icon + content + line + icon + content...)
- **Tablet-lg (1024px)**: Zmniejszone gap
- **Mobile (< 640px)**: Flex vertical (stack), brak linii

---

### 3. **Form Content Container**
```tsx
.create-event__content {
  background: white;
  border-radius: var(--radius-xl); // 0.75rem
  border: 1px solid var(--border-primary);
  padding: var(--space-2xl); // 2rem
  margin-bottom: var(--space-xl); // 1.5rem
}
```

**Responsive Padding:**
- Desktop: `2rem`
- Tablet (768px): `1.5rem`
- Mobile (640px): `1rem`
- Small Mobile (480px): `0.75rem`

---

### 4. **Pola Formularza**

#### **Input/Textarea**
```scss
.create-event__input,
.create-event__textarea {
  width: 100%;
  padding: var(--space-md); // 0.75rem
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md); // 0.375rem
  font-size: var(--text-base); // 1rem
  transition: all 0.3s ease;
  background: white;
}

&:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

&--error {
  border-color: var(--error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
```

**Textarea:**
- `min-height: 100px`
- `resize: vertical` (użytkownik może zmienić wysokość)
- `line-height: var(--leading-relaxed)` (~1.625)

#### **Field Group Layout**
```scss
.create-event__field-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg); // 1.25rem
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}
```

**Krok 2 (Data i Miejsce):**
```
┌──────────────────┬──────────────────┐
│ Data             │ Godzina          │
└──────────────────┴──────────────────┘
┌────────────────────────────────────┐
│ Lokalizacja                        │
└────────────────────────────────────┘
```

#### **Labels**
```scss
.create-event__label {
  display: flex;
  align-items: center;
  gap: var(--space-sm); // 0.5rem
  font-weight: var(--font-semibold); // ~600
  color: var(--text-primary);
  margin-bottom: var(--space-md); // 0.75rem
  font-size: var(--text-sm); // 0.875rem
}
```

**Struktura Labels:**
```
[Icon] Nazwa Pola *
Asterisk (*) = wymagane
```

---

### 5. **Tags System**

#### **Tags Container**
```scss
.create-event__tags-input {
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--space-md); // 0.75rem
  background: white;
  
  &:focus-within {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
}
```

#### **Individual Tag**
```scss
.create-event__tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm); // 0.5rem
  background: var(--primary-100); // Jasny niebieski
  color: var(--primary-700); // Ciemny niebieski
  padding: var(--space-xs) var(--space-sm); // 0.25rem 0.5rem
  border-radius: var(--radius-full); // 9999px (pill shape)
  font-size: var(--text-sm); // 0.875rem
  font-weight: var(--font-medium); // ~500
}
```

**Tag Remove Button:**
```scss
.create-event__tag-remove {
  background: transparent;
  border: none;
  color: var(--primary-600);
  cursor: pointer;
  border-radius: 50%;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--error); // Zmienia na czerwony
  }
}
```

#### **Add Tag Input**
```scss
.create-event__add-tag {
  display: flex;
  gap: var(--space-sm); // 0.5rem
}

.create-event__tag-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: var(--text-sm);
  padding: var(--space-sm) 0;
}

.create-event__add-tag-btn {
  width: 32px;
  height: 32px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background: var(--primary-dark);
  }
  
  &:disabled {
    background: var(--gray-300);
    cursor: not-allowed;
  }
}
```

---

### 6. **Options (Checkboxes)**

```scss
.create-event__option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md); // 0.75rem
  cursor: pointer;
  padding: var(--space-lg); // 1rem
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg); // 0.5rem
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-300);
    background: var(--primary-50);
  }
}

.create-event__option-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--gray-300);
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
  
  &::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    transition: all 0.2s ease;
  }
}

input:checked + .create-event__option-custom {
  background: var(--primary);
  border-color: var(--primary);
  
  &::after {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
```

**Layout Opcji:**
```
┌────────────────────────────────────┐
│ ☑ Wymagaj potwierdzenia            │
│   Goście będą musieli potwierdzić  │
│   lub odrzucić zaproszenie         │
└────────────────────────────────────┘
```

---

### 7. **Preview Box**

```scss
.create-event__preview {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg); // 1rem
  margin-top: var(--space-lg);
  
  h4 {
    margin: 0 0 var(--space-md) 0;
    color: var(--text-primary);
    font-size: var(--text-lg); // 1.125rem
  }
}

.create-event__preview-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm); // 0.5rem
}

.create-event__preview-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm); // 0.5rem
  color: var(--text-secondary);
  font-size: var(--text-sm); // 0.875rem
}
```

**Konten Preview:**
```
Podgląd
📅 poniedziałek, 15 stycznia 2025
🕐 14:30
📍 Sala konferencyjna A
```

---

## 🎨 Kolory i Style

### Paleta Kolorów
| Element | Kolor | Zmienną |
|---------|-------|---------|
| **Primary** | Niebieski | `var(--primary)` |
| **Primary Dark** | Ciemny niebieski | `var(--primary-dark)` |
| **Primary 50** | Bardzo jasny | `var(--primary-50)` |
| **Primary 100** | Jasny | `var(--primary-100)` |
| **Error** | Czerwony | `var(--error)` |
| **Success** | Zielony | `var(--success)` |
| **Text Primary** | Czarny/biały | `var(--text-primary)` |
| **Text Secondary** | Szary | `var(--text-secondary)` |
| **Border** | Jasnoszary | `var(--border-primary)` |
| **BG Secondary** | Bardzo jasny szary | `var(--bg-secondary)` |

### Focus States
- Outline: `2px solid var(--primary)`
- Outline offset: `2px`
- Box shadow: `0 0 0 3px rgba(99, 102, 241, 0.1)`

---

## 📱 Responsive Design

### Breakpoints

| Urządzenie | Width | Zmiany |
|-----------|-------|--------|
| **Desktop** | 800px+ | Pełny layout |
| **Tablet** | 768px | Padding reducir |
| **Mobile-lg** | 480px | Steps vertical |
| **Mobile-sm** | < 480px | Full width |

### Mobile Adjustments

**< 768px (Tablet):**
```scss
- Padding content: 1.5rem (zamiast 2rem)
- Border-radius: var(--radius-lg) (zamiast xl)
```

**< 640px (Mobile):**
```scss
- Steps: Flex vertical (stack)
- Padding content: 1rem
- Progress lines: Ukryte
- Field group: Single column
```

**< 480px (Small Mobile):**
```scss
- Padding container: 0.5rem
- Padding content: 0.75rem
- Border-radius: var(--radius-md)
```

---

## ⌨️ Klawisz + Gesty

### Keyboard Navigation
- **Tab**: Nawigacja między polami
- **Shift+Tab**: Wstecz
- **Enter**: Na tagach - dodaj tag
- **Escape**: Zamknij (jeśli modals)

### Focus Traps
- Labels mają `for` attribute
- Wszystkie inputy mają ID
- Custom checkbox fokusable

---

## 🔢 Kroki Formularza

### **Krok 1: Podstawowe Informacje**
```
┌─────────────────────────────────┐
│ [TextInput] Tytuł *             │
│                                 │
│ [TextArea] Opis *               │
│ (Min 10, Max 1000 znaków)       │
│                                 │
│ [TagInput] Tagi (opcjonalne)    │
│ Dodaj tag...                    │
│                                 │
│ Tagi pomogą w organizacji...   │
└─────────────────────────────────┘
```

**Validacja:**
- Tytuł: `required`, `max: 100`
- Opis: `required`, `min: 10`, `max: 1000`
- Tagi: `max: 10`, `unique`

---

### **Krok 2: Data i Miejsce**
```
┌──────────────────┬──────────────┐
│ [DateInput]      │ [TimeInput]   │
│ Data *           │ Godzina *     │
└──────────────────┴──────────────┘

┌────────────────────────────────┐
│ [LocationPicker]               │
│ Lokalizacja *                  │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Podgląd:                       │
│ 📅 poniedziałek, 15 stycznia   │
│ 🕐 14:30                       │
│ 📍 Sala konferencyjna A        │
└────────────────────────────────┘
```

**Validacja:**
- Data: `required`, `min: today`, `max: +10 lat`
- Czas: `required`, format `HH:MM`
- Lokalizacja: `required`, `max: 200`

---

### **Krok 3: Goście i Ustawienia**
```
┌─────────────────────────────────┐
│ [NumberInput] Maks gości *      │
│ Twój plan pozwala na max 50     │
│                                 │
│ ☑ Wymagaj potwierdzenia         │
│ ☑ Pozwól +1                     │
│ ☑ Wyślij przypomnienia          │
│                                 │
│ [TextInput] Dress code (opt)    │
│                                 │
│ [TextArea] Dodatkowe info (opt) │
└─────────────────────────────────┘
```

**Validacja:**
- Max gości: `required`, `min: 1`, `max: [based on plan]`
- Dress code: `max: 100`
- Info: `max: 500`

---

## 🔘 Przyciski Akcji

### **Bottom Action Buttons**
```scss
.create-event__actions {
  display: flex;
  justify-content: space-between;
  padding: var(--space-lg);
  border-top: 1px solid var(--border-primary);
  gap: var(--space-md);
}

.create-event__button {
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-event__button--primary {
  background: var(--primary);
  color: white;
  
  &:hover {
    background: var(--primary-dark);
  }
}

.create-event__button--secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  
  &:hover {
    background: var(--gray-100);
  }
}
```

**Dostępne Przyciski:**
- `← Wróć` (Secondary button na krokach > 1)
- `Dalej →` (Primary button)
- `Zapisz Wydarzenie` (Primary button na ostatnim kroku)

---

## ✅ Validacja i Błędy

### **Error Display**
```scss
.create-event__error {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--error);
  font-size: var(--text-sm);
  margin-top: var(--space-sm);
  
  &::before {
    content: '⚠';
  }
}
```

**Obsługiwane Błędy:**
1. `Tytuł jest wymagany`
2. `Opis musi mieć conajmniej 10 znaków`
3. `Data jest wymagana`
4. `Godzina jest wymagana`
5. `Lokalizacja jest wymagana`
6. `Maks gości musi być > 0`
7. `Data nie może być w przeszłości`

### **Field-Level Validation**
- Real-time na niektórych polach
- Visual feedback (red border)
- Error message poniżej pola

---

## 📊 Typografia

| Element | Font-size | Font-weight | Line-height |
|---------|-----------|------------|------------|
| **Page Title** | 1.875rem | 700 (bold) | - |
| **Label** | 0.875rem | 600 (semi) | - |
| **Input** | 1rem | 400 | - |
| **Helper Text** | 0.875rem | 400 | 1.625 |
| **Error** | 0.875rem | 400 | - |
| **Char Count** | 0.75rem | 400 | - |

---

## 🎯 Mocne Strony Designu

### ✅ Pozytywne Aspekty:

1. **Clear Step Progression**
   - Wizualna reprezentacja kroku
   - Icons + labels
   - Progress tracking

2. **Responsive Layout**
   - Dobrze skaluje na mobile
   - 2-kolumnowy grid zmienia się na 1
   - Touch-friendly spacing

3. **Visual Feedback**
   - Focus states jasne
   - Error states widoczne
   - Hover effects helpful

4. **Accessibility**
   - Labels z ikonami
   - ARIA attributes
   - Keyboard navigation

5. **Form UX**
   - Multi-step zmniejsza overwhelm
   - Preview boxes pomagają
   - Helper text informujący

6. **Customizable Options**
   - Checkboxes z opisami
   - Custom styling na opcjach
   - Clear benefits comunicujące

---

## 🔧 Potencjalne Ulepszenia

### 1. **Loading States**
- Skeleton loaders podczas ładowania danych
- Progress indicator przy zapisywaniu
- Disabled state na przyciskach

### 2. **Visual Polish**
- Smooth transitions między krokami
- Subtle animations przy focus
- Drag-to-upload dla images (przyszłość)

### 3. **Mobile Optimizations**
- Full-width layout na < 480px
- Larger tap targets (minimum 44px)
- Sticky action buttons

### 4. **Error Handling**
- Toast notifications zamiast inline errors
- Clear error messages (nie generyczne)
- Retry buttons dla operacji sieciowych

### 5. **Advanced Features**
- Auto-save draft to localStorage
- Field history/undo
- Template selection
- Bulk import contacts

---

## 🌙 Dark Mode Support

Wszystkie kolory używają CSS variables, więc dark mode jest natywnie wspierany:

```scss
@media (prefers-color-scheme: dark) {
  :root {
    --bg-secondary: /* dark gray */
    --text-primary: /* white */
    --text-secondary: /* light gray */
    --border-primary: /* dark border */
  }
}
```

---

## 📱 Device Compatibility

| Device | Support | Issues |
|--------|---------|--------|
| **Desktop Chrome** | ✅ Full | - |
| **Desktop Firefox** | ✅ Full | - |
| **Safari (Mac)** | ✅ Full | - |
| **iPad** | ✅ Full | Date picker UX |
| **iPhone 12/13** | ✅ Full | Keyboard push |
| **Android** | ✅ Full | Time picker varies |

---

## 📋 Podsumowanie

**Ocena Ogólna: 8.5/10**

### Mocne strony:
- ✅ Intuicyjny flow formularza (3 kroki)
- ✅ Responsywny na wszystkich urządzeniach
- ✅ Dobra validacja i error handling
- ✅ Clear visual hierarchy
- ✅ Accessible (labels, focus states)

### Obszary do poprawy:
- ⚠️ Brak loading states
- ⚠️ Możliwość auto-save draft
- ⚠️ Mobile action buttons mogą być większe
- ⚠️ Animacje przejścia między krokami

### Rekomendacje Priorytet 1:
1. Dodać loading states do save button
2. Implementować draft auto-save
3. Zwiększyć tap targets na mobile (min 44px)
4. Smooth transitions między krokami

### Rekomendacje Priorytet 2:
1. Drag-and-drop untuk images
2. Time zone selector (jeśli globalne)
3. Recurring event support
4. Template selection UI

---

## 🔗 Powiązane Komponenty

- **LocationPicker**: `CreateEvent/LocationPicker/LocationPicker.tsx`
- **EventService**: `src/services/firebase/eventService.ts`
- **Header**: Nawigacja do create event
- **Events Page**: Wyświetla created events

---

## 📝 Notatki Developerskie

### Ścieżka Edycji
- Komponent wspiera editing poprzez `useParams()` - `id` parameter
- Jeśli `id` jest present: loading event data i populate form
- Button zmienia się z "Dalej" na "Zapisz"

### Walidacja
- Occurs na level kroku (przed przejściem dalej)
- Plan-based limits (starter=50, pro=200, enterprise=9999)
- Date constraints (min: today, max: +10 lat)

### Data Flow
1. User fills Krok 1 → Validates → Next
2. User fills Krok 2 → Validates → Next
3. User fills Krok 3 → Validates → Submit
4. EventService.createEvent() / updateEvent()
5. Redirect to Events page

