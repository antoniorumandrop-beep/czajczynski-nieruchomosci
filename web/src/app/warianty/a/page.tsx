import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Building2, Home, LandPlot, Phone, Mail, MapPin, Store } from 'lucide-react'
import { NavA } from '@/components/variant-a/nav'
import { OfferCardA } from '@/components/variant-a/offer-card'
import { getAgents, getPublicOffers } from '@/lib/offers'
import { formatArea, formatPrice, offersCount, rooms as roomsLabel } from '@/lib/format'
import { PROPERTY_TYPES, type PropertyType } from '@/lib/types'

const TYPE_ICONS: Record<PropertyType, typeof Home> = {
  apartment: Building2,
  house: Home,
  plot: LandPlot,
  commercial: Store,
}

export default function VariantA() {
  const offers = getPublicOffers()
  const agents = getAgents()

  // Wyroznienie: najdrozsza oferta sprzedazy z kompletem zdjec
  const featured = [...offers]
    .filter((o) => o.transactionType === 'sale' && o.photos.length >= 4)
    .sort((a, b) => b.price - a.price)[0]

  const rest = offers.filter((o) => o.id !== featured?.id).slice(0, 9)
  const exclusive = offers.filter((o) => o.isExclusive).length

  const counts = (Object.keys(PROPERTY_TYPES) as PropertyType[]).map((t) => ({
    type: t,
    count: offers.filter((o) => o.propertyType === t).length,
  }))

  return (
    <div className="bg-[#FAFAF8] font-sans text-[#111214]">
      <NavA />

      {/*
        Hero jest dzielony, a nie pelnoekranowy pod tekstem, z dwoch powodow:
        biuro znakuje kazde zdjecie watermarkiem dokladnie na srodku kadru,
        a zrodlowe pliki maja 1280px szerokosci - rozciagniete na cala szerokosc
        ekranu bylyby miekkie. W kolumnie oba problemy znikaja.
      */}
      <section className="relative border-b border-[#111214]/8 pt-[113px]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pt-8 pb-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-10 lg:py-16">
          <div>
            <p className="text-micro text-[11px] font-semibold text-[#0E3B36] uppercase">
              Wrocław · Białoskórnicza 10
            </p>

            <h1 className="text-display mt-5 text-[clamp(2.5rem,5.5vw,4.5rem)] font-semibold text-balance">
              Znamy każdą nieruchomość, którą sprzedajemy.
            </h1>

            <p className="text-body mt-6 max-w-md text-[17px] text-[#4A4C50]">
              {exclusive} z {offers.length} naszych ofert to umowy na wyłączność. Sami je
              oglądaliśmy, sami je prowadzimy — od pierwszego telefonu do aktu notarialnego.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#oferty"
                className="inline-flex items-center gap-2 rounded-full bg-[#111214] px-6 py-3.5 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#0E3B36] active:scale-[0.97]"
              >
                Zobacz {offersCount(offers.length)}
                <ArrowRight className="size-4" aria-hidden />
              </a>
              <a
                href="#wycena"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold text-[#111214] ring-1 ring-[#111214]/15 transition-all duration-200 hover:bg-[#111214]/5 active:scale-[0.97]"
              >
                Wycena nieruchomości
              </a>
            </div>
          </div>

          {featured ? (
            <Link href={`/warianty/a/oferta/${featured.slug}`} className="group block">
              <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-[#EAE9E4] lg:aspect-5/4">
                {featured.photos[0] ? (
                  <Image
                    src={featured.photos[0].url}
                    alt={featured.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.025]"
                  />
                ) : null}

                {/* Scrim tylko u dolu - srodek kadru zostaje czysty pod watermark */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0B0D0C]/85 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                  <div className="min-w-0">
                    <p className="text-micro text-[10px] font-semibold text-white/70 uppercase">
                      Oferta wyróżniona
                    </p>
                    <p className="text-heading mt-1.5 text-xl font-semibold text-white sm:text-2xl">
                      {formatPrice(featured.price)}
                    </p>
                    <p className="nums text-body mt-1 truncate text-[14px] text-white/75">
                      {[featured.city, featured.district].filter(Boolean).join(', ')}
                      {featured.area ? ` · ${formatArea(featured.area)}` : ''}
                      {featured.rooms ? ` · ${roomsLabel(featured.rooms)}` : ''}
                    </p>
                  </div>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight className="size-4" aria-hidden />
                  </span>
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      {/* ---------- Kategorie ---------- */}
      <section className="border-b border-[#111214]/8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-2 gap-px bg-[#111214]/8 lg:grid-cols-4">
            {counts.map(({ type, count }) => {
              const Icon = TYPE_ICONS[type]
              return (
                <a
                  key={type}
                  href="#oferty"
                  className="group flex items-center gap-3 bg-[#FAFAF8] px-4 py-7 transition-colors duration-200 hover:bg-[#F2F1EC] lg:px-6"
                >
                  <Icon className="size-5 shrink-0 text-[#0E3B36]" aria-hidden />
                  <span className="text-heading text-[15px] font-semibold">
                    {PROPERTY_TYPES[type].many}
                  </span>
                  <span className="nums text-body ml-auto text-[13px] text-[#8A8C90]">{count}</span>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------- Oferty ---------- */}
      <section id="oferty" className="mx-auto max-w-7xl scroll-mt-28 px-6 py-20 lg:px-10 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-micro text-[11px] font-semibold text-[#0E3B36] uppercase">
              Aktualne oferty
            </p>
            <h2 className="text-display mt-3 text-[clamp(2rem,4.5vw,3.5rem)] font-semibold">
              Wszystko, co mamy dziś w rękach
            </h2>
          </div>
          <a
            href="#kontakt"
            className="text-heading inline-flex items-center gap-2 border-b border-[#111214]/25 pb-1 text-[15px] font-semibold transition-colors hover:border-[#0E3B36] hover:text-[#0E3B36]"
          >
            Szukasz czegoś konkretnego?
            <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>

        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((offer) => (
            <OfferCardA key={offer.id} offer={offer} />
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <a
            href="#oferty"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold text-[#111214] ring-1 ring-[#111214]/15 transition-all duration-200 hover:bg-[#111214] hover:text-white hover:ring-[#111214] active:scale-[0.97]"
          >
            Wszystkie oferty ({offers.length}) — z filtrami
            <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>
      </section>

      {/* ---------- Zespol ---------- */}
      <section id="zespol" className="scroll-mt-28 bg-[#111214] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <p className="text-micro text-[11px] font-semibold text-white/50 uppercase">Zespół</p>
          <h2 className="text-display mt-3 max-w-2xl text-[clamp(2rem,4.5vw,3.5rem)] font-semibold text-balance">
            Dwie osoby. Ten sam telefon od pierwszego oglądania do aktu.
          </h2>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:max-w-3xl">
            {agents.map((agent) => (
              <div key={agent.id}>
                <div className="flex size-20 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/15">
                  <span className="text-heading text-2xl font-semibold text-white/80">
                    {agent.fullName
                      .split(' ')
                      .map((p) => p[0])
                      .join('')}
                  </span>
                </div>
                <h3 className="text-heading mt-5 text-xl font-semibold">{agent.fullName}</h3>
                <p className="text-body mt-1 text-[15px] text-white/60">{agent.role}</p>
                {agent.licence ? (
                  <p className="text-body mt-1 text-[13px] text-white/40">{agent.licence}</p>
                ) : null}
                <div className="mt-4 flex flex-col gap-1.5">
                  <a
                    href={`tel:${agent.phone?.replace(/\s/g, '')}`}
                    className="text-body inline-flex items-center gap-2 text-[15px] text-white/80 transition-colors hover:text-white"
                  >
                    <Phone className="size-4" aria-hidden />
                    {agent.phone}
                  </a>
                  <a
                    href={`mailto:${agent.email}`}
                    className="text-body inline-flex items-center gap-2 text-[15px] text-white/80 transition-colors hover:text-white"
                  >
                    <Mail className="size-4" aria-hidden />
                    {agent.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Wycena ---------- */}
      <section id="wycena" className="scroll-mt-28 border-b border-[#111214]/8">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-28">
          <div>
            <p className="text-micro text-[11px] font-semibold text-[#0E3B36] uppercase">Wycena</p>
            <h2 className="text-display mt-3 text-[clamp(2rem,4vw,3rem)] font-semibold text-balance">
              Operat szacunkowy z uprawnieniami
            </h2>
          </div>
          <div className="text-body max-w-xl text-[17px] text-[#4A4C50]">
            <p>
              Piotr Czajczyński jest rzeczoznawcą majątkowym — sporządzamy operaty szacunkowe do
              kredytu, do sądu, do podziału majątku i do rozliczeń podatkowych. To osobna usługa,
              niezależna od pośrednictwa.
            </p>
            <a
              href="#kontakt"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0E3B36] px-6 py-3.5 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#0A2E2A] active:scale-[0.97]"
            >
              Zapytaj o wycenę
              <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Kontakt ---------- */}
      <footer id="kontakt" className="mx-auto max-w-7xl scroll-mt-28 px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-display text-[clamp(2rem,4vw,3rem)] font-semibold text-balance">
              Czajczyński Nieruchomości
            </h2>
            <address className="text-body mt-6 space-y-2 text-[16px] text-[#4A4C50] not-italic">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#8A8C90]" aria-hidden />
                ul. Białoskórnicza 10, 50-134 Wrocław
              </p>
              <p className="flex items-start gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-[#8A8C90]" aria-hidden />
                <a href="tel:+48717944983" className="transition-colors hover:text-[#0E3B36]">
                  71 794 49 83
                </a>
              </p>
              <p className="flex items-start gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-[#8A8C90]" aria-hidden />
                <a
                  href="mailto:oferty@superlokum.pl"
                  className="transition-colors hover:text-[#0E3B36]"
                >
                  oferty@superlokum.pl
                </a>
              </p>
            </address>
          </div>

          <form className="rounded-3xl bg-[#F2F1EC] p-7">
            <p className="text-heading text-[17px] font-semibold">Napisz do nas</p>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-body text-[13px] font-medium text-[#4A4C50]">
                  Imię i nazwisko
                </span>
                <input
                  type="text"
                  name="name"
                  className="text-body mt-1.5 h-11 w-full rounded-xl border border-[#111214]/12 bg-white px-3.5 text-[15px] outline-none transition-colors focus:border-[#0E3B36]"
                />
              </label>
              <label className="block">
                <span className="text-body text-[13px] font-medium text-[#4A4C50]">
                  Telefon lub e-mail
                </span>
                <input
                  type="text"
                  name="contact"
                  className="text-body mt-1.5 h-11 w-full rounded-xl border border-[#111214]/12 bg-white px-3.5 text-[15px] outline-none transition-colors focus:border-[#0E3B36]"
                />
              </label>
              <label className="block">
                <span className="text-body text-[13px] font-medium text-[#4A4C50]">Wiadomość</span>
                <textarea
                  name="message"
                  rows={3}
                  className="text-body mt-1.5 w-full rounded-xl border border-[#111214]/12 bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-[#0E3B36]"
                />
              </label>
            </div>
            <button
              type="button"
              className="mt-5 h-11 w-full rounded-full bg-[#111214] text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#0E3B36] active:scale-[0.98]"
            >
              Wyślij
            </button>
          </form>
        </div>

        <p className="text-body mt-16 border-t border-[#111214]/8 pt-7 text-[13px] text-[#8A8C90]">
          Prototyp · wariant A „Kwartał". Dane i zdjęcia pochodzą z obecnej strony superlokum.pl.
        </p>
      </footer>
    </div>
  )
}
