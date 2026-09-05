import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config'

/**
 * Klient serwerowy zwiazany z sesja uzytkownika.
 * Tworzymy nowy przy kazdym renderze - klienta nie wolno wspoldzielic
 * miedzy zadaniami, bo niesie ze soba cudza sesje.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server Component nie moze ustawiac ciasteczek - odswiezanie sesji
          // robi proxy.ts, wiec ten brak jest bezpieczny
        }
      },
    },
  })
}
