import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { SiteNav } from '@/components/site/nav'
import { CONTACT } from '@/lib/site'

export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-full flex-col bg-[#F6F2EC] font-sans text-[#1E1B18]">
      <SiteNav />
      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#1E1B18]/12 bg-[#F1EBE2]">
        <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="-ml-1 inline-block px-1 py-2 font-serif text-[19px] leading-none">
                Czajczyński<span className="text-[#8A6A3B]"> Nieruchomości</span>
              </Link>
              <address className="text-body mt-5 space-y-2.5 text-[15px] text-[#4A443D] not-italic">
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#8C857C]" aria-hidden />
                  <span>
                    {CONTACT.street}
                    <br />
                    {CONTACT.postal} {CONTACT.city}
                  </span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0 text-[#8C857C]" aria-hidden />
                  <a href={`tel:${CONTACT.phoneRaw}`} className="-my-1 inline-block py-1 hover:text-[#8A6A3B]">
                    {CONTACT.phone}
                  </a>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="size-4 shrink-0 text-[#8C857C]" aria-hidden />
                  <a href={`mailto:${CONTACT.email}`} className="-my-1 inline-block py-1 hover:text-[#8A6A3B]">
                    {CONTACT.email}
                  </a>
                </p>
              </address>
            </div>

            {[
              {
                title: 'Oferty',
                links: [
                  { href: '/oferty', label: 'Wszystkie oferty' },
                  { href: '/oferty/mieszkania', label: 'Mieszkania' },
                  { href: '/oferty/domy', label: 'Domy' },
                  { href: '/oferty/dzialki', label: 'Działki' },
                  { href: '/oferty/lokale', label: 'Lokale' },
                ],
              },
              {
                title: 'Biuro',
                links: [
                  { href: '/o-firmie', label: 'O firmie' },
                  { href: '/zespol', label: 'Zespół' },
                  { href: '/wycena', label: 'Wycena nieruchomości' },
                  { href: '/kontakt', label: 'Kontakt' },
                ],
              },
            ].map((col) => (
              <nav key={col.title}>
                <p className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">
                  {col.title}
                </p>
                <ul className="mt-3 -ml-1">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-body inline-block px-1 py-2 text-[15px] text-[#4A443D] transition-colors hover:text-[#8A6A3B]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div>
              <p className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">
                Godziny pracy
              </p>
              <p className="text-body mt-4 text-[15px] text-[#4A443D]">
                Poniedziałek – piątek
                <br />
                9:00 – 17:00
              </p>
              <p className="text-body mt-4 text-[15px] text-[#8C857C]">
                Spotkania poza godzinami po telefonicznym umówieniu.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[#1E1B18]/12 pt-7">
            <p className="text-body text-[13px] text-[#8C857C]">
              © {new Date().getFullYear()} Czajczyński Nieruchomości
            </p>
            <p className="text-body max-w-xl text-[13px] text-[#8C857C]">
              Informacje na stronie nie stanowią oferty w rozumieniu art. 66 Kodeksu cywilnego.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
