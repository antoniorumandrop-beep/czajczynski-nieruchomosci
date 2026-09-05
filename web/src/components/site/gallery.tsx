'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { OfferPhoto } from '@/lib/types'
import { photosCount } from '@/lib/format'

/**
 * Galeria oferty.
 *
 * Przeciaganie jest sledzone 1:1 z palcem, a o tym, czy zdjecie ma przeskoczyc,
 * decyduje predkosc w momencie puszczenia, nie sam dystans - dzieki temu krotki
 * szybki gest dziala tak samo jak powolne przeciagniecie przez pol ekranu.
 */
export function Gallery({ photos, alt }: { photos: OfferPhoto[]; alt: string }) {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [drag, setDrag] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const gesture = useRef<{ x: number; t: number; lastX: number; lastT: number } | null>(null)
  const thumbsRef = useRef<HTMLDivElement>(null)

  const count = photos.length
  const go = useCallback(
    (next: number) => setIndex((i) => Math.min(count - 1, Math.max(0, next ?? i))),
    [count],
  )

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight') go(index + 1)
      if (e.key === 'ArrowLeft') go(index - 1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, index, go])

  // aktywna miniatura sama wjezdza w pole widzenia
  useEffect(() => {
    thumbsRef.current
      ?.querySelector<HTMLElement>(`[data-thumb="${index}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [index])

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === 'mouse') return
    trackRef.current?.setPointerCapture(e.pointerId)
    gesture.current = { x: e.clientX, t: performance.now(), lastX: e.clientX, lastT: performance.now() }
  }

  function onPointerMove(e: React.PointerEvent) {
    const g = gesture.current
    if (!g) return
    g.lastX = e.clientX
    g.lastT = performance.now()
    const dx = e.clientX - g.x
    // opor na krancach zamiast twardego zatrzymania
    const atEdge = (dx > 0 && index === 0) || (dx < 0 && index === count - 1)
    setDrag(atEdge ? dx * 0.3 : dx)
  }

  function onPointerUp() {
    const g = gesture.current
    if (!g) return
    const dt = Math.max(1, g.lastT - g.t)
    const velocity = ((g.lastX - g.x) / dt) * 1000 // px/s
    const width = trackRef.current?.clientWidth ?? 1
    // rzut punktu spoczynku z predkosci - ten sam model co w bezwladnosci scrolla
    const projected = drag + (velocity / 1000) * 0.99 / (1 - 0.99) * 0.06

    if (projected < -width * 0.2) go(index + 1)
    else if (projected > width * 0.2) go(index - 1)

    gesture.current = null
    setDrag(0)
  }

  if (count === 0) {
    return (
      <div className="flex aspect-3/2 items-center justify-center bg-[#E7E0D6]">
        <p className="text-body text-[15px] text-[#8C857C]">Brak zdjęć</p>
      </div>
    )
  }

  const current = photos[index]!

  return (
    <>
      <figure>
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="group relative aspect-3/2 touch-pan-y overflow-hidden bg-[#E7E0D6] select-none"
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `translate3d(${drag}px,0,0)`,
              transition: drag === 0 ? 'transform 380ms cubic-bezier(0.22,1,0.36,1)' : 'none',
            }}
          >
            <Image
              key={current.id}
              src={current.url}
              alt={current.caption ?? alt}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
              draggable={false}
            />
          </div>

          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="absolute top-4 right-4 flex size-11 items-center justify-center bg-[#1E1B18]/55 text-white backdrop-blur-md transition-colors hover:bg-[#1E1B18]/80"
          >
            <Expand className="size-4" aria-hidden />
            <span className="sr-only">Powiększ zdjęcie</span>
          </button>

          {count > 1 ? (
            <>
              <NavButton side="left" disabled={index === 0} onClick={() => go(index - 1)} />
              <NavButton side="right" disabled={index === count - 1} onClick={() => go(index + 1)} />
              <p className="nums text-body absolute bottom-4 left-4 bg-[#1E1B18]/55 px-2.5 py-1 text-[13px] text-white backdrop-blur-md">
                {index + 1} / {count}
              </p>
            </>
          ) : null}
        </div>

        <figcaption className="text-body mt-3 min-h-6 text-[15px] text-[#6B645B]">
          {current.caption ?? <span className="text-[#B4ADA3]">{photosCount(count)}</span>}
        </figcaption>
      </figure>

      {count > 1 ? (
        <div
          ref={thumbsRef}
          className="mt-3 flex gap-2 overflow-x-auto pb-2"
          role="tablist"
          aria-label="Miniatury zdjęć"
        >
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              data-thumb={i}
              role="tab"
              aria-selected={i === index}
              onClick={() => go(i)}
              className={[
                'relative aspect-3/2 w-24 shrink-0 overflow-hidden bg-[#E7E0D6] transition-opacity duration-200',
                i === index ? 'opacity-100 ring-2 ring-[#8A6A3B]' : 'opacity-55 hover:opacity-85',
              ].join(' ')}
            >
              <Image src={p.url} alt="" fill sizes="96px" className="object-cover" />
              <span className="sr-only">Zdjęcie {i + 1}</span>
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div
          className="fixed inset-0 z-100 flex flex-col bg-[#0E0C0A]/97"
          role="dialog"
          aria-modal="true"
          aria-label="Podgląd zdjęcia"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <p className="nums text-body text-[14px] text-white/70">
              {index + 1} / {count}
            </p>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              autoFocus
              className="flex size-11 items-center justify-center text-white/80 transition-colors hover:text-white"
            >
              <X className="size-6" aria-hidden />
              <span className="sr-only">Zamknij</span>
            </button>
          </div>

          <div className="relative flex-1">
            <Image
              src={current.url}
              alt={current.caption ?? alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {count > 1 ? (
              <>
                <NavButton side="left" dark disabled={index === 0} onClick={() => go(index - 1)} />
                <NavButton side="right" dark disabled={index === count - 1} onClick={() => go(index + 1)} />
              </>
            ) : null}
          </div>

          <p className="text-body min-h-14 px-5 py-4 text-center text-[15px] text-white/75">
            {current.caption ?? ''}
          </p>
        </div>
      ) : null}
    </>
  )
}

function NavButton({
  side,
  onClick,
  disabled,
  dark = false,
}: {
  side: 'left' | 'right'
  onClick: () => void
  disabled: boolean
  dark?: boolean
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'absolute top-1/2 flex size-12 -translate-y-1/2 items-center justify-center text-white transition-all duration-200',
        side === 'left' ? 'left-3' : 'right-3',
        disabled ? 'pointer-events-none opacity-0' : 'opacity-100',
        dark ? 'bg-white/10 hover:bg-white/20' : 'bg-[#1E1B18]/55 backdrop-blur-md hover:bg-[#1E1B18]/80',
      ].join(' ')}
    >
      <Icon className="size-5" aria-hidden />
      <span className="sr-only">{side === 'left' ? 'Poprzednie zdjęcie' : 'Następne zdjęcie'}</span>
    </button>
  )
}
