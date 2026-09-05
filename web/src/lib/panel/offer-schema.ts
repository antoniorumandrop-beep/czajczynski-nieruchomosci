import { z } from 'zod'
import { slugify } from '@/lib/format'
import {
  PROPERTY_TYPES,
  TRANSACTION_TYPES,
  type PropertyType,
  type TransactionType,
} from '@/lib/types'

/** "1 234,56" albo "1234.56" -> 1234.56; puste -> null */
const decimal = z
  .string()
  .trim()
  .transform((v) => v.replace(/\s/g, '').replace(',', '.'))
  .transform((v) => (v === '' ? null : Number(v)))
  .refine((v) => v === null || Number.isFinite(v), 'Wpisz liczbę')

const integer = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : Number(v.replace(/\s/g, ''))))
  .refine((v) => v === null || Number.isInteger(v), 'Wpisz liczbę całkowitą')

export const offerFormSchema = z
  .object({
    id: z.string().trim().optional(),
    propertyType: z.enum(Object.keys(PROPERTY_TYPES) as [PropertyType, ...PropertyType[]]),
    transactionType: z.enum(
      Object.keys(TRANSACTION_TYPES) as [TransactionType, ...TransactionType[]],
    ),
    market: z.enum(['primary', 'secondary', '']).transform((v) => (v === '' ? null : v)),
    status: z.enum(['draft', 'published', 'reserved', 'sold', 'archived']),
    isExclusive: z.string().optional().transform((v) => v === 'on'),
    agentId: z.string().trim().transform((v) => v || null),

    price: decimal.refine((v) => v !== null && v > 0, 'Podaj cenę'),
    area: decimal.refine((v) => v === null || v > 0, 'Powierzchnia musi być większa od zera'),
    rooms: integer.refine((v) => v === null || v > 0, 'Liczba pokoi musi być większa od zera'),
    floor: integer,
    totalFloors: integer.refine((v) => v === null || v > 0, 'Podaj poprawną liczbę pięter'),

    city: z.string().trim().min(2, 'Podaj miasto').max(80),
    district: z.string().trim().max(80).transform((v) => v || null),
    addressLine: z.string().trim().max(200).transform((v) => v || null),

    description: z.string().trim().max(20000),
  })
  .superRefine((v, ctx) => {
    // dzialka nie ma pokoi ani pieter - baza tego pilnuje, ale komunikat
    // z formularza jest czytelniejszy niz blad z Postgresa
    if (v.propertyType === 'plot') {
      if (v.rooms !== null) {
        ctx.addIssue({ code: 'custom', path: ['rooms'], message: 'Działka nie ma pokoi' })
      }
      if (v.floor !== null) {
        ctx.addIssue({ code: 'custom', path: ['floor'], message: 'Działka nie ma pięter' })
      }
    }
    if (v.floor !== null && v.totalFloors !== null && v.floor > v.totalFloors) {
      ctx.addIssue({
        code: 'custom',
        path: ['floor'],
        message: 'Piętro nie może być wyższe niż liczba pięter w budynku',
      })
    }
  })

export type OfferFormValues = z.infer<typeof offerFormSchema>

const TYPE_LETTER: Record<PropertyType, string> = {
  apartment: 'M',
  house: 'D',
  plot: 'G',
  commercial: 'L',
}

/** CZN-MS-1239 - firma, typ, transakcja, kolejny numer. */
export function nextOfferNumber(
  type: PropertyType,
  transaction: TransactionType,
  existingNumbers: string[],
): string {
  const max = existingNumbers.reduce((acc, n) => {
    const m = /(\d+)$/.exec(n)
    return m ? Math.max(acc, Number(m[1])) : acc
  }, 1000)
  const letter = TYPE_LETTER[type]
  const trans = transaction === 'sale' ? 'S' : 'W'
  return `CZN-${letter}${trans}-${max + 1}`
}

export function buildSlug(
  type: PropertyType,
  transaction: TransactionType,
  city: string,
  district: string | null,
  offerNumber: string,
): string {
  return slugify(
    [
      PROPERTY_TYPES[type].one,
      TRANSACTION_TYPES[transaction].suffix,
      city,
      district ?? '',
      offerNumber,
    ].join(' '),
  )
}
