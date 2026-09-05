/**
 * Formatowanie liczb i odmiana polskich rzeczownikow.
 * Wydzielone, bo "2 pokoje" kontra "5 pokoi" wychodzi zle w kazdym miejscu,
 * w ktorym ktos wpisze to z palca.
 */

const PLN = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
})

const PLN_PRECISE = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const AREA = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatPrice(value: number): string {
  return PLN.format(value)
}

export function formatPricePerM2(value: number | null): string | null {
  return value === null ? null : `${PLN_PRECISE.format(value)}/m²`
}

export function formatArea(value: number | null): string | null {
  return value === null ? null : `${AREA.format(value)} m²`
}

/**
 * Polska odmiana przez liczebnik: 1 pokój / 2-4 pokoje / 5+ pokoi.
 * Wyjatek na 12-14, ktore mimo koncowki 2-4 ida do formy mnogiej dopelniaczowej.
 */
export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n)
  if (abs === 1) return one
  const lastTwo = abs % 100
  const last = abs % 10
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return few
  return many
}

export function rooms(n: number): string {
  return `${n} ${plural(n, 'pokój', 'pokoje', 'pokoi')}`
}

export function offersCount(n: number): string {
  return `${n} ${plural(n, 'oferta', 'oferty', 'ofert')}`
}

export function photosCount(n: number): string {
  return `${n} ${plural(n, 'zdjęcie', 'zdjęcia', 'zdjęć')}`
}

/** "Parter" czyta sie lepiej niz "0 piętro". */
export function floorLabel(floor: number | null, totalFloors?: number | null): string | null {
  if (floor === null) return null
  const base = floor === 0 ? 'Parter' : `${floor}. piętro`
  return totalFloors ? `${base} z ${totalFloors}` : base
}

/** Slug bezpieczny dla URL-a, z polskimi znakami zamienionymi na laciNskie. */
export function slugify(input: string): string {
  const map: Record<string, string> = {
    ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
    Ą: 'a', Ć: 'c', Ę: 'e', Ł: 'l', Ń: 'n', Ó: 'o', Ś: 's', Ź: 'z', Ż: 'z',
  }
  return input
    .replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (c) => map[c])
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
