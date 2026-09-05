import 'server-only'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { hasSupabase } from '@/lib/supabase/config'

export const inquirySchema = z.object({
  name: z.string().trim().min(2, 'Podaj imię i nazwisko').max(120),
  contact: z
    .string()
    .trim()
    .min(6, 'Podaj telefon albo adres e-mail')
    .max(160)
    .refine(
      (v) => /@/.test(v) || /\d[\d\s()+-]{6,}/.test(v),
      'To nie wygląda na numer telefonu ani adres e-mail',
    ),
  message: z.string().trim().min(5, 'Napisz kilka słów').max(4000),
  offerId: z.string().trim().max(80).optional(),
  offerNumber: z.string().trim().max(40).optional(),
  /** Pole pulapka - boty je wypelniaja, ludzie go nie widza. */
  website: z.string().max(0).optional(),
})

export type Inquiry = z.infer<typeof inquirySchema>

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Zapis zapytania z formularza.
 *
 * Jest baza - piszemy do tabeli `inquiries`. Nie ma - do logu serwera,
 * zeby formularz dzialal end-to-end takze przed podpieciem Supabase.
 *
 * Uzywamy klienta z sesja goscia (anon), nie service_role: polityka RLS
 * pozwala kazdemu na INSERT i nikomu z zewnatrz na SELECT, wiec podniesienie
 * uprawnien nie jest tu do niczego potrzebne.
 */
export async function saveInquiry(data: Inquiry): Promise<void> {
  if (!hasSupabase()) {
    console.info('[zapytanie]', {
      ...data,
      website: undefined,
      receivedAt: new Date().toISOString(),
    })
    return
  }

  const supabase = await createClient()
  const { error } = await supabase.from('inquiries').insert({
    // przy danych z pliku JSON offerId nie jest UUID-em - wtedy zostaje sam numer
    offer_id: data.offerId && UUID.test(data.offerId) ? data.offerId : null,
    offer_number: data.offerNumber || null,
    name: data.name,
    contact: data.contact,
    message: data.message,
  })

  if (error) throw new Error(`Nie udało się zapisać zapytania: ${error.message}`)
}
