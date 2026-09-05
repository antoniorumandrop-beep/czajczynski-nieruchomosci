import Link from 'next/link'
import { OfferCard } from '@/components/site/offer-card'
import { OfferFilters } from '@/components/site/filters'
import { applyFilters, locationOptions, parseFilters, type RawParams } from '@/lib/filters'
import { getPublicOffers } from '@/lib/offers'
import type { PropertyType } from '@/lib/types'

export function OffersListing({
  params,
  lockedType,
  title,
  lead,
}: {
  params: RawParams
  lockedType?: PropertyType
  title: string
  lead?: string
}) {
  const all = getPublicOffers()
  const filters = parseFilters(params)
  if (lockedType) filters.typ = lockedType

  const offers = applyFilters(all, filters)
  // opcje lokalizacji liczymy w obrebie kategorii, zeby nie oferowac miast,
  // w ktorych nie ma ani jednej oferty tego rodzaju
  const scope = lockedType ? all.filter((o) => o.propertyType === lockedType) : all
  const { cities, districts } = locationOptions(scope)

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
      <header>
        <h1 className="text-display font-serif text-[clamp(2rem,5vw,3.5rem)]">{title}</h1>
        {lead ? (
          <p className="text-body mt-4 max-w-2xl text-[17px] text-[#4A443D]">{lead}</p>
        ) : null}
      </header>

      <div className="mt-10 border-t border-[#1E1B18]/12 pt-8">
        <OfferFilters
          cities={cities}
          districts={districts}
          resultCount={offers.length}
          lockedType={lockedType}
        />
      </div>

      {offers.length === 0 ? (
        <div className="mt-16 border-t border-[#1E1B18]/12 py-20 text-center">
          <p className="text-heading font-serif text-2xl">Brak ofert dla tych kryteriów</p>
          <p className="text-body mt-3 text-[16px] text-[#6B645B]">
            Spróbuj poszerzyć zakres ceny albo zdjąć filtr lokalizacji. Jeśli szukasz czegoś
            konkretnego, czego u nas nie ma — zadzwoń, często mamy oferty przed publikacją.
          </p>
          <Link
            href="/kontakt"
            className="text-body mt-7 inline-block bg-[#1E1B18] px-6 py-3.5 text-[15px] font-medium text-[#F6F2EC] transition-colors hover:bg-[#8A6A3B]"
          >
            Napisz, czego szukasz
          </Link>
        </div>
      ) : (
        <div className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  )
}
