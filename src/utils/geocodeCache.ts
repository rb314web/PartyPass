// Cache dla wyników geokodowania
const CACHE_KEY = 'partypass_geocode_cache';
const CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 dni

interface GeocodeResult {
  lat: number;
  lng: number;
  timestamp: number;
}

interface GeocodeCache {
  [address: string]: GeocodeResult;
}

export const getFromCache = (address: string): { lat: number; lng: number } | null => {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return null;

    const cache: GeocodeCache = JSON.parse(cacheStr);
    const entry = cache[address];

    if (entry && Date.now() - entry.timestamp < CACHE_EXPIRY) {
      return { lat: entry.lat, lng: entry.lng };
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const saveToCache = (address: string, lat: number, lng: number): void => {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    const cache: GeocodeCache = cacheStr ? JSON.parse(cacheStr) : {};

    cache[address] = {
      lat,
      lng,
      timestamp: Date.now(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // Ignoruj błędy cache (np. quota exceeded)
  }
};

export const clearCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    // Ignoruj błędy
  }
};
