# 🔍 GŁĘBOKA ANALIZA PROBLEMU WYSZUKIWANIA

## Problem
Po odświeżeniu strony z parametrem `?q=cokolwiek` i wpisaniu czegokolwiek w pole wyszukiwania, wyniki się nie ładują.

---

## 🔴 GŁÓWNY PROBLEM ZNALEZIONY

### Lokalizacja: `Search.tsx` linie 244-273

```typescript
// Perform search when query or filters change (with deduplication)
useEffect(() => {
  console.log('🔍 Search useEffect triggered:', { query, userId: user?.id, previousQuery: previousQueryRef.current });
  
  if (!user?.id) {
    console.log('❌ User not loaded yet, waiting...');
    return;
  }

  if (!query.trim()) {
    console.log('❌ Empty query, clearing results');
    setResults([]);
    previousQueryRef.current = '';
    return;
  }

  // Check if query or filters actually changed
  const queryChanged = query !== previousQueryRef.current;
  const filtersChanged = JSON.stringify(filters) !== JSON.stringify(previousFiltersRef.current);
  
  console.log('📊 Change detection:', { queryChanged, filtersChanged, hasPerformedInitialSearch: hasPerformedInitialSearch.current });

  // Perform search if:
  // 1. Query or filters changed, OR
  // 2. This is the first search with a valid query from URL (after user loads)
  if (queryChanged || filtersChanged || (!hasPerformedInitialSearch.current && query.trim())) {
    console.log('✅ Performing search for:', query);
    previousQueryRef.current = query;
    previousFiltersRef.current = filters;
    hasPerformedInitialSearch.current = true;
    performSearch(query, filters, false);
  } else {
    console.log('⏭️ No changes detected, skipping search');
  }
}, [query, filters, user?.id, performSearch]);
```

## 🔎 ANALIZA KROK PO KROKU

### SCENARIUSZ: Odświeżenie strony z ?q=test

#### Krok 1: Inicjalizacja komponentu
```typescript
const initialQuery = searchParams.get('q') || ''; // ✅ 'test'
const [query, setQuery] = useState(initialQuery);  // ✅ query = 'test'
```
✅ Query jest poprawnie ustawione na wartość z URL

#### Krok 2: Wpisanie nowego tekstu np. "party"

```typescript
const handleSearchInput = (value: string) => {
  setQuery(value);  // ❌ query zmienia się z 'test' na 'party'
  
  if (value.trim() && value.length >= 2) {
    debouncedGetSuggestions.fn(value); // ✅ Sugestie działają
  } else {
    setSuggestions([]);
    if (!value.trim()) {
      setResults([]); // ❌ Czyści wyniki gdy puste
    }
  }
};
```

**🔴 PROBLEM 1**: `handleSearchInput` NIE wywołuje wyszukiwania!
- Zmienia tylko stan `query`
- Uruchamia sugestie
- Ale nie uruchamia `performSearch()`

#### Krok 3: useEffect powinien zareagować

```typescript
useEffect(() => {
  // ...
  const queryChanged = query !== previousQueryRef.current;
  // queryChanged = true ('party' !== 'test')
  
  if (queryChanged || filtersChanged || (!hasPerformedInitialSearch.current && query.trim())) {
    previousQueryRef.current = query;  // ❌ Zapisuje 'party'
    performSearch(query, filters, false); // ✅ Powinno wywołać
  }
}, [query, filters, user?.id, performSearch]);
```

**🤔 PYTANIE**: Czy useEffect faktycznie się uruchamia?

### MOŻLIWE PRZYCZYNY PROBLEMU:

## 1️⃣ Problem z referencją `performSearch` w dependency array

```typescript
const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters, saveToRecent: boolean = false) => {
  // ...
}, [user?.id]); // ✅ Zależy tylko od user?.id
```

useEffect ma w zależnościach:
```typescript
}, [query, filters, user?.id, performSearch]);
```

**🔴 POTENCJALNY PROBLEM**: 
- `performSearch` jest w dependency array
- Gdy `performSearch` się zmienia (bo zmienia się user), useEffect się uruchamia
- Ale sprawdzenie `queryChanged` może nie przejść, jeśli `previousQueryRef.current` już został zaktualizowany

## 2️⃣ Problem z `previousQueryRef.current`

**SCENARIUSZ BŁĘDU**:

1. Pierwsze wpisanie "party":
   - `query = 'party'`
   - `previousQueryRef.current = 'test'`
   - `queryChanged = true` ✅
   - Wywołuje `performSearch`
   - Ustawia `previousQueryRef.current = 'party'` ✅

2. useEffect uruchamia się ponownie (bo zmienił się `performSearch`):
   - `query = 'party'`
   - `previousQueryRef.current = 'party'` (już zaktualizowane!)
   - `queryChanged = false` ❌
   - `hasPerformedInitialSearch.current = true` ✅
   - **NIE wywołuje `performSearch`** ❌

