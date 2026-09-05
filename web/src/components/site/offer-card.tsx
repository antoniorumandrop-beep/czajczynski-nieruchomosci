import Image from 'next/image'
import Link from 'next/link'
import { formatArea, formatPrice, formatPricePerM2, rooms as roomsLabel } from '@/lib/format'
import { PROPERTY_TYPES, TRANSACTION_TYPES, pricePerM2, type Offer } from '@/lib/types'

/**
 * Karta redakcyjna: kadr 3:2, ostre krawedzie, dane w wierszu opisowym.
 * Wiecej tekstu niz w wariancie A - tu oferta ma sie czytac, nie blyszczec.
 */
export function OfferCard({ offer }: { offer: Offer }) {
  const cover = offer.photos[0]?.url
  const ppm = formatPricePerM2(pricePerM2(offer))
  const meta = [
    formatArea(offer.area),
    offer.rooms ? roomsLabel(offer.rooms) : null,
    ppm,
  ].filter(Boolean)

  return (
    <Link href={`/oferta/${offer.slug}`} className="group block">
      <article>
        <div className="relative aspect-3/2 overflow-hidden bg-[#E7E0D6]">
          {cover ? (
            <Image
              src={cover}
              alt={offer.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.03]"
            />
          ) : null}
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-[#1E1B18]/12 pb-3">
          <p className="text-micro text-[11px] font-semibold text-[#8A6A3B] uppercase">
            {PROPERTY_TYPES[offer.propertyType].one} · {TRANSACTION_TYPES[offer.transactionType].label}
          </p>
          <p className="nums text-micro text-[11px] text-[#8C857C] uppercase">{offer.offerNumber}</p>
        </div>

        <h3 className="text-heading mt-4 font-serif text-2xl text-[#1E1B18]">
          {[offer.city, offer.district].filter(Boolean).join(', ')}
        </h3>

        <p className="nums text-heading mt-2 text-xl font-semibold text-[#1E1B18]">
          {formatPrice(offer.price)}
          {offer.transactionType === 'rent' ? (
            <span className="text-base font-normal text-[#6B645B]"> miesięcznie</span>
          ) : null}
        </p>

        <p className="nums text-body mt-2 text-[14px] text-[#6B645B]">{meta.join('  ·  ')}</p>

        <p className="text-body mt-4 line-clamp-2 text-[15px] text-[#6B645B]">
          {offer.description.split('\n').find((l) => l.trim().length > 40) ?? offer.description}
        </p>

        <span className="text-body mt-4 inline-block border-b border-[#8A6A3B]/40 pb-0.5 text-[14px] font-medium text-[#8A6A3B] transition-colors group-hover:border-[#8A6A3B]">
          Zobacz ofertę
        </span>
      </article>
    </Link>
  )
}
