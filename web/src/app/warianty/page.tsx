import Link from 'next/link'
import { getPublicOffers } from '@/lib/offers'

const VARIANTS = [
  {
    slug: 'a',
    name: 'Kwartał',
    line: 'Zdjęcia na pierwszym planie, jasno i cicho',
    body: 'Papierowa biel, jedna zieleń jako akcent, duża typografia bezszeryfowa. Hero dzielony: tekst po lewej, oferta wyróżniona po prawej. Karty z zaokrąglonymi rogami, sekcja zespołu na czerni. Najbliżej tego, jak wyglądają dziś strony premium.',
    good: 'Wygląda drogo i ponadczasowo. Nie zestarzeje się przez kilka lat.',
    risk: 'Bezpieczny. Nie zapada w pamięć tak mocno jak wariant C.',
  },
  {
    slug: 'b',
    name: 'Kontora',
    line: 'Ciepły, szeryfowy, ludzie przed ofertami',
    body: 'Ciepły papier, szeryfowe nagłówki, mosiężny akcent. Otwiera zdanie, nie zdjęcie. Beata i Piotr wysoko na stronie, z opisem kto czym się zajmuje. Ostre krawędzie, cienkie linie, dużo światła. Bliżej dobrej kancelarii niż portalu z ogłoszeniami.',
    good: 'Buduje zaufanie u klienta, który kupuje mieszkanie raz w życiu.',
    risk: 'Mniej efektowny na telefonie przy szybkim przewijaniu.',
  },
  {
    slug: 'c',
    name: 'Brama',
    line: 'Ciemny, mocny, wyraźna marka lokalna',
    body: 'Grafitowa czerń, ceglana czerwień, ciężka typografia wersalikowa. Pełnoekranowe zdjęcie w hero, wielkie liczby, nawigacja po dzielnicach zamiast po typach. Sekcja zespołu na pełnym kolorze.',
    good: 'Zapada w pamięć. Zdecydowanie odróżnia się od konkurencji we Wrocławiu.',
    risk: 'Odważny. Część starszych klientów może odebrać biuro jako mniej stateczne.',
  },
]

export default function VariantsIndex() {
  const offers = getPublicOffers()

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 font-sans text-neutral-900">
      <h1 className="text-display text-[clamp(2rem,5vw,3.25rem)] font-semibold">
        Trzy kierunki wizualne
      </h1>
      <p className="text-body mt-5 max-w-2xl text-[17px] text-neutral-600">
        Każdy wariant to działająca strona główna na prawdziwych danych — {offers.length} ofert i{' '}
        {offers.reduce((n, o) => n + o.photos.length, 0)} zdjęć zassanych z superlokum.pl. Wybierz
        jeden, a dopiero potem powstanie reszta: lista z filtrami, strona oferty, profile i panel.
      </p>

      <ul className="mt-12 space-y-5">
        {VARIANTS.map((v) => (
          <li key={v.slug}>
            <Link
              href={`/warianty/${v.slug}`}
              className="group block rounded-2xl border border-neutral-200 p-7 transition-colors duration-200 hover:border-neutral-900"
            >
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-micro text-[11px] font-semibold text-neutral-400 uppercase">
                  Wariant {v.slug.toUpperCase()}
                </span>
                <h2 className="text-heading text-2xl font-semibold">{v.name}</h2>
                <span className="text-body text-[15px] text-neutral-500">— {v.line}</span>
              </div>
              <p className="text-body mt-4 text-[15px] text-neutral-700">{v.body}</p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-emerald-50 px-4 py-3">
                  <dt className="text-micro text-[10px] font-semibold text-emerald-700 uppercase">
                    Za
                  </dt>
                  <dd className="text-body mt-1 text-[14px] text-emerald-900">{v.good}</dd>
                </div>
                <div className="rounded-xl bg-amber-50 px-4 py-3">
                  <dt className="text-micro text-[10px] font-semibold text-amber-700 uppercase">
                    Ryzyko
                  </dt>
                  <dd className="text-body mt-1 text-[14px] text-amber-900">{v.risk}</dd>
                </div>
              </dl>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
