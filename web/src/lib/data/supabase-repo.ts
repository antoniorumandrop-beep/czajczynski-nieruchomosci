import 'server-only'
import { createPublicClient } from '@/lib/supabase/public'
import { storagePublicUrl } from '@/lib/supabase/config'
import type { Agent, Offer, OfferAttribute, OfferPhoto } from '@/lib/types'

type PhotoRow = {
  id: string
  storage_path: string
  caption: string | null
  sort_order: number
}

type OfferRow = {
  id: string
  offer_number: string
  slug: string
  title: string
  property_type: Offer['propertyType']
  transaction_type: Offer['transactionType']
  market: Offer['market']
  status: Offer['status']
  is_exclusive: boolean
  price: number | string
  area: number | string | null
  rooms: number | null
  floor: number | null
  total_floors: number | null
  city: string
  district: string | null
  address_line: string | null
  description: string
  attributes: unknown
  agent_id: string | null
  created_at: string
  updated_at: string
  offer_photos: PhotoRow[] | null
}

type AgentRow = {
  id: string
  slug: string
  full_name: string
  role: string
  licence: string | null
  phone: string | null
  email: string | null
  photo_path: string | null
  bio: string | null
}

const OFFER_COLUMNS = `
  id, offer_number, slug, title, property_type, transaction_type, market, status,
  is_exclusive, price, area, rooms, floor, total_floors, city, district, address_line,
  description, attributes, agent_id, created_at, updated_at,
  offer_photos ( id, storage_path, caption, sort_order )
`

/** numeric z Postgresa wraca jako string - inaczej cena bylaby tekstem. */
function num(v: number | string | null): number | null {
  if (v === null) return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

function toAttributes(raw: unknown): OfferAttribute[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return []
    const { label, value } = item as Record<string, unknown>
    if (typeof label !== 'string' || typeof value !== 'string' || !value) return []
    return [{ label, value }]
  })
}

function toPhotos(rows: PhotoRow[] | null): OfferPhoto[] {
  return (rows ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => ({
      id: p.id,
      url: storagePublicUrl(p.storage_path),
      caption: p.caption,
      sortOrder: p.sort_order,
    }))
}

export function toOffer(row: OfferRow): Offer {
  return {
    id: row.id,
    offerNumber: row.offer_number,
    slug: row.slug,
    title: row.title,
    propertyType: row.property_type,
    transactionType: row.transaction_type,
    market: row.market,
    status: row.status,
    isExclusive: row.is_exclusive,
    price: num(row.price) ?? 0,
    area: num(row.area),
    rooms: row.rooms,
    floor: row.floor,
    totalFloors: row.total_floors,
    city: row.city,
    district: row.district,
    addressLine: row.address_line,
    description: row.description,
    attributes: toAttributes(row.attributes),
    photos: toPhotos(row.offer_photos),
    agentId: row.agent_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toAgent(row: AgentRow): Agent {
  return {
    id: row.id,
    slug: row.slug,
    fullName: row.full_name,
    role: row.role,
    licence: row.licence,
    phone: row.phone,
    email: row.email,
    photoUrl: row.photo_path ? storagePublicUrl(row.photo_path) : null,
    bio: row.bio,
  }
}

export const supabaseRepo = {
  async offers(): Promise<Offer[]> {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('offers')
      .select(OFFER_COLUMNS)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Nie udało się pobrać ofert: ${error.message}`)
    return ((data ?? []) as unknown as OfferRow[]).map(toOffer)
  },

  async agents(): Promise<Agent[]> {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('agents')
      .select('id, slug, full_name, role, licence, phone, email, photo_path, bio')
      .order('sort_order', { ascending: true })

    if (error) throw new Error(`Nie udało się pobrać agentów: ${error.message}`)
    return ((data ?? []) as unknown as AgentRow[]).map(toAgent)
  },
}
