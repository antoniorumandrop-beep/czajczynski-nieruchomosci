import 'server-only'
import { hasSupabase } from '@/lib/supabase/config'
import { jsonRepo } from '@/lib/data/json-repo'
import { supabaseRepo } from '@/lib/data/supabase-repo'
import { OFFER_STATUSES, type Agent, type Offer, type PropertyType } from './types'

/**
 * Jedyne wejscie do danych dla strony publicznej.
 *
 * Zrodlo wybiera sie samo: jest baza - czytamy z bazy, nie ma - z pliku JSON
 * zassanego ze starej strony. Reszta aplikacji nie wie, ktore z nich dziala.
 */
function repo() {
  return hasSupabase() ? supabaseRepo : jsonRepo
}

/** Wszystkie oferty, lacznie ze szkicami. Tylko dla panelu. */
export async function getAllOffers(): Promise<Offer[]> {
  return repo().offers()
}

export async function getPublicOffers(): Promise<Offer[]> {
  const offers = await repo().offers()
  return offers.filter((o) => OFFER_STATUSES[o.status].public)
}

export async function getOfferBySlug(slug: string): Promise<Offer | undefined> {
  const offers = await repo().offers()
  return offers.find((o) => o.slug === slug)
}

export async function getOffersByType(type: PropertyType): Promise<Offer[]> {
  const offers = await getPublicOffers()
  return offers.filter((o) => o.propertyType === type)
}

export async function getAgents(): Promise<Agent[]> {
  return repo().agents()
}

export async function getAgent(id: string | null): Promise<Agent | undefined> {
  if (!id) return undefined
  const agents = await repo().agents()
  return agents.find((a) => a.id === id)
}

export async function getOffersByAgent(agentId: string): Promise<Offer[]> {
  const offers = await getPublicOffers()
  return offers.filter((o) => o.agentId === agentId)
}

/** Zdjecie glowne - pierwsze w kolejnosci ustalonej w panelu. */
export function coverPhoto(offer: Offer): string | null {
  return offer.photos[0]?.url ?? null
}
