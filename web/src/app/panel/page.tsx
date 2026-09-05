import Link from 'next/link'
import { ArrowRight, FileText, Inbox, Plus } from 'lucide-react'
import { hasSupabase } from '@/lib/supabase/config'
import { NotConfigured } from '@/components/panel/not-configured'
import { panelInquiries, panelOffers } from '@/lib/panel/data'
import { offersCount } from '@/lib/format'
import { StatusBadge } from '@/components/panel/status-badge'

export default async function PanelHome() {
  if (!hasSupabase()) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <NotConfigured />
      </div>
    )
  }

  const [offers, inquiries] = await Promise.all([panelOffers(), panelInquiries()])
  const published = offers.filter((o) => o.status === 'published').length
  const drafts = offers.filter((o) => o.status === 'draft').length
  const unread = inquiries.filter((i) => !i.isRead).length

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
      <h1 className="text-display font-serif text-[clamp(2rem,4vw,3rem)]">Co dziś robimy</h1>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Link
          href="/panel/oferty/nowa"
          className="group flex items-center gap-4 bg-[#1E1B18] p-6 text-[#F6F2EC] transition-colors hover:bg-[#8A6A3B]"
        >
          <Plus className="size-6 shrink-0" aria-hidden />
          <span className="text-heading text-xl font-medium">Dodaj nową ofertę</span>
          <ArrowRight
            className="ml-auto size-5 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Link>

        <Link
          href="/panel/oferty"
          className="group flex items-center gap-4 border border-[#1E1B18]/15 bg-white p-6 transition-colors hover:border-[#1E1B18]"
        >
          <FileText className="size-6 shrink-0 text-[#8A6A3B]" aria-hidden />
          <span>
            <span className="nums text-heading block text-xl font-medium">{offers.length}</span>
            <span className="text-body block text-[14px] text-[#6B645B]">
              ofert, w tym {drafts} {drafts === 1 ? 'szkic' : 'szkiców'}
            </span>
          </span>
        </Link>

        <Link
          href="/panel/zapytania"
          className="group flex items-center gap-4 border border-[#1E1B18]/15 bg-white p-6 transition-colors hover:border-[#1E1B18]"
        >
          <Inbox className="size-6 shrink-0 text-[#8A6A3B]" aria-hidden />
          <span>
            <span className="nums text-heading block text-xl font-medium">{unread}</span>
            <span className="text-body block text-[14px] text-[#6B645B]">
              {unread === 1 ? 'nowe zapytanie' : 'nowych zapytań'}
            </span>
          </span>
        </Link>
      </div>

      <section className="mt-14 border-t border-[#1E1B18]/12 pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-heading font-serif text-2xl">Ostatnio zmieniane</h2>
          <p className="text-body text-[15px] text-[#6B645B]">
            {published} z {offers.length} widocznych na stronie
          </p>
        </div>

        {offers.length === 0 ? (
          <p className="text-body mt-8 text-[16px] text-[#6B645B]">
            Nie ma jeszcze żadnej oferty.{' '}
            <Link href="/panel/oferty/nowa" className="text-[#8A6A3B] underline underline-offset-4">
              Dodaj pierwszą
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-[#1E1B18]/10 border-y border-[#1E1B18]/10">
            {offers.slice(0, 6).map((o) => (
              <li key={o.id}>
                <Link
                  href={`/panel/oferty/${o.id}`}
                  className="flex flex-wrap items-center gap-x-5 gap-y-1 py-4 transition-colors hover:bg-[#1E1B18]/4"
                >
                  <span className="nums text-body w-32 shrink-0 text-[14px] text-[#8C857C]">
                    {o.offerNumber}
                  </span>
                  <span className="text-body min-w-0 flex-1 truncate text-[16px]">{o.title}</span>
                  <StatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {offers.length > 6 ? (
          <Link
            href="/panel/oferty"
            className="text-body mt-6 inline-block text-[15px] text-[#8A6A3B] underline underline-offset-4"
          >
            Zobacz {offersCount(offers.length)}
          </Link>
        ) : null}
      </section>
    </div>
  )
}

