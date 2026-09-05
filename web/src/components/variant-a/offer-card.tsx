import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { formatArea, formatPrice, formatPricePerM2, rooms as roomsLabel } from '@/lib/format'
import { PROPERTY_TYPES, TRANSACTION_TYPES, pricePerM2, type Offer } from '@/lib/types'

export function OfferCardA({ offer, featured = false }: { offer: Offer; featured?: boolean }) {
  const cover = offer.photos[0]?.url
  const ppm = formatPricePerM2(pricePerM2(offer))

  return (
    <Link
      href={`/warianty/a/oferta/${offer.slug}`}
      className="group block focus-visible:outline-offset-4"
    >
      <article className="flex h-full flex-col">
        <div
          className={[
            'relative overflow-hidden rounded-2xl bg-[#EAE9E4]',
            featured ? 'aspect-16/10' : 'aspect-4/3',
          ].join(' ')}
        >
          {cover ? (
            <Image
              src={cover}
              alt={offer.title}
              fill
              sizes={featured ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
              className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.035]"
            />
          ) : null}

          <span className="text-micro absolute right-3 bottom-3 rounded-full bg-[#111214]/70 px-2.5 py-1 text-[10px] font-medium text-white uppercase backdrop-blur-md">
            {TRANSACTION_TYPES[offer.transactionType].label}
          </span>
        </div>

        <div className="flex flex-1 flex-col pt-4">
          <p className="text-micro text-[11px] font-semibold text-[#0E3B36] uppercase">
            {PROPERTY_TYPES[offer.propertyType].one}
            <span className="nums ml-2 font-normal text-[#8A8C90]">{offer.offerNumber}</span>
            {offer.isExclusive ? (
              <span className="ml-2 font-normal text-[#8A8C90]">· Na wyłączność</span>
            ) : null}
          </p>

          <h3
            className={[
              'text-heading mt-1.5 font-semibold text-[#111214]',
              featured ? 'text-2xl sm:text-3xl' : 'text-lg',
            ].join(' ')}
          >
            {formatPrice(offer.price)}
            {offer.transactionType === 'rent' ? (
              <span className="text-base font-normal text-[#6E7075]"> / mies.</span>
            ) : null}
          </h3>

          <p className="text-body mt-1.5 flex items-center gap-1.5 text-[14px] text-[#4A4C50]">
            <MapPin className="size-3.5 shrink-0 text-[#8A8C90]" aria-hidden />
            {[offer.city, offer.district].filter(Boolean).join(', ')}
          </p>

          <dl className="nums text-body mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#4A4C50]">
            {offer.area ? (
              <div>
                <dt className="sr-only">Powierzchnia</dt>
                <dd>{formatArea(offer.area)}</dd>
              </div>
            ) : null}
            {offer.rooms ? (
              <>
                <span aria-hidden className="text-[#C9C8C3]">·</span>
                <div>
                  <dt className="sr-only">Liczba pokoi</dt>
                  <dd>{roomsLabel(offer.rooms)}</dd>
                </div>
              </>
            ) : null}
            {ppm ? (
              <>
                <span aria-hidden className="text-[#C9C8C3]">·</span>
                <div>
                  <dt className="sr-only">Cena za metr</dt>
                  <dd>{ppm}</dd>
                </div>
              </>
            ) : null}
          </dl>
        </div>
      </article>
    </Link>
  )
}
