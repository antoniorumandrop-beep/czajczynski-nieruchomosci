'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteOffer } from '@/app/panel/actions'

export function DeleteOfferButton({
  offerId,
  offerNumber,
}: {
  offerId: string
  offerNumber: string
}) {
  const [confirming, setConfirming] = useState(false)
  const [typed, setTyped] = useState('')
  const [pending, startTransition] = useTransition()

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-body inline-flex h-11 items-center gap-2 px-4 text-[15px] text-[#A33A2A] ring-1 ring-[#A33A2A]/30 transition-colors hover:bg-[#FAEFED]"
      >
        <Trash2 className="size-4" aria-hidden />
        Usuń ofertę
      </button>
    )
  }

  return (
    <div className="border border-[#A33A2A]/30 bg-[#FAEFED] p-5">
      <p className="text-body text-[15px] text-[#1E1B18]">
        Żeby potwierdzić, przepisz numer oferty:{' '}
        <strong className="nums font-semibold">{offerNumber}</strong>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoFocus
          className="text-body nums h-11 flex-1 border border-[#1E1B18]/25 bg-white px-3 text-[15px] outline-none focus:border-[#A33A2A]"
        />
        <button
          type="button"
          disabled={typed.trim() !== offerNumber || pending}
          onClick={() => startTransition(() => void deleteOffer(offerId))}
          className="text-body h-11 bg-[#A33A2A] px-5 text-[15px] font-medium text-white transition-opacity disabled:opacity-40"
        >
          {pending ? 'Usuwanie…' : 'Usuń bezpowrotnie'}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false)
            setTyped('')
          }}
          className="text-body h-11 px-4 text-[15px] text-[#4A443D]"
        >
          Anuluj
        </button>
      </div>
    </div>
  )
}
