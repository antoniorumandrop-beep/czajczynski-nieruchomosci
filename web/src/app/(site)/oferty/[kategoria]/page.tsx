import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { OffersListing } from '@/components/site/offers-listing'
import { PROPERTY_TYPES, type PropertyType } from '@/lib/types'

const BY_SLUG = Object.fromEntries(
  (Object.keys(PROPERTY_TYPES) as PropertyType[]).map((t) => [PROPERTY_TYPES[t].slug, t]),
) as Record<string, PropertyType>

const LEAD: Record<PropertyType, string> = {
  apartment:
    'Mieszkania na sprzedaż i na wynajem — najwięcej na Krzykach, Starym Mieście i Psim Polu.',
  house: 'Domy jedno- i wielorodzinne we Wrocławiu i okolicach, na sprzedaż i na wynajem.',
  plot: 'Działki budowlane i inwestycyjne na Dolnym Śląsku.',
  commercial:
    'Lokale handlowe, usługowe i biurowe — głównie w parterach budynków wielorodzinnych we Wrocławiu.',
}

export function generateStaticParams() {
  return Object.values(PROPERTY_TYPES).map((t) => ({ kategoria: t.slug }))
}

export async function generateMetadata(
  props: PageProps<'/oferty/[kategoria]'>,
): Promise<Metadata> {
  const { kategoria } = await props.params
  const type = BY_SLUG[kategoria]
  if (!type) return {}
  return {
    title: `${PROPERTY_TYPES[type].many} — Czajczyński Nieruchomości`,
    description: LEAD[type],
  }
}

export default async function CategoryPage(props: PageProps<'/oferty/[kategoria]'>) {
  const { kategoria } = await props.params
  const type = BY_SLUG[kategoria]
  if (!type) notFound()

  return (
    <OffersListing
      params={await props.searchParams}
      lockedType={type}
      title={PROPERTY_TYPES[type].many}
      lead={LEAD[type]}
    />
  )
}
