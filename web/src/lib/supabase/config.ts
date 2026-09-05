export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * Dopoki klucze nie sa uzupelnione, aplikacja czyta oferty z pliku JSON
 * zassanego ze starej strony. Dzieki temu strona dziala od pierwszej minuty,
 * a podpiecie bazy jest zamiana trybu, nie przepisywaniem aplikacji.
 */
export function hasSupabase(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

export const PHOTO_BUCKET = 'offer-photos'

/** Publiczny adres pliku w Storage. */
export function storagePublicUrl(path: string): string {
  if (path.startsWith('/') || path.startsWith('http')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`
}
