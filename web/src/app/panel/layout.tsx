import type { Metadata } from 'next'
import Link from 'next/link'
import { PanelNav } from '@/components/panel/nav'
import { createClient } from '@/lib/supabase/server'
import { hasSupabase } from '@/lib/supabase/config'

export const metadata: Metadata = {
  title: 'Panel — Czajczyński Nieruchomości',
  robots: { index: false, follow: false },
}

// Panel pokazuje dane zalogowanej osoby, wiec nie wolno go prerenderowac
// ani cache'owac. Bez tego build bez kluczy w srodowisku zamrozilby ekran
// "brak konfiguracji" jako strone statyczna.
export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: LayoutProps<'/panel'>) {
  let email: string | null = null
  if (hasSupabase()) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    email = user?.email ?? null
  }

  // strona logowania renderuje sie samodzielnie, bez chromu panelu
  if (!email) return <>{children}</>

  return (
    <div className="flex min-h-full flex-col bg-[#F6F2EC] font-sans text-[#1E1B18]">
      <PanelNav email={email} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[#1E1B18]/12 px-6 py-6 lg:px-8">
        <p className="text-body mx-auto max-w-6xl text-[13px] text-[#8C857C]">
          Zmiany widać na stronie od razu po zapisaniu.{' '}
          <Link href="/" target="_blank" className="underline underline-offset-2">
            Otwórz stronę w nowej karcie
          </Link>
        </p>
      </footer>
    </div>
  )
}
