# Naprawa Problemu z Paskiem Przewijania - PartyPass

## 📋 Problem

Gdy menu mobilne się rozwija, pasek przewijania znika (z powodu `overflow: hidden`), a gdy się zwija, pasek przewijania pojawia się z powrotem. To powoduje zmianę szerokości viewportu i przeskok zawartości.

## 🔍 Przyczyna

1. **Pasek przewijania zajmuje miejsce**
   - Typowa szerokość: 15-17px (zależy od przeglądarki/systemu)
   - Gdy znika, viewport staje się szerszy
   - Gdy się pojawia, viewport staje się węższy

2. **Layout shift**
   - Zmiana szerokości viewportu powoduje przeskok zawartości
   - Szczególnie widoczne na elementach z `width: 100%`

3. **Timing**
   - Pasek znika natychmiast przy `overflow: hidden`
   - Pasek pojawia się natychmiast przy przywracaniu `overflow`
   - To nie jest zsynchronizowane z animacją menu

## ✅ Rozwiązanie

### Kompensacja szerokości scrollbara

Gdy ukrywamy pasek przewijania, dodajemy padding równy jego szerokości, aby zachować szerokość viewportu.

### Implementacja

1. **Obliczanie szerokości scrollbara**
```tsx
const getScrollbarWidth = (): number => {
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  outer.style.msOverflowStyle = 'scrollbar';
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode?.removeChild(outer);
  return scrollbarWidth;
};
```

2. **Dodawanie kompensacji przy zamykaniu**
```tsx
if (isMenuOpen && isMobile) {
  // Oblicz szerokość scrollbara
  scrollbarWidthRef.current = getScrollbarWidth();
  
  // Dodaj padding równy szerokości scrollbara
  if (scrollbarWidthRef.current > 0) {
    document.body.style.paddingRight = `${scrollbarWidthRef.current}px`;
    document.documentElement.style.paddingRight = `${scrollbarWidthRef.current}px`;
  }
  
  // Ukryj scrollbar
  document.body.style.overflow = 'hidden';
  // ...
}
```

3. **Usuwanie kompensacji przy otwieraniu**
```tsx
else if (!isMenuOpen && !isMenuClosing && isMobile) {
  // Usuń padding kompensacyjny
  document.body.style.paddingRight = '';
  document.documentElement.style.paddingRight = '';
  
  // Przywróć scrollbar
  document.body.style.overflow = '';
  // ...
}
```

## 🎯 Timeline (Poprawiony)

```
T=0ms:    Kliknięcie hamburgera
T=0ms:    Oblicz szerokość scrollbara (np. 17px)
T=0ms:    Dodaj padding-right: 17px do body i html
T=0ms:    Ustaw overflow: hidden (scrollbar znika)
T=0ms:    Brak przeskoku - szerokość viewportu bez zmian
T=0ms:    Animacja slideInRight zaczyna się
T=300ms:  Animacja się kończy
...
T=0ms:    Kliknięcie X (zamykanie)
T=0ms:    Animacja slideOutRight zaczyna się
T=300ms:  Animacja się kończy
T=300ms:  Usuń padding-right
T=300ms:  Przywróć overflow (scrollbar pojawia się)
T=300ms:  Brak przeskoku - szerokość viewportu bez zmian
```

## 🔧 Szczegóły Techniczne

### Obliczanie szerokości scrollbara

**Metoda:**
1. Tworzymy tymczasowy `div` z `overflow: scroll`
2. Dodajemy wewnętrzny `div`
3. Różnica między `outer.offsetWidth` a `inner.offsetWidth` to szerokość scrollbara
4. Usuwamy tymczasowy element

**Dlaczego to działa:**
- `outer.offsetWidth` = szerokość kontenera + scrollbar
- `inner.offsetWidth` = szerokość kontenera bez scrollbara
- Różnica = szerokość scrollbara

### Kompensacja padding

**Dlaczego padding, a nie margin?**
- Padding jest częścią elementu, więc nie wpływa na layout innych elementów
- Margin może powodować problemy z `position: fixed`

**Dlaczego zarówno body jak i html?**
- Różne przeglądarki używają różnych elementów do scroll
- Niektóre używają `body`, inne `html`
- Kompensacja na obu zapewnia kompatybilność

### Timing

**Kiedy dodawać padding?**
- Przed ukryciem scrollbara (`overflow: hidden`)
- Natychmiast, aby uniknąć przeskoku

**Kiedy usuwać padding?**
- Po zakończeniu animacji zamykania
- W `requestAnimationFrame` dla płynności

## ✅ Oczekiwane Rezultaty

1. **Brak przeskoku przy otwieraniu menu**
   - Padding kompensuje zniknięcie scrollbara
   - Szerokość viewportu pozostaje stała

2. **Brak przeskoku przy zamykaniu menu**
   - Padding jest usuwany po zakończeniu animacji
   - Scrollbar pojawia się bez zmiany szerokości viewportu

3. **Płynne przejścia**
   - Wszystko jest zsynchronizowane
   - Brak wizualnych artefaktów

## 🔍 Potencjalne Problemy i Rozwiązania

### Problem 1: Padding na elementach z `position: fixed`

**Rozwiązanie:**
- Padding jest dodawany tylko do `body` i `html`
- Elementy z `position: fixed` są pozycjonowane względem viewportu
- Nie powinny być dotknięte

### Problem 2: Różne szerokości scrollbara w różnych przeglądarkach

**Rozwiązanie:**
- Obliczamy szerokość dynamicznie
- Działa dla wszystkich przeglądarek
- Automatycznie dostosowuje się do systemu

### Problem 3: Scrollbar może nie być widoczny (mobile)

**Rozwiązanie:**
- Na mobile scrollbar często nie jest widoczny
- `getScrollbarWidth()` zwróci 0
- Padding nie będzie dodany (niepotrzebny)

## 📊 Porównanie Przed vs Po

### Przed
- Scrollbar znika → viewport szerszy o ~17px → przeskok
- Scrollbar pojawia się → viewport węższy o ~17px → przeskok

### Po
- Scrollbar znika → padding +17px → viewport bez zmian → brak przeskoku
- Scrollbar pojawia się → padding -17px → viewport bez zmian → brak przeskoku

---

*Dokument wygenerowany: ${new Date().toLocaleDateString('pl-PL')}*







