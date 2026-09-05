'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { PROPERTY_TYPES, type PropertyType } from '@/lib/types'
import { SORTS, DEFAULT_SORT } from '@/lib/filters'
import { offersCount } from '@/lib/format'

type Option = { name: string; count: number }

const ADVANCED_KEYS = [
  'rynek',
  'm2_od',
  'm2_do',
  'cena_m2_od',
  'cena_m2_do',
  'pokoje_od',
  'pietro_od',
  'pietro_do',
] as const

const LABELS: Record<string, string> = {
  transakcja: 'Transakcja',
  typ: 'Rodzaj',
  miasto: 'Miasto',
  dzielnica: 'Dzielnica',
  rynek: 'Rynek',
  cena_od: 'Cena od',
  cena_do: 'Cena do',
  m2_od: 'Powierzchnia od',
  m2_do: 'Powierzchnia do',
  cena_m2_od: 'Cena/m² od',
  cena_m2_do: 'Cena/m² do',
  pokoje_od: 'Pokoje min.',
  pietro_od: 'Piętro od',
  pietro_do: 'Piętro do',
}

export function OfferFilters({
  cities,
  districts,
  resultCount,
  lockedType,
}: {
  cities: Option[]
  districts: Option[]
  resultCount: number
  /** Ustawione na /oferty/mieszkania - wtedy rodzaju nie da sie zmienic tutaj. */
  lockedType?: PropertyType
}) {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [showAdvanced, setShowAdvanced] = useState(
    () => ADVANCED_KEYS.some((k) => params.get(k)),
  )
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (debounce.current) clearTimeout(debounce.current) }, [])

  function push(next: URLSearchParams) {
    const qs = next.toString()
    startTransition(() => router.push(qs ? `?${qs}` : '?', { scroll: false }))
  }

  function set(key: string, value: string | null, wait = 0) {
    const next = new URLSearchParams(params.toString())
    if (value === null || value === '') next.delete(key)
    else next.set(key, value)

    if (debounce.current) clearTimeout(debounce.current)
    if (wait > 0) debounce.current = setTimeout(() => push(next), wait)
    else push(next)
  }

  function clearAll() {
    const next = new URLSearchParams()
    const sort = params.get('sort')
    if (sort) next.set('sort', sort)
    push(next)
  }

  const active = [...params.entries()].filter(([k]) => k !== 'sort' && LABELS[k])

  const selectClass =
    'text-body h-11 w-full appearance-none rounded-none border-b border-[#1E1B18]/25 bg-transparent pr-6 text-[15px] outline-none transition-colors focus:border-[#8A6A3B]'
  const inputClass =
    'text-body h-11 w-full rounded-none border-b border-[#1E1B18]/25 bg-transparent text-[15px] outline-none transition-colors focus:border-[#8A6A3B] placeholder:text-[#B4ADA3]'
  const legendClass = 'text-micro text-[11px] font-semibold text-[#8C857C] uppercase'

  return (
    <section
      aria-label="Filtry ofert"
      className={pending ? 'opacity-60 transition-opacity duration-150' : 'transition-opacity'}
    >
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className={legendClass}>Transakcja</p>
          <div className="mt-2 flex gap-1" role="group" aria-label="Transakcja">
            {[
              { v: null, label: 'Wszystkie' },
              { v: 'sprzedaz', label: 'Sprzedaż' },
              { v: 'wynajem', label: 'Wynajem' },
            ].map((o) => {
              const isActive = (params.get('transakcja') ?? null) === o.v
              return (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => set('transakcja', o.v)}
                  aria-pressed={isActive}
                  className={[
                    'text-body h-11 flex-1 px-2 text-[14px] transition-colors',
                    isActive
                      ? 'bg-[#1E1B18] text-[#F6F2EC]'
                      : 'text-[#4A443D] ring-1 ring-[#1E1B18]/15 hover:bg-[#1E1B18]/5',
                  ].join(' ')}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
        </div>

        {lockedType ? null : (
          <label className="block">
            <span className={legendClass}>Rodzaj nieruchomości</span>
            <select
              value={params.get('typ') ?? ''}
              onChange={(e) => set('typ', e.target.value || null)}
              className={selectClass}
            >
              <option value="">Wszystkie</option>
              {(Object.keys(PROPERTY_TYPES) as PropertyType[]).map((t) => (
                <option key={t} value={PROPERTY_TYPES[t].slug}>
                  {PROPERTY_TYPES[t].many}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className={legendClass}>Miasto</span>
          <select
            value={params.get('miasto') ?? ''}
            onChange={(e) => set('miasto', e.target.value || null)}
            className={selectClass}
          >
            <option value="">Wszystkie</option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={legendClass}>Dzielnica</span>
          <select
            value={params.get('dzielnica') ?? ''}
            onChange={(e) => set('dzielnica', e.target.value || null)}
            className={selectClass}
          >
            <option value="">Wszystkie</option>
            {districts.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.count})
              </option>
            ))}
          </select>
        </label>

        <div className={lockedType ? '' : 'sm:col-span-2 lg:col-span-1'}>
          <p className={legendClass}>Cena (zł)</p>
          <div className="mt-0 flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="od"
              defaultValue={params.get('cena_od') ?? ''}
              onChange={(e) => set('cena_od', e.target.value || null, 500)}
              className={inputClass}
              aria-label="Cena od"
            />
            <span aria-hidden className="text-[#B4ADA3]">
              –
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="do"
              defaultValue={params.get('cena_do') ?? ''}
              onChange={(e) => set('cena_do', e.target.value || null, 500)}
              className={inputClass}
              aria-label="Cena do"
            />
          </div>
        </div>
      </div>

      {showAdvanced ? (
        <div className="mt-7 grid gap-x-6 gap-y-5 border-t border-[#1E1B18]/12 pt-7 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className={legendClass}>Rynek</span>
            <select
              value={params.get('rynek') ?? ''}
              onChange={(e) => set('rynek', e.target.value || null)}
              className={selectClass}
            >
              <option value="">Dowolny</option>
              <option value="pierwotny">Pierwotny</option>
              <option value="wtorny">Wtórny</option>
            </select>
          </label>

          <div>
            <p className={legendClass}>Powierzchnia (m²)</p>
            <div className="flex items-center gap-3">
              <input
                type="number" inputMode="numeric" min={0} placeholder="od"
                defaultValue={params.get('m2_od') ?? ''}
                onChange={(e) => set('m2_od', e.target.value || null, 500)}
                className={inputClass} aria-label="Powierzchnia od"
              />
              <span aria-hidden className="text-[#B4ADA3]">–</span>
              <input
                type="number" inputMode="numeric" min={0} placeholder="do"
                defaultValue={params.get('m2_do') ?? ''}
                onChange={(e) => set('m2_do', e.target.value || null, 500)}
                className={inputClass} aria-label="Powierzchnia do"
              />
            </div>
          </div>

          <div>
            <p className={legendClass}>Cena za m² (zł)</p>
            <div className="flex items-center gap-3">
              <input
                type="number" inputMode="numeric" min={0} placeholder="od"
                defaultValue={params.get('cena_m2_od') ?? ''}
                onChange={(e) => set('cena_m2_od', e.target.value || null, 500)}
                className={inputClass} aria-label="Cena za metr od"
              />
              <span aria-hidden className="text-[#B4ADA3]">–</span>
              <input
                type="number" inputMode="numeric" min={0} placeholder="do"
                defaultValue={params.get('cena_m2_do') ?? ''}
                onChange={(e) => set('cena_m2_do', e.target.value || null, 500)}
                className={inputClass} aria-label="Cena za metr do"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6">
            <label className="block">
              <span className={legendClass}>Pokoje min.</span>
              <input
                type="number" inputMode="numeric" min={1} placeholder="dowolnie"
                defaultValue={params.get('pokoje_od') ?? ''}
                onChange={(e) => set('pokoje_od', e.target.value || null, 500)}
                className={inputClass}
              />
            </label>
            <div>
              <p className={legendClass}>Piętro</p>
              <div className="flex items-center gap-2">
                <input
                  type="number" inputMode="numeric" placeholder="od"
                  defaultValue={params.get('pietro_od') ?? ''}
                  onChange={(e) => set('pietro_od', e.target.value || null, 500)}
                  className={inputClass} aria-label="Piętro od"
                />
                <span aria-hidden className="text-[#B4ADA3]">–</span>
                <input
                  type="number" inputMode="numeric" placeholder="do"
                  defaultValue={params.get('pietro_do') ?? ''}
                  onChange={(e) => set('pietro_do', e.target.value || null, 500)}
                  className={inputClass} aria-label="Piętro do"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[#1E1B18]/12 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
            className="text-body inline-flex h-10 items-center gap-2 px-3 text-[14px] text-[#4A443D] ring-1 ring-[#1E1B18]/15 transition-colors hover:bg-[#1E1B18]/5"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            {showAdvanced ? 'Mniej filtrów' : 'Więcej filtrów'}
          </button>

          {active.map(([key, value]) => (
            <button
              key={`${key}-${value}`}
              type="button"
              onClick={() => set(key, null)}
              className="text-body inline-flex h-10 items-center gap-1.5 bg-[#E7E0D6] px-3 text-[14px] text-[#1E1B18] transition-colors hover:bg-[#DCD2C4]"
            >
              <span className="text-[#6B645B]">{LABELS[key]}:</span>
              {value}
              <X className="size-3.5" aria-hidden />
              <span className="sr-only">Usuń filtr</span>
            </button>
          ))}

          {active.length > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="text-body h-10 px-3 text-[14px] text-[#8A6A3B] underline underline-offset-4 transition-colors hover:text-[#1E1B18]"
            >
              Wyczyść wszystkie
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-4">
          <p aria-live="polite" className="text-body text-[14px] text-[#6B645B]">
            {offersCount(resultCount)}
          </p>
          <label className="flex items-center gap-2">
            <span className="sr-only">Sortowanie</span>
            <select
              value={params.get('sort') ?? DEFAULT_SORT}
              onChange={(e) => set('sort', e.target.value === DEFAULT_SORT ? null : e.target.value)}
              className="text-body h-10 appearance-none bg-transparent pr-5 text-[14px] text-[#1E1B18] underline underline-offset-4 outline-none"
            >
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  )
}
