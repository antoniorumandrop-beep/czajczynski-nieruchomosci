import type { Metadata } from 'next'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { InquiryForm } from '@/components/site/inquiry-form'
import { CONTACT } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Kontakt — Czajczyński Nieruchomości',
  description: `${CONTACT.street}, ${CONTACT.postal} ${CONTACT.city}. Telefon ${CONTACT.phone}.`,
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
      <h1 className="text-display font-serif text-[clamp(2rem,5vw,3.5rem)]">Kontakt</h1>

      <div className="mt-12 grid gap-12 border-t border-[#1E1B18]/12 pt-10 lg:grid-cols-2 lg:gap-20">
        <div>
          <address className="space-y-6 not-italic">
            <div className="flex items-start gap-4">
              <MapPin className="mt-1 size-5 shrink-0 text-[#8A6A3B]" aria-hidden />
              <div>
                <p className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">
                  Biuro
                </p>
                <p className="text-body mt-1.5 text-[18px]">
                  {CONTACT.street}
                  <br />
                  {CONTACT.postal} {CONTACT.city}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="mt-1 size-5 shrink-0 text-[#8A6A3B]" aria-hidden />
              <div>
                <p className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">
                  Telefon
                </p>
                <a
                  href={`tel:${CONTACT.phoneRaw}`}
                  className="nums text-body mt-1 -ml-1 inline-block px-1 py-1.5 text-[18px] transition-colors hover:text-[#8A6A3B]"
                >
                  {CONTACT.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="mt-1 size-5 shrink-0 text-[#8A6A3B]" aria-hidden />
              <div>
                <p className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">
                  E-mail
                </p>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-body mt-1 -ml-1 inline-block px-1 py-1.5 text-[18px] transition-colors hover:text-[#8A6A3B]"
                >
                  {CONTACT.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="mt-1 size-5 shrink-0 text-[#8A6A3B]" aria-hidden />
              <div>
                <p className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">
                  Godziny pracy
                </p>
                <p className="text-body mt-1.5 text-[18px]">Poniedziałek – piątek, 9:00 – 17:00</p>
                <p className="text-body mt-1 text-[15px] text-[#6B645B]">
                  Prezentacje nieruchomości również popołudniami i w weekendy, po umówieniu.
                </p>
              </div>
            </div>
          </address>

          <div className="mt-10 aspect-3/2 w-full border border-[#1E1B18]/12 bg-[#E7E0D6]">
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <MapPin className="size-6 text-[#8C857C]" aria-hidden />
              <p className="text-body text-[15px] text-[#6B645B]">
                Mapa dojazdu — do podpięcia przy uruchomieniu strony
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Bia%C5%82osk%C3%B3rnicza+10+Wroc%C5%82aw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body mt-2 inline-block border-b border-[#8A6A3B]/40 py-1.5 text-[15px] font-medium text-[#8A6A3B]"
              >
                Otwórz w Mapach Google
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1E1B18]/12 pt-8 lg:border-t-0 lg:pt-0">
          <InquiryForm heading="Napisz do nas" />
        </div>
      </div>
    </div>
  )
}
