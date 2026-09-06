'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Phone, X } from 'lucide-react'
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
  const [lastPath, setLastPath] = useState(pathname)

  // Menu ma sie zamknac po przejsciu na inna strone - inaczej zostaje otwarte
  // i wyglada jak zawieszone. Porownanie w trakcie renderu, nie efekt: efekt
  // wymusilby dodatkowy render juz po pokazaniu ekranu.
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#1E1B18]/12 bg-[#F6F2EC]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
          <Link
            href="/"
            className="-ml-1 py-2 pr-1 pl-1 font-serif text-[19px] leading-none text-[#1E1B18]"
          >
            Czajczyński<span className="text-[#8A6A3B]"> Nieruchomości</span>
          </Link>

          <nav className="hidden gap-7 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className={[
                  'text-body text-[15px] transition-colors',
                  isActive(l.href) ? 'text-[#8A6A3B]' : 'text-[#6B645B] hover:text-[#1E1B18]',
                ].join(' ')}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${CONTACT.phoneRaw}`}
              className="nums text-body hidden px-2 py-2.5 text-[15px] font-medium transition-colors hover:text-[#8A6A3B] sm:block"
            >
              {CONTACT.phone}
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Otwórz menu"
              className="-mr-2 flex size-11 items-center justify-center text-[#1E1B18] md:hidden"
            >
              <Menu className="size-6" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/*
        Menu MUSI byc rodzenstwem paska, nie jego dzieckiem. Pasek ma
        backdrop-blur, a filtr tla tworzy blok zawierajacy dla potomkow
        z position:fixed - w srodku "inset-0" oznaczalo rozmiar paska, nie
        ekranu, przez co menu niczego nie zaslanialo i tresc strony przez nie
        przechodzila.
      */}
      {open ? (
        <div
          id="menu-mobilne"
          className="fixed inset-0 z-60 flex flex-col bg-[#F6F2EC] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex items-center justify-between border-b border-[#1E1B18]/12 px-6 py-4">
            <span className="font-serif text-[19px] leading-none text-[#1E1B18]">
              Czajczyński<span className="text-[#8A6A3B]"> Nieruchomości</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              autoFocus
              aria-label="Zamknij menu"
              className="-mr-2 flex size-11 items-center justify-center text-[#1E1B18]"
            >
              <X className="size-6" aria-hidden />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6">
            <ul className="divide-y divide-[#1E1B18]/10">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(l.href) ? 'page' : undefined}
                    className={[
                      'text-heading block py-5 font-serif text-2xl transition-colors',
                      isActive(l.href) ? 'text-[#8A6A3B]' : 'text-[#1E1B18]',
                    ].join(' ')}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-[#1E1B18]/12 px-6 py-5">
            <a
              href={`tel:${CONTACT.phoneRaw}`}
              className="nums text-body flex h-13 items-center justify-center gap-2 bg-[#1E1B18] text-[16px] font-medium text-[#F6F2EC]"
            >
              <Phone className="size-4" aria-hidden />
              {CONTACT.phone}
            </a>
            <p className="text-body mt-3 text-center text-[14px] text-[#6B645B]">
              {CONTACT.street}, {CONTACT.city}
            </p>
          </div>
        </div>
      ) : null}
    </>
  )
}
