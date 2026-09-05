'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/panel/auth-actions'

const LINKS = [
  { href: '/panel', label: 'Start' },
  { href: '/panel/oferty', label: 'Oferty' },
  { href: '/panel/zapytania', label: 'Zapytania' },
]

export function PanelNav({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-[#1E1B18]/12 bg-[#F6F2EC]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4 lg:px-8">
        <Link href="/panel" className="font-serif text-[17px]">
          Panel<span className="text-[#8A6A3B]"> ofert</span>
        </Link>

        <nav className="flex gap-1">
          {LINKS.map((l) => {
            const active = l.href === '/panel' ? pathname === l.href : pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'text-body px-3 py-2 text-[15px] transition-colors',
                  active
                    ? 'bg-[#1E1B18] text-[#F6F2EC]'
                    : 'text-[#4A443D] hover:bg-[#1E1B18]/8',
                ].join(' ')}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <span className="text-body hidden text-[14px] text-[#8C857C] sm:inline">{email}</span>
          <form action={logout}>
            <button
              type="submit"
              className="text-body h-10 px-3 text-[14px] text-[#4A443D] ring-1 ring-[#1E1B18]/15 transition-colors hover:bg-[#1E1B18]/5"
            >
              Wyloguj
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
