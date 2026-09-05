/**
 * Warstwa dostepu do ofert.
 *
 * Na czas prototypu czyta z plikow JSON zassanych ze starej strony.
 * Gdy wejdzie Supabase, podmieniamy tylko cialo tych funkcji - reszta
 * aplikacji korzysta z tego samego interfejsu.
 */
import offersJson from '@/data/offers.json'
import agentsJson from '@/data/agents.json'
import { OFFER_STATUSES, type Agent, type Offer, type PropertyType } from './types'

const OFFERS = offersJson as unknown as Offer[]
const AGENTS = agentsJson as unknown as Agent[]

export function getPublicOffers(): Offer[] {
  return OFFERS.filter((o) => OFFER_STATUSES[o.status].public)
}

export function getOfferBySlug(slug: string): Offer | undefined {
  return OFFERS.find((o) => o.slug === slug)
}

export function getOffersByType(type: PropertyType): Offer[] {
  return getPublicOffers().filter((o) => o.propertyType === type)
}

export function getAgents(): Agent[] {
  return AGENTS
}

export function getAgent(id: string | null): Agent | undefined {
  return id ? AGENTS.find((a) => a.id === id) : undefined
}

export function getOffersByAgent(agentId: string): Offer[] {
  return getPublicOffers().filter((o) => o.agentId === agentId)
}

/** Zdjecie glowne - pierwsze w kolejnosci. */
export function coverPhoto(offer: Offer): string | null {
  return offer.photos[0]?.url ?? null
}
