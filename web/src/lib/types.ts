/**
 * Model domenowy. Te typy sa jednym zrodlem prawdy dla panelu, strony
 * publicznej i migracji do Supabase - schemat bazy odwzorowuje je 1:1.
 */

export const PROPERTY_TYPES = {
  apartment: { slug: 'mieszkania', one: 'Mieszkanie', many: 'Mieszkania' },
  house: { slug: 'domy', one: 'Dom', many: 'Domy' },
  plot: { slug: 'dzialki', one: 'Działka', many: 'Działki' },
  commercial: { slug: 'lokale', one: 'Lokal', many: 'Lokale' },
} as const

export type PropertyType = keyof typeof PROPERTY_TYPES

export const TRANSACTION_TYPES = {
  sale: { label: 'Sprzedaż', suffix: 'na sprzedaż', slug: 'sprzedaz' },
  rent: { label: 'Wynajem', suffix: 'na wynajem', slug: 'wynajem' },
} as const

export type TransactionType = keyof typeof TRANSACTION_TYPES

export const MARKETS = {
  primary: { label: 'Pierwotny' },
  secondary: { label: 'Wtórny' },
} as const

export type Market = keyof typeof MARKETS

export const OFFER_STATUSES = {
  draft: { label: 'Szkic', public: false },
  published: { label: 'Opublikowana', public: true },
  reserved: { label: 'Zarezerwowana', public: true },
  sold: { label: 'Sprzedana', public: false },
  archived: { label: 'Archiwalna', public: false },
} as const

export type OfferStatus = keyof typeof OFFER_STATUSES

export type OfferPhoto = {
  id: string
  /** Sciezka w Supabase Storage albo /oferty/... dla plikow lokalnych. */
  url: string
  /** Opis pod zdjeciem - osobne pole, wymog wlascicieli. */
  caption: string | null
  sortOrder: number
}

export type Agent = {
  id: string
  slug: string
  fullName: string
  role: string
  licence: string | null
  phone: string | null
  email: string | null
  photoUrl: string | null
  bio: string | null
}

/** Dodatkowy parametr oferty (rok budowy, ogrzewanie, winda...). */
export type OfferAttribute = {
  label: string
  value: string
}

export type Offer = {
  id: string
  /** CZN-MS-1238 */
  offerNumber: string
  slug: string
  title: string
  propertyType: PropertyType
  transactionType: TransactionType
  market: Market | null
  status: OfferStatus
  isExclusive: boolean

  price: number
  /** Metry kwadratowe. */
  area: number | null
  rooms: number | null
  floor: number | null
  totalFloors: number | null

  city: string
  district: string | null
  /** Pelny zapis lokalizacji z ulica, jesli podana. */
  addressLine: string | null

  description: string
  attributes: OfferAttribute[]
  photos: OfferPhoto[]
  agentId: string | null

  createdAt: string
  updatedAt: string
}

/** Cena za m2 jest zawsze liczona, nigdy wpisywana recznie. */
export function pricePerM2(offer: Pick<Offer, 'price' | 'area'>): number | null {
  if (!offer.area || offer.area <= 0) return null
  return offer.price / offer.area
}
