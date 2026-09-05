'use client'

import Image from 'next/image'
import imageCompression from 'browser-image-compression'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, GripVertical, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react'
import { useRef, useState, useTransition } from 'react'
import { addPhoto, deletePhoto, reorderPhotos, updatePhotoCaption } from '@/app/panel/actions'
import { createClient } from '@/lib/supabase/client'
import { PHOTO_BUCKET } from '@/lib/supabase/config'
import { photosCount } from '@/lib/format'
import type { OfferPhoto } from '@/lib/types'

// Telefony robia zdjecia po 8-12 MB. Wgrane bez zmian zapchalyby darmowy
// limit Storage i spowolnily strone, wiec kompresujemy przed wyslaniem.
const COMPRESSION = {
  maxSizeMB: 1.2,
  maxWidthOrHeight: 2000,
  useWebWorker: true,
  fileType: 'image/jpeg' as const,
  initialQuality: 0.82,
}

type Upload = { name: string; progress: 'kompresja' | 'wysyłanie' | 'błąd'; error?: string }

export function PhotoManager({
  offerId,
  offerNumber,
  photos: initial,
}: {
  offerId: string
  offerNumber: string
  photos: OfferPhoto[]
}) {
  const [photos, setPhotos] = useState(initial)
  const [uploads, setUploads] = useState<Upload[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    // 8px zanim chwyt sie aktywuje - inaczej zwykle klikniecie w pole
    // podpisu bywa odczytane jako poczatek przeciagania
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  async function handleFiles(files: FileList | File[]) {
    const list = [...files].filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) return

    const supabase = createClient()

    for (const file of list) {
      setUploads((u) => [...u, { name: file.name, progress: 'kompresja' }])
      try {
        const compressed = await imageCompression(file, COMPRESSION)
        setUploads((u) =>
          u.map((x) => (x.name === file.name ? { ...x, progress: 'wysyłanie' } : x)),
        )

        const path = `${offerNumber}/${crypto.randomUUID()}.jpg`
        const { error: uploadError } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, compressed, { contentType: 'image/jpeg', upsert: false })

        if (uploadError) throw new Error(uploadError.message)

        const dims = await readDimensions(compressed)
        const { error } = await addPhoto(offerId, path, dims.width, dims.height)
        if (error) throw new Error(error)

        setUploads((u) => u.filter((x) => x.name !== file.name))
      } catch (e) {
        setUploads((u) =>
          u.map((x) =>
            x.name === file.name
              ? { ...x, progress: 'błąd', error: e instanceof Error ? e.message : 'nieznany błąd' }
              : x,
          ),
        )
      }
    }
    // Odswiezamy liste tylko wtedy, gdy wszystko przeszlo. Przy bledzie
    // zostajemy na stronie, zeby komunikat nie zniknal razem z przeladowaniem.
    setUploads((current) => {
      if (current.length === 0) startTransition(() => window.location.reload())
      return current
    })
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = photos.findIndex((p) => p.id === active.id)
    const newIndex = photos.findIndex((p) => p.id === over.id)
    const next = arrayMove(photos, oldIndex, newIndex)
    setPhotos(next)
    void reorderPhotos(offerId, next.map((p) => p.id))
  }

  async function remove(photoId: string) {
    setPhotos((p) => p.filter((x) => x.id !== photoId))
    await deletePhoto(photoId, offerId)
  }

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-heading font-serif text-2xl">Zdjęcia</h2>
        <p className="text-body text-[15px] text-[#6B645B]">
          {photos.length > 0 ? photosCount(photos.length) : 'jeszcze żadnego'}
        </p>
      </div>

      <p className="text-body mt-3 text-[15px] text-[#6B645B]">
        Pierwsze zdjęcie jest zdjęciem głównym — widać je na liście ofert i na Facebooku.
        Kolejność zmienia się przeciąganiem.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          void handleFiles(e.dataTransfer.files)
        }}
        className={[
          'mt-6 border-2 border-dashed p-8 text-center transition-colors',
          dragOver ? 'border-[#8A6A3B] bg-[#F1EBE2]' : 'border-[#1E1B18]/20 bg-white',
        ].join(' ')}
      >
        <ImagePlus className="mx-auto size-8 text-[#8C857C]" aria-hidden />
        <p className="text-body mt-3 text-[16px]">Przeciągnij tutaj zdjęcia albo</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-body mt-3 h-12 bg-[#1E1B18] px-6 text-[16px] font-medium text-[#F6F2EC] transition-colors hover:bg-[#8A6A3B]"
        >
          Wybierz pliki z dysku
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <p className="text-body mt-4 text-[14px] text-[#8C857C]">
          Można zaznaczyć wiele naraz. Duże zdjęcia z telefonu zostaną automatycznie zmniejszone.
        </p>
      </div>

      {uploads.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {uploads.map((u) => (
            <li
              key={u.name}
              className="text-body flex items-center gap-3 bg-[#F1EBE2] px-4 py-3 text-[15px]"
            >
              {u.progress === 'błąd' ? (
                <span className="text-[#A33A2A]">✕</span>
              ) : (
                <Loader2 className="size-4 animate-spin text-[#8A6A3B]" aria-hidden />
              )}
              <span className="truncate">{u.name}</span>
              <span className="ml-auto shrink-0 text-[#6B645B]">
                {u.progress === 'błąd' ? u.error : u.progress}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {photos.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo, i) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  offerId={offerId}
                  isCover={i === 0}
                  onRemove={() => void remove(photo.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : null}
    </section>
  )
}

function PhotoCard({
  photo,
  offerId,
  isCover,
  onRemove,
}: {
  photo: OfferPhoto
  offerId: string
  isCover: boolean
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  })
  const [caption, setCaption] = useState(photo.caption ?? '')
  const [saved, setSaved] = useState(false)

  async function saveCaption() {
    if (caption === (photo.caption ?? '')) return
    await updatePhotoCaption(photo.id, offerId, caption)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={[
        'border border-[#1E1B18]/15 bg-white',
        isDragging ? 'z-10 opacity-80 shadow-lg' : '',
      ].join(' ')}
    >
      <div className="relative aspect-3/2 bg-[#E7E0D6]">
        <Image src={photo.url} alt="" fill sizes="320px" className="object-cover" />

        {isCover ? (
          <span className="text-micro absolute top-2 left-2 inline-flex items-center gap-1.5 bg-[#8A6A3B] px-2.5 py-1 text-[10px] font-semibold text-white uppercase">
            <Star className="size-3" aria-hidden />
            Zdjęcie główne
          </span>
        ) : null}

        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Przeciągnij, żeby zmienić kolejność"
          className="absolute top-2 right-2 flex size-11 cursor-grab touch-none items-center justify-center bg-[#1E1B18]/60 text-white backdrop-blur-sm active:cursor-grabbing"
        >
          <GripVertical className="size-5" aria-hidden />
        </button>
      </div>

      <div className="p-3">
        <label className="block">
          <span className="text-micro text-[11px] font-semibold text-[#8C857C] uppercase">
            Opis zdjęcia
          </span>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={() => void saveCaption()}
            placeholder="np. Salon z aneksem kuchennym"
            className="text-body mt-1.5 h-11 w-full border border-[#1E1B18]/20 px-3 text-[15px] outline-none transition-colors focus:border-[#8A6A3B]"
          />
        </label>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-body text-[13px] text-[#3F7A45]">
            {saved ? (
              <span className="inline-flex items-center gap-1">
                <Check className="size-3.5" aria-hidden />
                zapisano
              </span>
            ) : (
              <span className="text-[#8C857C]">zapisuje się samo</span>
            )}
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="text-body inline-flex h-9 items-center gap-1.5 px-2 text-[14px] text-[#A33A2A] transition-colors hover:bg-[#FAEFED]"
          >
            <Trash2 className="size-4" aria-hidden />
            Usuń
          </button>
        </div>
      </div>
    </li>
  )
}

/** Wymiary zapisujemy w bazie, zeby galeria mogla rezerwowac miejsce i nie skakala. */
function readDimensions(file: Blob): Promise<{ width: number | null; height: number | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      resolve({ width: null, height: null })
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}
