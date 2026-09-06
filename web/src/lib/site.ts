/** Dane biura w jednym miejscu - powtarzaja sie w stopce, kontakcie i danych strukturalnych. */
export const CONTACT = {
  name: 'Czajczyński Nieruchomości',
  street: 'ul. Białoskórnicza 10',
  postal: '50-134',
  city: 'Wrocław',
  phone: '71 794 49 83',
  phoneRaw: '+48717944983',
  email: 'oferty@superlokum.pl',
} as const

/**
 * Adres publiczny strony. Na Vercelu ustawiamy NEXT_PUBLIC_SITE_URL;
 * lokalnie i w podgladach PR-owych spada na adres deploymentu.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000'
}

/**
 * Adres bezwzgledny dla tagow Open Graph i danych strukturalnych.
 *
 * Sciezki zdjec przychodza w dwoch postaciach: wzglednej (/oferty/...) gdy
 * zrodlem jest plik JSON, i pelnej gdy zrodlem jest Supabase Storage.
 * Doklejenie domeny do tej drugiej dawalo adres sklejony z dwoch, przez co
 * Facebook nie mial czego pokazac w podgladzie linku.
 */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${siteUrl()}${path.startsWith('/') ? '' : '/'}${path}`
}
