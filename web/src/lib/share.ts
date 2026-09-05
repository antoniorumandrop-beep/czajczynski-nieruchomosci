import { formatArea, formatPrice, formatPricePerM2, rooms as roomsLabel } from './format'
import { PROPERTY_TYPES, TRANSACTION_TYPES, pricePerM2, type Offer } from './types'

/**
 * Tekst posta na Facebooka.
 *
 * Meta wycofala parametr `quote` z sharer.php - nie da sie juz wstrzyknac
 * tresci do okna udostepniania. Dlatego tekst ladujemy do schowka, a okno FB
 * otwieramy z samym linkiem; zdjecie, tytul i opis FB zaciaga z tagow
 * Open Graph strony oferty.
 */
export function facebookPostText(offer: Offer, url: string): string {
  const type = PROPERTY_TYPES[offer.propertyType].one
  const suffix = TRANSACTION_TYPES[offer.transactionType].suffix
  const where = [offer.city, offer.district].filter(Boolean).join(', ')

  const facts = [
    formatArea(offer.area),
    offer.rooms ? roomsLabel(offer.rooms) : null,
    offer.transactionType === 'sale' ? formatPricePerM2(pricePerM2(offer)) : null,
  ].filter(Boolean)

  const price =
    offer.transactionType === 'rent'
      ? `${formatPrice(offer.price)} / miesiąc`
      : formatPrice(offer.price)

  const lines = [
    `${type} ${suffix} — ${where}`,
    '',
    price,
    facts.join(' · '),
  ]

  if (offer.isExclusive) lines.push('', 'Oferta na wyłączność')

  const firstParagraph = offer.description
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 60)
  if (firstParagraph) lines.push('', trim(firstParagraph, 220))

  lines.push('', `Szczegóły i zdjęcia: ${url}`, '', `Nr oferty ${offer.offerNumber} · tel. 71 794 49 83`)

  return lines.join('\n')
}

function trim(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max)}…`
}

export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}
