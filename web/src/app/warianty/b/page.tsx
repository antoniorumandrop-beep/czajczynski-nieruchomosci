import Image from 'next/image'
import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { OfferCardB } from '@/components/variant-b/offer-card'
import { getAgents, getPublicOffers } from '@/lib/offers'
import { formatPrice, offersCount } from '@/lib/format'
import { PROPERTY_TYPES, type PropertyType } from '@/lib/types'

const NAV = [
  { href: '#oferty', label: 'Oferty' },
  { href: '#zespol', label: 'O nas' },
  { href: '#wycena', label: 'Wycena' },
  { href: '#kontakt', label: 'Kontakt' },
]

export default function VariantB() {
  const offers = getPublicOffers()
  const agents = getAgents()
  const exclusive = offers.filter((o) => o.isExclusive).length
  const shown = offers.slice(0, 8)

  // pasmo zdjec pod naglowkiem - po jednym kadrze z czterech roznych ofert
  const strip = offers.filter((o) => o.photos.length > 2).slice(0, 3)

  const counts = (Object.keys(PROPERTY_TYPES) as PropertyType[]).map((t) => ({
    type: t,
    count: offers.filter((o) => o.propertyType === t).length,
  }))

  return (
    <div className="bg-[#F6F2EC] font-sans text-[#1E1B18]">
      {/* ---------- Pasek ---------- */}
      <header className="sticky top-[49px] z-50 border-b border-[#1E1B18]/12 bg-[#F6F2EC]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
          <Link href="/warianty/b" className="font-serif text-[19px] leading-none text-[#1E1B18]">
            Czajczyński<span className="text-[#8A6A3B]"> Nieruchomości</span>
          </Link>
          <nav className="hidden gap-7 md:flex">
            {NAV.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-body text-[15px] text-[#6B645B] transition-colors hover:text-[#1E1B18]"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href="tel:+48717944983"
            className="nums text-body shrink-0 text-[15px] font-medium text-[#1E1B18] transition-colors hover:text-[#8A6A3B]"
          >
            71 794 49 83
          </a>
        </div>
      </header>

      {/* ---------- Hero: prowadzi tekst, nie zdjecie ---------- */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-14 lg:px-8 lg:pt-24">
        <p className="text-micro text-[11px] font-semibold text-[#8A6A3B] uppercase">
          Biuro nieruchomości · Wrocław, Stare Miasto
        </p>

        <h1 className="text-display mt-7 max-w-4xl font-serif text-[clamp(2.5rem,6vw,4.75rem)] font-normal text-balance">
          Nieruchomość to nie ogłoszenie. To decyzja na dwadzieścia lat.
        </h1>

        <div className="mt-10 grid gap-8 border-t border-[#1E1B18]/12 pt-8 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <p className="text-body max-w-xl text-[18px] text-[#4A443D]">
            Prowadzimy sprzedaż i wynajem mieszkań, domów, działek i lokali we Wrocławiu i na
            Dolnym Śląsku. Pracujemy we dwoje — ta sama osoba odbiera telefon, pokazuje mieszkanie
            i siedzi z Państwem u notariusza.
          </p>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 self-start">
            <div>
              <dt className="text-micro text-[11px] text-[#8C857C] uppercase">Oferty w bazie</dt>
              <dd className="nums text-heading mt-1 font-serif text-3xl">{offers.length}</dd>
            </div>
            <div>
              <dt className="text-micro text-[11px] text-[#8C857C] uppercase">Na wyłączność</dt>
              <dd className="nums text-heading mt-1 font-serif text-3xl">
                {exclusive}
                <span className="text-lg text-[#8C857C]">/{offers.length}</span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ---------- Pasmo zdjec ---------- */}
      <section className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
          {strip.map((o, i) => (
            <Link
              key={o.id}
              href={`/warianty/b/oferta/${o.slug}`}
              className={[
                'group relative overflow-hidden bg-[#E7E0D6]',
                i === 0 ? 'col-span-2 aspect-3/2' : 'aspect-square lg:aspect-3/2',
              ].join(' ')}
            >
              <Image
                src={o.photos[i === 0 ? 0 : 1]!.url}
                alt={o.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1E1B18]/75 to-transparent p-4 pt-10">
                <p className="text-body truncate text-[13px] text-white/85">
                  {[o.city, o.district].filter(Boolean).join(', ')}
                </p>
                <p className="nums text-heading text-[15px] font-semibold text-white">
                  {formatPrice(o.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Zespol ---------- */}
      <section id="zespol" className="mx-auto max-w-6xl scroll-mt-32 px-6 py-20 lg:px-8 lg:py-28">
        <h2 className="text-display max-w-2xl font-serif text-[clamp(2rem,4vw,3.25rem)] text-balance">
          Dwie osoby, dwie różne uprawnienia
        </h2>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:gap-16">
          {agents.map((agent, i) => (
            <div key={agent.id} className="border-t border-[#1E1B18]/12 pt-7">
              <p className="text-micro text-[11px] text-[#8C857C] uppercase">0{i + 1}</p>
              <h3 className="text-heading mt-4 font-serif text-3xl">{agent.fullName}</h3>
              <p className="text-body mt-2 text-[16px] text-[#8A6A3B]">{agent.role}</p>
              {agent.licence ? (
                <p className="text-body mt-1 text-[14px] text-[#8C857C]">{agent.licence}</p>
              ) : null}
              <p className="text-body mt-5 max-w-sm text-[16px] text-[#4A443D]">
                {i === 0
                  ? 'Prowadzi sprzedaż i wynajem — od wyceny ofertowej i sesji zdjęciowej, przez prezentacje, po negocjacje i akt notarialny.'
                  : 'Sporządza operaty szacunkowe z uprawnieniami państwowymi: do kredytu, do sądu, do podziału majątku i do rozliczeń z urzędem skarbowym.'}
              </p>
              <div className="mt-5 flex flex-col gap-1.5">
                <a
                  href={`tel:${agent.phone?.replace(/\s/g, '')}`}
                  className="text-body inline-flex items-center gap-2 text-[15px] text-[#1E1B18] transition-colors hover:text-[#8A6A3B]"
                >
                  <Phone className="size-4 text-[#8C857C]" aria-hidden />
                  {agent.phone}
                </a>
                <a
                  href={`mailto:${agent.email}`}
                  className="text-body inline-flex items-center gap-2 text-[15px] text-[#1E1B18] transition-colors hover:text-[#8A6A3B]"
                >
                  <Mail className="size-4 text-[#8C857C]" aria-hidden />
                  {agent.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Oferty ---------- */}
      <section id="oferty" className="scroll-mt-32 border-t border-[#1E1B18]/12 bg-[#F1EBE2]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
            <h2 className="text-display font-serif text-[clamp(2rem,4vw,3.25rem)]">
              Aktualne oferty
            </h2>
            <p className="text-body text-[15px] text-[#6B645B]">{offersCount(offers.length)}</p>
          </div>

          <nav className="mt-8 flex flex-wrap gap-2 border-y border-[#1E1B18]/12 py-4">
            {counts.map(({ type, count }) => (
              <a
                key={type}
                href="#oferty"
                className="text-body rounded-full px-4 py-2 text-[14px] text-[#4A443D] ring-1 ring-[#1E1B18]/15 transition-colors hover:bg-[#1E1B18] hover:text-[#F6F2EC]"
              >
                {PROPERTY_TYPES[type].many}
                <span className="nums ml-2 text-[#8C857C]">{count}</span>
              </a>
            ))}
          </nav>

          <div className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2">
            {shown.map((offer) => (
              <OfferCardB key={offer.id} offer={offer} />
            ))}
          </div>

          <div className="mt-16 border-t border-[#1E1B18]/12 pt-8">
            <a
              href="#oferty"
              className="text-heading font-serif text-2xl text-[#1E1B18] transition-colors hover:text-[#8A6A3B]"
            >
              Zobacz wszystkie {offers.length} ofert z filtrami →
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Wycena ---------- */}
      <section id="wycena" className="scroll-mt-32 bg-[#1E1B18] text-[#F6F2EC]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-8 lg:py-28">
          <h2 className="text-display font-serif text-[clamp(2rem,4vw,3.25rem)] text-balance">
            Operat szacunkowy z uprawnieniami państwowymi
          </h2>
          <div>
            <p className="text-body text-[18px] text-[#F6F2EC]/75">
              Wycena nieruchomości to osobna usługa, niezależna od pośrednictwa. Sporządzamy operaty
              do kredytu hipotecznego, postępowania sądowego, podziału majątku i rozliczeń
              podatkowych.
            </p>
            <a
              href="#kontakt"
              className="text-body mt-8 inline-block border-b border-[#8A6A3B] pb-1 text-[17px] font-medium text-[#C4A375] transition-colors hover:text-[#F6F2EC]"
            >
              Zapytaj o wycenę
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Kontakt ---------- */}
      <footer id="kontakt" className="mx-auto max-w-6xl scroll-mt-32 px-6 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <h2 className="text-display font-serif text-[clamp(2rem,4vw,3.25rem)]">Kontakt</h2>
            <address className="text-body mt-8 space-y-3 text-[17px] text-[#4A443D] not-italic">
              <p className="flex items-start gap-3">
                <MapPin className="mt-1 size-4 shrink-0 text-[#8C857C]" aria-hidden />
                ul. Białoskórnicza 10
                <br />
                50-134 Wrocław
              </p>
              <p className="flex items-start gap-3">
                <Phone className="mt-1 size-4 shrink-0 text-[#8C857C]" aria-hidden />
                <a href="tel:+48717944983" className="transition-colors hover:text-[#8A6A3B]">
                  71 794 49 83
                </a>
              </p>
              <p className="flex items-start gap-3">
                <Mail className="mt-1 size-4 shrink-0 text-[#8C857C]" aria-hidden />
                <a
                  href="mailto:oferty@superlokum.pl"
                  className="transition-colors hover:text-[#8A6A3B]"
                >
                  oferty@superlokum.pl
                </a>
              </p>
            </address>
          </div>

          <form className="border-t border-[#1E1B18]/12 pt-8">
            <p className="text-heading font-serif text-2xl">Napisz do nas</p>
            <div className="mt-6 space-y-5">
              {[
                { label: 'Imię i nazwisko', name: 'name' },
                { label: 'Telefon lub e-mail', name: 'contact' },
              ].map((f) => (
                <label key={f.name} className="block">
                  <span className="text-micro text-[11px] text-[#8C857C] uppercase">{f.label}</span>
                  <input
                    type="text"
                    name={f.name}
                    className="text-body mt-2 h-11 w-full border-b border-[#1E1B18]/25 bg-transparent text-[16px] outline-none transition-colors focus:border-[#8A6A3B]"
                  />
                </label>
              ))}
              <label className="block">
                <span className="text-micro text-[11px] text-[#8C857C] uppercase">Wiadomość</span>
                <textarea
                  name="message"
                  rows={3}
                  className="text-body mt-2 w-full border-b border-[#1E1B18]/25 bg-transparent py-2 text-[16px] outline-none transition-colors focus:border-[#8A6A3B]"
                />
              </label>
            </div>
            <button
              type="button"
              className="mt-8 h-12 w-full bg-[#1E1B18] text-[15px] font-medium text-[#F6F2EC] transition-colors hover:bg-[#8A6A3B]"
            >
              Wyślij wiadomość
            </button>
          </form>
        </div>

        <p className="text-body mt-16 border-t border-[#1E1B18]/12 pt-7 text-[13px] text-[#8C857C]">
          Prototyp · wariant B „Kontora". Dane i zdjęcia pochodzą z obecnej strony superlokum.pl.
        </p>
      </footer>
    </div>
  )
}
