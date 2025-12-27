# 🤝 Wkład w Projekt PartyPass

Dziękujemy za zainteresowanie projektem PartyPass! Cenimy każdy wkład, niezależnie od wielkości. Prosimy o przestrzeganie poniższych wytycznych, aby zapewnić spójność i jakość kodu.

## 📋 Spis Treści
- [Jak Przyczynić Się](#jak-przyczynić-się)
- [Środowisko Rozwojowe](#środowisko-rozwojowe)
- [Standardy Kodowania](#standardy-kodowania)
- [Proces Pull Request](#proces-pull-request)
- [Testowanie](#testowanie)
- [Dokumentacja](#dokumentacja)

## 🚀 Jak Przyczynić Się

1. **Zgłoś problem** - Jeśli znalazłeś błąd lub masz pomysł na nową funkcjonalność, [utwórz issue](https://github.com/your-username/partypass/issues)
2. **Fork projektu** - Zrób fork repozytorium na swoim koncie GitHub
3. **Utwórz branch** - Dla każdej zmiany utwórz osobny branch
4. **Wprowadź zmiany** - Przestrzegaj standardów kodowania
5. **Przetestuj** - Upewnij się, że wszystkie testy przechodzą
6. **Utwórz Pull Request** - Opisz dokładnie wprowadzone zmiany

## 🛠️ Środowisko Rozwojowe

### Wymagania
- Node.js 18+ LTS
- npm 8+ lub yarn 1.22+
- Git

### Setup
```bash
# Sklonuj fork
git clone https://github.com/your-username/partypass.git
cd partypass

# Zainstaluj zależności
npm install

# Skonfiguruj środowisko
cp env.example .env
# Edytuj .env z kluczami Firebase

# Uruchom aplikację
npm start
```

### Dostępne Skrypty
```bash
npm start          # Serwer deweloperski
npm run build      # Build produkcyjny
npm test           # Testy jednostkowe
npm run lint       # Sprawdzanie jakości kodu
npm run lint:fix   # Automatyczne naprawianie błędów
npm run format     # Formatowanie kodu
```

## 📏 Standardy Kodowania

### TypeScript
- **Ścisła typizacja** - używaj `strict: true` w tsconfig
- **Interfejsy zamiast typów** dla obiektów
- **Unikaj `any`** - zawsze definiuj właściwe typy
- **Opcjonalne właściwości** - używaj `?:` zamiast `| undefined`

```typescript
// ✅ Dobrze
interface User {
  id: string;
  name: string;
  email?: string;
}

// ❌ Źle
type User = {
  id: string;
  name: string;
  email: string | undefined;
};
```

### React
- **Functional components** z hooks
- **React.memo** dla komponentów bezstanowych
- **useCallback/useMemo** dla optymalizacji
- **Error boundaries** dla obsługi błędów

```tsx
// ✅ Dobrze
const UserCard = React.memo<UserCardProps>(({ user, onEdit }) => {
  const handleEdit = useCallback(() => {
    onEdit(user.id);
  }, [user.id, onEdit]);

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <button onClick={handleEdit}>Edytuj</button>
    </div>
  );
});
```

### CSS/SCSS
- **CSS Modules** dla komponentów
- **BEM methodology** dla nazw klas
- **Zmienne SCSS** dla kolorów i wymiarów
- **Responsive design** z mobile-first approach

```scss
// ✅ Dobrze
.user-card {
  &__header {
    background-color: var(--color-primary);
  }

  &__content {
    padding: var(--spacing-md);
  }

  @media (max-width: 768px) {
    &__content {
      padding: var(--spacing-sm);
    }
  }
}
```

### Commits
Używamy [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Typy commit:**
- `feat`: nowa funkcjonalność
- `fix`: naprawa błędu
- `docs`: zmiany w dokumentacji
- `style`: formatowanie kodu
- `refactor`: refaktoryzacja kodu
- `test`: dodanie/usunięcie testów
- `chore`: zmiany w konfiguracji

**Przykłady:**
```bash
feat(auth): add login with Google
fix(ui): resolve button alignment on mobile
docs(readme): update installation instructions
test(header): add tests for navigation menu
```

## 🔄 Proces Pull Request

### Przed Utworzeniem PR
1. **Zaktualizuj branch** z main
2. **Przejdź wszystkie testy** - `npm test`
3. **Sprawdź jakość kodu** - `npm run lint`
4. **Sprawdź formatowanie** - `npm run format`
5. **Testuj ręcznie** - upewnij się, że funkcjonalność działa

### Opis Pull Request
- **Tytuł**: Krótki, opisowy tytuł
- **Opis**: Szczegółowy opis zmian
- **Screenshoty**: Jeśli to zmiany UI
- **Testy**: Jak przetestować zmiany
- **Breaking changes**: Jeśli wprowadzono zmiany łamiące kompatybilność

**Szablon PR:**
```markdown
## Opis
[Opisz wprowadzone zmiany]

## Testowanie
[Jak przetestować zmiany]

## Screenshoty
[Jeśli dotyczy]

## Checklist
- [ ] Testy przechodzą
- [ ] Kod spełnia standardy ESLint
- [ ] Dokumentacja zaktualizowana
- [ ] Zmiany przetestowane ręcznie
```

## 🧪 Testowanie

### Testy Jednostkowe
- **React Testing Library** dla komponentów
- **Jest** dla logiki biznesowej
- **100% pokrycie** dla krytycznych funkcji

```typescript
// ✅ Dobrze
describe('UserCard', () => {
  it('renders user name', () => {
    render(<UserCard user={mockUser} />);
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);

    fireEvent.click(screen.getByRole('button', { name: /edytuj/i }));
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser.id);
  });
});
```

### Testy Integracyjne
- **Firebase emulators** dla testów backend
- **E2E tests** z Cypress (planowane)

## 📚 Dokumentacja

### README Updates
- Aktualizuj README.md przy dodaniu nowych funkcjonalności
- Dodawaj zrzuty ekranu dla zmian UI
- Dokumentuj nowe zmienne środowiskowe

### Code Comments
- **JSDoc** dla funkcji publicznych
- **Inline comments** dla złożonej logiki
- **README w komponentach** dla złożonych komponentów

```typescript
/**
 * Calculates the total price including tax
 * @param price - Base price in PLN
 * @param taxRate - Tax rate as decimal (0.23 for 23%)
 * @returns Total price with tax
 */
export const calculateTotalPrice = (price: number, taxRate: number): number => {
  return price * (1 + taxRate);
};
```

## 🐛 Zgłaszanie Błędów

Używaj [GitHub Issues](https://github.com/your-username/partypass/issues) do zgłaszania błędów:

**Szablon bug report:**
```markdown
## Opis Błędu
[Krótki opis problemu]

## Kroki Reprodukcji
1. Przejdź do '...'
2. Kliknij '....'
3. Scrolluj do '....'
4. Zobacz błąd

## Oczekiwane Zachowanie
[Opisz co powinno się stać]

## Aktualne Zachowanie
[Opisz co się dzieje]

## Środowisko
- OS: [np. Windows 10]
- Browser: [np. Chrome 91]
- Version: [np. 1.0.0]

## Dodatkowe Informacje
[Screenshoty, logi konsoli, etc.]
```

## 🎯 Dobre Praktyki

### Bezpieczeństwo
- Nigdy nie commituj kluczy API
- Używaj zmiennych środowiskowych
- Waliduj dane wejściowe
- Sanitizuj dane wyjściowe

### Wydajność
- Lazy loading dla dużych komponentów
- Memoizacja kosztownych obliczeń
- Optymalizacja obrazów
- Code splitting

### Dostępność
- Semantic HTML
- Keyboard navigation
- Screen reader support
- Color contrast
- Focus management

### SEO
- Meta tags
- Structured data
- Open Graph tags
- Sitemap

---

Dziękujemy za przeczytanie! Jesteśmy podekscytowani Twoim wkładem w PartyPass! 🎉
