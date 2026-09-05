'use client'

import { Check, Copy, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { facebookPostText, facebookShareUrl } from '@/lib/share'
import type { Offer } from '@/lib/types'

/** lucide 1.x nie ma juz ikon markowych - znak Facebooka wstawiamy wlasnym SVG. */
function FacebookMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  )
}

type State = 'idle' | 'copied' | 'error'

export function ShareButtons({ offer, url }: { offer: Offer; url: string }) {
  const [state, setState] = useState<State>('idle')
  const [canNativeShare, setCanNativeShare] = useState(false)

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  useEffect(() => {
    if (state === 'idle') return
    const t = setTimeout(() => setState('idle'), 2600)
    return () => clearTimeout(t)
  }, [state])

  const text = facebookPostText(offer, url)

  async function copy(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  async function shareToFacebook() {
    const ok = await copy()
    setState(ok ? 'copied' : 'error')
    // FB otwieramy dopiero po skopiowaniu, zeby tekst byl juz w schowku,
    // gdy uzytkownik zobaczy okno i wcisnie Cmd+V
    window.open(facebookShareUrl(url), '_blank', 'noopener,noreferrer,width=620,height=680')
  }

  async function shareNative() {
    try {
      await navigator.share({ title: offer.title, text, url })
    } catch {
      /* uzytkownik zamknal arkusz udostepniania - nie jest to blad */
    }
  }

  return (
    <div className="border-t border-[#1E1B18]/12 pt-6">
      <p className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">
        Udostępnij ofertę
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={shareToFacebook}
          className="text-body inline-flex h-11 items-center gap-2 bg-[#1E1B18] px-4 text-[15px] font-medium text-[#F6F2EC] transition-colors hover:bg-[#8A6A3B]"
        >
          <FacebookMark className="size-4" />
          Udostępnij na Facebooku
        </button>

        <button
          type="button"
          onClick={async () => setState((await copy()) ? 'copied' : 'error')}
          className="text-body inline-flex h-11 items-center gap-2 px-4 text-[15px] text-[#1E1B18] ring-1 ring-[#1E1B18]/15 transition-colors hover:bg-[#1E1B18]/5"
        >
          {state === 'copied' ? (
            <Check className="size-4 text-[#3F7A45]" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
          Kopiuj tekst posta
        </button>

        {canNativeShare ? (
          <button
            type="button"
            onClick={shareNative}
            className="text-body inline-flex h-11 items-center gap-2 px-4 text-[15px] text-[#1E1B18] ring-1 ring-[#1E1B18]/15 transition-colors hover:bg-[#1E1B18]/5 sm:hidden"
          >
            <Share2 className="size-4" aria-hidden />
            Wyślij
          </button>
        ) : null}
      </div>

      <p aria-live="polite" className="text-body mt-3 min-h-5 text-[14px]">
        {state === 'copied' ? (
          <span className="text-[#3F7A45]">
            Tekst posta jest w schowku — w oknie Facebooka wklej go skrótem Ctrl+V (Cmd+V na Macu).
          </span>
        ) : state === 'error' ? (
          <span className="text-[#A33A2A]">
            Przeglądarka nie pozwoliła skopiować tekstu. Zaznacz go poniżej i skopiuj ręcznie.
          </span>
        ) : (
          <span className="text-[#8C857C]">
            Tekst posta wygeneruje się sam i trafi do schowka. Zdjęcie i opis Facebook pobierze ze
            strony oferty.
          </span>
        )}
      </p>

      {state === 'error' ? (
        <textarea
          readOnly
          value={text}
          rows={8}
          className="text-body mt-3 w-full border border-[#1E1B18]/20 bg-white p-3 text-[14px]"
        />
      ) : null}
    </div>
  )
}
