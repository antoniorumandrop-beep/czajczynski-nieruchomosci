import type { Metadata } from 'next'
import { OffersListing } from '@/components/site/offers-listing'

export const metadata: Metadata = {
  title: 'Oferty — Czajczyński Nieruchomości',
  description:
    'Mieszkania, domy, działki i lokale na sprzedaż i wynajem we Wrocławiu i na Dolnym Śląsku.',
}

export default async function OffersPage(props: PageProps<'/oferty'>) {
  return (
    <OffersListing
      params={await props.searchParams}
      title="Wszystkie oferty"
      lead="Mieszkania, domy, działki i lokale we Wrocławiu i na Dolnym Śląsku. Prawie każdą z tych nieruchomości prowadzimy na wyłączność — to znaczy, że byliśmy w środku i znamy jej historię."
    />
  )
}
