// services/searchService.ts
import { EventService } from './firebase/eventService';
import { ContactService } from './firebase/contactService';
import { Event, Contact } from '../types';

export interface SearchResult {
  type: 'event' | 'contact' | 'activity';
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  url: string;
  score: number; // Relevance score for ranking
  metadata?: Record<string, any>;
}

export interface SearchFilters {
  types?: ('event' | 'contact' | 'activity')[];
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  limit?: number;
}

interface CacheEntry {
  results: SearchResult[];
  timestamp: number;
}

class SearchService {
  // Simple in-memory cache
  private static searchCache = new Map<string, CacheEntry>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 50;

  // Main search function with caching
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
      console.log('🔍 SearchService.search: Returning cached results for:', query, `(${cached.results.length} results)`);
      return cached.results;
    }

    console.log('🔍 SearchService.search: Performing fresh search:', { userId, query, filters, cacheSize: this.searchCache.size });

    const { types = ['event', 'contact'], limit = 100 } = filters;
    const results: SearchResult[] = [];

    // Search events
    if (types.includes('event')) {
      try {
        const events = await this.searchEvents(userId, query, filters);
        console.log(`Found ${events.length} events matching "${query}"`);
        results.push(...events);
      } catch (error) {
        console.error('Error searching events:', error);
      }
    }

    // Search contacts
    if (types.includes('contact')) {
      try {
        const contacts = await this.searchContacts(userId, query, filters);
        console.log(`Found ${contacts.length} contacts matching "${query}"`);
        results.push(...contacts);
      } catch (error) {
        console.error('Error searching contacts:', error);
      }
    }

    console.log(`Total results before sorting: ${results.length}`);

    // Sort by relevance score and limit results
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    console.log(
      `Returning ${sortedResults.length} results after sorting and limiting`
    );

    // Cache results
    this.searchCache.set(cacheKey, {
      results: sortedResults,
      timestamp: Date.now(),
    });

    // Limit cache size (LRU-like behavior)
    if (this.searchCache.size > this.MAX_CACHE_SIZE) {
      const firstKey = this.searchCache.keys().next().value;
      if (firstKey) {
        this.searchCache.delete(firstKey);
      }
    }

    return sortedResults;
  }

  // Clear cache (useful after data changes)
  static clearCache(): void {
    console.log('🗑️ SearchService: Clearing cache', { size: this.searchCache.size });
    this.searchCache.clear();
  }

  // Get cache info (for debugging)
  static getCacheInfo(): { size: number; keys: string[] } {
    return {
      size: this.searchCache.size,
      keys: Array.from(this.searchCache.keys())
    };
  }

  // Search events
  private static async searchEvents(
    userId: string,
    query: string,
    filters: SearchFilters
  ): Promise<SearchResult[]> {
    console.log('🔍 SearchService.searchEvents: Starting', { userId, query, filters });
    
    // Use larger limit for search to get all matching events
    const result = await EventService.getUserEvents(
      userId,
      {
        search: query,
        status: filters.status as any,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      },
      100
    ); // Increase limit to 100 to get more results

    console.log('🔍 SearchService.searchEvents: Got events', { count: result.events.length });

    return result.events.map((event: Event) =>
      this.eventToSearchResult(event, query)
    );
  }

  // Search contacts
  private static async searchContacts(
    userId: string,
    query: string,
    filters: SearchFilters
  ): Promise<SearchResult[]> {
    console.log('🔍 SearchService.searchContacts: Starting', { userId, query });
    
    const contacts = await ContactService.searchContacts(userId, query);

    console.log('🔍 SearchService.searchContacts: Got contacts', { count: contacts.length });

    return contacts.map(contact => this.contactToSearchResult(contact, query));
  }

  // Convert event to search result
  private static eventToSearchResult(
    event: Event,
    query: string
  ): SearchResult {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Calculate relevance score
    if (event.title.toLowerCase().includes(queryLower)) score += 10;
    if (event.description.toLowerCase().includes(queryLower)) score += 5;
    if (event.location.toLowerCase().includes(queryLower)) score += 3;

    // Boost recent events
    const daysSinceCreated =
      (Date.now() - event.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 30) score += 2;

    // Boost active events
    if (event.status === 'active') score += 3;

    return {
      type: 'event',
      id: event.id,
      title: event.title,
      subtitle: `${event.location} • ${event.date.toLocaleDateString('pl-PL')}`,
      description: event.description,
      url: `/dashboard/events/${event.id}`,
      score,
      metadata: {
        status: event.status,
        guestCount: event.guestCount,
        date: event.date.toISOString(),
      },
    };
  }

  // Convert contact to search result
  private static contactToSearchResult(
    contact: Contact,
    query: string
  ): SearchResult {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Calculate relevance score
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    if (fullName.includes(queryLower)) score += 10;
    if (contact.email.toLowerCase().includes(queryLower)) score += 8;
    if (contact.phone?.toLowerCase().includes(queryLower)) score += 6;

    // Boost recent contacts
    const daysSinceCreated =
      (Date.now() - contact.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 30) score += 2;

    return {
      type: 'contact',
      id: contact.id,
      title: `${contact.firstName} ${contact.lastName}`,
      subtitle: contact.email,
      description: contact.notes,
      url: `/dashboard/contacts`,
      score,
      metadata: {
        phone: contact.phone,
        tags: contact.tags,
        createdAt: contact.createdAt.toISOString(),
        contactId: contact.id, // Store contact ID for opening modal
      },
    };
  }

  // Get search suggestions based on partial query
  static async getSuggestions(
    userId: string,
    query: string,
    limit = 5
  ): Promise<string[]> {
    if (!query.trim() || query.length < 2) return [];

    try {
      const results = await this.search(userId, query, { limit: limit * 2 });

      // Extract unique titles and partial matches
      const suggestions = new Set<string>();

      results.forEach(result => {
        const words = result.title.toLowerCase().split(' ');
        const queryLower = query.toLowerCase();

        words.forEach(word => {
          if (word.startsWith(queryLower) && word !== queryLower) {
            suggestions.add(word);
          }
        });

        // Add full titles that contain the query
        if (result.title.toLowerCase().includes(queryLower)) {
          suggestions.add(result.title);
        }
      });

      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  // Get recent searches for user (stored in localStorage)
  static getRecentSearches(): string[] {
    try {
      const recent = localStorage.getItem('recentSearches');
      return recent ? JSON.parse(recent) : [];
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  }

  // Save search to recent searches with validation
  static saveRecentSearch(query: string): void {
    try {
      // Validate query
      const trimmedQuery = query.trim();
      if (!trimmedQuery || trimmedQuery.length > 200) {
        console.warn('Invalid query for recent searches:', query);
        return;
      }

      const recent = this.getRecentSearches();
      const updated = [
        trimmedQuery,
        ...recent.filter(q => q !== trimmedQuery),
      ].slice(0, 10);

      // Check storage size (rough estimate)
      const dataSize = JSON.stringify(updated).length;
      if (dataSize > 5000) {
        // Limit to ~5KB
        console.warn('Recent searches storage limit reached');
        return;
      }

      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      // Handle quota exceeded or other localStorage errors
      if (
        error instanceof DOMException &&
        error.name === 'QuotaExceededError'
      ) {
        console.error('localStorage quota exceeded. Clearing recent searches.');
        this.clearRecentSearches();
      } else {
        console.error('Error saving recent search:', error);
      }
    }
  }

  // Clear recent searches
  static clearRecentSearches(): void {
    try {
      localStorage.removeItem('recentSearches');
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  }
}

export default SearchService;
