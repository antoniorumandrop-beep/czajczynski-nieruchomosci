import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { OfferCard } from '@/components/site/offer-card'
import { getAgents, getPublicOffers } from '@/lib/offers'
import { formatPrice, offersCount } from '@/lib/format'
import { PROPERTY_TYPES, type PropertyType } from '@/lib/types'
import { AgentAvatar } from '@/components/site/avatar'

export default async function HomePage() {
  const offers = await getPublicOffers()
  const agents = await getAgents()
  const exclusive = offers.filter((o) => o.isExclusive).length
  const newest = offers.slice(0, 6)
  const strip = offers.filter((o) => o.photos.length > 2).slice(0, 3)

  const counts = (Object.keys(PROPERTY_TYPES) as PropertyType[]).map((t) => ({
    type: t,
    count: offers.filter((o) => o.propertyType === t).length,
  }))

  return (
    <>
      {/* ---------- Hero: prowadzi zdanie, nie zdjecie ---------- */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-14 lg:px-8 lg:pt-24">
        <p className="text-micro text-[11px] font-semibold text-[#8A6A3B] uppercase">
          Biuro nieruchomości · Wrocław, Stare Miasto
        </p>

        <h1 className="text-display mt-7 max-w-4xl font-serif text-[clamp(2.5rem,6vw,4.75rem)] font-normal text-balance">
          Nieruchomość to nie ogłoszenie. To decyzja na dwadzieścia lat.
        </h1>

        <div className="mt-10 grid gap-8 border-t border-[#1E1B18]/12 pt-8 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <p className="text-body max-w-xl text-[18px] text-[#4A443D]">
            Prowadzimy sprzedaż i wynajem mieszkań, domów, działek i lokali we Wrocławiu i na Dolnym
            Śląsku. Pracujemy we dwoje — ta sama osoba odbiera telefon, pokazuje mieszkanie i siedzi
            z Państwem u notariusza.
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
              href={`/oferta/${o.slug}`}
              className={[
                'group relative overflow-hidden bg-[#E7E0D6]',
                i === 0 ? 'col-span-2 aspect-3/2' : 'aspect-square lg:aspect-3/2',
              ].join(' ')}
            >
              <Image
                src={o.photos[i === 0 ? 0 : 1]!.url}
                alt={o.title}
                fill
                priority={i === 0}
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
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-28">
        <h2 className="text-display max-w-2xl font-serif text-[clamp(2rem,4vw,3.25rem)] text-balance">
          Dwie osoby, dwie różne uprawnienia
        </h2>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:gap-16">
          {agents.map((agent, i) => (
            <div key={agent.id} className="border-t border-[#1E1B18]/12 pt-7">
              <p className="text-micro text-[11px] text-[#8C857C] uppercase">0{i + 1}</p>
              <AgentAvatar agent={agent} size={96} className="mt-5" />
              <h3 className="text-heading mt-5 font-serif text-3xl">
                <Link href={`/zespol/${agent.slug}`} className="inline-block py-1 transition-colors hover:text-[#8A6A3B]">
                  {agent.fullName}
                </Link>
              </h3>
              <p className="text-body mt-2 text-[16px] text-[#8A6A3B]">{agent.role}</p>
              {agent.licence ? (
                <p className="text-body mt-1 text-[14px] text-[#8C857C]">{agent.licence}</p>
              ) : null}
              <p className="text-body mt-5 max-w-sm text-[16px] text-[#4A443D]">
                {i === 0
                  ? 'Prowadzi sprzedaż i wynajem — od wyceny ofertowej i sesji zdjęciowej, przez prezentacje, po negocjacje i akt notarialny.'
                  : 'Sporządza operaty szacunkowe z uprawnieniami państwowymi: do kredytu, do sądu, do podziału majątku i do rozliczeń z urzędem skarbowym.'}
              </p>
              <Link
                href={`/zespol/${agent.slug}`}
                className="text-body mt-4 inline-block border-b border-[#8A6A3B]/40 py-1.5 text-[15px] font-medium text-[#8A6A3B] transition-colors hover:border-[#8A6A3B]"
              >
                Zobacz profil
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Oferty ---------- */}
      <section className="border-t border-[#1E1B18]/12 bg-[#F1EBE2]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
            <h2 className="text-display font-serif text-[clamp(2rem,4vw,3.25rem)]">
              Najnowsze oferty
            </h2>
            <p className="text-body text-[15px] text-[#6B645B]">{offersCount(offers.length)} w bazie</p>
          </div>

          <nav className="mt-8 flex flex-wrap gap-2 border-y border-[#1E1B18]/12 py-4">
            <Link
              href="/oferty"
              className="text-body bg-[#1E1B18] px-4 py-2 text-[14px] text-[#F6F2EC] transition-colors hover:bg-[#8A6A3B]"
            >
              Wszystkie
            </Link>
            {counts.map(({ type, count }) => (
              <Link
                key={type}
                href={`/oferty/${PROPERTY_TYPES[type].slug}`}
                className="text-body px-4 py-2 text-[14px] text-[#4A443D] ring-1 ring-[#1E1B18]/15 transition-colors hover:bg-[#1E1B18] hover:text-[#F6F2EC]"
              >
                {PROPERTY_TYPES[type].many}
                <span className="nums ml-2 text-[#8C857C]">{count}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2">
            {newest.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>

          <div className="mt-16 border-t border-[#1E1B18]/12 pt-8">
            <Link
              href="/oferty"
              className="text-heading inline-flex items-center gap-3 font-serif text-2xl transition-colors hover:text-[#8A6A3B]"
            >
              Zobacz wszystkie {offers.length} ofert z filtrami
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Wycena ---------- */}
      <section className="bg-[#1E1B18] text-[#F6F2EC]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-28">
          <h2 className="text-display font-serif text-[clamp(2rem,4vw,3.25rem)] text-balance">
            Operat szacunkowy z uprawnieniami państwowymi
          </h2>
          <div>
            <p className="text-body text-[18px] text-[#F6F2EC]/75">
              Wycena nieruchomości to osobna usługa, niezależna od pośrednictwa. Sporządzamy operaty
              do kredytu hipotecznego, postępowania sądowego, podziału majątku i rozliczeń
              podatkowych.
            </p>
            <Link
              href="/wycena"
              className="text-body mt-8 inline-block border-b border-[#8A6A3B] pb-1 text-[17px] font-medium text-[#C4A375] transition-colors hover:text-[#F6F2EC]"
            >
              Co obejmuje wycena
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
