import Link from 'next/link'

const VARIANTS = [
  { slug: 'a', name: 'Kwartał', hint: 'Zdjęcia na pierwszym planie' },
  { slug: 'b', name: 'Kontora', hint: 'Ciepły, ludzie, zaufanie' },
  { slug: 'c', name: 'Brama', hint: 'Mocna marka, ciemny' },
]

export default function VariantsLayout({ children }: LayoutProps<'/warianty'>) {
  return (
    <div className="min-h-full">
      {/* Pasek istnieje tylko na czas wyboru wariantu - nie wejdzie do strony */}
      <nav className="sticky top-0 z-100 border-b border-black/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5">
          <Link
            href="/warianty"
            className="text-micro text-[11px] font-semibold text-neutral-500 uppercase transition-colors hover:text-neutral-900"
          >
            Warianty
          </Link>
          <div className="flex flex-wrap gap-1">
            {VARIANTS.map((v) => (
              <Link
                key={v.slug}
                href={`/warianty/${v.slug}`}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-900 hover:text-white"
              >
                {v.slug.toUpperCase()} · {v.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}
