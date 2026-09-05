import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from '@/lib/supabase/config'

/**
 * W Next.js 16 `middleware` nazywa sie `proxy` i chodzi na runtime nodejs.
 *
 * Zadanie: odswiezyc token sesji przy kazdym zadaniu i zapisac go w
 * ciasteczkach, oraz odgrodzic /panel od niezalogowanych.
 */
export async function proxy(request: NextRequest) {
  if (!hasSupabase()) return NextResponse.next()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // getUser, nie getSession - tylko to weryfikuje token u dostawcy,
  // sesja z ciasteczka moze byc podrobiona
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPanel = pathname.startsWith('/panel')
  const isLogin = pathname === '/panel/logowanie'

  if (isPanel && !isLogin && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/panel/logowanie'
    url.searchParams.set('powrot', pathname)
    return NextResponse.redirect(url)
  }

  if (isLogin && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/panel'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // pomijamy pliki statyczne i obrazy - sesji tam nie trzeba odswiezac
    '/((?!_next/static|_next/image|favicon.ico|oferty/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
  ],
}
