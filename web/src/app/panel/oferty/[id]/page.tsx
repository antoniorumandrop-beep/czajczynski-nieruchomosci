import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Check, ExternalLink } from 'lucide-react'
import { hasSupabase } from '@/lib/supabase/config'
import { NotConfigured } from '@/components/panel/not-configured'
import { OfferForm } from '@/components/panel/offer-form'
import { PhotoManager } from '@/components/panel/photo-manager'
import { DeleteOfferButton } from '@/components/panel/delete-offer-button'
import { panelAgents, panelOffer } from '@/lib/panel/data'
import { StatusBadge } from '@/components/panel/status-badge'

export default async function EditOfferPage(props: PageProps<'/panel/oferty/[id]'>) {
  if (!hasSupabase()) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <NotConfigured />
      </div>
    )
  }

  const { id } = await props.params
  const { zapisano, utworzono } = await props.searchParams

  const [offer, agents] = await Promise.all([panelOffer(id), panelAgents()])
  if (!offer) notFound()

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
      <Link href="/panel/oferty" className="text-body text-[14px] text-[#8C857C] hover:text-[#1E1B18]">
        ← Oferty
      </Link>

      {utworzono ? (
        <p className="mt-6 flex items-start gap-2 border border-[#3F7A45]/30 bg-[#EFF4EC] px-4 py-3 text-[15px] text-[#2C5731]">
          <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            Oferta zapisana jako {offer.status === 'draft' ? 'szkic' : 'opublikowana'}. Teraz dodaj
            zdjęcia — sekcja jest niżej, pod formularzem.
          </span>
        </p>
      ) : zapisano ? (
        <p className="mt-6 flex items-center gap-2 border border-[#3F7A45]/30 bg-[#EFF4EC] px-4 py-3 text-[15px] text-[#2C5731]">
          <Check className="size-4 shrink-0" aria-hidden />
          Zmiany zapisane. Strona jest już zaktualizowana.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-display font-serif text-[clamp(1.75rem,4vw,2.75rem)]">
          {[offer.city, offer.district].filter(Boolean).join(', ')}
        </h1>
        <StatusBadge status={offer.status} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <p className="nums text-body text-[15px] text-[#8C857C]">{offer.offerNumber}</p>
        <Link
          href={`/oferta/${offer.slug}`}
          target="_blank"
          className="text-body inline-flex items-center gap-1.5 text-[15px] text-[#8A6A3B] underline underline-offset-4"
        >
          <ExternalLink className="size-3.5" aria-hidden />
          Zobacz na stronie
        </Link>
      </div>

      <div className="mt-10">
        <OfferForm offer={offer} agents={agents} />
      </div>

      <div className="border-t border-[#1E1B18]/12 pt-10">
        <PhotoManager offerId={offer.id} offerNumber={offer.offerNumber} photos={offer.photos} />
      </div>

      <div className="mt-16 border-t border-[#1E1B18]/12 pt-8">
        <h2 className="text-heading font-serif text-xl">Usuwanie oferty</h2>
        <p className="text-body mt-2 max-w-xl text-[15px] text-[#6B645B]">
          Usunięcie kasuje ofertę razem ze wszystkimi zdjęciami i nie da się tego cofnąć. Jeśli
          nieruchomość została sprzedana, lepiej ustawić status „Sprzedana" — zniknie ze strony, ale
          zostanie w archiwum.
        </p>
        <div className="mt-5">
          <DeleteOfferButton offerId={offer.id} offerNumber={offer.offerNumber} />
        </div>
      </div>
    </div>
  )
}
