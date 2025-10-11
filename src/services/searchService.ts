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

class SearchService {
  // Main search function
  static async search(
    userId: string, 
    query: string, 
    filters: SearchFilters = {}
  ): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    const { types = ['event', 'contact'], limit = 20 } = filters;
    const results: SearchResult[] = [];

    // Search events
    if (types.includes('event')) {
      try {
        const events = await this.searchEvents(userId, query, filters);
        results.push(...events);
      } catch (error) {
        console.error('Error searching events:', error);
      }
    }

    // Search contacts
    if (types.includes('contact')) {
      try {
        const contacts = await this.searchContacts(userId, query, filters);
        results.push(...contacts);
      } catch (error) {
        console.error('Error searching contacts:', error);
      }
    }

    // Sort by relevance score and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Search events
  private static async searchEvents(
    userId: string, 
    query: string, 
    filters: SearchFilters
  ): Promise<SearchResult[]> {
    const result = await EventService.getUserEvents(userId, {
      search: query,
      status: filters.status as any,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo
    });

    return result.events.map((event: Event) => this.eventToSearchResult(event, query));
  }

  // Search contacts
  private static async searchContacts(
    userId: string, 
    query: string, 
    filters: SearchFilters
  ): Promise<SearchResult[]> {
    const contacts = await ContactService.searchContacts(userId, query);

    return contacts.map(contact => this.contactToSearchResult(contact, query));
  }

  // Convert event to search result
  private static eventToSearchResult(event: Event, query: string): SearchResult {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Calculate relevance score
    if (event.title.toLowerCase().includes(queryLower)) score += 10;
    if (event.description.toLowerCase().includes(queryLower)) score += 5;
    if (event.location.toLowerCase().includes(queryLower)) score += 3;
    
    // Boost recent events
    const daysSinceCreated = (Date.now() - event.createdAt.getTime()) / (1000 * 60 * 60 * 24);
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
        date: event.date.toISOString()
      }
    };
  }

  // Convert contact to search result
  private static contactToSearchResult(contact: Contact, query: string): SearchResult {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Calculate relevance score
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    if (fullName.includes(queryLower)) score += 10;
    if (contact.email.toLowerCase().includes(queryLower)) score += 8;
    if (contact.phone?.toLowerCase().includes(queryLower)) score += 6;

    // Boost recent contacts
    const daysSinceCreated = (Date.now() - contact.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 30) score += 2;

    return {
      type: 'contact',
      id: contact.id,
      title: `${contact.firstName} ${contact.lastName}`,
      subtitle: contact.email,
      description: contact.notes,
      url: `/dashboard/contacts?contact=${contact.id}`,
      score,
      metadata: {
        phone: contact.phone,
        tags: contact.tags,
        createdAt: contact.createdAt.toISOString()
      }
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

  // Get recent searches for user (would be stored in localStorage)
  static getRecentSearches(): string[] {
    try {
      const recent = localStorage.getItem('recentSearches');
      return recent ? JSON.parse(recent) : [];
    } catch {
      return [];
    }
  }

  // Save search to recent searches
  static saveRecentSearch(query: string): void {
    try {
      const recent = this.getRecentSearches();
      const updated = [query, ...recent.filter(q => q !== query)].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
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