## 3️⃣ Problem z limitami w `searchEvents`

```typescript
// searchService.ts linia 118
private static async searchEvents(
  userId: string,
  query: string,
  filters: SearchFilters
): Promise<SearchResult[]> {
  const result = await EventService.getUserEvents(
    userId,
    {
      search: query,
      status: filters.status as any,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    },
    100  // ✅ Limit 100
  );

  return result.events.map((event: Event) =>
    this.eventToSearchResult(event, query)
  );
}
```

```typescript
// eventService.ts linia 612
static async getUserEvents(
  userId: string,
  filters: EventFilters = {},
  pageSize: number = 10,  // ❌ Domyślnie 10
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{...}> {
  try {
    let q = query(
      collection(db, COLLECTIONS.EVENTS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)  // ✅ Ale używa przekazanego 100
    );
    // ...
}
```

✅ To jest OK - searchService przekazuje limit 100

## 4️⃣ Problem z filtrowaniem w pamięci

```typescript
// eventService.ts linia 665
// Apply search filter in memory if needed
let filteredEvents = events;
if (filters.search) {
  const searchLower = filters.search.toLowerCase();
  filteredEvents = events.filter(
    event =>
      event.title.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower)
  );
}
```

✅ To wygląda poprawnie

## 5️⃣ Problem z cachowaniem

```typescript
// searchService.ts linia 41
static async search(
  userId: string,
  query: string,
  filters: SearchFilters = {}
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  // Create cache key
  const cacheKey = `${userId}:${query.toLowerCase()}:${JSON.stringify(filters)}`;

  // Check cache
  const cached = this.searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
    console.log('Returning cached search results for:', query);
    return cached.results; // ❌ Może zwracać stare wyniki?
  }
  // ...
}
```

**🔴 MOŻLIWY PROBLEM**: Cache może być zbyt agresywny
- Cache duration: 5 minut
- Ale po odświeżeniu strony cache powinien być pusty (in-memory)

---

## 🎯 ROZWIĄZANIE

### Główny problem: Race condition w useEffect

**Problem**: useEffect może się uruchamiać wielokrotnie, a `previousQueryRef.current` jest aktualizowany za każdym razem, co powoduje, że kolejne wywołania useEffect myślą, że nie ma zmian.

### Rozwiązanie 1: Usunięcie `performSearch` z dependency array

```typescript
useEffect(() => {
  console.log('🔍 Search useEffect triggered:', { query, userId: user?.id });
  
  if (!user?.id) {
    console.log('❌ User not loaded yet, waiting...');
    return;
  }

  if (!query.trim()) {
    console.log('❌ Empty query, clearing results');
    setResults([]);
    previousQueryRef.current = '';
    return;
  }

  // Check if query or filters actually changed
  const queryChanged = query !== previousQueryRef.current;
  const filtersChanged = JSON.stringify(filters) !== JSON.stringify(previousFiltersRef.current);
  
  console.log('📊 Change detection:', { 
    queryChanged, 
    filtersChanged, 
    hasPerformedInitialSearch: hasPerformedInitialSearch.current,
    currentQuery: query,
    previousQuery: previousQueryRef.current
  });

  if (queryChanged || filtersChanged || (!hasPerformedInitialSearch.current && query.trim())) {
    console.log('✅ Performing search for:', query);
    previousQueryRef.current = query;
    previousFiltersRef.current = filters;
    hasPerformedInitialSearch.current = true;
    performSearch(query, filters, false);
  } else {
    console.log('⏭️ No changes detected, skipping search');
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [query, filters, user?.id]); // ✅ Usunięte performSearch
```

### Rozwiązanie 2: Wywołanie search bezpośrednio w handleSearchInput (dla natychmiastowej reakcji)

```typescript
const handleSearchInput = (value: string) => {
  setQuery(value);
  
  if (value.trim() && value.length >= 2) {
    debouncedGetSuggestions.fn(value);
    // Dodaj opcjonalnie natychmiastowe wyszukiwanie
    // performSearch(value, filters, false);
  } else {
    setSuggestions([]);
    if (!value.trim()) {
      setResults([]);
    }
  }
};
```

### Rozwiązanie 3: Lepsze logowanie do debugowania

Dodaj więcej console.log w kluczowych miejscach:

```typescript
const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters, saveToRecent: boolean = false) => {
  console.log('🔍 performSearch called:', { searchQuery, userId: user?.id, filters: searchFilters });
  
  if (!user?.id || !searchQuery.trim()) {
    console.log('❌ performSearch: Invalid params');
    setResults([]);
    return;
  }
  
  // ... rest of the code
}, [user?.id]);
```

