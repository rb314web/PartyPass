/**
 * Plan Limits Service
 * Zarządza limitami dla poszczególnych planów użytkowników
 */

export type PlanType = 'starter' | 'pro' | 'enterprise';

export interface PlanLimits {
  events: number;
  guests: number;
  contacts: number;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  starter: {
    events: 10,
    guests: 50,
    contacts: 50,
  },
  pro: {
    events: 50,
    guests: 500,
    contacts: 1000,
  },
  enterprise: {
    events: Infinity,
    guests: Infinity,
    contacts: Infinity,
  },
};

/**
 * Pobierz limity dla danego planu
 */
export function getPlanLimits(planType: PlanType = 'starter'): PlanLimits {
  return PLAN_LIMITS[planType] || PLAN_LIMITS.starter;
}

/**
 * Sprawdź czy użytkownik może stworzyć nowe wydarzenie
 * @param currentEventCount - aktualna liczba zdarzeń użytkownika
 * @param planType - typ planu użytkownika
 * @returns true jeśli może tworzyć, false jeśli przekroczył limit
 */
export function canCreateEvent(currentEventCount: number, planType: PlanType = 'starter'): boolean {
  const limits = getPlanLimits(planType);
  return currentEventCount < limits.events;
}

/**
 * Sprawdź czy użytkownik może dodać nowego gościa
 * @param currentGuestCount - aktualna liczba gości użytkownika
 * @param planType - typ planu użytkownika
 * @returns true jeśli może dodawać, false jeśli przekroczył limit
 */
export function canCreateGuest(currentGuestCount: number, planType: PlanType = 'starter'): boolean {
  const limits = getPlanLimits(planType);
  return currentGuestCount < limits.guests;
}

/**
 * Sprawdź czy użytkownik może dodać nowy kontakt
 */
export function canCreateContact(currentContactCount: number, planType: PlanType = 'starter'): boolean {
  const limits = getPlanLimits(planType);
  return currentContactCount < limits.contacts;
}

/**
 * Pobierz komunikat błędu dla przekroczonego limitu kontaktów
 */
export function getContactLimitErrorMessage(planType: PlanType = 'starter'): string {
  const limits = getPlanLimits(planType);
  if (planType === 'enterprise') return 'Limit kontaktów: brak (plan Enterprise)';
  return `Osiągnąłeś limit ${limits.contacts} kontaktów dla planu ${planType}. Uaktualnij plan aby dodawać więcej.`;
}

/**
 * Pobierz procent wykorzystania limitu kontaktów
 */
export function getContactUsagePercent(currentContactCount: number, planType: PlanType = 'starter'): number {
  const limits = getPlanLimits(planType);
  if (!isFinite(limits.contacts)) return 0;
  return Math.round((currentContactCount / limits.contacts) * 100);
}
export function getEventLimitErrorMessage(planType: PlanType = 'starter'): string {
  const limits = getPlanLimits(planType);
  
  if (planType === 'enterprise') {
    return 'Limit zdarzeń: brak (plan Enterprise)';
  }
  
  return `Osiągnąłeś limit ${limits.events} zdarzeń dla planu ${planType}. Uaktualnij plan aby tworzyć więcej.`;
}

/**
 * Pobierz komunikat błędu dla przekroczonego limitu gości
 */
export function getGuestLimitErrorMessage(planType: PlanType = 'starter'): string {
  const limits = getPlanLimits(planType);
  
  if (planType === 'enterprise') {
    return 'Limit gości: brak (plan Enterprise)';
  }
  
  return `Osiągnąłeś limit ${limits.guests} gości dla planu ${planType}. Uaktualnij plan aby dodawać więcej.`;
}

/**
 * Pobierz procent wykorzystania limitu zdarzeń
 */
export function getEventUsagePercent(currentEventCount: number, planType: PlanType = 'starter'): number {
  const limits = getPlanLimits(planType);
  
  if (!isFinite(limits.events)) {
    return 0; // Enterprise - brak limitu
  }
  
  return Math.round((currentEventCount / limits.events) * 100);
}

/**
 * Pobierz procent wykorzystania limitu gości
 */
export function getGuestUsagePercent(currentGuestCount: number, planType: PlanType = 'starter'): number {
  const limits = getPlanLimits(planType);
  
  if (!isFinite(limits.guests)) {
    return 0; // Enterprise - brak limitu
  }
  
  return Math.round((currentGuestCount / limits.guests) * 100);
}

/**
 * Custom error dla limitów
 */
export class PlanLimitExceededError extends Error {
  constructor(
    public limitType: 'events' | 'guests' | 'contacts',
    public planType: PlanType,
    public limit: number,
    public current: number
  ) {
    super(
      limitType === 'events'
        ? getEventLimitErrorMessage(planType)
        : limitType === 'contacts'
          ? getContactLimitErrorMessage(planType)
          : getGuestLimitErrorMessage(planType)
    );
    this.name = 'PlanLimitExceededError';
  }
}
