'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type LoginState = { error?: string }

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const back = String(formData.get('powrot') ?? '/panel')

  if (!email || !password) {
    return { error: 'Podaj adres e-mail i hasło.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // nie zdradzamy, czy chodzi o zly adres czy zle haslo - to podpowiedz dla
    // kogos, kto zgaduje, a dla wlasciciela i tak nic nie zmienia
    return { error: 'Nieprawidłowy e-mail lub hasło.' }
  }

  redirect(back.startsWith('/panel') ? back : '/panel')
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/panel/logowanie')
}
