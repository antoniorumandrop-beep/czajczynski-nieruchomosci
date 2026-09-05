import Link from 'next/link'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { hasSupabase } from '@/lib/supabase/config'
import { NotConfigured } from '@/components/panel/not-configured'
import { panelOffers } from '@/lib/panel/data'
import { StatusBadge } from '@/app/panel/page'
import { formatArea, formatPrice, offersCount, photosCount } from '@/lib/format'
import { PROPERTY_TYPES, TRANSACTION_TYPES } from '@/lib/types'

export default async function PanelOffers(props: PageProps<'/panel/oferty'>) {
  if (!hasSupabase()) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <NotConfigured />
      </div>
    )
  }

  const { usunieto } = await props.searchParams
  const offers = await panelOffers()

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
      {usunieto ? (
        <p className="mb-8 border border-[#3F7A45]/30 bg-[#EFF4EC] px-4 py-3 text-[15px] text-[#2C5731]">
          Oferta została usunięta razem ze zdjęciami.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display font-serif text-[clamp(2rem,4vw,3rem)]">Oferty</h1>
          <p className="text-body mt-2 text-[16px] text-[#6B645B]">{offersCount(offers.length)}</p>
        </div>
        <Link
          href="/panel/oferty/nowa"
          className="text-body inline-flex h-12 items-center gap-2 bg-[#1E1B18] px-5 text-[16px] font-medium text-[#F6F2EC] transition-colors hover:bg-[#8A6A3B]"
        >
          <Plus className="size-5" aria-hidden />
          Dodaj ofertę
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="mt-12 border border-[#1E1B18]/15 bg-white p-10 text-center">
          <p className="text-heading font-serif text-2xl">Nie ma jeszcze żadnej oferty</p>
          <p className="text-body mx-auto mt-3 max-w-md text-[16px] text-[#6B645B]">
            Kliknij „Dodaj ofertę", wypełnij formularz i zapisz. Zdjęcia dodaje się w drugim kroku,
            po zapisaniu podstawowych danych.
          </p>
        </div>
      ) : (
        <ul className="mt-10 space-y-3">
          {offers.map((o) => (
            <li key={o.id}>
              <Link
                href={`/panel/oferty/${o.id}`}
                className="flex gap-5 border border-[#1E1B18]/12 bg-white p-3 transition-colors hover:border-[#1E1B18]/40"
              >
                <div className="relative aspect-3/2 w-32 shrink-0 bg-[#E7E0D6]">
                  {o.photos[0] ? (
                    <Image
                      src={o.photos[0].url}
                      alt=""
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-body absolute inset-0 flex items-center justify-center text-center text-[12px] text-[#8C857C]">
                      brak
                      <br />
                      zdjęć
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="nums text-body text-[13px] text-[#8C857C]">
                      {o.offerNumber}
                    </span>
                    <StatusBadge status={o.status} />
                    {o.isExclusive ? (
                      <span className="text-micro text-[10px] text-[#8A6A3B] uppercase">
                        Na wyłączność
                      </span>
                    ) : null}
                  </div>

                  <p className="text-heading mt-1.5 truncate font-serif text-xl">
                    {[o.city, o.district].filter(Boolean).join(', ')}
                  </p>

                  <p className="nums text-body mt-1 text-[15px] text-[#4A443D]">
                    {formatPrice(o.price)}
                    {o.transactionType === 'rent' ? ' / mies.' : ''}
                    {o.area ? ` · ${formatArea(o.area)}` : ''}
                    <span className="ml-2 text-[#8C857C]">
                      {PROPERTY_TYPES[o.propertyType].one} ·{' '}
                      {TRANSACTION_TYPES[o.transactionType].label} · {photosCount(o.photos.length)}
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
