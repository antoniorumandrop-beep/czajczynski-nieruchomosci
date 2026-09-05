import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { formatArea, formatPrice, formatPricePerM2, rooms as roomsLabel } from '@/lib/format'
import { PROPERTY_TYPES, TRANSACTION_TYPES, pricePerM2, type Offer } from '@/lib/types'

export function OfferCardC({ offer }: { offer: Offer }) {
  const cover = offer.photos[0]?.url
  const meta = [
    formatArea(offer.area),
    offer.rooms ? roomsLabel(offer.rooms) : null,
    formatPricePerM2(pricePerM2(offer)),
  ].filter(Boolean)

  return (
    <Link href={`/warianty/c/oferta/${offer.slug}`} className="group block">
      <article className="flex h-full flex-col border-t-2 border-[#F2F0EC]/15 pt-4 transition-colors duration-300 group-hover:border-[#E8563A]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-micro text-[11px] font-bold text-[#E8563A] uppercase">
            {PROPERTY_TYPES[offer.propertyType].one} ·{' '}
            {TRANSACTION_TYPES[offer.transactionType].label}
          </p>
          <ArrowUpRight
            className="size-4 shrink-0 text-[#F2F0EC]/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#E8563A]"
            aria-hidden
          />
        </div>

        <div className="relative mt-4 aspect-4/3 overflow-hidden bg-[#171B1A]">
          {cover ? (
            <Image
              src={cover}
              alt={offer.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.05]"
            />
          ) : null}
        </div>

        <h3 className="text-heading mt-5 font-display text-[26px] leading-[1.05] font-bold text-[#F2F0EC]">
          {formatPrice(offer.price)}
          {offer.transactionType === 'rent' ? (
            <span className="text-[16px] font-medium text-[#F2F0EC]/50"> /mies.</span>
          ) : null}
        </h3>

        <p className="text-body mt-2 text-[15px] font-medium text-[#F2F0EC]/85">
          {[offer.city, offer.district].filter(Boolean).join(' · ')}
        </p>

        <p className="nums text-body mt-auto pt-4 text-[13px] text-[#F2F0EC]/45">
          {meta.join('   ')}
        </p>
      </article>
    </Link>
  )
}
