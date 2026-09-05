import type { Metadata } from 'next'
import Link from 'next/link'
import { getAgents, getPublicOffers } from '@/lib/offers'
import { CONTACT } from '@/lib/site'

export const metadata: Metadata = {
  title: 'O firmie — Czajczyński Nieruchomości',
  description:
    'Dwuosobowe biuro nieruchomości we Wrocławiu. Pośrednictwo w sprzedaży i wynajmie oraz wycena nieruchomości z uprawnieniami.',
}

export default async function AboutPage() {
  const offers = await getPublicOffers()
  const exclusive = offers.filter((o) => o.isExclusive).length
  const agents = await getAgents()

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
      <h1 className="text-display max-w-3xl font-serif text-[clamp(2rem,5vw,3.5rem)] text-balance">
        Małe biuro, w którym rozmawiasz z tą samą osobą od początku do końca
      </h1>

      <div className="mt-12 grid gap-12 border-t border-[#1E1B18]/12 pt-10 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div className="text-body max-w-2xl space-y-5 text-[18px] text-[#4A443D]">
          <p>
            Czajczyński Nieruchomości to biuro prowadzone przez dwie osoby, z siedzibą przy{' '}
            {CONTACT.street} na wrocławskim Starym Mieście. Zajmujemy się pośrednictwem w sprzedaży
            i wynajmie mieszkań, domów, działek i lokali użytkowych oraz wyceną nieruchomości.
          </p>
          <p>
            Nie mamy call center ani działu obsługi klienta. Osoba, która odbiera telefon, jest tą
            samą, która pokaże Państwu mieszkanie, przeprowadzi negocjacje i pojedzie do notariusza.
            To ogranicza liczbę spraw, jakie możemy prowadzić naraz — i dlatego{' '}
            {exclusive} z {offers.length} naszych ofert to umowy na wyłączność.
          </p>
          <p>
            Umowa na wyłączność oznacza, że nieruchomość prowadzimy tylko my. Widzieliśmy każde z
            tych mieszkań na własne oczy, znamy stan prawny, wysokość czynszu i to, co widać z okna.
            Kupujący dostaje jedną spójną informację zamiast pięciu sprzecznych ogłoszeń tej samej
            nieruchomości.
          </p>
        </div>

        <aside>
          <div className="border border-[#1E1B18]/12 bg-[#F1EBE2] p-7">
            <p className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">
              W skrócie
            </p>
            <dl className="mt-5 space-y-5">
              {[
                { t: 'Siedziba', d: `${CONTACT.street}, ${CONTACT.city}` },
                { t: 'Oferty w bazie', d: String(offers.length) },
                { t: 'Na wyłączność', d: `${exclusive} z ${offers.length}` },
                { t: 'Zespół', d: agents.map((a) => a.fullName).join(', ') },
                { t: 'Zakres', d: 'Wrocław i Dolny Śląsk' },
              ].map((row) => (
                <div key={row.t}>
                  <dt className="text-micro text-[11px] text-[#8C857C] uppercase">{row.t}</dt>
                  <dd className="text-body nums mt-1 text-[16px]">{row.d}</dd>
                </div>
              ))}
            </dl>
            <Link
              href="/zespol"
              className="text-body mt-7 inline-block border-b border-[#8A6A3B]/40 pb-0.5 text-[15px] font-medium text-[#8A6A3B]"
            >
              Poznaj zespół
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
