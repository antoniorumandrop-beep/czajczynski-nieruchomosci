import type { Metadata } from 'next'
import Link from 'next/link'
import { InquiryForm } from '@/components/site/inquiry-form'
import { getAgents } from '@/lib/offers'

export const metadata: Metadata = {
  title: 'Wycena nieruchomości — Czajczyński Nieruchomości',
  description:
    'Operat szacunkowy sporządzony przez rzeczoznawcę majątkowego z uprawnieniami: do kredytu, do sądu, do podziału majątku i do rozliczeń podatkowych.',
}

const CASES = [
  {
    title: 'Do kredytu hipotecznego',
    body: 'Bank wymaga operatu przy udzielaniu kredytu i przy zabezpieczeniu hipotecznym. Operat sporządzamy w formie akceptowanej przez banki.',
  },
  {
    title: 'Do postępowania sądowego',
    body: 'Podział majątku, zniesienie współwłasności, dział spadku, sprawy egzekucyjne. Wycena musi pochodzić od rzeczoznawcy z uprawnieniami państwowymi.',
  },
  {
    title: 'Do rozliczeń z urzędem skarbowym',
    body: 'Darowizna, spadek, sprzedaż przed upływem pięciu lat. Operat dokumentuje wartość nieruchomości na konkretny dzień.',
  },
  {
    title: 'Przed sprzedażą',
    body: 'Zanim ustalimy cenę ofertową, warto wiedzieć, ile nieruchomość jest naprawdę warta. To osobna usługa od pośrednictwa.',
  },
]

export default function ValuationPage() {
  const appraiser = getAgents().find((a) => a.licence) ?? getAgents()[1]

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
      <h1 className="text-display max-w-3xl font-serif text-[clamp(2rem,5vw,3.5rem)] text-balance">
        Wycena nieruchomości
      </h1>
      <p className="text-body mt-5 max-w-2xl text-[18px] text-[#4A443D]">
        Operat szacunkowy to dokument urzędowy, który może sporządzić wyłącznie rzeczoznawca
        majątkowy z uprawnieniami państwowymi. To nie jest to samo co wycena ofertowa robiona przez
        pośrednika.
      </p>

      {appraiser ? (
        <p className="text-body mt-6 max-w-2xl border-l-2 border-[#8A6A3B] pl-5 text-[17px] text-[#4A443D]">
          Operaty w naszym biurze sporządza{' '}
          <Link href={`/zespol/${appraiser.slug}`} className="text-[#8A6A3B] underline underline-offset-4">
            {appraiser.fullName}
          </Link>
          {appraiser.licence ? `, ${appraiser.licence.toLowerCase()}` : ''}.
        </p>
      ) : null}

      <div className="mt-16 grid gap-12 border-t border-[#1E1B18]/12 pt-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div>
          <h2 className="text-heading font-serif text-2xl">Kiedy potrzebny jest operat</h2>
          <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {CASES.map((c) => (
              <div key={c.title}>
                <dt className="text-heading font-serif text-xl">{c.title}</dt>
                <dd className="text-body mt-2 text-[16px] text-[#4A443D]">{c.body}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 border-t border-[#1E1B18]/12 pt-8">
            <h2 className="text-heading font-serif text-2xl">Jak to wygląda w praktyce</h2>
            <ol className="mt-6 space-y-5">
              {[
                'Rozmowa telefoniczna — ustalamy, do czego operat jest potrzebny i jakiej nieruchomości dotyczy.',
                'Oględziny nieruchomości i zebranie dokumentów: księga wieczysta, wypis z rejestru gruntów, rzuty.',
                'Analiza transakcji porównawczych z tego samego rynku lokalnego.',
                'Przekazanie operatu — w formie papierowej z podpisem i pieczęcią, w terminie ustalonym przy zleceniu.',
              ].map((step, i) => (
                <li key={i} className="flex gap-5">
                  <span className="nums text-micro shrink-0 pt-1 text-[11px] font-semibold text-[#8A6A3B]">
                    0{i + 1}
                  </span>
                  <p className="text-body text-[16px] text-[#4A443D]">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="border-t border-[#1E1B18]/12 pt-8 lg:border-t-0 lg:pt-0">
          <InquiryForm heading="Zapytaj o wycenę" compact />
        </div>
      </div>
    </div>
  )
}
