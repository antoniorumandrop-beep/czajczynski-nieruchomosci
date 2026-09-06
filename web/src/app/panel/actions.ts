'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PHOTO_BUCKET } from '@/lib/supabase/config'
import { buildSlug, nextOfferNumber, offerFormSchema } from '@/lib/panel/offer-schema'
import type { OfferStatus } from '@/lib/types'

export type SaveState = {
  status: 'idle' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
}

/** Odswieza wszystko, na czym oferta sie pojawia. */
function revalidateOffer(slug?: string) {
  revalidatePath('/', 'layout')
  if (slug) revalidatePath(`/oferta/${slug}`)
}

export async function saveOffer(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const raw = Object.fromEntries(
    [
      'id', 'propertyType', 'transactionType', 'market', 'status', 'isExclusive', 'agentId',
      'price', 'area', 'rooms', 'floor', 'totalFloors', 'city', 'district', 'addressLine',
      'description',
    ].map((k) => [k, String(formData.get(k) ?? '')]),
  )

  const parsed = offerFormSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '')
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { status: 'error', message: 'Sprawdź zaznaczone pola.', fieldErrors }
  }

  const v = parsed.data
  const supabase = await createClient()

  const payload = {
    property_type: v.propertyType,
    transaction_type: v.transactionType,
    market: v.market,
    status: v.status,
    is_exclusive: v.isExclusive,
    agent_id: v.agentId,
    price: v.price,
    area: v.area,
    rooms: v.rooms,
    floor: v.floor,
    total_floors: v.totalFloors,
    city: v.city,
    district: v.district,
    address_line: v.addressLine,
    description: v.description,
  }

  if (v.id) {
    const { data: existing, error: readError } = await supabase
      .from('offers')
      .select('offer_number, slug, published_at')
      .eq('id', v.id)
      .single()

    if (readError || !existing) {
      return { status: 'error', message: 'Nie znaleziono tej oferty.' }
    }

    // Adres oferty zamraza sie w chwili pierwszej publikacji. Wlasciciele
    // rozsylaja linki na Facebooku i mailem - poprawka literowki w nazwie
    // dzielnicy nie moze ich zabijac. Szkic mozna jeszcze przeslugowac.
    const slug = existing.published_at
      ? (existing.slug as string)
      : buildSlug(v.propertyType, v.transactionType, v.city, v.district, existing.offer_number)
    const title = buildTitle(v.propertyType, v.transactionType, v.city, v.district)

    const { error } = await supabase
      .from('offers')
      .update({ ...payload, slug, title })
      .eq('id', v.id)

    if (error) return { status: 'error', message: `Nie udało się zapisać: ${error.message}` }

    revalidateOffer(existing.slug)
    revalidateOffer(slug)
    redirect(`/panel/oferty/${v.id}?zapisano=1`)
  }

  // nowa oferta: numer nadajemy sami, na podstawie najwyzszego w bazie
  const { data: numbers } = await supabase.from('offers').select('offer_number')
  const offerNumber = nextOfferNumber(
    v.propertyType,
    v.transactionType,
    (numbers ?? []).map((n) => n.offer_number as string),
  )
  const slug = buildSlug(v.propertyType, v.transactionType, v.city, v.district, offerNumber)

  const { data: created, error } = await supabase
    .from('offers')
    .insert({
      ...payload,
      offer_number: offerNumber,
      slug,
      title: buildTitle(v.propertyType, v.transactionType, v.city, v.district),
    })
    .select('id')
    .single()

  if (error || !created) {
    return { status: 'error', message: `Nie udało się dodać oferty: ${error?.message ?? ''}` }
  }

  revalidateOffer(slug)
  redirect(`/panel/oferty/${created.id}?utworzono=1`)
}

function buildTitle(
  type: OfferTypeArg,
  transaction: 'sale' | 'rent',
  city: string,
  district: string | null,
): string {
  const label = { apartment: 'Mieszkanie', house: 'Dom', plot: 'Działka', commercial: 'Lokal' }[type]
  const suffix = transaction === 'sale' ? 'na sprzedaż' : 'na wynajem'
  const where = [city, district].filter(Boolean).join(', ')
  return `${label} ${suffix}, ${where}`
}

type OfferTypeArg = 'apartment' | 'house' | 'plot' | 'commercial'

export async function setOfferStatus(id: string, status: OfferStatus): Promise<void> {
  const supabase = await createClient()
  const { data } = await supabase.from('offers').select('slug').eq('id', id).single()
  await supabase.from('offers').update({ status }).eq('id', id)
  revalidateOffer(data?.slug as string | undefined)
  revalidatePath('/panel/oferty')
}

export async function deleteOffer(id: string): Promise<void> {
  const supabase = await createClient()

  // pliki trzeba skasowac osobno - kaskada w bazie nie siega Storage
  const { data: photos } = await supabase
    .from('offer_photos')
    .select('storage_path')
    .eq('offer_id', id)

  const paths = (photos ?? []).map((p) => p.storage_path as string)
  if (paths.length > 0) await supabase.storage.from(PHOTO_BUCKET).remove(paths)

  await supabase.from('offers').delete().eq('id', id)
  revalidateOffer()
  redirect('/panel/oferty?usunieto=1')
}

// ---------------------------------------------------------------------
// Zdjecia
// ---------------------------------------------------------------------

export async function addPhoto(
  offerId: string,
  storagePath: string,
  width: number | null,
  height: number | null,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: last } = await supabase
    .from('offer_photos')
    .select('sort_order')
    .eq('offer_id', offerId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('offer_photos').insert({
    offer_id: offerId,
    storage_path: storagePath,
    sort_order: ((last?.sort_order as number | undefined) ?? -1) + 1,
    width,
    height,
  })

  if (error) return { error: error.message }
  revalidatePath(`/panel/oferty/${offerId}`)
  revalidateOffer()
  return {}
}

export async function updatePhotoCaption(
  photoId: string,
  offerId: string,
  caption: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const value = caption.trim()
  const { error } = await supabase
    .from('offer_photos')
    .update({ caption: value === '' ? null : value.slice(0, 300) })
    .eq('id', photoId)

  if (error) return { error: error.message }
  revalidatePath(`/panel/oferty/${offerId}`)
  revalidateOffer()
  return {}
}

export async function reorderPhotos(
  offerId: string,
  orderedIds: string[],
): Promise<{ error?: string }> {
  const supabase = await createClient()

  // Rownolegle, nie po kolei: przy ofercie z 17 zdjeciami sekwencyjne
  // zapytania robily z przeciagniecia myszka sekundowa zwieche.
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('offer_photos').update({ sort_order: index }).eq('id', id).eq('offer_id', offerId),
    ),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) return { error: failed.error.message }

  revalidatePath(`/panel/oferty/${offerId}`)
  revalidateOffer()
  return {}
}

export async function deletePhoto(
  photoId: string,
  offerId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: photo } = await supabase
    .from('offer_photos')
    .select('storage_path')
    .eq('id', photoId)
    .single()

  const { error } = await supabase.from('offer_photos').delete().eq('id', photoId)
  if (error) return { error: error.message }

  if (photo?.storage_path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([photo.storage_path as string])
  }

  revalidatePath(`/panel/oferty/${offerId}`)
  revalidateOffer()
  return {}
}

// ---------------------------------------------------------------------
// Zapytania
// ---------------------------------------------------------------------

export async function setInquiryRead(id: string, isRead: boolean): Promise<void> {
  const supabase = await createClient()
  await supabase.from('inquiries').update({ is_read: isRead }).eq('id', id)
  revalidatePath('/panel/zapytania')
  revalidatePath('/panel')
}
