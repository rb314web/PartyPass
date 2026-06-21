import { QueryClient } from '@tanstack/react-query';

/**
 * Globalny klient React Query.
 *
 * Defaulty dobrane pod dashboard PartyPass:
 * - staleTime 60s — powrót na zakładkę w tym oknie nie odpala ponownego pobrania
 *   (dane uznawane za świeże), więc widok pojawia się natychmiast z cache.
 * - gcTime 5 min — cache trzymany po odmontowaniu widoku, by powrót był natychmiastowy.
 * - refetchOnWindowFocus false — nie odświeżamy przy każdym kliknięciu w okno.
 * - retry 1 — pojedyncza ponowna próba przy błędzie sieci.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/** Centralne klucze zapytań — spójne i łatwe do unieważniania. */
export const queryKeys = {
  guests: (userId: string, search = '') => ['guests', userId, search] as const,
  contacts: (userId: string, search = '') => ['contacts', userId, search] as const,
  dashboardStats: (userId: string) => ['dashboard', 'stats', userId] as const,
  dashboardContactCount: (userId: string) =>
    ['dashboard', 'contactCount', userId] as const,
  dashboardActivities: (userId: string) =>
    ['dashboard', 'activities', userId] as const,
  dashboardEvents: (userId: string) => ['dashboard', 'events', userId] as const,
};
