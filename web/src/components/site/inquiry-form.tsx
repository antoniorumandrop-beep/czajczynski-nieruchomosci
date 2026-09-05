'use client'

import { useActionState } from 'react'
import { Check } from 'lucide-react'
import { submitInquiry, type InquiryState } from '@/app/actions'

const INITIAL: InquiryState = { status: 'idle' }

export function InquiryForm({
  offerId,
  offerNumber,
  heading = 'Zapytaj o tę nieruchomość',
  compact = false,
}: {
  offerId?: string
  offerNumber?: string
  heading?: string
  compact?: boolean
}) {
  const [state, action, pending] = useActionState(submitInquiry, INITIAL)

  if (state.status === 'ok') {
    return (
      <div className="border border-[#3F7A45]/30 bg-[#EFF4EC] p-6">
        <p className="text-heading flex items-center gap-2 font-serif text-xl text-[#2C5731]">
          <Check className="size-5" aria-hidden />
          Wiadomość wysłana
        </p>
        <p className="text-body mt-2 text-[15px] text-[#3D5540]">
          Odezwiemy się w ciągu jednego dnia roboczego. Jeśli sprawa jest pilna, zadzwoń pod{' '}
          <a href="tel:+48717944983" className="underline underline-offset-2">
            71 794 49 83
          </a>
          .
        </p>
      </div>
    )
  }

  const inputClass =
    'text-body mt-2 h-11 w-full border-b border-[#1E1B18]/25 bg-transparent text-[16px] outline-none transition-colors focus:border-[#8A6A3B]'
  const labelClass = 'text-micro text-[11px] font-semibold text-[#8C857C] uppercase'

  return (
    <form action={action} noValidate>
      {heading ? <p className="text-heading font-serif text-2xl">{heading}</p> : null}
      {offerNumber ? (
        <p className="text-body mt-2 text-[14px] text-[#8C857C]">
          Dotyczy oferty {offerNumber}
        </p>
      ) : null}

      <input type="hidden" name="offerId" value={offerId ?? ''} />
      <input type="hidden" name="offerNumber" value={offerNumber ?? ''} />
      {/* pulapka na boty - ukryta przed ludzmi i przed czytnikami ekranu */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden">
        <label>
          Nie wypełniaj tego pola
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={compact ? 'mt-5 space-y-4' : 'mt-6 space-y-5'}>
        <Field
          label="Imię i nazwisko"
          name="name"
          autoComplete="name"
          error={state.fieldErrors?.name}
          inputClass={inputClass}
          labelClass={labelClass}
        />
        <Field
          label="Telefon lub e-mail"
          name="contact"
          autoComplete="tel email"
          error={state.fieldErrors?.contact}
          inputClass={inputClass}
          labelClass={labelClass}
        />
        <label className="block">
          <span className={labelClass}>Wiadomość</span>
          <textarea
            name="message"
            rows={compact ? 3 : 4}
            defaultValue={
              offerNumber ? `Dzień dobry, proszę o kontakt w sprawie oferty ${offerNumber}.` : ''
            }
            aria-invalid={Boolean(state.fieldErrors?.message)}
            className="text-body mt-2 w-full border-b border-[#1E1B18]/25 bg-transparent py-2 text-[16px] outline-none transition-colors focus:border-[#8A6A3B]"
          />
          {state.fieldErrors?.message ? (
            <span className="text-body mt-1.5 block text-[13px] text-[#A33A2A]">
              {state.fieldErrors.message}
            </span>
          ) : null}
        </label>
      </div>

      {state.status === 'error' && state.message ? (
        <p role="alert" className="text-body mt-5 text-[14px] text-[#A33A2A]">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="text-body mt-7 h-12 w-full bg-[#1E1B18] text-[15px] font-medium text-[#F6F2EC] transition-colors hover:bg-[#8A6A3B] disabled:opacity-60"
      >
        {pending ? 'Wysyłanie…' : 'Wyślij wiadomość'}
      </button>

      <p className="text-body mt-4 text-[13px] text-[#8C857C]">
        Dane wykorzystamy wyłącznie do odpowiedzi na to zapytanie.
      </p>
    </form>
  )
}

function Field({
  label,
  name,
  autoComplete,
  error,
  inputClass,
  labelClass,
}: {
  label: string
  name: string
  autoComplete?: string
  error?: string
  inputClass: string
  labelClass: string
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        type="text"
        name={name}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        className={inputClass}
      />
      {error ? (
        <span className="text-body mt-1.5 block text-[13px] text-[#A33A2A]">{error}</span>
      ) : null}
    </label>
  )
}
