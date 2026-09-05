import offersJson from '@/data/offers.json'
import agentsJson from '@/data/agents.json'
import type { Agent, Offer } from '@/lib/types'

/**
 * Zrodlo zapasowe: dane zassane ze starej strony, trzymane w repozytorium.
 * Dziala bez zadnej konfiguracji, dzieki czemu strona stoi zanim powstanie baza.
 */
const OFFERS = offersJson as unknown as Offer[]
const AGENTS = agentsJson as unknown as Agent[]

export const jsonRepo = {
  async offers(): Promise<Offer[]> {
    return OFFERS
  },
  async agents(): Promise<Agent[]> {
    return AGENTS
  },
}