---

## 🐛 TESTOWANIE

### Dodaj te console.logi tymczasowo:

1. W `Search.tsx` w useEffect (linia 244):
```typescript
console.log('🔍 useEffect START:', {
  query,
  previousQuery: previousQueryRef.current,
  queryChanged: query !== previousQueryRef.current,
  userId: user?.id,
  hasInitialSearch: hasPerformedInitialSearch.current
});
```

2. W `searchService.ts` w metodzie `search()` (linia 41):
```typescript
console.log('🔍 SearchService.search called:', {
  userId,
  query,
  filters,
  cacheKey: `${userId}:${query.toLowerCase()}:${JSON.stringify(filters)}`,
  cacheSize: this.searchCache.size
});
```

3. W `eventService.ts` w `getUserEvents` (linia 612):
```typescript
console.log('🔍 EventService.getUserEvents called:', {
  userId,
  filters,
  pageSize
});
```

### Kroki testowania:

1. Otwórz stronę z `?q=test`
2. Otwórz DevTools Console
3. Wpisz coś nowego w pole wyszukiwania
4. Sprawdź kolejność i zawartość logów

---

## ✅ REKOMENDOWANE POPRAWKI

### Poprawka 1: Główny useEffect (KRYTYCZNA)

**Plik**: `Search.tsx` linie 244-273

```typescript
// Perform search when query or filters change (with deduplication)
useEffect(() => {
  console.log('🔍 Search useEffect triggered:', { 
    query, 
    userId: user?.id, 
    previousQuery: previousQueryRef.current,
    queryChanged: query !== previousQueryRef.current 
  });
  
  if (!user?.id) {
    console.log('❌ User not loaded yet, waiting...');
    return;
  }

  if (!query.trim()) {
    console.log('❌ Empty query, clearing results');
    setResults([]);
    previousQueryRef.current = '';
    hasPerformedInitialSearch.current = false; // ✅ Reset flag
    return;
  }

  // Check if query or filters actually changed
  const queryChanged = query !== previousQueryRef.current;
  const filtersChanged = JSON.stringify(filters) !== JSON.stringify(previousFiltersRef.current);
  
  console.log('📊 Change detection:', { 
    queryChanged, 
    filtersChanged, 
    hasPerformedInitialSearch: hasPerformedInitialSearch.current 
  });

  // Perform search if:
  // 1. Query or filters changed, OR
  // 2. This is the first search with a valid query from URL (after user loads)
  if (queryChanged || filtersChanged || (!hasPerformedInitialSearch.current && query.trim())) {
    console.log('✅ Performing search for:', query);
    previousQueryRef.current = query;
    previousFiltersRef.current = filters;
    hasPerformedInitialSearch.current = true;
    performSearch(query, filters, false);
  } else {
    console.log('⏭️ No changes detected, skipping search');
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [query, filters, user?.id]); // ✅ Usunięte performSearch z dependencies
```

### Poprawka 2: Dodanie wyszukiwania przy submit (dla pewności)

**Plik**: `Search.tsx` linia 204

```typescript
// Handle search submit
const handleSearchSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (query.trim()) {
    console.log('🔍 Search submitted:', query); // ✅ Dodaj log
    performSearch(query, filters, true); // Save to recent searches on submit
    setSuggestions([]);
    // Update URL
    setSearchParams({ q: query });
  }
};
```

### Poprawka 3: Wyczyść cache przy odświeżeniu (opcjonalnie)

**Plik**: `Search.tsx` - dodaj nowy useEffect

```typescript
// Clear cache on mount
useEffect(() => {
  SearchService.clearCache();
  console.log('🗑️ Search cache cleared on mount');
}, []); // Run once on mount
```

---

## 📊 PODSUMOWANIE

### Główna przyczyna:
**Race condition w useEffect** - `performSearch` w dependency array powoduje, że useEffect uruchamia się wielokrotnie, a sprawdzenie `queryChanged` może dawać false po pierwszym uruchomieniu.

### Wpływ na użytkownika:
- Po odświeżeniu strony z ?q=cokolwiek
- Pierwsze wyszukiwanie działa
- Ale kolejne wpisania tekstu w input nie wywołują wyszukiwania
- Dopiero wysłanie formularza (Enter) może działać

### Rozwiązanie:
1. ✅ Usunąć `performSearch` z dependency array useEffect
2. ✅ Dodać `eslint-disable-next-line` aby uniknąć ostrzeżeń
3. ✅ Zresetować `hasPerformedInitialSearch` gdy query jest puste
4. ✅ Dodać więcej logów do debugowania

### Priorytet: 🔴 KRYTYCZNY
Bez tej poprawki wyszukiwanie nie działa po odświeżeniu strony.
