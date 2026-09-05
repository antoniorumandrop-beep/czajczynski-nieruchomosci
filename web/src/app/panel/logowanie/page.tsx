import type { Metadata } from 'next'
import { LoginForm } from '@/components/panel/login-form'
import { hasSupabase } from '@/lib/supabase/config'
import { NotConfigured } from '@/components/panel/not-configured'

export const metadata: Metadata = {
  title: 'Logowanie — panel',
  robots: { index: false, follow: false },
}

export default async function LoginPage(props: PageProps<'/panel/logowanie'>) {
  const { powrot } = await props.searchParams
  const back = typeof powrot === 'string' ? powrot : '/panel'

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F2EC] px-6 py-12 font-sans">
      <div className="w-full max-w-sm">
        <p className="font-serif text-[19px] text-[#1E1B18]">
          Czajczyński<span className="text-[#8A6A3B]"> Nieruchomości</span>
        </p>
        <h1 className="text-display mt-6 font-serif text-3xl text-[#1E1B18]">Panel ofert</h1>

        {hasSupabase() ? (
          <div className="mt-8">
            <LoginForm back={back} />
          </div>
        ) : (
          <div className="mt-8">
            <NotConfigured />
          </div>
        )}
      </div>
    </div>
  )
}
