'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const LINKS = [
  { href: '#oferty', label: 'Oferty' },
  { href: '#zespol', label: 'Zespół' },
  { href: '#wycena', label: 'Wycena' },
  { href: '#kontakt', label: 'Kontakt' },
]

/**
 * Pasek jest przezroczysty nad hero i materializuje sie dopiero, gdy tresc
 * pod niego wejdzie. Zamiast twardej kreski 1px uzywamy wygaszenia -
 * krawedz pojawia sie tylko tam, gdzie faktycznie cos zachodzi.
 */
export function NavA() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={[
        'fixed inset-x-0 top-[49px] z-50 bg-[#FAFAF8]/75 backdrop-blur-xl backdrop-saturate-150',
        'transition-shadow duration-300',
        // krawedz pojawia sie dopiero tam, gdzie tresc faktycznie wchodzi pod pasek
        scrolled ? 'shadow-[0_1px_0_rgba(17,18,20,0.09)]' : 'shadow-none',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link
          href="/warianty/a"
          className="text-heading text-[15px] leading-none font-semibold text-[#111214]"
        >
          Czajczyński
          <span
            className="ml-1.5 font-normal text-[#0E3B36]"
          >
            Nieruchomości
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-[14px] font-medium text-[#4A4C50] transition-colors duration-200 hover:bg-[#111214]/6 hover:text-[#111214]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="tel:+48717944983"
          className="rounded-full bg-[#0E3B36] px-4 py-2 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-[#0A2E2A] active:scale-[0.97]"
        >
          71 794 49 83
        </a>
      </div>
    </header>
  )
}
