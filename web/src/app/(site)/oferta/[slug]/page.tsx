import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Mail, MapPin, Phone } from 'lucide-react'
import { Gallery } from '@/components/site/gallery'
import { InquiryForm } from '@/components/site/inquiry-form'
import { OfferCard } from '@/components/site/offer-card'
import { ShareButtons } from '@/components/site/share-button'
import { getAgent, getOfferBySlug, getPublicOffers } from '@/lib/offers'
import { formatArea, formatPrice, formatPricePerM2, floorLabel, rooms as roomsLabel } from '@/lib/format'
import { siteUrl } from '@/lib/site'
import {
  MARKETS,
  OFFER_STATUSES,
  PROPERTY_TYPES,
  TRANSACTION_TYPES,
  pricePerM2,
  type Offer,
} from '@/lib/types'

export async function generateStaticParams() {
  return (await getPublicOffers()).map((o) => ({ slug: o.slug }))
}

export async function generateMetadata(props: PageProps<'/oferta/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const offer = await getOfferBySlug(slug)
  if (!offer) return {}

  const where = [offer.city, offer.district].filter(Boolean).join(', ')
  const title = `${offer.title} — ${formatPrice(offer.price)}`
  const description = [
    formatArea(offer.area),
    offer.rooms ? roomsLabel(offer.rooms) : null,
    where,
    `nr ${offer.offerNumber}`,
  ]
    .filter(Boolean)
    .join(' · ')

  const url = `${siteUrl()}/oferta/${offer.slug}`
  const cover = offer.photos[0]?.url

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: 'Czajczyński Nieruchomości',
      url,
      title,
      description,
      images: cover ? [{ url: `${siteUrl()}${cover}`, width: 1280, height: 960, alt: offer.title }] : [],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function OfferPage(props: PageProps<'/oferta/[slug]'>) {
  const { slug } = await props.params
  const offer = await getOfferBySlug(slug)
  if (!offer || !OFFER_STATUSES[offer.status].public) notFound()

  const agent = await getAgent(offer.agentId)
  const url = `${siteUrl()}/oferta/${offer.slug}`
  const ppm = formatPricePerM2(pricePerM2(offer))
  const where = [offer.city, offer.district].filter(Boolean).join(', ')

  const keyFacts = [
    { label: 'Powierzchnia', value: formatArea(offer.area) },
    { label: 'Liczba pokoi', value: offer.rooms ? String(offer.rooms) : null },
    { label: 'Piętro', value: floorLabel(offer.floor, offer.totalFloors) },
    { label: 'Cena za m²', value: ppm },
    { label: 'Rynek', value: offer.market ? MARKETS[offer.market].label : null },
    { label: 'Rodzaj', value: PROPERTY_TYPES[offer.propertyType].one },
  ].filter((f) => f.value)

  const similar = (await getPublicOffers())
    .filter(
      (o) =>
        o.id !== offer.id &&
        o.propertyType === offer.propertyType &&
        o.transactionType === offer.transactionType,
    )
    .slice(0, 2)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(offer, url)) }}
      />

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8 lg:py-12">
        <nav aria-label="Ścieżka nawigacji" className="text-body text-[13px] text-[#8C857C]">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#1E1B18]">
                Start
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li>
              <Link href="/oferty" className="hover:text-[#1E1B18]">
                Oferty
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li>
              <Link
                href={`/oferty/${PROPERTY_TYPES[offer.propertyType].slug}`}
                className="hover:text-[#1E1B18]"
              >
                {PROPERTY_TYPES[offer.propertyType].many}
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li aria-current="page" className="text-[#1E1B18]">
              {offer.offerNumber}
            </li>
          </ol>
        </nav>

        <header className="mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-5 border-b border-[#1E1B18]/12 pb-7">
          <div>
            <p className="text-micro text-[11px] font-semibold text-[#8A6A3B] uppercase">
              {PROPERTY_TYPES[offer.propertyType].one} {TRANSACTION_TYPES[offer.transactionType].suffix}
              {offer.isExclusive ? ' · Oferta na wyłączność' : ''}
            </p>
            <h1 className="text-display mt-3 font-serif text-[clamp(2rem,4.5vw,3.25rem)]">{where}</h1>
            {offer.addressLine ? (
              <p className="text-body mt-2 flex items-center gap-2 text-[15px] text-[#6B645B]">
                <MapPin className="size-4 text-[#8C857C]" aria-hidden />
                {offer.addressLine}
              </p>
            ) : null}
          </div>

          <div className="text-right">
            <p className="nums text-heading font-serif text-[clamp(1.75rem,3.5vw,2.5rem)]">
              {formatPrice(offer.price)}
              {offer.transactionType === 'rent' ? (
                <span className="text-lg text-[#6B645B]"> / mies.</span>
              ) : null}
            </p>
            {ppm ? <p className="nums text-body mt-1 text-[15px] text-[#6B645B]">{ppm}</p> : null}
          </div>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
          <div className="min-w-0">
            <Gallery photos={offer.photos} alt={offer.title} />

            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-[#1E1B18]/12 py-7 sm:grid-cols-3">
              {keyFacts.map((f) => (
                <div key={f.label}>
                  <dt className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">
                    {f.label}
                  </dt>
                  <dd className="nums text-heading mt-1.5 text-lg">{f.value}</dd>
                </div>
              ))}
            </dl>

            <section className="mt-10">
              <h2 className="text-heading font-serif text-2xl">Opis nieruchomości</h2>
              <div className="text-body mt-5 max-w-2xl space-y-4 text-[17px] text-[#4A443D]">
                {offer.description
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
              </div>
            </section>

            {offer.attributes.length > 0 ? (
              <section className="mt-12">
                <h2 className="text-heading font-serif text-2xl">Szczegóły</h2>
                <dl className="mt-6 grid gap-x-10 sm:grid-cols-2">
                  {offer.attributes.map((a) => {
                    // Dlugie wartosci (np. wyliczanka oplat w czynszu) w ukladzie
                    // etykieta-lewo / wartosc-prawo zgniataja etykiete do trzech
                    // linii. Powyzej progu ustawiamy je jedna pod druga.
                    const stacked = a.value.length > 34
                    return (
                      <div
                        key={a.label}
                        className={[
                          'border-b border-[#1E1B18]/10 py-3',
                          stacked ? '' : 'flex items-baseline justify-between gap-6',
                        ].join(' ')}
                      >
                        <dt className="text-body shrink-0 text-[15px] text-[#6B645B]">{a.label}</dt>
                        <dd
                          className={[
                            'nums text-body text-[15px] text-[#1E1B18]',
                            stacked ? 'mt-1' : 'min-w-0 text-right',
                          ].join(' ')}
                        >
                          {a.value}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              </section>
            ) : null}

            <p className="text-body mt-10 max-w-2xl border-t border-[#1E1B18]/12 pt-6 text-[13px] text-[#8C857C]">
              Opis sporządzono na podstawie oględzin nieruchomości oraz informacji uzyskanych od
              właściciela. Może podlegać aktualizacji i nie stanowi oferty w rozumieniu art. 66 i
              następnych Kodeksu cywilnego.
            </p>
          </div>

          {/* Kolumna boczna przykleja sie dopiero od desktopu - na telefonie
              formularz ma byc pod trescia, a nie zaslaniac zdjecia */}
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            {agent ? (
              <div className="border border-[#1E1B18]/12 bg-[#F1EBE2] p-6">
                <p className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">
                  Opiekun oferty
                </p>
                <Link
                  href={`/zespol/${agent.slug}`}
                  className="text-heading mt-3 block font-serif text-2xl transition-colors hover:text-[#8A6A3B]"
                >
                  {agent.fullName}
                </Link>
                <p className="text-body mt-1 text-[15px] text-[#6B645B]">{agent.role}</p>
                {agent.licence ? (
                  <p className="text-body mt-1 text-[13px] text-[#8C857C]">{agent.licence}</p>
                ) : null}
                <div className="mt-5 flex flex-col gap-2">
                  <a
                    href={`tel:${agent.phone?.replace(/\s/g, '')}`}
                    className="text-body inline-flex h-11 items-center justify-center gap-2 bg-[#1E1B18] text-[15px] font-medium text-[#F6F2EC] transition-colors hover:bg-[#8A6A3B]"
                  >
                    <Phone className="size-4" aria-hidden />
                    {agent.phone}
                  </a>
                  <a
                    href={`mailto:${agent.email}?subject=Oferta%20${encodeURIComponent(offer.offerNumber)}`}
                    className="text-body inline-flex h-11 items-center justify-center gap-2 text-[15px] text-[#1E1B18] ring-1 ring-[#1E1B18]/15 transition-colors hover:bg-[#1E1B18]/5"
                  >
                    <Mail className="size-4" aria-hidden />
                    Napisz e-mail
                  </a>
                </div>
              </div>
            ) : null}

            <div className="mt-8">
              <InquiryForm offerId={offer.id} offerNumber={offer.offerNumber} compact />
            </div>

            <div className="mt-8">
              <ShareButtons offer={offer} url={url} />
            </div>
          </aside>
        </div>

        {similar.length > 0 ? (
          <section className="mt-20 border-t border-[#1E1B18]/12 pt-12">
            <h2 className="text-heading font-serif text-2xl">Podobne oferty</h2>
            <div className="mt-8 grid gap-x-10 gap-y-14 sm:grid-cols-2">
              {similar.map((o) => (
                <OfferCard key={o.id} offer={o} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  )
}

/** Dane strukturalne - Google pokazuje dzieki nim cene i zdjecie w wynikach. */
function buildJsonLd(offer: Offer, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: offer.title,
    url,
    description: offer.description.slice(0, 500),
    datePosted: offer.createdAt,
    image: offer.photos.slice(0, 6).map((p) => `${siteUrl()}${p.url}`),
    offers: {
      '@type': 'Offer',
      price: offer.price,
      priceCurrency: 'PLN',
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: offer.city,
      addressRegion: offer.district ?? undefined,
      addressCountry: 'PL',
    },
    ...(offer.area
      ? { floorSize: { '@type': 'QuantitativeValue', value: offer.area, unitCode: 'MTK' } }
      : {}),
    ...(offer.rooms ? { numberOfRooms: offer.rooms } : {}),
  }
}
