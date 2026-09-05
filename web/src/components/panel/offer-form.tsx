'use client'

import Link from 'next/link'
import { useActionState, useMemo, useState } from 'react'
import { ExternalLink, Info } from 'lucide-react'
import { saveOffer, type SaveState } from '@/app/panel/actions'
import { formatPricePerM2 } from '@/lib/format'
import {
  MARKETS,
  OFFER_STATUSES,
  PROPERTY_TYPES,
  TRANSACTION_TYPES,
  type Agent,
  type Offer,
  type OfferStatus,
  type PropertyType,
} from '@/lib/types'

const INITIAL: SaveState = { status: 'idle' }

const STATUS_HELP: Record<OfferStatus, string> = {
  draft: 'Widoczna tylko tutaj, w panelu. Klient jej nie zobaczy.',
  published: 'Widoczna na stronie i w wyszukiwarce Google.',
  reserved: 'Widoczna na stronie z adnotacją, że jest zarezerwowana.',
  sold: 'Zdjęta ze strony, zostaje w panelu do archiwum.',
  archived: 'Zdjęta ze strony i schowana z głównej listy w panelu.',
}

export function OfferForm({ offer, agents }: { offer?: Offer; agents: Agent[] }) {
  const [state, action, pending] = useActionState(saveOffer, INITIAL)

  const [propertyType, setPropertyType] = useState<PropertyType>(offer?.propertyType ?? 'apartment')
  const [price, setPrice] = useState(offer?.price ? String(offer.price) : '')
  const [area, setArea] = useState(offer?.area ? String(offer.area) : '')

  const isPlot = propertyType === 'plot'

  // cena za metr jest liczona, nigdy wpisywana - tu pokazujemy ja na zywo,
  // zeby wlasciciel od razu widzial, czy cena i metraz sie zgadzaja
  const perM2 = useMemo(() => {
    const p = Number(price.replace(/\s/g, '').replace(',', '.'))
    const a = Number(area.replace(/\s/g, '').replace(',', '.'))
    if (!Number.isFinite(p) || !Number.isFinite(a) || a <= 0 || p <= 0) return null
    return formatPricePerM2(p / a)
  }, [price, area])

  const err = state.fieldErrors ?? {}

  return (
    <form action={action} className="pb-28">
      {offer ? <input type="hidden" name="id" value={offer.id} /> : null}

      {state.status === 'error' && state.message ? (
        <p role="alert" className="mb-8 border border-[#A33A2A]/30 bg-[#FAEFED] px-4 py-3 text-[15px] text-[#A33A2A]">
          {state.message}
        </p>
      ) : null}

      <Section title="Co to za nieruchomość">
        <div className="grid gap-6 sm:grid-cols-2">
          <Select
            label="Rodzaj"
            name="propertyType"
            value={propertyType}
            onChange={(v) => setPropertyType(v as PropertyType)}
            options={(Object.keys(PROPERTY_TYPES) as PropertyType[]).map((t) => ({
              value: t,
              label: PROPERTY_TYPES[t].one,
            }))}
          />
          <Select
            label="Transakcja"
            name="transactionType"
            defaultValue={offer?.transactionType ?? 'sale'}
            options={Object.entries(TRANSACTION_TYPES).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
          />
          <Select
            label="Rynek"
            name="market"
            defaultValue={offer?.market ?? ''}
            hint="Zostaw puste przy wynajmie."
            options={[
              { value: '', label: 'Nie dotyczy' },
              ...Object.entries(MARKETS).map(([k, v]) => ({ value: k, label: v.label })),
            ]}
          />
          <Select
            label="Kto prowadzi ofertę"
            name="agentId"
            defaultValue={offer?.agentId ?? ''}
            options={[
              { value: '', label: 'Nie przypisano' },
              ...agents.map((a) => ({ value: a.id, label: a.fullName })),
            ]}
          />
        </div>

        <label className="mt-6 flex items-start gap-3">
          <input
            type="checkbox"
            name="isExclusive"
            defaultChecked={offer?.isExclusive ?? true}
            className="mt-1 size-5 accent-[#8A6A3B]"
          />
          <span>
            <span className="text-body block text-[16px] font-medium">Oferta na wyłączność</span>
            <span className="text-body block text-[14px] text-[#6B645B]">
              Widoczne na stronie oferty jako wyróżnienie.
            </span>
          </span>
        </label>
      </Section>

      <Section title="Cena i wielkość">
        <div className="grid gap-6 sm:grid-cols-2">
          <Input
            label="Cena (zł)"
            name="price"
            value={price}
            onChange={setPrice}
            inputMode="decimal"
            error={err.price}
            hint="Przy wynajmie: kwota miesięczna."
          />
          <Input
            label="Powierzchnia (m²)"
            name="area"
            value={area}
            onChange={setArea}
            inputMode="decimal"
            error={err.area}
          />
        </div>

        <div className="mt-4 flex items-center gap-2 bg-[#F1EBE2] px-4 py-3">
          <Info className="size-4 shrink-0 text-[#8A6A3B]" aria-hidden />
          <p className="text-body nums text-[15px] text-[#4A443D]">
            Cena za metr:{' '}
            <strong className="font-semibold">{perM2 ?? 'wpisz cenę i powierzchnię'}</strong>
            <span className="ml-2 text-[#8C857C]">— liczona automatycznie, nie trzeba wpisywać</span>
          </p>
        </div>

        {isPlot ? (
          <p className="text-body mt-6 text-[15px] text-[#6B645B]">
            Przy działce nie podaje się pokoi ani piętra — te pola są ukryte.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <Input
              label="Liczba pokoi"
              name="rooms"
              defaultValue={offer?.rooms ? String(offer.rooms) : ''}
              inputMode="numeric"
              error={err.rooms}
            />
            <Input
              label="Piętro"
              name="floor"
              defaultValue={offer?.floor !== null && offer?.floor !== undefined ? String(offer.floor) : ''}
              inputMode="numeric"
              error={err.floor}
              hint="Parter wpisz jako 0."
            />
            <Input
              label="Pięter w budynku"
              name="totalFloors"
              defaultValue={offer?.totalFloors ? String(offer.totalFloors) : ''}
              inputMode="numeric"
              error={err.totalFloors}
            />
          </div>
        )}

        {isPlot ? (
          <>
            <input type="hidden" name="rooms" value="" />
            <input type="hidden" name="floor" value="" />
            <input type="hidden" name="totalFloors" value="" />
          </>
        ) : null}
      </Section>

      <Section title="Gdzie">
        <div className="grid gap-6 sm:grid-cols-2">
          <Input label="Miasto" name="city" defaultValue={offer?.city ?? ''} error={err.city} />
          <Input
            label="Dzielnica"
            name="district"
            defaultValue={offer?.district ?? ''}
            error={err.district}
            hint="Np. Krzyki. Można zostawić puste."
          />
        </div>
        <div className="mt-6">
          <Input
            label="Pełny adres"
            name="addressLine"
            defaultValue={offer?.addressLine ?? ''}
            hint="Pokazywany na stronie oferty. Zostaw puste, jeśli adres ma nie być publiczny."
          />
        </div>
      </Section>

      <Section title="Opis">
        <label className="block">
          <span className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">
            Opis nieruchomości
          </span>
          <textarea
            name="description"
            rows={14}
            defaultValue={offer?.description ?? ''}
            className="text-body mt-2 w-full border border-[#1E1B18]/20 bg-white p-4 text-[16px] leading-relaxed outline-none transition-colors focus:border-[#8A6A3B]"
          />
          <span className="text-body mt-2 block text-[14px] text-[#6B645B]">
            Każdy akapit w nowej linii. Enter robi nowy akapit na stronie.
          </span>
        </label>
      </Section>

      <Section title="Widoczność">
        <fieldset>
          <legend className="sr-only">Status oferty</legend>
          <div className="space-y-2">
            {(Object.keys(OFFER_STATUSES) as OfferStatus[]).map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-start gap-3 border border-[#1E1B18]/15 bg-white p-4 transition-colors has-checked:border-[#8A6A3B] has-checked:bg-[#F1EBE2]"
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  defaultChecked={(offer?.status ?? 'draft') === s}
                  className="mt-1 size-4 accent-[#8A6A3B]"
                />
                <span>
                  <span className="text-body block text-[16px] font-medium">
                    {OFFER_STATUSES[s].label}
                  </span>
                  <span className="text-body block text-[14px] text-[#6B645B]">
                    {STATUS_HELP[s]}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </Section>

      {/* Pasek zapisu jest przyklejony u dolu - przy dlugim formularzu
          przycisk nie moze byc tylko na samym koncu strony */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1E1B18]/12 bg-[#F6F2EC]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-6 py-4">
          <button
            type="submit"
            disabled={pending}
            className="text-body h-12 flex-1 bg-[#1E1B18] px-6 text-[16px] font-medium text-[#F6F2EC] transition-colors hover:bg-[#8A6A3B] disabled:opacity-60 sm:flex-none"
          >
            {pending ? 'Zapisywanie…' : offer ? 'Zapisz zmiany' : 'Zapisz i dodaj zdjęcia'}
          </button>

          {offer ? (
            <Link
              href={`/oferta/${offer.slug}`}
              target="_blank"
              className="text-body inline-flex h-12 items-center gap-2 px-5 text-[16px] text-[#1E1B18] ring-1 ring-[#1E1B18]/20 transition-colors hover:bg-[#1E1B18]/5"
            >
              <ExternalLink className="size-4" aria-hidden />
              Podgląd
            </Link>
          ) : null}

          <Link
            href="/panel/oferty"
            className="text-body inline-flex h-12 items-center px-4 text-[16px] text-[#6B645B] transition-colors hover:text-[#1E1B18]"
          >
            Anuluj
          </Link>
        </div>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[#1E1B18]/12 py-8 first:border-t-0 first:pt-0">
      <h2 className="text-heading font-serif text-2xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Input({
  label, name, defaultValue, value, onChange, inputMode, error, hint,
}: {
  label: string
  name: string
  defaultValue?: string
  value?: string
  onChange?: (v: string) => void
  inputMode?: 'text' | 'numeric' | 'decimal'
  error?: string
  hint?: string
}) {
  return (
    <label className="block">
      <span className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">{label}</span>
      <input
        type="text"
        name={name}
        inputMode={inputMode}
        {...(onChange ? { value, onChange: (e) => onChange(e.target.value) } : { defaultValue })}
        aria-invalid={Boolean(error)}
        className={[
          'text-body mt-2 h-12 w-full border bg-white px-3.5 text-[16px] outline-none transition-colors focus:border-[#8A6A3B]',
          error ? 'border-[#A33A2A]' : 'border-[#1E1B18]/20',
        ].join(' ')}
      />
      {error ? (
        <span className="text-body mt-1.5 block text-[13px] text-[#A33A2A]">{error}</span>
      ) : hint ? (
        <span className="text-body mt-1.5 block text-[13px] text-[#8C857C]">{hint}</span>
      ) : null}
    </label>
  )
}

function Select({
  label, name, defaultValue, value, onChange, options, hint,
}: {
  label: string
  name: string
  defaultValue?: string
  value?: string
  onChange?: (v: string) => void
  options: { value: string; label: string }[]
  hint?: string
}) {
  return (
    <label className="block">
      <span className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">{label}</span>
      <select
        name={name}
        {...(onChange ? { value, onChange: (e) => onChange(e.target.value) } : { defaultValue })}
        className="text-body mt-2 h-12 w-full border border-[#1E1B18]/20 bg-white px-3 text-[16px] outline-none transition-colors focus:border-[#8A6A3B]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? (
        <span className="text-body mt-1.5 block text-[13px] text-[#8C857C]">{hint}</span>
      ) : null}
    </label>
  )
}
