import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { hasSupabase } from '@/lib/supabase/config'
import { panelOffer } from '@/lib/panel/data'
import type { Offer } from '@/lib/types'

/**
 * Podglad szkicu dla zalogowanego personelu.
 *
 * Strona oferty czyta dane klientem bez sesji, wiec RLS slusznie ukrywa przed
 * nia szkice. Ale wlasciciele musza zobaczyc oferte dokladnie tak, jak zobaczy
 * ja klient, ZANIM ja opublikuja - inaczej publikuja w ciemno.
 *
 * Zwraca oferte tylko wtedy, gdy pytajacy jest zalogowany.
 */
export async function draftPreview(slug: string): Promise<Offer | null> {
  if (!hasSupabase()) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from('offers').select('id').eq('slug', slug).maybeSingle()
  if (!data) return null

  return panelOffer(data.id as string)
}
