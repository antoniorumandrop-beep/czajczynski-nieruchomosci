import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { getAgents, getOffersByAgent } from '@/lib/offers'
import { offersCount } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Zespół — Czajczyński Nieruchomości',
  description:
    'Beata Woroszkiewicz — pośrednik w obrocie nieruchomościami. Piotr Czajczyński — rzeczoznawca majątkowy.',
}

export default async function TeamPage() {
  const agents = await getAgents()
  // liczbe ofert pobieramy z gory - w synchronicznym .map nie ma jak czekac
  const counts = new Map(
    await Promise.all(
      agents.map(async (a) => [a.id, (await getOffersByAgent(a.id)).length] as const),
    ),
  )

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
      <h1 className="text-display font-serif text-[clamp(2rem,5vw,3.5rem)]">Zespół</h1>
      <p className="text-body mt-4 max-w-2xl text-[17px] text-[#4A443D]">
        Biuro prowadzą dwie osoby z dwoma różnymi uprawnieniami — pośrednictwo i wycena. To znaczy,
        że jedną nieruchomość potrafimy obsłużyć od początku do końca, bez odsyłania do zewnętrznych
        firm.
      </p>

      <div className="mt-14 grid gap-12 border-t border-[#1E1B18]/12 pt-12 sm:grid-cols-2 lg:gap-20">
        {agents.map((agent) => {
          const count = counts.get(agent.id) ?? 0
          return (
            <div key={agent.id}>
              <h2 className="text-heading font-serif text-3xl">
                <Link href={`/zespol/${agent.slug}`} className="transition-colors hover:text-[#8A6A3B]">
                  {agent.fullName}
                </Link>
              </h2>
              <p className="text-body mt-2 text-[16px] text-[#8A6A3B]">{agent.role}</p>
              {agent.licence ? (
                <p className="text-body mt-1 text-[14px] text-[#8C857C]">{agent.licence}</p>
              ) : null}
              <p className="text-body mt-4 text-[15px] text-[#6B645B]">
                {count > 0 ? `Prowadzi ${offersCount(count)}` : 'Prowadzi wynajmy i wyceny ofertowe'}
              </p>

              <div className="mt-6 flex flex-col gap-2">
                <a
                  href={`tel:${agent.phone?.replace(/\s/g, '')}`}
                  className="text-body inline-flex h-11 items-center gap-2 text-[16px] transition-colors hover:text-[#8A6A3B]"
                >
                  <Phone className="size-4 text-[#8C857C]" aria-hidden />
                  {agent.phone}
                </a>
                <a
                  href={`mailto:${agent.email}`}
                  className="text-body inline-flex h-11 items-center gap-2 text-[16px] transition-colors hover:text-[#8A6A3B]"
                >
                  <Mail className="size-4 text-[#8C857C]" aria-hidden />
                  {agent.email}
                </a>
              </div>

              <Link
                href={`/zespol/${agent.slug}`}
                className="text-body mt-5 inline-block border-b border-[#8A6A3B]/40 pb-0.5 text-[15px] font-medium text-[#8A6A3B]"
              >
                Zobacz profil
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
