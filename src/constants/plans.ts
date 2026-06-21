/**
 * Wspólne definicje planów — single source of truth dla landing, rejestracji i ustawień.
 * Limity techniczne pochodzą z planLimitsService (PLAN_LIMITS).
 */
import type { Plan } from '../types';
import {
  PLAN_LIMITS,
  type PlanType,
} from '../services/firebase/planLimitsService';

export interface PlanCatalogEntry {
  id: PlanType;
  name: string;
  description: string;
  pricing: { monthly: number; yearly: number };
  popular?: boolean;
  features: string[];
  limitations?: string[];
}

export const PLAN_CATALOG: PlanCatalogEntry[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Idealny na początek',
    pricing: { monthly: 0, yearly: 0 },
    features: [
      'Do 10 wydarzeń łącznie',
      'Do 50 gości łącznie',
      'Do 50 kontaktów',
      'Podstawowe zaproszenia e-mail',
      'Link RSVP dla gości',
      'Podstawowe statystyki',
    ],
    limitations: [
      'Brak SMS powiadomień',
      'Brak zaawansowanych analityk',
      'Brak custom brandingu',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Dla profesjonalistów',
    pricing: { monthly: 29, yearly: 290 },
    popular: true,
    features: [
      'Do 50 wydarzeń łącznie',
      'Do 500 gości łącznie',
      'Do 1000 kontaktów',
      'Spersonalizowane zaproszenia',
      'SMS powiadomienia',
      'Zaawansowane analityki',
      'QR kody dla gości',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Dla dużych organizacji',
    pricing: { monthly: 99, yearly: 990 },
    features: [
      'Nieograniczone wydarzenia',
      'Nieograniczona liczba gości',
      'Nieograniczona liczba kontaktów',
      'Custom branding',
      'Zaawansowane analityki',
      'API dostęp',
      'Dedykowany manager',
      '24/7 support',
      'Integracje z CRM',
    ],
  },
];

export function getPlanById(id: PlanType): PlanCatalogEntry {
  return PLAN_CATALOG.find(p => p.id === id) ?? PLAN_CATALOG[0];
}

/** Plany w formacie używanym na landingu (PricingPlans). */
export function getLandingPlans(): Plan[] {
  return PLAN_CATALOG.map(entry => {
    const limits = PLAN_LIMITS[entry.id];
    const maxEvents = limits.events === Infinity ? -1 : limits.events;
    const maxGuests = limits.guests === Infinity ? -1 : limits.guests;

    return {
      id: entry.id,
      name: entry.name,
      price: entry.pricing.monthly,
      currency: 'PLN',
      interval: 'month',
      maxEvents,
      maxGuestsPerEvent: maxGuests,
      popular: entry.popular,
      features: entry.features,
    };
  });
}

/** Opcje planu w kroku rejestracji. */
export function getRegisterPlanOptions(): Array<{
  id: PlanType;
  name: string;
  price: string;
  popular: boolean;
}> {
  return PLAN_CATALOG.map(entry => ({
    id: entry.id,
    name: entry.name,
    price:
      entry.pricing.monthly === 0
        ? 'Darmowy'
        : `${entry.pricing.monthly} PLN/mies`,
    popular: entry.popular ?? false,
  }));
}

/** Etykieta CTA na landingu. */
export function getPlanCtaLabel(planId: PlanType): string {
  if (planId === 'starter') return 'Rozpocznij za darmo';
  if (planId === 'enterprise') return 'Skontaktuj się';
  return 'Wybierz plan';
}
