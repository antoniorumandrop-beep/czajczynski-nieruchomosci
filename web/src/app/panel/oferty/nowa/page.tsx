import Link from 'next/link'
import { hasSupabase } from '@/lib/supabase/config'
import { NotConfigured } from '@/components/panel/not-configured'
import { OfferForm } from '@/components/panel/offer-form'
import { panelAgents } from '@/lib/panel/data'

export default async function NewOfferPage() {
  if (!hasSupabase()) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <NotConfigured />
      </div>
    )
  }

  const agents = await panelAgents()

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
      <Link href="/panel/oferty" className="text-body text-[14px] text-[#8C857C] hover:text-[#1E1B18]">
        ← Oferty
      </Link>
      <h1 className="text-display mt-4 font-serif text-[clamp(2rem,4vw,3rem)]">Nowa oferta</h1>
      <p className="text-body mt-3 max-w-xl text-[16px] text-[#6B645B]">
        Wypełnij podstawowe dane i zapisz. Zdjęcia dodasz zaraz potem — numer oferty nada się sam.
      </p>

      <div className="mt-10">
        <OfferForm agents={agents} />
      </div>
    </div>
  )
}
