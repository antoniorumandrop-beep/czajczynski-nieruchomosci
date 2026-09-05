import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL } from './config'

/**
 * Klient z kluczem service_role - OMIJA RLS.
 *
 * Wolno go uzywac wylacznie w kodzie, ktory nigdy nie trafia do przegladarki:
 * zapis zapytan z formularza i skrypt importu. Nigdy w komponencie klienckim.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !key) {
    throw new Error(
      'Brak SUPABASE_SERVICE_ROLE_KEY albo NEXT_PUBLIC_SUPABASE_URL w .env.local',
    )
  }
  return createSupabaseClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
