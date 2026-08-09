/**
 * Plany — limity techniczne w planLimitsService; teksty UI w i18n (`plans.catalog`).
 */
import type { TFunction } from 'i18next';
import type { Plan } from '../types';
import {
  PLAN_LIMITS,
  type PlanType,
} from '../services/firebase/planLimitsService';

export const PLAN_IDS: PlanType[] = ['starter', 'pro', 'enterprise'];

export const PLAN_PRICING: Record<
  PlanType,
  { monthly: number; yearly: number }
> = {
  starter: { monthly: 0, yearly: 0 },
  pro: { monthly: 29, yearly: 290 },
  enterprise: { monthly: 99, yearly: 990 },
};

export const POPULAR_PLAN_ID: PlanType = 'pro';

export interface PlanCatalogEntry {
  id: PlanType;
  name: string;
  description: string;
  pricing: { monthly: number; yearly: number };
  popular?: boolean;
  features: string[];
  limitations?: string[];
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function getPlanCatalogEntry(
  t: TFunction,
  id: PlanType
): PlanCatalogEntry {
  const features = readStringArray(
    t(`landing.pricing.plans.${id}.features`, { returnObjects: true })
  );
  const limitations =
    id === 'starter'
      ? readStringArray(
          t('plans.limitations.starter', { returnObjects: true })
        )
      : undefined;

  return {
    id,
    name: t(`plans.catalog.${id}.name`),
    description: t(`plans.catalog.${id}.description`),
    pricing: PLAN_PRICING[id],
    popular: id === POPULAR_PLAN_ID,
    features,
    limitations,
  };
}

export function getPlanCatalog(t: TFunction): PlanCatalogEntry[] {
  return PLAN_IDS.map(id => getPlanCatalogEntry(t, id));
}

/** @deprecated Użyj getPlanCatalog(t) */
export const PLAN_CATALOG: PlanCatalogEntry[] = PLAN_IDS.map(id => ({
  id,
  name: id.charAt(0).toUpperCase() + id.slice(1),
  description: '',
  pricing: PLAN_PRICING[id],
  popular: id === POPULAR_PLAN_ID,
  features: [],
  limitations: id === 'starter' ? [] : undefined,
}));

export function getPlanById(t: TFunction, id: PlanType): PlanCatalogEntry {
  return getPlanCatalogEntry(t, id);
}

export function getLandingPlans(t: TFunction): Plan[] {
  return getPlanCatalog(t).map(entry => {
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

export function getRegisterPlanOptions(t: TFunction): Array<{
  id: PlanType;
  name: string;
  description: string;
  price: string;
  popular: boolean;
}> {
  return getPlanCatalog(t).map(entry => ({
    id: entry.id,
    name: entry.name,
    description: entry.description,
    price:
      entry.pricing.monthly === 0
        ? t(`plans.catalog.${entry.id}.priceFree`)
        : t(`plans.catalog.${entry.id}.priceMonthly`, {
            price: entry.pricing.monthly,
          }),
    popular: entry.popular ?? false,
  }));
}

export function getPlanCtaLabel(t: TFunction, planId: PlanType): string {
  return t(`landing.pricing.cta.${planId}`);
}
