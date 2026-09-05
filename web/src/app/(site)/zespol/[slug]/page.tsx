import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Mail, Phone } from 'lucide-react'
import { InquiryForm } from '@/components/site/inquiry-form'
import { OfferCard } from '@/components/site/offer-card'
import { getAgents, getOffersByAgent } from '@/lib/offers'
import { offersCount } from '@/lib/format'

export function generateStaticParams() {
  return getAgents().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata(props: PageProps<'/zespol/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const agent = getAgents().find((a) => a.slug === slug)
  if (!agent) return {}
  return {
    title: `${agent.fullName} — Czajczyński Nieruchomości`,
    description: `${agent.fullName}, ${agent.role.toLowerCase()} w biurze Czajczyński Nieruchomości we Wrocławiu.`,
  }
}

export default async function AgentPage(props: PageProps<'/zespol/[slug]'>) {
  const { slug } = await props.params
  const agent = getAgents().find((a) => a.slug === slug)
  if (!agent) notFound()

  const offers = getOffersByAgent(agent.id)

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
      <Link href="/zespol" className="text-body text-[14px] text-[#8C857C] hover:text-[#1E1B18]">
        ← Zespół
      </Link>

      <div className="mt-8 grid gap-12 border-t border-[#1E1B18]/12 pt-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div>
          <h1 className="text-display font-serif text-[clamp(2rem,5vw,3.5rem)]">{agent.fullName}</h1>
          <p className="text-body mt-3 text-[18px] text-[#8A6A3B]">{agent.role}</p>
          {agent.licence ? (
            <p className="text-body mt-1 text-[15px] text-[#8C857C]">{agent.licence}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`tel:${agent.phone?.replace(/\s/g, '')}`}
              className="text-body inline-flex h-12 items-center gap-2 bg-[#1E1B18] px-5 text-[16px] font-medium text-[#F6F2EC] transition-colors hover:bg-[#8A6A3B]"
            >
              <Phone className="size-4" aria-hidden />
              {agent.phone}
            </a>
            <a
              href={`mailto:${agent.email}`}
              className="text-body inline-flex h-12 items-center gap-2 px-5 text-[16px] text-[#1E1B18] ring-1 ring-[#1E1B18]/15 transition-colors hover:bg-[#1E1B18]/5"
            >
              <Mail className="size-4" aria-hidden />
              {agent.email}
            </a>
          </div>
        </div>

        <div className="border-t border-[#1E1B18]/12 pt-8 lg:border-t-0 lg:pt-0">
          <InquiryForm heading={`Napisz do ${agent.fullName.split(' ')[0]}`} compact />
        </div>
      </div>

      <section className="mt-20 border-t border-[#1E1B18]/12 pt-12">
        <h2 className="text-heading font-serif text-2xl">
          {offers.length > 0 ? `Oferty — ${offersCount(offers.length)}` : 'Oferty'}
        </h2>

        {offers.length > 0 ? (
          <div className="mt-10 grid gap-x-10 gap-y-16 sm:grid-cols-2">
            {offers.map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>
        ) : (
          <div className="mt-8 max-w-2xl border border-[#1E1B18]/12 bg-[#F1EBE2] p-7">
            <p className="text-body text-[17px] text-[#4A443D]">
              W tej chwili wszystkie publikowane oferty prowadzi drugi z nas. Jeśli szukają Państwo
              mieszkania lub lokalu, którego nie ma na stronie — proszę zadzwonić. Część
              nieruchomości trafia do nas zanim pojawi się w internecie.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${agent.phone?.replace(/\s/g, '')}`}
                className="text-body inline-flex h-11 items-center gap-2 bg-[#1E1B18] px-5 text-[15px] font-medium text-[#F6F2EC] transition-colors hover:bg-[#8A6A3B]"
              >
                <Phone className="size-4" aria-hidden />
                {agent.phone}
              </a>
              <Link
                href="/oferty"
                className="text-body inline-flex h-11 items-center px-5 text-[15px] text-[#1E1B18] ring-1 ring-[#1E1B18]/15 transition-colors hover:bg-[#1E1B18]/5"
              >
                Przejrzyj wszystkie oferty biura
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
