import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config'

/**
 * Klient do danych publicznych - bez ciasteczek i bez sesji.
 *
 * Strona publiczna pokazuje wszystkim to samo, wiec wiazanie zapytan z sesja
 * niczego nie wnosilo, a psulo dwie rzeczy: `cookies()` nie wolno wywolac
 * w `generateStaticParams` (leci wtedy przy budowaniu, bez zadnego zadania
 * HTTP), a kazda strona dotykajaca ciasteczek staje sie nieprzewidywalna dla
 * cache'a. RLS i tak przepuszcza gosciowi wylacznie opublikowane oferty.
 */
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
