import 'server-only'
import { z } from 'zod'

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

/**
 * Zapis zapytania z formularza.
 *
 * Docelowo: insert do tabeli `inquiries` w Supabase plus powiadomienie mailem
 * na adres biura. Do czasu podpiecia bazy zapisujemy do logu serwera, zeby
 * formularz dzialal end-to-end i dalo sie go przetestowac.
 */
export async function saveInquiry(data: Inquiry): Promise<void> {
  console.info('[zapytanie]', {
    ...data,
    website: undefined,
    receivedAt: new Date().toISOString(),
  })
}
