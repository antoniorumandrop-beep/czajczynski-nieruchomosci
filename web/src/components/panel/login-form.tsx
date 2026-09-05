'use client'

import { useActionState } from 'react'
import { login, type LoginState } from '@/app/panel/auth-actions'

const INITIAL: LoginState = {}

export function LoginForm({ back }: { back: string }) {
  const [state, action, pending] = useActionState(login, INITIAL)

  return (
    <form action={action}>
      <input type="hidden" name="powrot" value={back} />

      <label className="block">
        <span className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">
          Adres e-mail
        </span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          autoFocus
          className="text-body mt-2 h-12 w-full border border-[#1E1B18]/20 bg-white px-3.5 text-[16px] outline-none transition-colors focus:border-[#8A6A3B]"
        />
      </label>

      <label className="mt-5 block">
        <span className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">Hasło</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="text-body mt-2 h-12 w-full border border-[#1E1B18]/20 bg-white px-3.5 text-[16px] outline-none transition-colors focus:border-[#8A6A3B]"
        />
      </label>

      {state.error ? (
        <p role="alert" className="text-body mt-4 text-[14px] text-[#A33A2A]">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="text-body mt-7 h-12 w-full bg-[#1E1B18] text-[15px] font-medium text-[#F6F2EC] transition-colors hover:bg-[#8A6A3B] disabled:opacity-60"
      >
        {pending ? 'Logowanie…' : 'Zaloguj się'}
      </button>

      <p className="text-body mt-5 text-[13px] text-[#8C857C]">
        Konta zakłada administrator strony. Jeśli hasło nie działa, zadzwoń zamiast klikać
        wielokrotnie — po kilku próbach Supabase czasowo blokuje logowanie.
      </p>
    </form>
  )
}
