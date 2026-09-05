import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { toOffer } from '@/lib/data/supabase-repo'
import type { Agent, Offer } from '@/lib/types'

export type InquiryRow = {
  id: string
  offerId: string | null
  offerNumber: string | null
  name: string
  contact: string
  message: string
  isRead: boolean
  createdAt: string
}

const OFFER_COLUMNS = `
  id, offer_number, slug, title, property_type, transaction_type, market, status,
  is_exclusive, price, area, rooms, floor, total_floors, city, district, address_line,
  description, attributes, agent_id, created_at, updated_at,
  offer_photos ( id, storage_path, caption, sort_order )
`

/** Wszystkie oferty lacznie ze szkicami - RLS przepuszcza to tylko personelowi. */
export async function panelOffers(): Promise<Offer[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_COLUMNS)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Nie udało się pobrać ofert: ${error.message}`)
  return ((data ?? []) as never[]).map(toOffer)
}

export async function panelOffer(id: string): Promise<Offer | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  return toOffer(data as never)
}

export async function panelAgents(): Promise<Agent[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('agents')
    .select('id, slug, full_name, role, licence, phone, email, photo_path, bio')
    .order('sort_order', { ascending: true })

  return (data ?? []).map((a) => ({
    id: a.id as string,
    slug: a.slug as string,
    fullName: a.full_name as string,
    role: a.role as string,
    licence: a.licence as string | null,
    phone: a.phone as string | null,
    email: a.email as string | null,
    photoUrl: null,
    bio: a.bio as string | null,
  }))
}

export async function panelInquiries(): Promise<InquiryRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inquiries')
    .select('id, offer_id, offer_number, name, contact, message, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw new Error(`Nie udało się pobrać zapytań: ${error.message}`)
  return (data ?? []).map((r) => ({
    id: r.id as string,
    offerId: r.offer_id as string | null,
    offerNumber: r.offer_number as string | null,
    name: r.name as string,
    contact: r.contact as string,
    message: r.message as string,
    isRead: r.is_read as boolean,
    createdAt: r.created_at as string,
  }))
}
