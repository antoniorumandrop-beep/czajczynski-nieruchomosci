import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { hasSupabase } from '@/lib/supabase/config'
import { NotConfigured } from '@/components/panel/not-configured'
import { panelInquiries } from '@/lib/panel/data'
import { InquiryReadToggle } from '@/components/panel/inquiry-read-toggle'

const DATE = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

export default async function InquiriesPage() {
  if (!hasSupabase()) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <NotConfigured />
      </div>
    )
  }

  const inquiries = await panelInquiries()
  const unread = inquiries.filter((i) => !i.isRead).length

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
      <h1 className="text-display font-serif text-[clamp(2rem,4vw,3rem)]">Zapytania</h1>
      <p className="text-body mt-2 text-[16px] text-[#6B645B]">
        {inquiries.length === 0
          ? 'Jeszcze nic nie przyszło.'
          : `${unread} nieprzeczytanych z ${inquiries.length}`}
      </p>

      {inquiries.length === 0 ? (
        <div className="mt-10 border border-[#1E1B18]/15 bg-white p-10 text-center">
          <p className="text-body text-[16px] text-[#6B645B]">
            Tu trafią wiadomości z formularzy na stronie — z formularza kontaktowego i z formularzy
            przy poszczególnych ofertach. Nic nie zginie w skrzynce mailowej.
          </p>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {inquiries.map((q) => (
            <li
              key={q.id}
              className={[
                'border p-5',
                q.isRead
                  ? 'border-[#1E1B18]/12 bg-transparent'
                  : 'border-[#8A6A3B]/40 bg-white',
              ].join(' ')}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
                <p className="text-heading font-serif text-xl">{q.name}</p>
                <p className="text-body text-[14px] text-[#8C857C]">
                  {DATE.format(new Date(q.createdAt))}
                </p>
              </div>

              <p className="text-body mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[16px]">
                {q.contact.includes('@') ? (
                  <a
                    href={`mailto:${q.contact}`}
                    className="inline-flex items-center gap-2 text-[#8A6A3B] underline underline-offset-4"
                  >
                    <Mail className="size-4" aria-hidden />
                    {q.contact}
                  </a>
                ) : (
                  <a
                    href={`tel:${q.contact.replace(/[^\d+]/g, '')}`}
                    className="nums inline-flex items-center gap-2 text-[#8A6A3B] underline underline-offset-4"
                  >
                    <Phone className="size-4" aria-hidden />
                    {q.contact}
                  </a>
                )}

                {q.offerNumber ? (
                  <span className="nums text-[14px] text-[#8C857C]">
                    dotyczy oferty{' '}
                    {q.offerId ? (
                      <Link
                        href={`/panel/oferty/${q.offerId}`}
                        className="underline underline-offset-4"
                      >
                        {q.offerNumber}
                      </Link>
                    ) : (
                      q.offerNumber
                    )}
                  </span>
                ) : null}
              </p>

              <p className="text-body mt-4 text-[16px] whitespace-pre-line text-[#4A443D]">
                {q.message}
              </p>

              <div className="mt-4">
                <InquiryReadToggle id={q.id} isRead={q.isRead} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
