'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CONTACT } from '@/lib/site'

const LINKS = [
  { href: '/oferty', label: 'Oferty' },
  { href: '/zespol', label: 'Zespół' },
  { href: '/wycena', label: 'Wycena' },
  { href: '/o-firmie', label: 'O firmie' },
  { href: '/kontakt', label: 'Kontakt' },
]

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // menu mobilne zamyka sie po przejsciu - bez tego zostaje otwarte
  // na nowej stronie i wyglada jak zawieszone
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-[#1E1B18]/12 bg-[#F6F2EC]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link href="/" className="font-serif text-[19px] leading-none text-[#1E1B18]">
          Czajczyński<span className="text-[#8A6A3B]"> Nieruchomości</span>
        </Link>

        <nav className="hidden gap-7 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`)
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'text-body text-[15px] transition-colors',
                  active ? 'text-[#8A6A3B]' : 'text-[#6B645B] hover:text-[#1E1B18]',
                ].join(' ')}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${CONTACT.phoneRaw}`}
            className="nums text-body hidden text-[15px] font-medium transition-colors hover:text-[#8A6A3B] sm:block"
          >
            {CONTACT.phone}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}
            className="-mr-2 flex size-11 items-center justify-center text-[#1E1B18] md:hidden"
          >
            {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 top-[65px] z-40 bg-[#F6F2EC] md:hidden">
          <nav className="flex flex-col divide-y divide-[#1E1B18]/10 px-6">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-heading py-5 font-serif text-2xl text-[#1E1B18]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="px-6 pt-8">
            <a
              href={`tel:${CONTACT.phoneRaw}`}
              className="nums text-body flex h-13 items-center justify-center bg-[#1E1B18] text-[16px] font-medium text-[#F6F2EC]"
            >
              {CONTACT.phone}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  )
}
