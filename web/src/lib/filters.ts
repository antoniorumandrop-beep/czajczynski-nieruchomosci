/**
 * Filtry i sortowanie listy ofert.
 *
 * Caly stan siedzi w query stringu, po polsku, np.
 *   /oferty?transakcja=wynajem&miasto=Wroclaw&cena_do=3000&sort=cena-rosnaco
 *
 * Dzieki temu dziala przycisk "wstecz", da sie wyslac klientowi link do
 * odfiltrowanej listy, a Google indeksuje kazde ustawienie osobno.
 */
import { PROPERTY_TYPES, pricePerM2, type Offer, type PropertyType } from './types.ts'
import { slugify } from './format.ts'

export const SORTS = {
  najnowsze: { label: 'Od najnowszych' },
  najstarsze: { label: 'Od najstarszych' },
  'cena-rosnaco': { label: 'Cena: od najniższej' },
  'cena-malejaco': { label: 'Cena: od najwyższej' },
  'm2-rosnaco': { label: 'Powierzchnia: od najmniejszej' },
  'm2-malejaco': { label: 'Powierzchnia: od największej' },
} as const

export type SortKey = keyof typeof SORTS
export const DEFAULT_SORT: SortKey = 'najnowsze'

export type Filters = {
  transakcja: 'sprzedaz' | 'wynajem' | null
  typ: PropertyType | null
  miasto: string | null
  dzielnica: string | null
  rynek: 'pierwotny' | 'wtorny' | null
  cena_od: number | null
  cena_do: number | null
  m2_od: number | null
  m2_do: number | null
  cena_m2_od: number | null
  cena_m2_do: number | null
  pokoje_od: number | null
  pietro_od: number | null
  pietro_do: number | null
  sort: SortKey
}

export type RawParams = Record<string, string | string[] | undefined>

const TYPE_BY_SLUG = Object.fromEntries(
  (Object.keys(PROPERTY_TYPES) as PropertyType[]).map((t) => [PROPERTY_TYPES[t].slug, t]),
) as Record<string, PropertyType>

function str(params: RawParams, key: string): string | null {
  const v = params[key]
  const s = Array.isArray(v) ? v[0] : v
  return s && s.trim() ? s.trim() : null
}

function int(params: RawParams, key: string): number | null {
  const s = str(params, key)
  if (s === null) return null
  const n = Number(s.replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export function parseFilters(params: RawParams): Filters {
  const transakcja = str(params, 'transakcja')
  const rynek = str(params, 'rynek')
  const sort = str(params, 'sort')
  const typ = str(params, 'typ')

  return {
    transakcja: transakcja === 'sprzedaz' || transakcja === 'wynajem' ? transakcja : null,
    typ: typ && typ in TYPE_BY_SLUG ? TYPE_BY_SLUG[typ] : null,
    miasto: str(params, 'miasto'),
    dzielnica: str(params, 'dzielnica'),
    rynek: rynek === 'pierwotny' || rynek === 'wtorny' ? rynek : null,
    cena_od: int(params, 'cena_od'),
    cena_do: int(params, 'cena_do'),
    m2_od: int(params, 'm2_od'),
    m2_do: int(params, 'm2_do'),
    cena_m2_od: int(params, 'cena_m2_od'),
    cena_m2_do: int(params, 'cena_m2_do'),
    pokoje_od: int(params, 'pokoje_od'),
    pietro_od: int(params, 'pietro_od'),
    pietro_do: int(params, 'pietro_do'),
    sort: sort && sort in SORTS ? (sort as SortKey) : DEFAULT_SORT,
  }
}

/** Ile filtrow jest realnie ustawionych - do plakietki "Filtry (3)". */
export function activeFilterCount(f: Filters): number {
  const { sort: _sort, ...rest } = f
  return Object.values(rest).filter((v) => v !== null).length
}

export function applyFilters(offers: Offer[], f: Filters): Offer[] {
  const out = offers.filter((o) => {
    if (f.transakcja && o.transactionType !== (f.transakcja === 'sprzedaz' ? 'sale' : 'rent')) {
      return false
    }
    if (f.typ && o.propertyType !== f.typ) return false
    if (f.miasto && slugify(o.city) !== slugify(f.miasto)) return false
    if (f.dzielnica && slugify(o.district ?? '') !== slugify(f.dzielnica)) return false
    if (f.rynek && o.market !== (f.rynek === 'pierwotny' ? 'primary' : 'secondary')) return false

    if (f.cena_od !== null && o.price < f.cena_od) return false
    if (f.cena_do !== null && o.price > f.cena_do) return false

    if (f.m2_od !== null && (o.area === null || o.area < f.m2_od)) return false
    if (f.m2_do !== null && (o.area === null || o.area > f.m2_do)) return false

    if (f.cena_m2_od !== null || f.cena_m2_do !== null) {
      const ppm = pricePerM2(o)
      if (ppm === null) return false
      if (f.cena_m2_od !== null && ppm < f.cena_m2_od) return false
      if (f.cena_m2_do !== null && ppm > f.cena_m2_do) return false
    }

    if (f.pokoje_od !== null && (o.rooms === null || o.rooms < f.pokoje_od)) return false
    if (f.pietro_od !== null && (o.floor === null || o.floor < f.pietro_od)) return false
    if (f.pietro_do !== null && (o.floor === null || o.floor > f.pietro_do)) return false

    return true
  })

  return sortOffers(out, f.sort)
}

export function sortOffers(offers: Offer[], sort: SortKey): Offer[] {
  const byDate = (a: Offer, b: Offer) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
    // przy identycznej dacie (import) rozstrzyga numer oferty, ktory rosnie w czasie
    numberSuffix(b.offerNumber) - numberSuffix(a.offerNumber)

  const copy = [...offers]
  switch (sort) {
    case 'cena-rosnaco':
      return copy.sort((a, b) => a.price - b.price)
    case 'cena-malejaco':
      return copy.sort((a, b) => b.price - a.price)
    case 'm2-rosnaco':
      return copy.sort((a, b) => (a.area ?? Infinity) - (b.area ?? Infinity))
    case 'm2-malejaco':
      return copy.sort((a, b) => (b.area ?? -Infinity) - (a.area ?? -Infinity))
    case 'najstarsze':
      return copy.sort((a, b) => -byDate(a, b))
    default:
      return copy.sort(byDate)
  }
}

function numberSuffix(offerNumber: string): number {
  const m = /(\d+)$/.exec(offerNumber)
  return m ? Number(m[1]) : 0
}

/** Opcje lokalizacji budowane z tego, co faktycznie jest w bazie. */
export function locationOptions(offers: Offer[]) {
  const cities = new Map<string, number>()
  const districts = new Map<string, { city: string; count: number }>()

  for (const o of offers) {
    cities.set(o.city, (cities.get(o.city) ?? 0) + 1)
    if (o.district) {
      const cur = districts.get(o.district)
      districts.set(o.district, { city: o.city, count: (cur?.count ?? 0) + 1 })
    }
  }

  return {
    cities: [...cities.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pl')),
    districts: [...districts.entries()]
      .map(([name, v]) => ({ name, city: v.city, count: v.count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pl')),
  }
}

/** Buduje query string, pomijajac wartosci puste i domyslne. */
export function buildQuery(f: Partial<Filters>): string {
  const p = new URLSearchParams()
  for (const [key, value] of Object.entries(f)) {
    if (value === null || value === undefined || value === '') continue
    if (key === 'sort' && value === DEFAULT_SORT) continue
    if (key === 'typ') {
      p.set(key, PROPERTY_TYPES[value as PropertyType].slug)
      continue
    }
    p.set(key, String(value))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}
