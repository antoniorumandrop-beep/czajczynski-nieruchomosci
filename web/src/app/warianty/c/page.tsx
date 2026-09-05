import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react'
import { OfferCardC } from '@/components/variant-c/offer-card'
import { getAgents, getPublicOffers } from '@/lib/offers'
import { formatPrice } from '@/lib/format'
import { PROPERTY_TYPES, type PropertyType } from '@/lib/types'

const NAV = [
  { href: '#oferty', label: 'Oferty' },
  { href: '#dzielnice', label: 'Dzielnice' },
  { href: '#zespol', label: 'Zespół' },
  { href: '#kontakt', label: 'Kontakt' },
]

export default async function VariantC() {
  const offers = await getPublicOffers()
  const agents = await getAgents()
  const exclusive = offers.filter((o) => o.isExclusive).length

  const hero = [...offers]
    .filter((o) => o.transactionType === 'sale' && o.photos.length >= 4)
    .sort((a, b) => b.price - a.price)[0]

  const shown = offers.filter((o) => o.id !== hero?.id).slice(0, 9)

  const counts = (Object.keys(PROPERTY_TYPES) as PropertyType[]).map((t) => ({
    type: t,
    count: offers.filter((o) => o.propertyType === t).length,
  }))

  // dzielnice posortowane po liczbie ofert - biuro jest wroclawskie, wiec
  // nawigacja po dzielnicy jest bardziej uzyteczna niz po typie
  const districts = Object.entries(
    offers.reduce<Record<string, number>>((acc, o) => {
      const key = o.district ? `${o.city}, ${o.district}` : o.city
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {}),
  ).sort((a, b) => b[1] - a[1])

  return (
    <div className="bg-[#0C0F0E] font-sans text-[#F2F0EC]">
      {/* ---------- Pasek ---------- */}
      <header className="sticky top-[49px] z-50 border-b border-[#F2F0EC]/12 bg-[#0C0F0E]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-4 lg:px-10">
          <Link
            href="/warianty/c"
            className="text-heading font-display text-[17px] leading-none font-bold tracking-tight uppercase"
          >
            Czajczyński<span className="text-[#E8563A]">.</span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {NAV.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-micro rounded-sm px-3 py-2 text-[12px] font-bold text-[#F2F0EC]/60 uppercase transition-colors hover:bg-[#F2F0EC]/10 hover:text-[#F2F0EC]"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href="tel:+48717944983"
            className="nums text-micro bg-[#E8563A] px-4 py-2.5 text-[12px] font-bold text-[#0C0F0E] uppercase transition-transform duration-200 active:scale-[0.97]"
          >
            71 794 49 83
          </a>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative min-h-[82svh] overflow-hidden">
        {hero?.photos[0] ? (
          <Image
            src={hero.photos[0].url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-105 object-cover opacity-80"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0F0E] via-[#0C0F0E]/70 via-55% to-[#0C0F0E]/30" />

        <div className="relative mx-auto flex min-h-[82svh] max-w-[1600px] flex-col justify-end px-6 pt-24 pb-12 lg:px-10 lg:pb-16">
          <h1 className="text-display font-display text-[clamp(3rem,10.5vw,10rem)] font-extrabold uppercase">
            Wrocław
            <span className="text-[#E8563A]">.</span>
            <br />
            Nasze podwórko
            <span className="text-[#E8563A]">.</span>
          </h1>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-8 border-t-2 border-[#F2F0EC]/20 pt-8">
            <p className="text-body max-w-md text-[17px] text-[#F2F0EC]/75">
              {offers.length} ofert, {exclusive} na wyłączność. Mieszkania, domy, działki i lokale —
              we Wrocławiu i na Dolnym Śląsku.
            </p>
            <a
              href="#oferty"
              className="text-micro inline-flex items-center gap-2.5 bg-[#F2F0EC] px-7 py-4 text-[13px] font-bold text-[#0C0F0E] uppercase transition-all duration-200 hover:bg-[#E8563A] active:scale-[0.97]"
            >
              Przeglądaj oferty
              <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Liczby ---------- */}
      <section className="border-y border-[#F2F0EC]/12">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 lg:grid-cols-4">
          {counts.map(({ type, count }, i) => (
            <a
              key={type}
              href="#oferty"
              className={[
                'group px-6 py-9 transition-colors duration-200 hover:bg-[#F2F0EC]/6 lg:px-10',
                i > 0 ? 'border-l border-[#F2F0EC]/12' : '',
                i === 2 ? 'border-t border-[#F2F0EC]/12 lg:border-t-0' : '',
                i === 3 ? 'border-t border-[#F2F0EC]/12 lg:border-t-0' : '',
              ].join(' ')}
            >
              <p className="nums text-display font-display text-[clamp(2.5rem,5vw,4rem)] font-extrabold transition-colors duration-200 group-hover:text-[#E8563A]">
                {count}
              </p>
              <p className="text-micro mt-2 text-[12px] font-bold text-[#F2F0EC]/55 uppercase">
                {PROPERTY_TYPES[type].many}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* ---------- Oferty ---------- */}
      <section id="oferty" className="mx-auto max-w-[1600px] scroll-mt-32 px-6 py-20 lg:px-10 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-display font-display text-[clamp(2.25rem,5vw,4.5rem)] font-extrabold uppercase">
            Aktualne oferty
          </h2>
          <a
            href="#oferty"
            className="text-micro inline-flex items-center gap-2 border-b-2 border-[#E8563A] pb-1.5 text-[13px] font-bold uppercase transition-colors hover:text-[#E8563A]"
          >
            Wszystkie {offers.length} z filtrami
            <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((offer) => (
            <OfferCardC key={offer.id} offer={offer} />
          ))}
        </div>
      </section>

      {/* ---------- Dzielnice ---------- */}
      <section id="dzielnice" className="scroll-mt-32 border-t border-[#F2F0EC]/12">
        <div className="mx-auto max-w-[1600px] px-6 py-20 lg:px-10 lg:py-28">
          <h2 className="text-display font-display text-[clamp(2.25rem,5vw,4.5rem)] font-extrabold uppercase">
            Gdzie mamy oferty
          </h2>
          <ul className="mt-12 divide-y divide-[#F2F0EC]/12 border-y border-[#F2F0EC]/12">
            {districts.map(([name, count]) => (
              <li key={name}>
                <a
                  href="#oferty"
                  className="group flex items-center justify-between gap-6 py-5 transition-colors duration-200 hover:bg-[#F2F0EC]/5"
                >
                  <span className="text-heading text-[clamp(1.25rem,2.6vw,2rem)] font-semibold transition-colors group-hover:text-[#E8563A]">
                    {name}
                  </span>
                  <span className="nums text-body shrink-0 text-[15px] text-[#F2F0EC]/45">
                    {count}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Zespol ---------- */}
      <section id="zespol" className="scroll-mt-32 bg-[#E8563A] text-[#0C0F0E]">
        <div className="mx-auto max-w-[1600px] px-6 py-20 lg:px-10 lg:py-28">
          <h2 className="text-display font-display text-[clamp(2.25rem,5vw,4.5rem)] font-extrabold uppercase">
            Dwie osoby.
            <br />
            Zero call center.
          </h2>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:max-w-4xl lg:gap-16">
            {agents.map((agent) => (
              <div key={agent.id} className="border-t-2 border-[#0C0F0E]/25 pt-6">
                <h3 className="text-heading text-3xl font-bold">{agent.fullName}</h3>
                <p className="text-body mt-2 text-[16px] font-medium text-[#0C0F0E]/70">
                  {agent.role}
                </p>
                {agent.licence ? (
                  <p className="text-body mt-1 text-[14px] text-[#0C0F0E]/55">{agent.licence}</p>
                ) : null}
                <div className="mt-5 flex flex-col gap-1.5">
                  <a
                    href={`tel:${agent.phone?.replace(/\s/g, '')}`}
                    className="text-body inline-flex items-center gap-2 text-[16px] font-medium transition-opacity hover:opacity-70"
                  >
                    <Phone className="size-4" aria-hidden />
                    {agent.phone}
                  </a>
                  <a
                    href={`mailto:${agent.email}`}
                    className="text-body inline-flex items-center gap-2 text-[16px] font-medium transition-opacity hover:opacity-70"
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

      {/* ---------- Kontakt ---------- */}
      <footer id="kontakt" className="mx-auto max-w-[1600px] scroll-mt-32 px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <h2 className="text-display font-display text-[clamp(2.25rem,5vw,4.5rem)] font-extrabold uppercase">
              Odezwij się
            </h2>
            <address className="text-body mt-8 space-y-3 text-[17px] text-[#F2F0EC]/75 not-italic">
              <p className="flex items-start gap-3">
                <MapPin className="mt-1 size-4 shrink-0 text-[#E8563A]" aria-hidden />
                ul. Białoskórnicza 10, 50-134 Wrocław
              </p>
              <p className="flex items-start gap-3">
                <Phone className="mt-1 size-4 shrink-0 text-[#E8563A]" aria-hidden />
                <a href="tel:+48717944983" className="transition-colors hover:text-[#F2F0EC]">
                  71 794 49 83
                </a>
              </p>
              <p className="flex items-start gap-3">
                <Mail className="mt-1 size-4 shrink-0 text-[#E8563A]" aria-hidden />
                <a
                  href="mailto:oferty@superlokum.pl"
                  className="transition-colors hover:text-[#F2F0EC]"
                >
                  oferty@superlokum.pl
                </a>
              </p>
            </address>
            {hero ? (
              <p className="text-body mt-10 text-[15px] text-[#F2F0EC]/40">
                Najdroższa oferta w bazie: {formatPrice(hero.price)} — {hero.city}
                {hero.district ? `, ${hero.district}` : ''}
              </p>
            ) : null}
          </div>

          <form className="border-t-2 border-[#F2F0EC]/20 pt-8">
            <div className="space-y-5">
              {[
                { label: 'Imię i nazwisko', name: 'name' },
                { label: 'Telefon lub e-mail', name: 'contact' },
              ].map((f) => (
                <label key={f.name} className="block">
                  <span className="text-micro text-[11px] font-bold text-[#F2F0EC]/50 uppercase">
                    {f.label}
                  </span>
                  <input
                    type="text"
                    name={f.name}
                    className="text-body mt-2 h-12 w-full border-b-2 border-[#F2F0EC]/25 bg-transparent text-[16px] outline-none transition-colors focus:border-[#E8563A]"
                  />
                </label>
              ))}
              <label className="block">
                <span className="text-micro text-[11px] font-bold text-[#F2F0EC]/50 uppercase">
                  Wiadomość
                </span>
                <textarea
                  name="message"
                  rows={3}
                  className="text-body mt-2 w-full border-b-2 border-[#F2F0EC]/25 bg-transparent py-2 text-[16px] outline-none transition-colors focus:border-[#E8563A]"
                />
              </label>
            </div>
            <button
              type="button"
              className="text-micro mt-8 h-13 w-full bg-[#E8563A] text-[13px] font-bold text-[#0C0F0E] uppercase transition-all duration-200 hover:bg-[#F2F0EC] active:scale-[0.98]"
            >
              Wyślij wiadomość
            </button>
          </form>
        </div>

        <p className="text-body mt-16 border-t border-[#F2F0EC]/12 pt-7 text-[13px] text-[#F2F0EC]/40">
          Prototyp · wariant C „Brama". Dane i zdjęcia pochodzą z obecnej strony superlokum.pl.
        </p>
      </footer>
    </div>
  )
}
